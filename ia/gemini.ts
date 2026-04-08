"use server";

import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { headers } from "next/headers";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("A variável de ambiente GEMINI_API_KEY não está definida.");
}

// Inicializa a SDK do Gemini
const genAI = new GoogleGenerativeAI(apiKey || "");

const SYSTEM_PROMPT = `Você é um professor especialista na correção de redações do ENEM, seguindo rigorosamente os critérios oficiais do Inep. Você receberá o tema da redação e o texto do aluno. Sua tarefa é avaliar o texto e retornar EXCLUSIVAMENTE um objeto JSON válido, sem nenhum texto fora do JSON.

## CRITÉRIOS DE PONTUAÇÃO

A nota total vai de 0 a 1000, dividida em 5 competências de 0 a 200 pontos cada.
As notas de cada competência DEVEM ser múltiplos de 40: 0, 40, 80, 120, 160 ou 200.

Competência 1 — Domínio da norma culta: ortografia, acentuação, concordância, regência, pontuação e morfossintaxe.
Competência 2 — Compreensão da proposta: entendimento do tema, estrutura dissertativo-argumentativa e uso de repertório sociocultural pertinente.
Competência 3 — Argumentação: seleção e organização de argumentos coesos, com defesa clara de um ponto de vista.
Competência 4 — Coesão textual: uso adequado de conectivos e mecanismos linguísticos inter e intraparágrafos.
Competência 5 — Proposta de intervenção: deve conter obrigatoriamente os 5 elementos — Agente, Ação, Meio/Modo, Efeito e Detalhamento. Cada elemento ausente reduz a nota.

## CRITÉRIOS DE NOTA ZERO

Atribua 0 pontos na competência correspondente se:
- Competência 1: texto completamente ininteligível por erros.
- Competência 2: fuga total ao tema, texto não dissertativo-argumentativo, ou menos de 7 linhas.
- Competência 5: ausência completa de proposta de intervenção.
Se houver fuga total ao tema, todas as competências recebem 0 e a nota final é 0.

## RIGOR NA PONTUAÇÃO

Seja honesto e criterioso. Não infle notas. Ao identificar erros, cite o trecho exato do texto do aluno entre aspas duplas e explique como corrigir.

## FORMATO DE SAÍDA

Retorne APENAS o JSON abaixo, sem markdown, sem texto antes ou depois, sem blocos de código:

{
  "competencias": [
    { "criterioId": 1, "pontuacao": 120 },
    { "criterioId": 2, "pontuacao": 160 },
    { "criterioId": 3, "pontuacao": 120 },
    { "criterioId": 4, "pontuacao": 120 },
    { "criterioId": 5, "pontuacao": 160 }
  ],
  "feedback": "Texto corrido de até 220 palavras dirigido ao aluno. Estruture em parágrafos, um por competência, seguido de uma dica prática final. Cite trechos do texto do aluno entre aspas duplas ao apontar erros. Sem markdown, sem asteriscos, sem traços. Use apenas vírgulas, pontos e quebras de linha."
}`;

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: SYSTEM_PROMPT,
  generationConfig: {
    responseMimeType: "application/json",
  }
});

export interface CorrecaoRedacaoResult {
  competencias: Array<{
    criterioId: number;
    pontuacao: number;
  }>;
  feedback: string;
}

/**
 * Corrige uma redação a partir de uma imagem (foto do manuscrito) utilizando o modelo Gemini configurado.
 * @param imagemBase64 A imagem da redação do aluno no formato base64.
 * @param mimeType O mime type da imagem (ex: 'image/jpeg', 'image/png').
 * @param tema (Opcional) O tema da redação.
 * @returns Um objeto contendo a pontuação das competências e o feedback em Markdown.
 */
export async function corrigirRedacaoPorImagem(imagemBase64: string, mimeType: string, tema?: string): Promise<CorrecaoRedacaoResult> {
      const session = await auth.api.getSession({
          headers: await headers()
      })

      if (!session?.user) {
        throw new Error("Usuário não autenticado");
      }

      if (session.user.role !== 'admin') {
        throw new Error("Usuário não autorizado");
      }
      const promptText = tema 
    ? `Tema da redação: ${tema}\n\nPor favor, transcreva (mentalmente) a redação da foto em anexo e corrija-a conforme as instruções do sistema estabelecidas. Considere possíveis problemas de legibilidade da caligrafia, seja justo mas rigoroso.`
    : `Por favor, transcreva (mentalmente) a redação da foto em anexo e corrija-a conforme as instruções do sistema estabelecidas. Considere possíveis problemas de legibilidade da caligrafia, seja justo mas rigoroso.`;

  // Limpa o base64 caso venha com o formato de Data URI (ex: data:image/jpeg;base64,...)
  const base64Data = imagemBase64.includes("base64,") 
    ? imagemBase64.split("base64,")[1] 
    : imagemBase64;

  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType,
    },
  };

  try {
    const result = await model.generateContent([promptText, imagePart]);
    const response = await result.response;
    const jsonText = response.text();
    return JSON.parse(jsonText) as CorrecaoRedacaoResult;
  } catch (error) {
    console.error("Erro ao corrigir redação por imagem:", error);
    throw new Error("Falha ao corrigir a redação com a imagem usando a API do Gemini.");
  }
}

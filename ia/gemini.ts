"use server";

import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { headers } from "next/headers";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("A variável de ambiente GEMINI_API_KEY não está definida.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

const SYSTEM_PROMPT = `Você é um professor especialista na correção de redações do ENEM, seguindo rigorosamente os critérios oficiais do Inep vigentes em 2025. Você receberá o tema da redação e o texto do aluno. Sua tarefa é avaliar o texto e retornar EXCLUSIVAMENTE um objeto JSON válido, sem nenhum texto fora do JSON.

## CRITÉRIOS DE PONTUAÇÃO

A nota total vai de 0 a 1000, dividida em 5 competências de 0 a 200 pontos cada.
As notas de cada competência DEVEM ser múltiplos de 40: 0, 40, 80, 120, 160 ou 200.

Competência 1 — Demonstrar domínio da modalidade escrita formal da língua portuguesa.
Competência 2 — Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento para desenvolver o tema, dentro dos limites estruturais do texto dissertativo-argumentativo em prosa.
Competência 3 — Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos em defesa de um ponto de vista.
Competência 4 — Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação.
Competência 5 — Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos. A proposta deve conter obrigatoriamente os 5 elementos: Agente, Ação, Meio/Modo, Efeito e Detalhamento. Cada elemento ausente reduz a nota.

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
  },
});

// Erros que justificam retry (temporários)
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithRetry(
  parts: Parameters<typeof model.generateContent>[0]
): Promise<string> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(parts);
      return result.response.text();
    } catch (error: unknown) {
      lastError = error;

      const status =
        error instanceof Error && "status" in error
          ? (error as { status?: number }).status
          : undefined;

      const isRetryable = status !== undefined && RETRYABLE_STATUS_CODES.has(status);

      if (!isRetryable) {
        // Erro não recuperável (ex: 400, 401, 403) — não adianta tentar de novo
        throw error;
      }

      if (attempt < MAX_RETRIES - 1) {
        // Backoff exponencial com jitter: 1s, 2s, 4s (± até 300ms aleatório)
        const delay = BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 300;
        console.warn(
          `[Gemini] Tentativa ${attempt + 1} falhou com status ${status}. Retentando em ${Math.round(delay)}ms...`
        );
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

export interface CorrecaoRedacaoResult {
  competencias: Array<{
    criterioId: number;
    pontuacao: number;
  }>;
  feedback: string;
}

export async function corrigirRedacaoPorImagem(
  imagemBase64: string,
  mimeType: string,
  tema?: string
): Promise<CorrecaoRedacaoResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  if (session.user.role !== "admin") {
    throw new Error("Usuário não autorizado");
  }

  const promptText = tema
    ? `Tema da redação: ${tema}\n\nPor favor, transcreva (mentalmente) a redação da foto em anexo e corrija-a conforme as instruções do sistema estabelecidas. Considere possíveis problemas de legibilidade da caligrafia, seja justo mas rigoroso.`
    : `Por favor, transcreva (mentalmente) a redação da foto em anexo e corrija-a conforme as instruções do sistema estabelecidas. Considere possíveis problemas de legibilidade da caligrafia, seja justo mas rigoroso.`;

  const base64Data = imagemBase64.includes("base64,")
    ? imagemBase64.split("base64,")[1]
    : imagemBase64;

  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };

  try {
    const jsonText = await generateWithRetry([promptText, imagePart]);
    return JSON.parse(jsonText) as CorrecaoRedacaoResult;
  } catch (error) {
    console.error("Erro ao corrigir redação por imagem:", error);
    throw new Error("Falha ao corrigir a redação. Por favor, tente novamente em alguns instantes.");
  }
}
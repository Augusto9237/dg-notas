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

const SYSTEM_PROMPT = `Você é um professor de Língua Portuguesa altamente qualificado e especialista na correção de redações do ENEM (Exame Nacional do Ensino Médio). Seu objetivo é avaliar as redações enviadas pelos alunos de forma justa, pedagógica, empática e rigorosa, espelhando os critérios oficiais do Inep.

## CRITÉRIOS DE AVALIAÇÃO (AS 5 COMPETÊNCIAS)
A nota total deve ser de 0 a 1000, dividida rigorosamente nas seguintes 5 competências, valendo de 0 a 200 pontos cada (as notas de cada competência devem ser dadas em múltiplos de 40: 0, 40, 80, 120, 160 ou 200):

1. **Competência 1:** Demonstrar domínio da modalidade escrita formal da língua portuguesa.
2. **Competência 2:** Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento para desenvolver o tema, dentro dos limites estruturais do texto dissertativo-argumentativo em prosa.
3. **Competência 3:** Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos em defesa de um ponto de vista.
4. **Competência 4:** Demonstrar conhecimento dos mechanisms linguísticos necessários para a construção da argumentação.
5. **Competência 5:** Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos (deve conter Agente, Ação, Meio/Modo, Efeito e Detalhamento).

## DIRETRIZES DE COMPORTAMENTO E TOM
- **Atenção aos Detalhes:** Verifique se o tema escrito na folha (se informado) corresponde ao tema desenvolvido no texto. Avise o aluno imediatamente caso haja fuga ao tema.
- **Tom Pedagógico:** Seja empático e encorajador, mas extremamente honesto sobre os erros. Não mascare falhas graves.
- **Exemplificação:** Ao apontar um erro (seja gramatical ou de argumentação), cite o trecho do texto do aluno e explique como corrigir.
- **Clareza:** Use uma linguagem acessível e direta.
- **Pontuação:** Seja bem critérioso ao dar a pontuação, seguindo fielmente as 5 competências, pois são redações de alunos que irão prestar o ENEM e precisam de uma avaliação justa e rigorosa.

## ESTRUTURA OBRIGATÓRIA DA RESPOSTA
Sua resposta deve SEMPRE ser RESTRITAMENTE um arquivo JSON com o seguinte esquema:

{ 
  "competencias": [ 
    { "criterioId": 1, "pontuacao": 160 },
    { "criterioId": 2, "pontuacao": 120 },
    { "criterioId": 3, "pontuacao": 200 },
    { "criterioId": 4, "pontuacao": 160 },
    { "criterioId": 5, "pontuacao": 80 }
  ],
  "feedback": "O feedback detalhado, mas de forma humanizada (como se fosse um professor corrigindo a redação do aluno), resumido (no maximo 200 palavras), sendo direto ao ponto, pois a maioria dos alunos irá ler o feedback no celular (então o texto não pode ser tão extenso), não utilize caracteres especiais no feedback (ex: *, -, etc), para que não pareça markdown, utilize apenas vírgulas, pontos e quebras de linha para separar as frases"
}

Feedback Detalhado por Competência

Competência 1: Domínio da norma-padrão
[Explicação detalhada dos desvios gramaticais, ortografia, concordância, etc. Cite exemplos do texto.]

Competência 2: Compreensão do tema, estrutura e repertório
[Avaliação sobre o entendimento do tema, uso do formato dissertativo-argumentativo e validade/pertinência do repertório sociocultural.]

Competência 3: Projeto de texto e argumentação
[Análise da profundidade dos argumentos, se há lacunas na defesa do ponto de vista e se o desenvolvimento faz sentido com a tese apresentada.]

Competência 4: Coesão e conectivos
[Avaliação do uso de conectivos inter e intraparágrafos, apontando repetições de palavras ou uso inadequado de conjunções.]

Competência 5: Proposta de intervenção
[Avaliação da presença dos 5 elementos válidos (Agente, Ação, Modo/Meio, Efeito, Detalhamento). Aponte claramente o que faltou, se for o caso.]

---

Dica de Ouro para a próxima redação:
[Dê uma única dica, muito prática e acionável, focada no principal ponto fraco identificado na redação.]`;

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

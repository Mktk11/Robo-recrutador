import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("Missing API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    jobTitle: {
      type: Type.STRING,
      description: "O título da vaga, extraído da descrição. Por exemplo, 'Desenvolvedor Frontend Sênior'."
    },
    compatibilityScore: {
      type: Type.INTEGER,
      description: "Uma pontuação de 0 a 100 representando a compatibilidade entre o currículo e a vaga."
    },
    commonSkills: {
      type: Type.ARRAY,
      description: "Uma lista de habilidades e tecnologias chave encontradas tanto no currículo quanto na descrição da vaga.",
      items: { type: Type.STRING }
    },
    improvementSuggestions: {
      type: Type.ARRAY,
      description: "Uma lista de sugestões acionáveis para melhorar o currículo para esta vaga específica.",
      items: { type: Type.STRING }
    }
  },
  required: ["jobTitle", "compatibilityScore", "commonSkills", "improvementSuggestions"]
};

export const analyzeResumeAndJob = async (jobDescription: string, resume: string): Promise<AnalysisResult> => {
  const prompt = `
    Como um recrutador técnico especialista, analise a descrição da vaga e o currículo fornecidos.
    Sua tarefa é fornecer uma análise estruturada com os seguintes pontos:
    1.  **Título da Vaga:** Extraia o título da vaga da descrição.
    2.  **Pontuação de Compatibilidade:** Uma nota de 0 a 100 que quantifica o quão bem o currículo se alinha com os requisitos da vaga.
    3.  **Habilidades em Comum:** Liste as habilidades, tecnologias e qualificações mais relevantes que estão presentes em ambos os documentos.
    4.  **Sugestões de Melhoria:** Forneça de 3 a 5 sugestões claras e práticas sobre como o candidato pode melhorar o currículo para se destacar para esta vaga específica. Foque em adicionar palavras-chave da vaga, quantificar conquistas ou reestruturar seções.

    **Vaga:**
    ---
    ${jobDescription}
    ---

    **Currículo:**
    ---
    ${resume}
    ---

    Forneça sua análise estritamente no formato JSON solicitado.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2,
      },
    });

    const jsonText = response.text.trim();
    const result: AnalysisResult = JSON.parse(jsonText);
    
    // Basic validation of the parsed result
    if (typeof result.compatibilityScore !== 'number' || !Array.isArray(result.commonSkills) || !Array.isArray(result.improvementSuggestions) || typeof result.jobTitle !== 'string') {
        throw new Error("Formato de resposta da IA inválido.");
    }

    return result;

  } catch (error) {
    console.error("Erro ao chamar a API Gemini:", error);
    throw new Error("Falha ao se comunicar com o serviço de IA.");
  }
};

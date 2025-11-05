
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const enhanceWithAI = async (text: string, context: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API key is not configured.");
  }
  
  const model = 'gemini-2.5-flash';
  
  const prompt = `You are an expert resume writer. Rewrite the following ${context} for a professional resume to be more impactful, concise, and achievement-oriented. Do not add any introductory phrases like "Here is the rewritten version:". Just provide the rewritten text directly.
  
  Original Text:
  ---
  ${text}
  ---
  
  Rewritten Text:
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    
    return response.text.trim();

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate content from AI service.");
  }
};
   
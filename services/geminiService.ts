
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_TEXT_MODEL } from '../constants';
import { GroundingSource } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY for Gemini is not set. AI features will be disabled.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const generateGeminiText = async (
  prompt: string,
  useGoogleSearch: boolean = false
): Promise<{text: string, sources: GroundingSource[] | undefined}> => {
  if (!ai) {
    return { text: "Gemini API key not configured. AI summaries are unavailable.", sources: undefined };
  }

  try {
    const modelConfig = {
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: useGoogleSearch ? { tools: [{googleSearch: {}}] } : {},
    };
    
    const response: GenerateContentResponse = await ai.models.generateContent(modelConfig);
    
    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingSource[] | undefined;

    return { text, sources };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { text: `Error generating content: ${errorMessage}`, sources: undefined };
  }
};

export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};

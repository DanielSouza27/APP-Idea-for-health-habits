
import { GoogleGenAI, Type } from "@google/genai";
import { SearchResult, Exercise } from "../types";

export const performResearch = async (prompt: string): Promise<SearchResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // We use a specific instruction to identify if the user wants to schedule something.
  const fullPrompt = `User Request: "${prompt}"
  
  Task: Research the query using Google Search. 
  Additionally, if the user request implies a task, event, or reminder that should be added to their calendar/agenda, identify it.
  
  Format your response as a JSON-compatible string with the following structure:
  {
    "researchText": "Your full detailed answer with citations if possible",
    "actions": [
      { "title": "Brief title of the task/event", "type": "task" | "event" | "note", "date": "ISO date string if mentioned, otherwise null" }
    ]
  }
  
  If no actions are needed, return an empty array for "actions".
  Ensure the "researchText" is comprehensive.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: fullPrompt,
    config: {
      tools: [{ googleSearch: {} }],
      // We don't use responseMimeType: "application/json" here because googleSearch 
      // sometimes conflicts with strict JSON mode in current preview. 
      // Instead we will parse the text.
    },
  });

  const rawText = response.text || "";
  let researchText = rawText;
  let actions: SearchResult['actions'] = [];

  // Attempt to parse JSON from the response text
  try {
    const jsonStart = rawText.indexOf('{');
    const jsonEnd = rawText.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonStr = rawText.substring(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(jsonStr);
      researchText = parsed.researchText || rawText;
      actions = parsed.actions || [];
    }
  } catch (e) {
    console.warn("Could not parse actions from AI response, falling back to raw text.");
  }

  const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
  const groundingChunks = groundingMetadata?.groundingChunks || [];
  
  const sources = groundingChunks
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => ({
      title: chunk.web.title,
      uri: chunk.web.uri,
    }));

  return { text: researchText, sources, actions };
};

export const generateDailyRecipe = async (date: string, language: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });
  const prompt = language === 'pt' 
    ? `Sugira uma receita de comida saudável única para o dia ${date}. Inclua nome da receita, ingredientes principais e modo de preparo rápido. Seja conciso e use emojis.`
    : `Suggest a unique healthy food recipe for ${date}. Include recipe name, main ingredients, and a quick preparation guide. Be concise and use emojis.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      temperature: 0.7,
      maxOutputTokens: 500,
    }
  });

  return response.text || (language === 'pt' ? "Não foi possível gerar a receita." : "Could not generate recipe.");
};

export const processTrainingImage = async (base64Image: string): Promise<Omit<Exercise, 'id'>[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      },
      {
        text: "Extract the exercises from this image or QR code. Return a JSON array of objects with keys: 'name' (string), 'duration' (integer in minutes), and 'intensity' (one of: 'low', 'medium', 'high'). If duration isn't clear, assume 15. If intensity isn't clear, assume 'medium'. Only return the JSON array.",
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            duration: { type: Type.INTEGER },
            intensity: { type: Type.STRING },
          },
          required: ["name", "duration", "intensity"],
        },
      },
    },
  });

  try {
    const data = JSON.parse(response.text || "[]");
    return data.map((item: any) => ({
      ...item,
      date: new Date().toISOString(),
    }));
  } catch (e) {
    console.error("Failed to parse AI response:", e);
    return [];
  }
};

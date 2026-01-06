
import { GoogleGenAI } from "@google/genai";

export const generateAIPortrait = async (prompt: string): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Enhance prompt for consistent 'Arena' aesthetic
    const enhancedPrompt = `A hyper-realistic, cinematic studio portrait, ${prompt}, 8k resolution, dramatic high-key lighting, shallow depth of field, sharp focus, neutral background, professional photography style.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: enhancedPrompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        },
      },
    });

    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
};

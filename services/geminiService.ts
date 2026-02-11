import { GoogleGenAI } from "@google/genai";
import { MessageRole } from "../types";

const C3_SYSTEM_PROMPT = `
You are an expert Construct 3 Developer. You are working on a Folder Project.
Your environment includes:
- /scripts: Contains .js files for game logic.
- /eventSheets: Contains JSON representations of logic.
- project.c3proj: The main metadata file.

RULES OF ENGAGEMENT:
1. PRIMARY LOGIC: Always prefer writing code in /scripts/main.js or creating new .js files. Do not modify eventSheets unless specifically asked.
2. METADATA PROTECTION: Do not modify project.c3proj unless adding a new asset. If adding assets, you MUST increment 'nextUID' and generate a unique 10-digit 'sid'.
3. NO HALLUCINATIONS: If you need to know an object name or variable, ASK the user to "Paste the Project Bar summary."
4. ASSET CREATION: If generating images, save them to the /images folder as .png.
5. SCRIPTING API: Use the Construct 3 Scripting API v2 (e.g., runtime.objects.Player.getFirstInstance()).
6. OUTPUT: Return only the code that needs to be updated or the new file content.
`;

export const generateC3Response = async (
  prompt: string,
  currentFileContext: string,
  fileName: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Context File: ${fileName}\n\nCurrent Content:\n${currentFileContext}\n\nUser Request: ${prompt}`,
      config: {
        systemInstruction: C3_SYSTEM_PROMPT,
      },
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error communicating with the Construct 3 Expert agent.";
  }
};

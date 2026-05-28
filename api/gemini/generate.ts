import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  // CORS configuration if needed, or simply typical handler
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body;
    
    // Support either Vercel's environment variable or fallback
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      return res.status(400).json({ 
        error: "A chave de API do Gemini ('GEMINI_API_KEY') não foi definida nas variáveis de ambiente do seu projeto no Vercel. Por favor, adicione a variável 'GEMINI_API_KEY' no painel do Vercel (Configurações do Projeto > Environment Variables) com sua chave do Google Gemini AI." 
      });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-vercel',
        }
      }
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: String(prompt || ''),
      config: {
        systemInstruction: "Você é um assistente especialista, teológico e administrativo.",
      }
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ text: response.text });
  } catch (error) {
    console.error("Gemini API serverless error:", error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({ error: String(error) });
  }
}

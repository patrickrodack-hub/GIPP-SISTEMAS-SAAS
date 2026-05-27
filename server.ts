import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import process from "process";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for Gemini
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { prompt } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
        return res.status(400).json({ 
          error: "A chave de API do Gemini ('GEMINI_API_KEY') não foi definida ou está vazia. " +
                 "Por favor, acesse o painel de Configurações (Settings) no canto superior direito do Google AI Studio e adicione a chave 'GEMINI_API_KEY' com sua chave de API válida para habilitar os recursos de Inteligência Artificial." 
        });
      }
      
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Você é um assistente especialista, teológico e administrativo.",
        }
      });
      
      res.json({ text: response.text });
    } catch (error) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: String(error) });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

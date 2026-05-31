import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import process from "process";
import fs from "fs";
import webpush from "web-push";


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

  // --- INICIALIZAÇÃO DE WEB PUSH ---
  let vapidKeys: { publicKey: string; privateKey: string };
  const keysPath = path.join(process.cwd(), 'vapid-keys.json');

  if (fs.existsSync(keysPath)) {
    try {
      vapidKeys = JSON.parse(fs.readFileSync(keysPath, 'utf-8'));
    } catch (err) {
      console.error("Error reading VAPID keys, generating new ones:", err);
      vapidKeys = webpush.generateVAPIDKeys();
      fs.writeFileSync(keysPath, JSON.stringify(vapidKeys), 'utf-8');
    }
  } else {
    vapidKeys = webpush.generateVAPIDKeys();
    fs.writeFileSync(keysPath, JSON.stringify(vapidKeys), 'utf-8');
  }

  webpush.setVapidDetails(
    'mailto:suporte@gippsystem.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );

  // Envia a chave pública para que os clientes consigam gerar assinaturas de push
  app.get("/api/push/public-key", (req, res) => {
    res.json({ publicKey: vapidKeys.publicKey });
  });

  // Dispara notificações push para múltiplos dispositivos cadastrados
  app.post("/api/push/send", async (req, res) => {
    try {
      const { title, body, subscriptions, url } = req.body;
      
      if (!title || !body || !subscriptions || !Array.isArray(subscriptions)) {
        return res.status(400).json({ error: "Parâmetros inválidos. É obrigatório passar 'title', 'body' e a lista 'subscriptions'." });
      }

      console.log(`[Push Notification] Despachando alerta para ${subscriptions.length} assinantes do sistema.`);

      const payload = JSON.stringify({
        title,
        body,
        url: url || '/'
      });

      const promises = subscriptions.map(sub => {
        const targetSub = sub.subscription || sub;
        
        // Validação básica do formato de sub
        if (!targetSub || !targetSub.endpoint || !targetSub.keys) {
          return Promise.resolve({ error: true, message: "Subscription malformada" });
        }

        return webpush.sendNotification(targetSub, payload)
          .catch(err => {
            console.error("Falha ao entregar push para o endpoint:", targetSub.endpoint, err);
            return { error: true, endpoint: targetSub.endpoint };
          });
      });

      const results = await Promise.all(promises);
      const failed = results.filter((res: any) => res && res.error);

      res.json({ 
        success: true, 
        sent: subscriptions.length - failed.length, 
        failedCount: failed.length,
        failedEndpoints: failed.map((f: any) => f.endpoint || "N/A")
      });
    } catch (error) {
      console.error("Web Push Send API error:", error);
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

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import fs from "fs";
import webpush from "web-push";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Load VAPID keys
let vapidPublicKey = "";
let vapidPrivateKey = "";

const vapidPath = path.join(process.cwd(), "vapid-keys.json");
if (fs.existsSync(vapidPath)) {
    try {
        const vapidJSON = JSON.parse(fs.readFileSync(vapidPath, "utf8"));
        vapidPublicKey = vapidJSON.publicKey;
        vapidPrivateKey = vapidJSON.privateKey;
    } catch (e) {
        console.error("Error reading vapid-keys.json:", e);
    }
}

if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(
        'mailto:patrickrodack@gmail.com',
        vapidPublicKey,
        vapidPrivateKey
    );
}

// CORS configuration for APIs
app.use("/api", (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    next();
});

// API Routes
app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

app.get("/api/push/public-key", (req, res) => {
    res.json({ publicKey: vapidPublicKey });
});

app.post("/api/push/send", async (req, res) => {
    try {
        const { title, body, subscriptions, url } = req.body;
        if (!subscriptions || !Array.isArray(subscriptions)) {
            res.status(400).json({ error: "Subscriptions array is required" });
            return;
        }

        let sentCount = 0;
        const payload = JSON.stringify({
            notification: {
                title: title || "Alerta",
                body: body || "",
                icon: "/icon.png",
                data: { url: url || "/" }
            }
        });

        const promises = subscriptions.map(async (sub) => {
            try {
                if (sub && sub.endpoint) {
                    await webpush.sendNotification(sub, payload);
                    sentCount++;
                }
            } catch (err: any) {
                console.error("Error sending push notification to endpoint:", err.message);
            }
        });

        await Promise.all(promises);
        res.json({ status: "success", sent: sentCount });
    } catch (err: any) {
        console.error("Push send route error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/gemini/generate", async (req, res) => {
    try {
        const { prompt } = req.body;
        const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

        if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
            res.status(400).json({
                error: "A chave de API do Gemini ('GEMINI_API_KEY') não foi definida nas variáveis de ambiente. Por favor, adicione-a nas configurações."
            });
            return;
        }

        const ai = new GoogleGenAI({
            apiKey: apiKey,
            httpOptions: {
                headers: {
                    'User-Agent': 'aistudio-build-server',
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

        res.json({ text: response.text });
    } catch (error: any) {
        console.error("Gemini API server route error:", error);
        res.status(500).json({ error: String(error.message || error) });
    }
});

async function start() {
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

start();

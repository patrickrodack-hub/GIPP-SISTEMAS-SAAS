import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import fs from "fs";
import webpush from "web-push";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, collectionGroup, getDocs } from "firebase/firestore";

const app = express();

// Configuração de acesso direto ao banco Firestore para o serviço de segundo plano
const firebaseConfig = {
    apiKey: "AIzaSyBFdfMUErNmooLwIosiacr5gRrlrSefdMk",
    authDomain: "gipp-sistemas.firebaseapp.com",
    projectId: "gipp-sistemas",
    storageBucket: "gipp-sistemas.firebasestorage.app",
    messagingSenderId: "229490807877",
    appId: "1:229490807877:web:9ef442ee1012050fcbbf2c"
};

const firebaseApp = initializeApp(firebaseConfig);
const dbFirestore = getFirestore(firebaseApp);

const PORT = 3000;

app.use(express.json());

// Load or generate VAPID keys
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

// Generate new VAPID keys if none existed
if (!vapidPublicKey || !vapidPrivateKey) {
    try {
        console.log("Generating new VAPID keys for Web Push...");
        const newKeys = webpush.generateVAPIDKeys();
        vapidPublicKey = newKeys.publicKey;
        vapidPrivateKey = newKeys.privateKey;
        fs.writeFileSync(vapidPath, JSON.stringify({
            publicKey: vapidPublicKey,
            privateKey: vapidPrivateKey
        }, null, 4), "utf8");
        console.log("VAPID keys generated and stored successfully.");
    } catch (e) {
        console.error("Failed to generate VAPID keys:", e);
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

// ==================== SERVIÇO DE SEGUNDO PLANO FINANCEIRO ====================

// Função que calcula dias de atraso a partir de uma data YYYY-MM-DD
function getOverdueDays(vencimentoStr: string): number {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const vencimento = new Date(vencimentoStr + "T12:00:00");
        vencimento.setHours(0, 0, 0, 0);

        const diffTime = today.getTime() - vencimento.getTime();
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    } catch (e) {
        return 0;
    }
}

// Serviço de verificação de lançamentos no financeiro vencidos (atraso crítico)
async function checkPendingFinancialTitlesAndNotify() {
    console.log("[Serviço de Segundo Plano] Iniciando verificação diária de títulos pendentes...");
    try {
        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Obter todos os títulos financeiros de todas as instâncias (collectionGroup)
        const finSnapshot = await getDocs(collectionGroup(dbFirestore, 'financeiro'));
        const overdueReceipts: any[] = [];
        let totalOverdueValue = 0;

        finSnapshot.forEach((docSnap) => {
            const item = docSnap.data();
            // Verifica se está pendente, não excluído e com vencimento passado
            if (item && item.status === 'pendente' && !item.deleted) {
                // Títulos podem ter "data_vencimento" ou "data_competencia"
                const vencimento = item.data_vencimento || item.data_competencia;
                if (vencimento && vencimento < todayStr) {
                    const diffDays = getOverdueDays(vencimento);
                    if (diffDays >= 1) { // Pelo menos 1 dia vencido
                        overdueReceipts.push({
                            id: docSnap.id,
                            ...item,
                            vencimento,
                            atrasoDias: diffDays,
                            valor: parseFloat(item.valor) || 0,
                            descricao: item.descricao || 'Sem descrição'
                        });
                        totalOverdueValue += parseFloat(item.valor) || 0;
                    }
                }
            }
        });

        console.log(`[Serviço de Segundo Plano] Verificação concluída. ${overdueReceipts.length} títulos vencidos identificados.`);

        if (overdueReceipts.length === 0) {
            return {
                checkedAt: new Date().toISOString(),
                overdueCount: 0,
                notifiedCount: 0,
                message: "Nenhum título pendente em atraso crítico encontrado."
            };
        }

        // 2. Buscar todas as assinaturas de notificações push (collectionGroup)
        const subsSnapshot = await getDocs(collectionGroup(dbFirestore, 'push_subscriptions'));
        const adminSubscriptions: any[] = [];

        subsSnapshot.forEach((docSnap) => {
            const subData = docSnap.data();
            // Envia para quem não é membro (pastor, tesoureiro, admin) e que tem uma assinatura ativa
            if (subData && !subData.deleted && subData.subscription && subData.userTipo !== 'membro') {
                adminSubscriptions.push(subData);
            }
        });

        console.log(`[Serviço de Segundo Plano] Encontrados ${adminSubscriptions.length} assinantes administradores ativos.`);

        if (adminSubscriptions.length === 0) {
            return {
                checkedAt: new Date().toISOString(),
                overdueCount: overdueReceipts.length,
                notifiedCount: 0,
                message: `Identificados ${overdueReceipts.length} títulos vencidos, porém não há administradores ativos registrados no Push.`
            };
        }

        // 3. Montar a mensagem do alerta (Ordenando os atrasos mais antigos/críticos primeiro)
        overdueReceipts.sort((a, b) => b.atrasoDias - a.atrasoDias);

        const listDetails = overdueReceipts.slice(0, 3).map(item => {
            const [year, month, day] = item.vencimento.split('-');
            const dateFormatted = (year && month && day) ? `${day}/${month}/${year}` : item.vencimento;
            return `• R$ ${item.valor.toFixed(2)}: ${item.descricao} (${item.atrasoDias}d de atraso - Venc.: ${dateFormatted})`;
        }).join('\n');

        const extraCount = overdueReceipts.length > 3 ? `\n... e mais ${overdueReceipts.length - 3} lançamentos em atraso.` : '';
        const bodyContent = `Alerta: há ${overdueReceipts.length} títulos pendentes em atraso crítico. Total: R$ ${totalOverdueValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\nPrincipais vencidos:\n${listDetails}${extraCount}`;

        const payload = JSON.stringify({
            notification: {
                title: "⚠️ Alerta de Atraso Financeiro",
                body: bodyContent,
                icon: "/icon.png",
                data: { url: "/#portal_financeiro" }
            }
        });

        // 4. Disparar notificações push
        let notifiedCount = 0;
        const sendPromises = adminSubscriptions.map(async (admin) => {
            try {
                if (admin.subscription && admin.subscription.endpoint) {
                    await webpush.sendNotification(admin.subscription, payload);
                    notifiedCount++;
                }
            } catch (err: any) {
                console.error(`[Serviço de Segundo Plano] Falha ao enviar notificação para ${admin.userNome || 'Administrador'}:`, err.message);
            }
        });

        await Promise.all(sendPromises);

        return {
            checkedAt: new Date().toISOString(),
            overdueCount: overdueReceipts.length,
            notifiedCount,
            totalValue: totalOverdueValue,
            message: `Serviço de verificação executado com sucesso: ${overdueReceipts.length} títulos e ${notifiedCount} admins notificados.`
        };

    } catch (error: any) {
        console.error("[Serviço de Segundo Plano] Erro na verificação diária:", error);
        return {
            checkedAt: new Date().toISOString(),
            error: error.message || String(error),
            message: "Falha ao processar verificação diária do financeiro."
        };
    }
}

// Rota para administradores forçarem a verificação manualmente para fins de teste/gestão direta
app.post("/api/admin/trigger-financial-check", async (req, res) => {
    try {
        const checkResult = await checkPendingFinancialTitlesAndNotify();
        res.json({ success: true, ...checkResult });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message || String(error) });
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
        
        // Iniciar serviço de segundo plano (verificador financeiro)
        // Executa uma checagem inicial após 5 segundos do boot do servidor
        setTimeout(async () => {
            try {
                await checkPendingFinancialTitlesAndNotify();
            } catch (err) {
                console.error("[Serviço de Segundo Plano] Falha na verificação financeira inicial:", err);
            }
        }, 5000);

        // Agenda a checagem diária para rodar a cada 24 horas (86400000 ms)
        setInterval(async () => {
            try {
                await checkPendingFinancialTitlesAndNotify();
            } catch (err) {
                console.error("[Serviço de Segundo Plano] Falha na verificação financeira diária programada:", err);
            }
        }, 1000 * 60 * 60 * 24);
    });
}

start();

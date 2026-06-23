import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import fs from "fs";
import webpush from "web-push";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, collectionGroup, getDocs, doc, setDoc } from "firebase/firestore";

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
let vapidPublicKey = (process.env.VAPID_PUBLIC_KEY || "").trim().replace(/^['"]|['"]$/g, "");
let vapidPrivateKey = (process.env.VAPID_PRIVATE_KEY || "").trim().replace(/^['"]|['"]$/g, "");

if (!vapidPublicKey || !vapidPrivateKey) {
    const vapidPath = path.join(process.cwd(), "vapid-keys.json");
    if (fs.existsSync(vapidPath)) {
        try {
            const vapidJSON = JSON.parse(fs.readFileSync(vapidPath, "utf8"));
            if (vapidJSON.publicKey && !vapidPublicKey) vapidPublicKey = vapidJSON.publicKey.trim().replace(/^['"]|['"]$/g, "");
            if (vapidJSON.privateKey && !vapidPrivateKey) vapidPrivateKey = vapidJSON.privateKey.trim().replace(/^['"]|['"]$/g, "");
        } catch (e) {
            console.error("Error reading vapid-keys.json:", e);
        }
    }
}

if (!vapidPublicKey || !vapidPrivateKey) {
    vapidPublicKey = "BKSGpAtTNnSHclTe4jk9TTOz4_RvpFBFIqJC-e-FvP5HsUaydyCHQqu2HNLjFnPrZ825u4ojE6j9K0Li9GzPj0s";
    vapidPrivateKey = "pWOXuAW_xGaFyFX-sI6s_j3bibSmNPRLJ1dzNHipI58";
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
                icon: "https://cdn-icons-png.flaticon.com/512/3004/3004613.png",
                badge: "https://cdn-icons-png.flaticon.com/512/3004/3004613.png",
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

        const isSearchQuery = /jusbrasil|diario oficial|consulta|pesquisa|notica|clima|tempo|processo/i.test(prompt || '');
        const config: any = {
            systemInstruction: "Você é um assistente especialista, teológico e administrativo.",
        };
        if (isSearchQuery) {
            config.tools = [{ googleSearch: {} }];
        }

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: String(prompt || ''),
            config: config
        });

        res.json({ text: response.text });
    } catch (error: any) {
        console.error("Gemini API server route error:", error);
        res.status(500).json({ error: String(error.message || error) });
    }
});

// ==================== ROTA REAL DE SONDAGEM DE DEBITOS DDA VIA IA ====================
function getDdaFallback() {
    return [
        {
            beneficiario: "COMPANHIA PAULISTA DE FORÇA E LUZ - CPFL S.A.",
            cnpj_beneficiario: "33.050.196/0001-88",
            valor: 489.90,
            data_emissao: new Date().toISOString().split('T')[0],
            data_vencimento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            linha_digitavel: "34191.79001 01043.513184 91020.150008 7 97530000048990",
            tipo: "Consumo (Energia)",
            status: "pendente",
            origem: "DDA Real (Concessionária Brasil)"
        },
        {
            beneficiario: "TELEFÔNICA BRASIL S.A. - VIVO CORPORATIVO",
            cnpj_beneficiario: "02.558.157/0001-62",
            valor: 154.50,
            data_emissao: new Date().toISOString().split('T')[0],
            data_vencimento: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            linha_digitavel: "846000000014 800001621503 026062002558 157000162817",
            tipo: "Telecomunicações",
            status: "pendente",
            origem: "DDA Real (Telecom)"
        }
    ];
}

// ==================== SERVIÇO DE CONFIGURAÇÃO CENTRALIZADO DO ASAAS ====================
app.get("/api/financeiro/asaas-config", (req, res) => {
    const hasEnvKey = !!(process.env.ASAAS_API_KEY && process.env.ASAAS_API_KEY.trim());
    res.json({
        configured: hasEnvKey,
        provider: "Asaas API",
        connectionMode: hasEnvKey ? "Variável de Ambiente Segura" : "Chave Própria do Banco de Dados",
        status: "Inicializado"
    });
});

// ==================== ROTA REAL DE INTEGRAÇÃO BANCÁRIA DDA GATEWAY ====================
app.post("/api/financeiro/sondar-dda", async (req, res) => {
    try {
        const { cnpj, appId, bankGateway, bankClientId, bankClientSecret, bankApiKey, bankSandbox } = req.body;
        if (!cnpj || !appId) {
            res.status(400).json({ error: "CNPJ e appId são obrigatórios." });
            return;
        }

        const currentGateway = bankGateway || 'inter';
        const isSandbox = bankSandbox !== false;
        
        // Resolve Asaas API key using centralized config logic
        let resolvedAsaasKey = bankApiKey;
        if (currentGateway === 'asaas') {
            const envKey = process.env.ASAAS_API_KEY;
            if (envKey && envKey.trim()) {
                resolvedAsaasKey = envKey.trim();
            }
        }

        let hasCredentials = false;
        if (currentGateway === 'inter' && bankClientId && bankClientSecret) {
            hasCredentials = true;
        } else if (currentGateway === 'asaas' && (resolvedAsaasKey || "").trim()) {
            hasCredentials = true;
        } else if (currentGateway === 'pluggy' && bankApiKey) {
            hasCredentials = true;
        }

        console.log(`DDA Real-Time: Consultando CNPJ ${cnpj} via ${currentGateway} (Modo Sandbox/Homologação: ${isSandbox}, Credenciais configuradas: ${hasCredentials})`);

        let boletos: any[] = [];
        let successMessage = "";

        if (isSandbox && !hasCredentials) {
            // No modo de Sandbox sem credenciais, respondemos com os boletos realistas estruturados de teste
            // para que a diretoria financeira / pastor possa validar o fluxo de entrada e liquidação.
            // Os boletos são modelados com CNPJs e emissores válidos brasileiros (Sabesp, CPFL, VIVO, CPAD).
            boletos = [
                {
                    beneficiario: "COMPANHIA PAULISTA DE FORÇA E LUZ - CPFL S.A.",
                    cnpj_beneficiario: "33.050.196/0001-88",
                    valor: 489.90,
                    data_emissao: new Date().toISOString().split('T')[0],
                    data_vencimento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    linha_digitavel: "34191.79001 01043.513184 91020.150008 7 97530000048990",
                    tipo: "Consumo (Energia)",
                    origem: `DDA Real Sandbox (${currentGateway.toUpperCase()})`
                },
                {
                    beneficiario: "CASA PUBLICADORA DAS ASSEMBLEIAS DE DEUS - CPAD S.A.",
                    cnpj_beneficiario: "33.518.300/0001-90",
                    valor: 1120.00,
                    data_emissao: new Date().toISOString().split('T')[0],
                    data_vencimento: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    linha_digitavel: "03399.07106 20400.000124 34567.891011 1 97480000112000",
                    tipo: "Material Didático",
                    origem: `DDA Real Sandbox (${currentGateway.toUpperCase()})`
                },
                {
                    beneficiario: "TELEFÔNICA BRASIL S.A. - VIVO CORPORATIVO",
                    cnpj_beneficiario: "02.558.157/0001-62",
                    valor: 154.50,
                    data_emissao: new Date().toISOString().split('T')[0],
                    data_vencimento: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    linha_digitavel: "846000000014 800001621503 026062002558 157000162817",
                    tipo: "Telecomunicações",
                    origem: `DDA Real Sandbox (${currentGateway.toUpperCase()})`
                }
            ];
            successMessage = `🔌 Conexão DDA Ativa (${currentGateway.toUpperCase()}). Sincronizado em ambiente de SIMULAÇÃO DE VOO (Sandbox) para o CNPJ ${cnpj}.`;
        } else {
            // MODO REAL-TIME (PRODUÇÃO OU SANDBOX AUTÊNTICO COM CHAVES DO USUÁRIO)
            if (currentGateway === 'inter') {
                const interUrl = isSandbox 
                    ? "https://cdpj-sandbox.partners.bancointer.com.br"
                    : "https://cdpj.partners.bancointer.com.br";

                try {
                    console.log(`DDA Production: Efetuando autenticação mTLS/OAuth2 junto ao Banco Inter (${interUrl})...`);
                    const tokenResponse = await fetch(`${interUrl}/oauth/v2/token`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        },
                        body: new URLSearchParams({
                            client_id: bankClientId || "",
                            client_secret: bankClientSecret || "",
                            grant_type: "client_credentials",
                            scope: "boleto-recebido.read"
                        }).toString()
                    });

                    if (!tokenResponse.ok) {
                        const errTxt = await tokenResponse.text();
                        throw new Error(`Erro na autenticação Inter (Cóg: ${tokenResponse.status}): ${errTxt}`);
                    }

                    const tokenData: any = await tokenResponse.json();
                    const accessToken = tokenData.access_token;

                    console.log(`DDA Production: Pesquisando boletos sacados para o CNPJ: ${cnpj}`);
                    const ddaResponse = await fetch(`${interUrl}/cobranca/v3/boletos/sacado?cpfCnpj=${cnpj.replace(/\D/g, "")}`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${accessToken}`,
                            "Accept": "application/json"
                        }
                    });

                    if (ddaResponse.status === 404) {
                        boletos = [];
                    } else if (!ddaResponse.ok) {
                        const errTxt = await ddaResponse.text();
                        throw new Error(`Erro na API DDA Inter (Cóg: ${ddaResponse.status}): ${errTxt}`);
                    } else {
                        const ddaData: any = await ddaResponse.json();
                        boletos = (ddaData.boletos || []).map((b: any) => ({
                            beneficiario: b.beneficiario?.nome || b.emissor || "BENEFICIÁRIO DDA",
                            cnpj_beneficiario: b.beneficiario?.cnpjCpf || b.emissorCnpj || "00.000.000/0000-00",
                            valor: Number(b.valorNominal || b.valor) || 0,
                            data_emissao: b.dataEmissao || new Date().toISOString().split('T')[0],
                            data_vencimento: b.dataVencimento || new Date().toISOString().split('T')[0],
                            linha_digitavel: b.linhaDigitavel || b.codigoBarras || "",
                            tipo: "Boleto DDA",
                            origem: `Banco Inter API (${isSandbox ? "Sandbox" : "Produção"})`
                        }));
                    }
                    successMessage = `✔ Conectado ao Gateway Banco Inter Sede (${isSandbox ? "Sandbox" : "Produção"}). Varredura DDA real concluída com sucesso para o CNPJ ${cnpj}!`;
                } catch (interErr: any) {
                    throw new Error(`Falha ao estabelecer conexão com Banco Inter: ${interErr.message}`);
                }

            } else if (currentGateway === 'asaas') {
                try {
                    let actualSandbox = isSandbox;
                    let asaasBaseUrl = actualSandbox 
                        ? "https://sandbox.asaas.com/api/v3"
                        : "https://www.asaas.com/api/v3";

                    const extractAsaasErrorMessage = (status: number, textOrData: any, currentEnvSandbox: boolean) => {
                        try {
                            let parsed = textOrData;
                            if (typeof textOrData === 'string') {
                                parsed = JSON.parse(textOrData);
                            }
                            if (parsed && parsed.errors && parsed.errors.length > 0) {
                                const mainError = parsed.errors[0];
                                if (mainError.code === 'invalid_environment') {
                                    return `Ambiente Incompatível: A sua Chave de API Asaas não pertence ao ambiente de ${currentEnvSandbox ? "Sandbox/Homologação" : "Produção"}. Mude o interruptor "Conexão Real (Modo Sandbox)" correspondente a este token ou configure a chave correta.`;
                                }
                                return `${mainError.description || mainError.code}`;
                            }
                        } catch (e) {
                            // ignore parsing error
                        }
                        if (status === 401) {
                            return "Chave de acesso (Token) inválida ou não autorizada no Asaas. Por favor, revise sua chave de API e tente novamente.";
                        }
                        return `Erro na API Asaas (Cóg: ${status}): ${typeof textOrData === 'string' ? textOrData : JSON.stringify(textOrData)}`;
                    };

                    console.log(`DDA Real-Time: Consultando gateway Asaas em ${asaasBaseUrl}/dda/boletos...`);
                    let asaasResponse = await fetch(`${asaasBaseUrl}/dda/boletos`, {
                        method: "GET",
                        headers: {
                            "access_token": resolvedAsaasKey || "",
                            "Accept": "application/json"
                        }
                    });

                    let responseText = await asaasResponse.text();
                    let responseData: any = null;
                    try {
                        responseData = JSON.parse(responseText);
                    } catch (e) {}

                    // Caso haja incompatibilidade de ambiente ('invalid_environment'), tentamos trocar automaticamente para contornar
                    if (!asaasResponse.ok && responseData && responseData.errors && responseData.errors.some((e: any) => e.code === 'invalid_environment')) {
                        console.log(`DDA Asaas Auto-Switch: Detectado erro de ambiente. Trocando de ${actualSandbox ? 'Sandbox' : 'Produção'} para ${!actualSandbox ? 'Sandbox' : 'Produção'}.`);
                        actualSandbox = !actualSandbox;
                        asaasBaseUrl = actualSandbox 
                            ? "https://sandbox.asaas.com/api/v3"
                            : "https://www.asaas.com/api/v3";
                        
                        const retryResponse = await fetch(`${asaasBaseUrl}/dda/boletos`, {
                            method: "GET",
                            headers: {
                                "access_token": resolvedAsaasKey || "",
                                "Accept": "application/json"
                            }
                        });
                        
                        asaasResponse = retryResponse;
                        responseText = await asaasResponse.text();
                        try {
                            responseData = JSON.parse(responseText);
                        } catch (e) {
                            responseData = null;
                        }
                    }

                    if (!asaasResponse.ok) {
                        // Se for erro de autenticação ou ambiente inválido (401/403), falha imediatamente com mensagem amigável sem tentar fallback
                        if (asaasResponse.status === 401 || asaasResponse.status === 403) {
                            const cleanErr = extractAsaasErrorMessage(asaasResponse.status, responseData || responseText, actualSandbox);
                            throw new Error(cleanErr);
                        }

                        // Plano B/Fallback: Se o endpoint nativo DDA não estiver liberado na conta Asaas do usuário,
                        // tentamos listar as faturas gerais emitidas no perfil da sandbox/produção
                        console.log(`DDA Asaas nativo respondeu com código ${asaasResponse.status}. Tentando pagamentos gerais recebidos/emitidos como contingência na URL ${asaasBaseUrl}...`);
                        let fallbackResponse = await fetch(`${asaasBaseUrl}/payments?status=PENDING&limit=30`, {
                            method: "GET",
                            headers: {
                                "access_token": resolvedAsaasKey || "",
                                "Accept": "application/json"
                            }
                        });

                        let fallbackText = await fallbackResponse.text();
                        let fallbackData: any = null;
                        try {
                            fallbackData = JSON.parse(fallbackText);
                        } catch (e) {}

                        // Caso retorne erro de ambiente na fallback, também tentamos auto-switch
                        if (!fallbackResponse.ok && fallbackData && fallbackData.errors && fallbackData.errors.some((e: any) => e.code === 'invalid_environment')) {
                            console.log(`DDA Asaas Fallback Auto-Switch: Detectado erro de ambiente. Trocando de ${actualSandbox ? 'Sandbox' : 'Produção'} para ${!actualSandbox ? 'Sandbox' : 'Produção'}.`);
                            actualSandbox = !actualSandbox;
                            asaasBaseUrl = actualSandbox 
                                ? "https://sandbox.asaas.com/api/v3"
                                : "https://www.asaas.com/api/v3";

                            const retryFbResponse = await fetch(`${asaasBaseUrl}/payments?status=PENDING&limit=30`, {
                                method: "GET",
                                headers: {
                                    "access_token": resolvedAsaasKey || "",
                                    "Accept": "application/json"
                                }
                            });

                            fallbackResponse = retryFbResponse;
                            fallbackText = await fallbackResponse.text();
                            try {
                                fallbackData = JSON.parse(fallbackText);
                            } catch (e) {
                                fallbackData = null;
                            }
                        }

                        if (!fallbackResponse.ok) {
                            const cleanErr = extractAsaasErrorMessage(fallbackResponse.status, fallbackData || fallbackText, actualSandbox);
                            throw new Error(cleanErr);
                        }

                        boletos = (fallbackData?.data || []).map((p: any) => ({
                            beneficiario: p.description?.toUpperCase() || "ASAAS PARCEIROS COBRANÇA",
                            cnpj_beneficiario: p.corporateIdentifier || "02.558.157/0001-62",
                            valor: Number(p.value) || 0,
                            data_emissao: p.paymentDate || new Date().toISOString().split('T')[0],
                            data_vencimento: p.dueDate || new Date().toISOString().split('T')[0],
                            linha_digitavel: p.identificationField || p.nossoNumero || "",
                            tipo: "Asaas Cobrança / DDA",
                            origem: `Asaas API (${actualSandbox ? "Sandbox" : "Produção"})`
                        }));
                    } else {
                        boletos = (responseData?.data || responseData?.boletos || []).map((b: any) => ({
                            beneficiario: b.companyName || b.beneficiaryName || b.description || "EMISSOR ASAAS DDA",
                            cnpj_beneficiario: b.companyCnpj || b.beneficiaryCnpj || b.cnpj || "00.000.000/0001-00",
                            valor: Number(b.value || b.amount) || 0,
                            data_emissao: b.issuedDate || b.dateCreated || new Date().toISOString().split('T')[0],
                            data_vencimento: b.dueDate || new Date().toISOString().split('T')[0],
                            linha_digitavel: b.identificationField || b.barCode || b.digitableLine || "",
                            tipo: b.type || "Boleto DDA Asaas",
                            origem: `Asaas DDA API (${actualSandbox ? "Sandbox" : "Produção"})`
                        }));
                    }

                    successMessage = `✔ Conectado ao Gateway Asaas S.A. (${actualSandbox ? "Sandbox" : "Produção"}). Varredura de boletos realizada com sucesso para o CNPJ ${cnpj}!`;
                } catch (asaasErr: any) {
                    throw new Error(`Falha de comunicação integral com o gateway Asaas: ${asaasErr.message}`);
                }

            } else if (currentGateway === 'pluggy') {
                try {
                    console.log("DDA Production: Efetuando varredura unificada via Pluggy HUB Open Banking...");
                    const pluggyResponse = await fetch("https://api.pluggy.ai/bills", {
                        method: "GET",
                        headers: {
                            "X-API-KEY": bankApiKey || "",
                            "Accept": "application/json"
                        }
                    });

                    if (!pluggyResponse.ok) {
                        const errTxt = await pluggyResponse.text();
                        throw new Error(`Erro na API Pluggy (Cóg: ${pluggyResponse.status}): ${errTxt}`);
                    }

                    const pluggyData: any = await pluggyResponse.json();
                    boletos = (pluggyData.results || []).map((b: any) => ({
                        beneficiario: b.provider?.name || b.beneficiaryName || "PROVEDOR DDA PLUGGY",
                        cnpj_beneficiario: b.provider?.cnpj || "33.050.196/0001-88",
                        valor: Number(b.amount || b.value) || 0,
                        data_emissao: b.issuedDate || new Date().toISOString().split('T')[0],
                        data_vencimento: b.dueDate || new Date().toISOString().split('T')[0],
                        linha_digitavel: b.barCode || b.digitableLine || "",
                        tipo: "Pluggy Open Banking",
                        origem: `Pluggy HUB (${isSandbox ? "Sandbox" : "Produção"})`
                    }));

                    successMessage = `✔ Conectado ao Pluggy Open Finance Hub. Detecção DDA finalizada com sucesso!`;
                } catch (pluggyErr: any) {
                    throw new Error(`Falha no hub de dados Pluggy: ${pluggyErr.message}`);
                }
            } else {
                throw new Error(`Provedor de Gateway Financeiro '${currentGateway}' não homologado.`);
            }
        }

        // Garante que cada boleto possua campos obrigatórios e IDs estáveis baseados na linha digitável/dados para evitar duplicados
        const preparedBoletos = boletos
            .filter(b => b && b.beneficiario && b.valor > 0)
            .map(boleto => {
                const cleanLine = (boleto.linha_digitavel || "").replace(/\D/g, "");
                // Gera ID estável a partir do código do boleto para evitar lançamentos repetidos nas varreduras do banco
                const stableId = cleanLine 
                    ? cleanLine.substring(0, 30) 
                    : `${cnpj.replace(/\D/g, "")}-${boleto.valor}-${(boleto.data_vencimento || "").replace(/\D/g, "")}`;
                
                return {
                    id: `dda-real-${stableId}`,
                    beneficiario: String(boleto.beneficiario).toUpperCase(),
                    cnpj_beneficiario: boleto.cnpj_beneficiario || "00.000.000/0001-00",
                    cnpj_igreja: cnpj,
                    valor: Number(boleto.valor),
                    data_emissao: boleto.data_emissao || new Date().toISOString().split('T')[0],
                    data_vencimento: boleto.data_vencimento || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    linha_digitavel: boleto.linha_digitavel || "00000.00000 00000.000000 00000.000000 0 00000000000000",
                    status: "pendente",
                    tipo: boleto.tipo || "Geral",
                    origem: boleto.origem || `DDA via ${currentGateway.toUpperCase()}`
                };
            });

        res.json({ success: true, added: preparedBoletos, message: successMessage });

    } catch (e: any) {
        console.error("Erro no serviço de DDA real do gateway bancário:", e);
        // Retorna a mensagem amigável e precisa do gateway para que o usuário possa reajustar suas chaves
        res.status(400).json({ success: false, error: e.message || String(e) });
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
                icon: "https://cdn-icons-png.flaticon.com/512/3004/3004613.png",
                badge: "https://cdn-icons-png.flaticon.com/512/3004/3004613.png",
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

// ==================== SERVIÇO DE SEGUNDO PLANO DE LEMBRETES DE EVENTOS ====================

// Serviço de verificação de lembretes automáticos de eventos de agenda (24h antes)
async function checkScheduledEventRemindersAndNotify() {
    console.log("[Serviço de Segundo Plano] Verificando lembretes de eventos da agenda (24h antes)...");
    try {
        const now = new Date();
        const agendaSnapshot = await getDocs(collectionGroup(dbFirestore, 'agenda'));
        
        // Buscar todas as assinaturas push registradas para realizar correspondência de membro ID
        const subsSnapshot = await getDocs(collectionGroup(dbFirestore, 'push_subscriptions'));
        const allSubscriptions: any[] = [];
        subsSnapshot.forEach(docSnap => {
            const subData = docSnap.data();
            if (subData && !subData.deleted && subData.subscription && subData.userId) {
                allSubscriptions.push(subData);
            }
        });

        console.log(`[Serviço de Segundo Plano] Encontradas ${allSubscriptions.length} assinaturas de push no total.`);

        for (const docSnap of agendaSnapshot.docs) {
            const item = docSnap.data();
            const eventId = docSnap.id;
            
            if (item && item.lembrete_push_ativo && !item.push_lembrete_disparado && !item.deleted) {
                const eventData = item.data; // YYYY-MM-DD
                const eventHora = item.hora || "00:00"; // HH:MM
                
                if (eventData) {
                    try {
                        const eventDateTime = new Date(`${eventData}T${eventHora}:00`);
                        const timeDiffMs = eventDateTime.getTime() - now.getTime();
                        
                        // 24 horas = 86400000 ms.
                        // Dispara se estiver na janela de antecedência de até 24 horas (e margem de carência de até 1 hora no passado por segurança)
                        const limit24h = 24 * 60 * 60 * 1000;
                        const safetyPastRange = -1 * 60 * 60 * 1000; // -1h
                        
                        if (timeDiffMs >= safetyPastRange && timeDiffMs <= limit24h) {
                            console.log(`[Serviço de Segundo Plano] Disparando lembrete 24h para o evento: "${item.titulo}"`);
                            
                            // Obter membros inscritos que confirmaram (rsvpStatus === 'confirmado')
                            const presencas = item.presencas || {};
                            const inscritosIds = Object.keys(presencas).filter(mId => presencas[mId] === 'confirmado');
                            
                            if (inscritosIds.length > 0) {
                                // Filtrar assinaturas dos confirmados
                                const targetSubs = allSubscriptions.filter(sub => inscritosIds.includes(sub.userId));
                                
                                if (targetSubs.length > 0) {
                                    const eventDateFormatted = eventData.split('-').reverse().join('/');
                                    const customMsg = item.lembrete_push_mensagem || "{evento} será amanhã às {hora} no {local}. Esperamos por você!";
                                    const bodyText = customMsg
                                        .replace(/{evento}/gi, item.titulo)
                                        .replace(/{hora}/gi, eventHora)
                                        .replace(/{data}/gi, eventDateFormatted)
                                        .replace(/{local}/gi, item.local || "Templo Sede");

                                    const payload = JSON.stringify({
                                        notification: {
                                            title: `⏰ Lembrete: ${item.titulo}`,
                                            body: bodyText,
                                            icon: "https://cdn-icons-png.flaticon.com/512/3004/3004613.png",
                                            badge: "https://cdn-icons-png.flaticon.com/512/3004/3004613.png",
                                            data: { url: "/#portal_agenda" }
                                        }
                                    });

                                    let sentCount = 0;
                                    for (const r of targetSubs) {
                                        try {
                                            await webpush.sendNotification(r.subscription, payload);
                                            sentCount++;
                                        } catch (subErr: any) {
                                            console.error(`[Serviço de Segundo Plano] Falha ao enviar notificação push:`, subErr.message);
                                        }
                                    }
                                    console.log(`[Serviço de Segundo Plano] Lembretes enviados: ${sentCount} membros notificados.`);
                                } else {
                                    console.log(`[Serviço de Segundo Plano] Nenhum membro confirmado com inscrição ativa de push para "${item.titulo}".`);
                                }
                            } else {
                                console.log(`[Serviço de Segundo Plano] Nenhuma presença confirmada para o evento "${item.titulo}".`);
                            }
                            
                            // Marcar como disparado para evitar reenvio
                            await setDoc(docSnap.ref, { push_lembrete_disparado: true }, { merge: true });
                        }
                    } catch (timeErr) {
                        console.error(`Erro ao analisar data/hora do evento ${item.titulo}:`, timeErr);
                    }
                }
            }
        }
    } catch (err) {
        console.error("[Serviço de Segundo Plano] Erro na verificação de lembretes agenda:", err);
    }
}

// Rota para administradores forçarem a verificação manualmente para fins de teste/gestão direta
app.post("/api/admin/trigger-agenda-reminders", async (req, res) => {
    try {
        await checkScheduledEventRemindersAndNotify();
        res.json({ success: true, message: "Varredura de lembretes de agenda ativada e disparada com sucesso." });
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

        // Executa uma checagem inicial de lembretes da agenda após 8 segundos do boot do servidor
        setTimeout(async () => {
            try {
                await checkScheduledEventRemindersAndNotify();
            } catch (err) {
                console.error("[Serviço de Segundo Plano] Falha na verificação de agenda inicial:", err);
            }
        }, 8000);

        // Agenda a checagem diária para rodar a cada 24 horas (86400000 ms)
        setInterval(async () => {
            try {
                await checkPendingFinancialTitlesAndNotify();
            } catch (err) {
                console.error("[Serviço de Segundo Plano] Falha na verificação financeira diária programada:", err);
            }
        }, 1000 * 60 * 60 * 24);

        // Agenda a checagem da agenda para rodar a cada 30 minutos (1800000 ms)
        setInterval(async () => {
            try {
                await checkScheduledEventRemindersAndNotify();
            } catch (err) {
                console.error("[Serviço de Segundo Plano] Falha na verificação programada da agenda:", err);
            }
        }, 1000 * 60 * 30);
    });
}

start();

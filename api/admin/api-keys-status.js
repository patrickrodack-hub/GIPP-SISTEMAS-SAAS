export default async function handler(req, res) {
    // CORS configuration
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const keys = [];
    
    // Check Gemini API
    const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (geminiKey && geminiKey.trim() !== "" && geminiKey !== "MY_GEMINI_API_KEY") {
        keys.push({
            name: "Gemini AI",
            enabled: true,
            services: [
                "Assistente Pastoral IA",
                "Geração de Esboços e Sermões",
                "Planejamento de Células",
                "Análise de Extrato Financeiro por IA",
                "Aconselhamento e Mentoria IA",
                "Roteiro de Culto Doméstico",
                "Geração de Dinâmicas EBD"
            ]
        });
    } else {
        keys.push({
            name: "Gemini AI",
            enabled: false,
            services: [
                "Assistente Pastoral IA",
                "Geração de Esboços e Sermões",
                "Planejamento de Células",
                "Análise de Extrato Financeiro por IA",
                "Aconselhamento e Mentoria IA",
                "Roteiro de Culto Doméstico",
                "Geração de Dinâmicas EBD"
            ]
        });
    }

    // Check Asaas API
    const asaasKey = process.env.ASAAS_API_KEY;
    if (asaasKey && asaasKey.trim() !== "") {
        keys.push({
            name: "Asaas Cobrança",
            enabled: true,
            services: [
                "Integração de Boletos DDA (Real-time)",
                "Conciliação Financeira Automática",
                "Emissão e Cobrança de Faturas"
            ]
        });
    } else {
        keys.push({
            name: "Asaas Cobrança",
            enabled: false,
            services: [
                "Integração de Boletos DDA (Real-time)",
                "Conciliação Financeira Automática",
                "Emissão e Cobrança de Faturas"
            ]
        });
    }

    // Check Push/Vapid Keys
    const pushKey = process.env.VAPID_PUBLIC_KEY;
    if (pushKey && pushKey.trim() !== "") {
         keys.push({
            name: "Notificações Push (VAPID)",
            enabled: true,
            services: [
                "Avisos Financeiros (Vencimentos em Atraso)",
                "Lembretes de Eventos na Agenda",
                "Comunicados Gerais da Igreja",
                "Avisos de Escala de Voluntários"
            ]
        });
    } else {
         keys.push({
            name: "Notificações Push (VAPID)",
            enabled: true, // we have a fallback in the code
            services: [
                "Avisos Financeiros (Vencimentos em Atraso)",
                "Lembretes de Eventos na Agenda",
                "Comunicados Gerais da Igreja",
                "Avisos de Escala de Voluntários"
            ]
        });
    }

    return res.status(200).json({ success: true, keys });
}

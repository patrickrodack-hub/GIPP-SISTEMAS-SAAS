const fs = require('fs');
let data = fs.readFileSync('server.ts', 'utf8');

const ebdRoute = `
app.post("/api/gemini/analisar-ebd", async (req, res) => {
    try {
        const { fileData, mimeType, prompt, isValidation } = req.body;
        const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

        if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
            res.status(400).json({
                error: "A chave de API do Gemini ('GEMINI_API_KEY') não foi definida. Por favor, adicione-a nas configurações."
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

        const contents = [];
        
        if (fileData && mimeType) {
            const base64Data = fileData.includes(",") ? fileData.split(",")[1] : fileData;
            contents.push({
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            });
        }
        
        if (prompt) {
            contents.push({ text: prompt });
        }

        const response = await ai.models.generateContent({
            model: "gemini-3.5-pro",
            contents: contents,
            config: {
                systemInstruction: "Você é um assistente teológico e pedagógico especialista. Seu objetivo é analisar materiais da Escola Bíblica Dominical (EBD) ou validar conteúdos à luz da Declaração de Fé da CPAD. Retorne SOMENTE JSON, sem formatações de markdown adicionais.",
                responseMimeType: "application/json"
            }
        });

        res.json({ text: response.text });
    } catch (error) {
        console.error("Gemini EBD route error:", error);
        res.status(500).json({ error: String(error.message || error) });
    }
});
`;

if (!data.includes('/api/gemini/analisar-ebd')) {
    data = data.replace('app.post("/api/financeiro/analisar-extrato"', ebdRoute + '\napp.post("/api/financeiro/analisar-extrato"');
    fs.writeFileSync('server.ts', data, 'utf8');
    console.log("Patched server.ts successfully");
} else {
    console.log("Already patched");
}

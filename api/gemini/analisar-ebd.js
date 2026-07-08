import { GoogleGenAI } from "@google/genai";
import { PDFDocument } from "pdf-lib";

async function slicePdfIfTooLarge(base64Data) {
    try {
        const cleanBase64 = base64Data.replace(/^data:application\/pdf;base64,/, '').replace(/[^A-Za-z0-9+/=]/g, "");
        const pdfBuffer = Buffer.from(cleanBase64, 'base64');
        const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
        const pageCount = pdfDoc.getPageCount();
        
        // Let's set a conservative page limit for serverless environment to prevent timeout
        const MAX_PAGES = 12;
        if (pageCount > MAX_PAGES) {
            console.log(`[Vercel EBD Slicer] PDF has ${pageCount} pages, slicing to first ${MAX_PAGES} pages.`);
            const slicedDoc = await PDFDocument.create();
            const pagesToCopy = Array.from({ length: MAX_PAGES }, (_, i) => i);
            const copiedPages = await slicedDoc.copyPages(pdfDoc, pagesToCopy);
            copiedPages.forEach(page => slicedDoc.addPage(page));
            const pdfBytes = await slicedDoc.save();
            const newBase64 = Buffer.from(pdfBytes).toString('base64');
            return {
                data: newBase64,
                originalPages: pageCount,
                slicedPages: MAX_PAGES,
                wasSliced: true
            };
        }
        return {
            data: base64Data,
            originalPages: pageCount,
            slicedPages: pageCount,
            wasSliced: false
        };
    } catch (e) {
        console.error("[Vercel EBD Slicer] Error reading or slicing PDF:", e);
        return {
            data: base64Data,
            originalPages: 0,
            slicedPages: 0,
            wasSliced: false
        };
    }
}

export default async function handler(req, res) {
    // CORS configuration
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { fileData, mimeType, prompt } = req.body;
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

        const contents = [];
        let modifiedPrompt = prompt || '';
        let fileDataToUse = fileData;
        let wasSliced = false;
        let originalPages = 0;
        let slicedPages = 0;

        if (fileData && mimeType) {
            let base64Data = fileData.includes(",") ? fileData.split(",")[1] : fileData;
            
            if (mimeType === "application/pdf") {
                const sliceResult = await slicePdfIfTooLarge(base64Data);
                if (sliceResult.wasSliced) {
                    base64Data = sliceResult.data;
                    wasSliced = true;
                    originalPages = sliceResult.originalPages;
                    slicedPages = sliceResult.slicedPages;
                }
            }

            contents.push({
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            });
        }
        
        if (wasSliced) {
            modifiedPrompt = `${modifiedPrompt}\n\n[Atenção: O arquivo PDF original continha ${originalPages} páginas, o que excede o limite. O sistema reduziu automaticamente para as primeiras ${slicedPages} páginas para possibilitar a extração com IA. Por favor, extraia as lições presentes nestas primeiras ${slicedPages} páginas.]`;
        }

        if (modifiedPrompt) {
            contents.push({ text: modifiedPrompt });
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                systemInstruction: "Você é um assistente teológico e pedagógico especialista. Seu objetivo é analisar materiais da Escola Bíblica Dominical (EBD) ou validar conteúdos à luz da Declaração de Fé da CPAD. Retorne SOMENTE JSON, sem formatações de markdown adicionais.",
                responseMimeType: "application/json"
            }
        });

        return res.status(200).json({ text: response.text });
    } catch (error) {
        console.error("Gemini EBD serverless route error:", error);
        return res.status(500).json({ error: String(error.message || error) });
    }
}

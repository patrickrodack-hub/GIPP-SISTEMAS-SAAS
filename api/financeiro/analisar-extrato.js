import { GoogleGenAI, Type } from "@google/genai";

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
        const { fileData, mimeType } = req.body;
        const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

        if (!fileData || !mimeType) {
            return res.status(400).json({ error: "Parâmetros 'fileData' (base64) e 'mimeType' são obrigatórios." });
        }

        if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
            return res.status(400).json({
                error: "A chave de API do Gemini ('GEMINI_API_KEY') não foi definida nas variáveis de ambiente do seu projeto no Vercel. Por favor, adicione a variável 'GEMINI_API_KEY' no painel do Vercel."
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

        const base64Data = fileData.includes(",") ? fileData.split(",")[1] : fileData;

        const filePart = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType
            }
        };

        const textPart = {
            text: "Analise com precisão absoluta o extrato bancário fornecido (em formato PDF ou Imagem). " +
                  "Sua tarefa é extrair todas as transações financeiras reais (créditos e débitos) do período de fechamento. " +
                  "Descarte qualquer linha que corresponda a saldos anteriores, limites de crédito, somatórios, taxas simuladas ou metadados de cabeçalhos. " +
                  "Para cada lançamento, retorne:\n" +
                  "- data: Data exata da transação no formato AAAA-MM-DD (ex: 2026-06-25)\n" +
                  "- descricao: Descrição oficial/histórico do lançamento no extrato (ex: PIX RECEBIDO - PAULO S., TAR DOC ELETRONICO)\n" +
                  "- tipo: 'entrada' (para créditos/depósitos/recebimentos) ou 'saida' (para débitos/pagamentos/tarifas)\n" +
                  "- valor: Valor numérico positivo absoluto (ex: 150.00)\n" +
                  "- documento: Número do documento, autenticação ou NSU se disponível (opcional, pode ser vazio)\n" +
                  "- categoria: Categoria estimada compatível com o financeiro da igreja (ex: 'Dízimo', 'Oferta', 'Água/Luz', 'Aluguel', 'Taxa Bancária', 'Ministério', 'Outros')\n" +
                  "- forma_pagamento: Forma de pagamento estimada (ex: 'PIX', 'Transferência', 'Boleto', 'Dinheiro', 'Cartão' ou 'Outro')"
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [filePart, textPart],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            data: { type: Type.STRING, description: "Data no formato YYYY-MM-DD" },
                            descricao: { type: Type.STRING, description: "Histórico completo ou descrição" },
                            tipo: { type: Type.STRING, description: "Tipo: 'entrada' ou 'saida'" },
                            valor: { type: Type.NUMBER, description: "Valor absoluto (positivo)" },
                            documento: { type: Type.STRING, description: "ID de documento ou transação se houver" },
                            categoria: { type: Type.STRING, description: "Categoria estimada" },
                            forma_pagamento: { type: Type.STRING, description: "Forma de pagamento estimada" }
                        },
                        required: ["data", "descricao", "tipo", "valor", "categoria", "forma_pagamento"]
                    }
                }
            }
        });

        const textResponse = response.text;
        if (!textResponse) {
            throw new Error("Resposta vazia da API do Gemini.");
        }

        return res.status(200).json(JSON.parse(textResponse.trim()));
    } catch (error) {
        console.error("Erro no processamento do extrato via IA no Vercel:", error);
        return res.status(500).json({ error: String(error.message || error) });
    }
}

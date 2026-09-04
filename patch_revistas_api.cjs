const fs = require('fs');
let data = fs.readFileSync('src/components/ModuleRevistasInterativas.tsx', 'utf8');

data = data.replace(
    /let extractedText = responseData\.text;/g,
    `if (!response.ok) {
                    throw new Error(responseData?.error?.message || responseData?.message || 'Erro na API Gemini');
                }
                let extractedText = responseData.text;
                if (!extractedText) throw new Error("Texto extraído vazio ou inválido.");`
);

fs.writeFileSync('src/components/ModuleRevistasInterativas.tsx', data, 'utf8');
console.log("Patched ModuleRevistasInterativas.tsx");

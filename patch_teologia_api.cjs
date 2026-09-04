const fs = require('fs');
let data = fs.readFileSync('src/components/ModuleTeologia.tsx', 'utf8');

data = data.replace(
    /let jsonStr = resData\.text;/g,
    `if (!response.ok) {
                                                throw new Error(resData?.error?.message || resData?.message || 'Erro na API Gemini');
                                            }
                                            let jsonStr = resData.text;
                                            if (!jsonStr) throw new Error("Texto vazio retornado pela API");`
);

fs.writeFileSync('src/components/ModuleTeologia.tsx', data, 'utf8');
console.log("Patched ModuleTeologia.tsx");

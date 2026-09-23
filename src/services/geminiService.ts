export const callGeminiAI = async (prompt: string, retries = 5): Promise<string> => {
  const delays = [1000, 2000, 4000, 8000, 16000];

  for (let i = 0; i < retries; i++) {
    try {
      const clientKey = typeof window !== 'undefined' ? (localStorage.getItem('VITE_GEMINI_API_KEY') || '') : '';
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: String(prompt),
          key: clientKey || undefined
        })
      });
      
      if (!response.ok) {
          const errData = await response.json().catch(() => null);
          const rawErr = errData?.error || `HTTP error! status: ${response.status}`;
          throw new Error(rawErr);
      }
      
      const data = await response.json();
      return data.text || "Não foi possível gerar resposta. Tente novamente.";
    } catch (error: any) {
      const rawMsg = String(error?.message || error || "");
      
      // Detecção amigável de erro de restrição de API no Google Cloud
      if (rawMsg.includes("API_KEY_SERVICE_BLOCKED") || rawMsg.includes("generativelanguage.googleapis.com")) {
        return "⚠️ Chave do Gemini com restrição de API no Google Cloud: Habilite a 'Generative Language API' no console ou utilize uma chave gerada no Google AI Studio (aistudio.google.com).";
      }

      if (rawMsg.includes("RESOURCE_EXHAUSTED") || rawMsg.includes("429") || rawMsg.includes("prepayment credits")) {
        return "⚠️ Limite de requisições temporariamente atingido para o Gemini AI. Aguarde alguns instantes.";
      }

      if (i === retries - 1) {
        // Formata para não exibir JSON cru na interface
        if (rawMsg.includes("{") && rawMsg.includes("}")) {
          try {
            const jsonPart = rawMsg.substring(rawMsg.indexOf("{"), rawMsg.lastIndexOf("}") + 1);
            const parsed = JSON.parse(jsonPart);
            const friendly = parsed?.error?.message || parsed?.message;
            if (friendly) return `Erro na IA: ${friendly}`;
          } catch (_) {}
        }
        return `Erro na IA: ${rawMsg}`;
      }
      await new Promise(resolve => setTimeout(resolve, delays[i]));
    }
  }
  return "Não foi possível conectar ao serviço de inteligência artificial.";
};

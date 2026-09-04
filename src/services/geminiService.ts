export const callGeminiAI = async (prompt: string, retries = 5): Promise<string> => {
  const delays = [1000, 2000, 4000, 8000, 16000];

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: String(prompt) })
      });
      
      if (!response.ok) {
          const errData = await response.json().catch(() => null);
          throw new Error(errData?.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.text || "Não foi possível gerar resposta. Tente novamente.";
    } catch (error: any) {
      if (i === retries - 1) return `Erro na IA: ${error?.message || error}`;
      await new Promise(resolve => setTimeout(resolve, delays[i]));
    }
  }
  return "Não foi possível conectar ao serviço de inteligência artificial.";
};

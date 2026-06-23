export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const hasEnvKey = !!(process.env.ASAAS_API_KEY && process.env.ASAAS_API_KEY.trim());
  return res.status(200).json({
    configured: hasEnvKey,
    provider: "Asaas API",
    connectionMode: hasEnvKey ? "Variável de Ambiente Segura" : "Chave Própria do Banco de Dados",
    status: "Inicializado"
  });
}

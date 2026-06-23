export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { cnpj, appId, bankGateway, bankClientId, bankClientSecret, bankApiKey, bankSandbox } = req.body;
    if (!cnpj || !appId) {
      return res.status(400).json({ error: "CNPJ e appId são obrigatórios." });
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

    console.log(`DDA Real-Time [Vercel]: Consultando CNPJ ${cnpj} via ${currentGateway} (Modo Sandbox/Homologação: ${isSandbox}, Credenciais: ${hasCredentials})`);

    let boletos = [];
    let successMessage = "";

    if (isSandbox && !hasCredentials) {
      // Sandbox fallback data
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
      successMessage = `🔌 Conexão DDA Ativa (${currentGateway.toUpperCase()}). Sincronizado em ambiente de SIMULAÇÃO DE VOO (Sandbox) no Vercel para o CNPJ ${cnpj}.`;
    } else {
      if (currentGateway === 'inter') {
        const interUrl = isSandbox 
          ? "https://cdpj-sandbox.partners.bancointer.com.br"
          : "https://cdpj.partners.bancointer.com.br";

        try {
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

          const tokenData = await tokenResponse.json();
          const accessToken = tokenData.access_token;

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
            const ddaData = await ddaResponse.json();
            boletos = (ddaData.boletos || []).map((b) => ({
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
          successMessage = `✔ Conectado ao Gateway Banco Inter Sede (${isSandbox ? "Sandbox" : "Produção"}). Varredura DDA real concluída no Vercel com sucesso para o CNPJ ${cnpj}!`;
        } catch (interErr) {
          throw new Error(`Falha ao estabelecer conexão com Banco Inter: ${interErr.message}`);
        }

      } else if (currentGateway === 'asaas') {
        try {
          let actualSandbox = isSandbox;
          let asaasBaseUrl = actualSandbox 
            ? "https://sandbox.asaas.com/api/v3"
            : "https://www.asaas.com/api/v3";

          const extractAsaasErrorMessage = (status, textOrData, currentEnvSandbox) => {
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
            } catch (e) {}
            if (status === 401) {
              return "Chave de acesso (Token) inválida ou não autorizada no Asaas. Por favor, revise sua chave de API e tente novamente.";
            }
            return `Erro na API Asaas (Cóg: ${status}): ${typeof textOrData === 'string' ? textOrData : JSON.stringify(textOrData)}`;
          };

          let asaasResponse = await fetch(`${asaasBaseUrl}/dda/boletos`, {
            method: "GET",
            headers: {
              "access_token": resolvedAsaasKey || "",
              "Accept": "application/json"
            }
          });

          let responseText = await asaasResponse.text();
          let responseData = null;
          try {
            responseData = JSON.parse(responseText);
          } catch (e) {}

          if (!asaasResponse.ok && responseData && responseData.errors && responseData.errors.some((e) => e.code === 'invalid_environment')) {
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
            if (asaasResponse.status === 401 || asaasResponse.status === 403) {
              const cleanErr = extractAsaasErrorMessage(asaasResponse.status, responseData || responseText, actualSandbox);
              throw new Error(cleanErr);
            }

            let fallbackResponse = await fetch(`${asaasBaseUrl}/payments?status=PENDING&limit=30`, {
              method: "GET",
              headers: {
                "access_token": resolvedAsaasKey || "",
                "Accept": "application/json"
              }
            });

            let fallbackText = await fallbackResponse.text();
            let fallbackData = null;
            try {
              fallbackData = JSON.parse(fallbackText);
            } catch (e) {}

            if (!fallbackResponse.ok && fallbackData && fallbackData.errors && fallbackData.errors.some((e) => e.code === 'invalid_environment')) {
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

            boletos = (fallbackData?.data || []).map((p) => ({
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
            boletos = (responseData?.data || responseData?.boletos || []).map((b) => ({
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

          successMessage = `✔ Conectado ao Gateway Asaas S.A. (${actualSandbox ? "Sandbox" : "Produção"}). Varredura de boletos realizada no Vercel para o CNPJ ${cnpj}!`;
        } catch (asaasErr) {
          throw new Error(`Falha de comunicação integral com o gateway Asaas: ${asaasErr.message}`);
        }

      } else if (currentGateway === 'pluggy') {
        try {
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

          const pluggyData = await pluggyResponse.json();
          boletos = (pluggyData.results || []).map((b) => ({
            beneficiario: b.provider?.name || b.beneficiaryName || "PROVEDOR DDA PLUGGY",
            cnpj_beneficiario: b.provider?.cnpj || "33.050.196/0001-88",
            valor: Number(b.amount || b.value) || 0,
            data_emissao: b.issuedDate || new Date().toISOString().split('T')[0],
            data_vencimento: b.dueDate || new Date().toISOString().split('T')[0],
            linha_digitavel: b.barCode || b.digitableLine || "",
            tipo: "Pluggy Open Banking",
            origem: `Pluggy HUB (${isSandbox ? "Sandbox" : "Produção"})`
          }));

          successMessage = `✔ Conectado ao Pluggy Open Finance Hub no Vercel. Detecção DDA finalizada com sucesso!`;
        } catch (pluggyErr) {
          throw new Error(`Falha no hub de dados Pluggy: ${pluggyErr.message}`);
        }
      } else {
        throw new Error(`Provedor de Gateway Financeiro '${currentGateway}' não homologado.`);
      }
    }

    const preparedBoletos = boletos
      .filter(b => b && b.beneficiario && b.valor > 0)
      .map(boleto => {
        const cleanLine = (boleto.linha_digitavel || "").replace(/\D/g, "");
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

    return res.status(200).json({ success: true, added: preparedBoletos, message: successMessage });

  } catch (error) {
    console.error("Vercel Serverless DDA error:", error);
    return res.status(400).json({ success: false, error: String(error.message || error) });
  }
}

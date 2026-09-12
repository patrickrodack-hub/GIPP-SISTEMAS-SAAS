// Regras e Cálculos Oficiais e Trabalhistas (CLT, Previdência e Eclesiásticos)

/**
 * Tabela Oficial Progressiva do INSS (Vigente 2024-2026)
 * Faixas progressivas com aplicação sobre cada faixa
 */
export const INSS_BRACKETS_2026 = [
  { limite: 1412.00, aliquota: 0.075, deducao: 0.00 },
  { limite: 2666.68, aliquota: 0.09, deducao: 21.18 },
  { limite: 4000.03, aliquota: 0.12, deducao: 101.18 },
  { limite: 7786.02, aliquota: 0.14, deducao: 181.18 }
];
export const TETO_INSS_2026 = 7786.02;
export const TETO_INSS_DESCONTO_2026 = 908.86;

/**
 * Tabela Oficial Progressiva do IRRF (IRPF Mensal)
 * Com parcela a deduzir e dedução por dependente
 */
export const DEDUCAO_DEPENDENTE_IRRF = 189.59;
export const IRRF_BRACKETS_2026 = [
  { limite: 2259.20, aliquota: 0.00, deducao: 0.00 },
  { limite: 2826.65, aliquota: 0.075, deducao: 169.44 },
  { limite: 3751.05, aliquota: 0.15, deducao: 381.44 },
  { limite: 4664.68, aliquota: 0.225, deducao: 662.77 },
  { limite: Infinity, aliquota: 0.275, deducao: 896.00 }
];

/**
 * Cálculo Oficial do INSS Progressivo CLT
 */
export function calcularINSSOficial(salarioBruto: number): { valor: number; aliquotaEfetiva: number; memoriaCalculo: string } {
  const bruto = Math.max(0, Number(salarioBruto) || 0);
  if (bruto <= 0) return { valor: 0, aliquotaEfetiva: 0, memoriaCalculo: 'R$ 0,00' };

  const baseCalculo = Math.min(bruto, TETO_INSS_2026);
  let descontoTotal = 0;

  if (baseCalculo <= 1412.00) {
    descontoTotal = baseCalculo * 0.075;
  } else if (baseCalculo <= 2666.68) {
    descontoTotal = (baseCalculo * 0.09) - 21.18;
  } else if (baseCalculo <= 4000.03) {
    descontoTotal = (baseCalculo * 0.12) - 101.18;
  } else {
    descontoTotal = (baseCalculo * 0.14) - 181.18;
  }

  descontoTotal = Math.min(descontoTotal, TETO_INSS_DESCONTO_2026);
  descontoTotal = Math.round(descontoTotal * 100) / 100;
  const aliquotaEfetiva = bruto > 0 ? (descontoTotal / bruto) * 100 : 0;

  return {
    valor: descontoTotal,
    aliquotaEfetiva: Math.round(aliquotaEfetiva * 100) / 100,
    memoriaCalculo: `Tabela progressiva MTE (Teto: R$ ${TETO_INSS_2026.toFixed(2)})`
  };
}

/**
 * Cálculo Oficial do IRRF (com abatimento do INSS e dependentes)
 */
export function calcularIRRFOficial(
  salarioBruto: number, 
  descontoINSS: number, 
  numDependentes: number = 0,
  outrasDeducoes: number = 0
): { valor: number; aliquota: number; baseCalculo: number } {
  const bruto = Math.max(0, Number(salarioBruto) || 0);
  const inss = Math.max(0, Number(descontoINSS) || 0);
  const deducaoDependentes = (Math.max(0, numDependentes) * DEDUCAO_DEPENDENTE_IRRF);
  
  // Base de cálculo = Bruto - INSS - Dependentes - outras deduções legais
  const baseCalculo = Math.max(0, bruto - inss - deducaoDependentes - outrasDeducoes);

  let aliquota = 0;
  let parcelaDeduzir = 0;

  for (const faixa of IRRF_BRACKETS_2026) {
    if (baseCalculo <= faixa.limite) {
      aliquota = faixa.aliquota;
      parcelaDeduzir = faixa.deducao;
      break;
    }
  }

  const imposto = Math.max(0, (baseCalculo * aliquota) - parcelaDeduzir);
  return {
    valor: Math.round(imposto * 100) / 100,
    aliquota: aliquota * 100,
    baseCalculo: Math.round(baseCalculo * 100) / 100
  };
}

/**
 * Cálculo Oficial do FGTS (8% pago exclusivamente pelo empregador, não descontado do empregado)
 */
export function calcularFGTS(salarioBruto: number): number {
  const bruto = Math.max(0, Number(salarioBruto) || 0);
  return Math.round((bruto * 0.08) * 100) / 100;
}

/**
 * Rescisão Contratual Trabalhista (Simulador Jurídico TRCT)
 */
export interface SimulacaoRescisaoParams {
  salarioBase: number;
  dataAdmissao: string;
  dataDemissao: string;
  motivo: 'sem_justa_causa' | 'com_justa_causa' | 'pedido_demissao' | 'acordo_mutuo';
  avisoPrevio: 'trabalhado' | 'indenizado' | 'dispensado';
  saldoFgtsAcumulado?: number;
  feriasVencidas?: boolean;
}

export function calcularRescisaoTrabalhista(params: SimulacaoRescisaoParams) {
  const { salarioBase, dataAdmissao, dataDemissao, motivo, avisoPrevio, saldoFgtsAcumulado = 0, feriasVencidas = false } = params;
  
  const admDate = new Date(dataAdmissao + 'T12:00:00');
  const demDate = new Date(dataDemissao + 'T12:00:00');
  
  // Meses trabalhados
  const diffTime = Math.max(0, demDate.getTime() - admDate.getTime());
  const anosCompletos = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
  
  // Lei 12.506/2011: 30 dias + 3 dias por ano trabalhado (limite de 90 dias)
  const diasAviso = Math.min(90, 30 + (anosCompletos * 3));
  const valorDia = salarioBase / 30;

  // Dias trabalhados no mês da rescisão (Saldo de salário)
  const diasTrabalhadosMes = Math.min(30, demDate.getDate());
  const saldoSalario = Math.round((valorDia * diasTrabalhadosMes) * 100) / 100;

  // 13º proporcional
  const meses13o = demDate.getMonth() + (demDate.getDate() >= 15 ? 1 : 0);
  const decimoTerceiro = motivo !== 'com_justa_causa' ? Math.round(((salarioBase / 12) * meses13o) * 100) / 100 : 0;

  // Férias proporcionais + 1/3
  const mesesFerias = meses13o; // simplificado
  const feriasProp = motivo !== 'com_justa_causa' ? Math.round(((salarioBase / 12) * mesesFerias) * 100) / 100 : 0;
  const feriasVenc = feriasVencidas ? salarioBase : 0;
  const tercoConstitucional = Math.round(((feriasProp + feriasVenc) / 3) * 100) / 100;

  // Aviso prévio indenizado
  let valorAviso = 0;
  if (motivo === 'sem_justa_causa' && avisoPrevio === 'indenizado') {
    valorAviso = Math.round((valorDia * diasAviso) * 100) / 100;
  } else if (motivo === 'acordo_mutuo' && avisoPrevio === 'indenizado') {
    valorAviso = Math.round(((valorDia * diasAviso) / 2) * 100) / 100;
  }

  // Multa rescisória do FGTS (40% ou 20% no acordo mútuo)
  let multaFgts = 0;
  if (motivo === 'sem_justa_causa') {
    multaFgts = Math.round((saldoFgtsAcumulado * 0.40) * 100) / 100;
  } else if (motivo === 'acordo_mutuo') {
    multaFgts = Math.round((saldoFgtsAcumulado * 0.20) * 100) / 100;
  }

  // Descontos básicos (INSS sobre saldo de salário e 13º)
  const inssSaldo = calcularINSSOficial(saldoSalario).valor;
  const inss13o = decimoTerceiro > 0 ? calcularINSSOficial(decimoTerceiro).valor : 0;
  const totalDescontos = inssSaldo + inss13o;

  const totalProventos = saldoSalario + decimoTerceiro + feriasProp + feriasVenc + tercoConstitucional + valorAviso;
  const valorLiquido = Math.max(0, totalProventos - totalDescontos);

  return {
    diasAviso,
    diasAvisoIndenizado: diasAviso,
    anosCompletos,
    diasTrabalhadosMes,
    saldoSalario,
    mesesDecimoTerceiro: meses13o,
    decimoTerceiro,
    decimoTerceiroProporcional: decimoTerceiro,
    mesesFerias,
    feriasProp,
    feriasProporcionais: feriasProp,
    feriasVenc,
    feriasVencidasValor: feriasVenc,
    tercoConstitucional,
    tercoFeriasProporcionais: Math.round((feriasProp / 3) * 100) / 100,
    tercoFeriasVencidas: feriasVencidas ? Math.round((feriasVenc / 3) * 100) / 100 : 0,
    valorAviso,
    avisoPrevioIndenizadoValor: valorAviso,
    multaFgts,
    multaFgtsValor: multaFgts,
    inssSaldo,
    inss13o,
    inssRescisao: totalDescontos,
    totalProventos,
    totalDescontos,
    valorLiquido,
    valorLiquidoRescisao: valorLiquido
  };
}

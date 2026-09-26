export type TipoEvento = 'curso' | 'retiro' | 'conferencia' | 'vigilia' | 'workshop' | 'congresso' | 'seminario' | 'outro';

export type StatusEvento = 'aberto' | 'em_breve' | 'encerrado' | 'cancelado';

export type StatusInscricao = 'confirmado' | 'pendente' | 'cancelado' | 'lista_espera';

export type StatusPagamento = 'pago' | 'nao_pago' | 'isento';

export interface EventoItem {
  id: string;
  nome: string;
  descricao: string;
  tipo: TipoEvento;
  dataInicio: string; // YYYY-MM-DD
  dataFim: string;   // YYYY-MM-DD
  horario: string;   // ex: "19:30" ou "09:00 às 18:00"
  local: string;     // ex: "Templo Sede - Auditório Principal"
  enderecoCompleto?: string;
  capacidadeMaxima: number;
  valorInscricao: number; // 0 = Gratuito
  chavePix?: string;
  imagem?: string;
  status: StatusEvento;
  dataLimiteInscricao?: string;
  publicoAlvo?: string;
  emiteCertificado?: boolean;
  cargaHoraria?: string;
  instrutorPastor?: string;
  criadoEm: string;
  atualizadoEm?: string;
}

export interface InscricaoItem {
  id: string;
  eventoId: string;
  membroId?: string; // id do membro no cadastro da igreja (se for membro)
  nome: string;
  email: string;
  telefone: string;
  cpf?: string;
  tipoParticipante: 'membro' | 'visitante' | 'convidado';
  dataInscricao: string; // ISO string
  status: StatusInscricao;
  statusPagamento: StatusPagamento;
  valorPago?: number;
  formaPagamento?: 'pix' | 'cartao' | 'dinheiro' | 'isento';
  comprovanteUrl?: string;
  qrCodeToken: string; // Código único alfanumérico para check-in
  qrCodeDataUrl?: string; // Base64 gerado pelo qrcode
  presente: boolean;
  checkInEm?: string; // ISO string do momento em que a presença foi validada
  observacoes?: string;
}

export interface MensagemTemplate {
  id: string;
  titulo: string;
  tipo: 'confirmacao' | 'lembrete' | 'pagamento' | 'instrucoes' | 'qrcode';
  assunto: string;
  corpoTexto: string;
}

export interface DisparoComunicacao {
  id: string;
  eventoId: string;
  tipoCanal: 'whatsapp' | 'email' | 'notificacao';
  destinatariosCount: number;
  assunto: string;
  mensagem: string;
  enviadoPor: string;
  dataEnvio: string;
}

export const TIPOS_EVENTO_CONFIG: Record<TipoEvento, { label: string; badgeColor: string; bgSoft: string; textColor: string }> = {
  curso: { label: 'Curso de Capacitação', badgeColor: 'bg-blue-100 text-blue-800 border-blue-200', bgSoft: 'bg-blue-50', textColor: 'text-blue-600' },
  retiro: { label: 'Retiro Espiritual', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200', bgSoft: 'bg-amber-50', textColor: 'text-amber-600' },
  conferencia: { label: 'Conferência / Congresso', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200', bgSoft: 'bg-purple-50', textColor: 'text-purple-600' },
  vigilia: { label: 'Vigília de Oração', badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200', bgSoft: 'bg-indigo-50', textColor: 'text-indigo-600' },
  workshop: { label: 'Workshop Prático', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200', bgSoft: 'bg-emerald-50', textColor: 'text-emerald-600' },
  congresso: { label: 'Congresso Geral', badgeColor: 'bg-rose-100 text-rose-800 border-rose-200', bgSoft: 'bg-rose-50', textColor: 'text-rose-600' },
  seminario: { label: 'Seminário Teológico', badgeColor: 'bg-teal-100 text-teal-800 border-teal-200', bgSoft: 'bg-teal-50', textColor: 'text-teal-600' },
  outro: { label: 'Encontro Especial', badgeColor: 'bg-slate-100 text-slate-800 border-slate-200', bgSoft: 'bg-slate-50', textColor: 'text-slate-600' },
};

export const IMAGENS_BANNER_PRESET = [
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80', // Conferência auditório
  'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80', // Evento / Seminário
  'https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?auto=format&fit=crop&w=1200&q=80', // Retiro na natureza
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80', // Workshop / Sala de aula
  'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1200&q=80', // Louvor e adoração
];

export const EVENTOS_INICIAIS: EventoItem[] = [
  {
    id: 'evt_1',
    nome: 'Conferência Geral de Avivamento e Missões 2026',
    descricao: 'Três dias de imersão no mover do Espírito Santo com palestras ministeriais, adoração pentecostal genuína e despertamento missionário mundial.',
    tipo: 'conferencia',
    dataInicio: '2026-10-15',
    dataFim: '2026-10-17',
    horario: '19:30 às 22:00',
    local: 'Templo Sede - Nave Principal',
    enderecoCompleto: 'Av. das Nações, 1000 - Centro',
    capacidadeMaxima: 450,
    valorInscricao: 0,
    imagem: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
    status: 'aberto',
    dataLimiteInscricao: '2026-10-14',
    publicoAlvo: 'Toda a igreja, membros e visitantes',
    emiteCertificado: true,
    cargaHoraria: '12 horas',
    instrutorPastor: 'Pr. Presidente e Preletores Convidados',
    criadoEm: '2026-09-01T10:00:00Z',
  },
  {
    id: 'evt_2',
    nome: 'Curso Intensivo de Capacitação de Obreiros e Líderes',
    descricao: 'Formação ministerial prática para diáconos, presbíteros, líderes de departamentos e aspirantes ao obreirado cristão, com foco na liturgia, ética e doutrina bíblica.',
    tipo: 'curso',
    dataInicio: '2026-11-05',
    dataFim: '2026-11-26',
    horario: 'Quintas-feiras, 19:30 às 21:30',
    local: 'Centro de Ensino Teológico GIPP - Sala 02',
    enderecoCompleto: 'Rua das Oliveiras, 123 - Anexo Templo Sede',
    capacidadeMaxima: 80,
    valorInscricao: 45.0,
    chavePix: '12.345.678/0001-90',
    imagem: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80',
    status: 'aberto',
    dataLimiteInscricao: '2026-11-03',
    publicoAlvo: 'Obreiros, líderes de célula e aspirantes',
    emiteCertificado: true,
    cargaHoraria: '20 horas',
    instrutorPastor: 'Coordenação Teológica e Pastoral',
    criadoEm: '2026-09-05T14:30:00Z',
  },
  {
    id: 'evt_3',
    nome: 'Retiro Espiritual da Juventude - "Firmes na Rocha"',
    descricao: 'Fim de semana inesquecível em meio à natureza com gincanas bíblicas, vigília ao ar livre, comunhão santa e mensagens transformadoras para a juventude.',
    tipo: 'retiro',
    dataInicio: '2026-11-13',
    dataFim: '2026-11-15',
    horario: 'Saída sexta às 18h / Retorno domingo às 17h',
    local: 'Chácara Recanto Monte Sião',
    enderecoCompleto: 'Estrada das Palmeiras, Km 14 - Zona Rural',
    capacidadeMaxima: 120,
    valorInscricao: 120.0,
    chavePix: '12.345.678/0001-90',
    imagem: 'https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?auto=format&fit=crop&w=1200&q=80',
    status: 'aberto',
    dataLimiteInscricao: '2026-11-08',
    publicoAlvo: 'Jovens e adolescentes a partir de 14 anos',
    emiteCertificado: false,
    instrutorPastor: 'Liderança de Jovens (UMAD)',
    criadoEm: '2026-09-10T09:00:00Z',
  },
  {
    id: 'evt_4',
    nome: 'Workshop Prático de Mídia, Áudio & Transmissão ao Vivo',
    descricao: 'Treinamento mão na massa em operação de câmeras, software Holyrics/OBS Studio, mesa de som digital e iluminação cênica para cultos e conferências.',
    tipo: 'workshop',
    dataInicio: '2026-10-24',
    dataFim: '2026-10-24',
    horario: 'Sábado, 09:00 às 16:00',
    local: 'Auditório de Multimídia - 2º Andar',
    capacidadeMaxima: 35,
    valorInscricao: 0,
    imagem: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
    status: 'aberto',
    dataLimiteInscricao: '2026-10-22',
    publicoAlvo: 'Equipe de comunicação, sonoplastas e interessados',
    emiteCertificado: true,
    cargaHoraria: '7 horas',
    instrutorPastor: 'Equipe de Mídia Central',
    criadoEm: '2026-09-15T11:20:00Z',
  },
];

export const INSCRICOES_INICIAIS: InscricaoItem[] = [
  {
    id: 'ins_101',
    eventoId: 'evt_1',
    membroId: 'mem_1',
    nome: 'Lucas Gabriel Silveira',
    email: 'lucas.silveira@exemplo.com.br',
    telefone: '(11) 98844-1234',
    cpf: '123.456.789-01',
    tipoParticipante: 'membro',
    dataInscricao: '2026-09-12T15:30:00Z',
    status: 'confirmado',
    statusPagamento: 'isento',
    valorPago: 0,
    formaPagamento: 'isento',
    qrCodeToken: 'EVT-1-INS-101-78901',
    presente: true,
    checkInEm: '2026-09-26T19:15:32Z',
    observacoes: 'Participante do coral',
  },
  {
    id: 'ins_102',
    eventoId: 'evt_1',
    membroId: 'mem_2',
    nome: 'Débora Cristina Martins',
    email: 'debora.martins@exemplo.com.br',
    telefone: '(11) 97711-5566',
    cpf: '234.567.890-12',
    tipoParticipante: 'membro',
    dataInscricao: '2026-09-14T10:20:00Z',
    status: 'confirmado',
    statusPagamento: 'isento',
    valorPago: 0,
    formaPagamento: 'isento',
    qrCodeToken: 'EVT-1-INS-102-89012',
    presente: false,
  },
  {
    id: 'ins_103',
    eventoId: 'evt_2',
    membroId: 'mem_3',
    nome: 'Carlos Eduardo Nogueira',
    email: 'carlos.obreiro@exemplo.com.br',
    telefone: '(11) 99123-9988',
    cpf: '345.678.901-23',
    tipoParticipante: 'membro',
    dataInscricao: '2026-09-16T18:45:00Z',
    status: 'confirmado',
    statusPagamento: 'pago',
    valorPago: 45.0,
    formaPagamento: 'pix',
    qrCodeToken: 'EVT-2-INS-103-90123',
    presente: false,
    observacoes: 'Diácono atuante',
  },
  {
    id: 'ins_104',
    eventoId: 'evt_2',
    membroId: 'mem_4',
    nome: 'Marcos Paulo Ribeiro',
    email: 'marcos.ribeiro@exemplo.com.br',
    telefone: '(11) 98222-3344',
    cpf: '456.789.012-34',
    tipoParticipante: 'membro',
    dataInscricao: '2026-09-18T14:10:00Z',
    status: 'pendente',
    statusPagamento: 'nao_pago',
    valorPago: 0,
    qrCodeToken: 'EVT-2-INS-104-01234',
    presente: false,
    observacoes: 'Aguardando envio do comprovante PIX',
  },
  {
    id: 'ins_105',
    eventoId: 'evt_3',
    membroId: 'mem_5',
    nome: 'Larissa Santos Alencar',
    email: 'larissa.jovem@exemplo.com.br',
    telefone: '(11) 97333-8899',
    cpf: '567.890.123-45',
    tipoParticipante: 'membro',
    dataInscricao: '2026-09-20T21:00:00Z',
    status: 'confirmado',
    statusPagamento: 'pago',
    valorPago: 120.0,
    formaPagamento: 'pix',
    qrCodeToken: 'EVT-3-INS-105-12345',
    presente: false,
  },
  {
    id: 'ins_106',
    eventoId: 'evt_4',
    membroId: 'mem_6',
    nome: 'Matheus Henrique de Sousa',
    email: 'matheus.midia@exemplo.com.br',
    telefone: '(11) 96555-1212',
    tipoParticipante: 'membro',
    dataInscricao: '2026-09-21T09:15:00Z',
    status: 'confirmado',
    statusPagamento: 'isento',
    valorPago: 0,
    qrCodeToken: 'EVT-4-INS-106-51212',
    presente: false,
  },
];

export const TEMPLATES_MENSAGENS_INICIAIS: MensagemTemplate[] = [
  {
    id: 'tpl_confirmacao',
    titulo: 'Confirmação de Inscrição Oficial',
    tipo: 'confirmacao',
    assunto: 'Inscrição Confirmada: {evento} - {igreja}',
    corpoTexto: `Olá, {nome}! Paz do Senhor! 

Sua inscrição para o evento *{evento}* foi realizada com sucesso!

📅 *Data:* {data}
⏰ *Horário:* {horario}
📍 *Local:* {local}
🎫 *Código de Check-in:* {codigo_checkin}
💳 *Status do Pagamento:* {status_pagamento}

Apresente seu QR Code no dia do evento para realizar o check-in na portaria.
Esperamos por você! Deus abençoe rica e abundantemente!

_{igreja}_`,
  },
  {
    id: 'tpl_lembrete',
    titulo: 'Lembrete de Evento (24h Antes)',
    tipo: 'lembrete',
    assunto: 'É amanhã! Lembrete do evento {evento}',
    corpoTexto: `Olá, {nome}!

Passando para lembrar que é amanhã o grande dia do evento *{evento}*! 🔥

⏰ *Início:* {horario}
📍 *Local:* {local}
🎫 *Seu Código:* {codigo_checkin}

Venha com o coração aberto para o que Deus irá fazer! Tenha seu QR Code salvo no smartphone para agilizar sua entrada na portaria.

Até lá!
_{igreja}_`,
  },
  {
    id: 'tpl_pagamento',
    titulo: 'Instruções de Pagamento PIX',
    tipo: 'pagamento',
    assunto: 'Orientações de Pagamento - {evento}',
    corpoTexto: `Olá, {nome}!

Identificamos sua inscrição no evento *{evento}*.
Para garantir e confirmar definitivamente sua vaga, efetue o pagamento da taxa de inscrição:

💰 *Valor:* {valor}
🔑 *Chave PIX:* {chave_pix}

Após o pagamento, sua vaga estará 100% confirmada no sistema.
Qualquer dúvida, entre em contato com a nossa equipe.

_{igreja}_`,
  },
  {
    id: 'tpl_instrucoes',
    titulo: 'Instruções de Chegada e Credencial',
    tipo: 'instrucoes',
    assunto: 'Instruções Importantes para {evento}',
    corpoTexto: `Olá, {nome}!

Confira algumas informações importantes para o evento *{evento}*:

1. Chegue com 20 minutos de antecedência para realizar seu check-in com tranquilidade.
2. Apresente seu QR Code digital na portaria (código: {codigo_checkin}).
3. Caso o evento inclua refeições ou material, você receberá sua identificação no credenciamento.

Local: {local}
Horário de Abertura dos Portões: {horario}

Nos vemos lá!
_{igreja}_`,
  },
];

export function generateEventCheckinToken(eventoId: string, inscricaoId: string): string {
  const cleanEvt = eventoId.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase();
  const cleanIns = inscricaoId.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase();
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `EVT-${cleanEvt}-${cleanIns}-${randomSuffix}`;
}

export function formatEventDates(dataInicio: string, dataFim?: string): string {
  if (!dataInicio) return 'Data a definir';
  try {
    const parse = (str: string) => {
      const [y, m, d] = str.split('-');
      return `${d}/${m}/${y}`;
    };
    if (!dataFim || dataInicio === dataFim) {
      return parse(dataInicio);
    }
    return `${parse(dataInicio)} até ${parse(dataFim)}`;
  } catch {
    return dataInicio;
  }
}

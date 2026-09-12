export interface ProdutoLoja {
  id: string;
  nome: string;
  sku: string;
  categoria: string;
  descricao: string;
  preco_custo: number;
  preco_venda: number;
  estoque_atual: number;
  estoque_minimo: number;
  foto: string;
  ativo: boolean;
  destaque?: boolean;
  congregacao_id?: string;
  data_cadastro: string;
}

export interface ItemPedidoLoja {
  produto_id: string;
  nome: string;
  preco_unitario: number;
  quantidade: number;
  subtotal: number;
  foto?: string;
}

export interface ItemChecklistSeparacao {
  produto_id: string;
  separado: boolean;
  separado_por?: string;
  separado_em?: string;
}

export interface HistoricoEventoPedido {
  id: string;
  status: 'novo' | 'pagamento_confirmado' | 'separacao' | 'pronto_retirada' | 'entregue' | 'cancelado';
  titulo: string;
  descricao: string;
  data: string;
  responsavel?: string;
}

export interface PedidoLoja {
  id: string;
  numero_pedido: string;
  cliente_id?: string;
  cliente_nome: string;
  cliente_telefone: string;
  cliente_email?: string;
  cliente_cpf?: string;
  tipo_cliente: 'membro' | 'visitante';
  itens: ItemPedidoLoja[];
  valor_total: number;
  forma_pagamento: 'pix' | 'cartao_retirada' | 'dinheiro_retirada';
  status_pagamento: 'pendente' | 'pago' | 'cancelado';
  status_entrega: 'novo' | 'separacao' | 'pronto_retirada' | 'entregue' | 'cancelado';
  local_retirada: string;
  observacoes?: string;
  data_pedido: string;
  data_atualizacao?: string;
  // Campos da esteira de tratamento e separação
  checklist_separacao?: ItemChecklistSeparacao[];
  historico_status?: HistoricoEventoPedido[];
  responsavel_separacao?: string;
  data_separacao?: string;
  data_pagamento_confirmado?: string;
  responsavel_pagamento?: string;
  data_pronto_retirada?: string;
  data_entrega?: string;
  responsavel_entrega?: string;
  notas_internas?: string;
}

export interface MovimentacaoEstoque {
  id: string;
  produto_id: string;
  produto_nome: string;
  tipo: 'entrada' | 'saida_venda' | 'ajuste_manual' | 'devolucao';
  quantidade: number;
  estoque_anterior: number;
  estoque_posterior: number;
  motivo: string;
  responsavel: string;
  data: string;
}

export const CATEGORIAS_LOJA = [
  'Bíblias & Manuais',
  'Livros & Apostilas CPAD',
  'Harpas & Hinários',
  'Moda & Camisetas Evangélicas',
  'Artigos & Papelaria',
  'Kids & Material EBD',
  'Eventos & Congressos',
  'Acessórios & Outros'
];

export const PRODUTOS_LOJA_INICIAIS: ProdutoLoja[] = [
  {
    id: 'prod-001',
    nome: 'Bíblia de Estudo Pentecostal - Luxo',
    sku: 'BIB-PENT-01',
    categoria: 'Bíblias & Manuais',
    descricao: 'Bíblia completa com notas e referências da Teologia Pentecostal clássica (CPAD). Acabamento em couro legítimo com bordas douradas e fitas marcadoras.',
    preco_custo: 95.00,
    preco_venda: 149.90,
    estoque_atual: 18,
    estoque_minimo: 5,
    foto: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    ativo: true,
    destaque: true,
    data_cadastro: '2026-01-15T10:00:00.000Z'
  },
  {
    id: 'prod-002',
    nome: 'Harpa Cristã com Música e Corinhos',
    sku: 'HARP-MUS-02',
    categoria: 'Harpas & Hinários',
    descricao: 'Contém todos os 640 hinos da Harpa Cristã oficial das Assembleias de Deus com pauta musical, notas cifradas e suplemento de corinhos tradicionais.',
    preco_custo: 32.00,
    preco_venda: 55.00,
    estoque_atual: 24,
    estoque_minimo: 8,
    foto: 'https://images.unsplash.com/photo-1507842229451-9f01079ca4b5?auto=format&fit=crop&w=600&q=80',
    ativo: true,
    destaque: true,
    data_cadastro: '2026-01-20T11:30:00.000Z'
  },
  {
    id: 'prod-003',
    nome: 'Declaração de Fé das Assembleias de Deus (Livro Oficial)',
    sku: 'LIV-DF-03',
    categoria: 'Livros & Apostilas CPAD',
    descricao: 'Documento doutrinário oficial da CGADB com exposição comentada dos 24 capítulos dogmáticos sobre Bibliologia, Teontologia, Pneumatologia e Escatologia.',
    preco_custo: 28.00,
    preco_venda: 45.00,
    estoque_atual: 15,
    estoque_minimo: 5,
    foto: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    ativo: true,
    destaque: true,
    data_cadastro: '2026-02-01T09:15:00.000Z'
  },
  {
    id: 'prod-004',
    nome: 'Camiseta Oficial do Congresso da Família',
    sku: 'VEST-CONG-04',
    categoria: 'Moda & Camisetas Evangélicas',
    descricao: 'Camiseta em algodão 100% penteado 30.1 com estampa serigráfica de alta durabilidade do Congresso da Família. Confortável e elegante para o louvor e comunhão.',
    preco_custo: 22.00,
    preco_venda: 42.00,
    estoque_atual: 35,
    estoque_minimo: 10,
    foto: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    ativo: true,
    destaque: false,
    data_cadastro: '2026-02-10T14:20:00.000Z'
  },
  {
    id: 'prod-005',
    nome: 'Caderno de Anotações Eclesiástico GIPP',
    sku: 'PAP-CAD-05',
    categoria: 'Artigos & Papelaria',
    descricao: 'Caderno capa dura com acabamento fosco, 160 folhas pautadas com versículos bíblicos no rodapé, porta-caneta elástico e fita de cetim.',
    preco_custo: 14.00,
    preco_venda: 28.00,
    estoque_atual: 40,
    estoque_minimo: 12,
    foto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    ativo: true,
    destaque: false,
    data_cadastro: '2026-02-15T16:00:00.000Z'
  },
  {
    id: 'prod-006',
    nome: 'Revista EBD Adultos - Trimestre Atual CPAD',
    sku: 'EBD-REV-06',
    categoria: 'Kids & Material EBD',
    descricao: 'Lições bíblicas para a Escola Bíblica Dominical. Comentários exegéticos completos, subsídios pedagógicos e plano de leitura bíblica semanal.',
    preco_custo: 9.50,
    preco_venda: 18.00,
    estoque_atual: 50,
    estoque_minimo: 15,
    foto: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
    ativo: true,
    destaque: false,
    data_cadastro: '2026-03-01T08:00:00.000Z'
  }
];

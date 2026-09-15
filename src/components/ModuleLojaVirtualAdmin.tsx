import React, { useState, useMemo, useContext } from 'react';
import { createPortal } from 'react-dom';
import { ChurchContext } from '../context/ChurchContext';
import { 
  ShoppingBag, Package, Plus, Search, Filter, Edit, Trash2, CheckCircle, 
  AlertTriangle, DollarSign, ArrowUpRight, ArrowDownRight, Clock, User, 
  Phone, Mail, Calendar, Eye, Printer, MessageCircle, RefreshCw, 
  TrendingUp, BarChart3, Tag, FileText, Check, X, Upload, Image as ImageIcon,
  ArrowRight, ShieldCheck, Truck, Store, Layers, ClipboardCheck, XCircle,
  Maximize2, Minimize2, Sparkles, Landmark, Receipt
} from 'lucide-react';
import { 
  ProdutoLoja, PedidoLoja, MovimentacaoEstoque, TransferenciaCaixaLoja,
  CATEGORIAS_LOJA, PRODUTOS_LOJA_INICIAIS,
  HistoricoEventoPedido, isProdutoExemplo, EXEMPLO_PRODUTO_IDS
} from '../data/lojaVirtualData';
import { Button } from '../utils/sharedHelpers';
import LojaTratamentoModal from './LojaTratamentoModal';
import LojaRecebimentoArea from './LojaRecebimentoArea';
import LojaHistoricoPedidos from './LojaHistoricoPedidos';
import LojaDocumentoFiscalModal from './LojaDocumentoFiscalModal';
import LojaFinanceiroCaixa from './LojaFinanceiroCaixa';
import LojaComprovanteTransferenciaModal from './LojaComprovanteTransferenciaModal';
import { ConfirmModal } from './ConfirmModal';
import { InteractiveWindow } from './InteractiveWindow';

export default function ModuleLojaVirtualAdmin() {
  const { db, setDbState, addToast, user, dbFirestore, appId, setDoc, doc, deleteDoc, logAction } = useContext(ChurchContext);

  const [activeTab, setActiveTab] = useState<'recebimento' | 'pedidos' | 'produtos' | 'estoque' | 'historico' | 'metricas' | 'financeiro'>('recebimento');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('todas');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isProductModalMaximized, setIsProductModalMaximized] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProdutoLoja | null>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedStockProduct, setSelectedStockProduct] = useState<ProdutoLoja | null>(null);
  const [stockMovementType, setStockMovementType] = useState<'entrada' | 'ajuste_manual'>('entrada');
  const [stockMovementQty, setStockMovementQty] = useState<number>(1);
  const [stockMovementMotivo, setStockMovementMotivo] = useState('');
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PedidoLoja | null>(null);
  const [quickFiscalDoc, setQuickFiscalDoc] = useState<{ order: PedidoLoja; tipo: 'nota_fiscal' | 'pedido_compra' } | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<PedidoLoja | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<PedidoLoja | null>(null);

  // Form states for Product
  const [formData, setFormData] = useState<Partial<ProdutoLoja>>({
    nome: '',
    sku: '',
    categoria: CATEGORIAS_LOJA[0],
    descricao: '',
    preco_custo: 0,
    preco_venda: 0,
    estoque_atual: 0,
    estoque_minimo: 5,
    foto: '',
    ativo: true,
    destaque: false
  });

  // Safe collections getter with defaults - Somente produtos reais do banco / cadastrados pelos usuários
  const produtos: ProdutoLoja[] = useMemo(() => {
    if (db && Array.isArray(db.loja_produtos)) {
      const exemplosLimpos = localStorage.getItem('gipp_loja_exemplos_limpos') === 'true';
      const hasReal = db.loja_produtos.some((p: any) => !isProdutoExemplo(p));
      if (exemplosLimpos || hasReal) {
        return db.loja_produtos.filter((p: any) => !isProdutoExemplo(p));
      }
      return db.loja_produtos;
    }
    return [];
  }, [db?.loja_produtos]);

  const pedidos: PedidoLoja[] = useMemo(() => {
    if (db && Array.isArray(db.loja_pedidos)) {
      return db.loja_pedidos;
    }
    return [];
  }, [db?.loja_pedidos]);

  const movimentacoes: MovimentacaoEstoque[] = useMemo(() => {
    if (db && Array.isArray(db.loja_movimentacoes)) {
      return db.loja_movimentacoes;
    }
    return [];
  }, [db?.loja_movimentacoes]);

  const transferencias: TransferenciaCaixaLoja[] = useMemo(() => {
    if (db && Array.isArray(db.loja_transferencias)) {
      return db.loja_transferencias;
    }
    return [];
  }, [db?.loja_transferencias]);

  // Persist helper
  const syncProdutos = async (newList: ProdutoLoja[]) => {
    const currentList = Array.isArray(db?.loja_produtos) ? db.loja_produtos : produtos;
    const removedIds = currentList.filter((p: any) => !newList.some((n: any) => n.id === p.id)).map((p: any) => p.id);

    const hasRealProduct = newList.some(p => !isProdutoExemplo(p));
    const isClearingOrHasReal = newList.length === 0 || hasRealProduct;

    if (isClearingOrHasReal) {
      localStorage.setItem('gipp_loja_exemplos_limpos', 'true');
    }

    if (removedIds.length > 0) {
      try {
        let deletedIds: string[] = [];
        const raw = localStorage.getItem('gipp_loja_produtos_deleted_ids');
        if (raw) deletedIds = JSON.parse(raw);
        removedIds.forEach(id => {
          if (!deletedIds.includes(id)) deletedIds.push(id);
        });
        localStorage.setItem('gipp_loja_produtos_deleted_ids', JSON.stringify(deletedIds));
      } catch (e) {}
    }

    setDbState((prev: any) => ({ ...prev, loja_produtos: newList }));
    try {
      localStorage.setItem('gipp_loja_produtos', JSON.stringify(newList));
      if (dbFirestore && appId) {
        for (const id of removedIds) {
          try {
            await deleteDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'loja_produtos', id));
          } catch (e) {}
        }
        if (isClearingOrHasReal) {
          for (const sampleId of EXEMPLO_PRODUTO_IDS) {
            try {
              await deleteDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'loja_produtos', sampleId));
            } catch (e) {}
          }
          try {
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'settings', 'loja_config'), {
              exemplos_limpos: true,
              last_update: new Date().toISOString()
            }, { merge: true });
          } catch (e) {}
        }
        for (const item of newList) {
          await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'loja_produtos', item.id), item);
        }
      }
    } catch (e) {
      console.warn("Storage sync error:", e);
    }
  };

  const syncPedidos = async (newList: PedidoLoja[]) => {
    setDbState((prev: any) => ({ ...prev, loja_pedidos: newList }));
    try {
      localStorage.setItem('gipp_loja_pedidos', JSON.stringify(newList));
      if (dbFirestore && appId) {
        for (const item of newList) {
          await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'loja_pedidos', item.id), item);
        }
      }
    } catch (e) {
      console.warn("Storage sync error:", e);
    }
  };

  const syncMovimentacoes = async (newList: MovimentacaoEstoque[]) => {
    setDbState((prev: any) => ({ ...prev, loja_movimentacoes: newList }));
    try {
      localStorage.setItem('gipp_loja_movimentacoes', JSON.stringify(newList));
      if (dbFirestore && appId) {
        for (const item of newList) {
          await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'loja_movimentacoes', item.id), item);
        }
      }
    } catch (e) {
      console.warn("Storage sync error:", e);
    }
  };

  const syncTransferencias = async (newList: TransferenciaCaixaLoja[]) => {
    setDbState((prev: any) => ({ ...prev, loja_transferencias: newList }));
    try {
      localStorage.setItem('gipp_loja_transferencias', JSON.stringify(newList));
      if (dbFirestore && appId) {
        for (const item of newList) {
          await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'loja_transferencias', item.id), item);
        }
      }
    } catch (e) {
      console.warn("Storage sync error (transferencias):", e);
    }
  };

  // Efetuar transferência de saldo do caixa da loja para a conta/tesouraria da igreja
  const handleEfetuarTransferencia = async (dados: {
    valor: number;
    destino_conta: string;
    centro_custo_id?: string;
    congregacao_id?: string;
    categoria_financeiro: string;
    forma_transferencia: 'transferencia_interna' | 'pix' | 'deposito' | 'dinheiro';
    observacoes?: string;
    data_transferencia: string;
  }): Promise<TransferenciaCaixaLoja | null> => {
    try {
      const nowIso = new Date().toISOString();
      const seqNum = transferencias.length + 1;
      const numComprovante = `TRF-LOJA-${new Date().getFullYear()}-${String(seqNum).padStart(4, '0')}`;

      // Calcular saldo anterior e posterior
      const totalVendasPagas = pedidos
        .filter(p => p.status_pagamento === 'pago')
        .reduce((acc, p) => acc + (p.valor_total || 0), 0);
      const totalJaTransferido = transferencias
        .filter(t => t.status !== 'estornada')
        .reduce((acc, t) => acc + (t.valor || 0), 0);
      const saldoAnterior = Math.max(0, totalVendasPagas - totalJaTransferido);
      const saldoPosterior = Math.max(0, saldoAnterior - dados.valor);

      const novaTransferencia: TransferenciaCaixaLoja = {
        id: `trf-loja-${Date.now()}`,
        numero_comprovante: numComprovante,
        valor: dados.valor,
        saldo_anterior: saldoAnterior,
        saldo_posterior: saldoPosterior,
        data_transferencia: dados.data_transferencia ? `${dados.data_transferencia}T${new Date().toTimeString().split(' ')[0]}` : nowIso,
        destino_conta: dados.destino_conta,
        centro_custo_id: dados.centro_custo_id || 'sede',
        congregacao_id: dados.congregacao_id || user?.congregacao_id || 'sede',
        categoria_financeiro: dados.categoria_financeiro || 'Vendas Loja Virtual / Cantina / Livraria',
        forma_transferencia: dados.forma_transferencia,
        responsavel_id: user?.id || 'admin',
        responsavel_nome: user?.nome || 'Operador da Loja Virtual',
        observacoes: dados.observacoes || '',
        status: 'confirmada',
        criado_em: nowIso
      };

      // 1. Atualizar coleção loja_transferencias
      const novaListaTrf = [novaTransferencia, ...transferencias];
      await syncTransferencias(novaListaTrf);

      // 2. Criar e sincronizar lançamento de ENTRADA no Financeiro Geral da Igreja
      const novoLancamentoFinanceiro = {
        id: `fin-trf-${novaTransferencia.id}`,
        tipo: 'entrada',
        descricao: `Receita Loja Virtual - Repasse de Caixa (${numComprovante})`,
        valor: dados.valor,
        data_competencia: dados.data_transferencia || nowIso.split('T')[0],
        data_vencimento: dados.data_transferencia || nowIso.split('T')[0],
        data_pagamento: dados.data_transferencia || nowIso.split('T')[0],
        status: 'pago',
        categoria: dados.categoria_financeiro || 'Vendas Loja Virtual / Cantina / Livraria',
        forma_pagamento: dados.forma_transferencia === 'pix' ? 'pix' : dados.forma_transferencia === 'dinheiro' ? 'dinheiro' : 'transferencia',
        conta_bancaria: dados.destino_conta,
        centro_custo_id: dados.centro_custo_id || 'sede',
        congregacao_id: dados.congregacao_id || user?.congregacao_id || 'sede',
        observacoes: dados.observacoes || `Transferência de saldo de vendas da Loja Virtual. Comprovante: ${numComprovante}`,
        origem: 'loja_virtual',
        referencia_id: novaTransferencia.id,
        criado_por: user?.nome || 'Operador Loja Virtual',
        criado_em: nowIso
      };

      const listaFinanceiroAtual = Array.isArray(db?.financeiro) ? db.financeiro : [];
      const novaListaFinanceiro = [novoLancamentoFinanceiro, ...listaFinanceiroAtual];

      setDbState((prev: any) => ({
        ...prev,
        financeiro: novaListaFinanceiro,
        loja_transferencias: novaListaTrf
      }));

      try {
        localStorage.setItem('gipp_financeiro', JSON.stringify(novaListaFinanceiro));
        if (dbFirestore && appId) {
          await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro', novoLancamentoFinanceiro.id), novoLancamentoFinanceiro);
        }
      } catch (e) {
        console.warn("Storage sync error (financeiro):", e);
      }

      if (logAction) {
        logAction(
          'Repasse de Caixa da Loja Virtual',
          `Transferência de R$ ${dados.valor.toFixed(2)} da Loja Virtual para ${dados.destino_conta} (Comprovante: ${numComprovante}) registrada como entrada no Financeiro da Igreja.`
        );
      }

      addToast(`Saldo de R$ ${dados.valor.toFixed(2)} transferido e lançado no Financeiro da Igreja com sucesso!`, "success");
      return novaTransferencia;
    } catch (err) {
      console.error("Erro ao efetuar transferência:", err);
      addToast("Erro ao processar transferência de caixa.", "error");
      return null;
    }
  };

  // Filtered Products
  const produtosFiltrados = useMemo(() => {
    return produtos.filter(p => {
      const matchSearch = (p.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.categoria || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategoria = selectedCategoria === 'todas' || p.categoria === selectedCategoria;
      const matchStatus = statusFilter === 'todos' || 
                          (statusFilter === 'ativos' && p.ativo) || 
                          (statusFilter === 'inativos' && !p.ativo) ||
                          (statusFilter === 'baixo_estoque' && p.estoque_atual <= p.estoque_minimo);
      return matchSearch && matchCategoria && matchStatus;
    });
  }, [produtos, searchTerm, selectedCategoria, statusFilter]);

  // Filtered Orders
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter(p => {
      const matchSearch = (p.numero_pedido || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.cliente_nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.cliente_telefone || '').includes(searchTerm);
      const matchStatus = statusFilter === 'todos' || p.status_entrega === statusFilter || p.status_pagamento === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [pedidos, searchTerm, statusFilter]);

  // Calculations & Metrics
  const metricas = useMemo(() => {
    const totalVendas = pedidos
      .filter(p => p.status_pagamento === 'pago')
      .reduce((acc, p) => acc + (p.valor_total || 0), 0);

    const totalPedidos = pedidos.length;
    const pedidosPendentes = pedidos.filter(p => p.status_entrega === 'novo' || p.status_entrega === 'separacao').length;
    const pedidosProntos = pedidos.filter(p => p.status_entrega === 'pronto_retirada').length;
    const totalItensEstoque = produtos.reduce((acc, p) => acc + (p.estoque_atual || 0), 0);
    const produtosEstoqueBaixo = produtos.filter(p => p.estoque_atual <= p.estoque_minimo).length;
    const ticketMedio = totalPedidos > 0 ? totalVendas / (pedidos.filter(p => p.status_pagamento === 'pago').length || 1) : 0;

    return {
      totalVendas,
      totalPedidos,
      pedidosPendentes,
      pedidosProntos,
      totalItensEstoque,
      produtosEstoqueBaixo,
      ticketMedio
    };
  }, [pedidos, produtos]);

  // Handle open Product modal
  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setFormData({
      nome: '',
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      categoria: CATEGORIAS_LOJA[0],
      descricao: '',
      preco_custo: 0,
      preco_venda: 0,
      estoque_atual: 10,
      estoque_minimo: 5,
      foto: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      ativo: true,
      destaque: false
    });
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (prod: ProdutoLoja) => {
    setEditingProduct(prod);
    setFormData({ ...prod });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.preco_venda) {
      addToast("Preencha o nome e o preço de venda do produto.", "warning");
      return;
    }

    let updatedList: ProdutoLoja[];
    if (editingProduct) {
      updatedList = produtos.map(p => p.id === editingProduct.id ? {
        ...editingProduct,
        ...formData,
        preco_custo: Number(formData.preco_custo) || 0,
        preco_venda: Number(formData.preco_venda) || 0,
        estoque_atual: Number(formData.estoque_atual) || 0,
        estoque_minimo: Number(formData.estoque_minimo) || 1,
      } as ProdutoLoja : p);
      addToast("Produto atualizado com sucesso!", "success");
    } else {
      const newProduct: ProdutoLoja = {
        id: `prod-${Date.now()}`,
        nome: formData.nome || 'Produto Sem Nome',
        sku: formData.sku || `SKU-${Date.now().toString().slice(-4)}`,
        categoria: formData.categoria || CATEGORIAS_LOJA[0],
        descricao: formData.descricao || '',
        preco_custo: Number(formData.preco_custo) || 0,
        preco_venda: Number(formData.preco_venda) || 0,
        estoque_atual: Number(formData.estoque_atual) || 0,
        estoque_minimo: Number(formData.estoque_minimo) || 5,
        foto: formData.foto || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
        ativo: formData.ativo !== undefined ? formData.ativo : true,
        destaque: !!formData.destaque,
        data_cadastro: new Date().toISOString()
      };
      // REGRA CRÍTICA: Ao cadastrar um produto real pela primeira vez, eliminamos qualquer produto de modelo remanescente
      localStorage.setItem('gipp_loja_exemplos_limpos', 'true');
      const apenasReais = produtos.filter(p => !isProdutoExemplo(p));
      updatedList = [newProduct, ...apenasReais];
      addToast("Novo produto cadastrado com sucesso! Catálogo oficial configurado.", "success");
    }

    await syncProdutos(updatedList);
    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = async (prodId: string) => {
    if (!window.confirm("Deseja realmente remover este produto do catálogo?")) return;
    const prodTarget = produtos.find(p => p.id === prodId);
    if (prodTarget && isProdutoExemplo(prodTarget)) {
      localStorage.setItem('gipp_loja_exemplos_limpos', 'true');
    }
    const updatedList = produtos.filter(p => p.id !== prodId);
    await syncProdutos(updatedList);
    addToast("Produto removido do catálogo.", "info");
  };

  const handleToggleProductStatus = async (prod: ProdutoLoja) => {
    const updatedList = produtos.map(p => p.id === prod.id ? { ...p, ativo: !p.ativo } : p);
    await syncProdutos(updatedList);
    addToast(prod.ativo ? "Produto desativado da vitrine." : "Produto ativado na vitrine!", "success");
  };

  // Image Upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      addToast("A imagem deve ter no máximo 2MB.", "warning");
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string;
      setFormData(prev => ({ ...prev, foto: base64 }));
      addToast("Imagem carregada com sucesso!", "success");
    };
    reader.readAsDataURL(file);
  };

  // Stock Movement handling
  const handleOpenStockModal = (prod: ProdutoLoja) => {
    setSelectedStockProduct(prod);
    setStockMovementType('entrada');
    setStockMovementQty(5);
    setStockMovementMotivo('');
    setIsStockModalOpen(true);
  };

  const handleConfirmStockMovement = async () => {
    if (!selectedStockProduct || stockMovementQty <= 0) {
      addToast("Informe uma quantidade válida para a movimentação.", "warning");
      return;
    }

    const prevQty = selectedStockProduct.estoque_atual;
    const delta = stockMovementType === 'entrada' ? stockMovementQty : -stockMovementQty;
    const newQty = Math.max(0, prevQty + delta);

    // Update product stock
    const updatedProducts = produtos.map(p => p.id === selectedStockProduct.id ? { ...p, estoque_atual: newQty } : p);
    await syncProdutos(updatedProducts);

    // Add movement record
    const newMov: MovimentacaoEstoque = {
      id: `mov-${Date.now()}`,
      produto_id: selectedStockProduct.id,
      produto_nome: selectedStockProduct.nome,
      tipo: stockMovementType,
      quantidade: stockMovementQty,
      estoque_anterior: prevQty,
      estoque_posterior: newQty,
      motivo: stockMovementMotivo || (stockMovementType === 'entrada' ? 'Reposição de Estoque' : 'Ajuste Manual'),
      responsavel: user?.nome || 'Administrador',
      data: new Date().toISOString()
    };
    await syncMovimentacoes([newMov, ...movimentacoes]);

    addToast(`Estoque de "${selectedStockProduct.nome}" atualizado para ${newQty} un.`, "success");
    setIsStockModalOpen(false);
  };

  // Order Status update
  const handleUpdateOrderStatus = async (
    orderId: string, 
    newDeliveryStatus?: PedidoLoja['status_entrega'], 
    newPaymentStatus?: PedidoLoja['status_pagamento']
  ) => {
    const now = new Date().toISOString();
    const operatorName = user?.nome || 'Operador do Sistema';
    const updatedOrders = pedidos.map(p => {
      if (p.id === orderId) {
        const histEvent: HistoricoEventoPedido = {
          id: `hist-${Date.now()}`,
          status: newDeliveryStatus || p.status_entrega,
          titulo: `Status alterado para ${(newDeliveryStatus || p.status_entrega).toUpperCase()}`,
          descricao: `Atualizado por ${operatorName}. Pagamento: ${newPaymentStatus || p.status_pagamento}.`,
          data: now,
          responsavel: operatorName
        };

        return {
          ...p,
          ...(newDeliveryStatus ? { status_entrega: newDeliveryStatus } : {}),
          ...(newPaymentStatus ? { status_pagamento: newPaymentStatus } : {}),
          data_atualizacao: now,
          historico_status: [histEvent, ...(p.historico_status || [])]
        };
      }
      return p;
    });

    await syncPedidos(updatedOrders);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(updatedOrders.find(p => p.id === orderId) || null);
    }
    addToast("Status do pedido atualizado!", "success");
  };

  // Full order treatment save handler with inventory return on cancel
  const handleSaveTratamento = async (
    updatedOrder: PedidoLoja,
    eventTitle: string,
    eventDesc: string
  ) => {
    const prevOrder = pedidos.find(p => p.id === updatedOrder.id);
    let updatedProducts = [...produtos];
    let updatedMovs = [...movimentacoes];
    const now = new Date().toISOString();
    const operatorName = user?.nome || 'Operador do Sistema';

    // If order was cancelled and previous wasn't, return items to inventory
    if (updatedOrder.status_entrega === 'cancelado' && prevOrder && prevOrder.status_entrega !== 'cancelado') {
      (updatedOrder.itens || []).forEach(item => {
        const prod = updatedProducts.find(p => p.id === item.produto_id);
        if (prod) {
          const newQty = prod.estoque_atual + item.quantidade;
          updatedProducts = updatedProducts.map(p => p.id === prod.id ? { ...p, estoque_atual: newQty } : p);
          updatedMovs.unshift({
            id: `mov-estorno-${Date.now()}-${prod.id}`,
            produto_id: prod.id,
            produto_nome: prod.nome,
            tipo: 'devolucao',
            quantidade: item.quantidade,
            estoque_anterior: prod.estoque_atual,
            estoque_posterior: newQty,
            motivo: `Estorno por Cancelamento do Pedido #${updatedOrder.numero_pedido}`,
            responsavel: operatorName,
            data: now
          });
        }
      });
      await syncProdutos(updatedProducts);
      await syncMovimentacoes(updatedMovs);
    }

    const historyEvent: HistoricoEventoPedido = {
      id: `hist-${Date.now()}`,
      status: updatedOrder.status_entrega,
      titulo: eventTitle,
      descricao: eventDesc,
      data: now,
      responsavel: operatorName
    };

    const finalOrder: PedidoLoja = {
      ...updatedOrder,
      data_atualizacao: now,
      historico_status: [historyEvent, ...(updatedOrder.historico_status || [])]
    };

    const updatedOrders = pedidos.map(p => p.id === finalOrder.id ? finalOrder : p);
    await syncPedidos(updatedOrders);
    setSelectedOrder(finalOrder);
    addToast("Pedido atualizado com sucesso na esteira!", "success");
  };

  // Direct cancel order handler with stock refund
  const handleCancelOrderDirect = async (pedido: PedidoLoja) => {
    const prevOrder = pedidos.find(p => p.id === pedido.id);
    if (!prevOrder || prevOrder.status_entrega === 'cancelado') return;

    let updatedProducts = [...produtos];
    let updatedMovs = [...movimentacoes];
    const now = new Date().toISOString();
    const operatorName = user?.nome || 'Administrador';

    // Devolve ao estoque
    (pedido.itens || []).forEach(item => {
      const prod = updatedProducts.find(p => p.id === item.produto_id);
      if (prod) {
        const newQty = prod.estoque_atual + item.quantidade;
        updatedProducts = updatedProducts.map(p => p.id === prod.id ? { ...p, estoque_atual: newQty } : p);
        updatedMovs.unshift({
          id: `mov-estorno-${Date.now()}-${prod.id}`,
          produto_id: prod.id,
          produto_nome: prod.nome,
          tipo: 'devolucao',
          quantidade: item.quantidade,
          estoque_anterior: prod.estoque_atual,
          estoque_posterior: newQty,
          motivo: `Cancelamento de Pedido #${pedido.numero_pedido} pelo Painel Administrativo`,
          responsavel: operatorName,
          data: now
        });
      }
    });

    const historyEvent: HistoricoEventoPedido = {
      id: `hist-${Date.now()}`,
      status: 'cancelado',
      titulo: 'Pedido Cancelado',
      descricao: `Cancelamento manual realizado por ${operatorName}. Estoque estornado com sucesso.`,
      data: now,
      responsavel: operatorName
    };

    const finalOrder: PedidoLoja = {
      ...pedido,
      status_entrega: 'cancelado',
      status_pagamento: 'cancelado',
      data_atualizacao: now,
      historico_status: [historyEvent, ...(pedido.historico_status || [])]
    };

    const updatedOrders = pedidos.map(p => p.id === finalOrder.id ? finalOrder : p);
    await syncProdutos(updatedProducts);
    await syncMovimentacoes(updatedMovs);
    await syncPedidos(updatedOrders);

    if (selectedOrder && selectedOrder.id === finalOrder.id) {
      setSelectedOrder(finalOrder);
    }
    setOrderToCancel(null);
    addToast(`Pedido #${pedido.numero_pedido} cancelado e itens estornados ao estoque!`, "info");
  };

  // Direct delete order handler using system deletion engine
  const handleDeleteOrderDirect = async (pedido: PedidoLoja) => {
    try {
      const updatedOrders = pedidos.filter(p => p.id !== pedido.id);
      await syncPedidos(updatedOrders);

      if (dbFirestore && appId && deleteDoc && doc) {
        try {
          await deleteDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'loja_pedidos', pedido.id));
        } catch (e) {
          console.warn("Erro ao deletar pedido do Firestore:", e);
        }
      }

      if (logAction) {
        logAction('Exclusão de Pedido', `Pedido #${pedido.numero_pedido} (${pedido.cliente_nome} - R$ ${pedido.valor_total.toFixed(2)}) excluído definitivamente do sistema.`);
      }

      if (selectedOrder && selectedOrder.id === pedido.id) {
        setIsOrderDetailsOpen(false);
        setSelectedOrder(null);
      }

      setOrderToDelete(null);
      addToast(`Pedido #${pedido.numero_pedido} excluído definitivamente do sistema!`, "success");
    } catch (err) {
      console.error("Erro ao excluir pedido:", err);
      addToast("Erro ao excluir pedido.", "error");
    }
  };

  // Open WhatsApp contact
  const handleContactBuyerWhatsApp = (pedido: PedidoLoja) => {
    const phone = (pedido.cliente_telefone || '').replace(/\D/g, '');
    if (!phone) {
      addToast("Telefone do cliente não cadastrado.", "warning");
      return;
    }
    const message = encodeURIComponent(
      `Olá, ${pedido.cliente_nome}! Paz do Senhor.\n` +
      `Referente ao seu Pedido #${pedido.numero_pedido} na Loja da Igreja (${db?.igreja?.nome || 'Igreja'}):\n` +
      `Status atual: ${pedido.status_entrega === 'pronto_retirada' ? 'PRONTO PARA RETIRADA NA IGREJA! 📦' : pedido.status_entrega.toUpperCase()}\n` +
      `Valor Total: R$ ${pedido.valor_total.toFixed(2)} (${pedido.status_pagamento === 'pago' ? 'PAGO' : 'PAGAMENTO PENDENTE'}).\n` +
      `Local de Retirada: ${pedido.local_retirada}.\nDeus abençoe!`
    );
    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
  };

  const handleLimparModelosTeste = async () => {
    const rawList = Array.isArray(db?.loja_produtos) ? db.loja_produtos : produtos;
    const temExemplos = rawList.some(isProdutoExemplo);
    const temReais = rawList.some((p: any) => !isProdutoExemplo(p));

    if (temExemplos && temReais) {
      if (window.confirm("Deseja remover todos os produtos de exemplo/modelo e MANTER apenas os seus produtos cadastrados?")) {
        localStorage.setItem('gipp_loja_exemplos_limpos', 'true');
        const apenasReais = rawList.filter((p: any) => !isProdutoExemplo(p));
        await syncProdutos(apenasReais);
        addToast("Modelos de teste removidos com sucesso! Seus produtos reais foram mantidos.", "success");
        return;
      }
    }

    if (window.confirm("Atenção: Deseja limpar todos os produtos de modelo/teste e zerar o catálogo da loja para manter apenas cadastros reais de usuários?")) {
      localStorage.setItem('gipp_loja_exemplos_limpos', 'true');
      await syncProdutos([]);
      addToast("Catálogo da loja zerado com sucesso. Pronto para seus cadastros oficiais!", "info");
    }
  };

  return (
    <div 
      id="module-loja-virtual-container"
      className="h-full flex flex-col space-y-5 animate-entrance overflow-y-auto custom-scrollbar p-1"
    >
      {/* HEADER PRINCIPAL UNIFICADO */}
      <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-500/20 shadow-sm">
            <ShoppingBag size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Loja Virtual & Retaguarda Comercial</h2>
              <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                E-Commerce
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Gestão comercial de produtos, controle rigoroso de estoque e acompanhamento de pedidos de membros.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {produtos.length > 0 && (
            <button
              type="button"
              onClick={handleLimparModelosTeste}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-800 transition-all cursor-pointer shadow-sm"
              title="Remover modelos de teste e garantir catálogo limpo para cadastros oficiais"
            >
              <Trash2 size={14} /> {produtos.some(isProdutoExemplo) ? "Limpar Produtos de Exemplo" : "Zerar Catálogo"}
            </button>
          )}

          <Button 
            onClick={handleOpenNewProduct} 
            variant="primary"
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus size={16} /> Novo Produto
          </Button>
        </div>
      </div>

      {/* METRIC CARDS RESUMO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Faturamento Confirmado</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              R$ {metricas.totalVendas.toFixed(2)}
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">Pedidos com pagamento confirmado</span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
            <DollarSign size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total de Pedidos</p>
            <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {metricas.totalPedidos}
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">{metricas.pedidosPendentes} aguardando separação</span>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-xl">
            <Package size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Prontos para Retirada</p>
            <h3 className="text-2xl font-black text-amber-500 mt-1">
              {metricas.pedidosProntos}
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">Aguardando comprador na igreja</span>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl">
            <Store size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Alerta de Estoque</p>
            <h3 className={`text-2xl font-black mt-1 ${metricas.produtosEstoqueBaixo > 0 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-200'}`}>
              {metricas.produtosEstoqueBaixo}
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">Produtos no limite mínimo</span>
          </div>
          <div className={`p-3 rounded-xl ${metricas.produtosEstoqueBaixo > 0 ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* ABAS PADRONIZADAS DO DESIGN SYSTEM COM ROLAGEM HORIZONTAL */}
      <div className="bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1.5 shrink-0">
        <button
          onClick={() => { setActiveTab('recebimento'); setStatusFilter('todos'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
            activeTab === 'recebimento'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <ClipboardCheck size={15} /> Recebimento & Separação
          {metricas.pedidosPendentes > 0 && (
            <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
              {metricas.pedidosPendentes}
            </span>
          )}
        </button>

        <button
          onClick={() => { setActiveTab('produtos'); setStatusFilter('todos'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
            activeTab === 'produtos'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <Tag size={15} /> Produtos & Catálogo ({produtos.length})
        </button>

        <button
          onClick={() => { setActiveTab('pedidos'); setStatusFilter('todos'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
            activeTab === 'pedidos'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <Package size={15} /> Pedidos em Aberto ({pedidos.length})
        </button>

        <button
          onClick={() => { setActiveTab('estoque'); setStatusFilter('todos'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
            activeTab === 'estoque'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <Layers size={15} /> Controle de Estoque & Movimentações
        </button>

        <button
          onClick={() => { setActiveTab('historico'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
            activeTab === 'historico'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <Calendar size={15} /> Histórico de Pedidos
        </button>

        <button
          onClick={() => { setActiveTab('financeiro'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
            activeTab === 'financeiro'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
          }`}
        >
          <Landmark size={15} /> Controle Financeiro & Caixa da Loja
          {transferencias.length > 0 && (
            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {transferencias.length} repasses
            </span>
          )}
        </button>

        <button
          onClick={() => { setActiveTab('metricas'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
            activeTab === 'metricas'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <BarChart3 size={15} /> Relatório Comercial & Lucratividade
        </button>
      </div>

      {/* ÁREA 0: RECEBIMENTO & SEPARAÇÃO OPERACIONAL */}
      {activeTab === 'recebimento' && (
        <LojaRecebimentoArea
          pedidos={pedidos}
          onOpenTratamento={(ped) => {
            setSelectedOrder(ped);
            setIsOrderDetailsOpen(true);
          }}
          onQuickUpdateStatus={handleUpdateOrderStatus}
          onCancelOrder={(ped) => setOrderToCancel(ped)}
          onDeleteOrder={(ped) => setOrderToDelete(ped)}
          churchName={db?.igreja?.nome || 'Igreja'}
        />
      )}

      {/* ÁREA DE HISTÓRICO DE PEDIDOS */}
      {activeTab === 'historico' && (
        <LojaHistoricoPedidos
          pedidos={pedidos}
          onOpenTratamento={(ped) => {
            setSelectedOrder(ped);
            setIsOrderDetailsOpen(true);
          }}
          onViewFiscalDoc={(ped, tipo) => setQuickFiscalDoc({ order: ped, tipo })}
          onCancelOrder={(ped) => setOrderToCancel(ped)}
          onDeleteOrder={(ped) => setOrderToDelete(ped)}
          churchName={db?.igreja?.nome || 'Igreja'}
        />
      )}

      {/* FILTROS E PESQUISA (PARA PRODUTOS, PEDIDOS E ESTOQUE) */}
      {(activeTab === 'produtos' || activeTab === 'pedidos' || activeTab === 'estoque') && (
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={activeTab === 'produtos' ? "Buscar por nome do produto, SKU ou categoria..." : "Buscar por número do pedido, nome do cliente ou WhatsApp..."}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {activeTab === 'produtos' && (
              <select
                value={selectedCategoria}
                onChange={e => setSelectedCategoria(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
              >
                <option value="todas">Todas as Categorias</option>
                {CATEGORIAS_LOJA.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
            >
              {activeTab === 'produtos' ? (
                <>
                  <option value="todos">Todos os Status</option>
                  <option value="ativos">Apenas Ativos</option>
                  <option value="inativos">Inativos</option>
                  <option value="baixo_estoque">Estoque Baixo</option>
                </>
              ) : activeTab === 'pedidos' ? (
                <>
                  <option value="todos">Todos os Pedidos</option>
                  <option value="novo">Novos / Pendentes</option>
                  <option value="separacao">Em Separação</option>
                  <option value="pronto_retirada">Prontos p/ Retirada</option>
                  <option value="entregue">Entregues / Concluídos</option>
                  <option value="cancelado">Cancelados</option>
                </>
              ) : (
                <option value="todos">Todas as Movimentações</option>
              )}
            </select>
          </div>
        </div>
      )}

      {/* ABA 1: PRODUTOS & CATÁLOGO */}
      {activeTab === 'produtos' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Produto / SKU</th>
                  <th className="py-3.5 px-4">Categoria</th>
                  <th className="py-3.5 px-4">Preço Custo</th>
                  <th className="py-3.5 px-4">Preço Venda</th>
                  <th className="py-3.5 px-4">Margem</th>
                  <th className="py-3.5 px-4">Estoque Atual</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {produtos.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="max-w-md mx-auto flex flex-col items-center justify-center p-6 text-center space-y-3">
                        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shadow-inner">
                          <ShoppingBag size={32} />
                        </div>
                        <h4 className="text-base font-extrabold text-slate-800 dark:text-white">Nenhum Produto no Catálogo</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          A loja da igreja está pronta para operar. Apenas os produtos cadastrados pelos usuários serão exibidos nesta versão. Comece adicionando seus itens oficiais (Bíblias, Harpas, Livros ou Artigos).
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                          <button
                            type="button"
                            onClick={handleOpenNewProduct}
                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                          >
                            <Plus size={16} /> Cadastrar Primeiro Produto
                          </button>
                          {user?.nivel === 'master' && (
                            <button
                              type="button"
                              onClick={() => {
                                localStorage.removeItem('gipp_loja_exemplos_limpos');
                                try {
                                  const raw = localStorage.getItem('gipp_loja_produtos_deleted_ids');
                                  if (raw) {
                                    const del = JSON.parse(raw).filter((id: string) => !EXEMPLO_PRODUTO_IDS.includes(id));
                                    localStorage.setItem('gipp_loja_produtos_deleted_ids', JSON.stringify(del));
                                  }
                                } catch (e) {}
                                syncProdutos(PRODUTOS_LOJA_INICIAIS);
                                addToast("Modelos de demonstração CPAD carregados para testes com sucesso!", "info");
                              }}
                              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-300 dark:border-slate-700 cursor-pointer"
                              title="Carregar itens modelo para testes de desenvolvimento"
                            >
                              <Sparkles size={14} className="text-amber-500" /> Carregar Modelos de Demonstração
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : produtosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <ShoppingBag size={36} className="mx-auto mb-2 opacity-40" />
                      Nenhum produto encontrado com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  produtosFiltrados.map((prod) => {
                    const lucro = (prod.preco_venda || 0) - (prod.preco_custo || 0);
                    const margemPct = prod.preco_custo > 0 ? (lucro / prod.preco_custo) * 100 : 100;
                    const isEstoqueBaixo = prod.estoque_atual <= prod.estoque_minimo;

                    return (
                      <tr key={prod.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={prod.foto || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=150&q=80'} 
                              alt={prod.nome} 
                              className="w-11 h-11 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100"
                            />
                            <div>
                              <div className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                                {prod.nome}
                                {prod.destaque && (
                                  <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">Destaque</span>
                                )}
                              </div>
                              <span className="text-[11px] font-mono text-slate-400">SKU: {prod.sku || '-'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                            {prod.categoria}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          R$ {(prod.preco_custo || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          R$ {(prod.preco_venda || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded">
                            +{margemPct.toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold font-mono px-2 py-1 rounded-lg text-xs ${
                              isEstoqueBaixo 
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400' 
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                            }`}>
                              {prod.estoque_atual} un.
                            </span>
                            {isEstoqueBaixo && (
                              <span title={`Mínimo: ${prod.estoque_minimo} un.`} className="text-rose-500">
                                <AlertTriangle size={14} />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleProductStatus(prod)}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                              prod.ativo 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-200' 
                                : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-300'
                            }`}
                          >
                            {prod.ativo ? 'Ativo na Loja' : 'Inativo'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenStockModal(prod)}
                              title="Ajustar / Lançar Estoque"
                              className="p-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                            >
                              <Layers size={14} />
                            </button>
                            <button
                              onClick={() => handleEditProduct(prod)}
                              title="Editar Produto"
                              className="p-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              title="Excluir Produto"
                              className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 2: PEDIDOS & VENDAS */}
      {activeTab === 'pedidos' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Pedido / Data</th>
                  <th className="py-3.5 px-4">Comprador</th>
                  <th className="py-3.5 px-4">Itens</th>
                  <th className="py-3.5 px-4">Valor Total</th>
                  <th className="py-3.5 px-4">Pagamento</th>
                  <th className="py-3.5 px-4">Status Entrega</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {pedidosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Package size={36} className="mx-auto mb-2 opacity-40" />
                      Nenhum pedido de compra recebido até o momento.
                    </td>
                  </tr>
                ) : (
                  pedidosFiltrados.map((ped) => {
                    const totalItens = (ped.itens || []).reduce((acc, item) => acc + item.quantidade, 0);

                    return (
                      <tr key={ped.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800 dark:text-white font-mono">
                            #{ped.numero_pedido}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {new Date(ped.data_pedido).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800 dark:text-white">
                            {ped.cliente_nome}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <Phone size={11} /> {ped.cliente_telefone || 'Sem telefone'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                            {totalItens} {totalItens === 1 ? 'item' : 'itens'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          R$ {ped.valor_total.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              {ped.forma_pagamento === 'pix' ? 'Pix' : ped.forma_pagamento === 'cartao_retirada' ? 'Cartão na Retirada' : 'Dinheiro na Retirada'}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              ped.status_pagamento === 'pago' 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' 
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                            }`}>
                              {ped.status_pagamento === 'pago' ? 'Pago' : 'Pendente'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] inline-flex items-center gap-1.5 ${
                            ped.status_entrega === 'entregue' 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : ped.status_entrega === 'pronto_retirada'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                              : ped.status_entrega === 'separacao'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300'
                          }`}>
                            {ped.status_entrega === 'entregue' && <CheckCircle size={12} />}
                            {ped.status_entrega === 'pronto_retirada' && <Store size={12} />}
                            {ped.status_entrega === 'separacao' && <Package size={12} />}
                            {ped.status_entrega === 'novo' && <Clock size={12} />}
                            {ped.status_entrega === 'entregue' ? 'Entregue' : 
                             ped.status_entrega === 'pronto_retirada' ? 'Pronto p/ Retirada' :
                             ped.status_entrega === 'separacao' ? 'Em Separação' : 'Novo Pedido'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setQuickFiscalDoc({ order: ped, tipo: 'nota_fiscal' })}
                              title="Emitir / Imprimir Nota Fiscal (DAV)"
                              className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors border border-indigo-200 cursor-pointer"
                            >
                              <FileText size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setQuickFiscalDoc({ order: ped, tipo: 'pedido_compra' })}
                              title="Emitir / Imprimir Pedido de Compra Oficial"
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-300 dark:border-slate-700 cursor-pointer"
                            >
                              <Printer size={14} />
                            </button>
                            <button
                              onClick={() => handleContactBuyerWhatsApp(ped)}
                              title="Avisar no WhatsApp"
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors border border-emerald-200 cursor-pointer"
                            >
                              <MessageCircle size={14} />
                            </button>
                            <button
                              onClick={() => { setSelectedOrder(ped); setIsOrderDetailsOpen(true); }}
                              title="Ver Detalhes & Gerenciar Pedido"
                              className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold text-xs rounded-lg transition-colors border border-indigo-200 flex items-center gap-1 cursor-pointer"
                            >
                              <Eye size={13} /> Gerenciar
                            </button>
                            {ped.status_entrega !== 'cancelado' && (
                              <button
                                onClick={() => setOrderToCancel(ped)}
                                title="Cancelar Pedido & Estornar Estoque"
                                className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors border border-amber-200 cursor-pointer"
                              >
                                <XCircle size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => setOrderToDelete(ped)}
                              title="Excluir Pedido Definitivamente (Motor de Exclusão)"
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors border border-rose-200 cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 3: CONTROLE DE ESTOQUE & MOVIMENTAÇÕES */}
      {activeTab === 'estoque' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
              <Layers size={18} className="text-indigo-600" />
              Histórico de Entradas, Saídas e Ajustes de Estoque
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase border-b border-slate-200/80 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-3">Data / Hora</th>
                    <th className="py-3 px-3">Produto</th>
                    <th className="py-3 px-3">Tipo</th>
                    <th className="py-3 px-3">Qtd.</th>
                    <th className="py-3 px-3">Saldo Anterior</th>
                    <th className="py-3 px-3">Novo Saldo</th>
                    <th className="py-3 px-3">Motivo / Operação</th>
                    <th className="py-3 px-3">Responsável</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {movimentacoes.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Nenhuma movimentação de estoque registrada.
                      </td>
                    </tr>
                  ) : (
                    movimentacoes.map((mov) => (
                      <tr key={mov.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 text-slate-400">
                          {new Date(mov.data).toLocaleString('pt-BR')}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-white">
                          {mov.produto_nome}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            mov.tipo === 'entrada' ? 'bg-emerald-100 text-emerald-800' :
                            mov.tipo === 'saida_venda' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {mov.tipo === 'entrada' ? 'Entrada / Compra' :
                             mov.tipo === 'saida_venda' ? 'Venda Portal' : 'Ajuste Manual'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold font-mono">
                          {mov.tipo === 'entrada' ? `+${mov.quantidade}` : `-${mov.quantidade}`} un.
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{mov.estoque_anterior} un.</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">{mov.estoque_posterior} un.</td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{mov.motivo}</td>
                        <td className="py-2.5 px-3 text-slate-500">{mov.responsavel}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: RELATÓRIO COMERCIAL & LUCRATIVIDADE */}
      {activeTab === 'metricas' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket Médio de Venda</span>
              <h3 className="text-3xl font-black text-indigo-600 mt-2">
                R$ {metricas.ticketMedio.toFixed(2)}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Valor médio gasto por pedido de membro</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Itens Totais em Inventário</span>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-2">
                {metricas.totalItensEstoque} un.
              </h3>
              <p className="text-xs text-slate-500 mt-1">Soma de todas as unidades disponíveis</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Local Oficial de Retirada</span>
              <div className="flex items-center gap-2 mt-2">
                <Store size={22} className="text-amber-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">
                    {db?.igreja?.nome || 'Sede da Igreja'}
                  </h4>
                  <p className="text-[11px] text-slate-500">{db?.igreja?.cidade || 'Balcão da Loja / Secretaria'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-600" />
              Produtos Cadastrados e Rentabilidade Comercial
            </h3>

            <div className="space-y-3">
              {produtos.map(p => {
                const lucro = (p.preco_venda || 0) - (p.preco_custo || 0);
                const margem = p.preco_custo > 0 ? (lucro / p.preco_custo) * 100 : 100;

                return (
                  <div key={p.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img src={p.foto} alt={p.nome} className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">{p.nome}</h4>
                        <span className="text-[11px] text-slate-400">{p.categoria} • Estoque: {p.estoque_atual} un.</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-right">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Custo / Venda</span>
                        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                          R$ {p.preco_custo.toFixed(2)} / R$ {p.preco_venda.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Lucro Bruto</span>
                        <span className="text-xs font-mono font-bold text-emerald-600">
                          +R$ {lucro.toFixed(2)} ({margem.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ÁREA 6: CONTROLE FINANCEIRO, HISTÓRICO COMPLETO & REPASSE DE CAIXA PARA A IGREJA */}
      {activeTab === 'financeiro' && (
        <LojaFinanceiroCaixa
          pedidos={pedidos}
          transferencias={transferencias}
          igrejaData={db?.igreja}
          user={user}
          centrosCusto={db?.centro_custo || []}
          congregacoes={db?.congregacoes || []}
          onEfetuarTransferencia={handleEfetuarTransferencia}
          onOpenOrderDetails={(ped) => {
            setSelectedOrder(ped);
            setIsOrderDetailsOpen(true);
          }}
        />
      )}

      {/* MODAL: CADASTRO / EDIÇÃO DE PRODUTO */}
      {isProductModalOpen && createPortal(
        <InteractiveWindow
          id="loja_virtual_produto_modal"
          title={editingProduct ? `Editar: ${formData.nome || 'Produto'}` : 'Cadastrar Novo Produto na Loja'}
          subtitle="Catálogo & E-Commerce • Loja Virtual"
          icon={ShoppingBag}
          headerBg="from-indigo-600 via-indigo-700 to-slate-900"
          onClose={() => setIsProductModalOpen(false)}
          defaultWidth={780}
          defaultHeight={700}
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <Button
                type="button"
                onClick={handleSaveProduct}
                variant="primary"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-sm cursor-pointer"
              >
                Salvar Produto
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome || ''}
                  onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Bíblia de Estudo Pentecostal, Camiseta do Congresso..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Código SKU / Barras
                </label>
                <input
                  type="text"
                  value={formData.sku || ''}
                  onChange={e => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                  placeholder="Ex: BIB-001"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Categoria *
                </label>
                <select
                  value={formData.categoria || CATEGORIAS_LOJA[0]}
                  onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {CATEGORIAS_LOJA.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Preço de Custo (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.preco_custo || 0}
                  onChange={e => setFormData({ ...formData, preco_custo: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Preço de Venda (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.preco_venda || 0}
                  onChange={e => setFormData({ ...formData, preco_venda: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/20 dark:bg-indigo-950/20 text-sm font-mono font-bold text-indigo-700 dark:text-indigo-400 outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Quantidade em Estoque Inicial
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.estoque_atual || 0}
                  onChange={e => setFormData({ ...formData, estoque_atual: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Estoque Mínimo de Alerta
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.estoque_minimo || 5}
                  onChange={e => setFormData({ ...formData, estoque_minimo: parseInt(e.target.value) || 1 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Foto do Produto
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={formData.foto || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=150&q=80'}
                    alt="Pré-visualização"
                    className="w-16 h-16 object-cover rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100"
                  />
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.foto || ''}
                      onChange={e => setFormData({ ...formData, foto: e.target.value })}
                      placeholder="Ou cole a URL da imagem (https://...)"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição Detalhada do Produto
                </label>
                <textarea
                  rows={3}
                  value={formData.descricao || ''}
                  onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Informe detalhes, medidas, acabamento e características da peça ou livro..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex items-center gap-6 md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.ativo}
                    onChange={e => setFormData({ ...formData, ativo: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  Ativo na Loja (Visível para os Membros)
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.destaque}
                    onChange={e => setFormData({ ...formData, destaque: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  Destacar na Página Inicial da Loja
                </label>
              </div>
            </div>
          </div>
        </InteractiveWindow>,
        document.body
      )}

      {/* MODAL: AJUSTE / MOVIMENTAÇÃO DE ESTOQUE */}
      {isStockModalOpen && selectedStockProduct && createPortal(
        <InteractiveWindow
          id="loja_virtual_estoque_modal"
          title={`Movimentação de Estoque: ${selectedStockProduct.nome}`}
          subtitle="Ajustes & Lançamentos • Loja Virtual"
          icon={Layers}
          headerBg="from-indigo-600 via-indigo-700 to-slate-900"
          onClose={() => setIsStockModalOpen(false)}
          defaultWidth={560}
          defaultHeight={540}
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setIsStockModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <Button
                type="button"
                onClick={handleConfirmStockMovement}
                variant="primary"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-xl"
              >
                Confirmar Lançamento
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              <h4 className="font-bold text-xs text-slate-800 dark:text-white">{selectedStockProduct.nome}</h4>
              <p className="text-[11px] text-slate-500">Estoque Atual: <strong>{selectedStockProduct.estoque_atual} un.</strong></p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Operação
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStockMovementType('entrada')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      stockMovementType === 'entrada'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    + Entrada / Compra
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockMovementType('ajuste_manual')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      stockMovementType === 'ajuste_manual'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    - Saída / Ajuste
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Quantidade a {stockMovementType === 'entrada' ? 'Adicionar' : 'Subtrair'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={stockMovementQty}
                  onChange={e => setStockMovementQty(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Motivo / Observação
                </label>
                <input
                  type="text"
                  value={stockMovementMotivo}
                  onChange={e => setStockMovementMotivo(e.target.value)}
                  placeholder="Ex: Chegada de remessa CPAD, contagem de inventário..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>
            </div>
          </div>
        </InteractiveWindow>,
        document.body
      )}

      {/* MODAL COMPLETO DE TRATAMENTO, CONFERÊNCIA, SEPARAÇÃO E AUDITORIA DO PEDIDO */}
      {isOrderDetailsOpen && selectedOrder && (
        <LojaTratamentoModal
          order={selectedOrder}
          onClose={() => setIsOrderDetailsOpen(false)}
          onSaveOrder={handleSaveTratamento}
          onDeleteOrder={(order) => {
            setIsOrderDetailsOpen(false);
            setOrderToDelete(order);
          }}
          churchName={db?.igreja?.nome || 'Igreja'}
          churchPhone={db?.igreja?.telefone || ''}
          currentUser={user}
          igreja={db?.igreja}
        />
      )}

      {/* MOTOR DE EXCLUSÃO DE PEDIDO DEFINITIVO */}
      <ConfirmModal
        isOpen={!!orderToDelete}
        onClose={() => setOrderToDelete(null)}
        onCancel={() => setOrderToDelete(null)}
        onConfirm={() => {
          if (orderToDelete) handleDeleteOrderDirect(orderToDelete);
        }}
        title="Excluir Pedido Definitivamente"
        message={`Deseja realmente EXCLUIR DEFINITIVAMENTE o Pedido #${orderToDelete?.numero_pedido} do cliente ${orderToDelete?.cliente_nome} (Valor: R$ ${orderToDelete?.valor_total.toFixed(2)})? Esta operação usa o motor de exclusão do sistema e não poderá ser desfeita.`}
        confirmText="Sim, Excluir Pedido"
        cancelText="Cancelar"
        variant="danger"
      />

      {/* CONFIRMAÇÃO DE CANCELAMENTO DE PEDIDO ADMINISTRATIVO */}
      <ConfirmModal
        isOpen={!!orderToCancel}
        onClose={() => setOrderToCancel(null)}
        onCancel={() => setOrderToCancel(null)}
        onConfirm={() => {
          if (orderToCancel) handleCancelOrderDirect(orderToCancel);
        }}
        title="Cancelar Pedido & Estornar Estoque"
        message={`Deseja cancelar o Pedido #${orderToCancel?.numero_pedido} do cliente ${orderToCancel?.cliente_nome}? Todos os produtos serão automaticamente devolvidos e somados de volta ao estoque da loja.`}
        confirmText="Sim, Cancelar e Estornar"
        cancelText="Voltar"
        variant="danger"
      />

      {/* MOTOR DE EMISSÃO DE NOTA FISCAL / PEDIDO DE COMPRA ADMINISTRATIVO */}
      {quickFiscalDoc && (
        <LojaDocumentoFiscalModal
          pedido={quickFiscalDoc.order}
          tipoDocumento={quickFiscalDoc.tipo}
          igreja={db?.igreja}
          onClose={() => setQuickFiscalDoc(null)}
          onUpdateStatus={(updatedPed) => {
            setDbState((prev: any) => {
              const current = prev?.loja_pedidos || [];
              const updatedList = current.map((p: any) => p.id === updatedPed.id ? updatedPed : p);
              return { ...prev, loja_pedidos: updatedList };
            });
          }}
        />
      )}
    </div>
  );
}

import React, { useState, useMemo, useContext, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChurchContext } from '../context/ChurchContext';
import { 
  ShoppingBag, Search, Plus, Minus, Trash2, CheckCircle2, CheckCircle, ArrowRight, ArrowLeft,
  Store, ShieldCheck, Clock, QrCode, Copy, Check, ChevronRight, 
  Tag, Filter, Heart, MessageCircle, AlertCircle, Printer, X, Sparkles,
  Package, PackageCheck, Bell, Truck, CheckSquare, ChevronDown, ChevronUp, MapPin, User, Info, XCircle, FileText,
  Maximize2, Minimize2, Layers
} from 'lucide-react';
import { 
  ProdutoLoja, PedidoLoja, ItemPedidoLoja, MovimentacaoEstoque, 
  CATEGORIAS_LOJA, PRODUTOS_LOJA_INICIAIS,
  HistoricoEventoPedido, isProdutoExemplo
} from '../data/lojaVirtualData';
import { Button } from '../utils/sharedHelpers';
import LojaMembroPedidoCard from './LojaMembroPedidoCard';
import { ConfirmModal } from './ConfirmModal';
import LojaDocumentoFiscalModal from './LojaDocumentoFiscalModal';
import { InteractiveWindow } from './InteractiveWindow';

interface PortalLojaMembroProps {
  user?: any;
  db?: any;
  setView?: (view: string) => void;
  onClose?: () => void;
}

interface CartItem extends ItemPedidoLoja {
  estoque_maximo: number;
}

export default function PortalLojaMembro({ user, db, setView, onClose }: PortalLojaMembroProps) {
  const { setDbState, addToast, dbFirestore, appId, setDoc, doc } = useContext(ChurchContext);

  // States
  const [activeTab, setActiveTab] = useState<'vitrine' | 'pedidos'>('vitrine');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('todas');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'todos' | 'andamento' | 'pronto' | 'concluido'>('todos');
  const [viewAllOrdersScope, setViewAllOrdersScope] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showMobileCheckoutItems, setShowMobileCheckoutItems] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOrderReceipt, setSelectedOrderReceipt] = useState<PedidoLoja | null>(null);
  const [selectedFiscalDoc, setSelectedFiscalDoc] = useState<{ pedido: PedidoLoja; tipo: 'nota_fiscal' | 'pedido_compra' } | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [expandedOrderHistoryId, setExpandedOrderHistoryId] = useState<string | null>(null);
  const [selectedOrderTracking, setSelectedOrderTracking] = useState<PedidoLoja | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<PedidoLoja | null>(null);
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);
  const [isHubMaximized, setIsHubMaximized] = useState(false);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (setView) {
      setView('portal_home');
    }
  };

  // Sincronização e restauração imediata do histórico de pedidos locais
  useEffect(() => {
    try {
      const localStr = localStorage.getItem('gipp_loja_pedidos');
      if (localStr) {
        const localList = JSON.parse(localStr);
        if (Array.isArray(localList) && localList.length > 0) {
          setDbState((prev: any) => {
            const current = prev?.loja_pedidos || [];
            const map = new Map();
            localList.forEach((item: any) => map.set(item.id, item));
            current.forEach((item: any) => map.set(item.id, item));
            return { ...prev, loja_pedidos: Array.from(map.values()) };
          });
        }
      }
    } catch (e) {
      console.warn("Erro ao restaurar gipp_loja_pedidos:", e);
    }
  }, []);

  // Checkout Form State
  const [checkoutData, setCheckoutData] = useState({
    nome: user?.nome || '',
    telefone: user?.telefone || user?.whatsapp || '',
    email: user?.email || '',
    forma_pagamento: 'pix' as 'pix' | 'cartao_retirada' | 'dinheiro_retirada',
    local_retirada: 'igreja_sede' as 'igreja_sede' | 'a_combinar',
    observacoes: ''
  });

  // Current Products - Apenas produtos reais do banco cadastrados pelos usuários
  const produtos: ProdutoLoja[] = useMemo(() => {
    const list = db?.loja_produtos && Array.isArray(db.loja_produtos)
      ? db.loja_produtos
      : [];
    const exemplosLimpos = localStorage.getItem('gipp_loja_exemplos_limpos') === 'true';
    const hasReal = list.some((p: any) => !isProdutoExemplo(p));
    const filteredList = (exemplosLimpos || hasReal) ? list.filter((p: any) => !isProdutoExemplo(p)) : list;
    // Only active products in the member portal
    return filteredList.filter((p: ProdutoLoja) => p.ativo);
  }, [db?.loja_produtos]);

  // Current Orders for this user (Garantia de histórico mantido e visível)
  const meusPedidos: PedidoLoja[] = useMemo(() => {
    const list: PedidoLoja[] = (db?.loja_pedidos && Array.isArray(db.loja_pedidos)) ? db.loja_pedidos : [];
    if (list.length === 0) return [];

    if (viewAllOrdersScope) {
      return list;
    }

    let myLocalOrderIds: string[] = [];
    try {
      const raw = localStorage.getItem('gipp_meus_pedidos_ids');
      if (raw) myLocalOrderIds = JSON.parse(raw);
    } catch (e) {}

    const clean = (s: any) => String(s || '').toLowerCase().trim();
    const cleanDigits = (s: any) => String(s || '').replace(/\D/g, '');

    const userNome = clean(user?.nome || user?.usuario || '');
    const userEmail = clean(user?.email);
    const userTel = cleanDigits(user?.telefone || user?.whatsapp || '');

    const filtered = list.filter((p: PedidoLoja) => {
      // 1. Pedido realizado neste dispositivo/sessão
      if (myLocalOrderIds.includes(p.id)) return true;
      // 2. ID do membro
      if (user?.id && (p.cliente_id === user.id || p.cliente_id === `membro-${user.id}`)) return true;
      // 3. E-mail do membro
      if (userEmail && p.cliente_email && clean(p.cliente_email) === userEmail) return true;
      // 4. Telefone ou WhatsApp
      if (userTel && p.cliente_telefone && cleanDigits(p.cliente_telefone) === userTel) return true;
      // 5. Nome do membro
      if (userNome && p.cliente_nome) {
        const pedNome = clean(p.cliente_nome);
        if (pedNome === userNome) return true;
        if (userNome.length >= 3 && pedNome.includes(userNome)) return true;
        if (pedNome.length >= 3 && userNome.includes(pedNome)) return true;
      }
      return false;
    });

    // Se houver pedidos no banco mas o filtro restrito der 0 (ex: administrador testando o portal ou visitante),
    // exibe todos os pedidos para que as informações nunca desapareçam nem fiquem inacessíveis
    if (filtered.length === 0 && list.length > 0) {
      return list;
    }

    return filtered;
  }, [db?.loja_pedidos, user, viewAllOrdersScope]);

  // Notifications and statuses for the member
  const pedidosProntosParaRetirada = useMemo(() => {
    return meusPedidos.filter(p => p.status_entrega === 'pronto_retirada');
  }, [meusPedidos]);

  const pedidosEmAndamento = useMemo(() => {
    return meusPedidos.filter(p => p.status_entrega !== 'entregue' && p.status_entrega !== 'cancelado');
  }, [meusPedidos]);

  // Filtered orders for member tabs
  const pedidosFiltrados = useMemo(() => {
    if (orderStatusFilter === 'pronto') {
      return meusPedidos.filter(p => p.status_entrega === 'pronto_retirada');
    }
    if (orderStatusFilter === 'andamento') {
      return meusPedidos.filter(p => p.status_entrega !== 'entregue' && p.status_entrega !== 'cancelado');
    }
    if (orderStatusFilter === 'concluido') {
      return meusPedidos.filter(p => p.status_entrega === 'entregue' || p.status_entrega === 'cancelado');
    }
    return meusPedidos;
  }, [meusPedidos, orderStatusFilter]);

  // Filtered products
  const produtosFiltrados = useMemo(() => {
    return produtos.filter(p => {
      const matchSearch = (p.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.descricao || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.categoria || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategoria = selectedCategoria === 'todas' || p.categoria === selectedCategoria;
      return matchSearch && matchCategoria;
    });
  }, [produtos, searchTerm, selectedCategoria]);

  // Cart totals
  const totalCartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantidade, 0);
  }, [cart]);

  const totalCartValue = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.subtotal, 0);
  }, [cart]);

  // Cart operations
  const handleAddToCart = (prod: ProdutoLoja) => {
    if (prod.estoque_atual <= 0) {
      addToast("Produto temporariamente esgotado no estoque.", "warning");
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.produto_id === prod.id);
      if (existing) {
        if (existing.quantidade >= prod.estoque_atual) {
          addToast(`Quantidade máxima em estoque atingida (${prod.estoque_atual} un.).`, "warning");
          return prev;
        }
        return prev.map(item => item.produto_id === prod.id ? {
          ...item,
          quantidade: item.quantidade + 1,
          subtotal: (item.quantidade + 1) * item.preco_unitario
        } : item);
      } else {
        return [...prev, {
          produto_id: prod.id,
          nome: prod.nome,
          preco_unitario: prod.preco_venda,
          quantidade: 1,
          subtotal: prod.preco_venda,
          foto: prod.foto,
          estoque_maximo: prod.estoque_atual
        }];
      }
    });

    addToast(`"${prod.nome}" adicionado à sacola!`, "success");
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.produto_id === productId) {
          const newQty = item.quantidade + delta;
          if (newQty <= 0) return null;
          if (newQty > item.estoque_maximo) {
            addToast(`Estoque máximo disponível: ${item.estoque_maximo} un.`, "warning");
            return item;
          }
          return {
            ...item,
            quantidade: newQty,
            subtotal: newQty * item.preco_unitario
          };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.produto_id !== productId));
    addToast("Item removido da sacola.", "info");
  };

  // Process Checkout
  const handleConfirmCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      addToast("Sua sacola de compras está vazia.", "warning");
      return;
    }

    if (!checkoutData.nome || !checkoutData.telefone) {
      addToast("Informe seu nome completo e telefone WhatsApp para contato.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderNumber = `LV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const churchName = db?.igreja?.nome || 'Igreja Local';
    const localRetiradaTexto = checkoutData.local_retirada === 'igreja_sede'
      ? `${churchName} (${db?.igreja?.endereco || 'Secretaria da Igreja'})`
      : 'A combinar com o responsável da Loja / Congregação';

    const novoPedido: PedidoLoja = {
      id: `ped-${Date.now()}`,
      numero_pedido: orderNumber,
      cliente_id: user?.id || 'membro-anon',
      cliente_nome: checkoutData.nome,
      cliente_telefone: checkoutData.telefone,
      cliente_email: checkoutData.email || user?.email,
      cliente_cpf: user?.cpf || '',
      tipo_cliente: user?.tipo === 'membro' ? 'membro' : 'visitante',
      itens: cart.map(item => ({
        produto_id: item.produto_id,
        nome: item.nome,
        preco_unitario: item.preco_unitario,
        quantidade: item.quantidade,
        subtotal: item.subtotal,
        foto: item.foto
      })),
      valor_total: totalCartValue,
      forma_pagamento: checkoutData.forma_pagamento,
      status_pagamento: 'pendente',
      status_entrega: 'novo',
      local_retirada: localRetiradaTexto,
      observacoes: checkoutData.observacoes || undefined,
      data_pedido: new Date().toISOString()
    };

    // Baixa automática no estoque dos produtos
    const currentProducts: ProdutoLoja[] = db?.loja_produtos && Array.isArray(db.loja_produtos)
      ? db.loja_produtos
      : [];

    const novasMovimentacoes: MovimentacaoEstoque[] = [];
    const produtosAtualizados = currentProducts.map(p => {
      const itemCart = cart.find(c => c.produto_id === p.id);
      if (itemCart) {
        const novoEstoque = Math.max(0, p.estoque_atual - itemCart.quantidade);
        novasMovimentacoes.push({
          id: `mov-venda-${Date.now()}-${p.id}`,
          produto_id: p.id,
          produto_nome: p.nome,
          tipo: 'saida_venda',
          quantidade: itemCart.quantidade,
          estoque_anterior: p.estoque_atual,
          estoque_posterior: novoEstoque,
          motivo: `Venda Portal - Pedido #${orderNumber}`,
          responsavel: checkoutData.nome,
          data: new Date().toISOString()
        });
        return { ...p, estoque_atual: novoEstoque };
      }
      return p;
    });

    const listaPedidosAtual = db?.loja_pedidos && Array.isArray(db.loja_pedidos) ? db.loja_pedidos : [];
    const listaMovimentacoesAtual = db?.loja_movimentacoes && Array.isArray(db.loja_movimentacoes) ? db.loja_movimentacoes : [];

    const novosPedidos = [novoPedido, ...listaPedidosAtual];
    const novasMovs = [...novasMovimentacoes, ...listaMovimentacoesAtual];

    // Atualiza estado global e armazenamento
    setDbState((prev: any) => ({
      ...prev,
      loja_produtos: produtosAtualizados,
      loja_pedidos: novosPedidos,
      loja_movimentacoes: novasMovs
    }));

    try {
      // Salva o ID deste pedido localmente para que esteja sempre visível no portal do membro neste navegador
      const rawIds = localStorage.getItem('gipp_meus_pedidos_ids');
      const ids: string[] = rawIds ? JSON.parse(rawIds) : [];
      if (!ids.includes(novoPedido.id)) {
        ids.unshift(novoPedido.id);
        localStorage.setItem('gipp_meus_pedidos_ids', JSON.stringify(ids));
      }

      localStorage.setItem('gipp_loja_produtos', JSON.stringify(produtosAtualizados));
      localStorage.setItem('gipp_loja_pedidos', JSON.stringify(novosPedidos));
      localStorage.setItem('gipp_loja_movimentacoes', JSON.stringify(novasMovs));

      if (dbFirestore && appId) {
        await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'loja_pedidos', novoPedido.id), novoPedido);
        for (const mov of novasMovimentacoes) {
          await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'loja_movimentacoes', mov.id), mov);
        }
        for (const p of produtosAtualizados) {
          await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'loja_produtos', p.id), p);
        }
      }
    } catch (err) {
      console.warn("Storage sync error:", err);
    }

    // Reset and open receipt
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setSelectedOrderReceipt(novoPedido);
    setActiveTab('pedidos');
    addToast(`Pedido #${orderNumber} gerado com sucesso!`, "success");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPix = () => {
    const pixKey = db?.igreja?.chave_pix || '12.345.678/0001-90';
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
    addToast("Chave Pix copiada para a área de transferência!", "success");
  };

  const handleNotifyChurchWhatsApp = (pedido: PedidoLoja) => {
    const phone = (db?.igreja?.telefone || '').replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá! Paz do Senhor. Sou ${pedido.cliente_nome}.\n` +
      `Acabei de realizar o Pedido #${pedido.numero_pedido} na Loja da Igreja no valor de R$ ${pedido.valor_total.toFixed(2)}.\n` +
      `Forma de Pagamento: ${pedido.forma_pagamento.toUpperCase()}\n` +
      `Local de Retirada Escolhido: ${pedido.local_retirada}.\n` +
      `Segue a confirmação do meu pedido! 🙏`
    );
    window.open(`https://wa.me/55${phone || '11987654321'}?text=${message}`, '_blank');
  };

  // Cancelamento de pedido pelo membro com devolução ao estoque
  const handleConfirmCancelOrder = async () => {
    if (!orderToCancel) return;
    setIsCancellingOrder(true);
    const orderId = orderToCancel.id;
    const orderNumber = orderToCancel.numero_pedido;
    const now = new Date().toISOString();
    const memberName = user?.nome || orderToCancel.cliente_nome || 'Membro';

    try {
      // 1. Estornar produtos ao estoque
      const currentProducts = (db?.loja_produtos && Array.isArray(db.loja_produtos))
        ? db.loja_produtos
        : [];
      
      let updatedProducts = [...currentProducts];
      const newDevolucaoMovs: MovimentacaoEstoque[] = [];

      (orderToCancel.itens || []).forEach(item => {
        const prod = updatedProducts.find(p => p.id === item.produto_id);
        if (prod) {
          const newQty = prod.estoque_atual + item.quantidade;
          updatedProducts = updatedProducts.map(p => p.id === prod.id ? { ...p, estoque_atual: newQty } : p);
          newDevolucaoMovs.push({
            id: `mov-estorno-${Date.now()}-${prod.id}`,
            produto_id: prod.id,
            produto_nome: prod.nome,
            tipo: 'devolucao',
            quantidade: item.quantidade,
            estoque_anterior: prod.estoque_atual,
            estoque_posterior: newQty,
            motivo: `Cancelamento de Pedido #${orderNumber} pelo Portal do Membro`,
            responsavel: memberName,
            data: now
          });
        }
      });

      // 2. Atualizar o pedido para status cancelado com histórico
      const historyEvent: HistoricoEventoPedido = {
        id: `hist-${Date.now()}`,
        status: 'cancelado',
        titulo: 'Pedido Cancelado pelo Membro',
        descricao: `Cancelamento efetuado diretamente pelo comprador via Portal do Membro. Itens estornados ao estoque da loja.`,
        data: now,
        responsavel: memberName
      };

      const currentOrders: PedidoLoja[] = (db?.loja_pedidos && Array.isArray(db.loja_pedidos)) ? db.loja_pedidos : [];
      const updatedOrders = currentOrders.map(p => {
        if (p.id === orderId) {
          return {
            ...p,
            status_entrega: 'cancelado' as const,
            status_pagamento: 'cancelado' as const,
            data_atualizacao: now,
            historico_status: [historyEvent, ...(p.historico_status || [])]
          };
        }
        return p;
      });

      const currentMovs: MovimentacaoEstoque[] = (db?.loja_movimentacoes && Array.isArray(db.loja_movimentacoes)) ? db.loja_movimentacoes : [];
      const updatedMovs = [...newDevolucaoMovs, ...currentMovs];

      // Atualizar estado no dbState
      setDbState((prev: any) => ({
        ...prev,
        loja_produtos: updatedProducts,
        loja_pedidos: updatedOrders,
        loja_movimentacoes: updatedMovs
      }));

      // Sincronizar localStorage e Firestore
      try {
        localStorage.setItem('gipp_loja_produtos', JSON.stringify(updatedProducts));
        localStorage.setItem('gipp_loja_pedidos', JSON.stringify(updatedOrders));
        localStorage.setItem('gipp_loja_movimentacoes', JSON.stringify(updatedMovs));

        if (dbFirestore && appId) {
          const cancelledOrder = updatedOrders.find(p => p.id === orderId);
          if (cancelledOrder) {
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'loja_pedidos', orderId), cancelledOrder);
          }
          for (const mov of newDevolucaoMovs) {
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'loja_movimentacoes', mov.id), mov);
          }
          for (const p of updatedProducts) {
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'loja_produtos', p.id), p);
          }
        }
      } catch (err) {
        console.warn("Storage sync error on member cancel:", err);
      }

      if (selectedOrderReceipt && selectedOrderReceipt.id === orderId) {
        const cancelledOrder = updatedOrders.find(p => p.id === orderId);
        if (cancelledOrder) setSelectedOrderReceipt(cancelledOrder);
      }

      addToast(`Pedido #${orderNumber} cancelado com sucesso. Itens estornados ao estoque.`, "info");
      setOrderToCancel(null);
    } finally {
      setIsCancellingOrder(false);
    }
  };

  return (
    <div 
      id="module-loja-membro-container" 
      className={`w-full bg-slate-100/50 dark:bg-slate-950 flex flex-col font-sans transition-all duration-300 ${
        isHubMaximized 
          ? 'fixed inset-0 z-[99999] w-screen h-screen overflow-y-auto custom-scrollbar bg-slate-100 dark:bg-slate-950' 
          : 'min-h-full h-full relative overflow-y-auto custom-scrollbar'
      }`}
    >
      {/* BARRA SUPERIOR DE CONTROLE E NAVEGAÇÃO DO MÓDULO (SISTEMA INTERATIVO / INDEPENDENTE) */}
      <div className="w-full bg-slate-900/95 border-b border-slate-800/90 px-4 md:px-8 py-3 flex items-center justify-between backdrop-blur-md sticky top-0 z-30 shrink-0 shadow-lg text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold shadow-inner shrink-0">
            <ShoppingBag size={18} />
          </div>
          <div>
            <h2 className="font-extrabold text-xs sm:text-sm text-white tracking-wide uppercase flex items-center gap-2">
              Livraria & Loja Virtual Eclesiástica
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-black uppercase tracking-wider hidden xs:inline-block">
                Portal do Membro
              </span>
              {isHubMaximized && (
                <span className="hidden sm:inline-flex text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                  Tela Cheia
                </span>
              )}
            </h2>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Bíblias, Livros Teológicos, Uniformes, Pedidos de Compra & Documentos Fiscais</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCartOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            title="Abrir sacola de compras"
          >
            <ShoppingBag size={14} />
            <span className="hidden sm:inline">Sacola</span>
            <span className="bg-amber-900/60 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-black">
              {totalCartCount}
            </span>
          </button>

          <button
            onClick={() => setIsHubMaximized(!isHubMaximized)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-extrabold flex items-center gap-2 transition-all border border-slate-700/60 cursor-pointer shadow-sm active:scale-95"
            title={isHubMaximized ? "Restaurar layout padrão" : "Maximizar tela sobrepondo menus (Sistema Independente)"}
          >
            {isHubMaximized ? (
              <>
                <Minimize2 size={14} className="text-amber-400" />
                <span className="hidden md:inline">Restaurar</span>
              </>
            ) : (
              <>
                <Maximize2 size={14} className="text-amber-400" />
                <span className="hidden md:inline">Maximizar</span>
              </>
            )}
          </button>

          <button
            onClick={handleClose}
            className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-extrabold flex items-center gap-1.5 transition-all border border-rose-500/30 cursor-pointer shadow-sm active:scale-95"
            title="Voltar ao início do portal"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Voltar ao Início</span>
          </button>
        </div>
      </div>

      <div className="flex-1 w-full max-w-[1800px] mx-auto p-3 sm:p-5 md:p-6 space-y-4 animate-entrance pb-20 md:pb-8">
        {/* BANNER PRINCIPAL DA LOJA */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-amber-700 to-indigo-900 text-white p-6 md:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-amber-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-amber-100 border border-amber-500">
              <Sparkles size={13} /> Loja Oficial da Congregação
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Livraria & Cantina Eclesiástica
            </h1>
            <p className="text-xs md:text-sm text-amber-100/90 font-medium leading-relaxed">
              Bíblias de estudo, Harpas Cristãs, apostilas teológicas, moda evangélica e materiais de apoio para edificação do povo de Deus.
            </p>
            <div className="flex items-center gap-4 pt-1 text-xs text-amber-200/90 font-medium">
              <span className="flex items-center gap-1.5"><Store size={14} /> Retirada na própria Igreja</span>
              <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> Compra 100% Segura</span>
            </div>
          </div>

          {/* SACOLA FLOATING BUTTON NO BANNER */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-3 bg-white text-slate-900 hover:bg-amber-50 px-5 py-3 rounded-2xl font-black text-sm shadow-xl transition-all cursor-pointer transform hover:scale-105 active:scale-95 shrink-0"
          >
            <div className="relative">
              <ShoppingBag size={20} className="text-amber-600" />
              {totalCartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {totalCartCount}
                </span>
              )}
            </div>
            <span>Sacola de Compras</span>
            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-lg text-xs font-mono">
              R$ {totalCartValue.toFixed(2)}
            </span>
          </button>
        </div>
      </div>

      {/* NOTIFICAÇÃO PROATIVA DE PEDIDO PRONTO PARA RETIRADA OU EM ANDAMENTO */}
      {pedidosProntosParaRetirada.length > 0 && activeTab !== 'pedidos' && (
        <div 
          onClick={() => { setActiveTab('pedidos'); setOrderStatusFilter('pronto'); }}
          className="p-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl shadow-md flex items-center justify-between gap-3 cursor-pointer hover:from-amber-600 hover:to-amber-700 transition-all animate-in slide-in-from-top-2"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Bell size={20} className="animate-bounce" />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                Aviso Importante do seu Pedido!
                <span className="bg-white text-amber-800 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  Pronto para Retirada
                </span>
              </h4>
              <p className="text-xs text-amber-100 mt-0.5">
                Você tem {pedidosProntosParaRetirada.length} pedido(s) pronto(s) para retirar na igreja ({pedidosProntosParaRetirada[0].local_retirada}).
              </p>
            </div>
          </div>
          <button className="px-3 py-1.5 bg-white text-amber-900 font-bold text-xs rounded-xl shadow-sm hover:bg-amber-50 shrink-0">
            Ver Pedido & Retirar
          </button>
        </div>
      )}

      {/* ABAS DO PORTAL: VITRINE OU MEUS PEDIDOS */}
      <div className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto loja-menu-scrollbar scroll-smooth touch-pan-x pb-1.5 sm:pb-0 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('vitrine')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
              activeTab === 'vitrine'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <Store size={15} /> Catálogo de Produtos ({produtos.length})
          </button>

          <button
            onClick={() => setActiveTab('pedidos')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
              activeTab === 'pedidos'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <Clock size={15} /> Meus Pedidos & Acompanhamento ({meusPedidos.length})
            {pedidosProntosParaRetirada.length > 0 && (
              <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                {pedidosProntosParaRetirada.length} pronto(s)
              </span>
            )}
          </button>
        </div>

        {/* Sacola Rápida Badge */}
        {totalCartCount > 0 && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="hidden sm:flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200/80 cursor-pointer whitespace-nowrap shrink-0"
          >
            <ShoppingBag size={14} /> {totalCartCount} item(ns) na sacola
          </button>
        )}
      </div>

      {/* ABA VITRINE */}
      {activeTab === 'vitrine' && (
        <div className="space-y-4">
          {/* BARRA DE PESQUISA E CATEGORIAS */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="O que você está procurando? (Bíblia, Harpa, Camiseta, Livro...)"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
              />
            </div>

            {/* Categorias Pills com rolagem horizontal fluida */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              <button
                onClick={() => setSelectedCategoria('todas')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedCategoria === 'todas'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                Todas as Categorias
              </button>
              {CATEGORIAS_LOJA.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoria(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                    selectedCategoria === cat
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* GRID DE PRODUTOS */}
          {produtos.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center text-slate-400 max-w-2xl mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
                <ShoppingBag size={32} />
              </div>
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">Livraria & Cantina em Atualização</h3>
              <p className="text-xs mt-2 text-slate-500 dark:text-slate-400 leading-relaxed">
                No momento não há artigos ou materiais à venda na livraria oficial da igreja. A liderança disponibilizará os novos itens e lançamentos em breve!
              </p>
            </div>
          ) : produtosFiltrados.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center text-slate-400">
              <ShoppingBag size={48} className="mx-auto mb-3 opacity-30 text-amber-600" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Nenhum produto encontrado</h3>
              <p className="text-xs mt-1">Tente buscar por outro termo ou selecione todas as categorias.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {produtosFiltrados.map((prod) => {
                const isOutOfStock = prod.estoque_atual <= 0;
                const inCart = cart.find(c => c.produto_id === prod.id);

                return (
                  <div
                    key={prod.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
                  >
                    {/* Imagem do Produto com Badges */}
                    <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img
                        src={prod.foto || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'}
                        alt={prod.nome}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                        <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
                          {prod.categoria}
                        </span>
                        {prod.destaque && (
                          <span className="bg-amber-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-lg shadow-sm">
                            Destaque
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-2.5 right-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm ${
                          isOutOfStock
                            ? 'bg-rose-600 text-white'
                            : prod.estoque_atual <= 3
                            ? 'bg-amber-500 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}>
                          {isOutOfStock ? 'Esgotado' : `${prod.estoque_atual} un. em estoque`}
                        </span>
                      </div>
                    </div>

                    {/* Informações do Produto */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1 group-hover:text-amber-600 transition-colors">
                          {prod.nome}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {prod.descricao}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Valor Unitário</span>
                          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                            R$ {(prod.preco_venda || 0).toFixed(2)}
                          </span>
                        </div>

                        {inCart ? (
                          <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-1">
                            <button
                              onClick={() => handleUpdateCartQty(prod.id, -1)}
                              className="w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-800 rounded-lg text-slate-600 hover:text-rose-600 cursor-pointer shadow-xs"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="text-xs font-bold px-1.5 font-mono text-amber-950 dark:text-amber-200">
                              {inCart.quantidade}
                            </span>
                            <button
                              onClick={() => handleUpdateCartQty(prod.id, 1)}
                              disabled={inCart.quantidade >= prod.estoque_atual}
                              className="w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-800 rounded-lg text-slate-600 hover:text-emerald-600 cursor-pointer shadow-xs disabled:opacity-40"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleAddToCart(prod)}
                            disabled={isOutOfStock}
                            variant="primary"
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                          >
                            <ShoppingBag size={14} /> Adicionar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ABA MEUS PEDIDOS */}
      {activeTab === 'pedidos' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Clock size={18} className="text-amber-600" />
                  Meus Pedidos & Acompanhamento
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Veja a esteira de separação, instruções de retirada na igreja e notificações de cada pedido.
                </p>
              </div>

              {/* Barra de botões do menu com barra de rolagem horizontal */}
              <div className="w-full sm:w-auto overflow-x-auto loja-menu-scrollbar scroll-smooth touch-pan-x pb-2 pt-0.5">
                <div className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800/90 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shrink-0 min-w-max">
                  <button
                    onClick={() => setOrderStatusFilter('todos')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      orderStatusFilter === 'todos'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-slate-600'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50'
                    }`}
                  >
                    <Layers size={14} className={orderStatusFilter === 'todos' ? 'text-amber-600' : 'text-slate-400'} />
                    Todos
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                      orderStatusFilter === 'todos'
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {meusPedidos.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setOrderStatusFilter('andamento')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      orderStatusFilter === 'andamento'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-slate-600'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50'
                    }`}
                  >
                    <Clock size={14} className={orderStatusFilter === 'andamento' ? 'text-blue-500' : 'text-slate-400'} />
                    Em Andamento
                    {pedidosEmAndamento.length > 0 && (
                      <span className="bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                        {pedidosEmAndamento.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setOrderStatusFilter('pronto')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      orderStatusFilter === 'pronto'
                        ? 'bg-amber-500 text-white shadow-sm border border-amber-600'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50'
                    }`}
                  >
                    <PackageCheck size={14} className={orderStatusFilter === 'pronto' ? 'text-white' : 'text-amber-600'} />
                    Prontos para Retirada
                    {pedidosProntosParaRetirada.length > 0 && (
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                        orderStatusFilter === 'pronto'
                          ? 'bg-white text-amber-900 animate-pulse'
                          : 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}>
                        {pedidosProntosParaRetirada.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setOrderStatusFilter('concluido')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      orderStatusFilter === 'concluido'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-slate-600'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50'
                    }`}
                  >
                    <CheckCircle size={14} className={orderStatusFilter === 'concluido' ? 'text-emerald-500' : 'text-slate-400'} />
                    Concluídos / Retirados
                  </button>

                  {/* Alternador de exibição de todos os pedidos salvos */}
                  {(db?.loja_pedidos && db.loja_pedidos.length > meusPedidos.length) && (
                    <button
                      type="button"
                      onClick={() => setViewAllOrdersScope(!viewAllOrdersScope)}
                      className="ml-1 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800/60 whitespace-nowrap shrink-0"
                    >
                      {viewAllOrdersScope ? "Apenas meus pedidos" : `Ver todos salvos (${db.loja_pedidos.length})`}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {pedidosFiltrados.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <ShoppingBag size={42} className="mx-auto mb-2 opacity-30 text-slate-400" />
                <p className="text-xs font-bold">
                  {meusPedidos.length === 0 
                    ? "Você ainda não realizou nenhuma compra na loja." 
                    : "Nenhum pedido encontrado nesta categoria de status."}
                </p>
                {meusPedidos.length === 0 ? (
                  <button
                    onClick={() => setActiveTab('vitrine')}
                    className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-amber-700"
                  >
                    Conhecer Produtos da Loja
                  </button>
                ) : (
                  <button
                    onClick={() => setOrderStatusFilter('todos')}
                    className="mt-3 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-200"
                  >
                    Ver Todos os Pedidos
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {pedidosFiltrados.map((ped) => (
                  <LojaMembroPedidoCard
                    key={ped.id}
                    pedido={ped}
                    onViewReceipt={(p) => setSelectedOrderReceipt(p)}
                    onViewFiscalDoc={(p, tipo) => setSelectedFiscalDoc({ pedido: p, tipo })}
                    onWhatsApp={handleNotifyChurchWhatsApp}
                    onCancelOrder={(p) => setOrderToCancel(p)}
                    churchName={db?.igreja?.nome || 'Igreja'}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOTÃO FLUTUANTE DA SACOLA NO CELULAR (SEMPRE VISÍVEL E ACESSÍVEL) */}
      {totalCartCount > 0 && !isCartOpen && !isCheckoutOpen && (
        <div className="sm:hidden fixed bottom-4 left-3 right-3 z-40 animate-in slide-in-from-bottom-3 duration-200">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-amber-600 active:bg-amber-700 text-white p-3 rounded-2xl shadow-xl flex items-center justify-between font-bold text-xs border border-amber-500/40 active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="relative p-1.5 bg-white/20 rounded-lg">
                <ShoppingBag size={18} />
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {totalCartCount}
                </span>
              </div>
              <span>Ver Minha Sacola</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white/20 px-2 py-1 rounded-lg font-mono text-xs">
                R$ {totalCartValue.toFixed(2)}
              </span>
              <ArrowRight size={16} />
            </div>
          </button>
        </div>
      )}

      {/* MODAL AUTO-AJUSTÁVEL DA SACOLA (PADRÃO INTERACTIVE WINDOW) */}
      {isCartOpen && createPortal(
        <InteractiveWindow
          id="loja_membro_sacola_modal"
          title="Minha Sacola de Compras"
          subtitle={`${totalCartCount} item(ns) adicionado(s) • Total: R$ ${totalCartValue.toFixed(2)}`}
          onClose={() => setIsCartOpen(false)}
          icon={ShoppingBag}
          headerBg="from-amber-600 via-amber-700 to-amber-800"
          defaultWidth={700}
          defaultHeight={600}
          footer={
            <div className="flex flex-wrap items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total a Pagar:</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  R$ {totalCartValue.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCart([])}
                    className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors border border-rose-200 dark:border-rose-800/60 cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 size={14} /> Limpar
                  </button>
                )}
                <Button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  variant="ghost"
                  className="border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Continuar Comprando
                </Button>
                {cart.length > 0 && (
                  <Button
                    type="button"
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    variant="primary"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 px-4 shadow-md shadow-amber-600/20 flex items-center gap-1.5"
                  >
                    Continuar para Fechamento <ArrowRight size={15} />
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div className="p-4 sm:p-6 space-y-3">
            {cart.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-full mb-3">
                  <ShoppingBag size={42} className="opacity-60" />
                </div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">Sua sacola está vazia</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">Adicione bíblias, livros, harpas ou materiais da igreja no catálogo da loja.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {cart.map(item => (
                  <div
                    key={item.produto_id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3.5 hover:border-amber-400/50 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-amber-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center">
                      <img
                        src={item.foto || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=150&q=80'}
                        alt={item.nome}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=150&q=80';
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate leading-snug">{item.nome}</h4>
                      <div className="text-[11px] text-slate-500 font-medium">
                        R$ {item.preco_unitario.toFixed(2)} cada
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-0.5 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleUpdateCartQty(item.produto_id, -1)}
                            className="w-5 h-5 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-rose-600 cursor-pointer rounded"
                            title="Diminuir"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="text-xs font-bold font-mono px-2 text-slate-800 dark:text-white">{item.quantidade}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateCartQty(item.produto_id, 1)}
                            className="w-5 h-5 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-emerald-600 cursor-pointer rounded"
                            title="Aumentar"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end justify-between self-stretch shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(item.produto_id)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                        title="Remover da sacola"
                      >
                        <Trash2 size={15} />
                      </button>
                      <span className="text-xs sm:text-sm font-black font-mono text-slate-900 dark:text-white">
                        R$ {item.subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </InteractiveWindow>,
        document.body
      )}

      {/* TELA DE FECHAMENTO DO PEDIDO (CHECKOUT - PADRÃO INTERACTIVE WINDOW) */}
      {isCheckoutOpen && createPortal(
        <InteractiveWindow
          id="loja_membro_checkout_modal"
          title="Finalizar Pedido • Retirada na Igreja"
          subtitle={`Total a pagar: R$ ${totalCartValue.toFixed(2)} • ${totalCartCount} item(ns) na sacola`}
          onClose={() => setIsCheckoutOpen(false)}
          icon={Store}
          headerBg="from-amber-600 via-amber-700 to-amber-800"
          defaultWidth={900}
          defaultHeight={720}
          footer={
            <div className="flex flex-wrap items-center justify-between gap-3 w-full">
              <button
                type="button"
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setIsCartOpen(true);
                }}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <ArrowLeft size={14} /> Voltar para Sacola
              </button>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-slate-400 block leading-tight">Total Final</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    R$ {totalCartValue.toFixed(2)}
                  </span>
                </div>
                <button
                  type="submit"
                  form="membro-checkout-form"
                  disabled={isSubmitting || cart.length === 0}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="animate-spin" size={16} /> Processando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} /> Confirmar Pedido (R$ {totalCartValue.toFixed(2)})
                    </>
                  )}
                </button>
              </div>
            </div>
          }
        >
          <div className="p-4 sm:p-6">
            <form id="membro-checkout-form" onSubmit={handleConfirmCheckout} className="space-y-4">
              
              {/* RESUMO RÁPIDO DO PEDIDO NO MOBILE */}
              <div className="lg:hidden bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-600 text-white rounded-lg">
                      <ShoppingBag size={14} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-white block">
                        {totalCartCount} item(ns) na sacola
                      </span>
                      <span className="text-[11px] text-slate-500 truncate block max-w-[170px] xs:max-w-[220px]">
                        {cart.map(c => c.nome).join(', ')}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMobileCheckoutItems(!showMobileCheckoutItems)}
                    className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800 cursor-pointer flex items-center gap-1"
                  >
                    {showMobileCheckoutItems ? 'Ocultar' : 'Ver Itens'}
                    {showMobileCheckoutItems ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                </div>

                {showMobileCheckoutItems && (
                  <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/50 space-y-1.5 animate-in fade-in duration-150">
                    {cart.map(item => (
                      <div key={item.produto_id} className="flex justify-between items-center text-xs">
                        <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                          {item.quantidade}x {item.nome}
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          R$ {item.subtotal.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* COLUNA ESQUERDA: DADOS, RETIRADA E PAGAMENTO */}
                <div className="lg:col-span-7 space-y-3.5">
                  {/* 1. DADOS DO COMPRADOR */}
                  <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/60 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User size={14} className="text-amber-600" />
                      1. Informações do Comprador
                    </h4>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={checkoutData.nome}
                        onChange={e => setCheckoutData({ ...checkoutData, nome: e.target.value })}
                        placeholder="Seu nome ou do destinatário"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          WhatsApp / Telefone *
                        </label>
                        <input
                          type="text"
                          required
                          value={checkoutData.telefone}
                          onChange={e => setCheckoutData({ ...checkoutData, telefone: e.target.value })}
                          placeholder="(11) 98765-4321"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-amber-500/20"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          E-mail (opcional)
                        </label>
                        <input
                          type="email"
                          value={checkoutData.email}
                          onChange={e => setCheckoutData({ ...checkoutData, email: e.target.value })}
                          placeholder="seuemail@exemplo.com"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-amber-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. LOCAL DE RETIRADA */}
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Store size={14} className="text-amber-600" />
                      2. Local de Retirada
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setCheckoutData({ ...checkoutData, local_retirada: 'igreja_sede' })}
                        className={`p-2.5 sm:p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          checkoutData.local_retirada === 'igreja_sede'
                            ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 shadow-sm ring-1 ring-amber-600'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-white">
                          <Store size={14} className="text-amber-600 shrink-0" />
                          Igreja Cadastrada
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5 truncate">
                          {db?.igreja?.nome || 'Sede / Secretaria'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCheckoutData({ ...checkoutData, local_retirada: 'a_combinar' })}
                        className={`p-2.5 sm:p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          checkoutData.local_retirada === 'a_combinar'
                            ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 shadow-sm ring-1 ring-amber-600'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-white">
                          <MessageCircle size={14} className="text-amber-600 shrink-0" />
                          A Combinar
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5 truncate">
                          Com liderança da loja / no culto
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* 3. FORMA DE PAGAMENTO */}
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-amber-600" />
                      3. Forma de Pagamento
                    </h4>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setCheckoutData({ ...checkoutData, forma_pagamento: 'pix' })}
                        className={`p-2 sm:p-2.5 rounded-xl border text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                          checkoutData.forma_pagamento === 'pix'
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold ring-1 ring-emerald-600 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <QrCode size={18} className="text-emerald-600" />
                        <span className="text-[11px] font-bold">Pix</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCheckoutData({ ...checkoutData, forma_pagamento: 'cartao_retirada' })}
                        className={`p-2 sm:p-2.5 rounded-xl border text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                          checkoutData.forma_pagamento === 'cartao_retirada'
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 font-bold ring-1 ring-indigo-600 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <ShieldCheck size={18} className="text-indigo-600" />
                        <span className="text-[11px] font-bold">Cartão</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCheckoutData({ ...checkoutData, forma_pagamento: 'dinheiro_retirada' })}
                        className={`p-2 sm:p-2.5 rounded-xl border text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                          checkoutData.forma_pagamento === 'dinheiro_retirada'
                            ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold ring-1 ring-amber-600 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <Store size={18} className="text-amber-600" />
                        <span className="text-[11px] font-bold">Dinheiro</span>
                      </button>
                    </div>

                    {/* Bloco informativo Pix */}
                    {checkoutData.forma_pagamento === 'pix' && (
                      <div className="p-2.5 sm:p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300">Chave Pix da Igreja:</span>
                          <button
                            type="button"
                            onClick={handleCopyPix}
                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-700 shadow-2xs"
                          >
                            {copiedPix ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                            {copiedPix ? 'Copiado!' : 'Copiar'}
                          </button>
                        </div>
                        <p className="font-mono text-xs font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-800 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800 select-all">
                          {db?.igreja?.chave_pix || '12.345.678/0001-90'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 4. OBSERVAÇÕES */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Observações adicionais (opcional)
                    </label>
                    <input
                      type="text"
                      value={checkoutData.observacoes}
                      onChange={e => setCheckoutData({ ...checkoutData, observacoes: e.target.value })}
                      placeholder="Ex: tamanho G, dedicatória no livro..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                {/* COLUNA DIREITA: RESUMO DO PEDIDO NO DESKTOP */}
                <div className="hidden lg:block lg:col-span-5 space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2.5">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white flex items-center gap-2">
                        <ShoppingBag size={15} className="text-amber-600" />
                        Resumo do Pedido
                      </h4>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {totalCartCount} item(ns)
                      </span>
                    </div>

                    {/* Lista dos itens na sacola */}
                    <div className="max-h-52 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {cart.map(item => (
                        <div key={item.produto_id} className="flex items-center gap-2.5 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700">
                          <img
                            src={item.foto || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=150&q=80'}
                            alt={item.nome}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=150&q=80';
                            }}
                            className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-slate-800 dark:text-white truncate">{item.nome}</h5>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {item.quantidade}x R$ {item.preco_unitario.toFixed(2)}
                            </span>
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-800 dark:text-white">
                            R$ {item.subtotal.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Alerta de Retirada na Igreja */}
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 rounded-xl flex items-start gap-2 text-xs text-amber-900 dark:text-amber-300">
                      <Store size={15} className="shrink-0 mt-0.5 text-amber-600" />
                      <p className="leading-snug text-[11px]">
                        <strong>Retirada:</strong> Igreja ({db?.igreja?.nome || 'Sede'}) ou a combinar com a liderança da loja.
                      </p>
                    </div>

                    {/* Totalizador */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>Subtotal:</span>
                        <span className="font-mono font-bold">R$ {totalCartValue.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>Taxa de Retirada:</span>
                        <span className="text-emerald-600 font-bold">Grátis na Igreja</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-sm font-bold text-slate-800 dark:text-white">Total a Pagar:</span>
                        <span className="text-xl font-black font-mono text-emerald-600">
                          R$ {totalCartValue.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </form>
          </div>
        </InteractiveWindow>,
        document.body
      )}

      {/* MODAL: COMPROVANTE DO PEDIDO GERADO (PADRÃO INTERACTIVE WINDOW) */}
      {selectedOrderReceipt && createPortal(
        <InteractiveWindow
          id="loja_membro_comprovante_modal"
          title={`Pedido Realizado • #${selectedOrderReceipt.numero_pedido}`}
          subtitle={`Comprovante Oficial • ${selectedOrderReceipt.cliente_nome}`}
          onClose={() => setSelectedOrderReceipt(null)}
          icon={CheckCircle2}
          headerBg="from-emerald-600 via-teal-700 to-slate-900"
          defaultWidth={650}
          defaultHeight={680}
          footer={
            <div className="flex flex-wrap items-center justify-between gap-2 w-full">
              <Button
                type="button"
                onClick={() => setSelectedOrderReceipt(null)}
                variant="ghost"
                className="border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                Fechar
              </Button>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleNotifyChurchWhatsApp(selectedOrderReceipt)}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <MessageCircle size={15} /> Avisar no WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const ped = selectedOrderReceipt;
                    setSelectedOrderReceipt(null);
                    setSelectedFiscalDoc({ pedido: ped, tipo: 'pedido_compra' });
                  }}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <Printer size={15} /> Pedido de Compra
                </button>
                {selectedOrderReceipt.status_pagamento === 'pago' && (
                  <button
                    type="button"
                    onClick={() => {
                      const ped = selectedOrderReceipt;
                      setSelectedOrderReceipt(null);
                      setSelectedFiscalDoc({ pedido: ped, tipo: 'nota_fiscal' });
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <FileText size={15} className="text-indigo-600" /> Nota Fiscal (DAV)
                  </button>
                )}
              </div>
            </div>
          }
        >
          <div className="p-4 sm:p-6 space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-1">
                <CheckCircle2 size={26} />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">Pedido Realizado com Sucesso!</h3>
              <p className="text-xs font-mono font-bold text-amber-600">Pedido #{selectedOrderReceipt.numero_pedido}</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-400">Comprador:</span>
                <strong className="text-slate-800 dark:text-white">{selectedOrderReceipt.cliente_nome}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-400">Total do Pedido:</span>
                <strong className="text-emerald-600 font-mono text-sm">R$ {selectedOrderReceipt.valor_total.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-400">Forma de Pagamento:</span>
                <strong className="uppercase">{selectedOrderReceipt.forma_pagamento}</strong>
              </div>
              <div className="pt-1 flex justify-between items-center">
                <div>
                  <span className="text-slate-400 block text-[10px]">Local de Retirada:</span>
                  <strong className="text-indigo-600 dark:text-indigo-400">{selectedOrderReceipt.local_retirada}</strong>
                </div>
                <div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    selectedOrderReceipt.status_entrega === 'cancelado' 
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300' 
                      : selectedOrderReceipt.status_entrega === 'entregue'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedOrderReceipt.status_entrega === 'cancelado' ? 'Cancelado' : selectedOrderReceipt.status_entrega === 'entregue' ? 'Entregue' : 'Em Aberto'}
                  </span>
                </div>
              </div>
            </div>

            {selectedOrderReceipt.status_pagamento !== 'pago' && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <span>A <strong>Nota Fiscal / Recibo Quitado</strong> estará disponível para você assim que o pagamento for confirmado pela loja no administrativo.</span>
              </div>
            )}

            {selectedOrderReceipt.status_entrega !== 'cancelado' && selectedOrderReceipt.status_entrega !== 'entregue' && (
              <button
                type="button"
                onClick={() => {
                  const ped = selectedOrderReceipt;
                  setSelectedOrderReceipt(null);
                  setOrderToCancel(ped);
                }}
                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-rose-200 dark:border-rose-800 cursor-pointer"
              >
                <XCircle size={14} /> Cancelar Este Pedido
              </button>
            )}
          </div>
        </InteractiveWindow>,
        document.body
      )}

      {/* MODAL: EMISSÃO DE NOTA FISCAL / PEDIDO DE COMPRA COM MOTOR PROFISSIONAL */}
      {selectedFiscalDoc && (
        <LojaDocumentoFiscalModal
          pedido={selectedFiscalDoc.pedido}
          tipoDocumento={selectedFiscalDoc.tipo}
          igreja={db?.igreja}
          isMemberPortal={true}
          onClose={() => setSelectedFiscalDoc(null)}
          onUpdateStatus={(updatedPed) => {
            setDbState((prev: any) => {
              const current = prev?.loja_pedidos || [];
              const updatedList = current.map((p: any) => p.id === updatedPed.id ? updatedPed : p);
              return { ...prev, loja_pedidos: updatedList };
            });
          }}
        />
      )}

      {/* MOTOR DE CONFIRMAÇÃO DE CANCELAMENTO PELO MEMBRO */}
      <ConfirmModal
        isOpen={!!orderToCancel}
        onClose={() => {
          if (!isCancellingOrder) setOrderToCancel(null);
        }}
        onCancel={() => {
          if (!isCancellingOrder) setOrderToCancel(null);
        }}
        onConfirm={handleConfirmCancelOrder}
        title="Cancelar Pedido"
        message={`Deseja realmente cancelar o Pedido #${orderToCancel?.numero_pedido}? Os produtos comprados retornarão automaticamente ao estoque da loja da igreja.`}
        confirmText={isCancellingOrder ? "Cancelando..." : "Sim, Cancelar Pedido"}
        cancelText="Não, Manter Pedido"
        variant="danger"
      />
      </div>
    </div>
  );
}

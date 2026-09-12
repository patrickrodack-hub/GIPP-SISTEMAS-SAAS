import React, { useState, useMemo, useContext } from 'react';
import { ChurchContext } from '../context/ChurchContext';
import { 
  ShoppingBag, Search, Plus, Minus, Trash2, CheckCircle2, ArrowRight, 
  Store, ShieldCheck, Clock, QrCode, Copy, Check, ChevronRight, 
  Tag, Filter, Heart, MessageCircle, AlertCircle, Printer, X, Sparkles,
  Package, Bell, Truck, CheckSquare, ChevronDown, ChevronUp, MapPin, User, Info
} from 'lucide-react';
import { 
  ProdutoLoja, PedidoLoja, ItemPedidoLoja, MovimentacaoEstoque, 
  CATEGORIAS_LOJA, PRODUTOS_LOJA_INICIAIS,
  HistoricoEventoPedido
} from '../data/lojaVirtualData';
import { Button } from '../utils/sharedHelpers';
import LojaMembroPedidoCard from './LojaMembroPedidoCard';

interface PortalLojaMembroProps {
  user?: any;
  db?: any;
  setView?: (view: string) => void;
}

interface CartItem extends ItemPedidoLoja {
  estoque_maximo: number;
}

export default function PortalLojaMembro({ user, db, setView }: PortalLojaMembroProps) {
  const { setDbState, addToast, dbFirestore, appId, setDoc, doc } = useContext(ChurchContext);

  // States
  const [activeTab, setActiveTab] = useState<'vitrine' | 'pedidos'>('vitrine');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('todas');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'todos' | 'andamento' | 'pronto' | 'concluido'>('todos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedOrderReceipt, setSelectedOrderReceipt] = useState<PedidoLoja | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [expandedOrderHistoryId, setExpandedOrderHistoryId] = useState<string | null>(null);
  const [selectedOrderTracking, setSelectedOrderTracking] = useState<PedidoLoja | null>(null);

  // Checkout Form State
  const [checkoutData, setCheckoutData] = useState({
    nome: user?.nome || '',
    telefone: user?.telefone || user?.whatsapp || '',
    email: user?.email || '',
    forma_pagamento: 'pix' as 'pix' | 'cartao_retirada' | 'dinheiro_retirada',
    local_retirada: 'igreja_sede' as 'igreja_sede' | 'a_combinar',
    observacoes: ''
  });

  // Current Products
  const produtos: ProdutoLoja[] = useMemo(() => {
    const list = db?.loja_produtos && Array.isArray(db.loja_produtos) && db.loja_produtos.length > 0
      ? db.loja_produtos
      : PRODUTOS_LOJA_INICIAIS;
    // Only active products in the member portal
    return list.filter((p: ProdutoLoja) => p.ativo);
  }, [db?.loja_produtos]);

  // Current Orders for this user
  const meusPedidos: PedidoLoja[] = useMemo(() => {
    if (!db?.loja_pedidos || !Array.isArray(db.loja_pedidos)) return [];
    return db.loja_pedidos.filter((p: PedidoLoja) => {
      // Match by user ID, or user email, or user name
      if (user?.id && p.cliente_id === user.id) return true;
      if (user?.email && p.cliente_email && p.cliente_email.toLowerCase() === user.email.toLowerCase()) return true;
      if (user?.nome && p.cliente_nome && p.cliente_nome.toLowerCase().trim() === user.nome.toLowerCase().trim()) return true;
      return false;
    });
  }, [db?.loja_pedidos, user]);

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
      : PRODUTOS_LOJA_INICIAIS;

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

  return (
    <div className="h-full flex flex-col space-y-4 animate-entrance overflow-y-auto custom-scrollbar p-1 pb-20 md:pb-6">
      {/* BANNER PRINCIPAL DA LOJA */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-amber-700 to-indigo-900 text-white p-6 md:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/30 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-amber-200 border border-amber-400/30">
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
        <div className="flex gap-1.5">
          <button
            onClick={() => setActiveTab('vitrine')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'vitrine'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <Store size={15} /> Catálogo de Produtos ({produtos.length})
          </button>

          <button
            onClick={() => setActiveTab('pedidos')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'pedidos'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <Clock size={15} /> Meus Pedidos ({meusPedidos.length})
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
            className="hidden sm:flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200/80 cursor-pointer"
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
          {produtosFiltrados.length === 0 ? (
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
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                        <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
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
                            : 'bg-emerald-600/90 text-white backdrop-blur-md'
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

              {/* Sub-filtros por status */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 overflow-x-auto">
                <button
                  onClick={() => setOrderStatusFilter('todos')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    orderStatusFilter === 'todos'
                      ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Todos ({meusPedidos.length})
                </button>
                <button
                  onClick={() => setOrderStatusFilter('andamento')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    orderStatusFilter === 'andamento'
                      ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Em Andamento ({pedidosEmAndamento.length})
                </button>
                <button
                  onClick={() => setOrderStatusFilter('pronto')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    orderStatusFilter === 'pronto'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Prontos ({pedidosProntosParaRetirada.length})
                </button>
                <button
                  onClick={() => setOrderStatusFilter('concluido')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    orderStatusFilter === 'concluido'
                      ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Concluídos
                </button>
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
                    onWhatsApp={handleNotifyChurchWhatsApp}
                    churchName={db?.igreja?.nome || 'Igreja'}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DRAWER / MODAL DA SACOLA DE COMPRAS */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Topo da Sacola */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-xl">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800 dark:text-white">Minha Sacola</h3>
                  <span className="text-xs text-slate-400">{totalCartCount} item(ns) selecionados</span>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Itens da Sacola */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                  <ShoppingBag size={48} className="opacity-20 mb-3" />
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Sua sacola está vazia</p>
                  <p className="text-xs mt-1">Explore o catálogo e adicione itens para retirar na igreja.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div
                    key={item.produto_id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3"
                  >
                    <img
                      src={item.foto || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=150&q=80'}
                      alt={item.nome}
                      className="w-14 h-14 object-cover rounded-xl border border-slate-200 dark:border-slate-700 bg-white"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{item.nome}</h4>
                      <span className="text-[11px] font-mono text-emerald-600 font-bold">
                        R$ {item.preco_unitario.toFixed(2)} cada
                      </span>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button
                          onClick={() => handleUpdateCartQty(item.produto_id, -1)}
                          className="w-6 h-6 rounded-md bg-white dark:bg-slate-700 border border-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="text-xs font-bold font-mono px-1">{item.quantidade}</span>
                        <button
                          onClick={() => handleUpdateCartQty(item.produto_id, 1)}
                          className="w-6 h-6 rounded-md bg-white dark:bg-slate-700 border border-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end justify-between self-stretch">
                      <button
                        onClick={() => handleRemoveFromCart(item.produto_id)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Remover"
                      >
                        <Trash2 size={14} />
                      </button>
                      <span className="text-xs font-bold font-mono text-slate-800 dark:text-white">
                        R$ {item.subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Rodapé da Sacola com Total e Botão Fechar Pedido */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
                {/* AVISO IMPORTANTE SOLICITADO PELO USUÁRIO */}
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-start gap-2 text-xs text-amber-900 dark:text-amber-300">
                  <Store size={16} className="shrink-0 mt-0.5 text-amber-600" />
                  <p className="leading-snug">
                    <strong>Local de Retirada:</strong> Igreja cadastrada (Sede / Congregação) ou a combinar com o responsável da loja.
                  </p>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-600 dark:text-slate-400">Total a Pagar:</span>
                  <span className="text-xl font-black text-emerald-600 font-mono">
                    R$ {totalCartValue.toFixed(2)}
                  </span>
                </div>

                <Button
                  onClick={() => setIsCheckoutOpen(true)}
                  variant="primary"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 cursor-pointer"
                >
                  Continuar para Fechamento <ArrowRight size={16} />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: FECHAMENTO DO PEDIDO (CHECKOUT) */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-amber-600 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store size={20} />
                <h3 className="font-bold text-base">Finalizar Pedido de Compra</h3>
              </div>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmCheckout} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto custom-scrollbar">
              {/* DADOS DO COMPRADOR */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  1. Informações do Comprador
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={checkoutData.nome}
                    onChange={e => setCheckoutData({ ...checkoutData, nome: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      WhatsApp / Telefone *
                    </label>
                    <input
                      type="text"
                      required
                      value={checkoutData.telefone}
                      onChange={e => setCheckoutData({ ...checkoutData, telefone: e.target.value })}
                      placeholder="(11) 98765-4321"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      E-mail (opcional)
                    </label>
                    <input
                      type="email"
                      value={checkoutData.email}
                      onChange={e => setCheckoutData({ ...checkoutData, email: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* LOCAL DE RETIRADA */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  2. Local de Retirada
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutData({ ...checkoutData, local_retirada: 'igreja_sede' })}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      checkoutData.local_retirada === 'igreja_sede'
                        ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-white">
                      <Store size={14} className="text-amber-600" />
                      Igreja Cadastrada
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      {db?.igreja?.nome || 'Sede / Secretaria'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCheckoutData({ ...checkoutData, local_retirada: 'a_combinar' })}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      checkoutData.local_retirada === 'a_combinar'
                        ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-white">
                      <MessageCircle size={14} className="text-amber-600" />
                      A Combinar
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      Com o líder da loja ou culto
                    </span>
                  </button>
                </div>
              </div>

              {/* FORMA DE PAGAMENTO */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  3. Forma de Pagamento
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutData({ ...checkoutData, forma_pagamento: 'pix' })}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                      checkoutData.forma_pagamento === 'pix'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600'
                    }`}
                  >
                    <QrCode size={18} className="mx-auto mb-1 text-emerald-600" />
                    <span className="text-xs block">Pix Instantâneo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCheckoutData({ ...checkoutData, forma_pagamento: 'cartao_retirada' })}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                      checkoutData.forma_pagamento === 'cartao_retirada'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-800 dark:text-indigo-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600'
                    }`}
                  >
                    <ShieldCheck size={18} className="mx-auto mb-1 text-indigo-600" />
                    <span className="text-xs block">Cartão na Retirada</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCheckoutData({ ...checkoutData, forma_pagamento: 'dinheiro_retirada' })}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                      checkoutData.forma_pagamento === 'dinheiro_retirada'
                        ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600'
                    }`}
                  >
                    <Store size={18} className="mx-auto mb-1 text-amber-600" />
                    <span className="text-xs block">Dinheiro</span>
                  </button>
                </div>

                {/* Bloco Pix informativo se selecionado */}
                {checkoutData.forma_pagamento === 'pix' && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300">Chave Pix da Igreja:</span>
                      <button
                        type="button"
                        onClick={handleCopyPix}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-emerald-200"
                      >
                        {copiedPix ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        {copiedPix ? 'Copiado!' : 'Copiar Chave'}
                      </button>
                    </div>
                    <p className="font-mono text-xs font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-800 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800 select-all">
                      {db?.igreja?.chave_pix || '12.345.678/0001-90'}
                    </p>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">
                      Ao finalizar, você poderá enviar o comprovante Pix diretamente pelo WhatsApp da congregação.
                    </span>
                  </div>
                )}
              </div>

              {/* OBSERVAÇÕES */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Observações (Tamanho, Cor, Dedicatória...)
                </label>
                <textarea
                  rows={2}
                  value={checkoutData.observacoes}
                  onChange={e => setCheckoutData({ ...checkoutData, observacoes: e.target.value })}
                  placeholder="Ex: Camiseta tamanho G, dedicatória no livro..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none"
                />
              </div>

              {/* RESUMO DO TOTAL */}
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Total do Pedido ({totalCartCount} itens):</span>
                <span className="text-lg font-black font-mono text-emerald-600">
                  R$ {totalCartValue.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Voltar à Sacola
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-lg cursor-pointer"
                >
                  Confirmar e Gerar Pedido
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: COMPROVANTE DO PEDIDO GERADO */}
      {selectedOrderReceipt && (
        <div className="fixed inset-0 z-[10001] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white">Pedido Realizado com Sucesso!</h3>
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
              <div className="pt-1">
                <span className="text-slate-400 block text-[10px]">Local de Retirada:</span>
                <strong className="text-indigo-600 dark:text-indigo-400">{selectedOrderReceipt.local_retirada}</strong>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleNotifyChurchWhatsApp(selectedOrderReceipt)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <MessageCircle size={16} /> Avisar Loja da Igreja no WhatsApp
              </button>

              <button
                onClick={() => window.print()}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Printer size={15} /> Imprimir Comprovante
              </button>

              <button
                onClick={() => setSelectedOrderReceipt(null)}
                className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Fechar Comprovante
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useContext, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { ChurchContext } from '../context/ChurchContext';

const findAutomaticAnswer = (messageText: string, igrejaData: any) => {
    const textBase = messageText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Combining default FAQs with custom FAQs
    const defaultFaqs = [
        {
            keywords: ['dizimo', 'oferta', 'pix', 'conta', 'banco', 'financeiro', 'pagamento_dizimo'],
            response: `Para registrar dízimos e ofertas, você pode usar a nossa chave PIX oficial: ${igrejaData?.chave_pix || 'Chave não cadastrada'}. \nNossos dados bancários são: Banco: ${igrejaData?.banco || 'Não informado'}, Agência: ${igrejaData?.agencia || 'Não informado'}, Conta: ${igrejaData?.conta || 'Não informado'}. No módulo "Financeiro" você faz toda a gestão de entradas, despesas e relatórios.`
        },
        {
            keywords: ['membro', 'cadastro', 'cadastrar', 'ficha', 'carteirinha', 'credencial'],
            response: "Você pode gerenciar os membros da igreja em Secretaria -> Membros. Lá é possível cadastrar novos fiéis, carregar fotos, registrar históricos de batismo e gerar credenciais/carteirinhas de membro profissionais em PDF prontas para impressão."
        },
        {
            keywords: ['celula', 'lider', 'relatorio', 'presenca', 'reuniao de celula'],
            response: "No módulo 'Células', você pode acompanhar todos os pequenos grupos, registrar relatórios de reuniões presenciais (número de membros, visitantes e decisões), e definir líderes coordenadores."
        },
        {
            keywords: ['backup', 'exportar', 'seguranca', 'salvar', 'dados'],
            response: "A segurança dos seus dados é prioritária. Você pode efetuar um backup completo do banco de dados em formato JSON a qualquer momento acessando o Painel de Controle e clicando na opção de Exportar Backup local."
        },
        {
            keywords: ['suporte', 'atendimento', 'falar com humano', 'ajuda', 'desenvolvedor', 'erro', 'problema'],
            response: "Entendido! Se a sua dúvida não pôde ser resolvida de forma automatizada, este chat foi encaminhado ao suporte do desenvolvedor humano. Fique à vontade para detalhar o problema, responderemos o mais rápido possível!"
        }
    ];

    const customFaqs = igrejaData?.bot_faq || [];
    const allFaqs = [...customFaqs, ...defaultFaqs];

    for (const faq of allFaqs) {
        if (faq.keywords) {
            let kwList: string[] = [];
            if (Array.isArray(faq.keywords)) {
                kwList = faq.keywords;
            } else if (typeof faq.keywords === 'string') {
                kwList = faq.keywords.split(',').map((k: string) => k.trim());
            }
            
            const matched = kwList.some((kw: string) => {
                const cleanKw = kw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                return cleanKw.length > 2 && textBase.includes(cleanKw);
            });
            if (matched) return faq.response;
        }
    }
    return null;
};

export const FloatingChatWidget = () => {
    const context = useContext(ChurchContext);
    if (!context || !context.user) return null;
    const { db, user, dbFirestore, appId, callGeminiAI, addToast } = context;
    const [isOpen, setIsOpen] = useState(false);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Reposition states
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const dragStart = useRef({ x: 0, y: 0 });
    const offsetStart = useRef({ x: 0, y: 0 });
    const isMoving = useRef(false);
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return; // Only left button
        dragStart.current = { x: e.clientX, y: e.clientY };
        offsetStart.current = { ...offset };
        isMoving.current = false;
        
        const onMouseMove = (moveEvent: MouseEvent) => {
            const dx = moveEvent.clientX - dragStart.current.x;
            const dy = moveEvent.clientY - dragStart.current.y;
            if (Math.hypot(dx, dy) > 5) {
                isMoving.current = true;
                setIsDragging(true);
                setOffset({
                    x: offsetStart.current.x + dx,
                    y: offsetStart.current.y + dy
                });
            }
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            setTimeout(() => {
                setIsDragging(false);
            }, 50);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        dragStart.current = { x: touch.clientX, y: touch.clientY };
        offsetStart.current = { ...offset };
        isMoving.current = false;

        const onTouchMove = (moveEvent: TouchEvent) => {
            const touchMove = moveEvent.touches[0];
            const dx = touchMove.clientX - dragStart.current.x;
            const dy = touchMove.clientY - dragStart.current.y;
            if (Math.hypot(dx, dy) > 5) {
                isMoving.current = true;
                setIsDragging(true);
                setOffset({
                    x: offsetStart.current.x + dx,
                    y: offsetStart.current.y + dy
                });
            }
        };

        const onTouchEnd = () => {
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
            setTimeout(() => {
                setIsDragging(false);
            }, 50);
        };

        document.addEventListener('touchmove', onTouchMove, { passive: true });
        document.addEventListener('touchend', onTouchEnd);
    };
    
    // Suporte apenas no módulo administrador (quem está logado)
    if (!user || user.id === 'dev') return null;

    const chat = db?.support_chats?.find((c: any) => c.user_id === user.id) || null;
    const messages = chat ? chat.messages : [];
    const status = chat?.status || 'bot';

    const botName = db?.igreja?.bot_name || 'Mary (Assistente Virtual)';
    const botAvatar = db?.igreja?.bot_avatar || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200';
    const botWelcome = db?.igreja?.bot_welcome || 'Olá 👋 Sou a assistente virtual Mary. Como posso ajudar você hoje?';

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    }, [isOpen, messages.length]);

    const handleSend = async () => {
        if (!text.trim()) return;
        setLoading(true);
        const userText = text;
        const newMessage = {
            id: String(Date.now()),
            sender_type: 'user',
            sender_name: user.nome,
            text: userText,
            timestamp: new Date().toISOString()
        };
        
        const currentMessages = [...messages, newMessage];
        setText("");
        
        const chatId = chat ? chat.id : `chat_${user.id}`;
        
        const chatData = {
            id: chatId,
            user_id: user.id,
            user_name: user.nome,
            status: status, // bot or human
            updated_at: new Date().toISOString(),
            messages: currentMessages
        };

        try {
            // Save user message first to Firebase
            if (dbFirestore && appId) {
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'support_chats', chatId), chatData);
            }
            
            // Generate bot response if status is bot
            if (status === 'bot') {
                // Step 1: Check keywords in Local FAQ first!
                const matchedResponse = findAutomaticAnswer(userText, db?.igreja);
                
                let botReply = "";
                if (matchedResponse) {
                    // Simulate thinking delay for better UX
                    await new Promise(resolve => setTimeout(resolve, 800));
                    botReply = matchedResponse;
                } else {
                    // Step 2: Fallback to calling Gemini AI with enriched church parameters
                    const churchInstructions = db?.igreja?.bot_instructions || '';
                    const aiPrompt = `Você é o assistente virtual de suporte técnico chamado '${botName}' do sistema GIPP (Gestão Integrada de Assembleias de Deus e Igrejas Pentecostais), prestando assistência para a membresia da igreja '${db?.igreja?.nome || 'nossa igreja Partner'}'.
Informações Adicionais para Contexto:
- Nome da Igreja: ${db?.igreja?.nome || 'Assembleia de Deus'}
- Pastor Presidente: ${db?.igreja?.pastor || 'Não informado'}
- Chave PIX Cadastrada: ${db?.igreja?.chave_pix || 'Não configurada'}
- Denominação / Convenção: ${db?.igreja?.canon_denom || 'Assembleia de Deus'} / ${db?.igreja?.canon_convencao_estadual || 'Não informada'}
- Diretriz de Comportamento / FAQ Extra: ${churchInstructions}

Mensagem/Dúvida do Usuário: "${userText}"
Histórico recente do chat (últimas mensagens): ${messages.slice(-3).map((m: any) => `${m.sender_name}: ${m.text}`).join('\n')}

Gere uma resposta de suporte operacional muito educada, curta (máximo de 2 parágrafos objetivos), focada em ajudar o operador. Se a solicitação relatar algum problema de falha grave, oriente de forma empática e informe que a pendência também foi sinalizada aos desenvolvedores para intervenção humana em breve.`;
                    
                    if (callGeminiAI) {
                        botReply = await callGeminiAI(aiPrompt);
                    } else {
                        botReply = "Assistente temporariamente offline para manutenção.";
                    }
                }

                const botMessage = {
                    id: String(Date.now() + 1),
                    sender_type: 'bot',
                    sender_name: botName,
                    text: botReply,
                    timestamp: new Date().toISOString()
                };
                
                chatData.messages.push(botMessage);
                chatData.updated_at = new Date().toISOString();
                if (dbFirestore && appId) {
                    await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'support_chats', chatId), chatData);
                }
            }
        } catch (e) {
            console.error("Erro no chat", e);
        } finally {
            setLoading(false);
        }
    };

    const lastMsgAlt = messages[messages.length - 1];
    const hasUnread = lastMsgAlt && lastMsgAlt.sender_type !== 'user';

    return (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[9999]" style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}>
            {isOpen && (
                <div className="bg-white border text-slate-800 shadow-2xl rounded-3xl w-[360px] h-[520px] flex flex-col mb-4 overflow-hidden animate-entrance right-0 origin-bottom-right">
                    {/* Header estilo telecomunicações */}
                    <div 
                        className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 text-white p-4 flex items-center justify-between shadow-md cursor-grab active:cursor-grabbing select-none touch-none"
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleTouchStart}
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <img src={botAvatar} className="w-10 h-10 rounded-full border-2 border-white/20 bg-white/20 object-cover" alt="Avatar Assistente" referrerPolicy="no-referrer"/>
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-indigo-600 rounded-full"></span>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm tracking-wide">{botName}</h3>
                                <div className="text-[10px] text-indigo-100 flex items-center gap-1 font-medium bg-white/10 px-2 py-0.5 rounded-full mt-0.5 w-fit">
                                    {status === 'bot' ? 'Autobot Inteligente Ativo' : 'Suporte Humano Conectado'}
                                </div>
                            </div>
                        </div>
                        <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} 
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                            className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1.5 rounded-full cursor-pointer"
                        >
                            <X size={18}/>
                        </button>
                    </div>
                    
                    {/* Chat Messages flow */}
                    <div className="flex-1 overflow-y-auto p-4 bg-[#f8fafc] space-y-4 text-sm custom-scrollbar">
                        {/* Welcome message bubble */}
                        <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{botName}</span>
                            </div>
                            <div className="bg-white border rounded-2xl rounded-tl-none p-3 shadow-sm text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                                {botWelcome}
                            </div>
                        </div>

                        {messages.map((m: any, i: number) => (
                            <div key={m.id || i} className={`flex flex-col gap-1 ${m.sender_type === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className="text-[9px] font-bold text-slate-400 px-1">{m.sender_type === 'user' ? 'Você' : m.sender_name}</div>
                                <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] shadow-sm ${m.sender_type === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border text-slate-700 rounded-tl-none font-medium'}`}>
                                    <div className="whitespace-pre-wrap leading-relaxed text-xs md:text-sm">{m.text}</div>
                                </div>
                                <span className="text-[9px] text-slate-400 px-1 font-medium">{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex gap-1.5 text-indigo-600 px-3 py-1 bg-white rounded-full border shadow-sm w-fit items-center animate-pulse">
                                <span className="text-[10px] font-black uppercase tracking-wider">Digitando</span>
                                <span className="animate-bounce">●</span>
                                <span className="animate-bounce" style={{animationDelay:'0.2s'}}>●</span>
                                <span className="animate-bounce" style={{animationDelay:'0.4s'}}>●</span>
                            </div>
                        )}
                        <div ref={bottomRef}></div>
                    </div>
                    
                    {/* Message input */}
                    <div className="p-3 bg-white border-t flex gap-2 items-center">
                        <input 
                            type="text" 
                            className="flex-1 border-0 bg-slate-100 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow text-slate-800 placeholder-slate-400"
                            placeholder="Escreva sua dúvida ou mensagem de suporte..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            disabled={loading}
                        />
                        <button 
                            type="button"
                            onClick={handleSend} 
                            disabled={loading || !text.trim()} 
                            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md flex items-center justify-center shrink-0 cursor-pointer"
                        >
                            <Send size={18}/>
                        </button>
                    </div>
                </div>
            )}
            
            {/* Pulsing launcher button */}
            <button 
                type="button"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onClick={(e) => {
                    if (isMoving.current) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }
                    setIsOpen(!isOpen);
                }}
                className={`${isOpen ? 'bg-slate-800 animate-none' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95'} text-white p-4.5 rounded-full shadow-2xl transition-all flex items-center justify-center relative ml-auto cursor-grab active:cursor-grabbing select-none touch-none`}
                title="Arraste para reposicionar ou clique para conversar"
            >
                {isOpen ? <X size={24}/> : <MessageCircle size={28}/>}
                {!isOpen && hasUnread && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-2 border-white animate-pulse text-[10px] font-black text-white flex items-center justify-center shadow-lg">!</span>
                )}
            </button>
        </div>
    );
};

export default FloatingChatWidget;

import React, { useState, useContext } from "react";
import { Heart, MessageCircle, Send, Trash2, Clock, User, Sparkles, RefreshCw, MessageSquare, AlertCircle, Loader2, Send as SendIcon } from "lucide-react";
import { ChurchContext } from "../context/ChurchContext";
import { Button, formatDateLocal } from "../utils/sharedHelpers";

const PortalMural = ({ user, db }) => {
    const { addToast, dbFirestore, appId, collection, addDoc, setDoc, doc, deleteDoc, setConfirmDialog } = useContext(ChurchContext);
    const [novoPost, setNovoPost] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const posts = (db.mural || []).sort((a, b) => new Date(b.data || 0).getTime() - new Date(a.data || 0).getTime());

    const handlePost = async () => {
        if (!novoPost.trim()) return addToast("Escreva algo antes de publicar.", "warning");
        setIsSaving(true);
        try {
            const post = {
                tipo: 'oracao',
                texto: novoPost,
                autor_id: user?.id || 'membro_anonimo',
                autor_nome: user?.nome || 'Membro do Portal',
                autor_foto: user?.foto || null,
                data: new Date().toISOString(),
                oradores: [] 
            };
            await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'mural'), post);
            addToast("Publicado com sucesso!", "success");
            setNovoPost('');
        } catch (e) {
            addToast("Erro ao publicar.", "error");
        }
        setIsSaving(false);
    };

    const handleTogglePray = async (post) => {
        try {
            const oradores = post.oradores || [];
            const userId = user?.id || '';
            if (!userId) return;
            const isPraying = oradores.includes(userId);
            const novosOradores = isPraying ? oradores.filter(id => id !== userId) : [...oradores, userId];
            
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'mural', post.id), { oradores: novosOradores }, { merge: true });
        } catch(e) {
            addToast("Erro ao interagir.", "error");
        }
    };

    const handleDeletePost = async (id) => {
        setConfirmDialog({
            isOpen: true,
            title: "Apagar Publicação",
            message: "Deseja apagar esta publicação?",
            confirmText: "Apagar",
            cancelText: "Cancelar",
            variant: "danger",
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'mural', id));
                    addToast("Publicação apagada.", "success");
                } catch(e) {
                    addToast("Erro ao apagar.", "error");
                }
            }
        });
    };

    return (
        <div className="space-y-6 animate-entrance pb-10 max-w-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-rose-50 rounded-2xl text-rose-500 shadow-sm"><Heart size={28}/></div>
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Mural de Oração</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Compartilhe seus pedidos com a igreja</p>
                </div>
            </div>

            <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-200">
                <div className="flex gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 shrink-0 overflow-hidden border border-slate-200 shadow-inner">
                        {user?.foto ? <img src={user.foto} className="w-full h-full object-cover" /> : (user?.nome ? user.nome.charAt(0) : '?')}
                    </div>
                    <div className="flex-1 min-w-0">
                        <textarea 
                            value={novoPost}
                            onChange={e => setNovoPost((e.target.value || "").toUpperCase())}
                            placeholder="Partilhe um pedido de oração com a igreja..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-semibold focus:ring-2 focus:ring-rose-500 outline-none resize-none min-h-[100px] mb-3 text-slate-800"
                        ></textarea>
                        <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4">
                            <Button onClick={handlePost} disabled={isSaving || !novoPost.trim()} variant="danger" className="py-2.5 px-6 shadow-md text-xs w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2">
                                {isSaving ? <Loader2 size={16} className="animate-spin"/> : <SendIcon size={16}/>} Publicar Pedido
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {posts.map(post => {
                        const oradores = post.oradores || [];
                        const isPraying = user?.id ? oradores.includes(user.id) : false;
                        
                        // Formatação ultra defensiva de data
                        let dataFormatada = 'Data Indefinida';
                        try {
                            if (post.data) {
                                const parsedDate = new Date(post.data);
                                if (!isNaN(parsedDate.getTime())) {
                                    dataFormatada = parsedDate.toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
                                }
                            }
                        } catch (err) {
                            console.warn("Erro ao formatar data de postagem:", err);
                        }

                        return (
                            <div key={post.id} className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-200 transition-all hover:border-slate-300 flex flex-col justify-between overflow-hidden">
                                <div>
                                    <div className="flex justify-between items-start mb-4 gap-2">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 shrink-0 overflow-hidden border border-slate-200 shadow-inner">
                                                {post.autor_foto ? <img src={post.autor_foto} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : (post.autor_nome ? post.autor_nome.charAt(0) : '?')}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-black text-slate-800 leading-tight mb-0.5 truncate">{post.autor_nome || 'Membro do Portal'}</p>
                                                <div className="flex flex-wrap items-center gap-y-1 gap-x-2">
                                                    <p className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{dataFormatada}</p>
                                                    <span className="text-slate-300 hidden sm:inline">•</span>
                                                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border shadow-2xs bg-rose-50 text-rose-600 border-rose-200 whitespace-nowrap">
                                                        Pedido de Oração
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {post.autor_id === user?.id && (
                                            <button onClick={() => handleDeletePost(post.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0 cursor-pointer">
                                                <Trash2 size={16}/>
                                            </button>
                                        )}
                                    </div>
                                    
                                    <p className="text-sm md:text-base text-slate-700 whitespace-pre-wrap leading-relaxed mb-6 font-medium break-words">
                                        {post.texto}
                                    </p>
                                </div>
                                
                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto gap-4">
                                    <div className="flex items-center gap-2 max-w-full overflow-hidden">
                                        <button 
                                            onClick={() => handleTogglePray(post)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold transition-all border shadow-2xs cursor-pointer select-none shrink-0 ${isPraying ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                        >
                                            <Heart size={14} className={isPraying ? 'fill-rose-500 text-rose-500 animate-pulse' : 'text-slate-400'}/>
                                            {isPraying ? 'Estou orando' : 'Orar por isto'}
                                        </button>
                                        {oradores.length > 0 && (
                                            <span className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-2 rounded-xl border border-slate-100 shrink-0">
                                                {oradores.length} {oradores.length === 1 ? 'oração' : 'orações'}
                                            </span>
                                        )}
                                    </div>
                                    {!isPraying && (
                                        <span className="text-[10px] text-slate-400 hidden lg:block italic">Clique para apoiar.</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <Heart size={48} className="mx-auto text-slate-200 mb-4"/>
                    <h4 className="text-xl font-bold text-slate-600 mb-1">Mural Vazio</h4>
                    <p className="text-sm text-slate-500">Seja o primeiro a partilhar um pedido de oração com os irmãos.</p>
                </div>
            )}
        </div>
    );
};

export default PortalMural;
export { PortalMural };

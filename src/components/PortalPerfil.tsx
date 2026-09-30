import React, { useState, useContext } from "react";
import { User, Mail, Phone, Calendar, Lock, Bell, Save, Check, RefreshCw, Send, Smartphone, Loader2, Sparkles, UserCheck, ChevronLeft } from "lucide-react";
import { ChurchContext } from "../context/ChurchContext";
import { Button, FormInput, formatDateLocal, playNotificationSound } from "../utils/sharedHelpers";

const PortalPerfil = ({ user, db, setView }) => {
    const { setDoc, doc, dbFirestore, appId, addToast, logAction } = useContext(ChurchContext);
    const [formData, setFormData] = useState({
        nome: user.nome || '',
        email: user.email || '',
        telefone: user.telefone || '',
        dataNascimento: user.dataNascimento || '',
        senha_portal: user.senha_portal || user.senha || '123',
        notify_escala: user.notify_escala !== false,
        notify_agenda: user.notify_agenda !== false,
        notify_eventos: user.notify_eventos !== false
    });
    const [saving, setSaving] = useState(false);

    const handleTestNotification = async () => {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            addToast("As notificações nativas não são suportadas neste navegador.", "warning");
            return;
        }
        
        let permission = Notification.permission;
        if (permission !== 'granted') {
            addToast("Para receber o teste, por favor autorize a permissão no navegador.", "info");
            permission = await Notification.requestPermission();
        }

        if (permission === 'granted') {
            addToast("🔔 Disparando teste de Notificação Local & segundo plano! Verifique sua barra de status.", "success");
            playNotificationSound();
            
            // Tenta disparar via Service Worker registrado (segundo plano nativo)
            if ('serviceWorker' in navigator) {
                try {
                    const reg = await navigator.serviceWorker.ready;
                    reg.showNotification("🔔 Teste Push Conectado!", {
                        body: "Este é um teste oficial de alertas em tempo real do GIPP. Se você está vendo isso, o seu smartphone/computador está pronto!",
                        icon: db.igreja?.icone_sistema || "https://cdn-icons-png.flaticon.com/512/3004/3004613.png",
                        badge: db.igreja?.icone_sistema || "https://cdn-icons-png.flaticon.com/512/3004/3004613.png",
                        vibrate: [200, 100, 200],
                        data: { url: "/#portal_more" }
                    } as any);
                } catch (swErr) {
                    new Notification("🔔 Teste Alerta GIPP", {
                        body: "Seu navegador está configurado para receber notificações nos portais do GIPP!",
                        icon: db.igreja?.icone_sistema || "https://cdn-icons-png.flaticon.com/512/3004/3004613.png",
                    });
                }
            } else {
                new Notification("🔔 Teste Alerta GIPP", {
                    body: "Seu navegador está configurado para receber notificações nos portais do GIPP!",
                    icon: db.igreja?.icone_sistema || "https://cdn-icons-png.flaticon.com/512/3004/3004613.png"
                });
            }
        } else {
            addToast("As notificações foram bloqueadas/negadas. Por favor reative-as nas configurações do site no seu navegador.", "error");
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const userRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'membros', user.id);
            await setDoc(userRef, {
                ...formData
            }, { merge: true });
            
            logAction('EDIÇÃO', `Membro atualizou seus dados cadastrais e preferências de notificação push`, 'membros', user.id);
            addToast("Perfil e preferências de notificação atualizados com sucesso!", "success");
            setView('portal_home');
        } catch (error) {
            console.error(error);
            addToast("Erro ao salvar alterações no perfil.", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-entrance pb-10">
            {/* Header consolidado com visual robusto */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-slate-100 shadow-xs">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        <UserCheck size={28} className="text-emerald-500" />
                        Perfil do Membro
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">Gerencie suas credenciais de segurança e atualize suas informações cadastrais em tempo real.</p>
                </div>
                <button onClick={() => setView('portal_home')} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer">
                    <ChevronLeft size={16} /> Voltar ao Painel
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Painel Esquerdo (Dados de Resumo & Visuals) */}
                <div className="lg:col-span-4 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-between min-h-[500px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full pointer-events-none"></div>
                    
                    <div className="w-full relative z-10 text-center space-y-6 flex-1 flex flex-col justify-center">
                        <div className="relative inline-block mx-auto">
                            <div className="w-28 h-28 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-[2rem] flex items-center justify-center font-black text-4xl mx-auto border-8 border-slate-100 shadow-xl transition-transform duration-500 group-hover:scale-105">
                                {formData.nome ? formData.nome.charAt(0) : '?'}
                            </div>
                            <span className="absolute -bottom-1 -right-1 bg-emerald-500 border-4 border-white w-7 h-7 rounded-full flex items-center justify-center text-white" title="Status Online">
                                <span className="w-2.5 h-2.5 bg-emerald-200 rounded-full animate-ping"></span>
                            </span>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-black text-slate-800 truncate px-2">{formData.nome || 'Membro do Sistema'}</h3>
                            <p className="text-[10px] text-indigo-600 bg-indigo-50 px-3.5 py-1.5 rounded-full font-black uppercase tracking-wider inline-block mt-2 border border-indigo-100 shadow-2xs">
                                {user.funcao_administrativa && user.funcao_administrativa !== 'NENHUMA' ? user.funcao_administrativa : (user.cargo || 'Membro Oficial')}
                            </p>
                        </div>

                        {/* Metadados do Sistema para preencher a tela */}
                        <div className="space-y-3 pt-6 border-t border-slate-150 w-full text-left">
                            <div className="flex items-center justify-between text-xs py-1">
                                <span className="font-bold text-slate-400">Congregação:</span>
                                <span className="font-extrabold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md uppercase text-[10px]">
                                    {user.congregacao_id === 'sede' || !user.congregacao_id ? 'Tempo Sede' : 'Filial Registrada'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs py-1">
                                <span className="font-bold text-slate-400">Admissão:</span>
                                <span className="font-extrabold text-slate-600">
                                    {user.dataAdmissao ? formatDateLocal(user.dataAdmissao) : 'Não Informada'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs py-1">
                                <span className="font-bold text-slate-400">ID Eletrônico:</span>
                                <span className="font-mono text-slate-400 text-[10px] truncate max-w-[140px]">{user.id}</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full pt-6 border-t border-slate-100 relative z-10 text-center">
                        <p className="text-slate-400 text-[10px] font-bold leading-relaxed">
                            As atualizações de dados sensíveis devem ser protocoladas diretamente perante a secretaria administrativa de sua congregação.
                        </p>
                    </div>
                </div>

                {/* Painel Direito (Formulário Otimizado e Expandido) */}
                <div className="lg:col-span-8 bg-white p-8 md:p-10 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="mb-6">
                            <h3 className="text-xl font-extrabold text-slate-800">Ficha Informativa & Credenciais</h3>
                            <p className="text-xs text-slate-400 font-medium">Os campos abaixo refletem sua identificação oficial sincronizada em nuvem.</p>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={formData.nome} 
                                            onChange={e=>setFormData({...formData, nome: (e.target.value || "").toUpperCase()})} 
                                            required 
                                            className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 outline-none text-xs font-black bg-slate-50/50 focus:bg-white focus:border-emerald-500 transition-all text-slate-800 uppercase shadow-inner" 
                                        />
                                        <User size={16} className="absolute left-4 top-4 text-slate-400" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Endereço de E-mail</label>
                                    <div className="relative">
                                        <input 
                                            type="email" 
                                            value={formData.email} 
                                            onChange={e=>setFormData({...formData, email: e.target.value})} 
                                            className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 outline-none text-xs font-black bg-slate-50/50 focus:bg-white focus:border-emerald-500 transition-all text-slate-800 shadow-inner" 
                                        />
                                        <Mail size={16} className="absolute left-4 top-4 text-slate-400" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Telemóvel / Celular</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={formData.telefone} 
                                            onChange={e=>setFormData({...formData, telefone: (e.target.value || "").toUpperCase()})} 
                                            placeholder="(11) 98765-4321" 
                                            className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 outline-none text-xs font-black bg-slate-50/50 focus:bg-white focus:border-emerald-500 transition-all text-slate-800 uppercase shadow-inner" 
                                        />
                                        <Phone size={16} className="absolute left-4 top-4 text-slate-400" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Data de Nascimento</label>
                                    <div className="relative">
                                        <input 
                                            type="date" 
                                            value={formData.dataNascimento} 
                                            onChange={e=>setFormData({...formData, dataNascimento: e.target.value})} 
                                            className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 outline-none text-xs font-black bg-slate-50/50 focus:bg-white focus:border-emerald-500 transition-all text-slate-800 shadow-inner" 
                                        />
                                        <Calendar size={16} className="absolute left-4 top-4 text-slate-400" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nova Senha do Portal</label>
                                    <div className="relative">
                                        <input 
                                            type="password" 
                                            value={formData.senha_portal} 
                                            onChange={e=>setFormData({...formData, senha_portal: e.target.value})} 
                                            required 
                                            className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 outline-none text-xs font-black bg-slate-50/50 focus:bg-white focus:border-emerald-500 transition-all text-slate-800 shadow-inner" 
                                        />
                                        <Lock size={16} className="absolute left-4 top-4 text-slate-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 border-t border-slate-100 pt-6">
                                <div>
                                    <h4 className="text-sm font-extrabold text-slate-800">Preferências de Notificações Push (FCM)</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Selecione quais alertas instantâneos deseja que cheguem a seu smartphone</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <label className="p-4 rounded-2xl border border-slate-150 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between cursor-pointer select-none">
                                        <div>
                                            <span className="text-xs font-black text-slate-700 block">Minhas Escalas</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Escalas de voluntariado</span>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={formData.notify_escala} 
                                            onChange={e => setFormData({ ...formData, notify_escala: e.target.checked })}
                                            className="w-5 h-5 accent-emerald-500 rounded"
                                        />
                                    </label>

                                    <label className="p-4 rounded-2xl border border-slate-150 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between cursor-pointer select-none">
                                        <div>
                                            <span className="text-xs font-black text-slate-700 block">Agenda Oficial</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Estudos & cultos</span>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={formData.notify_agenda} 
                                            onChange={e => setFormData({ ...formData, notify_agenda: e.target.checked })}
                                            className="w-5 h-5 accent-emerald-500 rounded"
                                        />
                                    </label>

                                    <label className="p-4 rounded-2xl border border-slate-150 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between cursor-pointer select-none">
                                        <div>
                                            <span className="text-xs font-black text-slate-700 block">Eventos da Igreja</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Festas e conferências</span>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={formData.notify_eventos} 
                                            onChange={e => setFormData({ ...formData, notify_eventos: e.target.checked })}
                                            className="w-5 h-5 accent-emerald-500 rounded"
                                        />
                                    </label>
                                </div>

                                {/* Botão de Teste de Notificação Local / PWA */}
                                <div className="p-5 mt-4 bg-gradient-to-r from-emerald-50 to-teal-50/40 border border-emerald-100 rounded-2xl">
                                    <h4 className="text-xs font-black text-emerald-900 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                                        <Smartphone size={14} className="text-emerald-600 animate-pulse" />
                                        Teste de Conectividade Push
                                    </h4>
                                    <p className="text-[11px] text-emerald-700 mt-1 font-semibold">
                                        Verifique instantaneamente se seu dispositivo (Android, iOS ou Windows) e o navegador atual estão configurados para exibir as notificações reais da congregação.
                                    </p>
                                    <div className="mt-3.5 flex flex-wrap gap-3 items-center">
                                        <button 
                                            type="button" 
                                            onClick={handleTestNotification}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-transform flex items-center gap-1.5 cursor-pointer shadow-xs"
                                        >
                                            <Bell size={12} /> Testar Notificações
                                        </button>
                                        <span className="text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                                            Status: {typeof window !== 'undefined' && 'Notification' in window ? Notification.permission.toUpperCase() : 'NÃO SUPORTADO'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-slate-100">
                                <button type="button" onClick={()=>setView('portal_home')} className="flex-1 py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer">Cancelar</button>
                                <button type="submit" disabled={saving} className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer">
                                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={16} />}
                                    {saving ? 'A Processar...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortalPerfil;
export { PortalPerfil };

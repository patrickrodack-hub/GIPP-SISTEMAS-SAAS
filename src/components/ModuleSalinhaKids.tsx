import React, { useState, useEffect, useContext, useMemo } from 'react';
import { 
  Baby, Heart, ShieldAlert, FileText, UserPlus, Search, Plus, Trash2, Edit, Calendar, Clock, Phone, AlertTriangle, Check, CheckCircle2, Volume2, Share2, HelpCircle, Activity, HeartHandshake, Eye, Users, FileBarChart, Bell, Sparkles, Send, MapPin, Smile
} from 'lucide-react';
import { collection, doc, addDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { ChurchContext } from '../App';

// Custom interface for typescript safety
export interface Crianca {
  id: string;
  nome: string;
  data_nascimento: string;
  responsavel_membro_id: string; // ID do pai/responsável na tabela membros
  alergias: string;
  restricoes_medicamentos: string;
  is_especial: boolean;
  detalhes_especial: string;
  tipo_sanguineo: string;
  congregacao_id: string;
}

export interface KidsPresence {
  id: string;
  crianca_id: string;
  data: string;
  status: 'presente' | 'ausente';
  congregacao_id: string;
}

export interface KidsOcorrencia {
  id: string;
  crianca_id: string;
  titulo: string;
  descricao: string;
  data: string;
  hora: string;
  gravidade: 'normal' | 'URGENTE';
  urgente_mensagem: string;
  status: 'pendente' | 'notificado' | 'resolvido';
  congregacao_id: string;
}

interface ModuleSalinhaKidsProps {
  mode?: 'admin' | 'portal';
}

const ModuleSalinhaKids: React.FC<ModuleSalinhaKidsProps> = ({ mode = 'admin' }) => {
  const { db, addToast, dbFirestore, appId, user } = useContext(ChurchContext);
  const [tab, setTab] = useState(1); // 1: Dashboard, 2: Crianças, 3: Freguência, 4: Ocorrências
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form States for Child CRUD
  const [childModalOpen, setChildModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Crianca | null>(null);
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [parentId, setParentId] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medRestrictions, setMedRestrictions] = useState('');
  const [isSpecial, setIsSpecial] = useState(false);
  const [specialDetails, setSpecialDetails] = useState('');
  const [bloodType, setBloodType] = useState('O+');

  // Form States for Attendance
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [tempPresences, setTempPresences] = useState<Record<string, boolean>>({});

  // Form States for Occurrence Record
  const [occModalOpen, setOccModalOpen] = useState(false);
  const [occChildId, setOccChildId] = useState('');
  const [occTitle, setOccTitle] = useState('');
  const [occDesc, setOccDesc] = useState('');
  const [occSeverity, setOccSeverity] = useState<'normal' | 'URGENTE'>('normal');
  const [occUrgentMsg, setOccUrgentMsg] = useState('');

  // Active Alert in Portal
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Record<string, boolean>>({});

  const isPastorOrLeader = useMemo(() => {
    if (!user) return false;
    const cargoLower = (user.cargo || '').toLowerCase();
    const funcaoLower = (user.funcao || '').toLowerCase();
    const nivelLower = (user.nivel || '').toLowerCase();
    return (
      nivelLower === 'master' || 
      nivelLower === 'pastor' || 
      cargoLower.includes('pastor') || 
      funcaoLower.includes('pastor') || 
      cargoLower.includes('lider') || 
      funcaoLower.includes('lider') ||
      cargoLower.includes('diretor') ||
      (user.permissoes && user.permissoes.includes('access_membros'))
    );
  }, [user]);

  // Is UI in admin Mode (Full Access)?
  const isEditingAllowed = mode === 'admin' || (mode === 'portal' && isPastorOrLeader);

  // Filters current list based on congregation tenant
  const kidsList = useMemo(() => {
    const rawKids = db.kids_criancas || [];
    return rawKids.filter((k: any) => {
      if (user.nivel === 'master') return true;
      const childBranch = k.congregacao_id || 'sede';
      const userBranch = user.congregacao_id || 'sede';
      return childBranch === userBranch;
    });
  }, [db.kids_criancas, user]);

  const sortedKidsList = useMemo(() => {
    return [...kidsList].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [kidsList]);

  // Filters current instances based on searchTerm
  const filteredKids = useMemo(() => {
    return sortedKidsList.filter((k: any) => {
      const respName = db.membros?.find((m: any) => m.id === k.responsavel_membro_id)?.nome || '';
      return (
        k.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.alergias?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.tipo_sanguineo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        respName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [sortedKidsList, searchTerm, db.membros]);

  const presencesList = useMemo(() => {
    return db.kids_presencas || [];
  }, [db.kids_presencas]);

  const occurrencesList = useMemo(() => {
    return db.kids_ocorrencias || [];
  }, [db.kids_ocorrencias]);

  // Parent view children
  const myChildren = useMemo(() => {
    if (mode !== 'portal') return [];
    return kidsList.filter((k: any) => k.responsavel_membro_id === user.id);
  }, [kidsList, user, mode]);

  // Active notifications for logged parent
  const activeMyUrgentOccurrences = useMemo(() => {
    if (mode !== 'portal') return [];
    const myKidsIds = myChildren.map(k => k.id);
    return occurrencesList.filter((o: any) => 
      myKidsIds.includes(o.crianca_id) && 
      o.gravidade === 'URGENTE' && 
      o.status !== 'resolvido' && 
      !acknowledgedAlerts[o.id]
    );
  }, [occurrencesList, myChildren, mode, acknowledgedAlerts]);

  // Automatically trigger voice alert system on sudden new occurrences
  useEffect(() => {
    if (activeMyUrgentOccurrences.length > 0) {
      try {
        const synth = window.speechSynthesis;
        if (synth) {
          const uff = new SpeechSynthesisUtterance("Alerta urgente da salha kids! Seu filho necessita de você.");
          uff.lang = 'pt-BR';
          synth.speak(uff);
        }
      } catch (err) {
        console.error("SpeechSynthesis error:", err);
      }
    }
  }, [activeMyUrgentOccurrences]);

  // Load selected values on edit
  const openEditChildModal = (child: Crianca) => {
    setSelectedChild(child);
    setName(child.nome);
    setBirthDate(child.data_nascimento);
    setParentId(child.responsavel_membro_id);
    setAllergies(child.alergias || '');
    setMedRestrictions(child.restricoes_medicamentos || '');
    setIsSpecial(child.is_especial || false);
    setSpecialDetails(child.detalhes_especial || '');
    setBloodType(child.tipo_sanguineo || 'O+');
    setChildModalOpen(true);
  };

  const openNewChildModal = () => {
    setSelectedChild(null);
    setName('');
    setBirthDate('');
    setParentId('');
    setAllergies('');
    setMedRestrictions('');
    setIsSpecial(false);
    setSpecialDetails('');
    setBloodType('O+');
    setChildModalOpen(true);
  };

  // CRUD child operations
  const handleSaveChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !birthDate || !parentId) {
      addToast('Por favor, preencha o Nome, Data Nascimento e Responsável.', 'error');
      return;
    }

    const payload = {
      nome: name,
      data_nascimento: birthDate,
      responsavel_membro_id: parentId,
      alergias: allergies,
      restricoes_medicamentos: medRestrictions,
      is_especial: isSpecial,
      detalhes_especial: isSpecial ? specialDetails : '',
      tipo_sanguineo: bloodType,
      congregacao_id: user.congregacao_id || 'sede'
    };

    try {
      if (selectedChild) {
        const docRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'kids_criancas', selectedChild.id);
        await updateDoc(docRef, payload);
        addToast('Cadastro da criança atualizado com sucesso!', 'success');
      } else {
        const colRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'kids_criancas');
        await addDoc(colRef, payload);
        addToast('Criança cadastrada com sucesso na Salinha Kids!', 'success');
      }
      setChildModalOpen(false);
    } catch (err: any) {
      addToast(`Erro ao salvar cadastro: ${err.message}`, 'error');
    }
  };

  const handleDeleteChild = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover esta criança?')) return;
    try {
      const docRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'kids_criancas', id);
      await deleteDoc(docRef);
      addToast('Criança removida com sucesso.', 'success');
    } catch (err: any) {
      addToast(`Erro ao remover: ${err.message}`, 'error');
    }
  };

  // Sync state with selected date pre-sets on Attendance tab load
  useEffect(() => {
    const dayPres = presencesList.filter((p: any) => p.data === attendanceDate);
    const presMap: Record<string, boolean> = {};
    kidsList.forEach((k: any) => {
      const recorded = dayPres.find((p: any) => p.crianca_id === k.id);
      presMap[k.id] = recorded ? recorded.status === 'presente' : false;
    });
    setTempPresences(presMap);
  }, [attendanceDate, kidsList, presencesList]);

  // Bulk save attendance list
  const handleSaveAttendance = async () => {
    try {
      for (const kid of kidsList) {
        const isPres = tempPresences[kid.id] || false;
        const currentRec = presencesList.find((p: any) => p.crianca_id === kid.id && p.data === attendanceDate);
        
        const payload = {
          crianca_id: kid.id,
          data: attendanceDate,
          status: isPres ? 'presente' : 'ausente',
          congregacao_id: user.congregacao_id || 'sede'
        };

        if (currentRec) {
          const docRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'kids_presencas', currentRec.id);
          await updateDoc(docRef, payload as any);
        } else {
          const colRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'kids_presencas');
          await addDoc(colRef, payload);
        }
      }
      addToast('Frequência da Salinha Kids salva com sucesso!', 'success');
    } catch (err: any) {
      addToast(`Erro ao salvar frequência: ${err.message}`, 'error');
    }
  };

  // Save new Occurrence record
  const handleSaveOccurrence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!occChildId || !occTitle || !occDesc) {
      addToast('Preencha os dados básicos da ocorrência.', 'error');
      return;
    }

    const childObj = kidsList.find((k: any) => k.id === occChildId);
    let finalUrgentMsg = occUrgentMsg;
    if (occSeverity === 'URGENTE' && !finalUrgentMsg) {
      finalUrgentMsg = `🚨 CHAMADO URGENTE DA SALINHA KIDS: Olá, precisamos de sua presença imediata na Salinha Kids para seu filho(a) ${childObj?.nome || 'sua criança'}. Por favor, compareça já!`;
    }

    const payload = {
      crianca_id: occChildId,
      titulo: occTitle,
      descricao: occDesc,
      data: new Date().toISOString().split('T')[0],
      hora: new Date().toTimeString().slice(0, 5),
      gravidade: occSeverity,
      urgente_mensagem: occSeverity === 'URGENTE' ? finalUrgentMsg : '',
      status: occSeverity === 'URGENTE' ? 'pendente' : 'resolvido',
      congregacao_id: user.congregacao_id || 'sede'
    };

    try {
      const colRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'kids_ocorrencias');
      const docAdded = await addDoc(colRef, payload);
      
      addToast(occSeverity === 'URGENTE' ? 'Ocorrência URGENTE criada! Alerta enviado para o Portal dos pais!' : 'Ocorrência registrada com sucesso.', 'success');
      
      // WhatsApp trigger shortcut for mobile/browser
      if (occSeverity === 'URGENTE' && childObj) {
        const parent = db.membros?.find((m: any) => m.id === childObj.responsavel_membro_id);
        if (parent && parent.celular) {
          const cleanPhone = parent.celular.replace(/\D/g, '');
          const waUrl = `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodeURIComponent(finalUrgentMsg)}`;
          
          if (window.confirm(`Deseja despachar a notificação também no WhatsApp do Responsável (${parent.nome}) agora mesmo?`)) {
            window.open(waUrl, '_blank');
          }
        } else {
          addToast('Nota: Responsável não tem celular cadastrado para envio via WhatsApp.', 'info');
        }
      }

      setOccModalOpen(false);
      setOccChildId('');
      setOccTitle('');
      setOccDesc('');
      setOccSeverity('normal');
      setOccUrgentMsg('');
    } catch (err: any) {
      addToast(`Erro ao registrar ocorrência: ${err.message}`, 'error');
    }
  };

  const handleResolveOccurrence = async (id: string) => {
    try {
      const docRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'kids_ocorrencias', id);
      await updateDoc(docRef, { status: 'resolvido' });
      addToast('Alerta de ocorrência marcado como Resolvido / Ciente.', 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const getUrgentWhatsAppLink = (occ: any) => {
    const child = kidsList.find((k: any) => k.id === occ.crianca_id);
    const parent = db.membros?.find((m: any) => m.id === child?.responsavel_membro_id);
    if (!parent || !parent.celular) return null;
    const cleanPhone = parent.celular.replace(/\D/g, '');
    const message = occ.urgente_mensagem || `Alerta urgente na Salinha Kids sobre seu filho(a) ${child?.nome || 'sua criança'}. Por favor compareça!`;
    return `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodeURIComponent(message)}`;
  };

  // Calculations for stats
  const stats = useMemo(() => {
    const total = kidsList.length;
    const special = kidsList.filter((k: any) => k.is_especial).length;
    const withAllergies = kidsList.filter((k: any) => k.alergias && k.alergias.trim() !== '').length;
    const activeOccs = occurrencesList.filter((o: any) => o.gravidade === 'URGENTE' && o.status !== 'resolvido').length;
    
    // Total present kids today
    const todayStr = new Date().toISOString().split('T')[0];
    const presentToday = presencesList.filter((p: any) => p.data === todayStr && p.status === 'presente').length;

    return { total, special, withAllergies, activeOccs, presentToday };
  }, [kidsList, occurrencesList, presencesList]);

  // View switch for Leadership users
  const [leadershipViewToggle, setLeadershipViewToggle] = useState(isEditingAllowed);

  return (
    <div className="h-full flex flex-col space-y-6 animate-entrance pb-10">
      {/* HEADER SECTION */}
      <div className="flex flex-wrap gap-4 justify-between items-center bg-white/40 p-4 rounded-2xl border border-white/50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl shadow-sm border border-rose-100">
            <Baby size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Salinha Kids</h2>
            <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">
              {isEditingAllowed ? 'Gestão de Crianças, Frequência, Alergias e Chamados de Emergência' : 'Portal de Acompanhamento dos Pais'}
            </p>
          </div>
        </div>
        {isEditingAllowed && mode === 'portal' && (
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button 
              onClick={() => { setLeadershipViewToggle(false); setTab(2); }} 
              className={`px-4 py-2 font-black text-xs uppercase rounded-lg transition-all ${!leadershipViewToggle ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Meus Filhos
            </button>
            <button 
              onClick={() => { setLeadershipViewToggle(true); setTab(1); }} 
              className={`px-4 py-2 font-black text-xs uppercase rounded-lg transition-all ${leadershipViewToggle ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/30' : 'text-slate-500 hover:text-rose-600'}`}
            >
              Painel Líder / Pastor
            </button>
          </div>
        )}
      </div>

      {/* PARENT ALERT BANNER */}
      {mode === 'portal' && activeMyUrgentOccurrences.length > 0 && (
        <div className="bg-rose-600 text-white px-6 py-5 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-4 animate-bounce border-4 border-rose-400">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white text-rose-600 rounded-full flex items-center justify-center animate-pulse shadow-md">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h4 className="text-xl font-bold tracking-tight">CHAMADO CRÍTICO DA SALINHA KIDS!</h4>
              <p className="text-sm text-rose-100 mt-1 max-w-xl font-medium">
                {activeMyUrgentOccurrences[0].urgente_mensagem || 'Sua presença imediata é solicitada com urgência na Salinha Kids.'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => handleResolveOccurrence(activeMyUrgentOccurrences[0].id)} 
            className="w-full md:w-auto px-6 py-3 bg-white text-rose-700 hover:bg-slate-50 border border-transparent hover:border-white rounded-xl font-black text-xs uppercase transition-all tracking-wider shadow-md shrink-0 focus:ring-4 focus:ring-rose-300"
          >
            Estou a Caminho! ➔
          </button>
        </div>
      )}

      {/* CORE WORKSPACE */}
      {(!isEditingAllowed || (mode === 'portal' && !leadershipViewToggle)) ? (
        // PARENT VIEW LOGIC
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* LEFT: MY REGISTERED CHILDREN LIST */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-black text-lg text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                <Smile className="text-rose-500" /> Minhas Crianças Cadastradas
              </h3>
              
              {myChildren.length === 0 ? (
                <div className="text-center py-10">
                  <Baby size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="font-bold text-slate-500">Nenhuma criança associada ao seu perfil.</p>
                  <p className="text-xs text-slate-400 mt-1">Peça aos líderes ou secretaria para cadastrarem seu filho(a) apontando você como responsável.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myChildren.map((kid: any) => {
                    // Filter attendance for this kid
                    const kidAtts = presencesList.filter((p: any) => p.crianca_id === kid.id);
                    // Filter occurrences
                    const kidOccs = occurrencesList.filter((o: any) => o.crianca_id === kid.id);
                    return (
                      <div key={kid.id} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center font-bold text-lg">
                              {kid.nome.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-black text-slate-800 text-md">{kid.nome}</h4>
                              <p className="text-xs font-bold text-slate-500">
                                Nascimento: {kid.data_nascimento.split('-').reverse().join('/')}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {kid.tipo_sanguineo && (
                              <span className="text-[10px] font-black uppercase bg-red-100 text-red-700 px-2.5 py-1 rounded-md border border-red-200">
                                Sangue: {kid.tipo_sanguineo}
                              </span>
                            )}
                            {kid.is_especial && (
                              <span className="text-[10px] font-black uppercase bg-purple-100 text-purple-700 px-2.5 py-1 rounded-md border border-purple-200" title={kid.detalhes_especial}>
                                Especial ✨
                              </span>
                            )}
                            {kid.alergias && (
                              <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md border border-amber-200" title={kid.alergias}>
                                Alergia: Sim ⚠️
                              </span>
                            )}
                          </div>
                        </div>

                        {/* MEDICAL AND ALLERGY DETAILS IF SPECIFIED */}
                        {(kid.alergias || kid.restricoes_medicamentos || kid.detalhes_especial) && (
                          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100/50 text-xs space-y-2">
                            {kid.alergias && (
                              <p className="text-slate-700"><span className="font-bold text-amber-700">Alergias:</span> {kid.alergias}</p>
                            )}
                            {kid.restricoes_medicamentos && (
                              <p className="text-slate-700"><span className="font-bold text-amber-700">Restrição Medicamento:</span> {kid.restricoes_medicamentos}</p>
                            )}
                            {kid.detalhes_especial && (
                              <p className="text-slate-700"><span className="font-bold text-purple-700">Atenção Especial:</span> {kid.detalhes_especial}</p>
                            )}
                          </div>
                        )}

                        {/* SUMMARY COUNTERS */}
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Presenças Registradas</span>
                            <span className="text-2xl font-black text-emerald-600 block mt-1">{kidAtts.filter((p: any) => p.status === 'presente').length}</span>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Ocorrências Atendidas</span>
                            <span className="text-2xl font-black text-slate-600 block mt-1">{kidOccs.length}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: PORTAL INCIDENT HISTORY & COMPLIANCE */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-black text-lg text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                <FileText className="text-orange-500" /> Histórico de Ocorrências
              </h3>
              
              <div className="space-y-3 max-h-[450px] overflow-y-auto custom-scrollbar pr-1">
                {myChildren.length > 0 && occurrencesList.filter((o: any) => myChildren.some(k => k.id === o.crianca_id)).length === 0 && (
                  <p className="text-xs text-slate-400 text-center italic py-10">Tudo maravilhoso! Nenhuma ocorrência listada para seus filhos.</p>
                )}
                {myChildren.length > 0 && occurrencesList.filter((o: any) => myChildren.some(k => k.id === o.crianca_id)).map((occ: any) => {
                  const cObj = myChildren.find(k => k.id === occ.crianca_id);
                  return (
                    <div key={occ.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${occ.gravidade === 'URGENTE' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'}`}>
                            {occ.gravidade}
                          </span>
                          <h4 className="font-bold text-sm text-slate-800 mt-1 leading-tight">{occ.titulo}</h4>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">{occ.data.split('-').reverse().slice(0,2).join('/')} {occ.hora}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">{occ.descricao}</p>
                      
                      <div className="flex justify-between items-center pt-2 leading-none border-t border-slate-200/50">
                        <span className="text-[10px] text-slate-500">Criança: <strong className="text-slate-700">{cObj?.nome}</strong></span>
                        <span className={`text-[10px] font-bold ${occ.status === 'resolvido' ? 'text-emerald-600' : 'text-amber-500 animate-pulse'}`}>
                          ● {occ.status === 'resolvido' ? 'Concluída' : 'Em atendimento'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // CONTROLE LÍDER / PASTOR / ADMIN
        <>
          {/* STATS CHIPS BAR */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><Baby size={22} /></div>
              <div>
                <span className="text-2xl font-black text-slate-800 block leading-tight">{stats.total}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Crianças</span>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Users size={22} /></div>
              <div>
                <span className="text-2xl font-black text-indigo-700 block leading-tight">{stats.presentToday}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Presentes Hoje</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 col-span-1">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Sparkles size={22} /></div>
              <div>
                <span className="text-2xl font-black text-purple-700 block leading-tight">{stats.special}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Especiais</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 col-span-1">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Activity size={22} /></div>
              <div>
                <span className="text-2xl font-black text-amber-600 block leading-tight">{stats.withAllergies}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Alergias</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 col-span-2 md:col-span-1">
              <div className="p-3 bg-rose-100 text-rose-700 rounded-xl"><ShieldAlert size={22} /></div>
              <div>
                <span className="text-2xl font-black text-rose-700 block leading-tight">{stats.activeOccs}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Alertas Ativos</span>
              </div>
            </div>
          </div>

          {/* INNER NAVIGATION FOR ADMINS */}
          <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-200 pb-2">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto gap-2">
              <button 
                onClick={() => setTab(1)} 
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${tab === 1 ? 'bg-white text-rose-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <FileBarChart size={14} /> Dashboard
              </button>
              <button 
                onClick={() => setTab(2)} 
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${tab === 2 ? 'bg-white text-rose-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <Baby size={14} /> Cadastro Crianças
              </button>
              <button 
                onClick={() => setTab(3)} 
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${tab === 3 ? 'bg-white text-rose-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <Calendar size={14} /> Chamada Frequência
              </button>
              <button 
                onClick={() => setTab(4)} 
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${tab === 4 ? 'bg-white text-rose-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <ShieldAlert size={14} /> Ocorrências & WhatsApp
              </button>
            </div>

            {tab === 2 && (
              <button 
                onClick={openNewChildModal} 
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-rose-500/25 flex items-center gap-2"
              >
                <Plus size={16} /> Cadastrar Criança
              </button>
            )}

            {tab === 4 && (
              <button 
                onClick={() => setOccModalOpen(true)} 
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-rose-500/25 flex items-center gap-2"
              >
                <Plus size={16} /> Nova Ocorrência / Alerta
              </button>
            )}
          </div>

          <div className="flex-1 overflow-hidden">
            {/* TAB 1: DASHBOARD OVERVIEW */}
            {tab === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar h-full p-1">
                {/* LIST OF URGENT INCIDENTS COMPONENT */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-black text-lg text-rose-700 flex items-center gap-2 border-b border-rose-50 pb-3">
                    <ShieldAlert /> Alertas Ativos da Salinha Kids (Mensagens de Pânico)
                  </h3>

                  <div className="space-y-4">
                    {occurrencesList.filter((o: any) => o.gravidade === 'URGENTE' && o.status !== 'resolvido').length === 0 ? (
                      <div className="text-center py-10 bg-slate-50 rounded-2xl text-slate-400 font-medium">
                        <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-2" />
                        Nenhum alerta pendente no momento. Ambiente pacificado!
                      </div>
                    ) : (
                      occurrencesList.filter((o: any) => o.gravidade === 'URGENTE' && o.status !== 'resolvido').map((occ: any) => {
                        const kid = kidsList.find((k: any) => k.id === occ.crianca_id);
                        const parent = db.membros?.find((m: any) => m.id === kid?.responsavel_membro_id);
                        const waLink = getUrgentWhatsAppLink(occ);
                        
                        return (
                          <div key={occ.id} className="p-5 rounded-2xl border border-rose-100 bg-rose-50/50 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center animate-pulse">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="bg-rose-600 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full">
                                  CONVOCANDO PAIS
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold">{occ.hora}</span>
                              </div>
                              <h4 className="font-extrabold text-slate-800 text-base mt-1">Criança: {kid?.nome || 'Criança'}</h4>
                              <p className="text-xs text-slate-600 mt-1"><strong className="text-slate-800">Assunto:</strong> {occ.titulo}</p>
                              <p className="text-xs text-slate-500 italic mt-1 font-medium">{occ.descricao}</p>
                              <div className="text-[11px] font-bold text-rose-700 bg-rose-100/50 px-3 py-1.5 rounded-lg border border-rose-200 mt-2">
                                {occ.urgente_mensagem}
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full md:w-auto">
                              {waLink && (
                                <a 
                                  href={waLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-center font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                                >
                                  <Send size={14} /> WhatsApp
                                </a>
                              )}
                              <button 
                                onClick={() => handleResolveOccurrence(occ.id)} 
                                className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                              >
                                <Check size={14} /> Resolvido
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* RIGHT SIDEBAR QUICK ACCORDIONS: MEDICAL AND DIETARY ATTENTION */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-black text-base text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Activity className="text-purple-600" /> Cuidados Especiais & Alergias
                    </h3>

                    <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                      {kidsList.filter((k: any) => k.is_especial || (k.alergias && k.alergias.trim() !== '')).length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Nenhum registro de restrição ou necessidade especial cadastrado no momento.</p>
                      ) : (
                        kidsList.filter((k: any) => k.is_especial || (k.alergias && k.alergias.trim() !== '')).map((kid: any) => (
                          <div key={kid.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                            <h4 className="font-black text-slate-800 text-xs">{kid.nome}</h4>
                            
                            <div className="flex gap-2">
                              {kid.is_especial && (
                                <span className="bg-purple-100 text-purple-700 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                                  Pcd
                                </span>
                              )}
                              {kid.alergias && (
                                <span className="bg-amber-100 text-amber-700 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                                  Alergias
                                </span>
                              )}
                            </div>

                            {kid.alergias && (
                              <p className="text-[10px] text-slate-600 font-medium leading-tight mt-1">
                                <strong>Alergia:</strong> {kid.alergias}
                              </p>
                            )}

                            {kid.restricoes_medicamentos && (
                              <p className="text-[10px] text-slate-600 font-medium leading-tight">
                                <strong>Medicação restrita:</strong> {kid.restricoes_medicamentos}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CHILDREN DIRECTORY */}
            {tab === 2 && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full">
                <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                  <div className="relative max-w-sm w-full">
                    <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Pesquisar por nome, sangue ou alergia..." 
                      value={searchTerm} 
                      onChange={e => setSearchTerm(e.target.value)} 
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500 flex-1 shadow-inner placeholder-slate-400"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {filteredKids.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                      <Baby size={48} className="mx-auto text-slate-300 mb-4" />
                      <p className="font-bold text-lg">Nenhuma criança encontrada.</p>
                      <p className="text-sm mt-1">Cadastre uma nova criança utilizando o botão acima.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredKids.map((kid: any) => {
                        const parent = db.membros?.find((m: any) => m.id === kid.responsavel_membro_id);
                        return (
                          <div key={kid.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div>
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 text-rose-500 text-sm font-black flex items-center justify-center">
                                    {kid.nome.charAt(0)}
                                  </div>
                                  <div>
                                    <h4 className="font-black text-slate-800 text-sm leading-tight">{kid.nome}</h4>
                                    <span className="text-[10px] text-slate-400 font-bold">
                                      Nascimento: {kid.data_nascimento.split('-').reverse().join('/')}
                                    </span>
                                  </div>
                                </div>
                                <span className="bg-red-50 text-red-600 font-black text-[10px] px-2 py-0.5 rounded border border-red-100">
                                  {kid.tipo_sanguineo || 'N/I'}
                                </span>
                              </div>

                              <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Responsável</span>
                                <p className="text-xs font-extrabold text-slate-700 leading-none">{parent?.nome || 'Não associado'}</p>
                                {parent?.celular && (
                                  <p className="text-[10px] text-slate-500 font-medium tracking-tight flex items-center gap-1">
                                    <Phone size={10} /> {parent.celular}
                                  </p>
                                )}
                              </div>

                              {(kid.is_especial || kid.alergias) && (
                                <div className="mt-4 bg-orange-50/50 rounded-xl p-3 border border-orange-100/50 space-y-1 text-[11px] text-slate-600">
                                  {kid.is_especial && (
                                    <p>✨ <strong className="text-purple-700">Esp.:</strong> {kid.detalhes_especial || 'Precioso'}</p>
                                  )}
                                  {kid.alergias && (
                                    <p>⚠️ <strong className="text-amber-700">Alergia:</strong> {kid.alergias}</p>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
                              <button 
                                onClick={() => openEditChildModal(kid)} 
                                className="p-2 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                                title="Editar Cadastro"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteChild(kid.id)} 
                                className="p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                                title="Remover Cadastro"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: ATTENDANCE SHEETS FOR DATE */}
            {tab === 3 && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-black text-lg text-slate-800">Chamada do Dia</h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">Selecione a data e marque a presença de cada criança presente na Salinha Kids.</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <input 
                      type="date" 
                      value={attendanceDate} 
                      onChange={e => setAttendanceDate(e.target.value)} 
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                    />
                    <button 
                      onClick={handleSaveAttendance} 
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20"
                    >
                      Salvar Frequência
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {kidsList.length === 0 ? (
                    <p className="text-center py-10 text-slate-400">Nenhuma criança cadastrada para realizar a chamada.</p>
                  ) : (
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 font-bold text-left text-xs uppercase tracking-wider">
                          <th className="p-4 rounded-l-2xl">Status</th>
                          <th className="p-4">Criança</th>
                          <th className="p-4">Pai/Responsável</th>
                          <th className="p-4 rounded-r-2xl hidden md:table-cell">Alergias / Cuidados</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kidsList.map((kid: any) => {
                          const parent = db.membros?.find((m: any) => m.id === kid.responsavel_membro_id);
                          const isPres = tempPresences[kid.id] || false;
                          
                          return (
                            <tr key={kid.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                              <td className="p-4">
                                <button 
                                  onClick={() => setTempPresences(prev => ({ ...prev, [kid.id]: !prev[kid.id] }))}
                                  className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${isPres ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm' : 'border-slate-300 text-slate-300 bg-white hover:border-slate-400'}`}
                                >
                                  {isPres ? <Check size={20} /> : null}
                                </button>
                              </td>
                              <td className="p-4">
                                <h5 className="font-extrabold text-sm text-slate-800 leading-tight">{kid.nome}</h5>
                                <span className="text-[10px] text-slate-400 font-bold">
                                  {kid.data_nascimento.split('-').reverse().join('/')}
                                </span>
                              </td>
                              <td className="p-4">
                                <p className="font-bold text-xs text-slate-700 leading-none">{parent?.nome || '-'}</p>
                                {parent?.celular && <span className="text-[9px] font-mono text-slate-400 block mt-1">{parent.celular}</span>}
                              </td>
                              <td className="p-4 text-xs font-semibold hidden md:table-cell">
                                {kid.alergias ? (
                                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                                    ⚠️ {kid.alergias}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">Nenhum</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: INCIDENTS ARCHIVE */}
            {tab === 4 && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full">
                <div className="mb-6">
                  <h3 className="font-black text-lg text-slate-800">Ocorrências & Chamados Ativos</h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">Gerencie incidentes e envie chamados urgentes para o celular e portal dos pais no mesmo instante.</p>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {occurrencesList.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                      <ShieldAlert size={48} className="mx-auto text-slate-300 mb-4" />
                      <p className="font-bold text-lg">Sem ocorrências registradas.</p>
                      <p className="text-sm mt-1">Registre um chamado usando o botão acima quando necessário.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {occurrencesList.map((occ: any) => {
                        const child = kidsList.find((k: any) => k.id === occ.crianca_id);
                        const parent = db.membros?.find((m: any) => m.id === child?.responsavel_membro_id);
                        const waLink = getUrgentWhatsAppLink(occ);
                        
                        return (
                          <div key={occ.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${occ.gravidade === 'URGENTE' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'}`}>
                                  {occ.gravidade}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold">{occ.data.split('-').reverse().join('/')} {occ.hora}</span>
                              </div>
                              
                              <h4 className="font-extrabold text-sm text-slate-800 mt-2">Criança: {child?.nome || 'Removido'}</h4>
                              <p className="text-xs font-bold text-slate-700 mt-1">{occ.titulo}</p>
                              <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1 max-w-xl">{occ.descricao}</p>
                              
                              {occ.urgente_mensagem && (
                                <div className="text-[10px] text-rose-700 bg-rose-50 border border-rose-100 p-2.5 rounded-lg font-bold mt-2.5 leading-relaxed">
                                  Mensagem SMS/WA: "{occ.urgente_mensagem}"
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-400 font-bold">
                                <span>Responsável: <strong className="text-slate-600">{parent?.nome || 'N/A'}</strong></span>
                                {parent?.celular && <span>• Fone: <strong className="text-slate-600">{parent.celular}</strong></span>}
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full md:w-auto">
                              {occ.gravidade === 'URGENTE' && waLink && occ.status !== 'resolvido' && (
                                <a 
                                  href={waLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider text-center transition-all flex items-center justify-center gap-1.5"
                                >
                                  <Share2 size={13} /> Re-enviar WA
                                </a>
                              )}
                              {occ.status !== 'resolvido' ? (
                                <button 
                                  onClick={() => handleResolveOccurrence(occ.id)} 
                                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider text-center"
                                >
                                  Resolver
                                </button>
                              ) : (
                                <span className="text-emerald-600 font-black text-xs px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-lg">
                                  Resolvida ✓
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* MODAL 1: ADD / EDIT CHILD */}
      {childModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[12000] animate-entrance">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-rose-50/50">
              <h3 className="font-black text-lg text-rose-800 flex items-center gap-2">
                <Baby className="text-rose-600" /> {selectedChild ? 'Editar Cadastro de Criança' : 'Cadastrar Criança na Salinha'}
              </h3>
              <button 
                onClick={() => setChildModalOpen(false)} 
                className="w-10 h-10 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveChild} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Nome da Criança *</label>
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Nome completo da criança"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Nascimento *</label>
                  <input 
                    type="date" 
                    required 
                    value={birthDate} 
                    onChange={e => setBirthDate(e.target.value)} 
                    className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Tipo Sanguíneo</label>
                  <select 
                    value={bloodType} 
                    onChange={e => setBloodType(e.target.value)} 
                    className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'N/I'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Pai / Responsável Membro *</label>
                <select 
                  required 
                  value={parentId} 
                  onChange={e => setParentId(e.target.value)} 
                  className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="">-- Selecione o Responsável --</option>
                  {(db.membros || []).slice().sort((a: any, b: any) => a.nome.localeCompare(b.nome)).map((m: any) => (
                    <option key={m.id} value={m.id}>{m.nome} ({m.funcao || 'Membro'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Alergias (Alimentos, Picadas, Glúten, Poeira, etc.)</label>
                <input 
                  type="text" 
                  value={allergies} 
                  onChange={e => setAllergies(e.target.value)} 
                  className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 pointer-events-auto"
                  placeholder="Ex: Alergia a amendoim, picada de abelha"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Restrições a Medicamentos (O que ela NÃO pode tomar?)</label>
                <input 
                  type="text" 
                  value={medRestrictions} 
                  onChange={e => setMedRestrictions(e.target.value)} 
                  className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  placeholder="Ex: Não pode tomar Dipirona ou Ibuprofeno"
                />
              </div>

              <div className="flex items-center gap-3 bg-rose-50/50 p-4 rounded-xl border border-rose-100/50">
                <input 
                  type="checkbox" 
                  id="chkSpecial"
                  checked={isSpecial} 
                  onChange={e => setIsSpecial(e.target.checked)} 
                  className="w-5 h-5 accent-rose-600 rounded"
                />
                <label htmlFor="chkSpecial" className="text-xs font-extrabold text-slate-700 uppercase tracking-wide cursor-pointer select-none">Criança Especial / PCD ✨</label>
              </div>

              {isSpecial && (
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Cuidados ou Recomendações Especiais</label>
                  <textarea 
                    value={specialDetails} 
                    onChange={e => setSpecialDetails(e.target.value)} 
                    rows={2}
                    className="w-full mt-1.5 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                    placeholder="Especifique o cuidado. Ex: Autismo leve, necessita de rotina calma."
                  />
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setChildModalOpen(false)} 
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs uppercase rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase rounded-xl transition-all shadow-md shadow-rose-500/20"
                >
                  {selectedChild ? 'Atualizar' : 'Salvar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD OCCURRENCE */}
      {occModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[12000] animate-entrance">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-rose-50/50">
              <h3 className="font-black text-lg text-rose-800 flex items-center gap-2">
                <ShieldAlert className="text-rose-600" /> Registrar Ocorrência na Salinha Kids
              </h3>
              <button 
                onClick={() => setOccModalOpen(false)} 
                className="w-10 h-10 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOccurrence} className="p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Criança Associada *</label>
                <select 
                  required 
                  value={occChildId} 
                  onChange={e => setOccChildId(e.target.value)} 
                  className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="">-- Selecione a Criança --</option>
                  {kidsList.map((k: any) => (
                    <option key={k.id} value={k.id}>{k.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Assunto da ocorrência *</label>
                <input 
                  type="text" 
                  required 
                  value={occTitle} 
                  onChange={e => setOccTitle(e.target.value)} 
                  className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 pointer-events-auto"
                  placeholder="Ex: Febre súbita, Picada de inseto, Enjoo"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Descrição detalhada</label>
                <textarea 
                  required 
                  value={occDesc} 
                  onChange={e => setOccDesc(e.target.value)} 
                  rows={3}
                  className="w-full mt-1.5 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                  placeholder="Escreva detalhes de como ocorreu e ações tomadas preventivamente."
                />
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Gravidade do Chamado</label>
                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setOccSeverity('normal')}
                    className={`flex-1 py-3 text-xs font-black uppercase rounded-xl border transition-all ${occSeverity === 'normal' ? 'bg-slate-800 text-white border-transparent' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                  >
                    Normal (Registro)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setOccSeverity('URGENTE')}
                    className={`flex-1 py-3 text-xs font-black uppercase rounded-xl border transition-all flex items-center justify-center gap-1.5 ${occSeverity === 'URGENTE' ? 'bg-rose-600 text-white border-transparent shadow-lg shadow-rose-500/20 animate-pulse' : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'}`}
                  >
                    ⚠️ Pânico (Urgente!)
                  </button>
                </div>
              </div>

              {occSeverity === 'URGENTE' && (
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 space-y-2 animate-entrance">
                  <label className="text-[10px] font-black uppercase text-rose-800 tracking-wider flex items-center gap-1">
                    <Volume2 size={12} /> Mensagem Urgente customizada dos Pais (Notificará Celular, Portal e WhatsApp)
                  </label>
                  <textarea 
                    value={occUrgentMsg} 
                    onChange={e => setOccUrgentMsg(e.target.value)} 
                    rows={2}
                    className="w-full bg-white border border-rose-200 rounded-xl p-3 text-xs font-bold text-slate-800"
                    placeholder="Mantenha vazio para enviar a convocação padrão ou escreva uma recomendação urgente."
                  />
                  <p className="text-[10px] text-rose-600 font-bold">O sistema acionará um alerta sonoro na tela dos pais, banner vermelho na home e gerará link de pânico para despachar no WhatsApp automaticamente.</p>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setOccModalOpen(false)} 
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs uppercase rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase rounded-xl transition-all shadow-md shadow-rose-500/20"
                >
                  Registrar e Alertar!
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleSalinhaKids;

import React, { useState, useContext, useMemo } from 'react';
import { 
  Award, Droplets, Baby, Heart, Book, Megaphone, GraduationCap, 
  Printer, Edit, Search, CheckCircle, Copy, ExternalLink, ShieldCheck, 
  Calendar, User, Plus, Filter, RefreshCw, QrCode, FileText, Stamp,
  Clock, Hash, Sparkles, AlertCircle
} from 'lucide-react';
import { collection, doc, addDoc, setDoc } from 'firebase/firestore';

import {
  ChurchContext, Button, FormInput, FormSelect,
  getTodayDate, formatDateLocal, copyToClipboard
} from '../App';

export const ModuleCertificados = () => {
    const { db, setPrintMode, setPrintData, setPreviewOpen, dbFirestore, appId, addToast, logAction } = useContext(ChurchContext); 
    const [selectedType, setSelectedType] = useState<string | null>('cert_batismo');
    const [viewTab, setViewTab] = useState<'emitir' | 'historico'>('emitir');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Estado consolidado para os dados do certificado
    const [certData, setCertData] = useState({
        membro_id: '',
        nome_titular: '',
        data_evento: getTodayDate(),
        pastor_oficiante: db.igreja?.pastor || '',
        cargo: 'Obreiro(a)',
        nome_crianca: '', nome_pai: '', nome_mae: '', data_nasc: '',
        nome_noivo: '', nome_noiva: '',
        curso: 'Teologia Básica', carga_horaria: '',
        evento: 'Congresso Anual', tema_evento: '',
        turma_id: '', turma_nome: '', professor: '', trimestre: '4º Trimestre / ' + new Date().getFullYear(),
        livro: '', folha: '', termo: ''
    });

    const certTypes = [
        { id: 'cert_batismo', label: 'Batismo nas Águas', icon: Droplets, color: 'blue', desc: 'Certificação de descida às águas por imersão.' }, 
        { id: 'cert_consagracao', label: 'Consagração Ministerial', icon: Award, color: 'rose', desc: 'Ordenação ao ministério pastoral, presbiteral ou diaconal.' }, 
        { id: 'cert_crianca', label: 'Apresent. de Criança', icon: Baby, color: 'amber', desc: 'Ato de consagração e dedicação infantil ao Senhor.' }, 
        { id: 'cert_casamento', label: 'Casamento Religioso', icon: Heart, color: 'pink', desc: 'Enlace matrimonial eclesiástico com bênção sacerdotal.' }, 
        { id: 'cert_curso', label: 'Conclusão de Curso / Teologia', icon: Book, color: 'indigo', desc: 'Diplomas teológicos e seminários de capacitação.' },
        { id: 'cert_evento', label: 'Participação em Evento', icon: Megaphone, color: 'emerald', desc: 'Certificação de congressos, retiros e conferências.' },
        { id: 'cert_ebd', label: 'Escola Bíblica Dominical', icon: GraduationCap, color: 'purple', desc: 'Aprovação e frequência nas turmas da EBD.' }
    ];

    const generateDocHash = (type: string, name: string) => {
        const prefix = type.replace('cert_', '').toUpperCase().slice(0, 3);
        const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
        const year = new Date().getFullYear();
        return `GIPP-${prefix}-${randomHex}-${year}`;
    };

    const formatDataExtenso = (dateStr?: string) => {
        if (!dateStr) return new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
        try {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
            }
            return new Date(dateStr).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
        } catch {
            return new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
        }
    };

    // Manipulador unificado ao selecionar membro
    const handleMemberSelect = (selectedId: any) => {
        const cleanId = String(selectedId || '').trim();
        const found = (db.membros || []).find((m: any) => String(m.id).trim() === cleanId);
        
        setCertData(prev => ({
            ...prev,
            membro_id: cleanId,
            nome_titular: found?.nome || prev.nome_titular,
            cargo: found?.cargo || prev.cargo,
            nome_pai: found?.pai || prev.nome_pai,
            nome_mae: found?.mae || prev.nome_mae
        }));
    };

    // Opções de cursos combinando cadastros do sistema e opções clássicas
    const cursosDisponiveis = useMemo(() => {
        const defaults = [
            'Teologia Básica', 
            'Teologia Média', 
            'Bacharel em Teologia', 
            'Curso de Discipulado', 
            'Escola de Líderes', 
            'Capacitação Ministerial',
            'Formação de Diáconos e Cooperadores',
            'Pregação Bíblica & Homilética'
        ];
        const cadastrados = (db.cursos || []).map((c: any) => c.titulo || c.nome).filter(Boolean);
        return Array.from(new Set([...defaults, ...cadastrados]));
    }, [db.cursos]);

    const handlePrint = async () => { 
        if (!selectedType) return;
        
        const cleanId = String(certData.membro_id || '').trim();
        let membroInfo = null;
        if (cleanId) {
            membroInfo = (db.membros || []).find((m: any) => String(m.id).trim() === cleanId);
        }

        // Nome titular com prioridade estrita: digitado/confirmado > encontrado no membro > criança > noivo > Titular
        const titularNome = certData.nome_titular?.trim() || 
                            membroInfo?.nome || 
                            certData.nome_crianca?.trim() || 
                            certData.nome_noivo?.trim() || 
                            'Titular Homenageado';

        let turmaInfo = null;
        let professoresNomes = certData.professor?.trim() || 'Superintendência EBD';
        if (certData.turma_id && db.ebd?.turmas) {
            turmaInfo = db.ebd.turmas.find((t: any) => String(t.id).trim() === String(certData.turma_id).trim());
            if (turmaInfo && !certData.professor?.trim()) {
                const docents = [turmaInfo.prof1_id, turmaInfo.prof2_id, turmaInfo.prof3_id]
                    .map((id: string) => (db.membros || []).find((m: any) => String(m.id).trim() === String(id).trim())?.nome)
                    .filter(Boolean);
                if (docents.length > 0) {
                    professoresNomes = docents.join(', ');
                }
            }
        }

        const docHash = generateDocHash(selectedType, titularNome);
        const dataExtenso = formatDataExtenso(certData.data_evento);

        const effectiveMembro = { 
            ...(membroInfo || {}), 
            id: cleanId || ('CERT-' + Math.random().toString(36).substring(2, 7).toUpperCase()),
            nome: titularNome 
        };

        // Preparar os dados exatos para injetar no modelo
        const finalData = { 
            igreja: {
                ...(db.igreja || {}),
                pastor: certData.pastor_oficiante?.trim() || db.igreja?.pastor || 'Pastor Presidente'
            }, 
            membro: effectiveMembro, 
            extra: {
                titular: titularNome,
                cargo: certData.cargo || 'Obreiro(a)',
                data_evento: certData.data_evento || getTodayDate(),
                data_extenso: dataExtenso,
                nome_crianca: certData.nome_crianca?.trim() || titularNome,
                nome_pai: certData.nome_pai?.trim() || '',
                nome_mae: certData.nome_mae?.trim() || '',
                data_nasc: certData.data_nasc || '',
                nome_noivo: certData.nome_noivo?.trim() || titularNome,
                nome_noiva: certData.nome_noiva?.trim() || '',
                curso: certData.curso || 'Teologia Básica',
                nome_curso: certData.curso || 'Teologia Básica',
                carga_horaria: certData.carga_horaria?.trim() || '',
                evento: certData.evento?.trim() || 'Congresso Anual',
                tema: certData.tema_evento?.trim() || '',
                turma: turmaInfo ? turmaInfo.nome : (certData.turma_nome?.trim() || 'Classe Dominical'),
                professor: professoresNomes,
                trimestre: certData.trimestre?.trim() || '',
                livro: certData.livro?.trim() || '',
                folha: certData.folha?.trim() || '',
                termo: certData.termo?.trim() || '',
                pastor: certData.pastor_oficiante?.trim() || db.igreja?.pastor || 'Pastor Presidente',
                docHash: docHash
            } 
        }; 

        // Salvar registro de emissão no Firestore para consulta e autenticidade
        try {
            const rawCertDoc = {
                tipo: selectedType || 'cert_geral',
                docHash: docHash || '',
                titular: titularNome || 'Titular',
                membro_id: cleanId || '',
                data_emissao: certData.data_evento || new Date().toISOString(),
                detalhes: {
                    cargo: certData.cargo || '',
                    nome_crianca: certData.nome_crianca || '',
                    nome_pai: certData.nome_pai || '',
                    nome_mae: certData.nome_mae || '',
                    data_nasc: certData.data_nasc || '',
                    nome_noivo: certData.nome_noivo || '',
                    nome_noiva: certData.nome_noiva || '',
                    curso: certData.curso || '',
                    carga_horaria: certData.carga_horaria || '',
                    evento: certData.evento || '',
                    tema: certData.tema_evento || '',
                    turma_id: certData.turma_id || '',
                    turma_nome: (turmaInfo && turmaInfo.nome) ? String(turmaInfo.nome) : certData.turma_nome || '',
                    professor: professoresNomes,
                    livro: certData.livro || '',
                    folha: certData.folha || '',
                    termo: certData.termo || '',
                    pastor: certData.pastor_oficiante || db.igreja?.pastor || '',
                    data_extenso: dataExtenso
                }
            };
            // Clean any possible undefined values recursively
            const certDoc = JSON.parse(JSON.stringify(rawCertDoc, (_, v) => v === undefined ? '' : v));
            await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'certificados_emitidos'), certDoc);
            logAction('CADASTRO', `Emitiu certificado "${selectedType}" Cód: ${docHash} para "${titularNome}"`, 'certificados', docHash);
        } catch (e) {
            console.error("Erro ao registrar histórico do certificado:", e);
        }

        setPrintData(finalData); 
        setPrintMode(selectedType); 
        setPreviewOpen(true); 
    };

    // Histórico de certificados emitidos
    const certificadosEmitidos = (db.certificados_emitidos || []).filter((c: any) => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (c.titular || '').toLowerCase().includes(q) || 
               (c.docHash || '').toLowerCase().includes(q) ||
               (c.tipo || '').toLowerCase().includes(q);
    });

    return (
        <div className="h-full flex flex-col space-y-5 animate-entrance">
            {/* Top Header */}
            <div className="flex flex-wrap gap-4 justify-between items-center bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl shadow-xs border border-amber-100 dark:border-amber-900/60">
                        <Award size={28}/>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Emissão & Validação de Certificados</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5 uppercase tracking-wider">
                            Formatos A4 com Selo Oficial, QR Code e Hash de Autenticidade Digital
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setViewTab('emitir')}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${viewTab === 'emitir' ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                    >
                        ✨ Emitir Novo
                    </button>
                    <button
                        onClick={() => setViewTab('historico')}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${viewTab === 'historico' ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                    >
                        📋 Histórico & Validação
                    </button>
                </div>
            </div>

            {viewTab === 'emitir' ? (
                <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden min-h-[500px]">
                    {/* Lado Esquerdo: Seleção do Modelo */}
                    <div className="w-full lg:w-1/3 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1">
                        <h3 className="font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest text-xs mb-1">
                            1. Escolha o Tipo de Certificado
                        </h3>
                        {certTypes.map(c => {
                            const isSelected = selectedType === c.id;
                            return (
                                <button 
                                    key={c.id} 
                                    onClick={() => setSelectedType(c.id)} 
                                    className={`flex items-start gap-4 p-4 rounded-2xl border transition-all text-left group cursor-pointer ${isSelected ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'}`}
                                >
                                    <div className={`p-3 rounded-xl transition-colors shrink-0 ${isSelected ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/60 group-hover:text-indigo-600'}`}>
                                        <c.icon size={20} />
                                    </div>
                                    <div>
                                        <span className={`block font-black text-sm mb-0.5 ${isSelected ? 'text-indigo-950 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'}`}>{c.label}</span>
                                        <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight">{c.desc}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Lado Direito: Formulário de Preenchimento */}
                    <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-y-auto custom-scrollbar flex flex-col relative">
                        {!selectedType ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-10 text-center opacity-60">
                                <Stamp size={64} className="mb-6 text-slate-300"/>
                                <h3 className="text-xl font-bold text-slate-600 mb-2">Nenhum modelo selecionado</h3>
                                <p className="text-sm">Escolha uma das opções no painel lateral para preencher os dados e gerar o documento com QR Code.</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-wrap justify-between items-center gap-3">
                                    <h3 className="font-black text-slate-800 dark:text-white text-base flex items-center gap-2">
                                        <Edit size={18} className="text-indigo-600 dark:text-indigo-400"/> 
                                        Preencher Dados: {certTypes.find(c => c.id === selectedType)?.label}
                                    </h3>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                                        ✓ Validação QR Automática Ativada
                                    </span>
                                </div>
                                
                                <div className="p-6 flex-1 space-y-6">
                                    {/* Bloco Comum: Data do Evento e Pastor Celebrante */}
                                    <div className="p-4 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormInput 
                                            label="Data Oficial do Certificado / Ato" 
                                            type="date" 
                                            value={certData.data_evento} 
                                            onChange={(v: string) => setCertData({...certData, data_evento: v})} 
                                            helperText="Data que constará por extenso no rodapé do documento"
                                            required 
                                        />
                                        <FormInput 
                                            label="Pastor Presidente / Oficiante" 
                                            value={certData.pastor_oficiante} 
                                            onChange={(v: string) => setCertData({...certData, pastor_oficiante: v})} 
                                            placeholder={db.igreja?.pastor || "Nome do Pastor"}
                                            helperText="Nome que assina o documento à esquerda"
                                        />
                                    </div>

                                    {/* Batismo nas Águas */}
                                    {selectedType === 'cert_batismo' && (
                                        <div className="bg-blue-50/40 dark:bg-blue-950/20 p-5 rounded-2xl border border-blue-200 dark:border-blue-900 space-y-4">
                                            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-bold text-xs uppercase tracking-wider">
                                                <Droplets size={16} /> Identificação do Batizado
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormSelect 
                                                    label="Selecionar Membro Cadastrado" 
                                                    value={certData.membro_id} 
                                                    onChange={handleMemberSelect} 
                                                    options={[
                                                        { label: '-- Selecione ou digite manualmente ao lado --', value: '' },
                                                        ...(db.membros || []).map((m: any) => ({ label: `${m.nome} (ID: ${m.id?.slice(0, 6)})`, value: String(m.id) }))
                                                    ]} 
                                                    helperText="Preenche automaticamente o nome e histórico"
                                                />

                                                <FormInput 
                                                    label="Nome Completo a Constar no Certificado" 
                                                    value={certData.nome_titular} 
                                                    onChange={(v: string) => setCertData({...certData, nome_titular: v})} 
                                                    placeholder="Digite o nome completo do batizado"
                                                    helperText="Edite ou insira livremente se o batizado for visitante"
                                                    required 
                                                />
                                            </div>

                                            {/* Dados Eclesiásticos do Livro de Batismo */}
                                            <div className="pt-2 border-t border-blue-200/60 dark:border-blue-900/60">
                                                <p className="text-[11px] font-bold text-blue-800 dark:text-blue-400 mb-2 uppercase tracking-wider">
                                                    Registro no Livro de Batismos (Opcional)
                                                </p>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <FormInput label="Livro Nº" value={certData.livro} onChange={(v: string) => setCertData({...certData, livro: v})} placeholder="Ex: 03" />
                                                    <FormInput label="Folha Nº" value={certData.folha} onChange={(v: string) => setCertData({...certData, folha: v})} placeholder="Ex: 45" />
                                                    <FormInput label="Termo / Assento" value={certData.termo} onChange={(v: string) => setCertData({...certData, termo: v})} placeholder="Ex: 112" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Consagração Ministerial */}
                                    {selectedType === 'cert_consagracao' && (
                                        <div className="bg-rose-50/40 dark:bg-rose-950/20 p-5 rounded-2xl border border-rose-200 dark:border-rose-900 space-y-4">
                                            <div className="flex items-center gap-2 text-rose-900 dark:text-rose-300 font-bold text-xs uppercase tracking-wider">
                                                <Award size={16} /> Identificação do Obreiro(a) & Ministério
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormSelect 
                                                    label="Selecionar Obreiro(a) Cadastrado" 
                                                    value={certData.membro_id} 
                                                    onChange={handleMemberSelect} 
                                                    options={[
                                                        { label: '-- Selecione ou digite manualmente ao lado --', value: '' },
                                                        ...(db.membros || []).map((m: any) => ({ label: `${m.nome} (${m.cargo || 'Membro'})`, value: String(m.id) }))
                                                    ]} 
                                                />

                                                <FormInput 
                                                    label="Nome Completo no Certificado" 
                                                    value={certData.nome_titular} 
                                                    onChange={(v: string) => setCertData({...certData, nome_titular: v})} 
                                                    placeholder="Digite o nome completo do obreiro(a)"
                                                    required 
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormSelect 
                                                    label="Ofício / Cargo de Consagração" 
                                                    value={certData.cargo} 
                                                    onChange={(v: string) => setCertData({...certData, cargo: v})} 
                                                    options={[
                                                        'Auxiliar de Trabalho', 
                                                        'Diácono', 
                                                        'Diaconisa', 
                                                        'Presbítero', 
                                                        'Evangelista', 
                                                        'Missionário(a)', 
                                                        'Pastor(a)',
                                                        'Líder Ministerial'
                                                    ]} 
                                                    required
                                                />

                                                <FormInput 
                                                    label="Outro Cargo ou Personalizado (Opcional)" 
                                                    value={certData.cargo} 
                                                    onChange={(v: string) => setCertData({...certData, cargo: v})} 
                                                    placeholder="Ex: Pastor Auxiliar, Cooperador(a)"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Apresentação de Criança */}
                                    {selectedType === 'cert_crianca' && (
                                        <div className="bg-amber-50/40 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-200 dark:border-amber-900 space-y-4">
                                            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                                                <Baby size={16} /> Dados da Criança e Filiação
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormInput 
                                                    label="Nome Completo da Criança" 
                                                    value={certData.nome_crianca} 
                                                    onChange={(v: string) => setCertData({...certData, nome_crianca: v, nome_titular: v})} 
                                                    placeholder="Ex: Samuel Davi de Oliveira"
                                                    required 
                                                />
                                                <FormInput 
                                                    label="Data de Nascimento" 
                                                    type="date" 
                                                    value={certData.data_nasc} 
                                                    onChange={(v: string) => setCertData({...certData, data_nasc: v})} 
                                                    helperText="Consta na certidão de nascimento"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <FormInput 
                                                        label="Nome do Pai" 
                                                        value={certData.nome_pai} 
                                                        onChange={(v: string) => setCertData({...certData, nome_pai: v})} 
                                                        placeholder="Nome completo do pai"
                                                    />
                                                </div>
                                                <div>
                                                    <FormInput 
                                                        label="Nome da Mãe" 
                                                        value={certData.nome_mae} 
                                                        onChange={(v: string) => setCertData({...certData, nome_mae: v})} 
                                                        placeholder="Nome completo da mãe"
                                                        required 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Casamento Religioso */}
                                    {selectedType === 'cert_casamento' && (
                                        <div className="bg-pink-50/40 dark:bg-pink-950/20 p-5 rounded-2xl border border-pink-200 dark:border-pink-900 space-y-4">
                                            <div className="flex items-center gap-2 text-pink-900 dark:text-pink-300 font-bold text-xs uppercase tracking-wider">
                                                <Heart size={16} /> Identificação dos Noivos
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <FormInput 
                                                        label="Nome Completo do Noivo" 
                                                        value={certData.nome_noivo} 
                                                        onChange={(v: string) => setCertData({...certData, nome_noivo: v})} 
                                                        placeholder="Nome completo do noivo"
                                                        required 
                                                    />
                                                    <FormSelect 
                                                        label="Ou Selecionar Noivo dos Membros" 
                                                        value="" 
                                                        onChange={(v: string) => {
                                                            const m = (db.membros || []).find((mb: any) => String(mb.id) === String(v));
                                                            if (m) setCertData(prev => ({ ...prev, nome_noivo: m.nome }));
                                                        }} 
                                                        options={[
                                                            { label: '-- Selecionar Noivo --', value: '' },
                                                            ...(db.membros || []).map((m: any) => ({ label: m.nome, value: String(m.id) }))
                                                        ]} 
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <FormInput 
                                                        label="Nome Completo da Noiva" 
                                                        value={certData.nome_noiva} 
                                                        onChange={(v: string) => setCertData({...certData, nome_noiva: v})} 
                                                        placeholder="Nome completo da noiva"
                                                        required 
                                                    />
                                                    <FormSelect 
                                                        label="Ou Selecionar Noiva das Membras" 
                                                        value="" 
                                                        onChange={(v: string) => {
                                                            const m = (db.membros || []).find((mb: any) => String(mb.id) === String(v));
                                                            if (m) setCertData(prev => ({ ...prev, nome_noiva: m.nome }));
                                                        }} 
                                                        options={[
                                                            { label: '-- Selecionar Noiva --', value: '' },
                                                            ...(db.membros || []).map((m: any) => ({ label: m.nome, value: String(m.id) }))
                                                        ]} 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Conclusão de Curso / Teologia */}
                                    {selectedType === 'cert_curso' && (
                                        <div className="bg-indigo-50/40 dark:bg-indigo-950/20 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900 space-y-4">
                                            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">
                                                <Book size={16} /> Identificação do Aluno & Curso
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormSelect 
                                                    label="Selecionar Aluno Cadastrado" 
                                                    value={certData.membro_id} 
                                                    onChange={handleMemberSelect} 
                                                    options={[
                                                        { label: '-- Selecione ou digite manualmente ao lado --', value: '' },
                                                        ...(db.membros || []).map((m: any) => ({ label: m.nome, value: String(m.id) }))
                                                    ]} 
                                                />

                                                <FormInput 
                                                    label="Nome Completo do Aluno no Diploma" 
                                                    value={certData.nome_titular} 
                                                    onChange={(v: string) => setCertData({...certData, nome_titular: v})} 
                                                    placeholder="Digite o nome completo do formando"
                                                    required 
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormSelect 
                                                    label="Nome do Curso Concluído" 
                                                    value={certData.curso} 
                                                    onChange={(v: string) => setCertData({...certData, curso: v})} 
                                                    options={cursosDisponiveis} 
                                                    required
                                                />

                                                <FormInput 
                                                    label="Carga Horária (Ex: 180 horas / 1 ano)" 
                                                    value={certData.carga_horaria} 
                                                    onChange={(v: string) => setCertData({...certData, carga_horaria: v})} 
                                                    placeholder="Ex: 120 horas"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Participação em Evento */}
                                    {selectedType === 'cert_evento' && (
                                        <div className="bg-emerald-50/40 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900 space-y-4">
                                            <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
                                                <Megaphone size={16} /> Dados do Participante e Evento
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormSelect 
                                                    label="Selecionar Participante Cadastrado" 
                                                    value={certData.membro_id} 
                                                    onChange={handleMemberSelect} 
                                                    options={[
                                                        { label: '-- Selecione ou digite manualmente ao lado --', value: '' },
                                                        ...(db.membros || []).map((m: any) => ({ label: m.nome, value: String(m.id) }))
                                                    ]} 
                                                />

                                                <FormInput 
                                                    label="Nome do Participante no Certificado" 
                                                    value={certData.nome_titular} 
                                                    onChange={(v: string) => setCertData({...certData, nome_titular: v})} 
                                                    placeholder="Nome completo do participante"
                                                    required 
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="md:col-span-2">
                                                    <FormInput 
                                                        label="Nome do Evento / Congresso / Conferência" 
                                                        value={certData.evento} 
                                                        onChange={(v: string) => setCertData({...certData, evento: v})} 
                                                        placeholder="Ex: UMAD - Congresso Geral da Juventude 2026" 
                                                        required 
                                                    />
                                                </div>
                                                <div>
                                                    <FormInput 
                                                        label="Carga Horária / Horas" 
                                                        value={certData.carga_horaria} 
                                                        onChange={(v: string) => setCertData({...certData, carga_horaria: v})} 
                                                        placeholder="Ex: 20 Horas"
                                                    />
                                                </div>
                                            </div>

                                            <FormInput 
                                                label="Tema do Evento (Opcional)" 
                                                value={certData.tema_evento} 
                                                onChange={(v: string) => setCertData({...certData, tema_evento: v})} 
                                                placeholder="Ex: Santidade, Poder e Missões"
                                            />
                                        </div>
                                    )}

                                    {/* EBD */}
                                    {selectedType === 'cert_ebd' && (
                                        <div className="bg-purple-50/40 dark:bg-purple-950/20 p-5 rounded-2xl border border-purple-200 dark:border-purple-900 space-y-4">
                                            <div className="flex items-center gap-2 text-purple-900 dark:text-purple-300 font-bold text-xs uppercase tracking-wider">
                                                <GraduationCap size={16} /> Escola Bíblica Dominical
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormSelect 
                                                    label="Selecionar Aluno da EBD" 
                                                    value={certData.membro_id} 
                                                    onChange={handleMemberSelect} 
                                                    options={[
                                                        { label: '-- Selecione ou digite manualmente ao lado --', value: '' },
                                                        ...(db.membros || []).map((m: any) => ({ label: m.nome, value: String(m.id) }))
                                                    ]} 
                                                />

                                                <FormInput 
                                                    label="Nome do Aluno no Certificado" 
                                                    value={certData.nome_titular} 
                                                    onChange={(v: string) => setCertData({...certData, nome_titular: v})} 
                                                    placeholder="Nome completo do aluno(a)"
                                                    required 
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormSelect 
                                                    label="Selecione a Turma da EBD" 
                                                    value={certData.turma_id} 
                                                    onChange={(v: string) => {
                                                        const clean = String(v || '').trim();
                                                        const t = (db.ebd?.turmas || []).find((tm: any) => String(tm.id).trim() === clean);
                                                        setCertData(prev => ({
                                                            ...prev,
                                                            turma_id: clean,
                                                            turma_nome: t?.nome || prev.turma_nome
                                                        }));
                                                    }} 
                                                    options={[
                                                        { label: '-- Selecione a turma cadastrada --', value: '' },
                                                        ...(db.ebd?.turmas || []).map((t: any) => ({ label: t.nome, value: String(t.id) }))
                                                    ]} 
                                                />

                                                <FormInput 
                                                    label="Nome da Turma / Classe" 
                                                    value={certData.turma_nome} 
                                                    onChange={(v: string) => setCertData({...certData, turma_nome: v})} 
                                                    placeholder="Ex: Classe Jovens, Classe Adultos"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormInput 
                                                    label="Professor(es) / Superintendente" 
                                                    value={certData.professor} 
                                                    onChange={(v: string) => setCertData({...certData, professor: v})} 
                                                    placeholder="Ex: Pr. João Silva e Ev. Marcos"
                                                    helperText="Assina à direita no certificado da EBD"
                                                />

                                                <FormInput 
                                                    label="Trimestre / Ciclo de Estudos" 
                                                    value={certData.trimestre} 
                                                    onChange={(v: string) => setCertData({...certData, trimestre: v})} 
                                                    placeholder="Ex: 4º Trimestre / 2026"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Digital Authenticity Explanation Banner */}
                                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck size={24} className="text-indigo-600 dark:text-indigo-400" />
                                            <div>
                                                <strong className="text-slate-800 dark:text-white block">Selo de Autenticidade Criptográfica</strong>
                                                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                                                    O documento é gerado em alta definição com QR Code dinâmico rastreável e código alfanumérico único para conferência pública.
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 shrink-0">
                                    <Button onClick={handlePrint} variant="primary" className="w-full py-4 text-sm font-black uppercase tracking-wider shadow-lg shadow-indigo-600/20 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer flex items-center justify-center gap-2">
                                        <Printer size={18}/> Gerar e Visualizar Certificado Oficial (PDF / Impressão)
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Aba Histórico de Certificados Emitidos */
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col space-y-4 overflow-hidden">
                    <div className="flex flex-wrap justify-between items-center gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="relative w-full sm:w-80">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar por titular, código ou tipo..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                        <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Total Registrados: {certificadosEmitidos.length}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                        {certificadosEmitidos.map((cert: any) => {
                            const validUrl = `https://gipp.app/validar?doc=${cert.docHash}&org=${encodeURIComponent(db.igreja?.nome || 'GIPP')}`;
                            return (
                                <div key={cert.id || cert.docHash} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xs transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-black text-[9px] uppercase rounded-md border border-indigo-200 dark:border-indigo-800">
                                                {cert.tipo?.replace('cert_', '').toUpperCase()}
                                            </span>
                                            <span className="font-mono text-xs font-black text-slate-700 dark:text-slate-300">
                                                {cert.docHash}
                                            </span>
                                        </div>
                                        <h4 className="font-black text-slate-800 dark:text-white text-sm">{cert.titular}</h4>
                                        <p className="text-[11px] text-slate-400 font-medium">
                                            Data de Emissão: {formatDateLocal(cert.data_emissao)}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                copyToClipboard(validUrl);
                                                addToast("Link de validação copiado com sucesso!", "success");
                                            }}
                                            className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                            title="Copiar Link de Validação"
                                        >
                                            <Copy size={13} /> Link
                                        </button>
                                        <button
                                            onClick={() => {
                                                const titularNome = cert.titular || 'Titular';
                                                const effectiveMembro = (db.membros || []).find((m: any) => String(m.id) === String(cert.membro_id)) || { nome: titularNome };
                                                setPrintData({
                                                    igreja: {
                                                        ...(db.igreja || {}),
                                                        pastor: cert.detalhes?.pastor || db.igreja?.pastor || 'Pastor Presidente'
                                                    },
                                                    membro: effectiveMembro,
                                                    extra: { 
                                                        ...cert.detalhes, 
                                                        titular: titularNome,
                                                        docHash: cert.docHash,
                                                        data_extenso: cert.detalhes?.data_extenso || formatDataExtenso(cert.data_emissao)
                                                    }
                                                });
                                                setPrintMode(cert.tipo);
                                                setPreviewOpen(true);
                                            }}
                                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                                        >
                                            <Printer size={13} /> Reimprimir
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {certificadosEmitidos.length === 0 && (
                            <div className="text-center py-12 text-slate-400">
                                <QrCode size={36} className="mx-auto mb-2 opacity-40"/>
                                <p className="text-xs font-bold uppercase tracking-wider">Nenhum certificado emitido até o momento</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModuleCertificados;

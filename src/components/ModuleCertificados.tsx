import React, { useState, useContext, useMemo } from 'react';
import { 
  Award, Droplets, Baby, Heart, Book, Megaphone, GraduationCap, 
  Printer, Edit, Search, CheckCircle, Copy, ExternalLink, ShieldCheck, 
  Calendar, User, Plus, Filter, RefreshCw, QrCode, FileText, Stamp
} from 'lucide-react';
import { collection, doc, addDoc, setDoc } from 'firebase/firestore';

import {
  ChurchContext, Button, FormInput, FormSelect,
  getTodayDate, formatDateLocal, copyToClipboard
} from '../App';

const ModuleCertificados = () => {
    const { db, setPrintMode, setPrintData, setPreviewOpen, dbFirestore, appId, addToast, logAction } = useContext(ChurchContext); 
    const [selectedType, setSelectedType] = useState<string | null>('cert_batismo');
    const [viewTab, setViewTab] = useState<'emitir' | 'historico'>('emitir');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Estado consolidado para os dados do certificado
    const [certData, setCertData] = useState({
        membro_id: '',
        cargo: 'Obreiro(a)',
        nome_crianca: '', nome_pai: '', nome_mae: '', data_nasc: '',
        nome_noivo: '', nome_noiva: '',
        curso: 'Teologia Básica',
        evento: 'Congresso Anual',
        turma_id: ''
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

    const handlePrint = async () => { 
        if (!selectedType) return;
        
        let membroInfo = null;
        if (certData.membro_id) {
            membroInfo = (db.membros || []).find((m: any) => m.id === certData.membro_id);
        }

        let turmaInfo = null;
        let professoresNomes = 'Superintendência EBD';
        if (certData.turma_id && db.ebd?.turmas) {
            turmaInfo = db.ebd.turmas.find((t: any) => t.id === certData.turma_id);
            if (turmaInfo) {
                professoresNomes = [turmaInfo.prof1_id, turmaInfo.prof2_id, turmaInfo.prof3_id]
                    .map((id: string) => (db.membros || []).find((m: any) => m.id === id)?.nome)
                    .filter(Boolean).join(', ') || 'Corpo Docente';
            }
        }

        const titularNome = membroInfo?.nome || certData.nome_crianca || certData.nome_noivo || 'Titular';
        const docHash = generateDocHash(selectedType, titularNome);

        // Preparar os dados exatos para injetar no modelo
        const finalData = { 
            igreja: db.igreja, 
            membro: membroInfo || {}, 
            extra: {
                cargo: certData.cargo,
                nome_crianca: certData.nome_crianca,
                nome_pai: certData.nome_pai,
                nome_mae: certData.nome_mae,
                data_nasc: certData.data_nasc,
                nome_noivo: certData.nome_noivo,
                nome_noiva: certData.nome_noiva,
                curso: certData.curso,
                evento: certData.evento,
                turma: turmaInfo ? turmaInfo.nome : 'Classe Dominical',
                professor: professoresNomes,
                docHash: docHash
            } 
        }; 

        // Salvar registro de emissão no Firestore para consulta e autenticidade
        try {
            const rawCertDoc = {
                tipo: selectedType || 'cert_geral',
                docHash: docHash || '',
                titular: titularNome || 'Titular',
                membro_id: certData.membro_id || '',
                data_emissao: new Date().toISOString(),
                detalhes: {
                    cargo: certData.cargo || '',
                    nome_crianca: certData.nome_crianca || '',
                    nome_pai: certData.nome_pai || '',
                    nome_mae: certData.nome_mae || '',
                    data_nasc: certData.data_nasc || '',
                    nome_noivo: certData.nome_noivo || '',
                    nome_noiva: certData.nome_noiva || '',
                    curso: certData.curso || '',
                    evento: certData.evento || '',
                    turma_id: certData.turma_id || '',
                    turma_nome: (turmaInfo && turmaInfo.nome) ? String(turmaInfo.nome) : ''
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
            <div className="flex flex-wrap gap-4 justify-between items-center bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl shadow-xs border border-amber-100">
                        <Award size={28}/>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Emissão & Validação de Certificados</h2>
                        <p className="text-xs text-slate-500 font-bold mt-0.5 uppercase tracking-wider">
                            Formatos A4 com Selo Oficial, QR Code e Hash de Autenticidade Digital
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                    <button
                        onClick={() => setViewTab('emitir')}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${viewTab === 'emitir' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        ✨ Emitir Novo
                    </button>
                    <button
                        onClick={() => setViewTab('historico')}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${viewTab === 'historico' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        📋 Histórico & Validação
                    </button>
                </div>
            </div>

            {viewTab === 'emitir' ? (
                <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden min-h-[500px]">
                    {/* Lado Esquerdo: Seleção do Modelo */}
                    <div className="w-full lg:w-1/3 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1">
                        <h3 className="font-black text-slate-700 uppercase tracking-widest text-xs mb-1">
                            1. Escolha o Tipo de Certificado
                        </h3>
                        {certTypes.map(c => {
                            const isSelected = selectedType === c.id;
                            return (
                                <button 
                                    key={c.id} 
                                    onClick={() => { setSelectedType(c.id); setCertData({...certData, membro_id: ''}); }} 
                                    className={`flex items-start gap-4 p-4 rounded-2xl border transition-all text-left group cursor-pointer ${isSelected ? 'bg-indigo-50/70 border-indigo-400 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                                >
                                    <div className={`p-3 rounded-xl transition-colors shrink-0 ${isSelected ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                                        <c.icon size={20} />
                                    </div>
                                    <div>
                                        <span className={`block font-black text-sm mb-0.5 ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>{c.label}</span>
                                        <span className="block text-[11px] font-medium text-slate-500 leading-tight">{c.desc}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Lado Direito: Formulário de Preenchimento */}
                    <div className="flex-1 bg-white rounded-3xl shadow-xs border border-slate-200 overflow-y-auto custom-scrollbar flex flex-col relative">
                        {!selectedType ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-10 text-center opacity-60">
                                <Stamp size={64} className="mb-6 text-slate-300"/>
                                <h3 className="text-xl font-bold text-slate-600 mb-2">Nenhum modelo selecionado</h3>
                                <p className="text-sm">Escolha uma das opções no painel lateral para preencher os dados e gerar o documento com QR Code.</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col">
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                    <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
                                        <Edit size={18} className="text-indigo-600"/> Preencher Dados do Documento Oficial
                                    </h3>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                        ✓ Validação QR Automática Ativada
                                    </span>
                                </div>
                                
                                <div className="p-6 flex-1 space-y-5">
                                    {/* Batismo */}
                                    {selectedType === 'cert_batismo' && (
                                        <div className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100">
                                            <FormSelect 
                                                label="Selecione o Membro Batizado" 
                                                value={certData.membro_id} 
                                                onChange={v => setCertData({...certData, membro_id: v})} 
                                                options={(db.membros || []).map((m: any)=>({label: m.nome, value: m.id}))} 
                                            />
                                        </div>
                                    )}

                                    {/* Consagração */}
                                    {selectedType === 'cert_consagracao' && (
                                        <div className="bg-rose-50/30 p-5 rounded-2xl border border-rose-100 space-y-4">
                                            <FormSelect 
                                                label="Selecione o Obreiro Consagrado" 
                                                value={certData.membro_id} 
                                                onChange={v => setCertData({...certData, membro_id: v})} 
                                                options={(db.membros || []).map((m: any)=>({label: m.nome, value: m.id}))} 
                                            />
                                            <FormSelect 
                                                label="Ofício / Cargo de Consagração" 
                                                value={certData.cargo} 
                                                onChange={v => setCertData({...certData, cargo: v})} 
                                                options={['Auxiliar de Trabalho', 'Diácono / Diaconisa', 'Presbítero', 'Evangelista', 'Missionário(a)', 'Pastor']} 
                                            />
                                        </div>
                                    )}

                                    {/* Apresentação de Criança */}
                                    {selectedType === 'cert_crianca' && (
                                        <div className="bg-amber-50/30 p-5 rounded-2xl border border-amber-100 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormInput label="Nome Completo da Criança" value={certData.nome_crianca} onChange={v => setCertData({...certData, nome_crianca: v})} required />
                                                <FormInput label="Data de Nascimento" type="date" value={certData.data_nasc} onChange={v => setCertData({...certData, data_nasc: v})} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormInput label="Nome do Pai" value={certData.nome_pai} onChange={v => setCertData({...certData, nome_pai: v})} />
                                                <FormInput label="Nome da Mãe" value={certData.nome_mae} onChange={v => setCertData({...certData, nome_mae: v})} required />
                                            </div>
                                        </div>
                                    )}

                                    {/* Casamento */}
                                    {selectedType === 'cert_casamento' && (
                                        <div className="bg-pink-50/30 p-5 rounded-2xl border border-pink-100 space-y-4">
                                            <FormInput label="Nome Completo do Noivo" value={certData.nome_noivo} onChange={v => setCertData({...certData, nome_noivo: v})} required />
                                            <FormInput label="Nome Completo da Noiva" value={certData.nome_noiva} onChange={v => setCertData({...certData, nome_noiva: v})} required />
                                        </div>
                                    )}

                                    {/* Conclusão de Curso */}
                                    {selectedType === 'cert_curso' && (
                                        <div className="bg-indigo-50/30 p-5 rounded-2xl border border-indigo-100 space-y-4">
                                            <FormSelect 
                                                label="Selecione o Aluno" 
                                                value={certData.membro_id} 
                                                onChange={v => setCertData({...certData, membro_id: v})} 
                                                options={(db.membros || []).map((m: any)=>({label: m.nome, value: m.id}))} 
                                            />
                                            <FormSelect 
                                                label="Nome do Curso Concluído" 
                                                value={certData.curso} 
                                                onChange={v => setCertData({...certData, curso: v})} 
                                                options={['Teologia Básica', 'Teologia Média', 'Bacharel em Teologia', 'Curso de Discipulado', 'Escola de Líderes', 'Capacitação Ministerial', 'Outro (Digitar na impressão)']} 
                                            />
                                        </div>
                                    )}

                                    {/* Participação em Evento */}
                                    {selectedType === 'cert_evento' && (
                                        <div className="bg-emerald-50/30 p-5 rounded-2xl border border-emerald-100 space-y-4">
                                            <FormSelect 
                                                label="Selecione o Participante" 
                                                value={certData.membro_id} 
                                                onChange={v => setCertData({...certData, membro_id: v})} 
                                                options={(db.membros || []).map((m: any)=>({label: m.nome, value: m.id}))} 
                                            />
                                            <FormInput label="Nome do Evento / Congresso" value={certData.evento} onChange={v => setCertData({...certData, evento: v})} placeholder="Ex: UMAD - Congresso de Jovens 2026" required />
                                        </div>
                                    )}

                                    {/* EBD */}
                                    {selectedType === 'cert_ebd' && (
                                        <div className="bg-purple-50/30 p-5 rounded-2xl border border-purple-100 space-y-4">
                                            <FormSelect 
                                                label="Selecione o Aluno" 
                                                value={certData.membro_id} 
                                                onChange={v => setCertData({...certData, membro_id: v})} 
                                                options={(db.membros || []).map((m: any)=>({label: m.nome, value: m.id}))} 
                                            />
                                            <FormSelect 
                                                label="Selecione a Turma da EBD" 
                                                value={certData.turma_id} 
                                                onChange={v => setCertData({...certData, turma_id: v})} 
                                                options={(db.ebd?.turmas || []).map((t: any)=>({label: t.nome, value: t.id}))} 
                                            />
                                        </div>
                                    )}

                                    {/* Digital Authenticity Explanation Banner */}
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck size={24} className="text-indigo-600" />
                                            <div>
                                                <strong className="text-slate-800 block">Selo de Autenticidade Criptográfica</strong>
                                                <span className="text-slate-500 text-[11px]">O documento será gerado com QR Code dinâmico rastreável e código alfanumérico único.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0">
                                    <Button onClick={handlePrint} variant="primary" className="w-full py-4 text-sm font-black uppercase tracking-wider shadow-lg shadow-indigo-600/20 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer">
                                        <Printer size={18}/> Gerar e Imprimir Documento Oficial (PDF)
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Aba Histórico de Certificados Emitidos */
                <div className="flex-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col space-y-4 overflow-hidden">
                    <div className="flex justify-between items-center gap-4 pb-3 border-b border-slate-100">
                        <div className="relative w-72">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar por titular, código ou tipo..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                        <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                            Total Registrados: {certificadosEmitidos.length}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                        {certificadosEmitidos.map((cert: any) => {
                            const validUrl = `https://gipp.app/validar?doc=${cert.docHash}&org=${encodeURIComponent(db.igreja?.nome || 'GIPP')}`;
                            return (
                                <div key={cert.id || cert.docHash} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-black text-[9px] uppercase rounded-md border border-indigo-200">
                                                {cert.tipo?.replace('cert_', '').toUpperCase()}
                                            </span>
                                            <span className="font-mono text-xs font-black text-slate-700">
                                                {cert.docHash}
                                            </span>
                                        </div>
                                        <h4 className="font-black text-slate-800 text-sm">{cert.titular}</h4>
                                        <p className="text-[11px] text-slate-400 font-medium">
                                            Emitido em: {formatDateLocal(cert.data_emissao)}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                copyToClipboard(validUrl);
                                                addToast("Link de validação copiado!", "success");
                                            }}
                                            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                            title="Copiar Link de Validação"
                                        >
                                            <Copy size={13} /> Link
                                        </button>
                                        <button
                                            onClick={() => {
                                                setPrintData({
                                                    igreja: db.igreja,
                                                    membro: (db.membros || []).find((m: any) => m.id === cert.membro_id) || { nome: cert.titular },
                                                    extra: { ...cert.detalhes, docHash: cert.docHash }
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

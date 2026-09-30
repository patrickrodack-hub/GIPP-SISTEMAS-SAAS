import { createPortal } from "react-dom";
import { getMedia, storeMedia } from "../lib/indexedDbService";
import { InteractiveWindow } from "./InteractiveWindow";
import { InteractiveMagazineView } from "./InteractiveMagazineView";
import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import { 
  BookOpen, Download, Printer, CheckCircle, Sparkles, Loader2, Book, 
  Award, Clock, ArrowRight, ExternalLink, Calendar, Users, Eye, 
  Maximize, Minimize, RefreshCw, FileText, CheckCircle2, ChevronRight, Check,
  MapPin, User, Info, List, Trash2, BookOpenText, Copy
} from "lucide-react";
import { ChurchContext } from "../context/ChurchContext";
import { Button, formatDateLocal } from "../utils/sharedHelpers";
import { CachedImage } from "./CachedImage";

const PortalEBD = ({ user, db }) => {
    const { addToast, setDoc, doc, dbFirestore, appId, isOnline, callGeminiAI, setPrintMode, setPrintData, setPreviewOpen } = useContext(ChurchContext);
    const [aiLesson, setAiLesson] = useState<any>(null);
    const [downloadedLessons, setDownloadedLessons] = useState<string[]>([]);
    const [downloadingIds, setDownloadingIds] = useState<string[]>([]);
    const [isEbdFullscreen, setIsEbdFullscreen] = useState(false);
    const [loadingList, setLoadingList] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoadingList(false);
        }, 850);
        return () => clearTimeout(timer);
    }, []);

    // Pré-carregamento (prefetch) automático das capas das revistas no IndexedDB
    useEffect(() => {
        if (!isOnline) return;
        
        let isMounted = true;
        const prefetchEbdImages = async () => {
            const licoes = db.ebd?.licoes || [];
            const uniqueRevistas = new Set<string>();
            const itemsToPrefetch: { url: string; key: string }[] = [];

            licoes.forEach((l: any) => {
                if (uniqueRevistas.has(l.revista)) return;
                const capa = l.capa && l.capa !== 'null' ? l.capa : (licoes.find((x: any) => x.revista === l.revista && x.capa && x.capa !== 'null')?.capa || null);
                if (capa && capa.startsWith('http')) {
                    uniqueRevistas.add(l.revista);
                    itemsToPrefetch.push({ url: capa, key: `ebd_capa_${l.revista}` });
                }
            });

            // Executa o pré-carregamento em segundo plano sem bloquear a interface de usuário
            for (const item of itemsToPrefetch) {
                if (!isMounted) break;
                try {
                    const cached = await getMedia(item.key);
                    if (!cached) {
                        const response = await fetch(item.url, { mode: 'cors' });
                        if (!response.ok) continue;
                        const blob = await response.blob();
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            if (reader.result && isMounted) {
                                storeMedia(item.key, reader.result as string)
                                    .then(() => {
                                        console.log(`[Prefetch] Capa da revista pre-carregada e salva em IndexedDB: ${item.key}`);
                                    })
                                    .catch((err) => {
                                        console.error(`[Prefetch] Falha ao armazenar a capa da revista ${item.key}:`, err);
                                    });
                            }
                        };
                        reader.readAsDataURL(blob);
                    }
                } catch (e) {
                    console.warn(`[Prefetch] Falha ao efetuar prefetch da imagem EBD ${item.url}:`, e);
                }
            }
        };

        // Delay inicial leve para priorizar primeiro render do Portal EBD
        const delayTimer = setTimeout(() => {
            prefetchEbdImages();
        }, 1500);

        return () => {
            isMounted = false;
            clearTimeout(delayTimer);
        };
    }, [db.ebd?.licoes, isOnline]);

    const isLicaoNova = (licao: any) => {
        if (licao.createdAt) {
            try {
                const createdTime = new Date(licao.createdAt).getTime();
                const now = new Date().getTime();
                const diffDays = (now - createdTime) / (1000 * 60 * 60 * 24);
                if (diffDays >= 0 && diffDays <= 7) return true;
            } catch (e) {}
        }
        if (licao.data) {
            try {
                const lessonTime = new Date(licao.data).getTime();
                const now = new Date().getTime();
                const diffDays = (now - lessonTime) / (1000 * 60 * 60 * 24);
                if (diffDays >= -3 && diffDays <= 7) return true;
            } catch (e) {}
        }
        return false;
    };

    const minhaMatricula = db.ebd?.alunos?.find(a => a.membro_id === user.id || a.nome === user.nome);
    const minhaTurma = minhaMatricula ? db.ebd?.turmas?.find(t => t.id === minhaMatricula.turma_id) : null;
    
    // NOVO: Permite aos membros acessar a biblioteca de lições de forma livre mesmo sem matrícula
    const licoesDisponiveis = minhaTurma 
        ? (db.ebd?.licoes || []).filter(l => l.turma_id === minhaTurma.id).sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime()) 
        : (db.ebd?.licoes || []).sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 15);

    // Check which lessons are currently cached on mount and updates
    useEffect(() => {
        const cachedKeys: string[] = [];
        (db.ebd?.licoes || []).forEach(l => {
            const key = `gipp_cached_ebd_lesson_${l.id || l.licao_numero || '1'}_${l.revista}`;
            if (localStorage.getItem(key)) {
                cachedKeys.push(l.id || l.licao_numero);
            }
        });
        setDownloadedLessons(cachedKeys);
    }, [db.ebd?.licoes]);

    const handleDownloadForOffline = async (licao, e) => {
        e.stopPropagation();
        if (!isOnline) {
            addToast("Apenas disponível online para pré-carregamento.", "warning");
            return;
        }
        setDownloadingIds(prev => [...prev, licao.id || licao.licao_numero]);
        addToast(`Pré-carregando Lição ${licao.licao_numero || ''} para leitura offline...`, "info");
        await handleGenerateLessonPlan(licao, true); // silent = true, just save to cache
        setDownloadingIds(prev => prev.filter(id => id !== (licao.id || licao.licao_numero)));
    };

    const handleDeleteOfflineCache = (licao, e) => {
        e.stopPropagation();
        const cacheKey = `gipp_cached_ebd_lesson_${licao.id || licao.licao_numero || '1'}_${licao.revista}`;
        localStorage.removeItem(cacheKey);
        
        setDownloadedLessons(prev => prev.filter(id => id !== (licao.id || licao.licao_numero)));
        addToast(`Estudo da Lição ${licao.licao_numero || ''} removido do armazenamento offline!`, "success");
    };

    const handleGenerateLessonPlan = async (licao, silent = false) => {
        const cacheKey = `gipp_cached_ebd_lesson_${licao.id || licao.licao_numero || '1'}_${licao.revista}`;
        const cachedData = localStorage.getItem(cacheKey);

        const getManualCapa = (l: any) => {
            if (l.capa && l.capa !== 'null') return l.capa;
            const licoes = db.ebd?.licoes || [];
            const licaoComCapa = licoes.find((x: any) => x.revista === l.revista && x.capa && x.capa !== 'null');
            return licaoComCapa ? licaoComCapa.capa : null;
        };

        const manualCapa = getManualCapa(licao);

        if (cachedData && !silent) {
            try {
                const parsed = JSON.parse(cachedData);
                const finalCapa = manualCapa || parsed.capa || null;
                setAiLesson({
                    loading: false,
                    text: parsed.text,
                    title: parsed.title,
                    revista: parsed.revista,
                    licao: parsed.licao,
                    capa: finalCapa,
                    fromCache: true
                });
                addToast("Lição carregada do Cache Local (Offline-ready)!", "success");
                return;
            } catch (e) {
                console.warn("Could not read EBD lesson from local storage:", e);
            }
        }

        // Se o estudo já tiver sido gerado e sincronizado no Firestore, carrega-o instantaneamente!
        if (licao.conteudo_estudo) {
            try {
                const finalCapa = manualCapa || licao.capa || null;
                const lessonObj = {
                    text: licao.conteudo_estudo,
                    title: `Estudo Interativo: Lição ${licao.licao_numero || '1'}`,
                    revista: licao.revista,
                    licao: licao.licao_numero || '1',
                    capa: finalCapa
                };
                
                localStorage.setItem(cacheKey, JSON.stringify(lessonObj));
                
                setDownloadedLessons(prev => {
                    const keyId = licao.id || licao.licao_numero;
                    if (!prev.includes(keyId)) return [...prev, keyId];
                    return prev;
                });
                
                if (!silent) {
                    setAiLesson({
                        loading: false,
                        text: licao.conteudo_estudo,
                        title: `Estudo Interativo: Lição ${licao.licao_numero || '1'}`,
                        revista: licao.revista,
                        licao: licao.licao_numero || '1',
                        capa: finalCapa,
                        fromCache: true
                    });
                    addToast("Lição carregada instantaneamente da biblioteca sincronizada!", "success");
                } else {
                    addToast(`Lição ${licao.licao_numero} pré-carregada e disponível offline!`, "success");
                }
                return;
            } catch (err) {
                console.error("Erro ao tratar conteúdo pré-existente:", err);
            }
        }

        if (!isOnline && !cachedData) {
            addToast("Você está offline e esta lição não está na memória do aparelho. Conecte-se à internet para estudar.", "warning");
            return;
        }

        const initialCapa = manualCapa || licao.capa || null;
        if (!silent) {
            setAiLesson({ loading: true, text: '', title: `Estudo Interativo: Lição ${licao.licao_numero || '1'}`, revista: licao.revista, licao: licao.licao_numero || '1', capa: initialCapa });
        }
        
        try {
            const hasCapaExistente = !!initialCapa;
            const prompt = `Atue como um teólogo especialista no material oficial da CPAD. 
            Pesquise e use obrigatoriamente como base de conteúdo e imagens as seguintes fontes: o currículo e portal oficial da CPAD (Casa Publicadora das Assembleias de Deus), Google Books API e Sistema EBD.
            O usuário deseja o conteúdo de estudo para a revista com o tema: "${licao.revista}", especificamente a Lição número ${licao.licao_numero || '1'}. 
            
            ${!hasCapaExistente ? 'Por favor, retorne no final do texto a URL de uma imagem da capa desta revista específica. Formate exatamente assim: URL_CAPA=[url_da_imagem]. Se não encontrar, coloque URL_CAPA=null.' : ''}

            Gere um conteúdo fiel, interativo e completo contendo:
            1. Título da Lição
            2. Texto Áureo e Verdade Prática
            3. Leitura Bíblica em Classe
            4. Introdução
            5. Tópicos e Subtópicos explicados
            6. Conclusão.
            
            Utilize formatação Markdown bem estruturada e rica.`;
            
            const result = await callGeminiAI(prompt, 5);
            
            let texto = result;
            let capaUrl = initialCapa;
            
            if (!hasCapaExistente) {
                const match = result.match(/URL_CAPA=\[?(.*?)\]?/);
                if (match && match[1] && match[1] !== 'null') {
                    capaUrl = match[1].trim();
                    texto = result.replace(match[0], '');
                } else {
                    capaUrl = manualCapa || null;
                }
            }
            
            const lessonObj = {
                text: texto,
                title: `Estudo Interativo: Lição ${licao.licao_numero || '1'}`,
                revista: licao.revista,
                licao: licao.licao_numero || '1',
                capa: capaUrl
            };
            
            localStorage.setItem(cacheKey, JSON.stringify(lessonObj));
            
            // Sincronizar de volta para o Firestore para todos os membros
            if (licao.id && dbFirestore && appId) {
                try {
                    await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'ebd_licoes', licao.id), {
                        conteudo_estudo: texto,
                        capa: capaUrl
                    }, { merge: true });
                } catch (dbErr) {
                    console.error("Erro ao sincronizar geração do estudo no Firestore:", dbErr);
                }
            }
            
            // Update downloaded list
            setDownloadedLessons(prev => {
                const keyId = licao.id || licao.licao_numero;
                if (!prev.includes(keyId)) return [...prev, keyId];
                return prev;
            });
            
            if (!silent) {
                setAiLesson({ loading: false, text: texto, title: `Estudo Interativo: Lição ${licao.licao_numero || '1'}`, revista: licao.revista, licao: licao.licao_numero || '1', capa: capaUrl });
                addToast("Lição salva no armazenamento offline do dispositivo!", "success");
            } else {
                addToast(`Lição ${licao.licao_numero} pré-carregada e disponível offline!`, "success");
            }
        } catch (err) {
            console.error(err);
            if (!silent) {
                setAiLesson(null);
                addToast("Não foi possível gerar a lição.", "error");
            }
        }
    };

    return (
        <div id="portal_ebd" className="space-y-6 animate-entrance">
            <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3"><BookOpen size={28} className="text-emerald-500"/> Escola Bíblica Dominical</h2>
            
            {minhaTurma ? (
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block">Aluno Matriculado</span>
                        <h3 className="text-2xl font-black text-slate-800 mb-1">{minhaTurma.nome}</h3>
                        <p className="text-sm text-slate-500 font-medium flex items-center gap-2"><MapPin size={16}/> {minhaTurma.sala || 'Sala Principal'}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 w-full md:w-auto">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Professores</p>
                        <ul className="text-sm font-bold text-slate-700 space-y-1">
                            {[minhaTurma.prof1_id, minhaTurma.prof2_id, minhaTurma.prof3_id].filter(Boolean).map(id => {
                                const p = db.membros.find(m => m.id === id);
                                return p ? <li key={id} className="flex items-center gap-2"><User size={14} className="text-emerald-500"/> {p.nome}</li> : null;
                            })}
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="bg-amber-50 border-2 border-amber-200 p-8 rounded-3xl flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 text-amber-500 shadow-sm"><Info size={32}/></div>
                    <h3 className="font-black text-xl text-amber-800 mb-2">Ainda não está matriculado(a)</h3>
                    <p className="text-sm text-amber-700 font-medium max-w-md">Não encontrámos o seu nome numa turma activa. Procure a secretaria para realizar a matrícula. No entanto, pode aceder ao estudo livre interativo abaixo.</p>
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        <List size={18} className="text-emerald-500"/> {minhaTurma ? 'Últimas Lições Ministradas' : 'Biblioteca de Lições (Estudo Livre)'}
                    </h4>
                    <button
                        onClick={() => {
                            const selectedLesson = aiLesson ? {
                                revista: aiLesson.revista,
                                licao_numero: aiLesson.licao,
                                titulo_licao: aiLesson.title,
                                conteudo_estudo: aiLesson.text,
                                capa: aiLesson.capa
                            } : (licoesDisponiveis.length > 0 ? {
                                revista: licoesDisponiveis[0].revista,
                                licao_numero: licoesDisponiveis[0].licao_numero,
                                titulo_licao: licoesDisponiveis[0].titulo_licao,
                                conteudo_estudo: licoesDisponiveis[0].conteudo_estudo,
                                capa: licoesDisponiveis[0].capa,
                                data_licao: licoesDisponiveis[0].data
                            } : {
                                revista: 'Lições Bíblicas CPAD',
                                licao_numero: '1',
                                titulo_licao: 'Estudo Geral de EBD'
                            });

                            setPrintData(selectedLesson);
                            setPrintMode('rel_ebd_imprimir');
                            setPreviewOpen(true);
                            addToast("Visualização de impressão da Lição EBD aberta!", "info");
                        }}
                        className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-2xs self-start sm:self-auto shrink-0"
                        title="Imprimir resumo didático limpo em PDF da lição selecionada"
                    >
                        <Printer size={15} /> Imprimir Resumo
                    </button>
                </div>
                {loadingList ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((num) => (
                            <div key={num} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100/70 transition-all">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 border border-slate-200 shadow-sm animate-pulse">
                                        <BookOpen size={20} className="text-slate-300" />
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-16 bg-slate-200 rounded animate-pulse"></div>
                                        </div>
                                        <div className="h-5 w-2/3 bg-slate-200 rounded animate-pulse"></div>
                                        <div className="h-4 w-1/3 bg-slate-100 rounded animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 self-end sm:self-center">
                                    <div className="h-8 w-24 bg-slate-100 rounded-xl animate-pulse"></div>
                                    <div className="h-8 w-24 bg-slate-150 rounded-xl animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : licoesDisponiveis.length > 0 ? (
                    <div className="space-y-4">
                        {licoesDisponiveis.map((l, i) => {
                            const isCached = downloadedLessons.includes(l.id || l.licao_numero);
                            const isDownloading = downloadingIds.includes(l.id || l.licao_numero);
                            const manualOrMagazineCapa = l.capa && l.capa !== 'null' ? l.capa : ((db.ebd?.licoes || []).find((x: any) => x.revista === l.revista && x.capa && x.capa !== 'null')?.capa || null);
                            
                            return (
                                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-12 h-16 bg-slate-50 text-slate-500 group-hover:bg-emerald-50 rounded-xl flex items-center justify-center transition-all shrink-0 border border-slate-200 group-hover:border-emerald-200 shadow-sm overflow-hidden">
                                            {manualOrMagazineCapa ? (
                                                <CachedImage src={manualOrMagazineCapa} cacheKey={`ebd_capa_${l.revista}`} className="w-full h-full object-cover" alt="Capa" />
                                            ) : (
                                                <BookOpen size={20} className="group-hover:text-emerald-600 transition-colors" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-emerald-200 truncate max-w-full">
                                                    Lição: {l.licao_numero || '#'}
                                                </span>
                                                {isCached && (
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-black bg-emerald-50 border border-emerald-200 text-emerald-600 rounded">
                                                        <Check size={8} /> DISPONÍVEL OFFLINE
                                                    </span>
                                                )}
                                                {l.conteudo_estudo && !isCached && (
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-black bg-teal-50 border border-teal-200 text-teal-600 rounded animate-pulse">
                                                        <Check size={8} /> ESTUDO COMPARTILHADO
                                                    </span>
                                                )}
                                                {isLicaoNova(l) && (
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-black bg-amber-500 text-white rounded border border-amber-600/15 shadow-2xs animate-pulse">
                                                        <Sparkles size={8} className="text-white fill-white" /> NOVO
                                                    </span>
                                                )}
                                            </div>
                                            <h5 className="font-bold text-slate-800 truncate" title={l.revista}>{l.revista}</h5>
                                            <p className="text-xs text-slate-500 mt-0.5 font-medium"><Calendar size={12} className="inline mr-1"/> {formatDateLocal(l.data)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                        {!isCached && isOnline && (
                                            <button 
                                                onClick={(e) => handleDownloadForOffline(l, e)}
                                                disabled={isDownloading}
                                                className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 bg-white hover:bg-indigo-50/30 cursor-pointer transition-colors shadow-2xs"
                                                title="Pré-carregar lição para leitura sem internet"
                                            >
                                                {isDownloading ? (
                                                    <>
                                                        <Loader2 size={13} className="animate-spin" /> Baixando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download size={13} /> Pré-carregar
                                                    </>
                                                )}
                                            </button>
                                        )}
                                        {isCached && (
                                            <button 
                                                onClick={(e) => handleDeleteOfflineCache(l, e)}
                                                className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 bg-white cursor-pointer transition-colors shadow-2xs"
                                                title="Excluir lição offline do aparelho"
                                            >
                                                <Trash2 size={13} /> Excluir
                                            </button>
                                        )}
                                        <button onClick={() => handleGenerateLessonPlan(l)} className="bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white px-4 py-2 rounded-xl transition-all shadow-sm font-bold text-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer">
                                            <BookOpenText size={16}/> Estudar
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 italic">Nenhuma lição registada no sistema ainda.</p>
                )}
            </div>

            {/* AI Lesson Modal - Estudo Interativo Portal Membro */}
            {aiLesson && createPortal(
                <InteractiveWindow
                    id="member_portal_ebd_study"
                    title={aiLesson.title}
                    subtitle={`EBD Inteligente • Estudar com IA ${aiLesson.fromCache ? '• Leitura Offline' : ''}`}
                    onClose={() => { setAiLesson(null); setIsEbdFullscreen(false); }}
                    icon={BookOpen}
                    headerBg="from-emerald-600 via-teal-700 to-slate-950"
                    defaultWidth={1000}
                    defaultHeight={750}
                    initialFullscreen={true}
                    footer={
                        <>
                            {!aiLesson.loading && (
                                <Button 
                                    onClick={() => { 
                                        navigator.clipboard.writeText(aiLesson.text); 
                                        addToast("Conteúdo copiado para a área de transferência!", "success"); 
                                    }} 
                                    variant="secondary" 
                                    className="shadow-sm border-slate-300 cursor-pointer"
                                >
                                    <Copy size={18} className="mr-1.5"/> Copiar Estudo Completo
                                </Button>
                            )}
                            <Button 
                                onClick={async () => { 
                                    try {
                                        const currentUserProfile = db.membros.find(m => m.id === user.id) || user;
                                        const currentEstudos = currentUserProfile.estudos_ebd_concluidos || [];
                                        const currentMonthStr = new Date().toISOString().slice(0, 7);
                                        
                                        // Regista a conclusão do estudo no banco de dados para garantir a gremiação
                                        if (!currentEstudos.some(e => e.mes === currentMonthStr && e.licao === aiLesson.licao)) {
                                            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'membros', user.id), {
                                                estudos_ebd_concluidos: [...currentEstudos, { mes: currentMonthStr, licao: aiLesson.licao, data: new Date().toISOString() }]
                                            }, { merge: true });
                                            addToast("Parabéns! Estudo EBD concluído e registado nas suas conquistas deste mês.", "success");
                                        }
                                    } catch(err) {
                                        console.error(err);
                                    }
                                    setAiLesson(null); 
                                    setIsEbdFullscreen(false);
                                }} 
                                variant="success" 
                                className="shadow-emerald-500/30 px-8 cursor-pointer"
                            >
                                Concluir Estudo
                            </Button>
                        </>
                    }
                >
                    {aiLesson.loading ? (
                        <div className="flex flex-col items-center justify-center text-emerald-600 min-h-[450px]">
                            <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-6"></div>
                            <p className="font-black text-base animate-pulse mb-1 animate-duration-1500">Buscando na biblioteca teológica...</p>
                            <p className="text-xs font-medium text-slate-500 text-center">A preparar o texto áureo e a explicação dos tópicos.</p>
                        </div>
                    ) : (
                        <div className="-m-6 sm:-m-8">
                            <InteractiveMagazineView 
                                lessonText={aiLesson.text}
                                revista={aiLesson.revista}
                                licaoNum={aiLesson.licao}
                                capaUrl={aiLesson.capa}
                            />
                        </div>
                    )}
                </InteractiveWindow>,
                document.body
            )}
        </div>
    );
};

export default PortalEBD;
export { PortalEBD };

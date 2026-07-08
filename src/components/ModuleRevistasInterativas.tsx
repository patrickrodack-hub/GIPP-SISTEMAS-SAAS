import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, RefreshCw, Trash2, Sparkles, BookMarked, Eye, ChevronLeft, ChevronRight, BookText, Bookmark, FileText, ZoomIn, ZoomOut, Maximize, Image as ImageIcon } from 'lucide-react';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { ChurchContext, ConfirmModal } from '../App';

// Self-contained page turn sound synthesizer utilizing Web Audio API
const playPageTurnSound = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        
        // Create noise buffer
        const bufferSize = ctx.sampleRate * 0.4; // 0.4 seconds
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = buffer;
        
        // Bandpass filter to create the swoosh/paper drag frequency sweep
        const filterNode = ctx.createBiquadFilter();
        filterNode.type = 'bandpass';
        filterNode.frequency.setValueAtTime(850, ctx.currentTime);
        filterNode.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.35);
        filterNode.Q.setValueAtTime(4, ctx.currentTime);
        
        // Envelope for smooth gain
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.08); // rapid rise
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38); // clean fade
        
        noiseNode.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        noiseNode.start(0);
        noiseNode.stop(ctx.currentTime + 0.4);
    } catch (e) {
        console.error("Audio error: ", e);
    }
};

export default function ModuleRevistasInterativas({ db, isPortal = false }: { db?: any, isPortal?: boolean }) {
    const { dbFirestore, appId, addToast } = useContext(ChurchContext);

    const [revistas, setRevistas] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [viewingRevista, setViewingRevista] = useState<any>(null);
    const [activeLessonIdx, setActiveLessonIdx] = useState<number>(0);
    const [direction, setDirection] = useState<number>(0);
    const [zoomLevel, setZoomLevel] = useState<number>(1);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State for ConfirmModal
    const [deleteConfirmInfo, setDeleteConfirmInfo] = useState<{ id: string } | null>(null);

    // Sync with Firestore (similar to Ministry of Praise module)
    useEffect(() => {
        if (!dbFirestore || !appId) {
            // Local fallback if Firebase not connected
            const stored = localStorage.getItem('gipp_revistas_interativas_v2');
            if (stored) {
                try {
                    setRevistas(JSON.parse(stored));
                } catch (e) {}
            } else {
                const oldStored = localStorage.getItem('gipp_revistas_interativas');
                if (oldStored) {
                    try {
                        const parsed = JSON.parse(oldStored);
                        setRevistas(parsed);
                    } catch (e) {}
                }
            }
            return;
        }

        const revistasRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'ebd_revistas');
        const unsub = onSnapshot(revistasRef, (snapshot: any) => {
            const list: any[] = [];
            snapshot.forEach((docSnap: any) => {
                list.push({ id: docSnap.id, ...docSnap.data() });
            });
            // Sort by data_upload descending
            list.sort((a, b) => (b.data_upload || '').localeCompare(a.data_upload || ''));
            setRevistas(list);
            try {
                localStorage.setItem('gipp_revistas_interativas_v2', JSON.stringify(list));
            } catch (e) {}
        }, (error: any) => {
            console.error("Error loading revistas from Firestore:", error);
        });

        return () => unsub();
    }, [dbFirestore, appId]);

    // Page turn audio trigger
    useEffect(() => {
        if (viewingRevista) {
            playPageTurnSound();
        }
    }, [activeLessonIdx]);

    const saveRevistas = async (newData: any[]) => {
        setRevistas(newData);
        try {
            localStorage.setItem('gipp_revistas_interativas_v2', JSON.stringify(newData));
        } catch (e) {}
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const reader = new FileReader();

        reader.onload = async (event) => {
            const base64Data = event.target?.result as string;
            
            try {
                setAnalyzing(true);
                addToast("Editorando revista com Inteligência Artificial...", "info");
                const response = await fetch('/api/gemini/analisar-ebd', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fileData: base64Data,
                        mimeType: file.type,
                        prompt: "Extraia o conteúdo da revista da Escola Bíblica Dominical (EBD) deste documento. Estruture como JSON contendo: { titulo_revista: string, capa_tema: string, licoes: [ { numero: number, titulo: string, texto_aureo: string, verdade_pratica: string, leitura_biblica: string, introducao: string, topicos: [ { titulo: string, conteudo: string } ], conclusao: string } ] }. Extraia o máximo de conteúdo que conseguir para os tópicos."
                    })
                });
                const responseData = await response.json();
                
                if (!response.ok) {
                    throw new Error(responseData?.error?.message || responseData?.message || 'Erro na API Gemini');
                }
                let extractedText = responseData.text;
                if (!extractedText) throw new Error("Texto extraído vazio ou inválido.");
                if (extractedText.includes('```json')) {
                    extractedText = extractedText.replace(/```json/g, '').replace(/```/g, '').trim();
                }
                const parsed = JSON.parse(extractedText);
                
                const newRevista = {
                    id: Date.now().toString(),
                    titulo_revista: parsed.titulo_revista || 'Revista EBD ' + new Date().getFullYear(),
                    capa_tema: parsed.capa_tema || 'Estudos Bíblicos',
                    data_upload: new Date().toISOString(),
                    licoes: parsed.licoes || []
                };
                
                if (dbFirestore && appId) {
                    const { id, ...cloudData } = newRevista;
                    await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'ebd_revistas', newRevista.id), cloudData);
                }
                
                const updatedList = [newRevista, ...revistas];
                await saveRevistas(updatedList);
                addToast('Revista extraída com sucesso e formatada para o leitor interativo!', 'success');
                
            } catch (error: any) {
                console.error('Erro na extração:', error);
                addToast(error?.message || 'Ocorreu um erro ao analisar a revista. Tente novamente.', 'error');
            } finally {
                setUploading(false);
                setAnalyzing(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDelete = (id: string) => {
        setDeleteConfirmInfo({ id });
    };

    const handleExecuteDelete = async () => {
        if (!deleteConfirmInfo) return;
        const { id } = deleteConfirmInfo;
        setDeleteConfirmInfo(null);

        try {
            if (dbFirestore && appId) {
                await deleteDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'ebd_revistas', id));
            }
            const updatedList = revistas.filter(r => r.id !== id);
            await saveRevistas(updatedList);
            if (viewingRevista?.id === id) setViewingRevista(null);
            addToast("Revista removida com sucesso.", "success");
        } catch (e: any) {
            console.error("Error deleting revista:", e);
            addToast("Ocorreu um erro ao excluir a revista.", "error");
        }
    };

    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 1.5));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
    const handleZoomReset = () => setZoomLevel(1);

    if (viewingRevista) {
        const licao = viewingRevista.licoes?.[activeLessonIdx];
        const totalLessons = viewingRevista.licoes?.length || 1;
        const progressPercent = ((activeLessonIdx + 1) / totalLessons) * 100;
        
        return (
            <div id="interactive_magazine_view" className="animate-fadeIn min-h-screen bg-[#f4f1ea] pb-24 font-serif overflow-x-hidden w-full max-w-full relative">
                {/* Fixed Top Progress Bar */}
                <div className="fixed top-0 left-0 right-0 h-1.5 bg-stone-200 z-[60] overflow-hidden">
                    <motion.div 
                        className="h-full bg-indigo-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                    />
                </div>

                {/* Navbar */}
                <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200 px-4 md:px-6 py-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm font-sans">
                    <button onClick={() => { setViewingRevista(null); setZoomLevel(1); }} className="text-stone-600 font-bold flex items-center gap-2 hover:text-indigo-600 transition-colors self-start sm:self-auto">
                        <ChevronLeft size={20} /> Biblioteca
                    </button>
                    
                    <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="flex items-center gap-2 bg-stone-100 rounded-full px-3 py-1.5 border border-stone-200">
                            <ZoomOut size={16} className="text-stone-500" />
                            <input 
                                type="range" 
                                min="0.5" max="1.5" step="0.05" 
                                value={zoomLevel} 
                                onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                                className="w-16 sm:w-24 accent-stone-700 cursor-pointer"
                                title="Ajustar Zoom"
                            />
                            <ZoomIn size={16} className="text-stone-500" />
                            <button onClick={handleZoomReset} className="ml-2 px-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors border-l border-stone-300" title="Zoom Original">{Math.round(zoomLevel * 100)}%</button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => {
                                    setDirection(-1);
                                    setActiveLessonIdx(Math.max(0, activeLessonIdx - 1));
                                }}
                                disabled={activeLessonIdx === 0}
                                className="p-2 rounded-full hover:bg-stone-200 text-stone-700 disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="text-xs sm:text-sm font-bold text-stone-600 uppercase tracking-widest px-2 whitespace-nowrap">
                                Lição {activeLessonIdx + 1} de {viewingRevista.licoes?.length || 0}
                            </span>
                            <button 
                                onClick={() => {
                                    setDirection(1);
                                    setActiveLessonIdx(Math.min((viewingRevista.licoes?.length || 1) - 1, activeLessonIdx + 1));
                                }}
                                disabled={activeLessonIdx === (viewingRevista.licoes?.length || 1) - 1}
                                className="p-2 rounded-full hover:bg-stone-200 text-stone-700 disabled:opacity-50 transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Magazine Layout */}
                {licao ? (
                    <div 
                        className="max-w-6xl mx-auto mt-6 md:mt-12 px-4 md:px-12 transition-transform duration-300 ease-in-out origin-top perspective-[1000px] md:perspective-[2000px] w-full max-w-full overflow-hidden"
                        style={{ transform: `scale(${zoomLevel})` }}
                    >
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={activeLessonIdx}
                                custom={direction}
                                initial={{ 
                                    opacity: 0, 
                                    rotateY: direction > 0 ? 45 : -45, 
                                    transformOrigin: direction > 0 ? 'right center' : 'left center' 
                                }}
                                animate={{ 
                                    opacity: 1, 
                                    rotateY: 0, 
                                    transformOrigin: direction > 0 ? 'right center' : 'left center' 
                                }}
                                exit={{ 
                                    opacity: 0, 
                                    rotateY: direction > 0 ? -45 : 45, 
                                    transformOrigin: direction > 0 ? 'left center' : 'right center' 
                                }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="w-full h-full"
                            >
                                {/* Header Banner - Stylized Visual Placeholder */}
                                <div className="relative w-full h-[280px] sm:h-[400px] md:h-[500px] rounded-[1rem] overflow-hidden mb-8 md:mb-16 shadow-2xl group bg-stone-200 border-4 border-white flex flex-col items-center justify-center">
                                    {/* This is the placeholder for AI Generated Images */}
                                    <div className="absolute inset-0 bg-stone-200/80 animate-pulse flex flex-col items-center justify-center text-stone-400 z-0">
                                        <ImageIcon size={48} className="mb-4 opacity-50" />
                                        <span className="font-sans text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-60 text-center px-4">Espaço para Imagem de Capa Gerada</span>
                                    </div>
                                    
                                    <img 
                                        src={`https://picsum.photos/seed/${encodeURIComponent(licao.titulo || 'bible')}/1200/600`} 
                                        alt={licao.titulo}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 mix-blend-overlay z-10"
                                    />
                                    
                                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent z-10"></div>
                                    
                                    <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 md:p-16 text-white z-20">
                                        <div className="inline-flex items-center gap-2 bg-indigo-700 text-white px-4 py-1.5 rounded-none text-[10px] sm:text-xs font-bold mb-4 sm:mb-6 uppercase tracking-[0.3em] border border-indigo-500 shadow-xl">
                                            Lição {licao.numero}
                                        </div>
                                        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black leading-tight mb-2 sm:mb-4 drop-shadow-lg" style={{ fontFamily: '"Playfair Display", "Merriweather", serif' }}>
                                            {licao.titulo}
                                        </h1>
                                    </div>
                                </div>

                                {/* Content Body Wrap */}
                                <div className="bg-white p-6 sm:p-10 md:p-16 rounded-sm shadow-2xl border-t-[12px] border-indigo-900">
                                    
                                    {/* Two Columns Info Block (Texto Áureo & Verdade Prática) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12 border-b-2 border-stone-100 pb-12">
                                        <div className="relative">
                                            <div className="absolute -left-4 -top-4 text-stone-100"><Bookmark size={64}/></div>
                                            <h3 className="text-stone-900 font-sans font-black text-xs sm:text-sm mb-4 sm:mb-6 uppercase tracking-[0.3em] relative z-10">Texto Áureo</h3>
                                            <p className="text-stone-800 text-lg sm:text-2xl leading-relaxed italic" style={{ fontFamily: '"Playfair Display", "Merriweather", serif' }}>
                                                "{licao.texto_aureo || 'Não especificado na extração.'}"
                                            </p>
                                        </div>
                                        
                                        <div className="relative">
                                            <div className="absolute -left-4 -top-4 text-stone-100"><Sparkles size={64}/></div>
                                            <h3 className="text-stone-900 font-sans font-black text-xs sm:text-sm mb-4 sm:mb-6 uppercase tracking-[0.3em] relative z-10">Verdade Prática</h3>
                                            <p className="text-stone-800 text-base sm:text-xl leading-loose font-serif">
                                                {licao.verdade_pratica || 'Não especificado na extração.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Leitura Bíblica */}
                                    {licao.leitura_biblica && (
                                        <div className="mb-12 border-l-[4px] sm:border-l-[6px] border-indigo-900 pl-4 sm:pl-8 py-2">
                                            <h3 className="text-stone-900 font-sans font-black text-xs sm:text-sm mb-4 uppercase tracking-[0.3em]">
                                                Leitura Bíblica em Classe
                                            </h3>
                                            <div className="text-stone-700 font-serif leading-loose text-base sm:text-xl">
                                                {licao.leitura_biblica}
                                            </div>
                                        </div>
                                    )}

                                    {/* Introdução com Drop Cap */}
                                    {licao.introducao && (
                                        <div className="mb-12">
                                            <h3 className="text-stone-900 font-sans font-black text-xs sm:text-sm mb-6 uppercase tracking-[0.3em] border-b border-stone-200 pb-4 inline-block">Introdução</h3>
                                            <p className="text-stone-800 text-base sm:text-xl leading-[2.2] font-serif text-justify first-letter:text-5xl sm:first-letter:text-7xl first-letter:font-black first-letter:text-indigo-900 first-letter:float-left first-letter:mr-4 first-letter:mt-2"
                                               style={{
                                                   textIndent: '0',
                                                   fontFamily: '"Playfair Display", "Merriweather", serif'
                                               }}>
                                                {licao.introducao}
                                            </p>
                                        </div>
                                    )}

                                    {/* Tópicos em Colunas Editoriais */}
                                    <div className="space-y-12 sm:space-y-16">
                                        {licao.topicos?.map((topico: any, idx: number) => (
                                            <div key={idx} className="relative pt-8 border-t border-stone-200">
                                                <div className="flex items-baseline gap-4 mb-6">
                                                    <span className="text-3xl sm:text-5xl font-black text-indigo-900" style={{ fontFamily: '"Playfair Display", serif' }}>{idx + 1}.</span>
                                                    <h3 className="text-2xl sm:text-3xl font-black text-stone-900 leading-snug" style={{ fontFamily: '"Playfair Display", serif' }}>
                                                        {topico.titulo}
                                                    </h3>
                                                </div>
                                                
                                                {/* Stylized Visual Placeholder for Topic Image */}
                                                <div className="w-full h-[200px] sm:h-[300px] md:h-[350px] bg-stone-50 border-2 border-dashed border-stone-300 mb-8 flex flex-col items-center justify-center text-stone-400 relative overflow-hidden group transition-all hover:bg-stone-100 hover:border-indigo-300">
                                                    <ImageIcon size={36} className="mb-3 opacity-50 group-hover:scale-110 transition-transform text-indigo-400" />
                                                    <span className="font-sans text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] opacity-60 text-stone-500 text-center px-4">
                                                        Espaço Reservado - Imagem Gerada por IA
                                                    </span>
                                                    <div className="absolute inset-0 bg-stone-200/20 animate-pulse pointer-events-none"></div>
                                                </div>

                                                <div className="text-stone-800 text-base sm:text-xl leading-[2.2] font-serif columns-1 md:columns-2 gap-8 md:gap-16 text-justify">
                                                    {topico.conteudo}
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {(!licao.topicos || licao.topicos.length === 0) && licao.resumo_topicos && (
                                             <div className="relative pt-8 border-t border-stone-200">
                                                <h3 className="text-2xl sm:text-3xl font-black text-stone-900 mb-8" style={{ fontFamily: '"Playfair Display", serif' }}>
                                                    Tópicos de Estudo
                                                </h3>
                                                <ul className="list-none space-y-6 text-stone-800 text-base sm:text-xl font-serif columns-1 md:columns-2 gap-8 md:gap-16">
                                                    {licao.resumo_topicos?.map((topico: string, i: number) => (
                                                        <li key={i} className="relative pl-6">
                                                            <span className="absolute left-0 top-3 w-2 h-2 bg-indigo-900 rounded-full"></span>
                                                            {topico}
                                                        </li>
                                                    ))}
                                                </ul>
                                             </div>
                                        )}
                                    </div>

                                    {/* Conclusão */}
                                    {licao.conclusao && (
                                        <div className="mt-16 sm:mt-24 bg-stone-50 p-6 sm:p-12 border-t-4 border-b-4 border-stone-200">
                                            <h3 className="text-stone-900 font-sans font-black text-xs sm:text-sm mb-4 sm:mb-6 uppercase tracking-[0.3em] text-center">Conclusão</h3>
                                            <p className="text-stone-800 text-lg sm:text-xl leading-[2.2] font-serif text-center max-w-4xl mx-auto italic">
                                                {licao.conclusao}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-[60vh]">
                        <p className="text-stone-500 font-sans font-medium uppercase tracking-widest text-center px-4">Nenhuma lição encontrada para este índice.</p>
                    </div>
                )}
            </div>
        );
    }

    // Default library view
    return (
        <div className="p-4 md:p-8 animate-fadeIn max-w-7xl mx-auto space-y-8 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-stone-900 p-6 md:p-12 rounded-[1rem] text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -z-0"></div>
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-indigo-600/30 text-indigo-200 px-4 py-1.5 rounded-full text-xs font-bold mb-4 uppercase tracking-[0.2em] backdrop-blur-sm border border-indigo-500/30">
                        <Sparkles size={14} /> IA Editorial
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black flex items-center gap-3 mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
                        Revista Interativa
                    </h1>
                    <p className="text-stone-300 text-base md:text-lg max-w-2xl leading-relaxed">
                        Faça o upload da sua revista da EBD. Nossa IA estrutura o conteúdo e o diagrama em um formato de <strong>revista editorial digital</strong>, pronto para estudos profundos.
                    </p>
                </div>
                
                {!isPortal && (
                    <div className="relative z-10 w-full md:w-auto mt-2 md:mt-0">
                        <input type="file" accept="image/*,application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading || analyzing}
                            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-none flex items-center justify-center gap-3 shadow-lg transition-all border border-indigo-400"
                        >
                            {analyzing ? <RefreshCw className="animate-spin text-white" size={20} /> : <BookOpen className="text-white" size={20} />}
                            {analyzing ? 'Editorando Revista...' : 'Criar Edição Digital'}
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mt-12">
                {revistas.map(revista => (
                    <div key={revista.id} className="bg-white shadow-md hover:shadow-2xl transition-all flex flex-col group overflow-hidden border border-stone-200 rounded-none">
                        <div className="h-64 bg-stone-100 relative overflow-hidden flex flex-col items-center justify-center border-b-4 border-indigo-900">
                            <img 
                                src={`https://picsum.photos/seed/${encodeURIComponent(revista.titulo_revista)}/400/500`}
                                alt="Capa"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 mix-blend-multiply"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 to-stone-900/20"></div>
                            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                <span className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
                                    Edição Interativa
                                </span>
                                <h3 className="font-black text-white text-2xl leading-snug drop-shadow-md" style={{ fontFamily: '"Playfair Display", serif' }}>
                                    {revista.titulo_revista}
                                </h3>
                            </div>
                        </div>

                        <div className="p-6 flex-1 flex flex-col bg-[#fdfbf7]">
                            <p className="text-xs text-stone-500 mb-6 font-bold uppercase tracking-[0.2em] border-b border-stone-200 pb-4">
                                Publicado em {new Date(revista.data_upload).toLocaleDateString('pt-BR')}
                            </p>
                            
                            <div className="text-stone-700 text-sm font-bold flex items-center gap-2 mb-6">
                                <FileText size={16} className="text-indigo-600" /> {revista.licoes?.length || 0} Artigos / Lições
                            </div>
                            
                            <div className="mt-auto pt-4 flex gap-3">
                                <button 
                                    onClick={() => {
                                        setActiveLessonIdx(0);
                                        setViewingRevista(revista);
                                    }}
                                    className="flex-1 bg-stone-900 hover:bg-indigo-900 text-white font-bold py-3 text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                >
                                    <Eye size={16} /> Ler Edição
                                </button>
                                {!isPortal && (
                                    <button 
                                        onClick={() => handleDelete(revista.id)}
                                        className="bg-white hover:bg-red-50 text-stone-400 hover:text-red-600 border border-stone-200 hover:border-red-200 p-3 transition-colors"
                                        title="Remover Edição"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {revistas.length === 0 && (
                    <div className="col-span-full py-32 text-center text-stone-500 border-y border-stone-200 flex flex-col items-center justify-center bg-stone-50/50">
                        <div className="mb-6 text-stone-300">
                            <BookOpen size={64} strokeWidth={1} />
                        </div>
                        <h3 className="font-black text-stone-800 text-3xl mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>Acervo Vazio</h3>
                        <p className="font-serif text-xl max-w-lg text-stone-500 mb-8 leading-relaxed">Nenhuma publicação foi processada. Comece importando um novo material didático.</p>
                        {!isPortal && (
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-stone-900 hover:bg-indigo-900 text-white font-bold py-4 px-10 flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-sm"
                            >
                                <Sparkles size={16} /> Importar Nova Revista
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Deletion confirmation modal aligned with the system's design patterns */}
            <ConfirmModal
                isOpen={!!deleteConfirmInfo}
                onClose={() => setDeleteConfirmInfo(null)}
                onConfirm={handleExecuteDelete}
                onCancel={() => setDeleteConfirmInfo(null)}
                title="Excluir Revista"
                message="Tem certeza de que deseja remover esta revista? Esta ação não poderá ser desfeita e removerá permanentemente os dados sincronizados."
                confirmText="Excluir"
                cancelText="Cancelar"
            />
        </div>
    );
}

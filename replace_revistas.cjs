const fs = require('fs');

const content = `import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, RefreshCw, Trash2, Sparkles, BookMarked, Eye, ChevronLeft, ChevronRight, BookText, Bookmark, FileText, ZoomIn, ZoomOut, Maximize, Image as ImageIcon } from 'lucide-react';

export default function ModuleRevistasInterativas({ db, isPortal = false }: { db?: any, isPortal?: boolean }) {
    const [revistas, setRevistas] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [viewingRevista, setViewingRevista] = useState<any>(null);
    const [activeLessonIdx, setActiveLessonIdx] = useState<number>(0);
    const [zoomLevel, setZoomLevel] = useState<number>(1);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
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
    }, []);

    const saveRevistas = (newData: any[]) => {
        setRevistas(newData);
        localStorage.setItem('gipp_revistas_interativas_v2', JSON.stringify(newData));
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
                if (extractedText.includes('\`\`\`json')) {
                    extractedText = extractedText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
                }
                const parsed = JSON.parse(extractedText);
                
                const newRevista = {
                    id: Date.now().toString(),
                    titulo_revista: parsed.titulo_revista || 'Revista EBD ' + new Date().getFullYear(),
                    capa_tema: parsed.capa_tema || 'Estudos Bíblicos',
                    data_upload: new Date().toISOString(),
                    licoes: parsed.licoes || []
                };
                
                saveRevistas([...revistas, newRevista]);
                alert('Revista extraída com sucesso e formatada para o leitor interativo!');
                
            } catch (error) {
                console.error('Erro na extração:', error);
                alert('Ocorreu um erro ao analisar a revista. Tente novamente.');
            } finally {
                setUploading(false);
                setAnalyzing(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDelete = (id: string) => {
        if(confirm("Remover esta revista?")) {
            saveRevistas(revistas.filter(r => r.id !== id));
            if (viewingRevista?.id === id) setViewingRevista(null);
        }
    };

    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 1.5));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
    const handleZoomReset = () => setZoomLevel(1);

    if (viewingRevista) {
        const licao = viewingRevista.licoes?.[activeLessonIdx];
        
        return (
            <div id="interactive_magazine_view" className="animate-fadeIn min-h-screen bg-[#f4f1ea] pb-24 font-serif">
                {/* Navbar */}
                <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200 px-6 py-4 flex items-center justify-between shadow-sm font-sans">
                    <button onClick={() => { setViewingRevista(null); setZoomLevel(1); }} className="text-stone-600 font-bold flex items-center gap-2 hover:text-indigo-600 transition-colors">
                        <ChevronLeft size={20} /> Biblioteca
                    </button>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-stone-100 rounded-full p-1 border border-stone-200">
                            <button onClick={handleZoomOut} className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-full transition-colors" title="Reduzir Zoom"><ZoomOut size={16} /></button>
                            <button onClick={handleZoomReset} className="px-3 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors" title="Zoom Original">{Math.round(zoomLevel * 100)}%</button>
                            <button onClick={handleZoomIn} className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-full transition-colors" title="Aumentar Zoom"><ZoomIn size={16} /></button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setActiveLessonIdx(Math.max(0, activeLessonIdx - 1))}
                                disabled={activeLessonIdx === 0}
                                className="p-2 rounded-full hover:bg-stone-200 text-stone-700 disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="text-sm font-bold text-stone-600 uppercase tracking-widest px-2">
                                Lição {activeLessonIdx + 1} de {viewingRevista.licoes?.length || 0}
                            </span>
                            <button 
                                onClick={() => setActiveLessonIdx(Math.min((viewingRevista.licoes?.length || 1) - 1, activeLessonIdx + 1))}
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
                        className="max-w-6xl mx-auto mt-12 px-6 md:px-12 transition-transform duration-300 ease-in-out origin-top"
                        style={{ transform: \`scale(\${zoomLevel})\` }}
                    >
                        {/* Header Banner - Stylized Visual Placeholder */}
                        <div className="relative w-full h-[500px] rounded-[1rem] overflow-hidden mb-16 shadow-2xl group bg-stone-200 border-4 border-white flex flex-col items-center justify-center">
                            {/* This is the placeholder for AI Generated Images */}
                            <div className="absolute inset-0 bg-stone-200/80 animate-pulse flex flex-col items-center justify-center text-stone-400 z-0">
                                <ImageIcon size={64} className="mb-4 opacity-50" />
                                <span className="font-sans text-sm font-bold uppercase tracking-widest opacity-60">Espaço para Imagem de Capa Gerada</span>
                            </div>
                            
                            <img 
                                src={\`https://picsum.photos/seed/\${encodeURIComponent(licao.titulo || 'bible')}/1200/600\`} 
                                alt={licao.titulo}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 mix-blend-overlay z-10"
                            />
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent z-10"></div>
                            
                            <div className="absolute bottom-0 left-0 w-full p-10 md:p-16 text-white z-20">
                                <div className="inline-flex items-center gap-2 bg-indigo-700 text-white px-5 py-2 rounded-none text-xs font-bold mb-6 uppercase tracking-[0.3em] border border-indigo-500 shadow-xl">
                                    Lição {licao.numero}
                                </div>
                                <h1 className="text-5xl md:text-7xl font-black leading-tight mb-4 drop-shadow-lg" style={{ fontFamily: '"Playfair Display", "Merriweather", serif' }}>
                                    {licao.titulo}
                                </h1>
                            </div>
                        </div>

                        {/* Content Body Wrap */}
                        <div className="bg-white p-10 md:p-16 rounded-sm shadow-2xl border-t-[12px] border-indigo-900">
                            
                            {/* Two Columns Info Block (Texto Áureo & Verdade Prática) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 border-b-2 border-stone-100 pb-16">
                                <div className="relative">
                                    <div className="absolute -left-6 -top-6 text-stone-100"><Bookmark size={80}/></div>
                                    <h3 className="text-stone-900 font-sans font-black text-sm mb-6 uppercase tracking-[0.3em] relative z-10">Texto Áureo</h3>
                                    <p className="text-stone-800 text-2xl leading-relaxed italic" style={{ fontFamily: '"Playfair Display", "Merriweather", serif' }}>
                                        "{licao.texto_aureo || 'Não especificado na extração.'}"
                                    </p>
                                </div>
                                
                                <div className="relative">
                                    <div className="absolute -left-6 -top-6 text-stone-100"><Sparkles size={80}/></div>
                                    <h3 className="text-stone-900 font-sans font-black text-sm mb-6 uppercase tracking-[0.3em] relative z-10">Verdade Prática</h3>
                                    <p className="text-stone-800 text-xl leading-loose font-serif">
                                        {licao.verdade_pratica || 'Não especificado na extração.'}
                                    </p>
                                </div>
                            </div>

                            {/* Leitura Bíblica */}
                            {licao.leitura_biblica && (
                                <div className="mb-16 border-l-[6px] border-indigo-900 pl-8 py-2">
                                    <h3 className="text-stone-900 font-sans font-black text-sm mb-4 uppercase tracking-[0.3em]">
                                        Leitura Bíblica em Classe
                                    </h3>
                                    <div className="text-stone-700 font-serif leading-loose text-xl">
                                        {licao.leitura_biblica}
                                    </div>
                                </div>
                            )}

                            {/* Introdução com Drop Cap */}
                            {licao.introducao && (
                                <div className="mb-16">
                                    <h3 className="text-stone-900 font-sans font-black text-sm mb-8 uppercase tracking-[0.3em] border-b border-stone-200 pb-4 inline-block">Introdução</h3>
                                    <p className="text-stone-800 text-xl leading-[2.2] font-serif text-justify"
                                       style={{
                                           textIndent: '0',
                                       }}>
                                        <span className="float-left text-8xl font-black text-indigo-900 leading-[0.8] pr-4 pt-2" style={{ fontFamily: '"Playfair Display", serif' }}>
                                            {licao.introducao.charAt(0)}
                                        </span>
                                        {licao.introducao.substring(1)}
                                    </p>
                                </div>
                            )}

                            {/* Tópicos em Colunas Editoriais */}
                            <div className="space-y-16">
                                {licao.topicos?.map((topico: any, idx: number) => (
                                    <div key={idx} className="relative pt-8 border-t border-stone-200">
                                        <div className="flex items-baseline gap-4 mb-8">
                                            <span className="text-5xl font-black text-indigo-900" style={{ fontFamily: '"Playfair Display", serif' }}>{idx + 1}.</span>
                                            <h3 className="text-3xl font-black text-stone-900 leading-snug" style={{ fontFamily: '"Playfair Display", serif' }}>
                                                {topico.titulo}
                                            </h3>
                                        </div>
                                        
                                        {/* Stylized Visual Placeholder for Topic Image */}
                                        <div className="w-full h-[250px] md:h-[350px] bg-stone-100 border border-stone-200 mb-10 flex flex-col items-center justify-center text-stone-400 relative overflow-hidden group">
                                            <ImageIcon size={48} className="mb-3 opacity-40 group-hover:scale-110 transition-transform" />
                                            <span className="font-sans text-xs font-bold uppercase tracking-[0.2em] opacity-50">Espaço para Arte Gráfica</span>
                                            {/* Simulate an image for now */}
                                            <img 
                                                src={\`https://picsum.photos/seed/\${encodeURIComponent(topico.titulo || 'topic')}/800/400\`} 
                                                alt="Topic"
                                                className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-multiply grayscale"
                                            />
                                        </div>

                                        <div className="text-stone-800 text-xl leading-[2.2] font-serif columns-1 md:columns-2 gap-16 text-justify">
                                            {topico.conteudo}
                                        </div>
                                    </div>
                                ))}
                                
                                {(!licao.topicos || licao.topicos.length === 0) && licao.resumo_topicos && (
                                     <div className="relative pt-8 border-t border-stone-200">
                                        <h3 className="text-3xl font-black text-stone-900 mb-8" style={{ fontFamily: '"Playfair Display", serif' }}>
                                            Tópicos de Estudo
                                        </h3>
                                        <ul className="list-none space-y-6 text-stone-800 text-xl font-serif columns-1 md:columns-2 gap-16">
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
                                <div className="mt-24 bg-stone-50 p-12 border-t-4 border-b-4 border-stone-200">
                                    <h3 className="text-stone-900 font-sans font-black text-sm mb-6 uppercase tracking-[0.3em] text-center">Conclusão</h3>
                                    <p className="text-stone-800 text-xl leading-[2.2] font-serif text-center max-w-4xl mx-auto italic">
                                        {licao.conclusao}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-[60vh]">
                        <p className="text-stone-500 font-sans font-medium uppercase tracking-widest">Nenhuma lição encontrada para este índice.</p>
                    </div>
                )}
            </div>
        );
    }

    // Default library view
    return (
        <div className="p-6 md:p-8 animate-fadeIn max-w-7xl mx-auto space-y-8 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-stone-900 p-8 md:p-12 rounded-[1rem] text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -z-0"></div>
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-indigo-600/30 text-indigo-200 px-4 py-1.5 rounded-full text-xs font-bold mb-4 uppercase tracking-[0.2em] backdrop-blur-sm border border-indigo-500/30">
                        <Sparkles size={14} /> IA Editorial
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black flex items-center gap-3 mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
                        Revista Interativa
                    </h1>
                    <p className="text-stone-300 text-lg max-w-2xl leading-relaxed">
                        Faça o upload da sua revista da EBD. Nossa IA estrutura o conteúdo e o diagrama em um formato de <strong>revista editorial digital</strong>, pronto para estudos profundos.
                    </p>
                </div>
                
                {!isPortal && (
                    <div className="relative z-10 w-full md:w-auto mt-6 md:mt-0">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-12">
                {revistas.map(revista => (
                    <div key={revista.id} className="bg-white shadow-md hover:shadow-2xl transition-all flex flex-col group overflow-hidden border border-stone-200 rounded-none">
                        <div className="h-64 bg-stone-100 relative overflow-hidden flex flex-col items-center justify-center border-b-4 border-indigo-900">
                            <img 
                                src={\`https://picsum.photos/seed/\${encodeURIComponent(revista.titulo_revista)}/400/500\`}
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
        </div>
    );
}
`;
fs.writeFileSync('src/components/ModuleRevistasInterativas.tsx', content, 'utf8');
console.log("Updated ModuleRevistasInterativas.tsx with editorial layout");

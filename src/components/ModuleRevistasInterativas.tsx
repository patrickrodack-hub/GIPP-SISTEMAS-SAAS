import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Upload, FileText, CheckCircle, RefreshCw, Trash2, Edit3, Save, Sparkles, BookMarked, Eye } from 'lucide-react';

export default function ModuleRevistasInterativas({ db, isPortal = false }: { db?: any, isPortal?: boolean }) {
    const [revistas, setRevistas] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [viewingRevista, setViewingRevista] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Mock initial fetch
    useEffect(() => {
        const stored = localStorage.getItem('gipp_revistas_interativas');
        if (stored) {
            try {
                setRevistas(JSON.parse(stored));
            } catch (e) {}
        }
    }, []);

    const saveRevistas = (newData: any[]) => {
        setRevistas(newData);
        localStorage.setItem('gipp_revistas_interativas', JSON.stringify(newData));
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
                        prompt: "Extraia o conteúdo da revista da Escola Bíblica Dominical (EBD). Estruture como JSON contendo: { titulo_revista: string, licoes: [ { numero: number, titulo: string, resumo_topicos: string[] } ] }."
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
                    data_upload: new Date().toISOString(),
                    licoes: parsed.licoes || []
                };
                
                saveRevistas([...revistas, newRevista]);
                alert('Revista extraída com sucesso!');
                
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
        }
    };

    if (viewingRevista) {
        return (
            <div className="animate-fadeIn p-6">
                <button onClick={() => setViewingRevista(null)} className="text-indigo-600 font-bold mb-4 flex items-center gap-2 hover:underline">
                    &larr; Voltar
                </button>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                    <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                        <BookMarked className="text-indigo-600" /> {viewingRevista.titulo_revista}
                    </h2>
                    
                    <div className="space-y-6">
                        {viewingRevista.licoes?.map((licao: any, idx: number) => (
                            <div key={idx} className="p-5 border border-slate-100 rounded-xl bg-slate-50">
                                <h3 className="font-bold text-lg text-slate-700 mb-2">Lição {licao.numero}: {licao.titulo}</h3>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-slate-500 uppercase">Tópicos de Estudo:</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-slate-600 text-sm">
                                        {licao.resumo_topicos?.map((topico: string, i: number) => (
                                            <li key={i}>{topico}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                        {viewingRevista.licoes?.length === 0 && <p className="text-slate-500 italic">Nenhuma lição extraída.</p>}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 animate-fadeIn max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-indigo-900 to-slate-900 p-8 rounded-3xl text-white shadow-xl">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3">
                        <BookOpen className="text-indigo-400" size={32} />
                        Revistas Interativas Oficiais
                    </h1>
                    <p className="text-indigo-200 mt-2">Módulo de extração e organização inteligente de Lições da EBD com IA.</p>
                </div>
                
                {!isPortal && (
                    <div>
                        <input type="file" accept="image/*,application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading || analyzing}
                            className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg transition-colors"
                        >
                            {analyzing ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                            {analyzing ? 'Analisando com IA...' : 'Nova Revista (PDF/Imagem)'}
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {revistas.map(revista => (
                    <div key={revista.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-50 to-transparent rounded-bl-full -z-0"></div>
                        <div className="relative z-10">
                            <h3 className="font-bold text-xl text-slate-800 mb-2 leading-tight">{revista.titulo_revista}</h3>
                            <p className="text-xs text-slate-500 mb-4">{new Date(revista.data_upload).toLocaleDateString()}</p>
                            
                            <div className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 mb-6">
                                <FileText size={14} /> {revista.licoes?.length || 0} Lições extraídas
                            </div>
                        </div>
                        
                        <div className="flex gap-2 relative z-10">
                            <button 
                                onClick={() => setViewingRevista(revista)}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5"
                            >
                                <Eye size={16} /> Estudar
                            </button>
                            {!isPortal && (
                                <button 
                                    onClick={() => handleDelete(revista.id)}
                                    className="bg-red-50 hover:bg-red-100 text-red-600 p-2.5 rounded-xl transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {revistas.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                        <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
                        <p className="font-medium text-lg">Nenhuma revista interativa processada.</p>
                        {!isPortal && <p className="text-sm mt-1">Faça o upload do material do trimestre para a Inteligência Artificial organizar as lições.</p>}
                    </div>
                )}
            </div>
        </div>
    );
}

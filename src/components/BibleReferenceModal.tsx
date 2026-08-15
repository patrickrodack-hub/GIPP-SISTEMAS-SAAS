import React, { useState, useEffect } from 'react';
import { 
    BookOpen, X, Volume2, VolumeX, Copy, Check, Search, 
    Sparkles, ShieldCheck, Bookmark, Compass, Heart, Share2, Award
} from 'lucide-react';
import { BibleReferenceDetail, CANONICAL_BIBLE_REFERENCES, findBibleReference } from '../data/bibleReferencesData';

interface BibleReferenceModalProps {
    isOpen: boolean;
    referenceQuery: string;
    onClose: () => void;
}

export const BibleReferenceModal: React.FC<BibleReferenceModalProps> = ({
    isOpen,
    referenceQuery,
    onClose
}) => {
    const [currentRef, setCurrentRef] = useState<BibleReferenceDetail | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [copied, setCopied] = useState(false);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);

    useEffect(() => {
        if (isOpen && referenceQuery) {
            const found = findBibleReference(referenceQuery);
            setCurrentRef(found);
            setSearchQuery('');
            setCopied(false);
            stopAudio();
        }
    }, [isOpen, referenceQuery]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                stopAudio();
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const stopAudio = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsPlayingAudio(false);
        }
    };

    const handleToggleAudio = () => {
        if (!currentRef || !('speechSynthesis' in window)) return;

        if (isPlayingAudio) {
            stopAudio();
            return;
        }

        stopAudio();
        const textToSpeak = `${currentRef.reference}. ${currentRef.text}. Explicação Teológica: ${currentRef.explanation}. Aplicação pastoral: ${currentRef.pastoralApplication}`;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.95;

        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);

        setIsPlayingAudio(true);
        window.speechSynthesis.speak(utterance);
    };

    const handleCopy = async () => {
        if (!currentRef) return;
        const textToCopy = `📖 ${currentRef.reference} (ARC - Almeida Revista e Corrigida)\n\n"${currentRef.text}"\n\n💡 Explicação Dogmática (CGADB/CPAD):\n${currentRef.explanation}\n\n🎯 Aplicação Pastoral:\n${currentRef.pastoralApplication}\n\n[Universidade Teológica GIPP]`;
        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch (err) {
            console.error("Erro ao copiar texto:", err);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        const found = findBibleReference(searchQuery);
        setCurrentRef(found);
        stopAudio();
    };

    if (!isOpen || !currentRef) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
            <div 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Top Banner Header */}
                <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-5 text-white flex items-center justify-between shrink-0 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-sm shrink-0">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-400/30">
                                    Texto Bíblico Sagrado
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/90 text-[10px] font-bold">
                                    Almeida Revista e Corrigida (ARC)
                                </span>
                            </div>
                            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mt-0.5">
                                {currentRef.reference}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 relative z-10">
                        <button
                            onClick={handleToggleAudio}
                            className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                                isPlayingAudio 
                                    ? 'bg-amber-500 text-slate-950 font-bold animate-pulse' 
                                    : 'bg-white/10 hover:bg-white/20 text-white'
                            }`}
                            title={isPlayingAudio ? "Parar leitura em áudio" : "Ouvir versículo e explicação em áudio"}
                        >
                            {isPlayingAudio ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>

                        <button
                            onClick={handleCopy}
                            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer flex items-center justify-center"
                            title="Copiar texto e explicação"
                        >
                            {copied ? <Check size={18} className="text-emerald-300" /> : <Copy size={18} />}
                        </button>

                        <button
                            onClick={() => {
                                stopAudio();
                                onClose();
                            }}
                            className="p-2.5 rounded-xl bg-white/10 hover:bg-rose-600/80 text-white transition-all cursor-pointer flex items-center justify-center"
                            title="Fechar janela"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Search Bar for Other References */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <form onSubmit={handleSearchSubmit} className="flex gap-2">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Consultar outro versículo ou tema (ex: 1 Tm 3:1-7, Atos 2:4, Dt 6:4, Tiago 5:14)..."
                                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all cursor-pointer shadow-xs shrink-0"
                        >
                            Consultar
                        </button>
                    </form>
                </div>

                {/* Modal Body with Scroll */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Biblical Text Card */}
                    <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 relative overflow-hidden shadow-inner">
                        <div className="flex items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5 mb-3">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                                    Texto Canônico Sagrado
                                </span>
                            </div>
                            <span className="text-[10px] font-mono text-amber-700/80 dark:text-amber-400/80">
                                ARC • CPAD
                            </span>
                        </div>

                        <p className="font-serif text-base md:text-lg text-slate-800 dark:text-slate-100 leading-relaxed italic">
                            "{currentRef.text}"
                        </p>
                    </div>

                    {/* Exegetical Explanation */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">
                                💡
                            </div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                Fundamentação e Exegese Teológica
                            </h3>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {currentRef.explanation}
                        </div>
                    </div>

                    {/* Pastoral Application */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xs font-black">
                                🎯
                            </div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                Aplicação Prática no Ministério & Vida Cristã
                            </h3>
                        </div>
                        <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/40 text-xs md:text-sm text-sky-900 dark:text-sky-200 leading-relaxed">
                            {currentRef.pastoralApplication}
                        </div>
                    </div>

                    {/* Dogmatic Reference Seal */}
                    <div className="p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                        <ShieldCheck size={24} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                                Alinhamento Dogmático Oficial
                            </span>
                            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                {currentRef.cgadbChapter}
                            </p>
                        </div>
                    </div>

                    {/* Quick Suggested References */}
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                            Outras Referências Dogmáticas Chave:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                            {Object.values(CANONICAL_BIBLE_REFERENCES).slice(0, 7).map((sug, sIdx) => (
                                <button
                                    key={sIdx}
                                    onClick={() => {
                                        setCurrentRef(sug);
                                        stopAudio();
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                        currentRef.reference === sug.reference
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                                    }`}
                                >
                                    📖 {sug.reference}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        {copied && (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                <Check size={14} /> Versículo e explicação copiados!
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopy}
                            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                        >
                            <Copy size={14} />
                            <span>Copiar</span>
                        </button>
                        <button
                            onClick={() => {
                                stopAudio();
                                onClose();
                            }}
                            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-black transition-all cursor-pointer shadow-xs"
                        >
                            Concluir Leitura
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

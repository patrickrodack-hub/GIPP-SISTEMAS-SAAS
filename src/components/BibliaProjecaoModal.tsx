import React, { useState, useMemo, useContext } from 'react';
import { 
  BookOpen, Search, X, Check, Tv, Copy, Flame, Bookmark, 
  Sparkles, Layers, ChevronRight, Share2, Compass, Heart
} from 'lucide-react';
import { 
  ALL_BIBLE_BOOKS, 
  BIBLE_DIVISIONS, 
  BibleBookInfo, 
  BibleVerseItem, 
  OFFLINE_KEY_VERSES, 
  findBibleBook, 
  getOfflineVerseText, 
  searchOfflineBible 
} from '../data/bibliaOfflineData';
import { bibleDatabaseService } from '../services/bibleDatabaseService';
import { holyricsService } from '../services/holyricsService';
import { ChurchContext } from '../App';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectForLiturgy?: (referencia: string, texto: string) => void;
}

export const BibliaProjecaoModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectForLiturgy
}) => {
  const { addToast } = useContext(ChurchContext) || {};

  // Modo de navegação: 'pesquisa' | 'navegador' | 'tematicos'
  const [tab, setTab] = useState<'pesquisa' | 'navegador' | 'tematicos'>('pesquisa');

  // Busca textual / referência
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Seleção no Navegador de Livros
  const [testament, setTestament] = useState<'VT' | 'NT'>('VT');
  const [selectedBook, setSelectedBook] = useState<BibleBookInfo>(ALL_BIBLE_BOOKS[0]);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [selectedVerseNum, setSelectedVerseNum] = useState<number>(1);

  // Categoria Temática
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  // Versículo Ativo para Projeção
  const [activeVerse, setActiveVerse] = useState<BibleVerseItem>(() => {
    return OFFLINE_KEY_VERSES[0];
  });

  const [copied, setCopied] = useState<boolean>(false);
  const [justProjected, setJustProjected] = useState<boolean>(false);

  // Versículos do capítulo selecionado
  const currentChapterVerses = useMemo(() => {
    return bibleDatabaseService.getChapterVerses(selectedBook.name, selectedChapter);
  }, [selectedBook.name, selectedChapter]);

  // Resultados da busca offline através do motor completo
  const searchResults = useMemo(() => {
    return bibleDatabaseService.searchVerses(searchQuery, 16);
  }, [searchQuery]);

  // Livros filtrados por testamento
  const filteredBooks = useMemo(() => {
    return ALL_BIBLE_BOOKS.filter(b => b.testament === testament);
  }, [testament]);

  // Versículos temáticos
  const thematicVerses = useMemo(() => {
    if (selectedCategory === 'todos') return OFFLINE_KEY_VERSES;
    return OFFLINE_KEY_VERSES.filter(v => v.category === selectedCategory);
  }, [selectedCategory]);

  if (!isOpen) return null;

  // Ao selecionar um versículo da busca ou temático
  const handleSelectVerseItem = (item: BibleVerseItem) => {
    setActiveVerse(item);
    const bookObj = findBibleBook(item.book);
    if (bookObj) {
      setSelectedBook(bookObj);
      setTestament(bookObj.testament);
      setSelectedChapter(item.chapter);
      setSelectedVerseNum(item.verse);
    }
  };

  // Alternar entre Antigo e Novo Testamento sincronizando o livro selecionado
  const handleSwitchTestament = (newTestament: 'VT' | 'NT') => {
    setTestament(newTestament);
    if (selectedBook.testament !== newTestament) {
      const firstBook = ALL_BIBLE_BOOKS.find(b => b.testament === newTestament);
      if (firstBook) {
        handleSelectBook(firstBook);
      }
    }
  };

  // Ao selecionar um livro no navegador
  const handleSelectBook = (book: BibleBookInfo) => {
    setSelectedBook(book);
    setTestament(book.testament);
    setSelectedChapter(1);
    setSelectedVerseNum(1);
    const verses = bibleDatabaseService.getChapterVerses(book.name, 1);
    const firstVerse = verses[0] || { verse: 1, text: "Palavra do Senhor..." };
    setActiveVerse({
      book: book.name,
      chapter: 1,
      verse: 1,
      reference: `${book.name} 1:1`,
      text: firstVerse.text
    });
  };

  // Ao selecionar um capítulo
  const handleSelectChapter = (chapter: number) => {
    setSelectedChapter(chapter);
    setSelectedVerseNum(1);
    const verses = bibleDatabaseService.getChapterVerses(selectedBook.name, chapter);
    const firstVerse = verses[0] || { verse: 1, text: "Palavra do Senhor..." };
    setActiveVerse({
      book: selectedBook.name,
      chapter,
      verse: 1,
      reference: `${selectedBook.name} ${chapter}:1`,
      text: firstVerse.text
    });
  };

  // Ao selecionar versículo
  const handleSelectVerseNum = (verseNum: number) => {
    setSelectedVerseNum(verseNum);
    const found = currentChapterVerses.find(v => v.verse === verseNum);
    if (found) {
      setActiveVerse({
        book: selectedBook.name,
        chapter: selectedChapter,
        verse: verseNum,
        reference: `${selectedBook.name} ${selectedChapter}:${verseNum}`,
        text: found.text
      });
    } else {
      const verseItem = getOfflineVerseText(selectedBook.name, selectedChapter, verseNum);
      setActiveVerse(verseItem);
    }
  };

  // Disparo para o Telão (mantém a janela aberta para operação contínua)
  const handleProjectLive = () => {
    holyricsService.projectBibleVerse(
      activeVerse.reference, 
      activeVerse.text, 
      'Almeida Revista e Corrigida (ARC)'
    );
    setJustProjected(true);
    setTimeout(() => setJustProjected(false), 2200);
    if (addToast) {
      addToast(`Versículo ${activeVerse.reference} projetado no Telão!`, 'success');
    }
  };

  // Enviar para o Retorno de Púlpito
  const handleSyncToPulpito = () => {
    holyricsService.syncVerseToPulpito(activeVerse.reference, activeVerse.text);
    if (addToast) {
      addToast(`Versículo ${activeVerse.reference} sincronizado no monitor do Púlpito!`, 'info');
    }
  };

  // Anexar à Liturgia
  const handleAttachToLiturgy = () => {
    if (onSelectForLiturgy) {
      onSelectForLiturgy(activeVerse.reference, activeVerse.text);
    } else {
      const pulpitoState = holyricsService.getState().pulpito;
      holyricsService.attachVerseToPulpitoBloco(
        pulpitoState.blocoAtivoIndex, 
        activeVerse.reference, 
        activeVerse.text
      );
    }
    if (addToast) {
      addToast(`Leitura Bíblica vinculada à liturgia do culto!`, 'success');
    }
    onClose();
  };

  // Copiar
  const handleCopyText = async () => {
    const textToCopy = `📖 ${activeVerse.reference} (ARC)\n\n"${activeVerse.text}"\n\n[Projeção Holyrics • Igreja Evangélica Assembleia de Deus]`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (addToast) addToast('Versículo copiado para a área de transferência!', 'info');
    } catch (e) {
      console.warn('Erro ao copiar:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200">
      <div 
        className="bg-slate-950 border border-slate-700/80 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-[0_25px_70px_rgba(0,0,0,0.85)] text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABEÇALHO */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-white">
                  Bíblia Sagrada Offline
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  100% Offline (ARC)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Seleção rápida de passagens e projeção em tempo real para o telão e púlpito
              </p>
            </div>
          </div>

          {/* Abas */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setTab('pesquisa')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tab === 'pesquisa' 
                  ? 'bg-sky-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pesquisa Rápida
            </button>
            <button
              onClick={() => setTab('navegador')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tab === 'navegador' 
                  ? 'bg-sky-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Livro / Cap / Versículo
            </button>
            <button
              onClick={() => setTab('tematicos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tab === 'tematicos' 
                  ? 'bg-sky-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mais Usados no Culto
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            title="Fechar Janela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CORPO PRINCIPAL COM DUAS COLUNAS */}
        <div className="flex-1 grid grid-cols-12 min-h-0 overflow-hidden">
          {/* COLUNA ESQUERDA: NAVEGAÇÃO E BUSCA (7 COLUNAS) */}
          <div className="col-span-12 lg:col-span-7 border-r border-slate-800 flex flex-col p-5 overflow-y-auto">
            
            {/* ABA 1: PESQUISA RÁPIDA & DIGITAÇÃO INTELIGENTE */}
            {tab === 'pesquisa' && (
              <div className="flex flex-col h-full space-y-4">
                <div className="relative">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Digite a referência (ex: Jo 3:16, Sl 23:1) ou palavras do versículo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-sky-500 rounded-2xl pl-11 pr-10 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Dica de atalhos rápidos */}
                <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-400">
                  <span className="font-bold text-slate-500">Exemplos rápidos:</span>
                  {['Jo 3:16', 'Sl 23:1', 'Is 53:5', 'Rm 8:28', 'Fp 4:13', 'Ap 22:20'].map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setSearchQuery(ex)}
                      className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-400 font-mono font-bold border border-slate-800 transition-all"
                    >
                      {ex}
                    </button>
                  ))}
                </div>

                {/* Lista de Versículos Encontrados */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-[280px]">
                  {searchResults.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <p className="text-sm font-medium">Nenhum versículo encontrado para essa pesquisa.</p>
                      <p className="text-xs text-slate-600 mt-1">Tente buscar por "pastor", "amor", "fé" ou informe o livro e capítulo.</p>
                    </div>
                  ) : (
                    searchResults.map((item, idx) => {
                      const isSelected = activeVerse.reference === item.reference;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelectVerseItem(item)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                            isSelected
                              ? 'bg-sky-950/60 border-sky-500/80 text-white shadow-md shadow-sky-950/50'
                              : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                              <Bookmark className="w-3.5 h-3.5 text-sky-400" />
                              {item.reference}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {item.book}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed italic line-clamp-2">
                            "{item.text}"
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* ABA 2: NAVEGADOR DE LIVROS, CAPÍTULOS E VERSÍCULOS */}
            {tab === 'navegador' && (
              <div className="flex flex-col h-full space-y-4">
                {/* Seletor de Testamento */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSwitchTestament('VT')}
                    className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      testament === 'VT'
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    Antigo Testamento (39 Livros)
                  </button>
                  <button
                    onClick={() => handleSwitchTestament('NT')}
                    className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      testament === 'NT'
                        ? 'bg-sky-500 text-slate-950 shadow-md font-black'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    Novo Testamento (27 Livros)
                  </button>
                </div>

                {/* Grade de Livros */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    1. Selecione o Livro da Bíblia:
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                    {filteredBooks.map((book) => {
                      const isSel = selectedBook.id === book.id;
                      return (
                        <button
                          key={book.id}
                          onClick={() => handleSelectBook(book)}
                          className={`p-2 rounded-xl text-xs font-bold truncate text-left transition-all ${
                            isSel
                              ? 'bg-sky-600 text-white shadow-md'
                              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                          }`}
                          title={`${book.name} (${book.chaptersCount} capítulos)`}
                        >
                          {book.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Grade de Capítulos */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      2. Selecione o Capítulo de {selectedBook.name}:
                    </label>
                    <span className="text-[10px] font-mono text-amber-400">
                      Cap. {selectedChapter} de {selectedBook.chaptersCount}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1 custom-scrollbar p-1 bg-slate-900/40 rounded-2xl border border-slate-800/80">
                    {Array.from({ length: selectedBook.chaptersCount }, (_, i) => i + 1).map((ch) => {
                      const isSel = selectedChapter === ch;
                      return (
                        <button
                          key={ch}
                          onClick={() => handleSelectChapter(ch)}
                          className={`w-9 h-8 rounded-xl font-bold font-mono text-xs flex items-center justify-center transition-all ${
                            isSel
                              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                          }`}
                        >
                          {ch}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Grade de Versículos */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      3. Selecione o Versículo:
                    </label>
                    <span className="text-[10px] font-mono text-teal-400">
                      {currentChapterVerses.length} versículos disponíveis
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 custom-scrollbar p-1 bg-slate-900/40 rounded-2xl border border-slate-800/80">
                    {currentChapterVerses.map((vObj) => {
                      const isSel = selectedVerseNum === vObj.verse;
                      return (
                        <button
                          key={vObj.verse}
                          onClick={() => handleSelectVerseNum(vObj.verse)}
                          className={`w-8 h-8 rounded-xl font-bold font-mono text-xs flex items-center justify-center transition-all cursor-pointer ${
                            isSel
                              ? 'bg-teal-500 text-slate-950 font-black shadow-md'
                              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                          }`}
                        >
                          {vObj.verse}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ABA 3: TEMÁTICOS / MOMENTOS DO CULTO */}
            {tab === 'tematicos' && (
              <div className="flex flex-col h-full space-y-3">
                {/* Pílulas de Categoria */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'todos', label: 'Todos' },
                    { id: 'abertura', label: 'Abertura & Invocação' },
                    { id: 'salvacao', label: 'Salvação & Apelo' },
                    { id: 'esperanca', label: 'Fé & Consolo' },
                    { id: 'cura', label: 'Cura Divina' },
                    { id: 'espirito', label: 'Pentecostes / Dons' },
                    { id: 'dizimo', label: 'Dízimos & Ofertas' },
                    { id: 'ceia', label: 'Santa Ceia' },
                    { id: 'familia', label: 'Família' },
                    { id: 'missoes', label: 'Missões' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Lista de Versículos Temáticos */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-[300px]">
                  {thematicVerses.map((item, idx) => {
                    const isSelected = activeVerse.reference === item.reference;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectVerseItem(item)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                          isSelected
                            ? 'bg-amber-950/40 border-amber-500/80 text-white shadow-md'
                            : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            {item.reference}
                          </span>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                            {item.category || 'Palavra'}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed italic line-clamp-3">
                          "{item.text}"
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* COLUNA DIREITA: PRÉ-VISUALIZAÇÃO DO TELÃO & DISPARO (5 COLUNAS) */}
          <div className="col-span-12 lg:col-span-5 flex flex-col justify-between p-5 bg-slate-900/30">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Tv className="w-4 h-4 text-teal-400" /> Prévia de Projeção no Telão
                </span>
                <span className="text-[10px] font-bold text-amber-400 font-mono">
                  ARC (Almeida Corrigida)
                </span>
              </div>

              {/* SIMULADOR DO TELÃO (Datashow / 16:9) */}
              <div className="w-full aspect-video bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-2xl border-2 border-slate-700/80 p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-bold uppercase tracking-widest text-amber-400">
                    {activeVerse.book}
                  </span>
                  <span>Assembleia de Deus</span>
                </div>

                <div className="my-auto py-2 text-center">
                  <p className="text-sm sm:text-base md:text-lg font-serif italic text-white leading-relaxed font-bold drop-shadow-md">
                    "{activeVerse.text}"
                  </p>
                  <div className="text-xs sm:text-sm font-black text-amber-400 mt-3 drop-shadow-sm">
                    — {activeVerse.reference}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                  <span>Telão Principal</span>
                  <span>Holyrics Multitelas</span>
                </div>
              </div>

              {/* Informações Exegéticas / Canônicas */}
              <div className="mt-4 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Referência Selecionada:
                </div>
                <div className="text-sm font-black text-white flex items-center gap-2">
                  <span>{activeVerse.reference}</span>
                  <span className="text-[10px] font-normal text-slate-400">• Almeida Revista e Corrigida</span>
                </div>
                <p className="text-[11px] text-slate-400 italic line-clamp-2 mt-1">
                  "{activeVerse.text}"
                </p>
              </div>
            </div>

            {/* AÇÕES DE DISPARO */}
            <div className="space-y-2 pt-4 border-t border-slate-800 mt-4">
              {/* Botão Principal: Projetar no Telão Agora */}
              <button
                onClick={handleProjectLive}
                className={`w-full py-3 px-4 font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] cursor-pointer ${
                  justProjected 
                    ? 'bg-emerald-600 text-white shadow-emerald-950/60 ring-2 ring-emerald-400 animate-pulse' 
                    : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-950/60'
                }`}
                title="Transmitir versículo imediatamente ao Telão (2º monitor)"
              >
                {justProjected ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>No Ar no Telão! (Transmitindo)</span>
                  </>
                ) : (
                  <>
                    <Tv className="w-4 h-4" />
                    <span>Projetar no Telão (Ao Vivo Agora)</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                {/* Enviar para Retorno do Púlpito */}
                <button
                  onClick={handleSyncToPulpito}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                  title="Exibir no monitor de retorno do pastor no púlpito"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Enviar ao Púlpito
                </button>

                {/* Anexar ao Roteiro da Liturgia */}
                <button
                  onClick={handleAttachToLiturgy}
                  className="py-2.5 px-3 bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  title="Vincular este versículo ao bloco da liturgia ativa"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Vincular Liturgia
                </button>
              </div>

              {/* Copiar e Fechar */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleCopyText}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
                </button>

                <button
                  onClick={onClose}
                  className="text-xs text-slate-400 hover:text-white font-bold px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Fechar Janela
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

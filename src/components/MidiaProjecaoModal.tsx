import React, { useState, useRef, useContext } from 'react';
import { 
  Image as ImageIcon, Upload, Check, Tv, Layers, X, Sparkles, 
  Trash2, Eye, Shield, Users, Heart, Flame, Calendar, DollarSign,
  Maximize2
} from 'lucide-react';
import { holyricsService } from '../services/holyricsService';
import { ChurchContext } from '../App';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAttachToLiturgy?: (imagemUrl: string, titulo: string) => void;
}

export interface ChurchMediaTemplate {
  id: string;
  titulo: string;
  categoria: 'anuncio' | 'conferencia' | 'congresso' | 'ceia' | 'dizimo' | 'familia' | 'ebd';
  subtitulo: string;
  imagemUrl: string;
}

// Banners oficiais de alta qualidade para cultos e eventos eclesiásticos
export const TEMPLATES_MIDIA_IGREJA: ChurchMediaTemplate[] = [
  {
    id: 'tpl-ceia',
    titulo: 'SANTA CEIA DO SENHOR',
    categoria: 'ceia',
    subtitulo: '“Fazei isto em memória de mim até que Ele venha”',
    imagemUrl: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'tpl-conferencia-missoes',
    titulo: 'CONFERÊNCIA MISSIONÁRIA',
    categoria: 'conferencia',
    subtitulo: '“Ide por todo o mundo e pregai o Evangelho a toda criatura”',
    imagemUrl: 'https://images.unsplash.com/photo-1519491058846-26527ba51c57?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'tpl-congresso-jovens',
    titulo: 'CONGRESSO DA MOCIDADE (UMADEB)',
    categoria: 'congresso',
    subtitulo: 'Juventude Forte na Palavra e no Poder do Espírito',
    imagemUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'tpl-circulo-oracao',
    titulo: 'CONGRESSO DO CÍRCULO DE ORAÇÃO',
    categoria: 'congresso',
    subtitulo: 'Mulheres de Oração • Fé, Graça e Avivamento',
    imagemUrl: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'tpl-dizimos',
    titulo: 'MOMENTO DOS DÍZIMOS E OFERTAS',
    categoria: 'dizimo',
    subtitulo: 'Gratidão e Adoração ao Deus que Prospera o Seu Povo',
    imagemUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'tpl-anuncios',
    titulo: 'AVISOS E COMUNICADOS DA SEMANA',
    categoria: 'anuncio',
    subtitulo: 'Programação Oficial da Igreja Evangélica Assembleia de Deus',
    imagemUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'tpl-familia',
    titulo: 'CULTO DA FAMÍLIA',
    categoria: 'familia',
    subtitulo: '“Eu e a minha casa serviremos ao Senhor” (Josué 24:15)',
    imagemUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'tpl-ebd',
    titulo: 'ESCOLA BÍBLICA DOMINICAL (EBD)',
    categoria: 'ebd',
    subtitulo: 'Crescendo na Graça e no Conhecimento das Sagradas Escrituras',
    imagemUrl: 'https://images.unsplash.com/photo-1507842229451-7f01be7a50d2?auto=format&fit=crop&w=1600&q=80'
  }
];

export const MidiaProjecaoModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAttachToLiturgy
}) => {
  const { addToast } = useContext(ChurchContext) || {};
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab: 'galeria' | 'upload'
  const [activeTab, setActiveTab] = useState<'galeria' | 'upload'>('galeria');

  // Mídia selecionada para projeção
  const [selectedMedia, setSelectedMedia] = useState<ChurchMediaTemplate>(TEMPLATES_MIDIA_IGREJA[0]);
  const [ajuste, setAjuste] = useState<'contain' | 'cover'>('contain');
  const [customTitle, setCustomTitle] = useState<string>(TEMPLATES_MIDIA_IGREJA[0].titulo);
  const [customSubtitle, setCustomSubtitle] = useState<string>(TEMPLATES_MIDIA_IGREJA[0].subtitulo);

  // Imagem personalizada carregada localmente pelo usuário
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [justProjected, setJustProjected] = useState<boolean>(false);

  if (!isOpen) return null;

  // Upload local de imagem via FileReader (PNG, JPG, WEBP)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      if (addToast) addToast('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP)!', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedImageUrl(result);
      setUploadedFileName(file.name);
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').toUpperCase();
      setCustomTitle(nameWithoutExt);
      setCustomSubtitle('Mídia Carregada do Computador');

      // Atualiza a mídia selecionada
      setSelectedMedia({
        id: `custom-upload-${Date.now()}`,
        titulo: nameWithoutExt,
        subtitulo: 'Mídia Local do Operador',
        categoria: 'anuncio',
        imagemUrl: result
      });

      if (addToast) addToast(`Imagem "${file.name}" carregada com sucesso!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  // Ao clicar em um template da galeria
  const handleSelectTemplate = (tpl: ChurchMediaTemplate) => {
    setSelectedMedia(tpl);
    setCustomTitle(tpl.titulo);
    setCustomSubtitle(tpl.subtitulo);
  };

  // Disparo para o Telão (mantém a janela aberta para operação contínua)
  const handleProjectLive = () => {
    if (!selectedMedia.imagemUrl) {
      if (addToast) addToast('Selecione ou envie uma imagem antes de projetar!', 'error');
      return;
    }

    holyricsService.projectMediaImage(customTitle, selectedMedia.imagemUrl, {
      subtitulo: customSubtitle,
      ajuste
    });

    setJustProjected(true);
    setTimeout(() => setJustProjected(false), 2400);

    if (addToast) {
      addToast(`Imagem "${customTitle}" projetada no Telão com sucesso!`, 'success');
    }
  };

  // Vincular à Liturgia
  const handleAttachToLiturgy = () => {
    if (!selectedMedia.imagemUrl) return;

    if (onAttachToLiturgy) {
      onAttachToLiturgy(selectedMedia.imagemUrl, customTitle);
    } else {
      const pulpitoState = holyricsService.getState().pulpito;
      holyricsService.attachMediaToPulpitoBloco(
        pulpitoState.blocoAtivoIndex, 
        selectedMedia.imagemUrl, 
        customTitle
      );
    }

    if (addToast) {
      addToast(`Mídia vinculada à liturgia ativa do culto!`, 'success');
    }
    onClose();
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
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-white">
                  Mídias & Imagens do Culto
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Cartazes • Conferências • Congressos
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Selecione arquivos do computador ou banners salvos da igreja para projetar no telão
              </p>
            </div>
          </div>

          {/* Abas */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('galeria')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'galeria' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Galeria da Igreja
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'upload' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Enviar do Computador
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
          {/* COLUNA ESQUERDA: SELEÇÃO E UPLOAD (7 COLUNAS) */}
          <div className="col-span-12 lg:col-span-7 border-r border-slate-800 p-5 flex flex-col space-y-4 overflow-y-auto">
            
            {/* ABA 1: GALERIA DE BANNERS PRÉ-CONFIGURADOS DA IGREJA */}
            {activeTab === 'galeria' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Banners Oficiais para Cultos e Eventos:
                  </span>
                  <span className="text-[10px] text-indigo-400 font-bold">
                    {TEMPLATES_MIDIA_IGREJA.length} modelos prontos
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
                  {TEMPLATES_MIDIA_IGREJA.map((tpl) => {
                    const isSelected = selectedMedia.id === tpl.id;
                    return (
                      <div
                        key={tpl.id}
                        onClick={() => handleSelectTemplate(tpl)}
                        className={`group relative rounded-2xl overflow-hidden border-2 transition-all cursor-pointer aspect-video flex flex-col justify-end p-3 ${
                          isSelected
                            ? 'border-indigo-400 ring-4 ring-indigo-500/20 shadow-xl'
                            : 'border-slate-800 hover:border-slate-700 opacity-85 hover:opacity-100'
                        }`}
                      >
                        {/* Imagem de fundo */}
                        <img 
                          src={tpl.imagemUrl} 
                          alt={tpl.titulo} 
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                        <div className="relative z-10">
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs mb-1 inline-block">
                            {tpl.categoria}
                          </span>
                          <h4 className="text-xs font-black text-white leading-tight">
                            {tpl.titulo}
                          </h4>
                          <p className="text-[10px] text-slate-300 truncate mt-0.5">
                            {tpl.subtitulo}
                          </p>
                        </div>

                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ABA 2: UPLOAD DO COMPUTADOR */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-3xl p-8 text-center bg-slate-900/50 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col items-center justify-center space-y-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white mb-1">
                      Clique aqui para selecionar uma imagem do computador
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Suporta arquivos PNG, JPG e WebP em alta resolução para transmissão no projetor.
                    </p>
                  </div>
                  <span className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/30">
                    Procurar Arquivo de Imagem
                  </span>
                </div>

                {uploadedImageUrl && (
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5 truncate">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        Arquivo: {uploadedFileName}
                      </span>
                      <button
                        onClick={() => {
                          setUploadedImageUrl(null);
                          setUploadedFileName('');
                          setSelectedMedia(TEMPLATES_MIDIA_IGREJA[0]);
                        }}
                        className="text-[10px] text-rose-400 hover:text-rose-300"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Ajustes de Título e Enquadramento */}
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Opções da Projeção de Imagem:
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">
                    Título / Legenda no Slide:
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">
                    Enquadramento no Telão:
                  </label>
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setAjuste('contain')}
                      className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        ajuste === 'contain' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Ajustar (Sem Cortar)
                    </button>
                    <button
                      onClick={() => setAjuste('cover')}
                      className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        ajuste === 'cover' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Preencher (Cover)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: SIMULADOR DO TELÃO EM TEMPO REAL (5 COLUNAS) */}
          <div className="col-span-12 lg:col-span-5 flex flex-col justify-between p-5 bg-slate-900/30">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Tv className="w-4 h-4 text-indigo-400" /> Prévia de Mídia no Telão
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Formato 16:9
                </span>
              </div>

              {/* SIMULADOR DO TELÃO COM A IMAGEM */}
              <div className="w-full aspect-video bg-black rounded-2xl border-2 border-slate-700/80 flex items-center justify-center shadow-2xl relative overflow-hidden group">
                {selectedMedia.imagemUrl ? (
                  <img
                    src={selectedMedia.imagemUrl}
                    alt={customTitle}
                    className={`w-full h-full ${
                      ajuste === 'contain' ? 'object-contain' : 'object-cover'
                    }`}
                  />
                ) : (
                  <div className="text-slate-600 text-xs text-center p-4">
                    Nenhuma imagem selecionada
                  </div>
                )}

                {/* Overlay opcional de título */}
                {customTitle && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 text-center">
                    <h4 className="text-xs sm:text-sm font-black text-white drop-shadow-md">
                      {customTitle}
                    </h4>
                    {customSubtitle && (
                      <p className="text-[10px] text-amber-300 drop-shadow-sm truncate">
                        {customSubtitle}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Info da Mídia */}
              <div className="mt-4 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Mídia Ativa para Transmissão:
                </div>
                <div className="text-sm font-black text-white truncate">
                  {customTitle}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Modo de Exibição: {ajuste === 'contain' ? 'Ajustado (proporção 100%)' : 'Preenchimento total'}
                </div>
              </div>
            </div>

            {/* AÇÕES DE DISPARO */}
            <div className="space-y-2 pt-4 border-t border-slate-800 mt-4">
              <button
                onClick={handleProjectLive}
                className={`w-full py-3 px-4 font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] cursor-pointer ${
                  justProjected
                    ? 'bg-emerald-600 text-white shadow-emerald-950/60 ring-2 ring-emerald-400 animate-pulse'
                    : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-950/60'
                }`}
                title="Transmitir imagem imediatamente ao Telão (2º monitor)"
              >
                {justProjected ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Imagem No Ar no Telão! (Transmitindo)</span>
                  </>
                ) : (
                  <>
                    <Tv className="w-4 h-4" />
                    <span>Projetar Imagem no Telão (Ao Vivo)</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAttachToLiturgy}
                  className="flex-1 py-2.5 px-3 bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Vincular ao Roteiro do Culto
                </button>

                <button
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs text-slate-400 hover:text-white font-bold cursor-pointer hover:bg-slate-800 rounded-xl transition-all"
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

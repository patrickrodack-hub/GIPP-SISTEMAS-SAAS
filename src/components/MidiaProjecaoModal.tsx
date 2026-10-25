import React, { useState, useRef, useContext, useEffect } from 'react';
import { 
  Image as ImageIcon, Upload, Check, Tv, Layers, X, 
  Trash2, Maximize2, Plus, Save, Star, Edit3, FolderHeart, Sparkles
} from 'lucide-react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { holyricsService } from '../services/holyricsService';
import { ChurchContext } from '../App';
import { storeMedia, getMedia } from '../lib/indexedDbService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAttachToLiturgy?: (imagemUrl: string, titulo: string) => void;
}

export type MediaCategory = 'anuncio' | 'conferencia' | 'congresso' | 'ceia' | 'dizimo' | 'familia' | 'ebd' | 'culto';

export interface ChurchMediaTemplate {
  id: string;
  titulo: string;
  categoria: MediaCategory;
  subtitulo: string;
  imagemUrl: string;
  isCustom?: boolean;
  ajustePadrao?: 'contain' | 'cover' | 'fill';
  exibirLegendaPadrao?: boolean;
  createdAt?: string;
}

const CUSTOM_TEMPLATES_IDB_KEY = 'gipp_holyrics_custom_media_templates_v1';
const CUSTOM_TEMPLATES_LS_KEY = 'gipp_holyrics_custom_media_templates_backup';

export const CATEGORIAS_MIDIA: { id: MediaCategory; label: string }[] = [
  { id: 'ceia', label: 'Santa Ceia' },
  { id: 'conferencia', label: 'Conferência' },
  { id: 'congresso', label: 'Congresso' },
  { id: 'dizimo', label: 'Dízimos e Ofertas' },
  { id: 'anuncio', label: 'Aviso / Comunicado' },
  { id: 'familia', label: 'Culto da Família' },
  { id: 'ebd', label: 'Escola Dominical (EBD)' },
  { id: 'culto', label: 'Culto Geral / Especial' }
];

// Banners oficiais de exemplo de alta qualidade para cultos e eventos eclesiásticos
export const TEMPLATES_MIDIA_IGREJA: ChurchMediaTemplate[] = [
  {
    id: 'tpl-ceia',
    titulo: 'SANTA CEIA DO SENHOR',
    categoria: 'ceia',
    subtitulo: '“Fazei isto em memória de mim até que Ele venha”',
    imagemUrl: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=1600&q=80',
    isCustom: false
  },
  {
    id: 'tpl-conferencia-missoes',
    titulo: 'CONFERÊNCIA MISSIONÁRIA',
    categoria: 'conferencia',
    subtitulo: '“Ide por todo o mundo e pregai o Evangelho a toda criatura”',
    imagemUrl: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1600&q=80',
    isCustom: false
  },
  {
    id: 'tpl-congresso-jovens',
    titulo: 'CONGRESSO DA MOCIDADE (UMADEB)',
    categoria: 'congresso',
    subtitulo: 'Juventude Forte na Palavra e no Poder do Espírito',
    imagemUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=80',
    isCustom: false
  },
  {
    id: 'tpl-circulo-oracao',
    titulo: 'CONGRESSO DO CÍRCULO DE ORAÇÃO',
    categoria: 'congresso',
    subtitulo: 'Mulheres de Oração • Fé, Graça e Avivamento',
    imagemUrl: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=1600&q=80',
    isCustom: false
  },
  {
    id: 'tpl-dizimos',
    titulo: 'MOMENTO DOS DÍZIMOS E OFERTAS',
    categoria: 'dizimo',
    subtitulo: 'Gratidão e Adoração ao Deus que Prospera o Seu Povo',
    imagemUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1600&q=80',
    isCustom: false
  },
  {
    id: 'tpl-anuncios',
    titulo: 'AVISOS E COMUNICADOS DA SEMANA',
    categoria: 'anuncio',
    subtitulo: 'Programação Oficial da Igreja Evangélica Assembleia de Deus',
    imagemUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1600&q=80',
    isCustom: false
  },
  {
    id: 'tpl-familia',
    titulo: 'CULTO DA FAMÍLIA',
    categoria: 'familia',
    subtitulo: '“Eu e a minha casa serviremos ao Senhor” (Josué 24:15)',
    imagemUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1600&q=80',
    isCustom: false
  },
  {
    id: 'tpl-ebd',
    titulo: 'ESCOLA BÍBLICA DOMINICAL (EBD)',
    categoria: 'ebd',
    subtitulo: 'Crescendo na Graça e no Conhecimento das Sagradas Escrituras',
    imagemUrl: 'https://images.unsplash.com/photo-1507842229451-7f01be7a50d2?auto=format&fit=crop&w=1600&q=80',
    isCustom: false
  }
];

export const MidiaProjecaoModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAttachToLiturgy
}) => {
  const { addToast, dbFirestore, appId } = useContext(ChurchContext) || {};
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab principal: 'galeria' | 'upload'
  const [activeTab, setActiveTab] = useState<'galeria' | 'upload'>('galeria');

  // Filtro da Galeria: 'todos' | 'meus' | 'exemplos'
  const [galleryFilter, setGalleryFilter] = useState<'todos' | 'meus' | 'exemplos'>('todos');

  // Lista de Modelos Próprios Salvos pela Igreja
  const [customTemplates, setCustomTemplates] = useState<ChurchMediaTemplate[]>([]);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // Mídia selecionada para projeção
  const [selectedMedia, setSelectedMedia] = useState<ChurchMediaTemplate>(TEMPLATES_MIDIA_IGREJA[0]);
  const [ajuste, setAjuste] = useState<'contain' | 'cover' | 'fill'>('contain');
  const [customTitle, setCustomTitle] = useState<string>(TEMPLATES_MIDIA_IGREJA[0].titulo);
  const [customSubtitle, setCustomSubtitle] = useState<string>(TEMPLATES_MIDIA_IGREJA[0].subtitulo);
  const [customCategory, setCustomCategory] = useState<MediaCategory>(TEMPLATES_MIDIA_IGREJA[0].categoria);
  const [exibirLegenda, setExibirLegenda] = useState<boolean>(false);

  // Imagem personalizada carregada localmente pelo usuário ou por URL
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [externalImageUrl, setExternalImageUrl] = useState<string>('');
  const [justProjected, setJustProjected] = useState<boolean>(false);
  const [isSavingModel, setIsSavingModel] = useState<boolean>(false);

  // Carrega os modelos personalizados salvos no IndexedDB / LocalStorage / Firestore
  useEffect(() => {
    let isMounted = true;

    const loadSavedTemplates = async () => {
      try {
        // 1. Tenta carregar do IndexedDB (suporta imagens em alta resolução Base64)
        const fromIdb = await getMedia(CUSTOM_TEMPLATES_IDB_KEY);
        if (fromIdb) {
          const parsed = typeof fromIdb === 'string' ? JSON.parse(fromIdb) : fromIdb;
          if (Array.isArray(parsed) && isMounted) {
            setCustomTemplates(parsed);
            return;
          }
        }

        // 2. Fallback do localStorage
        const fromLs = localStorage.getItem(CUSTOM_TEMPLATES_LS_KEY);
        if (fromLs) {
          const parsed = JSON.parse(fromLs);
          if (Array.isArray(parsed) && isMounted) {
            setCustomTemplates(parsed);
          }
        }

        // 3. Se online e com Firestore disponível, sincroniza modelos compartilhados da igreja
        if (dbFirestore && appId) {
          const docRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'config', 'midia_templates_custom');
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data?.templates && Array.isArray(data.templates) && isMounted) {
              setCustomTemplates(data.templates);
              await storeMedia(CUSTOM_TEMPLATES_IDB_KEY, JSON.stringify(data.templates));
            }
          }
        }
      } catch (e) {
        console.warn('Erro ao carregar modelos de mídia personalizados:', e);
      }
    };

    if (isOpen) {
      loadSavedTemplates();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, dbFirestore, appId]);

  if (!isOpen) return null;

  // Persiste a lista atualizada de modelos próprios da igreja
  const persistCustomTemplates = async (updatedList: ChurchMediaTemplate[]) => {
    setCustomTemplates(updatedList);
    const serialized = JSON.stringify(updatedList);

    try {
      await storeMedia(CUSTOM_TEMPLATES_IDB_KEY, serialized);
    } catch (e) {
      console.warn('Erro ao gravar modelos no IndexedDB:', e);
    }

    try {
      localStorage.setItem(CUSTOM_TEMPLATES_LS_KEY, serialized);
    } catch (e) {
      // Se exceder limite de localStorage por imagens grandes, o IndexedDB já garante a persistência
    }

    if (dbFirestore && appId) {
      try {
        // Sincroniza modelos leves ou com URLs no Firestore
        const lightList = updatedList.filter((t) => t.imagemUrl.length < 750000);
        await setDoc(
          doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'config', 'midia_templates_custom'),
          { templates: lightList, updatedAt: new Date().toISOString() },
          { merge: true }
        );
      } catch (e) {
        // Sem impacto local
      }
    }
  };

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
      setCustomSubtitle('');

      setSelectedMedia({
        id: editingTemplateId || `custom-upload-${Date.now()}`,
        titulo: nameWithoutExt,
        subtitulo: '',
        categoria: customCategory || 'anuncio',
        imagemUrl: result,
        isCustom: true
      });

      if (addToast) addToast(`Imagem "${file.name}" carregada! Você pode projetá-la ou salvá-la em "Meus Modelos".`, 'success');
    };
    reader.readAsDataURL(file);
  };

  // Salvar a configuração e imagem atuais como um Modelo Próprio na Galeria
  const handleSaveAsCustomTemplate = async () => {
    const imageToSave = uploadedImageUrl || externalImageUrl.trim() || selectedMedia.imagemUrl;
    if (!imageToSave) {
      if (addToast) addToast('Selecione ou carregue uma imagem antes de salvar o modelo!', 'error');
      return;
    }

    const titleToSave = customTitle.trim() || 'MEU MODELO DO CULTO';
    setIsSavingModel(true);

    try {
      const newTemplate: ChurchMediaTemplate = {
        id: editingTemplateId || `meu-modelo-${Date.now()}`,
        titulo: titleToSave.toUpperCase(),
        subtitulo: customSubtitle.trim(),
        categoria: customCategory || 'anuncio',
        imagemUrl: imageToSave,
        isCustom: true,
        ajustePadrao: ajuste,
        exibirLegendaPadrao: exibirLegenda,
        createdAt: new Date().toISOString()
      };

      let updated: ChurchMediaTemplate[];
      if (editingTemplateId && customTemplates.some((t) => t.id === editingTemplateId)) {
        updated = customTemplates.map((t) => (t.id === editingTemplateId ? newTemplate : t));
      } else {
        updated = [newTemplate, ...customTemplates];
      }

      await persistCustomTemplates(updated);
      setSelectedMedia(newTemplate);
      setEditingTemplateId(null);
      setActiveTab('galeria');
      setGalleryFilter('todos');

      if (addToast) {
        addToast(`Modelo "${newTemplate.titulo}" salvo com sucesso na sua galeria!`, 'success');
      }
    } finally {
      setIsSavingModel(false);
    }
  };

  // Excluir um modelo personalizado salvo pelo usuário
  const handleDeleteCustomTemplate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = customTemplates.find((t) => t.id === id);
    const updated = customTemplates.filter((t) => t.id !== id);
    await persistCustomTemplates(updated);

    if (selectedMedia.id === id) {
      const next = updated[0] || TEMPLATES_MIDIA_IGREJA[0];
      handleSelectTemplate(next);
    }
    if (editingTemplateId === id) {
      setEditingTemplateId(null);
    }
    if (addToast) {
      addToast(`Modelo "${target?.titulo || 'Personalizado'}" removido da galeria.`, 'info');
    }
  };

  // Editar um modelo próprio existente
  const handleEditCustomTemplate = (tpl: ChurchMediaTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    handleSelectTemplate(tpl);
    setEditingTemplateId(tpl.id);
    setUploadedImageUrl(tpl.imagemUrl);
    setUploadedFileName(tpl.titulo);
    setActiveTab('upload');
  };

  // Iniciar criação de um novo modelo em branco
  const handleStartNewCustomTemplate = () => {
    setEditingTemplateId(null);
    setUploadedImageUrl(null);
    setUploadedFileName('');
    setExternalImageUrl('');
    setCustomTitle('');
    setCustomSubtitle('');
    setCustomCategory('anuncio');
    setActiveTab('upload');
  };

  // Ao clicar em um template da galeria (seja Próprio ou Exemplo)
  const handleSelectTemplate = (tpl: ChurchMediaTemplate) => {
    setSelectedMedia(tpl);
    setCustomTitle(tpl.titulo);
    setCustomSubtitle(tpl.subtitulo || '');
    setCustomCategory(tpl.categoria || 'anuncio');
    if (tpl.ajustePadrao) {
      setAjuste(tpl.ajustePadrao);
    }
    if (tpl.exibirLegendaPadrao !== undefined) {
      setExibirLegenda(tpl.exibirLegendaPadrao);
    }
  };

  // Disparo para o Telão (mantém a janela aberta para operação contínua)
  const handleProjectLive = () => {
    const imgUrl = uploadedImageUrl || externalImageUrl.trim() || selectedMedia.imagemUrl;
    if (!imgUrl) {
      if (addToast) addToast('Selecione ou envie uma imagem antes de projetar!', 'error');
      return;
    }

    holyricsService.projectMediaImage(customTitle || 'Mídia do Culto', imgUrl, {
      subtitulo: exibirLegenda ? customSubtitle : undefined,
      ajuste,
      ocultarLegenda: !exibirLegenda
    });

    setJustProjected(true);
    setTimeout(() => setJustProjected(false), 2400);

    if (addToast) {
      addToast(`Imagem projetada no Telão com sucesso!`, 'success');
    }
  };

  // Vincular à Liturgia
  const handleAttachToLiturgy = () => {
    const imgUrl = uploadedImageUrl || externalImageUrl.trim() || selectedMedia.imagemUrl;
    if (!imgUrl) return;

    if (onAttachToLiturgy) {
      onAttachToLiturgy(imgUrl, customTitle);
    } else {
      const pulpitoState = holyricsService.getState().pulpito;
      holyricsService.attachMediaToPulpitoBloco(
        pulpitoState.blocoAtivoIndex, 
        imgUrl, 
        customTitle
      );
    }

    if (addToast) {
      addToast(`Mídia vinculada à liturgia ativa do culto!`, 'success');
    }
    onClose();
  };

  // Lista combinada conforme filtro ativo na galeria
  const displayedTemplates: ChurchMediaTemplate[] =
    galleryFilter === 'meus'
      ? customTemplates
      : galleryFilter === 'exemplos'
      ? TEMPLATES_MIDIA_IGREJA
      : [...customTemplates, ...TEMPLATES_MIDIA_IGREJA];

  const currentPreviewImage = uploadedImageUrl || externalImageUrl.trim() || selectedMedia.imagemUrl;

  return (
    <div className="fixed inset-0 z-[9999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200">
      <div 
        className="bg-slate-950 border border-slate-700/80 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-[0_25px_70px_rgba(0,0,0,0.85)] text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABEÇALHO */}
        <div className="px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-white">
                  Mídias & Modelos do Culto
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Meus Modelos ({customTemplates.length}) + {TEMPLATES_MIDIA_IGREJA.length} Exemplos
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Utilize os modelos de exemplo ou crie e salve os seus próprios modelos personalizados da igreja
              </p>
            </div>
          </div>

          {/* Abas */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('galeria');
                  setUploadedImageUrl(null);
                  setExternalImageUrl('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'galeria' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FolderHeart className="w-3.5 h-3.5" />
                <span>Galeria & Meus Modelos</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'upload' 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{editingTemplateId ? 'Editar Modelo' : 'Criar / Enviar do Computador'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              title="Fechar Janela"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CORPO PRINCIPAL COM DUAS COLUNAS */}
        <div className="flex-1 grid grid-cols-12 min-h-0 overflow-hidden">
          {/* COLUNA ESQUERDA: SELEÇÃO, CRIAÇÃO E SALVAMENTO DE MODELOS (7 COLUNAS) */}
          <div className="col-span-12 lg:col-span-7 border-r border-slate-800 p-5 flex flex-col space-y-4 overflow-y-auto custom-scrollbar">
            
            {/* ABA 1: GALERIA DE BANNERS (MEUS MODELOS SALVOS + MODELOS DE EXEMPLO) */}
            {activeTab === 'galeria' && (
              <div className="space-y-3">
                {/* Barra de Filtro e Botão + Novo Modelo */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setGalleryFilter('todos')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        galleryFilter === 'todos'
                          ? 'bg-slate-800 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Todos ({customTemplates.length + TEMPLATES_MIDIA_IGREJA.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setGalleryFilter('meus')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        galleryFilter === 'meus'
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                          : 'text-amber-400 hover:text-amber-300'
                      }`}
                    >
                      <Star className="w-3 h-3" />
                      <span>Meus Modelos ({customTemplates.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGalleryFilter('exemplos')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        galleryFilter === 'exemplos'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Exemplos ({TEMPLATES_MIDIA_IGREJA.length})
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartNewCustomTemplate}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Novo Modelo Próprio</span>
                  </button>
                </div>

                {displayedTemplates.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-900/60 border border-dashed border-slate-700 text-center space-y-3">
                    <Star className="w-8 h-8 text-amber-400 mx-auto opacity-80" />
                    <div>
                      <h4 className="text-sm font-black text-white">Você ainda não salvou modelos próprios</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                        Clique no botão abaixo para enviar uma arte do seu computador ou personalizar um modelo e salvá-lo na galeria da sua igreja.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleStartNewCustomTemplate}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Criar Meu Primeiro Modelo</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                    {displayedTemplates.map((tpl) => {
                      const isSelected = selectedMedia.id === tpl.id;
                      return (
                        <div
                          key={tpl.id}
                          onClick={() => handleSelectTemplate(tpl)}
                          className={`group relative rounded-2xl overflow-hidden border-2 transition-all cursor-pointer aspect-video flex flex-col justify-end p-3 bg-slate-900 ${
                            isSelected
                              ? 'border-indigo-400 ring-4 ring-indigo-500/20 shadow-xl'
                              : tpl.isCustom
                              ? 'border-amber-500/40 hover:border-amber-400 opacity-95 hover:opacity-100'
                              : 'border-slate-800 hover:border-slate-700 opacity-85 hover:opacity-100'
                          }`}
                        >
                          {/* Imagem de fundo com fallback seguro */}
                          <img 
                            src={tpl.imagemUrl} 
                            alt={tpl.titulo} 
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1200&q=80';
                            }}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/20" />

                          {/* Badges superiores (Meu Modelo vs Exemplo + Ações Editar/Excluir) */}
                          <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20">
                            {tpl.isCustom ? (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow">
                                <Star className="w-2.5 h-2.5 fill-slate-950" /> Meu Modelo
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-slate-900/80 text-slate-300 border border-slate-700 font-bold text-[9px] uppercase tracking-wider">
                                Exemplo
                              </span>
                            )}

                            <div className="flex items-center gap-1">
                              {tpl.isCustom && (
                                <>
                                  <button
                                    type="button"
                                    onClick={(e) => handleEditCustomTemplate(tpl, e)}
                                    className="p-1.5 rounded-lg bg-slate-900/85 hover:bg-amber-500 text-slate-200 hover:text-slate-950 transition-colors shadow cursor-pointer"
                                    title="Editar este modelo"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteCustomTemplate(tpl.id, e)}
                                    className="p-1.5 rounded-lg bg-slate-900/85 hover:bg-rose-600 text-rose-400 hover:text-white transition-colors shadow cursor-pointer"
                                    title="Excluir este modelo salvo"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </>
                              )}
                              {isSelected && (
                                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                                  <Check className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="relative z-10">
                            <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs mb-1 inline-block">
                              {tpl.categoria}
                            </span>
                            <h4 className="text-xs font-black text-white leading-tight truncate">
                              {tpl.titulo}
                            </h4>
                            {tpl.subtitulo && (
                              <p className="text-[10px] text-slate-300 truncate mt-0.5">
                                {tpl.subtitulo}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ABA 2: CRIAR / ENVIAR DO COMPUTADOR E SALVAR COMO MODELO */}
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
                  className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-3xl p-6 text-center bg-slate-900/50 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col items-center justify-center space-y-2.5"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white mb-0.5">
                      Clique aqui para selecionar uma imagem do seu computador
                    </h4>
                    <p className="text-xs text-slate-400 max-w-md">
                      Carregue o cartaz do culto, congresso, Santa Ceia ou aviso (PNG, JPG ou WebP) para projetar e salvar nos seus modelos.
                    </p>
                  </div>
                  <span className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md">
                    Escolher Imagem do Computador
                  </span>
                </div>

                {/* Ou colar link de imagem externa */}
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Ou cole o Link (URL) de uma imagem da internet:
                  </label>
                  <input
                    type="url"
                    value={externalImageUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      setExternalImageUrl(val);
                      if (val.trim()) {
                        setUploadedImageUrl(null);
                        setSelectedMedia({
                          id: editingTemplateId || `custom-url-${Date.now()}`,
                          titulo: customTitle || 'NOVO MODELO PERSONALIZADO',
                          subtitulo: customSubtitle,
                          categoria: customCategory,
                          imagemUrl: val.trim(),
                          isCustom: true
                        });
                      }
                    }}
                    placeholder="https://exemplo.com/banner-culto.jpg"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-400"
                  />
                </div>

                {uploadedImageUrl && (
                  <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5 truncate">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      Imagem pronta: {uploadedFileName}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedImageUrl(null);
                        setUploadedFileName('');
                      }}
                      className="text-[10px] text-rose-400 hover:text-rose-300 font-bold cursor-pointer ml-2"
                    >
                      Trocar Imagem
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* PAINEL DE PERSONALIZAÇÃO DO MODELO + ENQUADRAMENTO + BOTÃO SALVAR NOS MEUS MODELOS */}
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Configurações da Imagem e Salvamento de Modelo:
                </span>
                {editingTemplateId && (
                  <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    Editando Modelo Salvo
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {/* Seletor de Enquadramento no Telão */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-black uppercase text-amber-400 flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5" />
                      Enquadramento no Telão:
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {ajuste === 'contain' ? 'Sem cortes • Proporção original' : ajuste === 'cover' ? 'Preenchimento total • Sem bordas' : 'Ajustado ao espaço total (100% Tela)'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setAjuste('contain')}
                      className={`py-2 px-1 rounded-lg text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                        ajuste === 'contain' 
                          ? 'bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400 font-black' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <span>Ajustar</span>
                      <span className="text-[9px] font-normal opacity-80">(Sem Cortar)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAjuste('cover')}
                      className={`py-2 px-1 rounded-lg text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                        ajuste === 'cover' 
                          ? 'bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400 font-black' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <span>Preencher</span>
                      <span className="text-[9px] font-normal opacity-80">(Sem Bordas)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAjuste('fill')}
                      className={`py-2 px-1 rounded-lg text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                        ajuste === 'fill' 
                          ? 'bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400 font-black' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <span>Ajustar ao Espaço</span>
                      <span className="text-[9px] font-normal opacity-80">(100% da Tela)</span>
                    </button>
                  </div>
                </div>

                {/* Campos do Modelo: Título, Categoria e Subtítulo */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">
                        Título do Modelo / Identificação:
                      </label>
                      <input
                        type="text"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="Ex: SANTA CEIA DO SENHOR / CULTO DE MISSÕES..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">
                        Categoria:
                      </label>
                      <select
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value as MediaCategory)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white outline-none focus:border-indigo-400 cursor-pointer"
                      >
                        {CATEGORIAS_MIDIA.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-slate-400">
                        Subtítulo / Versículo do Modelo (Opcional):
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exibirLegenda}
                          onChange={(e) => setExibirLegenda(e.target.checked)}
                          className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span className="text-[10px] text-slate-300 font-bold">
                          Exibir legenda sobre a imagem no telão
                        </span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={customSubtitle}
                      onChange={(e) => setCustomSubtitle(e.target.value)}
                      placeholder="Ex: “Fazei isto em memória de mim até que Ele venha”"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-400"
                    />
                  </div>

                  {/* Botão para Salvar como Modelo Próprio na Galeria */}
                  <div className="pt-1 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400">
                      {!exibirLegenda
                        ? '✅ Modo Limpo: Somente a imagem será exibida no telão.'
                        : 'ℹ️ Legenda ativa no rodapé do telão.'}
                    </span>

                    <button
                      type="button"
                      disabled={isSavingModel}
                      onClick={handleSaveAsCustomTemplate}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all shrink-0"
                      title="Salvar esta imagem e configuração em 'Meus Modelos' para usar sempre que quiser"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>
                        {editingTemplateId
                          ? 'Atualizar Meu Modelo'
                          : 'Salvar em Meus Modelos'}
                      </span>
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
                {currentPreviewImage ? (
                  <img
                    src={currentPreviewImage}
                    alt={customTitle}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1200&q=80';
                    }}
                    className={`w-full h-full ${
                      ajuste === 'contain' ? 'object-contain' : ajuste === 'cover' ? 'object-cover' : 'object-fill'
                    }`}
                  />
                ) : (
                  <div className="text-slate-600 text-xs text-center p-4">
                    Nenhuma imagem selecionada
                  </div>
                )}

                {/* Overlay opcional de título apenas se o usuário explicitamente ativar */}
                {exibirLegenda && customTitle && (
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
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Mídia Ativa para Transmissão:
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                    selectedMedia.isCustom ? 'bg-amber-500/20 text-amber-300' : 'bg-indigo-500/20 text-indigo-300'
                  }`}>
                    {selectedMedia.isCustom ? '⭐ Meu Modelo' : 'Modelo de Exemplo'}
                  </span>
                </div>
                <div className="text-sm font-black text-white truncate">
                  {customTitle || 'Sem título'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Enquadramento: {ajuste === 'contain' ? 'Ajustar (sem cortes)' : ajuste === 'cover' ? 'Preencher (sem bordas)' : 'Ajustar ao Espaço (100% da tela)'}
                </div>
              </div>
            </div>

            {/* AÇÕES DE DISPARO */}
            <div className="space-y-2 pt-4 border-t border-slate-800 mt-4">
              <button
                type="button"
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
                  type="button"
                  onClick={handleAttachToLiturgy}
                  className="flex-1 py-2.5 px-3 bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Vincular ao Roteiro do Culto
                </button>

                <button
                  type="button"
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

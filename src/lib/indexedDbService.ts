/**
 * Serviço de pré-processamento de imagens, cache no IndexedDB e armazenamento offline
 * para o Aplicativo da Igreja, com suporte completo a Módulos e Apostilas de Teologia
 * (Texto completo, Lições, Quizzes, Anotações e Imagens/Diagramas associados 100% offline).
 */

import { MODULES_TEOLOGIA, ModuleData, LessonPage } from '../data/ModuleTeologiaData';

export const DB_NAME = 'ChurchAppMediaCache';
export const DB_VERSION = 2; // Atualizado para versão 2 com suporte a theology_modules
export const STORE_MEDIA = 'media';
export const STORE_THEOLOGY = 'theology_modules';

export interface OfflineTheologyImage {
  id: string;
  title: string;
  cacheKey: string;
  dataBase64?: string;
  caption?: string;
  type?: 'banner' | 'diagram' | 'chart' | 'illustration' | 'custom';
}

export interface OfflineTheologyPage {
  pageTitle: string;
  subtitle?: string;
  textHtml: string;
  textRaw: string;
  images?: OfflineTheologyImage[];
}

export interface OfflineTheologyLesson {
  lessonIndex: number;
  title: string;
  readingTime: string;
  pages: OfflineTheologyPage[];
}

export interface DownloadedTheologyModule {
  id: string;
  title: string;
  description: string;
  color: string;
  iconName?: string;
  downloaded_at: string;
  sizeBytes: number;
  formattedSize: string;
  lessons: OfflineTheologyLesson[];
  quiz: any[];
  images: OfflineTheologyImage[];
  mediaKeys: string[];
  version: string;
  status: 'ready' | 'downloading' | 'error';
  lastAccessed?: string;
}

export interface TheologyDownloadProgress {
  moduleId: string;
  stage: 'starting' | 'extracting_text' | 'downloading_media' | 'saving_storage' | 'completed' | 'error';
  currentStep: number;
  totalSteps: number;
  percentage: number;
  message: string;
  error?: string;
}

export interface TheologyStorageStats {
  modulesCount: number;
  mediaCount: number;
  totalSizeBytes: number;
  formattedSize: string;
  downloadedModuleIds: string[];
}

export type TheologyOfflineEventType = 'downloaded' | 'removed' | 'cleared' | 'progress';
export interface TheologyOfflineEvent {
  action: TheologyOfflineEventType;
  moduleId?: string;
  progress?: TheologyDownloadProgress;
  timestamp: string;
}

const offlineEventListeners: Array<(event: TheologyOfflineEvent) => void> = [];

export function subscribeTheologyOfflineEvents(callback: (event: TheologyOfflineEvent) => void): () => void {
  offlineEventListeners.push(callback);
  return () => {
    const idx = offlineEventListeners.indexOf(callback);
    if (idx !== -1) offlineEventListeners.splice(idx, 1);
  };
}

function dispatchOfflineEvent(event: TheologyOfflineEvent) {
  offlineEventListeners.forEach(listener => {
    try {
      listener(event);
    } catch (e) {
      console.error("Erro ao emitir evento de offline teologia:", e);
    }
  });
}

/**
 * Inicializa a ligação ao banco de dados IndexedDB
 */
export function initDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("Erro ao inicializar IndexedDB:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Store 1: Mídia e imagens em cache
      if (!db.objectStoreNames.contains(STORE_MEDIA)) {
        db.createObjectStore(STORE_MEDIA);
      }

      // Store 2: Módulos de teologia para acesso 100% offline
      if (!db.objectStoreNames.contains(STORE_THEOLOGY)) {
        const theologyStore = db.createObjectStore(STORE_THEOLOGY, { keyPath: 'id' });
        theologyStore.createIndex('downloaded_at', 'downloaded_at', { unique: false });
        theologyStore.createIndex('title', 'title', { unique: false });
      }
    };
  });
}

/**
 * Armazena uma imagem (em Base64 ou Data URI) no IndexedDB sob uma chave
 */
export async function storeMedia(key: string, base64Data: string): Promise<void> {
  if (!key || !base64Data) return;
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_MEDIA, 'readwrite');
      const store = transaction.objectStore(STORE_MEDIA);
      const request = store.put({ data: base64Data, updated_at: new Date().toISOString() }, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`Erro ao gravar no IndexedDB para chave ${key}:`, error);
  }
}

/**
 * Recupera uma imagem em Base64 do IndexedDB
 */
export async function getMedia(key: string): Promise<string | null> {
  if (!key) return null;
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_MEDIA, 'readonly');
      const store = transaction.objectStore(STORE_MEDIA);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result ? request.result.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`Erro ao ler do IndexedDB para chave ${key}:`, error);
    return null;
  }
}

/**
 * Remove uma imagem do cache IndexedDB
 */
export async function clearMedia(key: string): Promise<void> {
  if (!key) return;
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_MEDIA, 'readwrite');
      const store = transaction.objectStore(STORE_MEDIA);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`Erro ao apagar chave ${key} do IndexedDB:`, error);
  }
}

/**
 * Obtém todas as chaves gravadas no cache do IndexedDB
 */
export async function getAllKeys(): Promise<string[]> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_MEDIA, 'readonly');
      const store = transaction.objectStore(STORE_MEDIA);
      const request = store.getAllKeys();

      request.onsuccess = () => {
        resolve(request.result as string[]);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Erro ao obter chaves do IndexedDB:", error);
    return [];
  }
}

/**
 * Pré-processa uma imagem no navegador utilizando um componente Canvas HTML5.
 */
export function preprocessImage(
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const maxWidth = options.maxWidth || 300;
    const maxHeight = options.maxHeight || 300;
    const quality = options.quality !== undefined ? options.quality : 0.7;

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Falha ao ler o ficheiro físico."));
    reader.onload = (event) => {
      const img = typeof window !== 'undefined' && window.Image ? new window.Image() : new Image();
      img.onerror = () => reject(new Error("Falha ao criar o elemento de imagem."));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Impossível criar contexto 2D para renderização."));
          return;
        }

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ============================================================================
// CONVERSORES & SERIALIZADORES PARA TEXTO E HTML OFFLINE
// ============================================================================

/**
 * Serializa de forma recursiva um ReactNode em marcação HTML válida,
 * preservando formatações, listas, blocos teológicos e classes Tailwind.
 */
export function serializeReactNodeToHtml(node: any): string {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return '';
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  if (Array.isArray(node)) {
    return node.map(serializeReactNodeToHtml).join('');
  }
  if (typeof node === 'object' && node.props) {
    const { children, className, style, ...restProps } = node.props;
    let tag = 'div';
    if (typeof node.type === 'string') {
      tag = node.type;
    } else if (node.type && typeof node.type.name === 'string') {
      tag = 'div';
    }

    const classAttr = className ? ` class="${String(className).replace(/"/g, '&quot;')}"` : '';
    const innerHtml = children ? serializeReactNodeToHtml(children) : '';

    if (['img', 'br', 'hr', 'input'].includes(tag)) {
      return `<${tag}${classAttr} />`;
    }
    return `<${tag}${classAttr}>${innerHtml}</${tag}>`;
  }
  return '';
}

/**
 * Extrai texto puro de qualquer ReactNode ou objeto para leitura e indexação.
 */
export function serializeReactNodeToText(node: any): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(serializeReactNodeToText).join(' ');
  if (typeof node === 'object' && node.props) {
    return serializeReactNodeToText(node.props.children);
  }
  return '';
}

/**
 * Formata bytes em representações amigáveis (ex: "1.4 MB", "350 KB").
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// ============================================================================
// GERADOR DE ILUSTRAÇÕES E DIAGRAMAS TEOLÓGICOS EM VETOR (SVG) OFFLINE
// ============================================================================

function encodeSvgToDataUri(svgString: string): string {
  if (typeof window !== 'undefined' && window.btoa) {
    try {
      return `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svgString)))}`;
    } catch {
      return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
    }
  }
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

/**
 * Fornece infográficos, diagramas doutrinários e banners vetoriais de alta fidelidade
 * alinhados estritamente com a Declaração de Fé da CGADB / CPAD.
 */
export function getTheologicalModuleIllustrations(moduleId: string, moduleTitle?: string): OfflineTheologyImage[] {
  const images: OfflineTheologyImage[] = [];

  switch (moduleId) {
    case 'teontologia': {
      // 1. Banner
      const bannerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 450" width="1000" height="450">
        <defs>
          <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1e1b4b"/>
            <stop offset="50%" stop-color="#312e81"/>
            <stop offset="100%" stop-color="#4338ca"/>
          </linearGradient>
          <radialGradient id="gGold" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fbbf24"/>
            <stop offset="100%" stop-color="#d97706"/>
          </radialGradient>
        </defs>
        <rect width="1000" height="450" fill="url(#g1)" rx="24"/>
        <circle cx="500" cy="200" r="140" fill="none" stroke="url(#gGold)" stroke-width="4" opacity="0.3"/>
        <circle cx="430" cy="180" r="110" fill="none" stroke="#f59e0b" stroke-width="3" opacity="0.6"/>
        <circle cx="570" cy="180" r="110" fill="none" stroke="#f59e0b" stroke-width="3" opacity="0.6"/>
        <circle cx="500" cy="270" r="110" fill="none" stroke="#f59e0b" stroke-width="3" opacity="0.6"/>
        <text x="500" y="380" fill="#ffffff" font-family="sans-serif" font-size="28" font-weight="900" text-anchor="middle" letter-spacing="2">TEONTOLOGIA E A SANTÍSSIMA TRINDADE</text>
        <text x="500" y="415" fill="#fcd34d" font-family="sans-serif" font-size="16" font-weight="700" text-anchor="middle" letter-spacing="3">DECLARAÇÃO DE FÉ CGADB (CAP. 2 E 3)</text>
      </svg>`;

      // 2. Diagrama Scutum Fidei (Escudo da Trindade)
      const scutumSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
        <rect width="800" height="600" fill="#0f172a" rx="20"/>
        <text x="400" y="50" fill="#f8fafc" font-family="sans-serif" font-size="24" font-weight="800" text-anchor="middle">O ESCUDO DA SANTÍSSIMA TRINDADE (SCUTUM FIDEI)</text>
        <text x="400" y="80" fill="#94a3b8" font-family="sans-serif" font-size="14" text-anchor="middle">Ortodoxia Bíblica Pentecostal • Um só Deus em Três Pessoas Consubstanciais</text>
        
        <!-- Conexões centrais (É DEUS) -->
        <line x1="200" y1="180" x2="400" y2="350" stroke="#f59e0b" stroke-width="6"/>
        <line x1="600" y1="180" x2="400" y2="350" stroke="#f59e0b" stroke-width="6"/>
        <line x1="400" y1="520" x2="400" y2="350" stroke="#f59e0b" stroke-width="6"/>
        
        <!-- Conexões perimetrais (NÃO É) -->
        <line x1="200" y1="180" x2="600" y2="180" stroke="#ef4444" stroke-width="4" stroke-dasharray="8,8"/>
        <line x1="600" y1="180" x2="400" y2="520" stroke="#ef4444" stroke-width="4" stroke-dasharray="8,8"/>
        <line x1="400" y1="520" x2="200" y2="180" stroke="#ef4444" stroke-width="4" stroke-dasharray="8,8"/>

        <!-- Rótulos nas linhas centrais -->
        <rect x="270" y="240" width="60" height="30" fill="#0f172a" rx="6" stroke="#f59e0b"/>
        <text x="300" y="260" fill="#f59e0b" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">É</text>
        <rect x="470" y="240" width="60" height="30" fill="#0f172a" rx="6" stroke="#f59e0b"/>
        <text x="500" y="260" fill="#f59e0b" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">É</text>
        <rect x="370" y="420" width="60" height="30" fill="#0f172a" rx="6" stroke="#f59e0b"/>
        <text x="400" y="440" fill="#f59e0b" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">É</text>

        <!-- Rótulos nas linhas perimetrais -->
        <rect x="360" y="165" width="80" height="30" fill="#0f172a" rx="6" stroke="#ef4444"/>
        <text x="400" y="185" fill="#ef4444" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">NÃO É</text>
        <rect x="480" y="340" width="80" height="30" fill="#0f172a" rx="6" stroke="#ef4444"/>
        <text x="520" y="360" fill="#ef4444" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">NÃO É</text>
        <rect x="240" y="340" width="80" height="30" fill="#0f172a" rx="6" stroke="#ef4444"/>
        <text x="280" y="360" fill="#ef4444" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">NÃO É</text>

        <!-- Nós das Três Pessoas -->
        <circle cx="200" cy="180" r="70" fill="#1e293b" stroke="#38bdf8" stroke-width="4"/>
        <text x="200" y="175" fill="#38bdf8" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle">O PAI</text>
        <text x="200" y="195" fill="#94a3b8" font-family="sans-serif" font-size="11" text-anchor="middle">Fonte Eterna</text>

        <circle cx="600" cy="180" r="70" fill="#1e293b" stroke="#38bdf8" stroke-width="4"/>
        <text x="600" y="175" fill="#38bdf8" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle">O FILHO</text>
        <text x="600" y="195" fill="#94a3b8" font-family="sans-serif" font-size="11" text-anchor="middle">Gerado Eterno</text>

        <circle cx="400" cy="520" r="70" fill="#1e293b" stroke="#38bdf8" stroke-width="4"/>
        <text x="400" y="515" fill="#38bdf8" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle">O ESPÍRITO</text>
        <text x="400" y="535" fill="#94a3b8" font-family="sans-serif" font-size="11" text-anchor="middle">Procedente</text>

        <!-- Nó Central: DEUS -->
        <circle cx="400" cy="350" r="85" fill="#ca8a04" stroke="#fef08a" stroke-width="6"/>
        <text x="400" y="345" fill="#ffffff" font-family="sans-serif" font-size="28" font-weight="900" text-anchor="middle">DEUS</text>
        <text x="400" y="370" fill="#fef08a" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">UMA ESSÊNCIA</text>
      </svg>`;

      // 3. Diagrama Atributos Divinos
      const atributosSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
        <rect width="800" height="480" fill="#0f172a" rx="20"/>
        <text x="400" y="45" fill="#f8fafc" font-family="sans-serif" font-size="22" font-weight="800" text-anchor="middle">OS ATRIBUTOS DE DEUS NA TEOLOGIA SISTEMÁTICA</text>
        
        <!-- Bloco Incomunicáveis -->
        <rect x="40" y="80" width="340" height="360" rx="16" fill="#1e1b4b" stroke="#6366f1" stroke-width="2"/>
        <text x="210" y="115" fill="#a5b4fc" font-family="sans-serif" font-size="16" font-weight="800" text-anchor="middle">ATRIBUTOS INCOMUNICÁVEIS</text>
        <text x="210" y="135" fill="#c7d2fe" font-family="sans-serif" font-size="11" text-anchor="middle">(Pertencem exclusivamente ao Criador)</text>
        
        <g fill="#ffffff" font-family="sans-serif" font-size="13" transform="translate(60, 165)">
          <text y="0">✦ <tspan font-weight="bold">Asseidade:</tspan> Autoexistente, independente.</text>
          <text y="40">✦ <tspan font-weight="bold">Eternidade:</tspan> Sem princípio nem fim.</text>
          <text y="80">✦ <tspan font-weight="bold">Imutabilidade:</tspan> Não muda Seu caráter.</text>
          <text y="120">✦ <tspan font-weight="bold">Onipresença:</tspan> Imenso em todo o espaço.</text>
          <text y="160">✦ <tspan font-weight="bold">Onisciência:</tspan> Conhecimento total e pleno.</text>
          <text y="200">✦ <tspan font-weight="bold">Onipotência:</tspan> Poder absoluto sobre tudo.</text>
        </g>

        <!-- Bloco Comunicáveis -->
        <rect x="420" y="80" width="340" height="360" rx="16" fill="#064e3b" stroke="#10b981" stroke-width="2"/>
        <text x="590" y="115" fill="#6ee7b7" font-family="sans-serif" font-size="16" font-weight="800" text-anchor="middle">ATRIBUTOS COMUNICÁVEIS</text>
        <text x="590" y="135" fill="#a7f3d0" font-family="sans-serif" font-size="11" text-anchor="middle">(Refletidos analogicamente nos redimidos)</text>
        
        <g fill="#ffffff" font-family="sans-serif" font-size="13" transform="translate(440, 165)">
          <text y="0">✦ <tspan font-weight="bold">Santidade:</tspan> Pureza e retidão absoluta.</text>
          <text y="40">✦ <tspan font-weight="bold">Justiça:</tspan> Reto juízo e fidelidade à lei.</text>
          <text y="80">✦ <tspan font-weight="bold">Amor:</tspan> Ágape sacrificial e benevolente.</text>
          <text y="120">✦ <tspan font-weight="bold">Bondade &amp; Graça:</tspan> Favor imerecido.</text>
          <text y="160">✦ <tspan font-weight="bold">Verdade:</tspan> Integridade e fidelidade eterna.</text>
          <text y="200">✦ <tspan font-weight="bold">Misericórdia:</tspan> Compaixão ao necessitado.</text>
        </g>
      </svg>`;

      images.push(
        { id: 'banner_teontologia', title: 'Capa Teontologia e Trindade', cacheKey: 'theology_teontologia_banner', dataBase64: encodeSvgToDataUri(bannerSvg), type: 'banner' },
        { id: 'diagram_scutum_fidei', title: 'Escudo da Fé Trinitário', cacheKey: 'theology_teontologia_scutum', dataBase64: encodeSvgToDataUri(scutumSvg), caption: 'Relações intra-trinitárias conforme a Ortodoxia Niceno-Constantinopolitana e CGADB', type: 'diagram' },
        { id: 'diagram_atributos', title: 'Classificação dos Atributos Divinos', cacheKey: 'theology_teontologia_atributos', dataBase64: encodeSvgToDataUri(atributosSvg), caption: 'Atributos Incomunicáveis e Comunicáveis de Deus', type: 'chart' }
      );
      break;
    }

    case 'bibliologia': {
      const bannerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 450" width="1000" height="450">
        <defs>
          <linearGradient id="gBib" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0c4a6e"/>
            <stop offset="100%" stop-color="#0284c7"/>
          </linearGradient>
        </defs>
        <rect width="1000" height="450" fill="url(#gBib)" rx="24"/>
        <path d="M 400 150 Q 500 190 600 150 L 600 300 Q 500 340 400 300 Z" fill="#ffffff" opacity="0.15"/>
        <text x="500" y="380" fill="#ffffff" font-family="sans-serif" font-size="28" font-weight="900" text-anchor="middle" letter-spacing="2">BIBLIOLOGIA: A PALAVRA INERRANTE DE DEUS</text>
        <text x="500" y="415" fill="#bae6fd" font-family="sans-serif" font-size="16" font-weight="700" text-anchor="middle" letter-spacing="3">INSPIRAÇÃO VERBAL E PLENÁRIA • CGADB CAP. 1</text>
      </svg>`;

      const canonSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
        <rect width="800" height="500" fill="#0f172a" rx="20"/>
        <text x="400" y="45" fill="#f8fafc" font-family="sans-serif" font-size="22" font-weight="800" text-anchor="middle">ESTRUTURAÇÃO DO CÂNON BÍBLICO (66 LIVROS)</text>
        
        <!-- Antigo Testamento -->
        <rect x="40" y="75" width="340" height="385" rx="14" fill="#0369a1" fill-opacity="0.2" stroke="#38bdf8" stroke-width="2"/>
        <text x="210" y="110" fill="#38bdf8" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle">ANTIGO TESTAMENTO (39 Livros)</text>
        <g fill="#e0f2fe" font-family="sans-serif" font-size="13" transform="translate(60, 145)">
          <text y="0">📖 <tspan font-weight="bold">Pentateuco (5):</tspan> Gn a Dt (A Lei / Torá)</text>
          <text y="45">📜 <tspan font-weight="bold">Históricos (12):</tspan> Js a Et (Israel na terra)</text>
          <text y="90">🎼 <tspan font-weight="bold">Poéticos e Sapienciais (5):</tspan> Jó a Ct</text>
          <text y="135">⚡ <tspan font-weight="bold">Profetas Maiores (5):</tspan> Is a Dn</text>
          <text y="180">🎺 <tspan font-weight="bold">Profetas Menores (12):</tspan> Os a Ml</text>
          <text y="240" fill="#93c5fd" font-size="11" font-style="italic">Línguas Originais: Hebraico e trechos em Aramaico</text>
        </g>

        <!-- Novo Testamento -->
        <rect x="420" y="75" width="340" height="385" rx="14" fill="#7c2d12" fill-opacity="0.2" stroke="#f97316" stroke-width="2"/>
        <text x="590" y="110" fill="#fb923c" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle">NOVO TESTAMENTO (27 Livros)</text>
        <g fill="#ffedd5" font-family="sans-serif" font-size="13" transform="translate(440, 145)">
          <text y="0">✝️ <tspan font-weight="bold">Evangelhos (4):</tspan> Mt, Mc, Lc e Jo</text>
          <text y="45">🔥 <tspan font-weight="bold">Histórico (1):</tspan> Atos dos Apóstolos</text>
          <text y="90">✉️ <tspan font-weight="bold">Epístolas Paulinas (13):</tspan> Rm a Fm</text>
          <text y="135">📜 <tspan font-weight="bold">Epístolas Gerais (8):</tspan> Hb a Jd</text>
          <text y="180">👑 <tspan font-weight="bold">Profético (1):</tspan> Apocalipse (Revelação)</text>
          <text y="240" fill="#fdba74" font-size="11" font-style="italic">Língua Original: Grego Koiné Alexandrino</text>
        </g>
      </svg>`;

      images.push(
        { id: 'banner_bibliologia', title: 'Capa Bibliologia Sagrada', cacheKey: 'theology_bibliologia_banner', dataBase64: encodeSvgToDataUri(bannerSvg), type: 'banner' },
        { id: 'diagram_canon', title: 'O Cânon das Sagradas Escrituras', cacheKey: 'theology_bibliologia_canon', dataBase64: encodeSvgToDataUri(canonSvg), caption: 'Divisão canônica oficial protestante dos 66 livros da Bíblia Sagrada', type: 'diagram' }
      );
      break;
    }

    case 'cristologia': {
      const bannerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 450" width="1000" height="450">
        <defs>
          <linearGradient id="gCris" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4c0519"/>
            <stop offset="100%" stop-color="#9f1239"/>
          </linearGradient>
        </defs>
        <rect width="1000" height="450" fill="url(#gCris)" rx="24"/>
        <text x="500" y="380" fill="#ffffff" font-family="sans-serif" font-size="28" font-weight="900" text-anchor="middle" letter-spacing="2">CRISTOLOGIA: O VERBO ENCARNADO</text>
        <text x="500" y="415" fill="#fecdd3" font-family="sans-serif" font-size="16" font-weight="700" text-anchor="middle" letter-spacing="3">UNIÃO HIPOSTÁTICA E OBRA VICÁRIA • CGADB CAP. 4 E 5</text>
      </svg>`;

      const uniaoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
        <rect width="800" height="500" fill="#0f172a" rx="20"/>
        <text x="400" y="45" fill="#f8fafc" font-family="sans-serif" font-size="22" font-weight="800" text-anchor="middle">A UNIÃO HIPOSTÁTICA (CONCÍLIO DE CALCEDÔNIA - 451 d.C.)</text>
        
        <circle cx="320" cy="260" r="160" fill="#1e3a8a" fill-opacity="0.4" stroke="#60a5fa" stroke-width="4"/>
        <text x="240" y="180" fill="#93c5fd" font-family="sans-serif" font-size="18" font-weight="bold">NATUREZA DIVINA</text>
        <text x="240" y="210" fill="#bfdbfe" font-family="sans-serif" font-size="13">✦ Eterno e Coigual ao Pai</text>
        <text x="240" y="240" fill="#bfdbfe" font-family="sans-serif" font-size="13">✦ Onipotente e Onisciente</text>
        <text x="240" y="270" fill="#bfdbfe" font-family="sans-serif" font-size="13">✦ Criador e Sustentador</text>
        <text x="240" y="300" fill="#bfdbfe" font-family="sans-serif" font-size="13">✦ Digno de Adoração</text>

        <circle cx="480" cy="260" r="160" fill="#831843" fill-opacity="0.4" stroke="#f43f5e" stroke-width="4"/>
        <text x="560" y="180" fill="#fda4af" font-family="sans-serif" font-size="18" font-weight="bold">NATUREZA HUMANA</text>
        <text x="560" y="210" fill="#fecdd3" font-family="sans-serif" font-size="13">✦ Nascido de Maria (Virginal)</text>
        <text x="560" y="240" fill="#fecdd3" font-family="sans-serif" font-size="13">✦ Sentiu sede, fome e sono</text>
        <text x="560" y="270" fill="#fecdd3" font-family="sans-serif" font-size="13">✦ Sofreu e morreu na cruz</text>
        <text x="560" y="300" fill="#fecdd3" font-family="sans-serif" font-size="13">✦ Corpo ressurreto físico</text>

        <!-- Centro da União -->
        <rect x="340" y="210" width="120" height="100" rx="10" fill="#0f172a" stroke="#fbbf24" stroke-width="3"/>
        <text x="400" y="240" fill="#fbbf24" font-family="sans-serif" font-size="14" font-weight="900" text-anchor="middle">UMA SÓ</text>
        <text x="400" y="265" fill="#ffffff" font-family="sans-serif" font-size="16" font-weight="900" text-anchor="middle">PESSOA</text>
        <text x="400" y="290" fill="#fbbf24" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">JESUS CRISTO</text>
        
        <text x="400" y="460" fill="#94a3b8" font-family="sans-serif" font-size="12" text-anchor="middle">"Sem confusão, sem mudança, sem divisão, sem separação."</text>
      </svg>`;

      images.push(
        { id: 'banner_cristologia', title: 'Capa Cristologia Dogmática', cacheKey: 'theology_cristologia_banner', dataBase64: encodeSvgToDataUri(bannerSvg), type: 'banner' },
        { id: 'diagram_uniao_hipostatica', title: 'União Hipostática em Cristo', cacheKey: 'theology_cristologia_uniao', dataBase64: encodeSvgToDataUri(uniaoSvg), caption: 'Duas naturezas perfeitas unidas em uma só Pessoa divina-humana', type: 'diagram' }
      );
      break;
    }

    case 'pneumatologia': {
      const bannerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 450" width="1000" height="450">
        <defs>
          <linearGradient id="gPneu" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#7c2d12"/>
            <stop offset="100%" stop-color="#ea580c"/>
          </linearGradient>
        </defs>
        <rect width="1000" height="450" fill="url(#gPneu)" rx="24"/>
        <text x="500" y="380" fill="#ffffff" font-family="sans-serif" font-size="28" font-weight="900" text-anchor="middle" letter-spacing="2">PNEUMATOLOGIA: O ESPÍRITO SANTO E OS DONS</text>
        <text x="500" y="415" fill="#fed7aa" font-family="sans-serif" font-size="16" font-weight="700" text-anchor="middle" letter-spacing="3">BATISMO NO ESPÍRITO SANTO E DONS ESPIRITUAIS • CGADB CAP. 6, 19 E 20</text>
      </svg>`;

      const donsSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
        <rect width="800" height="500" fill="#0f172a" rx="20"/>
        <text x="400" y="45" fill="#f8fafc" font-family="sans-serif" font-size="22" font-weight="800" text-anchor="middle">A CLASSIFICAÇÃO DOS 9 DONS ESPIRITUAIS (1 CORÍNTIOS 12)</text>
        
        <!-- Grupo 1 -->
        <rect x="30" y="80" width="230" height="380" rx="14" fill="#1e3a8a" fill-opacity="0.3" stroke="#38bdf8" stroke-width="2"/>
        <text x="145" y="115" fill="#38bdf8" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">DONS DE REVELAÇÃO</text>
        <text x="145" y="135" fill="#93c5fd" font-family="sans-serif" font-size="11" text-anchor="middle">(Para Saber)</text>
        <g fill="#ffffff" font-family="sans-serif" font-size="13" transform="translate(45, 170)">
          <text y="0" font-weight="bold">1. Palavra da Sabedoria</text>
          <text y="20" fill="#94a3b8" font-size="11">Propósito divino revelado</text>
          <text y="70" font-weight="bold">2. Palavra da Ciência</text>
          <text y="90" fill="#94a3b8" font-size="11">Fatos divinos conhecidos</text>
          <text y="140" font-weight="bold">3. Discernimento de Espíritos</text>
          <text y="160" fill="#94a3b8" font-size="11">Diferenciação das fontes</text>
        </g>

        <!-- Grupo 2 -->
        <rect x="285" y="80" width="230" height="380" rx="14" fill="#701a75" fill-opacity="0.3" stroke="#c084fc" stroke-width="2"/>
        <text x="400" y="115" fill="#c084fc" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">DONS DE PODER</text>
        <text x="400" y="135" fill="#e9d5ff" font-family="sans-serif" font-size="11" text-anchor="middle">(Para Agir)</text>
        <g fill="#ffffff" font-family="sans-serif" font-size="13" transform="translate(300, 170)">
          <text y="0" font-weight="bold">4. Dom da Fé</text>
          <text y="20" fill="#94a3b8" font-size="11">Fé sobrenatural extraordinária</text>
          <text y="70" font-weight="bold">5. Dons de Curar</text>
          <text y="90" fill="#94a3b8" font-size="11">Cura física e emocional</text>
          <text y="140" font-weight="bold">6. Operação de Maravilhas</text>
          <text y="160" fill="#94a3b8" font-size="11">Milagres na natureza</text>
        </g>

        <!-- Grupo 3 -->
        <rect x="540" y="80" width="230" height="380" rx="14" fill="#831843" fill-opacity="0.3" stroke="#f43f5e" stroke-width="2"/>
        <text x="655" y="115" fill="#f43f5e" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">DONS DE EXPRESSÃO</text>
        <text x="655" y="135" fill="#fecdd3" font-family="sans-serif" font-size="11" text-anchor="middle">(Para Falar)</text>
        <g fill="#ffffff" font-family="sans-serif" font-size="13" transform="translate(555, 170)">
          <text y="0" font-weight="bold">7. Profecia</text>
          <text y="20" fill="#94a3b8" font-size="11">Edificação, exortação e consolo</text>
          <text y="70" font-weight="bold">8. Variedade de Línguas</text>
          <text y="90" fill="#94a3b8" font-size="11">Mensagem pública à congregação</text>
          <text y="140" font-weight="bold">9. Interpretação de Línguas</text>
          <text y="160" fill="#94a3b8" font-size="11">Revela o teor da mensagem</text>
        </g>
      </svg>`;

      images.push(
        { id: 'banner_pneumatologia', title: 'Capa Pneumatologia Pentecostal', cacheKey: 'theology_pneumatologia_banner', dataBase64: encodeSvgToDataUri(bannerSvg), type: 'banner' },
        { id: 'diagram_dons', title: 'Classificação dos Nove Dons Espirituais', cacheKey: 'theology_pneumatologia_dons', dataBase64: encodeSvgToDataUri(donsSvg), caption: 'Tríade dos dons de Revelação, Poder e Inspiração Vocal', type: 'chart' }
      );
      break;
    }

    case 'escatologia': {
      const bannerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 450" width="1000" height="450">
        <defs>
          <linearGradient id="gEsc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#3b0764"/>
            <stop offset="100%" stop-color="#6b21a8"/>
          </linearGradient>
        </defs>
        <rect width="1000" height="450" fill="url(#gEsc)" rx="24"/>
        <text x="500" y="380" fill="#ffffff" font-family="sans-serif" font-size="28" font-weight="900" text-anchor="middle" letter-spacing="2">ESCATOLOGIA: AS ÚLTIMAS COISAS</text>
        <text x="500" y="415" fill="#e9d5ff" font-family="sans-serif" font-size="16" font-weight="700" text-anchor="middle" letter-spacing="3">ARREBATAMENTO PRÉ-TRIBULACIONISTA E MILÊNIO • CGADB CAP. 22 E 23</text>
      </svg>`;

      const timelineSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 480" width="900" height="480">
        <rect width="900" height="480" fill="#0f172a" rx="20"/>
        <text x="450" y="40" fill="#f8fafc" font-family="sans-serif" font-size="20" font-weight="800" text-anchor="middle">LINHA DO TEMPO ESCATOLÓGICA PRÉ-TRIBULACIONISTA (CGADB)</text>
        
        <!-- Linha do Tempo Central -->
        <line x1="40" y1="260" x2="860" y2="260" stroke="#475569" stroke-width="4"/>

        <!-- Evento 1: Igreja -->
        <rect x="40" y="210" width="140" height="100" rx="10" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
        <text x="110" y="245" fill="#38bdf8" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">ERA DA IGREJA</text>
        <text x="110" y="270" fill="#94a3b8" font-family="sans-serif" font-size="11" text-anchor="middle">Dispensação da Graça</text>

        <!-- Seta Arrebatamento -->
        <path d="M 190 260 L 220 120" stroke="#f59e0b" stroke-width="3" stroke-dasharray="4,4"/>
        <circle cx="220" cy="115" r="8" fill="#f59e0b"/>
        <text x="220" y="90" fill="#fcd34d" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">ARREBATAMENTO</text>
        <text x="220" y="105" fill="#fde68a" font-family="sans-serif" font-size="9" text-anchor="middle">(1 Ts 4:16-17)</text>

        <!-- Evento 2: Tribulação na Terra vs Céu -->
        <rect x="250" y="280" width="160" height="85" rx="8" fill="#450a0a" stroke="#ef4444" stroke-width="2"/>
        <text x="330" y="310" fill="#f87171" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">7 ANOS DE TRIBULAÇÃO</text>
        <text x="330" y="330" fill="#fca5a5" font-family="sans-serif" font-size="10" text-anchor="middle">Na Terra (Anticristo e Juízos)</text>

        <rect x="250" y="130" width="160" height="85" rx="8" fill="#172554" stroke="#60a5fa" stroke-width="2"/>
        <text x="330" y="160" fill="#93c5fd" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">TRIBUNAL DE CRISTO</text>
        <text x="330" y="180" fill="#bfdbfe" font-family="sans-serif" font-size="10" text-anchor="middle">No Céu &amp; Bodas do Cordeiro</text>

        <!-- Volta Gloriosa -->
        <path d="M 425 150 L 445 260" stroke="#fbbf24" stroke-width="4"/>
        <circle cx="445" cy="260" r="8" fill="#fbbf24"/>
        <text x="445" y="395" fill="#fcd34d" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">VOLTA EM GLÓRIA</text>
        <text x="445" y="415" fill="#fde68a" font-family="sans-serif" font-size="9" text-anchor="middle">(Visível - Zc 14:4)</text>

        <!-- Evento 3: Milênio -->
        <rect x="470" y="210" width="150" height="100" rx="10" fill="#064e3b" stroke="#34d399" stroke-width="2"/>
        <text x="545" y="245" fill="#34d399" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">O MILÊNIO</text>
        <text x="545" y="270" fill="#a7f3d0" font-family="sans-serif" font-size="11" text-anchor="middle">Reino Literal de 1000 Anos</text>

        <!-- Evento 4: Juízo Final -->
        <rect x="640" y="210" width="110" height="100" rx="10" fill="#312e81" stroke="#818cf8" stroke-width="2"/>
        <text x="695" y="245" fill="#818cf8" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">JUÍZO FINAL</text>
        <text x="695" y="270" fill="#c7d2fe" font-family="sans-serif" font-size="10" text-anchor="middle">Trono Branco</text>

        <!-- Evento 5: Estado Eterno -->
        <rect x="770" y="195" width="105" height="130" rx="10" fill="#78350f" stroke="#fbbf24" stroke-width="2"/>
        <text x="822" y="235" fill="#fef08a" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">NOVO CÉU &amp;</text>
        <text x="822" y="255" fill="#fef08a" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">NOVA TERRA</text>
        <text x="822" y="280" fill="#fde68a" font-family="sans-serif" font-size="10" text-anchor="middle">Eternidade</text>
      </svg>`;

      images.push(
        { id: 'banner_escatologia', title: 'Capa Escatologia Bíblica', cacheKey: 'theology_escatologia_banner', dataBase64: encodeSvgToDataUri(bannerSvg), type: 'banner' },
        { id: 'diagram_timeline', title: 'Linha do Tempo Escatológica Pré-Tribulacionista', cacheKey: 'theology_escatologia_timeline', dataBase64: encodeSvgToDataUri(timelineSvg), caption: 'Quadro dispensacionalista das profecias bíblicas e segunda vinda', type: 'chart' }
      );
      break;
    }

    default: {
      // Banner genérico e elegante para outros módulos ou personalizados
      const safeTitle = moduleTitle || moduleId.toUpperCase();
      const genericBannerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 450" width="1000" height="450">
        <defs>
          <linearGradient id="gGen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f172a"/>
            <stop offset="50%" stop-color="#1e293b"/>
            <stop offset="100%" stop-color="#334155"/>
          </linearGradient>
        </defs>
        <rect width="1000" height="450" fill="url(#gGen)" rx="24"/>
        <circle cx="500" cy="200" r="120" fill="none" stroke="#6366f1" stroke-width="3" opacity="0.4"/>
        <text x="500" y="380" fill="#ffffff" font-family="sans-serif" font-size="28" font-weight="900" text-anchor="middle" letter-spacing="2">${safeTitle.toUpperCase()}</text>
        <text x="500" y="415" fill="#a5b4fc" font-family="sans-serif" font-size="16" font-weight="700" text-anchor="middle" letter-spacing="3">UNIVERSIDADE TEOLÓGICA • ACESSO OFFLINE GARANTIDO</text>
      </svg>`;

      images.push(
        { id: `banner_${moduleId}`, title: `Capa ${safeTitle}`, cacheKey: `theology_${moduleId}_banner`, dataBase64: encodeSvgToDataUri(genericBannerSvg), type: 'banner' }
      );
      break;
    }
  }

  return images;
}

// ============================================================================
// SERVIÇO PRINCIPAL DE DOWNLOAD E GESTÃO OFFLINE DE TEOLOGIA
// ============================================================================

/**
 * Faz o download completo de um módulo de teologia, incluindo:
 * 1. Todas as lições e textos convertidos para formato local;
 * 2. Imagens, diagramas doutrinários e capas salvos no IndexedDB;
 * 3. Quizzes e anotações para estudo 100% desconectado.
 */
export async function downloadTheologyModule(
  moduleData: ModuleData,
  onProgress?: (progress: TheologyDownloadProgress) => void
): Promise<DownloadedTheologyModule> {
  const moduleId = moduleData.id;

  const notify = (stage: TheologyDownloadProgress['stage'], current: number, total: number, message: string) => {
    const percentage = Math.round((current / total) * 100);
    const progressData: TheologyDownloadProgress = {
      moduleId,
      stage,
      currentStep: current,
      totalSteps: total,
      percentage,
      message
    };
    if (onProgress) onProgress(progressData);
    dispatchOfflineEvent({ action: 'progress', moduleId, progress: progressData, timestamp: new Date().toISOString() });
  };

  try {
    notify('starting', 1, 10, 'Iniciando preparação do módulo para download offline...');

    // 1. Processar e serializar todas as lições e páginas
    notify('extracting_text', 3, 10, 'Extraindo e serializando textos, exegeses e referências...');
    const processedLessons: OfflineTheologyLesson[] = (moduleData.lessons || []).map((lesson, lIdx) => {
      const offlinePages: OfflineTheologyPage[] = (lesson.pages || []).map((p) => {
        const textHtml = serializeReactNodeToHtml(p.text);
        const textRaw = serializeReactNodeToText(p.text);
        return {
          pageTitle: p.pageTitle,
          subtitle: p.subtitle,
          textHtml,
          textRaw
        };
      });

      return {
        lessonIndex: lIdx + 1,
        title: lesson.title,
        readingTime: lesson.readingTime,
        pages: offlinePages
      };
    });

    // 2. Coletar e gerar ilustrações e diagramas doutrinários
    notify('downloading_media', 6, 10, 'Gerando e armazenando diagramas teológicos e capas...');
    const theologicalImages = getTheologicalModuleIllustrations(moduleId, moduleData.title);
    const mediaKeys: string[] = [];

    for (let i = 0; i < theologicalImages.length; i++) {
      const img = theologicalImages[i];
      if (img.dataBase64) {
        await storeMedia(img.cacheKey, img.dataBase64);
        mediaKeys.push(img.cacheKey);
      }
    }

    // 3. Calcular tamanho estimado dos dados armazenados
    notify('saving_storage', 8, 10, 'Gravando pacote estruturado no banco IndexedDB...');
    const rawModuleJson = JSON.stringify({
      id: moduleId,
      title: moduleData.title,
      description: moduleData.description,
      color: moduleData.color,
      lessons: processedLessons,
      quiz: moduleData.quiz || []
    });

    let totalSizeBytes = rawModuleJson.length * 2; // UTF-16 aproximado
    for (const img of theologicalImages) {
      if (img.dataBase64) {
        totalSizeBytes += img.dataBase64.length;
      }
    }

    const downloadedModule: DownloadedTheologyModule = {
      id: moduleId,
      title: moduleData.title,
      description: moduleData.description,
      color: moduleData.color,
      iconName: typeof moduleData.icon === 'string' ? moduleData.icon : undefined,
      downloaded_at: new Date().toISOString(),
      sizeBytes: totalSizeBytes,
      formattedSize: formatBytes(totalSizeBytes),
      lessons: processedLessons,
      quiz: moduleData.quiz || [],
      images: theologicalImages,
      mediaKeys,
      version: '1.0.0',
      status: 'ready'
    };

    // 4. Salvar na tabela `theology_modules`
    const db = await initDb();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_THEOLOGY, 'readwrite');
      const store = transaction.objectStore(STORE_THEOLOGY);
      const request = store.put(downloadedModule);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    notify('completed', 10, 10, `Módulo "${moduleData.title}" baixado com sucesso (${downloadedModule.formattedSize})!`);
    dispatchOfflineEvent({ action: 'downloaded', moduleId, timestamp: new Date().toISOString() });

    return downloadedModule;
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    notify('error', 10, 10, `Erro ao baixar módulo: ${errorMsg}`);
    throw error;
  }
}

/**
 * Remove um módulo de teologia e todas as suas imagens do IndexedDB
 */
export async function removeDownloadedTheologyModule(moduleId: string): Promise<void> {
  if (!moduleId) return;
  try {
    const db = await initDb();
    
    // Obter o registro para saber as chaves de mídia associadas
    const existing = await getDownloadedTheologyModule(moduleId);
    if (existing && existing.mediaKeys && existing.mediaKeys.length > 0) {
      for (const mKey of existing.mediaKeys) {
        await clearMedia(mKey);
      }
    }

    // Remover da tabela `theology_modules`
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_THEOLOGY, 'readwrite');
      const store = transaction.objectStore(STORE_THEOLOGY);
      const request = store.delete(moduleId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    dispatchOfflineEvent({ action: 'removed', moduleId, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error(`Erro ao remover módulo de teologia ${moduleId}:`, error);
    throw error;
  }
}

/**
 * Verifica se um módulo específico está baixado e pronto para uso offline
 */
export async function isTheologyModuleDownloaded(moduleId: string): Promise<boolean> {
  if (!moduleId) return false;
  try {
    const mod = await getDownloadedTheologyModule(moduleId);
    return mod !== null && mod.status === 'ready';
  } catch {
    return false;
  }
}

/**
 * Obtém os dados completos de um módulo baixado
 */
export async function getDownloadedTheologyModule(moduleId: string): Promise<DownloadedTheologyModule | null> {
  if (!moduleId) return null;
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_THEOLOGY, 'readonly');
      const store = transaction.objectStore(STORE_THEOLOGY);
      const request = store.get(moduleId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`Erro ao carregar módulo ${moduleId} do IndexedDB:`, error);
    return null;
  }
}

/**
 * Lista todos os módulos de teologia atualmente salvos para acesso offline
 */
export async function getAllDownloadedTheologyModules(): Promise<DownloadedTheologyModule[]> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_THEOLOGY, 'readonly');
      const store = transaction.objectStore(STORE_THEOLOGY);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Erro ao listar módulos baixados do IndexedDB:", error);
    return [];
  }
}

/**
 * Obtém o espaço total ocupado por módulos e mídias no IndexedDB
 */
export async function getTheologyStorageUsage(): Promise<TheologyStorageStats> {
  try {
    const modules = await getAllDownloadedTheologyModules();
    const mediaKeys = await getAllKeys();
    
    let totalSizeBytes = 0;
    const downloadedModuleIds: string[] = [];

    for (const mod of modules) {
      totalSizeBytes += mod.sizeBytes || 0;
      downloadedModuleIds.push(mod.id);
    }

    return {
      modulesCount: modules.length,
      mediaCount: mediaKeys.length,
      totalSizeBytes,
      formattedSize: formatBytes(totalSizeBytes),
      downloadedModuleIds
    };
  } catch (error) {
    console.error("Erro ao calcular armazenamento:", error);
    return {
      modulesCount: 0,
      mediaCount: 0,
      totalSizeBytes: 0,
      formattedSize: '0 B',
      downloadedModuleIds: []
    };
  }
}

/**
 * Remove todos os módulos de teologia salvos offline de uma só vez
 */
export async function clearAllTheologyDownloads(): Promise<void> {
  try {
    const modules = await getAllDownloadedTheologyModules();
    for (const mod of modules) {
      await removeDownloadedTheologyModule(mod.id);
    }
    dispatchOfflineEvent({ action: 'cleared', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Erro ao limpar cache de teologia:", error);
    throw error;
  }
}

/**
 * Baixa todos os módulos oficiais da Universidade Teológica sequencialmente
 */
export async function downloadAllTheologyModules(
  modules: ModuleData[] = MODULES_TEOLOGIA,
  onProgress?: (progress: TheologyDownloadProgress) => void
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;
  const total = modules.length;

  for (let i = 0; i < total; i++) {
    const mod = modules[i];
    try {
      if (onProgress) {
        onProgress({
          moduleId: mod.id,
          stage: 'downloading_media',
          currentStep: i + 1,
          totalSteps: total,
          percentage: Math.round(((i + 1) / total) * 100),
          message: `Baixando módulo ${i + 1} de ${total}: ${mod.title}...`
        });
      }
      await downloadTheologyModule(mod);
      success++;
    } catch (e) {
      console.error(`Falha ao baixar módulo ${mod.id}:`, e);
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Recupera imagem do cache IndexedDB por chave ou URL de fallback
 */
export async function getCachedTheologyMedia(cacheKey: string): Promise<string | null> {
  return getMedia(cacheKey);
}

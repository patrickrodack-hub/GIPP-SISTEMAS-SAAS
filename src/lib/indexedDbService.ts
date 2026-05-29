/**
 * Serviço de pré-processamento de imagens e cache no IndexedDB para Avatares e Logos
 * Ajuda a reduzir o uso de largura de banda (compressão local no canvas) e acelera o carregamento.
 */

const DB_NAME = 'ChurchAppMediaCache';
const DB_VERSION = 1;
const STORE_NAME = 'media';

/**
 * Inicializa a ligação ao banco de dados IndexedDB
 */
export function initDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("Erro ao inicializar IndexedDB para média:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Armazena uma imagem (em Base64) no IndexedDB sob uma chave (ex: ID do membro ou logo)
 */
export async function storeMedia(key: string, base64Data: string): Promise<void> {
  if (!key || !base64Data) return;
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
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
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
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
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`Erro ao apagar chave ${key} do IndexedDB:`, error);
  }
}

/**
 * Pré-processa uma imagem no navegador utilizando um componente Canvas HTML5.
 * Redimensiona e comprime (JPEG) para economizar largura de banda e acelerar transfers.
 *
 * @param file O ficheiro original enviado pelo utilizador
 * @param options Configurações de redimensionamento e qualidade
 * @returns Promessa com a string Base64 optimizada/comprimida
 */
export function preprocessImage(
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const maxWidth = options.maxWidth || 300; // Fotos de perfil/logos em lista não precisam de mais de 300px
    const maxHeight = options.maxHeight || 300;
    const quality = options.quality !== undefined ? options.quality : 0.7; // 70% de qualidade reduz ficheiro de 3MB para ~25KB

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Falha ao ler o ficheiro físico."));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Falha ao criar o elemento de imagem."));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Mantém rácio de aspecto adaptado para caixas delimitadoras
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

        // Desenha a imagem redimensionada
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        try {
          // Converte para JPEG com compressão
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

// syncEngine.ts - Motor de Sincronização e Fila Offline para o GIPP
export interface QueuedSyncAction {
  id: string;
  collection: string;
  docId: string;
  operation: 'set' | 'update' | 'delete';
  data?: any;
  timestamp: number;
  retryCount: number;
}

const STORAGE_KEY = 'gipp_offline_sync_queue';

class SyncEngine {
  private listeners: ((state: { isOnline: boolean; pendingCount: number; lastSync: Date | null }) => void)[] = [];
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isProcessing: boolean = false;
  private lastSync: Date | null = new Date();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnlineChange(true));
      window.addEventListener('offline', () => this.handleOnlineChange(false));
    }
  }

  public getQueue(): QueuedSyncAction[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public saveQueue(queue: QueuedSyncAction[]): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
      this.notifyListeners();
    } catch (e) {
      console.warn('Erro ao salvar fila offline:', e);
    }
  }

  public queueAction(action: Omit<QueuedSyncAction, 'id' | 'timestamp' | 'retryCount'>): void {
    const queue = this.getQueue();
    const item: QueuedSyncAction = {
      ...action,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      retryCount: 0
    };
    queue.push(item);
    this.saveQueue(queue);
  }

  private handleOnlineChange(online: boolean): void {
    this.isOnline = online;
    this.notifyListeners();
    if (online) {
      this.processQueue();
    }
  }

  public async processQueue(firestoreRunner?: (action: QueuedSyncAction) => Promise<boolean>): Promise<number> {
    if (this.isProcessing || !this.isOnline) return 0;
    const queue = this.getQueue();
    if (queue.length === 0) {
      this.lastSync = new Date();
      this.notifyListeners();
      return 0;
    }

    this.isProcessing = true;
    this.notifyListeners();

    let processed = 0;
    const remaining: QueuedSyncAction[] = [];

    for (const item of queue) {
      try {
        if (firestoreRunner) {
          const success = await firestoreRunner(item);
          if (success) {
            processed++;
          } else {
            remaining.push({ ...item, retryCount: item.retryCount + 1 });
          }
        } else {
          // Marca processado se não houver runner externo
          processed++;
        }
      } catch (err) {
        if (item.retryCount < 5) {
          remaining.push({ ...item, retryCount: item.retryCount + 1 });
        }
      }
    }

    this.saveQueue(remaining);
    this.lastSync = new Date();
    this.isProcessing = false;
    this.notifyListeners();
    return processed;
  }

  public subscribe(callback: (state: { isOnline: boolean; pendingCount: number; lastSync: Date | null; isProcessing: boolean }) => void): () => void {
    this.listeners.push(callback);
    callback({
      isOnline: this.isOnline,
      pendingCount: this.getQueue().length,
      lastSync: this.lastSync,
      isProcessing: this.isProcessing
    });

    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners(): void {
    const state = {
      isOnline: this.isOnline,
      pendingCount: this.getQueue().length,
      lastSync: this.lastSync,
      isProcessing: this.isProcessing
    };
    this.listeners.forEach(fn => fn(state));
  }
}

export const syncEngine = new SyncEngine();

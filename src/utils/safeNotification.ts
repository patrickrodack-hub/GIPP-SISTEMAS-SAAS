/**
 * Utilitário seguro para disparo de notificações do sistema.
 * 
 * Evita o erro "Uncaught TypeError: Illegal constructor" disparado pelo Chromium
 * quando new Notification(...) é invocado em ambientes iframe (como no preview do AI Studio)
 * ou em navegadores móveis (Android Chrome).
 */

export async function showSafeNotification(
  title: string,
  options?: NotificationOptions
): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  // 1. Tentar via Service Worker (suportado em iframes, Android e PWA)
  if ('serviceWorker' in navigator && navigator.serviceWorker) {
    try {
      const reg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<null>(resolve => setTimeout(() => resolve(null), 800))
      ]);
      if (reg && typeof reg.showNotification === 'function') {
        await reg.showNotification(title, options);
        return true;
      }
    } catch (_) {
      // SW indisponível ou falhou, continuar para fallback
    }
  }

  // 2. Fallback via construtor com try/catch rigoroso
  try {
    new Notification(title, options);
    return true;
  } catch (err) {
    console.warn('[GIPP Notification] Construtor nativo Notification restrito no contexto atual (iframe):', err);
    return false;
  }
}

export default showSafeNotification;

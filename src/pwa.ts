/**
 * Service Worker registration helper.
 * vite-plugin-pwa generates the actual SW file at build time.
 * This module just registers it and handles update notifications.
 */
export function registerSW(): void {
  if (!('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(reg => {
        console.log('[PWA] Service worker registered, scope:', reg.scope)

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // Dispatch custom event so App.vue can show "Update available" toast
              window.dispatchEvent(new CustomEvent('sw:update'))
            }
          })
        })
      })
      .catch(err => {
        console.warn('[PWA] Service worker registration failed:', err)
      })
  })
}

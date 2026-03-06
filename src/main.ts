import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import en from './i18n/en'
import ar from './i18n/ar'
import './assets/theme.css'
import { registerSW } from './pwa'

// ── i18n setup ────────────────────────────────────────────────────────────────
const i18n = createI18n({
  legacy: false,
  locale: navigator.language.startsWith('ar') ? 'ar' : 'en',
  fallbackLocale: 'en',
  messages: { en, ar },
})

// ── Mount app ─────────────────────────────────────────────────────────────────
createApp(App).use(i18n).mount('#app')

// ── Register service worker (PWA offline support) ─────────────────────────────
registerSW()

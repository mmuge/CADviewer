import { ref, computed, watchEffect } from 'vue'

const isDark = ref(
  localStorage.getItem('theme') === 'dark' ||
  window.matchMedia('(prefers-color-scheme: dark)').matches
)

watchEffect(() => {
  // Set on document root so CSS vars cascade everywhere
  document.documentElement.setAttribute(
    'data-theme',
    isDark.value ? 'dark' : 'light'
  )
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
})

export function useTheme() {
  return {
    isDark,
    toggle: () => { isDark.value = !isDark.value },
  }
}

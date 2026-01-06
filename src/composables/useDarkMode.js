import { ref, watch } from 'vue'

// 单例状态
const isDark = ref(false)
let initialized = false

// 应用深色模式
const applyDarkMode = () => {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// 初始化
const initDarkMode = () => {
  if (initialized) return
  initialized = true
  
  const saved = localStorage.getItem('darkMode')
  if (saved !== null) {
    isDark.value = JSON.parse(saved)
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyDarkMode()
}

// 监听深色模式变化
watch(isDark, (newVal) => {
  localStorage.setItem('darkMode', JSON.stringify(newVal))
  applyDarkMode()
})

// 立即初始化
if (typeof window !== 'undefined') {
  initDarkMode()
}

export const useDarkMode = () => {
  // 切换深色模式
  const toggleDarkMode = () => {
    isDark.value = !isDark.value
  }

  return {
    isDark,
    toggleDarkMode
  }
}

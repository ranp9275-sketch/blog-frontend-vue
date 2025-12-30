import { ref, watch, onMounted } from 'vue'

export const useDarkMode = () => {
  const isDark = ref(false)

  // 初始化深色模式
  onMounted(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) {
      isDark.value = JSON.parse(saved)
    } else {
      // 检查系统偏好
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyDarkMode()
  })

  // 监听深色模式变化
  watch(isDark, (newVal) => {
    localStorage.setItem('darkMode', JSON.stringify(newVal))
    applyDarkMode()
  })

  // 应用深色模式
  const applyDarkMode = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 切换深色模式
  const toggleDarkMode = () => {
    isDark.value = !isDark.value
  }

  return {
    isDark,
    toggleDarkMode
  }
}

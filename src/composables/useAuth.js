import { ref, computed } from 'vue'
import api from '../api/index'

// 单例状态 - 在模块级别定义，确保所有组件共享同一状态
const user = ref(null)
const token = ref(localStorage.getItem('token') || '')

// 初始化 token
if (token.value) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
}

export const useAuth = () => {
  const isAuthenticated = computed(() => !!token.value)

  // 登陆
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      token.value = response.data.token
      user.value = response.data.user
      localStorage.setItem('token', token.value)
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  // 注册
  const register = async (email, password, name) => {
    try {
      const response = await api.post('/auth/register', { email, password, name })
      token.value = response.data.token
      user.value = response.data.user
      localStorage.setItem('token', token.value)
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      return true
    } catch (error) {
      console.error('Register failed:', error)
      return false
    }
  }

  // 登出
  const logout = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
  }

  // 获取当前用户
  const getCurrentUser = async () => {
    if (!token.value) return null
    try {
      const response = await api.get('/auth/me')
      user.value = response.data
      return user.value
    } catch (error) {
      console.error('Failed to get current user:', error)
      logout()
      return null
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    getCurrentUser
  }
}

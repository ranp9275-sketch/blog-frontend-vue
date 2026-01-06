import { ref, computed } from 'vue'
import api from '../api/index'

// 单例状态
const favorites = ref([])

export const useFavorites = () => {
  // 获取收藏列表
  const getFavorites = async () => {
    try {
      const response = await api.get('/user/favorites')
      favorites.value = response.data || []
      return favorites.value
    } catch (error) {
      console.error('Failed to get favorites:', error)
      favorites.value = []
      return []
    }
  }

  // 添加收藏
  const addFavorite = async (articleId) => {
    try {
      await api.post('/user/favorites', { article_id: articleId })
      // 重新获取收藏列表以确保数据同步
      await getFavorites()
      return true
    } catch (error) {
      console.error('Failed to add favorite:', error)
      return false
    }
  }

  // 移除收藏
  const removeFavorite = async (articleId) => {
    try {
      await api.delete(`/user/favorites/${articleId}`)
      favorites.value = favorites.value.filter(f => f.id !== articleId)
      return true
    } catch (error) {
      console.error('Failed to remove favorite:', error)
      return false
    }
  }

  // 检查是否已收藏
  const isFavorited = (articleId) => {
    return favorites.value.some(f => f.id === articleId)
  }

  // 清空收藏（登出时使用）
  const clearFavorites = () => {
    favorites.value = []
  }

  return {
    favorites,
    getFavorites,
    addFavorite,
    removeFavorite,
    isFavorited,
    clearFavorites
  }
}

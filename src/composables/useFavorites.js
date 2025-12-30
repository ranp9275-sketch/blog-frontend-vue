import { ref, computed } from 'vue'
import api from '../api/index'

export const useFavorites = () => {
  const favorites = ref([])

  // 获取收藏列表
  const getFavorites = async () => {
    try {
      const response = await api.get('/user/favorites')
      favorites.value = response.data || []
      return favorites.value
    } catch (error) {
      console.error('Failed to get favorites:', error)
      return []
    }
  }

  // 添加收藏
  const addFavorite = async (articleId) => {
    try {
      await api.post('/user/favorites', { article_id: articleId })
      if (!favorites.value.find(f => f.id === articleId)) {
        favorites.value.push({ id: articleId })
      }
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
  const isFavorited = computed(() => (articleId) => {
    return favorites.value.some(f => f.id === articleId)
  })

  return {
    favorites,
    getFavorites,
    addFavorite,
    removeFavorite,
    isFavorited
  }
}

<template>
  <div>
    <h1 class="text-4xl font-bold mb-8 dark:text-white">我的收藏</h1>

    <!-- 未登录提示 -->
    <div v-if="!isAuthenticated" class="bg-blue-100 dark:bg-blue-900 border border-blue-400 dark:border-blue-700 text-blue-700 dark:text-blue-300 px-6 py-4 rounded-lg mb-8">
      <p>请先 <router-link to="/login" class="underline font-semibold">登录</router-link> 以查看收藏的文章</p>
    </div>

    <!-- 收藏列表 -->
    <div v-else>
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <div v-else-if="favorites.length > 0" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="article in favorites"
          :key="article.id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition overflow-hidden cursor-pointer fade-in relative"
          @click="goToArticle(article.id)"
        >
          <!-- 取消收藏按钮 -->
          <button
            @click.stop="handleRemoveFavorite(article.id)"
            class="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition z-10"
            title="取消收藏"
          >
            ✕
          </button>

          <!-- 文章封面 -->
          <div v-if="article.cover_image" class="h-48 bg-gradient-to-br from-blue-400 to-blue-600 overflow-hidden">
            <img :src="article.cover_image" :alt="article.title" class="w-full h-full object-cover" />
          </div>
          <div v-else class="h-48 bg-gradient-to-br from-blue-400 to-blue-600"></div>

          <!-- 文章内容 -->
          <div class="p-6">
            <div class="flex items-center gap-2 mb-3 flex-wrap">
              <span v-if="article.category" class="text-xs bg-primary text-white px-3 py-1 rounded-full">
                {{ article.category.name }}
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(article.published_at) }}</span>
            </div>

            <h3 class="text-xl font-bold mb-2 line-clamp-2 hover:text-primary dark:text-white">
              {{ article.title }}
            </h3>

            <p class="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
              {{ article.excerpt || (article.content ? article.content.substring(0, 100) : '') }}
            </p>

            <!-- 标签 -->
            <div v-if="article.tags && article.tags.length" class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="tag in article.tags.slice(0, 3)"
                :key="tag.id"
                class="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
              >
                #{{ tag.name }}
              </span>
            </div>

            <!-- 统计信息 -->
            <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>👁️ {{ article.views || 0 }} 次阅读</span>
              <span class="text-primary font-semibold">阅读更多 →</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-center">
        <p class="text-gray-600 dark:text-gray-400 text-lg">还没有收藏任何文章</p>
        <router-link to="/" class="text-primary hover:underline font-semibold mt-4 inline-block">
          去浏览文章 →
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useFavorites } from '../composables/useFavorites'
import dayjs from 'dayjs'

const router = useRouter()
const { isAuthenticated } = useAuth()
const { favorites, getFavorites, removeFavorite } = useFavorites()

const loading = ref(false)

const formatDate = (date) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD')
}

const goToArticle = (id) => {
  router.push(`/article/${id}`)
}

const handleRemoveFavorite = async (articleId) => {
  if (confirm('确定要取消收藏吗？')) {
    await removeFavorite(articleId)
  }
}

onMounted(async () => {
  if (isAuthenticated.value) {
    loading.value = true
    await getFavorites()
    loading.value = false
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

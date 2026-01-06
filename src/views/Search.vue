<template>
  <div>
    <h1 class="text-4xl font-bold mb-8 dark:text-white">搜索</h1>

    <!-- 搜索框 -->
    <div class="mb-8">
      <div class="flex gap-4 flex-col sm:flex-row">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索文章标题或内容..."
          @keyup.enter="performSearch"
          class="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-primary focus:outline-none text-lg bg-white dark:bg-gray-800 dark:text-white"
        />
        <button
          @click="performSearch"
          :disabled="loading"
          class="bg-primary hover:bg-green-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition whitespace-nowrap"
        >
          {{ loading ? '搜索中...' : '搜索' }}
        </button>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="searched">
      <h2 class="text-2xl font-bold mb-6 dark:text-white">
        搜索结果 ({{ results.length }} 篇文章)
      </h2>

      <div v-if="results.length > 0" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="article in results"
          :key="article.id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition overflow-hidden cursor-pointer"
          @click="goToArticle(article.id)"
        >
          <div v-if="article.cover_image" class="h-48 bg-gradient-to-br from-blue-400 to-blue-600 overflow-hidden">
            <img :src="article.cover_image" :alt="article.title" class="w-full h-full object-cover" />
          </div>
          <div v-else class="h-48 bg-gradient-to-br from-blue-400 to-blue-600"></div>

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

            <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>👁️ {{ article.views || 0 }} 次阅读</span>
              <span class="text-primary font-semibold">阅读更多 →</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-center">
        <p class="text-gray-600 dark:text-gray-400 text-lg">没有找到相关文章</p>
        <p class="text-gray-500 dark:text-gray-500 text-sm mt-2">试试其他关键词？</p>
      </div>
    </div>

    <!-- 初始提示 -->
    <div v-else class="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-center">
      <p class="text-gray-600 dark:text-gray-400 text-lg">输入关键词开始搜索</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { searchAPI } from '../api/search'
import dayjs from 'dayjs'

const router = useRouter()

const searchQuery = ref('')
const results = ref([])
const loading = ref(false)
const searched = ref(false)

const formatDate = (date) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD')
}

const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    return
  }

  loading.value = true
  searched.value = true

  try {
    const response = await searchAPI.searchArticles(searchQuery.value)
    results.value = response.data.data || []
  } catch (error) {
    console.error('Search failed:', error)
    results.value = []
  } finally {
    loading.value = false
  }
}

const goToArticle = (id) => {
  router.push(`/article/${id}`)
}
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
</style>

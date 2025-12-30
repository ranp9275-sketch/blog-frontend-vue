<template>
  <div>
    <!-- 英雄区 -->
    <div class="relative h-96 bg-gradient-to-b from-blue-400 to-blue-600 rounded-lg overflow-hidden mb-12">
      <div class="absolute inset-0 opacity-50" style="background-image: url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop'); background-size: cover; background-position: center;"></div>
      <div class="relative h-full flex flex-col items-center justify-center text-white">
        <h1 class="text-5xl font-bold mb-4 text-center">深入技术世界</h1>
        <p class="text-xl mb-8 text-center">探索云原生、DevOps、编程语言的深度技术文章</p>
        <button @click="scrollToArticles" class="bg-primary hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition">
          开始阅读
        </button>
      </div>
    </div>

    <!-- 筛选区 -->
    <div class="mb-8 flex flex-wrap gap-4">
      <button
        @click="selectedCategory = null"
        :class="[
          'px-4 py-2 rounded-lg font-semibold transition',
          selectedCategory === null
            ? 'bg-primary text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        ]"
      >
        全部分类
      </button>
      <button
        v-for="category in categories"
        :key="category.id"
        @click="selectedCategory = category.id"
        :class="[
          'px-4 py-2 rounded-lg font-semibold transition',
          selectedCategory === category.id
            ? 'bg-primary text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        ]"
      >
        {{ category.name }}
      </button>
    </div>

    <!-- 文章列表 -->
    <div ref="articlesRef" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="article in filteredArticles"
        :key="article.id"
        class="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden cursor-pointer fade-in"
        @click="goToArticle(article.id)"
      >
        <!-- 文章封面 -->
        <div v-if="article.cover_image" class="h-48 bg-gradient-to-br from-blue-400 to-blue-600 overflow-hidden">
          <img :src="article.cover_image" :alt="article.title" class="w-full h-full object-cover" />
        </div>
        <div v-else class="h-48 bg-gradient-to-br from-blue-400 to-blue-600"></div>

        <!-- 文章内容 -->
        <div class="p-6">
          <div class="flex items-center gap-2 mb-3">
            <span v-if="article.category" class="text-xs bg-primary text-white px-3 py-1 rounded-full">
              {{ article.category.name }}
            </span>
            <span class="text-xs text-gray-500">{{ formatDate(article.published_at) }}</span>
          </div>

          <h3 class="text-xl font-bold mb-2 line-clamp-2 hover:text-primary">
            {{ article.title }}
          </h3>

          <p class="text-gray-600 text-sm line-clamp-3 mb-4">
            {{ article.excerpt || article.content.substring(0, 100) }}
          </p>

          <!-- 标签 -->
          <div v-if="article.tags && article.tags.length" class="flex flex-wrap gap-2 mb-4">
            <span
              v-for="tag in article.tags.slice(0, 3)"
              :key="tag.id"
              class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
            >
              #{{ tag.name }}
            </span>
          </div>

          <!-- 统计信息 -->
          <div class="flex items-center justify-between text-sm text-gray-500">
            <span>👁️ {{ article.views || 0 }} 次阅读</span>
            <span class="text-primary font-semibold">阅读更多 →</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <!-- 分页 -->
    <div v-if="!loading && totalPages > 1" class="flex justify-center gap-2 mt-12">
      <button
        v-for="page in totalPages"
        :key="page"
        @click="currentPage = page"
        :class="[
          'px-4 py-2 rounded-lg font-semibold transition',
          currentPage === page
            ? 'bg-primary text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        ]"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { articleAPI, categoryAPI } from '../api/index'
import dayjs from 'dayjs'

const router = useRouter()

const articles = ref([])
const categories = ref([])
const selectedCategory = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(1)
const loading = ref(false)
const articlesRef = ref(null)

const filteredArticles = computed(() => {
  if (!selectedCategory.value) {
    return articles.value
  }
  return articles.value.filter(a => a.category_id === selectedCategory.value)
})

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const fetchArticles = async () => {
  loading.value = true
  try {
    const response = await articleAPI.getArticles(currentPage.value, pageSize.value)
    articles.value = response.data.data || []
    totalPages.value = Math.ceil((response.data.total || 0) / pageSize.value)
  } catch (error) {
    console.error('Failed to fetch articles:', error)
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const response = await categoryAPI.getCategories()
    categories.value = response.data || []
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

const goToArticle = (id) => {
  router.push(`/article/${id}`)
}

const scrollToArticles = () => {
  articlesRef.value?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  fetchArticles()
  fetchCategories()
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
</style>

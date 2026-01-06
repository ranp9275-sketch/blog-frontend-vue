<template>
  <div>
    <!-- 英雄区 -->
    <div class="relative h-96 bg-gradient-to-b from-blue-400 to-blue-600 rounded-lg overflow-hidden mb-12">
      <div class="absolute inset-0 opacity-50" style="background-image: url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop'); background-size: cover; background-position: center;"></div>
      <div class="relative h-full flex flex-col items-center justify-center text-white">
        <h1 class="text-5xl font-bold mb-4 text-center">深入技术世界</h1>
        <p class="text-xl mb-8 text-center px-4">探索云原生、DevOps、编程语言的深度技术文章</p>
        <button @click="scrollToArticles" class="bg-primary hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition">
          开始阅读
        </button>
      </div>
    </div>

    <!-- 当前筛选提示 -->
    <div v-if="currentTagName" class="mb-6 flex items-center gap-3">
      <span class="text-gray-600 dark:text-gray-400">当前标签：</span>
      <span class="bg-primary text-white px-4 py-1 rounded-full">#{{ currentTagName }}</span>
      <button @click="clearFilter" class="text-gray-500 hover:text-red-500 text-sm">✕ 清除筛选</button>
    </div>

    <!-- 筛选区 -->
    <div v-if="!currentTagName" class="mb-8 flex flex-wrap gap-3">
      <button
        @click="selectCategory(null)"
        :class="[
          'px-4 py-2 rounded-lg font-semibold transition',
          !selectedCategory
            ? 'bg-primary text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        ]"
      >
        全部分类
      </button>
      <button
        v-for="category in categories"
        :key="category.id"
        @click="selectCategory(category.id)"
        :class="[
          'px-4 py-2 rounded-lg font-semibold transition',
          selectedCategory === category.id
            ? 'bg-primary text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        ]"
      >
        {{ category.name }}
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <!-- 文章列表 -->
    <div v-else-if="articles.length > 0" ref="articlesRef" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="article in articles"
        :key="article.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition overflow-hidden cursor-pointer fade-in"
        @click="goToArticle(article.id)"
      >
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
      <p class="text-gray-600 dark:text-gray-400 text-lg">暂无文章</p>
    </div>

    <!-- 分页 -->
    <div v-if="!loading && totalPages > 1" class="flex justify-center gap-2 mt-12 flex-wrap">
      <button
        v-for="page in totalPages"
        :key="page"
        @click="goToPage(page)"
        :class="[
          'px-4 py-2 rounded-lg font-semibold transition',
          currentPage === page
            ? 'bg-primary text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        ]"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { articleAPI, categoryAPI, tagAPI } from '../api/index'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()

const articles = ref([])
const categories = ref([])
const tags = ref([])
const selectedCategory = ref(null)
const selectedTag = ref(null)
const currentTagName = ref('')
const currentPage = ref(1)
const pageSize = ref(9)
const totalPages = ref(1)
const total = ref(0)
const loading = ref(false)
const articlesRef = ref(null)

const formatDate = (date) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD')
}

const fetchArticles = async () => {
  loading.value = true
  try {
    let response
    if (selectedTag.value) {
      response = await articleAPI.getArticlesByTag(selectedTag.value, currentPage.value, pageSize.value)
    } else if (selectedCategory.value) {
      response = await articleAPI.getArticlesByCategory(selectedCategory.value, currentPage.value, pageSize.value)
    } else {
      response = await articleAPI.getArticles(currentPage.value, pageSize.value)
    }
    articles.value = response.data.data || []
    total.value = response.data.total || 0
    totalPages.value = Math.ceil(total.value / pageSize.value)
  } catch (error) {
    console.error('Failed to fetch articles:', error)
    articles.value = []
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

const fetchTags = async () => {
  try {
    const response = await tagAPI.getTags()
    tags.value = response.data || []
  } catch (error) {
    console.error('Failed to fetch tags:', error)
  }
}

const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId
  selectedTag.value = null
  currentTagName.value = ''
  currentPage.value = 1
  // 清除 URL 参数
  router.replace({ query: categoryId ? { category: categoryId } : {} })
  fetchArticles()
}

const clearFilter = () => {
  selectedCategory.value = null
  selectedTag.value = null
  currentTagName.value = ''
  currentPage.value = 1
  router.replace({ query: {} })
  fetchArticles()
}

const goToPage = (page) => {
  currentPage.value = page
  fetchArticles()
  scrollToArticles()
}

const goToArticle = (id) => {
  router.push(`/article/${id}`)
}

const scrollToArticles = () => {
  articlesRef.value?.scrollIntoView({ behavior: 'smooth' })
}

// 处理路由参数变化
const handleRouteQuery = async () => {
  const { category, tag } = route.query
  
  if (tag) {
    selectedTag.value = tag
    selectedCategory.value = null
    // 获取标签名称
    if (tags.value.length === 0) {
      await fetchTags()
    }
    const tagObj = tags.value.find(t => t.id === tag)
    currentTagName.value = tagObj?.name || ''
  } else if (category) {
    selectedCategory.value = category
    selectedTag.value = null
    currentTagName.value = ''
  } else {
    selectedCategory.value = null
    selectedTag.value = null
    currentTagName.value = ''
  }
  
  currentPage.value = 1
  fetchArticles()
}

// 监听路由变化
watch(() => route.query, handleRouteQuery)

onMounted(async () => {
  await fetchCategories()
  await fetchTags()
  handleRouteQuery()
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

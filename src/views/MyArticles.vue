<template>
  <div>
    <div class="flex items-center justify-between mb-8 flex-wrap gap-4">
      <h1 class="text-3xl font-bold dark:text-white">我的文章</h1>
      <router-link
        to="/write"
        class="bg-primary hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition"
      >
        + 创建文章
      </router-link>
    </div>

    <!-- 未登录提示 -->
    <div v-if="!isAuthenticated" class="bg-blue-100 dark:bg-blue-900 border border-blue-400 dark:border-blue-700 text-blue-700 dark:text-blue-300 px-6 py-4 rounded-lg">
      <p>请先 <router-link to="/login" class="underline font-semibold">登录</router-link> 以管理文章</p>
    </div>

    <div v-else>
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- 文章列表 -->
      <div v-else-if="articles.length > 0" class="space-y-4">
        <div
          v-for="article in articles"
          :key="article.id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center justify-between flex-wrap gap-4"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-2 flex-wrap">
              <h3 class="text-lg font-bold dark:text-white truncate">{{ article.title }}</h3>
              <span
                :class="[
                  'text-xs px-2 py-1 rounded',
                  article.status === 'published'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                ]"
              >
                {{ article.status === 'published' ? '已发布' : '草稿' }}
              </span>
            </div>
            <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
              <span v-if="article.category">📁 {{ article.category.name }}</span>
              <span>👁️ {{ article.views || 0 }} 次阅读</span>
              <span>📅 {{ formatDate(article.created_at) }}</span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <router-link
              v-if="article.status === 'published'"
              :to="`/article/${article.id}`"
              class="text-blue-500 hover:text-blue-600 px-3 py-1 rounded transition"
            >
              查看
            </router-link>
            <router-link
              :to="`/edit/${article.id}`"
              class="text-primary hover:text-green-600 px-3 py-1 rounded transition"
            >
              编辑
            </router-link>
            <button
              v-if="article.status === 'draft'"
              @click="publishArticle(article.id)"
              class="text-blue-500 hover:text-blue-600 px-3 py-1 rounded transition"
            >
              发布
            </button>
            <button
              @click="deleteArticle(article.id)"
              class="text-red-500 hover:text-red-600 px-3 py-1 rounded transition"
            >
              删除
            </button>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-8 flex-wrap">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-4 py-2 rounded-lg font-semibold transition bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <span class="px-4 py-2 text-gray-600 dark:text-gray-400">
            {{ currentPage }} / {{ totalPages }}
          </span>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-4 py-2 rounded-lg font-semibold transition bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-center">
        <p class="text-gray-600 dark:text-gray-400 text-lg mb-4">还没有创建任何文章</p>
        <router-link
          to="/write"
          class="inline-block bg-primary hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          创建第一篇文章
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import api from '../api/index'
import dayjs from 'dayjs'

const { isAuthenticated } = useAuth()

const articles = ref([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = 10

const formatDate = (date) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const fetchMyArticles = async () => {
  loading.value = true
  try {
    const response = await api.get('/user/articles', {
      params: { page: currentPage.value, pageSize }
    })
    articles.value = response.data.data || []
    totalPages.value = Math.ceil((response.data.total || 0) / pageSize)
  } catch (err) {
    console.error('Failed to fetch articles:', err)
    articles.value = []
  } finally {
    loading.value = false
  }
}

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchMyArticles()
}

const publishArticle = async (id) => {
  if (!confirm('确定要发布这篇文章吗？')) return
  try {
    await api.put(`/user/articles/${id}`, { submit: true })
    await fetchMyArticles()
  } catch (err) {
    console.error('Failed to publish article:', err)
    alert('发布失败')
  }
}

const deleteArticle = async (id) => {
  if (!confirm('确定要删除这篇文章吗？此操作不可恢复。')) return
  try {
    await api.delete(`/user/articles/${id}`)
    await fetchMyArticles()
  } catch (err) {
    console.error('Failed to delete article:', err)
    alert('删除失败')
  }
}

onMounted(() => {
  if (isAuthenticated.value) {
    fetchMyArticles()
  }
})
</script>

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
      <!-- 搜索和筛选 -->
      <div class="mb-6 space-y-4">
        <!-- 搜索框 -->
        <div class="flex gap-3 flex-wrap">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索文章标题..."
            class="flex-1 min-w-48 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-800 dark:text-white"
            @keyup.enter="fetchMyArticles"
          />
          <button
            @click="fetchMyArticles"
            class="bg-primary hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            搜索
          </button>
          <button
            v-if="hasFilters"
            @click="clearFilters"
            class="text-gray-500 hover:text-red-500 px-4 py-2 transition"
          >
            清除筛选
          </button>
        </div>

        <!-- 筛选条件 -->
        <div class="flex gap-4 flex-wrap">
          <!-- 状态筛选 -->
          <select
            v-model="filterStatus"
            @change="fetchMyArticles"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-800 dark:text-white"
          >
            <option value="">全部状态</option>
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
          </select>

          <!-- 分类筛选 -->
          <select
            v-model="filterCategory"
            @change="fetchMyArticles"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-800 dark:text-white"
          >
            <option value="">全部分类</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>

          <!-- 标签筛选 -->
          <select
            v-model="filterTag"
            @change="fetchMyArticles"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-800 dark:text-white"
          >
            <option value="">全部标签</option>
            <option v-for="tag in tags" :key="tag.id" :value="tag.id">{{ tag.name }}</option>
          </select>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- 文章列表 -->
      <div v-else-if="articles.length > 0" class="space-y-4">
        <div
          v-for="article in articles"
          :key="article.id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <div class="flex items-start justify-between gap-4 flex-wrap">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-2 flex-wrap">
                <h3 class="text-lg font-bold dark:text-white">{{ article.title }}</h3>
                <span :class="statusClass(article.status)">
                  {{ statusText(article.status) }}
                </span>
              </div>
              
              <!-- 摘要 -->
              <p class="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                {{ article.excerpt || (article.content ? article.content.substring(0, 100) + '...' : '') }}
              </p>

              <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                <span v-if="article.category" class="flex items-center gap-1">
                  <span class="text-primary">📁</span> {{ article.category.name }}
                </span>
                <span class="flex items-center gap-1">
                  <span>👁️</span> {{ article.views || 0 }}
                </span>
                <span class="flex items-center gap-1">
                  <span>📅</span> {{ formatDate(article.created_at) }}
                </span>
              </div>

              <!-- 标签 -->
              <div v-if="article.tags && article.tags.length" class="flex flex-wrap gap-2 mt-2">
                <span
                  v-for="tag in article.tags"
                  :key="tag.id"
                  class="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded"
                >
                  #{{ tag.name }}
                </span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex items-center gap-2 flex-wrap">
              <router-link
                v-if="article.status === 'published'"
                :to="`/article/${article.id}`"
                class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm transition"
              >
                查看
              </router-link>
              <router-link
                :to="`/edit/${article.id}`"
                class="bg-primary hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm transition"
              >
                编辑
              </router-link>
              <button
                v-if="article.status === 'draft'"
                @click="publishArticle(article)"
                class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded text-sm transition"
              >
                发布
              </button>
              <button
                @click="confirmDelete(article)"
                class="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm transition"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-center">
        <p class="text-gray-600 dark:text-gray-400 text-lg mb-4">
          {{ hasFilters ? '没有找到符合条件的文章' : '还没有创建任何文章' }}
        </p>
        <router-link
          v-if="!hasFilters"
          to="/write"
          class="inline-block bg-primary hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          创建第一篇文章
        </router-link>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-8 flex-wrap">
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

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 class="text-xl font-bold mb-4 dark:text-white">确认删除</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-2">
          确定要删除文章 "<span class="font-semibold">{{ articleToDelete?.title }}</span>" 吗？
        </p>
        <p class="text-red-500 text-sm mb-6">此操作不可恢复！</p>
        <div class="flex gap-3 justify-end">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 transition"
          >
            取消
          </button>
          <button
            @click="deleteArticle"
            :disabled="deleting"
            class="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            {{ deleting ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { categoryAPI, tagAPI } from '../api/index'
import api from '../api/index'
import dayjs from 'dayjs'

const { isAuthenticated } = useAuth()

const articles = ref([])
const categories = ref([])
const tags = ref([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)

// 筛选条件
const searchQuery = ref('')
const filterStatus = ref('')
const filterCategory = ref('')
const filterTag = ref('')

// 删除相关
const showDeleteModal = ref(false)
const articleToDelete = ref(null)
const deleting = ref(false)

const hasFilters = computed(() => {
  return searchQuery.value || filterStatus.value || filterCategory.value || filterTag.value
})

const formatDate = (date) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const statusText = (status) => {
  const map = { draft: '草稿', published: '已发布', pending: '待审核', rejected: '已拒绝' }
  return map[status] || status
}

const statusClass = (status) => {
  const map = {
    draft: 'text-xs px-2 py-1 rounded bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300',
    published: 'text-xs px-2 py-1 rounded bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    pending: 'text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    rejected: 'text-xs px-2 py-1 rounded bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
  }
  return map[status] || ''
}

const fetchMyArticles = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: 10
    }
    if (searchQuery.value) params.q = searchQuery.value
    if (filterStatus.value) params.status = filterStatus.value
    if (filterCategory.value) params.category_id = filterCategory.value
    if (filterTag.value) params.tag_id = filterTag.value

    const response = await api.get('/user/articles', { params })
    articles.value = response.data.data || []
    totalPages.value = Math.ceil((response.data.total || 0) / 10)
  } catch (err) {
    console.error('Failed to fetch articles:', err)
    articles.value = []
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const response = await categoryAPI.getCategories()
    categories.value = response.data || []
  } catch (err) {
    console.error('Failed to fetch categories:', err)
  }
}

const fetchTags = async () => {
  try {
    const response = await tagAPI.getTags()
    tags.value = response.data || []
  } catch (err) {
    console.error('Failed to fetch tags:', err)
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  filterStatus.value = ''
  filterCategory.value = ''
  filterTag.value = ''
  currentPage.value = 1
  fetchMyArticles()
}

const goToPage = (page) => {
  currentPage.value = page
  fetchMyArticles()
}

const publishArticle = async (article) => {
  if (!confirm(`确定要发布文章 "${article.title}" 吗？`)) return
  try {
    await api.put(`/user/articles/${article.id}`, { submit: true })
    await fetchMyArticles()
  } catch (err) {
    console.error('Failed to publish article:', err)
    alert('发布失败')
  }
}

const confirmDelete = (article) => {
  articleToDelete.value = article
  showDeleteModal.value = true
}

const deleteArticle = async () => {
  if (!articleToDelete.value) return
  deleting.value = true
  try {
    await api.delete(`/user/articles/${articleToDelete.value.id}`)
    showDeleteModal.value = false
    articleToDelete.value = null
    await fetchMyArticles()
  } catch (err) {
    console.error('Failed to delete article:', err)
    alert('删除失败')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  if (isAuthenticated.value) {
    fetchMyArticles()
    fetchCategories()
    fetchTags()
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
</style>

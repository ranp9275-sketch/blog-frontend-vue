<template>
  <div>
    <div class="flex items-center justify-between mb-8 flex-wrap gap-4">
      <h1 class="text-3xl font-bold dark:text-white">管理后台</h1>
    </div>

    <!-- 未登录或非管理员提示 -->
    <div v-if="!isAuthenticated" class="bg-blue-100 dark:bg-blue-900 border border-blue-400 dark:border-blue-700 text-blue-700 dark:text-blue-300 px-6 py-4 rounded-lg">
      <p>请先 <router-link to="/login" class="underline font-semibold">登录</router-link></p>
    </div>

    <div v-else-if="!isAdmin" class="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg">
      <p>您没有管理员权限</p>
    </div>

    <div v-else>
      <!-- 管理导航 -->
      <div class="mb-8 flex flex-wrap gap-4">
        <router-link
          to="/admin/articles"
          :class="[
            'px-6 py-3 rounded-lg font-semibold transition',
            activeTab === 'articles' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          ]"
        >
          📝 文章管理
        </router-link>
        <router-link
          to="/admin/categories"
          :class="[
            'px-6 py-3 rounded-lg font-semibold transition',
            activeTab === 'categories' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          ]"
        >
          📁 分类管理
        </router-link>
        <router-link
          to="/admin/tags"
          :class="[
            'px-6 py-3 rounded-lg font-semibold transition',
            activeTab === 'tags' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          ]"
        >
          🏷️ 标签管理
        </router-link>
        <router-link
          to="/admin/users"
          :class="[
            'px-6 py-3 rounded-lg font-semibold transition',
            activeTab === 'users' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          ]"
        >
          👥 用户管理
        </router-link>
        <router-link
          to="/admin/donation"
          :class="[
            'px-6 py-3 rounded-lg font-semibold transition',
            activeTab === 'donation' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          ]"
        >
          ☕ 打赏管理
        </router-link>
      </div>

      <!-- 筛选 -->
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap gap-3">
          <button
            v-for="s in statusOptions"
            :key="s.value"
            @click="filterStatus = s.value"
            :class="[
              'px-4 py-2 rounded-lg font-semibold transition',
              filterStatus === s.value
                ? 'bg-primary text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            ]"
          >
            {{ s.label }}
          </button>
        </div>

        <div class="flex items-center gap-3">
          <input
            type="file"
            ref="fileInput"
            class="hidden"
            accept=".pdf,.md"
            @change="handleFileUpload"
          />
          <button
            @click="$refs.fileInput.click()"
            :disabled="uploading"
            class="bg-primary hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2"
          >
            <span v-if="uploading" class="animate-spin text-lg">⏳</span>
            <span v-else>📤</span>
            {{ uploading ? '上传中...' : '上传文章 (PDF/MD)' }}
          </button>
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
                <h3 class="text-xl font-bold dark:text-white truncate">{{ article.title }}</h3>
                <span :class="statusClass(article.status)" class="text-xs px-2 py-1 rounded whitespace-nowrap">
                  {{ statusText(article.status) }}
                </span>
              </div>
              <p class="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                {{ article.excerpt || (article.content ? article.content.substring(0, 150) : '') }}...
              </p>
              <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                <span v-if="article.author">👤 {{ article.author.name }}</span>
                <span v-if="article.category">📁 {{ article.category.name }}</span>
                <span>📅 {{ formatDate(article.created_at) }}</span>
                <span>👁️ {{ article.views || 0 }}</span>
              </div>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              <template v-if="article.status === 'pending'">
                <button
                  @click="handlePublish(article.id)"
                  class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition"
                >
                  通过
                </button>
                <button
                  @click="handleReject(article.id)"
                  class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition"
                >
                  拒绝
                </button>
              </template>
              <router-link
                v-if="article.status === 'published'"
                :to="`/article/${article.id}`"
                class="bg-primary hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition"
              >
                查看
              </router-link>
              <button
                @click="handleDelete(article.id)"
                class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-center">
        <p class="text-gray-600 dark:text-gray-400 text-lg">暂无文章</p>
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

    <!-- 弹窗 -->
    <Modal
      :show="modal.show"
      :type="modal.type"
      :title="modal.title"
      :message="modal.message"
      :show-cancel="modal.showCancel"
      :confirm-text="modal.confirmText"
      @close="modal.show = false"
      @confirm="handleModalConfirm"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import { adminArticleAPI } from '../api/index'
import dayjs from 'dayjs'
import Modal from '../components/Modal.vue'

const { isAuthenticated, user } = useAuth()

const isAdmin = computed(() => user.value?.role === 'admin')
const activeTab = ref('articles')

const articles = ref([])
const loading = ref(false)
const uploading = ref(false)
const fileInput = ref(null)
const currentPage = ref(1)
const totalPages = ref(1)
const filterStatus = ref('')

// 弹窗状态
const modal = ref({
  show: false,
  type: 'info',
  title: '',
  message: '',
  showCancel: false,
  confirmText: '确定',
  action: null
})

const showModal = (options) => {
  modal.value = {
    show: true,
    type: options.type || 'info',
    title: options.title || '',
    message: options.message || '',
    showCancel: options.showCancel || false,
    confirmText: options.confirmText || '确定',
    action: options.action || null
  }
}

const handleModalConfirm = () => {
  if (modal.value.action) {
    modal.value.action()
  }
  modal.value.show = false
}

const statusOptions = [
  { value: '', label: '全部' },
  { value: 'pending', label: '待审核' },
  { value: 'published', label: '已发布' },
  { value: 'draft', label: '草稿' },
  { value: 'rejected', label: '已拒绝' }
]

const formatDate = (date) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const statusText = (status) => {
  const map = {
    draft: '草稿',
    pending: '待审核',
    published: '已发布',
    rejected: '已拒绝'
  }
  return map[status] || status
}

const statusClass = (status) => {
  const map = {
    draft: 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300',
    pending: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200',
    published: 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200',
    rejected: 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200'
  }
  return map[status] || ''
}

const fetchArticles = async () => {
  loading.value = true
  try {
    const response = await adminArticleAPI.getAllArticles(currentPage.value, 10, filterStatus.value)
    articles.value = response.data.data || []
    totalPages.value = Math.ceil((response.data.total || 0) / 10)
  } catch (error) {
    console.error('Failed to fetch articles:', error)
    articles.value = []
  } finally {
    loading.value = false
  }
}

const goToPage = (page) => {
  currentPage.value = page
  fetchArticles()
}

const handlePublish = async (id) => {
  showModal({
    type: 'warning',
    title: '确认发布',
    message: '确定要发布这篇文章吗？',
    showCancel: true,
    confirmText: '立即发布',
    action: async () => {
      try {
        await adminArticleAPI.publishArticle(id)
        await fetchArticles()
        showModal({
          type: 'success',
          title: '发布成功',
          message: '文章已成功发布！'
        })
      } catch (error) {
        console.error('Failed to publish article:', error)
        showModal({
          type: 'error',
          title: '发布失败',
          message: '文章发布过程中出现错误，请稍后重试。'
        })
      }
    }
  })
}

const handleReject = async (id) => {
  const reason = prompt('请输入拒绝原因（可选）：')
  
  try {
    await adminArticleAPI.rejectArticle(id, reason || '')
    await fetchArticles()
    showModal({
      type: 'success',
      title: '已拒绝',
      message: '文章已被拒绝。'
    })
  } catch (error) {
    console.error('Failed to reject article:', error)
    showModal({
      type: 'error',
      title: '操作失败',
      message: '处理过程中出现错误。'
    })
  }
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  uploading.value = true
  try {
    await adminArticleAPI.uploadArticle(formData)
    await fetchArticles()
    showModal({
      type: 'success',
      title: '上传成功',
      message: `文章《${file.name}》已成功上传并发布！`
    })
  } catch (error) {
    console.error('Failed to upload article:', error)
    showModal({
      type: 'error',
      title: '上传失败',
      message: error.response?.data?.error || '文件上传过程中出现错误。'
    })
  } finally {
    uploading.value = false
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const handleDelete = async (id) => {
  showModal({
    type: 'error',
    title: '确认删除',
    message: '确定要删除这篇文章吗？此操作不可恢复！',
    showCancel: true,
    confirmText: '确认删除',
    action: async () => {
      try {
        await adminArticleAPI.deleteArticle(id)
        await fetchArticles()
        showModal({
          type: 'success',
          title: '删除成功',
          message: '文章已从系统中移除。'
        })
      } catch (error) {
        console.error('Failed to delete article:', error)
        showModal({
          type: 'error',
          title: '删除失败',
          message: '无法删除该文章，请检查权限。'
        })
      }
    }
  })
}

watch(filterStatus, () => {
  currentPage.value = 1
  fetchArticles()
})

onMounted(async () => {
  if (!isAuthenticated.value) {
    return
  }
  
  // 等待获取用户信息
  const { getCurrentUser } = useAuth()
  await getCurrentUser()
  
  if (isAdmin.value) {
    fetchArticles()
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

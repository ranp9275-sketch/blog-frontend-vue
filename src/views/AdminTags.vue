<template>
  <div>
    <div class="flex items-center justify-between mb-8 flex-wrap gap-4">
      <h1 class="text-3xl font-bold dark:text-white">管理后台</h1>
    </div>

    <!-- 管理导航 -->
    <div class="mb-8 flex flex-wrap gap-4">
      <router-link
        to="/admin/articles"
        class="px-6 py-3 rounded-lg font-semibold transition bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
      >
        📝 文章管理
      </router-link>
      <router-link
        to="/admin/categories"
        class="px-6 py-3 rounded-lg font-semibold transition bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
      >
        📁 分类管理
      </router-link>
      <router-link
        to="/admin/tags"
        class="px-6 py-3 rounded-lg font-semibold transition bg-primary text-white"
      >
        🏷️ 标签管理
      </router-link>
      <router-link
        to="/admin/users"
        class="px-6 py-3 rounded-lg font-semibold transition bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
      >
        👥 用户管理
      </router-link>
    </div>

    <div class="flex items-center justify-between mb-6 flex-wrap gap-4">
      <h2 class="text-xl font-bold dark:text-white">标签列表</h2>
      <button
        @click="openModal()"
        class="bg-primary hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition"
      >
        + 新建标签
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <!-- 标签列表 -->
    <div v-else-if="tags.length > 0" class="flex flex-wrap gap-4">
      <div
        v-for="tag in tags"
        :key="tag.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-md px-4 py-3 flex items-center gap-3"
      >
        <span class="text-primary font-semibold">#{{ tag.name }}</span>
        <span class="text-gray-400 text-sm">{{ tag.slug }}</span>
        <button
          @click="openModal(tag)"
          class="text-gray-500 hover:text-primary text-sm"
        >
          编辑
        </button>
        <button
          @click="deleteTag(tag.id)"
          class="text-red-500 hover:text-red-600 text-sm"
        >
          删除
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-center">
      <p class="text-gray-600 dark:text-gray-400 text-lg">暂无标签</p>
    </div>

    <!-- 模态框 -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 class="text-xl font-bold mb-4 dark:text-white">
          {{ editingTag ? '编辑标签' : '新建标签' }}
        </h2>
        <form @submit.prevent="saveTag" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-1 dark:text-gray-300">名称 *</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="标签名称"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1 dark:text-gray-300">Slug</label>
            <input
              v-model="form.slug"
              type="text"
              placeholder="tag-slug"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
          <div class="flex gap-3 justify-end">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="bg-primary hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              {{ saving ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useRouter } from 'vue-router'
import api from '../api/index'

const router = useRouter()
const { isAuthenticated, user } = useAuth()

const tags = ref([])
const loading = ref(false)
const showModal = ref(false)
const editingTag = ref(null)
const saving = ref(false)
const error = ref('')

const form = ref({
  name: '',
  slug: ''
})

const fetchTags = async () => {
  loading.value = true
  try {
    const response = await api.get('/tags')
    tags.value = response.data || []
  } catch (err) {
    console.error('Failed to fetch tags:', err)
  } finally {
    loading.value = false
  }
}

const openModal = (tag = null) => {
  editingTag.value = tag
  if (tag) {
    form.value = {
      name: tag.name,
      slug: tag.slug || ''
    }
  } else {
    form.value = { name: '', slug: '' }
  }
  error.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingTag.value = null
}

const saveTag = async () => {
  if (!form.value.name) {
    error.value = '名称不能为空'
    return
  }
  saving.value = true
  error.value = ''
  try {
    if (editingTag.value) {
      await api.put(`/admin/tags/${editingTag.value.id}`, form.value)
    } else {
      await api.post('/admin/tags', form.value)
    }
    closeModal()
    await fetchTags()
  } catch (err) {
    error.value = err.response?.data?.error || '保存失败'
  } finally {
    saving.value = false
  }
}

const deleteTag = async (id) => {
  if (!confirm('确定要删除这个标签吗？')) return
  try {
    await api.delete(`/admin/tags/${id}`)
    await fetchTags()
  } catch (err) {
    alert('删除失败')
  }
}

onMounted(async () => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }
  
  // 等待获取用户信息
  const { getCurrentUser } = useAuth()
  await getCurrentUser()
  
  if (user.value?.role !== 'admin') {
    router.push('/')
    return
  }
  
  fetchTags()
})
</script>

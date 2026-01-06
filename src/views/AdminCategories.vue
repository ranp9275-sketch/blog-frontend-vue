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
        class="px-6 py-3 rounded-lg font-semibold transition bg-primary text-white"
      >
        📁 分类管理
      </router-link>
      <router-link
        to="/admin/tags"
        class="px-6 py-3 rounded-lg font-semibold transition bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
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
      <h2 class="text-xl font-bold dark:text-white">分类列表 ({{ categories.length }})</h2>
      <button
        @click="openModal()"
        class="bg-primary hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition"
      >
        + 新建分类
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <!-- 分类列表 -->
    <div v-else-if="categories.length > 0" class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">名称</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Slug</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">描述</th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="category in categories" :key="category.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td class="px-6 py-4">
              <span class="text-primary font-semibold">{{ category.name }}</span>
            </td>
            <td class="px-6 py-4 text-gray-500 dark:text-gray-400">{{ category.slug || '-' }}</td>
            <td class="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">{{ category.desc || '-' }}</td>
            <td class="px-6 py-4 text-right">
              <button
                @click="openModal(category)"
                class="text-primary hover:text-green-600 px-3 py-1 transition"
              >
                编辑
              </button>
              <button
                @click="confirmDelete(category)"
                :disabled="deleting === category.id"
                class="text-red-500 hover:text-red-600 px-3 py-1 transition disabled:opacity-50"
              >
                {{ deleting === category.id ? '删除中...' : '删除' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 空状态 -->
    <div v-else class="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-center">
      <p class="text-gray-600 dark:text-gray-400 text-lg">暂无分类</p>
    </div>

    <!-- 编辑/新建模态框 -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="closeModal">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 class="text-xl font-bold mb-4 dark:text-white">
          {{ editingCategory ? '编辑分类' : '新建分类' }}
        </h2>
        <form @submit.prevent="saveCategory" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-1 dark:text-gray-300">名称 *</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="分类名称"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1 dark:text-gray-300">Slug</label>
            <input
              v-model="form.slug"
              type="text"
              placeholder="category-slug"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1 dark:text-gray-300">描述</label>
            <textarea
              v-model="form.desc"
              rows="3"
              placeholder="分类描述"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-700 dark:text-white"
            ></textarea>
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

    <!-- 删除确认模态框 -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="cancelDelete">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6">
        <div class="text-center">
          <div class="text-5xl mb-4">⚠️</div>
          <h3 class="text-lg font-bold mb-2 dark:text-white">确认删除</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            确定要删除分类 <span class="text-primary font-semibold">{{ categoryToDelete?.name }}</span> 吗？<br>
            <span class="text-sm text-red-500">此操作不可恢复，该分类下的文章将失去分类</span>
          </p>
          <div class="flex gap-3 justify-center">
            <button
              @click="cancelDelete"
              class="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              取消
            </button>
            <button
              @click="deleteCategory"
              :disabled="deleting"
              class="px-6 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition"
            >
              {{ deleting ? '删除中...' : '确认删除' }}
            </button>
          </div>
        </div>
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

const categories = ref([])
const loading = ref(false)
const showModal = ref(false)
const editingCategory = ref(null)
const saving = ref(false)
const error = ref('')
const deleting = ref(null)
const showDeleteModal = ref(false)
const categoryToDelete = ref(null)

const form = ref({
  name: '',
  slug: '',
  desc: ''
})

const fetchCategories = async () => {
  loading.value = true
  try {
    const response = await api.get('/categories')
    categories.value = response.data || []
  } catch (err) {
    console.error('Failed to fetch categories:', err)
  } finally {
    loading.value = false
  }
}

const openModal = (category = null) => {
  editingCategory.value = category
  if (category) {
    form.value = {
      name: category.name,
      slug: category.slug || '',
      desc: category.desc || ''
    }
  } else {
    form.value = { name: '', slug: '', desc: '' }
  }
  error.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingCategory.value = null
}

const saveCategory = async () => {
  if (!form.value.name) {
    error.value = '名称不能为空'
    return
  }
  saving.value = true
  error.value = ''
  try {
    if (editingCategory.value) {
      await api.put(`/admin/categories/${editingCategory.value.id}`, form.value)
    } else {
      await api.post('/admin/categories', form.value)
    }
    closeModal()
    await fetchCategories()
  } catch (err) {
    error.value = err.response?.data?.error || '保存失败'
  } finally {
    saving.value = false
  }
}

const confirmDelete = (category) => {
  categoryToDelete.value = category
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  categoryToDelete.value = null
}

const deleteCategory = async () => {
  if (!categoryToDelete.value) return
  deleting.value = categoryToDelete.value.id
  try {
    await api.delete(`/admin/categories/${categoryToDelete.value.id}`)
    showDeleteModal.value = false
    categoryToDelete.value = null
    await fetchCategories()
  } catch (err) {
    alert(err.response?.data?.error || '删除失败')
  } finally {
    deleting.value = null
  }
}

onMounted(async () => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }
  
  const { getCurrentUser } = useAuth()
  await getCurrentUser()
  
  if (user.value?.role !== 'admin') {
    router.push('/')
    return
  }
  
  fetchCategories()
})
</script>

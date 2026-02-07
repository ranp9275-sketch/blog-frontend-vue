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
      <router-link
        to="/admin/donation"
        class="px-6 py-3 rounded-lg font-semibold transition bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
      >
        ☕ 打赏管理
      </router-link>
    </div>

    <div class="flex items-center justify-between mb-6 flex-wrap gap-4">
      <h2 class="text-xl font-bold dark:text-white">分类列表 ({{ categories.length }})</h2>
      <button
        @click="openEditModal()"
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
                @click="openEditModal(category)"
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

    <!-- 编辑分类弹窗 -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="closeEditModal">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-xl font-bold dark:text-white">
            {{ editingCategory ? '编辑分类' : '新建分类' }}
          </h3>
          <button @click="closeEditModal" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl">&times;</button>
        </div>
        <div class="p-6 space-y-4">
          <div v-if="error" class="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg">
            {{ error }}
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">名称 *</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="分类名称"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Slug</label>
            <input
              v-model="form.slug"
              type="text"
              placeholder="URL 友好标识"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">描述</label>
            <textarea
              v-model="form.desc"
              rows="3"
              placeholder="分类描述（可选）"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            ></textarea>
          </div>
        </div>
        <div class="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            @click="closeEditModal"
            class="px-4 py-2 rounded-lg font-semibold transition bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            取消
          </button>
          <button
            @click="saveCategory"
            :disabled="saving"
            class="px-4 py-2 rounded-lg font-semibold transition bg-primary hover:bg-green-600 text-white disabled:opacity-50"
          >
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 确认弹窗 -->
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
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useRouter } from 'vue-router'
import api from '../api/index'
import Modal from '../components/Modal.vue'

const router = useRouter()
const { isAuthenticated, user } = useAuth()

const categories = ref([])
const loading = ref(false)
const showEditModal = ref(false)
const editingCategory = ref(null)
const saving = ref(false)
const deleting = ref(null)
const error = ref('')

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

const openEditModal = (category = null) => {
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
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
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
    closeEditModal()
    await fetchCategories()
    showModal({
      type: 'success',
      title: '保存成功',
      message: '分类已成功更新！'
    })
  } catch (err) {
    error.value = err.response?.data?.error || '保存失败'
  } finally {
    saving.value = false
  }
}

const confirmDelete = (category) => {
  showModal({
    type: 'error',
    title: '确认删除',
    message: `确定要删除分类 "${category.name}" 吗？此操作不可恢复，该分类下的文章将失去分类。`,
    showCancel: true,
    confirmText: '确认删除',
    action: async () => {
      try {
        await api.delete(`/admin/categories/${category.id}`)
        await fetchCategories()
        showModal({
          type: 'success',
          title: '删除成功',
          message: '分类已成功移除。'
        })
      } catch (err) {
        showModal({
          type: 'error',
          title: '删除失败',
          message: err.response?.data?.error || '无法删除该分类。'
        })
      }
    }
  })
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

<template>
  <div>
    <h1 class="text-3xl font-bold mb-8 dark:text-white">管理后台</h1>

    <!-- 权限检查 -->
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
          class="px-6 py-3 rounded-lg font-semibold transition bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          🏷️ 标签管理
        </router-link>
        <router-link
          to="/admin/users"
          class="px-6 py-3 rounded-lg font-semibold transition bg-primary text-white"
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

      <!-- 搜索 -->
      <div class="mb-6 flex gap-4 flex-wrap">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索用户名或邮箱..."
          class="flex-1 min-w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-800 dark:text-white"
          @keyup.enter="fetchUsers"
        />
        <button
          @click="fetchUsers"
          class="bg-primary hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          搜索
        </button>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- 用户列表 -->
      <div v-else-if="users.length > 0" class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">用户</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">邮箱</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">角色</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">注册时间</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="u in users" :key="u.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <img
                    v-if="u.avatar"
                    :src="u.avatar"
                    class="w-10 h-10 rounded-full object-cover"
                  />
                  <div v-else class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    {{ u.name?.charAt(0)?.toUpperCase() || '?' }}
                  </div>
                  <span class="font-semibold dark:text-white">{{ u.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-gray-600 dark:text-gray-400">{{ u.email }}</td>
              <td class="px-6 py-4">
                <span :class="[
                  'px-2 py-1 rounded text-xs font-semibold',
                  u.role === 'admin' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                ]">
                  {{ u.role === 'admin' ? '管理员' : '用户' }}
                </span>
              </td>
              <td class="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">{{ formatDate(u.created_at) }}</td>
              <td class="px-6 py-4">
                <div class="flex gap-2">
                  <button
                    v-if="u.role !== 'admin'"
                    @click="setRole(u.id, 'admin')"
                    class="text-yellow-600 hover:text-yellow-700 text-sm"
                  >
                    设为管理员
                  </button>
                  <button
                    v-else-if="u.id !== currentUserId"
                    @click="setRole(u.id, 'user')"
                    class="text-gray-600 hover:text-gray-700 text-sm"
                  >
                    取消管理员
                  </button>
                  <button
                    v-if="u.id !== currentUserId"
                    @click="deleteUser(u.id)"
                    class="text-red-500 hover:text-red-600 text-sm"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 空状态 -->
      <div v-else class="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-center">
        <p class="text-gray-600 dark:text-gray-400 text-lg">暂无用户</p>
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
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import api from '../api/index'
import dayjs from 'dayjs'
import Modal from '../components/Modal.vue'

const { isAuthenticated, user, getCurrentUser } = useAuth()

const isAdmin = computed(() => user.value?.role === 'admin')
const currentUserId = computed(() => user.value?.id)

const users = ref([])
const loading = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const totalPages = ref(1)

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

const formatDate = (date) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await api.get('/admin/users', {
      params: {
        page: currentPage.value,
        pageSize: 20,
        q: searchQuery.value || undefined
      }
    })
    users.value = response.data.data || []
    totalPages.value = Math.ceil((response.data.total || 0) / 20)
  } catch (err) {
    console.error('Failed to fetch users:', err)
    users.value = []
  } finally {
    loading.value = false
  }
}

const goToPage = (page) => {
  currentPage.value = page
  fetchUsers()
}

const setRole = async (userId, role) => {
  const action = role === 'admin' ? '设为管理员' : '取消管理员权限'
  
  showModal({
    type: 'warning',
    title: '确认操作',
    message: `确定要${action}吗？`,
    showCancel: true,
    confirmText: '确认',
    action: async () => {
      try {
        await api.put(`/admin/users/${userId}/role`, { role })
        await fetchUsers()
        showModal({
          type: 'success',
          title: '操作成功',
          message: `已${action}。`
        })
      } catch (err) {
        console.error('Failed to update role:', err)
        showModal({
          type: 'error',
          title: '操作失败',
          message: '无法更新用户角色，请稍后重试。'
        })
      }
    }
  })
}

const deleteUser = async (userId) => {
  showModal({
    type: 'error',
    title: '确认删除',
    message: '确定要删除这个用户吗？此操作不可恢复！',
    showCancel: true,
    confirmText: '确认删除',
    action: async () => {
      try {
        await api.delete(`/admin/users/${userId}`)
        await fetchUsers()
        showModal({
          type: 'success',
          title: '删除成功',
          message: '用户已从系统中移除。'
        })
      } catch (err) {
        console.error('Failed to delete user:', err)
        showModal({
          type: 'error',
          title: '删除失败',
          message: '无法删除该用户，请稍后重试。'
        })
      }
    }
  })
}

onMounted(async () => {
  if (isAuthenticated.value) {
    await getCurrentUser()
    if (isAdmin.value) {
      fetchUsers()
    }
  }
})
</script>

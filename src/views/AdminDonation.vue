<template>
  <div>
    <div class="flex items-center justify-between mb-8 flex-wrap gap-4">
      <h1 class="text-3xl font-bold dark:text-white">打赏管理</h1>
      <button
        @click="openCreateModal"
        class="bg-primary hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition"
      >
        + 添加二维码
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <!-- 二维码列表 -->
    <div v-else-if="qrcodes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="qr in qrcodes"
        :key="qr.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <span class="text-2xl">{{ getIcon(qr.icon) }}</span>
            <div>
              <h3 class="font-bold dark:text-white">{{ qr.name }}</h3>
              <span :class="qr.enabled ? 'text-green-500' : 'text-gray-400'" class="text-xs">
                {{ qr.enabled ? '已启用' : '已禁用' }}
              </span>
            </div>
          </div>
          <span class="text-gray-400 text-sm">排序: {{ qr.sort_order }}</span>
        </div>

        <!-- 二维码预览 -->
        <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4 flex justify-center">
          <img :src="getFullUrl(qr.qrcode_url)" :alt="qr.name" class="w-32 h-32 object-contain" />
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-2">
          <button
            @click="toggleEnabled(qr)"
            :class="qr.enabled ? 'bg-gray-500 hover:bg-gray-600' : 'bg-green-500 hover:bg-green-600'"
            class="flex-1 text-white px-3 py-2 rounded text-sm transition"
          >
            {{ qr.enabled ? '禁用' : '启用' }}
          </button>
          <button
            @click="openEditModal(qr)"
            class="flex-1 bg-primary hover:bg-green-600 text-white px-3 py-2 rounded text-sm transition"
          >
            编辑
          </button>
          <button
            @click="confirmDelete(qr)"
            class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm transition"
          >
            删除
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-center">
      <p class="text-gray-600 dark:text-gray-400 text-lg mb-4">还没有添加打赏二维码</p>
      <button
        @click="openCreateModal"
        class="bg-primary hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition"
      >
        添加第一个二维码
      </button>
    </div>

    <!-- 创建/编辑弹窗 -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md my-8">
        <div class="sticky top-0 bg-white dark:bg-gray-800 px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
          <h3 class="text-xl font-bold dark:text-white">
            {{ editingQR ? '编辑二维码' : '添加二维码' }}
          </h3>
        </div>

        <form @submit.prevent="saveQRCode" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">支付方式名称</label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="如：微信、支付宝"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">图标类型</label>
            <select
              v-model="form.icon"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-700 dark:text-white"
            >
              <option value="wechat">💚 微信</option>
              <option value="alipay">💙 支付宝</option>
              <option value="qq">🐧 QQ</option>
              <option value="paypal">💳 PayPal</option>
              <option value="default">💰 其他</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">二维码图片</label>
            <ImageUpload v-model="form.qrcode_url" max-height="180px" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">排序（数字越小越靠前）</label>
            <input
              v-model.number="form.sort_order"
              type="number"
              min="0"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div class="flex items-center gap-2">
            <input
              v-model="form.enabled"
              type="checkbox"
              id="enabled"
              class="w-4 h-4 text-primary"
            />
            <label for="enabled" class="text-sm text-gray-700 dark:text-gray-300">启用</label>
          </div>

          <div class="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              @click="showModal = false"
              class="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg transition"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="saving || !form.qrcode_url"
              class="flex-1 bg-primary hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              {{ saving ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6">
        <h3 class="text-xl font-bold mb-4 dark:text-white">确认删除</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          确定要删除 "{{ qrToDelete?.name }}" 吗？
        </p>
        <div class="flex gap-3">
          <button
            @click="showDeleteModal = false"
            class="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 transition"
          >
            取消
          </button>
          <button
            @click="deleteQRCode"
            :disabled="deleting"
            class="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            {{ deleting ? '删除中...' : '删除' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import api from '../api/index'
import ImageUpload from '../components/ImageUpload.vue'

const { user, getCurrentUser } = useAuth()

const qrcodes = ref([])
const loading = ref(false)
const showModal = ref(false)
const editingQR = ref(null)
const saving = ref(false)

const showDeleteModal = ref(false)
const qrToDelete = ref(null)
const deleting = ref(false)

const form = ref({
  name: '',
  icon: 'wechat',
  qrcode_url: '',
  sort_order: 0,
  enabled: true
})

const getIcon = (icon) => {
  const icons = {
    wechat: '💚',
    alipay: '💙',
    qq: '🐧',
    paypal: '💳',
    default: '💰'
  }
  return icons[icon] || icons.default
}

const getFullUrl = (url) => {
  if (!url) return ''
  // 直接返回路径，让 vite proxy 或 nginx 处理
  return url
}

const fetchQRCodes = async () => {
  loading.value = true
  try {
    const response = await api.get('/admin/donation/qrcodes')
    qrcodes.value = response.data || []
  } catch (err) {
    console.error('Failed to fetch qrcodes:', err)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  editingQR.value = null
  form.value = {
    name: '',
    icon: 'wechat',
    qrcode_url: '',
    sort_order: 0,
    enabled: true
  }
  showModal.value = true
}

const openEditModal = (qr) => {
  editingQR.value = qr
  form.value = {
    name: qr.name,
    icon: qr.icon,
    qrcode_url: qr.qrcode_url,
    sort_order: qr.sort_order,
    enabled: qr.enabled
  }
  showModal.value = true
}

const saveQRCode = async () => {
  saving.value = true
  try {
    if (editingQR.value) {
      await api.put(`/admin/donation/qrcodes/${editingQR.value.id}`, form.value)
    } else {
      await api.post('/admin/donation/qrcodes', form.value)
    }
    showModal.value = false
    await fetchQRCodes()
  } catch (err) {
    console.error('Failed to save qrcode:', err)
    alert('保存失败')
  } finally {
    saving.value = false
  }
}

const toggleEnabled = async (qr) => {
  try {
    await api.put(`/admin/donation/qrcodes/${qr.id}`, { enabled: !qr.enabled })
    await fetchQRCodes()
  } catch (err) {
    console.error('Failed to toggle qrcode:', err)
  }
}

const confirmDelete = (qr) => {
  qrToDelete.value = qr
  showDeleteModal.value = true
}

const deleteQRCode = async () => {
  if (!qrToDelete.value) return
  deleting.value = true
  try {
    await api.delete(`/admin/donation/qrcodes/${qrToDelete.value.id}`)
    showDeleteModal.value = false
    qrToDelete.value = null
    await fetchQRCodes()
  } catch (err) {
    console.error('Failed to delete qrcode:', err)
    alert('删除失败')
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  await getCurrentUser()
  if (user.value?.role === 'admin') {
    fetchQRCodes()
  }
})
</script>

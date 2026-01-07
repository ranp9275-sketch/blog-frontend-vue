<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
      <!-- 头部 -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-xl font-bold dark:text-white flex items-center gap-2">
          <span>☕</span> 请作者喝杯咖啡
        </h3>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl">&times;</button>
      </div>

      <!-- 内容 -->
      <div class="p-6">
        <!-- 加载状态 -->
        <div v-if="loading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>

        <!-- 无二维码 -->
        <div v-else-if="qrcodes.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
          暂未配置打赏方式
        </div>

        <!-- 二维码列表 -->
        <div v-else>
          <!-- 支付方式选择 -->
          <div class="flex justify-center gap-4 mb-6">
            <button
              v-for="qr in qrcodes"
              :key="qr.id"
              @click="selectedQR = qr"
              :class="[
                'flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition',
                selectedQR?.id === qr.id
                  ? getActiveClass(qr.icon)
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              ]"
            >
              <span>{{ getIcon(qr.icon) }}</span>
              {{ qr.name }}
            </button>
          </div>

          <!-- 二维码展示 -->
          <div v-if="selectedQR" class="text-center">
            <div class="bg-white p-4 rounded-lg inline-block shadow-md">
              <img :src="getFullUrl(selectedQR.qrcode_url)" :alt="selectedQR.name" class="w-48 h-48 object-contain" />
            </div>
            <p class="mt-4 text-gray-600 dark:text-gray-400 text-sm">
              使用 {{ selectedQR.name }} 扫码打赏
            </p>
          </div>
        </div>

        <!-- 感谢语 -->
        <p class="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
          感谢您的支持，这将是我持续创作的动力！❤️
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import api from '../api/index'

const props = defineProps({
  show: Boolean
})

defineEmits(['close'])

const qrcodes = ref([])
const selectedQR = ref(null)
const loading = ref(false)

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

const getActiveClass = (icon) => {
  const classes = {
    wechat: 'bg-green-500 text-white',
    alipay: 'bg-blue-500 text-white',
    qq: 'bg-sky-500 text-white',
    paypal: 'bg-indigo-500 text-white',
    default: 'bg-primary text-white'
  }
  return classes[icon] || classes.default
}

const getFullUrl = (url) => {
  if (!url) return ''
  // 直接返回路径，让 vite proxy 或 nginx 处理
  return url
}

const fetchQRCodes = async () => {
  loading.value = true
  try {
    const response = await api.get('/donation/qrcodes')
    qrcodes.value = response.data || []
    if (qrcodes.value.length > 0) {
      selectedQR.value = qrcodes.value[0]
    }
  } catch (err) {
    console.error('Failed to fetch donation qrcodes:', err)
  } finally {
    loading.value = false
  }
}

watch(() => props.show, (newVal) => {
  if (newVal && qrcodes.value.length === 0) {
    fetchQRCodes()
  }
})

onMounted(() => {
  if (props.show) {
    fetchQRCodes()
  }
})
</script>

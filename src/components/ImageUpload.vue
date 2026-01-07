<template>
  <div class="image-upload">
    <!-- 预览区域 -->
    <div
      v-if="previewUrl"
      class="relative inline-block"
    >
      <img
        :src="fullUrl"
        :alt="alt"
        class="max-w-full rounded-lg border border-gray-300 dark:border-gray-600"
        :style="{ maxHeight: maxHeight }"
        @error="handleImageError"
      />
      <button
        v-if="!disabled"
        @click="clearImage"
        type="button"
        class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-md transition"
        title="删除图片"
      >
        ×
      </button>
      <!-- 重新上传按钮 -->
      <button
        v-if="!disabled"
        @click="triggerUpload"
        type="button"
        class="absolute bottom-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded px-2 py-1 text-xs transition"
      >
        更换图片
      </button>
    </div>

    <!-- 上传区域 -->
    <div
      v-else
      @click="triggerUpload"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      :class="[
        'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition',
        isDragging
          ? 'border-primary bg-green-50 dark:bg-green-900/20'
          : 'border-gray-300 dark:border-gray-600 hover:border-primary',
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      ]"
    >
      <div v-if="uploading" class="flex flex-col items-center gap-2">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span class="text-sm text-gray-500 dark:text-gray-400">上传中...</span>
      </div>
      <div v-else class="flex flex-col items-center gap-2">
        <span class="text-3xl">📷</span>
        <span class="text-sm text-gray-600 dark:text-gray-400">
          点击或拖拽图片到此处上传
        </span>
        <span class="text-xs text-gray-400">
          支持 JPG、PNG、GIF、WebP，最大 5MB
        </span>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/gif,image/webp"
      class="hidden"
      :disabled="disabled"
      @change="handleFileSelect"
    />

    <!-- 错误提示 -->
    <p v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import api from '../api/index'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: '已上传图片'
  },
  maxHeight: {
    type: String,
    default: '200px'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const uploading = ref(false)
const isDragging = ref(false)
const error = ref('')
const previewUrl = ref(props.modelValue)
const imageLoadError = ref(false)

// 计算完整URL
const fullUrl = computed(() => {
  if (!previewUrl.value) return ''
  if (imageLoadError.value) return ''
  // 直接返回路径，让 vite proxy 或 nginx 处理
  return previewUrl.value
})

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  previewUrl.value = newVal
  imageLoadError.value = false
})

const handleImageError = () => {
  imageLoadError.value = true
  error.value = '图片加载失败，请重新上传'
}

const triggerUpload = () => {
  if (!props.disabled) {
    fileInput.value?.click()
  }
}

const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    uploadFile(file)
  }
}

const handleDrop = (event) => {
  isDragging.value = false
  if (props.disabled) return
  
  const file = event.dataTransfer.files?.[0]
  if (file && file.type.startsWith('image/')) {
    uploadFile(file)
  } else {
    error.value = '请上传图片文件'
  }
}

const uploadFile = async (file) => {
  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    error.value = '不支持的文件类型'
    return
  }

  // 验证文件大小 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    error.value = '文件大小不能超过 5MB'
    return
  }

  error.value = ''
  imageLoadError.value = false
  uploading.value = true

  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    const url = response.data.url
    previewUrl.value = url
    emit('update:modelValue', url)
  } catch (err) {
    console.error('Upload failed:', err)
    error.value = err.response?.data?.error || '上传失败，请重试'
  } finally {
    uploading.value = false
    // 清空 input 以便重复上传同一文件
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const clearImage = () => {
  previewUrl.value = ''
  imageLoadError.value = false
  error.value = ''
  emit('update:modelValue', '')
}
</script>

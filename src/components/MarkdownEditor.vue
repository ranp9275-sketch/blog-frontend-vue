<template>
  <div class="markdown-editor">
    <!-- 工具栏 -->
    <div class="toolbar bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-t-lg p-2 flex items-center gap-2">
      <button
        type="button"
        @click="triggerImageUpload"
        class="px-3 py-1 bg-primary hover:bg-green-600 text-white rounded text-sm font-semibold transition flex items-center gap-1"
        title="上传图片"
      >
        <span>🖼️</span>
        <span>插入图片</span>
      </button>
      <input
        ref="imageInput"
        type="file"
        accept="image/*"
        @change="handleImageSelect"
        class="hidden"
      />
      <span class="text-xs text-gray-500 dark:text-gray-400 ml-2">
        支持：点击上传 | 拖拽图片 | 粘贴图片
      </span>
      <div v-if="uploading" class="ml-auto flex items-center gap-2 text-sm text-primary">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span>上传中...</span>
      </div>
    </div>

    <!-- 文本编辑区 -->
    <div class="relative">
      <textarea
        ref="textarea"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        @drop="handleDrop"
        @dragover.prevent
        @paste="handlePaste"
        :rows="rows"
        :placeholder="placeholder"
        class="w-full px-4 py-3 border-2 border-t-0 border-gray-300 dark:border-gray-600 rounded-b-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-800 dark:text-white resize-y"
      ></textarea>
      
      <!-- 拖拽提示 -->
      <div
        v-if="isDragging"
        class="absolute inset-0 bg-primary bg-opacity-10 border-4 border-dashed border-primary rounded-b-lg flex items-center justify-center pointer-events-none"
      >
        <div class="bg-white dark:bg-gray-800 px-6 py-4 rounded-lg shadow-lg">
          <p class="text-lg font-bold text-primary">📷 释放以上传图片</p>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="uploadError" class="mt-2 text-red-500 text-sm">
      ❌ {{ uploadError }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../api/index'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  rows: {
    type: Number,
    default: 15
  },
  placeholder: {
    type: String,
    default: '使用 Markdown 编写文章内容...'
  }
})

const emit = defineEmits(['update:modelValue'])

const textarea = ref(null)
const imageInput = ref(null)
const uploading = ref(false)
const uploadError = ref('')
const isDragging = ref(false)

// 触发文件选择
const triggerImageUpload = () => {
  imageInput.value.click()
}

// 处理文件选择
const handleImageSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    uploadImage(file)
  }
  // 清空input，允许重复上传同一文件
  event.target.value = ''
}

// 处理拖拽
const handleDrop = (event) => {
  event.preventDefault()
  isDragging.value = false
  
  const files = event.dataTransfer.files
  if (files.length > 0) {
    const file = files[0]
    if (file.type.startsWith('image/')) {
      uploadImage(file)
    } else {
      uploadError.value = '请上传图片文件'
      setTimeout(() => uploadError.value = '', 3000)
    }
  }
}

// 处理粘贴
const handlePaste = (event) => {
  const items = event.clipboardData.items
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      event.preventDefault()
      const file = items[i].getAsFile()
      uploadImage(file)
      break
    }
  }
}

// 上传图片
const uploadImage = async (file) => {
  // 验证文件大小 (最大5MB)
  if (file.size > 5 * 1024 * 1024) {
    uploadError.value = '图片大小不能超过 5MB'
    setTimeout(() => uploadError.value = '', 3000)
    return
  }

  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    uploadError.value = '只支持 JPG, PNG, GIF, WebP 格式'
    setTimeout(() => uploadError.value = '', 3000)
    return
  }

  uploading.value = true
  uploadError.value = ''

  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (response.data && response.data.url) {
      insertImageMarkdown(response.data.url, file.name)
    }
  } catch (error) {
    console.error('图片上传失败:', error)
    uploadError.value = error.response?.data?.error || '图片上传失败，请重试'
    setTimeout(() => uploadError.value = '', 3000)
  } finally {
    uploading.value = false
  }
}

// 插入Markdown图片语法
const insertImageMarkdown = (url, filename) => {
  const imageMarkdown = `![${filename}](${url})`
  const textareaEl = textarea.value
  const start = textareaEl.selectionStart
  const end = textareaEl.selectionEnd
  const text = props.modelValue || ''
  
  // 在光标位置插入图片
  const newText = text.substring(0, start) + imageMarkdown + text.substring(end)
  emit('update:modelValue', newText)
  
  // 恢复焦点并设置光标位置
  setTimeout(() => {
    textareaEl.focus()
    const newCursorPos = start + imageMarkdown.length
    textareaEl.setSelectionRange(newCursorPos, newCursorPos)
  }, 0)
}

// 监听拖拽进入
const handleDragEnter = () => {
  isDragging.value = true
}

// 监听拖拽离开
const handleDragLeave = () => {
  isDragging.value = false
}
</script>

<style scoped>
.markdown-editor {
  @apply w-full;
}

textarea {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>

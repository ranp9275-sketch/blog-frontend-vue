<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col">
      <!-- 头部 -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-xl font-bold dark:text-white flex items-center gap-2">
          <span>📄</span> PDF预览
        </h3>
        <div class="flex items-center gap-3">
          <a 
            :href="pdfUrl" 
            download 
            class="text-primary hover:text-green-600 font-semibold transition"
          >
            下载PDF
          </a>
          <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl">
            &times;
          </button>
        </div>
      </div>

      <!-- PDF内容 -->
      <div class="flex-1 overflow-auto p-4 bg-gray-100 dark:bg-gray-900">
        <div v-if="loading" class="flex justify-center items-center h-full">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p class="text-gray-600 dark:text-gray-400">加载PDF中...</p>
          </div>
        </div>

        <div v-else-if="error" class="flex justify-center items-center h-full">
          <div class="text-center text-red-500">
            <p class="text-lg mb-2">❌ PDF加载失败</p>
            <p class="text-sm">{{ error }}</p>
            <a :href="pdfUrl" download class="mt-4 inline-block bg-primary text-white px-4 py-2 rounded">
              下载PDF文件
            </a>
          </div>
        </div>

        <div v-else class="max-w-4xl mx-auto">
          <VuePdfEmbed 
            :source="pdfUrl" 
            @loaded="onLoaded"
            @loading-failed="onLoadingFailed"
            class="shadow-lg"
          />
        </div>
      </div>

      <!-- 页面信息 -->
      <div v-if="!loading && !error && pageCount > 0" class="p-3 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
        共 {{ pageCount }} 页
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import VuePdfEmbed from 'vue-pdf-embed'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  pdfUrl: {
    type: String,
    required: true
  }
})

defineEmits(['close'])

const loading = ref(true)
const error = ref(null)
const pageCount = ref(0)

const onLoaded = (pdf) => {
  loading.value = false
  pageCount.value = pdf.numPages
}

const onLoadingFailed = (err) => {
  loading.value = false
  error.value = err.message || '无法加载PDF文件'
}

// 当显示状态改变时重置状态
watch(() => props.show, (newVal) => {
  if (newVal) {
    loading.value = true
    error.value = null
    pageCount.value = 0
  }
})
</script>

<style scoped>
/* 确保PDF在容器中正确显示 */
:deep(.vue-pdf-embed) {
  max-width: 100%;
}

:deep(.vue-pdf-embed > div) {
  margin-bottom: 1rem;
}
</style>

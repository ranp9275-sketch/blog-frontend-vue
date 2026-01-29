<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
      <!-- 头部 -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-xl font-bold dark:text-white flex items-center gap-2">
          <span>{{ getIcon(type) }}</span>
          {{ title }}
        </h3>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl">&times;</button>
      </div>

      <!-- 内容 -->
      <div class="p-6">
        <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line">{{ message }}</p>
      </div>

      <!-- 底部按钮 -->
      <div class="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          v-if="showCancel"
          @click="$emit('close')"
          class="px-4 py-2 rounded-lg font-semibold transition bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          取消
        </button>
        <button
          @click="$emit('confirm')"
          :class="getButtonClass(type)"
          class="px-4 py-2 rounded-lg font-semibold transition"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
  },
  title: {
    type: String,
    default: '提示'
  },
  message: {
    type: String,
    default: ''
  },
  showCancel: {
    type: Boolean,
    default: false
  },
  confirmText: {
    type: String,
    default: '确定'
  }
})

defineEmits(['close', 'confirm'])

const getIcon = (type) => {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  }
  return icons[type] || icons.info
}

const getButtonClass = (type) => {
  const classes = {
    info: 'bg-blue-500 hover:bg-blue-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    error: 'bg-red-500 hover:bg-red-600 text-white'
  }
  return classes[type] || classes.info
}
</script>

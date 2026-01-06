<template>
  <div>
    <h1 class="text-4xl font-bold mb-8 dark:text-white">分类</h1>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <!-- 分类列表 -->
    <div v-else-if="categories.length > 0" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="category in categories"
        :key="category.id"
        @click="goToCategory(category.id)"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg cursor-pointer transition"
      >
        <h3 class="text-xl font-bold mb-2 text-primary">{{ category.name }}</h3>
        <p class="text-gray-600 dark:text-gray-400">{{ category.desc || '暂无描述' }}</p>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-center">
      <p class="text-gray-600 dark:text-gray-400 text-lg">暂无分类</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { categoryAPI } from '../api/index'

const router = useRouter()
const categories = ref([])
const loading = ref(true)

const fetchCategories = async () => {
  loading.value = true
  try {
    const response = await categoryAPI.getCategories()
    categories.value = response.data || []
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    categories.value = []
  } finally {
    loading.value = false
  }
}

const goToCategory = (id) => {
  router.push(`/?category=${id}`)
}

onMounted(() => {
  fetchCategories()
})
</script>

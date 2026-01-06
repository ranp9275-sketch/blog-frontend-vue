<template>
  <div>
    <h1 class="text-4xl font-bold mb-8 dark:text-white">标签</h1>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <!-- 标签列表 -->
    <div v-else-if="tags.length > 0" class="flex flex-wrap gap-4">
      <button
        v-for="tag in tags"
        :key="tag.id"
        @click="goToTag(tag.id)"
        class="bg-primary hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold transition"
      >
        #{{ tag.name }}
      </button>
    </div>

    <!-- 空状态 -->
    <div v-else class="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-center">
      <p class="text-gray-600 dark:text-gray-400 text-lg">暂无标签</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { tagAPI } from '../api/index'

const router = useRouter()
const tags = ref([])
const loading = ref(true)

const fetchTags = async () => {
  loading.value = true
  try {
    const response = await tagAPI.getTags()
    tags.value = response.data || []
  } catch (error) {
    console.error('Failed to fetch tags:', error)
    tags.value = []
  } finally {
    loading.value = false
  }
}

const goToTag = (id) => {
  router.push(`/?tag=${id}`)
}

onMounted(() => {
  fetchTags()
})
</script>

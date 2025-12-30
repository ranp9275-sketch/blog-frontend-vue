<template>
  <div>
    <h1 class="text-4xl font-bold mb-8">标签</h1>
    <div class="flex flex-wrap gap-4">
      <button
        v-for="tag in tags"
        :key="tag.id"
        @click="goToTag(tag.id)"
        class="bg-primary hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold transition"
      >
        #{{ tag.name }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { tagAPI } from '../api/index'

const router = useRouter()
const tags = ref([])

const fetchTags = async () => {
  try {
    const response = await tagAPI.getTags()
    tags.value = response.data || []
  } catch (error) {
    console.error('Failed to fetch tags:', error)
  }
}

const goToTag = (id) => {
  router.push(`/?tag=${id}`)
}

onMounted(() => {
  fetchTags()
})
</script>

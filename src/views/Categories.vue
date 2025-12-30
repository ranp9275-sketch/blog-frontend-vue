<template>
  <div>
    <h1 class="text-4xl font-bold mb-8">分类</h1>
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="category in categories"
        :key="category.id"
        @click="goToCategory(category.id)"
        class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg cursor-pointer transition"
      >
        <h3 class="text-xl font-bold mb-2 text-primary">{{ category.name }}</h3>
        <p class="text-gray-600">{{ category.desc }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { categoryAPI } from '../api/index'

const router = useRouter()
const categories = ref([])

const fetchCategories = async () => {
  try {
    const response = await categoryAPI.getCategories()
    categories.value = response.data || []
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

const goToCategory = (id) => {
  router.push(`/?category=${id}`)
}

onMounted(() => {
  fetchCategories()
})
</script>

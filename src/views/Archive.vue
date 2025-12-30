<template>
  <div>
    <h1 class="text-4xl font-bold mb-8">归档</h1>

    <!-- 按年份分组 -->
    <div v-if="groupedArticles.length > 0" class="space-y-12">
      <div v-for="yearGroup in groupedArticles" :key="yearGroup.year">
        <h2 class="text-2xl font-bold mb-6 text-primary">{{ yearGroup.year }} 年</h2>

        <!-- 按月份分组 -->
        <div class="space-y-8 ml-4">
          <div v-for="monthGroup in yearGroup.months" :key="monthGroup.month">
            <h3 class="text-lg font-semibold mb-4 text-gray-700">
              {{ formatMonth(monthGroup.month) }}
            </h3>

            <!-- 文章列表 -->
            <div class="space-y-3 border-l-2 border-primary pl-6">
              <div
                v-for="article in monthGroup.articles"
                :key="article.id"
                @click="goToArticle(article.id)"
                class="cursor-pointer hover:text-primary transition group"
              >
                <div class="flex items-center gap-4">
                  <span class="text-sm text-gray-500 font-mono">{{ formatDate(article.published_at) }}</span>
                  <h4 class="text-gray-800 group-hover:text-primary transition font-semibold">
                    {{ article.title }}
                  </h4>
                  <span v-if="article.category" class="text-xs bg-primary text-white px-2 py-1 rounded">
                    {{ article.category.name }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="bg-gray-100 rounded-lg p-12 text-center">
      <p class="text-gray-600 text-lg">暂无文章</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { articleAPI } from '../api/index'
import dayjs from 'dayjs'

const router = useRouter()

const articles = ref([])
const loading = ref(true)

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const formatMonth = (month) => {
  return dayjs(month).format('MMMM')
}

const groupedArticles = computed(() => {
  const groups = {}

  articles.value.forEach(article => {
    const date = dayjs(article.published_at)
    const year = date.year()
    const month = date.format('YYYY-MM')

    if (!groups[year]) {
      groups[year] = {}
    }

    if (!groups[year][month]) {
      groups[year][month] = []
    }

    groups[year][month].push(article)
  })

  // 转换为数组并排序
  return Object.entries(groups)
    .map(([year, months]) => ({
      year: parseInt(year),
      months: Object.entries(months)
        .map(([month, articles]) => ({
          month,
          articles: articles.sort((a, b) => 
            dayjs(b.published_at).valueOf() - dayjs(a.published_at).valueOf()
          )
        }))
        .sort((a, b) => b.month.localeCompare(a.month))
    }))
    .sort((a, b) => b.year - a.year)
})

const fetchArticles = async () => {
  loading.value = true
  try {
    let allArticles = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const response = await articleAPI.getArticles(page, 100)
      allArticles = [...allArticles, ...(response.data.data || [])]
      hasMore = response.data.total > allArticles.length
      page++
    }

    articles.value = allArticles.sort((a, b) =>
      dayjs(b.published_at).valueOf() - dayjs(a.published_at).valueOf()
    )
  } catch (error) {
    console.error('Failed to fetch articles:', error)
  } finally {
    loading.value = false
  }
}

const goToArticle = (id) => {
  router.push(`/article/${id}`)
}

onMounted(() => {
  fetchArticles()
})
</script>

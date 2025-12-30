<template>
  <div v-if="!loading" class="max-w-4xl mx-auto">
    <!-- 文章头部 -->
    <div v-if="article" class="mb-8">
      <div class="flex items-center gap-4 mb-4">
        <span v-if="article.category" class="bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold">
          {{ article.category.name }}
        </span>
        <span class="text-gray-500">{{ formatDate(article.published_at) }}</span>
      </div>

      <h1 class="text-4xl font-bold mb-4">{{ article.title }}</h1>

      <div class="flex items-center justify-between text-gray-600 mb-8 pb-8 border-b">
        <div class="flex items-center gap-4">
          <span v-if="article.author" class="font-semibold">作者: {{ article.author.name }}</span>
          <span>👁️ {{ article.views || 0 }} 次阅读</span>
        </div>
        <span class="text-sm">{{ estimateReadTime(article.content) }} 分钟阅读</span>
      </div>

      <!-- 文章封面 -->
      <div v-if="article.cover_image" class="mb-8 rounded-lg overflow-hidden">
        <img :src="article.cover_image" :alt="article.title" class="w-full h-auto" />
      </div>

      <!-- 文章内容 -->
      <div class="prose prose-lg max-w-none mb-8" v-html="renderedContent"></div>

      <!-- 标签 -->
      <div v-if="article.tags && article.tags.length" class="flex flex-wrap gap-2 mb-8 pb-8 border-b">
        <router-link
          v-for="tag in article.tags"
          :key="tag.id"
          :to="`/tags?tag=${tag.id}`"
          class="bg-gray-100 hover:bg-primary hover:text-white text-gray-700 px-3 py-1 rounded-full text-sm transition"
        >
          #{{ tag.name }}
        </router-link>
      </div>

      <!-- 评论区 -->
      <div class="mt-12">
        <h2 class="text-2xl font-bold mb-6">评论</h2>

        <!-- 评论列表 -->
        <div class="space-y-4 mb-8">
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="bg-gray-50 p-4 rounded-lg"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold">{{ comment.author }}</span>
              <span class="text-sm text-gray-500">{{ formatDate(comment.created_at) }}</span>
            </div>
            <p class="text-gray-700">{{ comment.content }}</p>
          </div>
        </div>

        <!-- 评论表单 -->
        <div class="bg-gray-50 p-6 rounded-lg">
          <h3 class="text-lg font-bold mb-4">发表评论</h3>
          <form @submit.prevent="submitComment" class="space-y-4">
            <input
              v-model="commentForm.author"
              type="text"
              placeholder="您的名字"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <input
              v-model="commentForm.email"
              type="email"
              placeholder="您的邮箱"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <textarea
              v-model="commentForm.content"
              placeholder="您的评论"
              rows="4"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            ></textarea>
            <button
              type="submit"
              class="bg-primary hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              发表评论
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { articleAPI, commentAPI } from '../api/index'
import { marked } from 'marked'
import dayjs from 'dayjs'

const route = useRoute()

const article = ref(null)
const comments = ref([])
const loading = ref(true)
const commentForm = ref({
  author: '',
  email: '',
  content: ''
})

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const estimateReadTime = (content) => {
  const words = content.length
  return Math.ceil(words / 300)
}

const renderedContent = ref('')

const fetchArticle = async () => {
  loading.value = true
  try {
    const response = await articleAPI.getArticleById(route.params.id)
    article.value = response.data

    // 记录浏览
    await articleAPI.recordView(route.params.id)

    // 渲染 Markdown
    renderedContent.value = marked(article.value.content || '')

    // 获取评论
    await fetchComments()
  } catch (error) {
    console.error('Failed to fetch article:', error)
  } finally {
    loading.value = false
  }
}

const fetchComments = async () => {
  try {
    const response = await commentAPI.getComments(route.params.id)
    comments.value = response.data || []
  } catch (error) {
    console.error('Failed to fetch comments:', error)
  }
}

const submitComment = async () => {
  try {
    await commentAPI.createComment(route.params.id, commentForm.value)
    commentForm.value = { author: '', email: '', content: '' }
    await fetchComments()
    alert('评论已提交，等待审核')
  } catch (error) {
    console.error('Failed to submit comment:', error)
    alert('评论提交失败')
  }
}

onMounted(() => {
  fetchArticle()
})
</script>

<style scoped>
.prose {
  color: #1f2937;
}

.prose :deep(h2) {
  @apply text-2xl font-bold mt-8 mb-4;
}

.prose :deep(h3) {
  @apply text-xl font-bold mt-6 mb-3;
}

.prose :deep(p) {
  @apply mb-4 leading-relaxed;
}

.prose :deep(ul),
.prose :deep(ol) {
  @apply mb-4 ml-6;
}

.prose :deep(li) {
  @apply mb-2;
}

.prose :deep(code) {
  @apply bg-gray-100 px-2 py-1 rounded text-red-600;
}

.prose :deep(pre) {
  @apply bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4;
}

.prose :deep(blockquote) {
  @apply border-l-4 border-primary pl-4 italic text-gray-600 mb-4;
}

.prose :deep(a) {
  @apply text-primary hover:underline;
}

.prose :deep(img) {
  @apply rounded-lg mb-4;
}
</style>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <!-- 文章头部 -->
    <div v-else-if="article" class="mb-8">
      <div class="flex items-center gap-4 mb-4 flex-wrap">
        <span v-if="article.category" class="bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold">
          {{ article.category.name }}
        </span>
        <span class="text-gray-500 dark:text-gray-400">{{ formatDate(article.published_at) }}</span>
      </div>

      <h1 class="text-3xl md:text-4xl font-bold mb-4 dark:text-white">{{ article.title }}</h1>

      <div class="flex items-center justify-between text-gray-600 dark:text-gray-400 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700 flex-wrap gap-4">
        <div class="flex items-center gap-4 flex-wrap">
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
      <div class="prose prose-lg max-w-none mb-8 dark:prose-invert" v-html="renderedContent"></div>

      <!-- 标签 -->
      <div v-if="article.tags && article.tags.length" class="flex flex-wrap gap-2 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
        <router-link
          v-for="tag in article.tags"
          :key="tag.id"
          :to="`/?tag=${tag.id}`"
          class="bg-gray-100 dark:bg-gray-700 hover:bg-primary hover:text-white text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm transition"
        >
          #{{ tag.name }}
        </router-link>
      </div>

      <!-- 评论区 -->
      <div class="mt-12">
        <h2 class="text-2xl font-bold mb-6 dark:text-white">评论 ({{ comments.length }})</h2>

        <!-- 评论列表 -->
        <div v-if="comments.length > 0" class="space-y-4 mb-8">
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
          >
            <div class="flex items-center justify-between mb-2 flex-wrap gap-2">
              <span class="font-semibold dark:text-white">{{ comment.author }}</span>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(comment.created_at) }}</span>
            </div>
            <p class="text-gray-700 dark:text-gray-300">{{ comment.content }}</p>
          </div>
        </div>
        <div v-else class="text-gray-500 dark:text-gray-400 mb-8">暂无评论</div>

        <!-- 评论表单 -->
        <div class="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <h3 class="text-lg font-bold mb-4 dark:text-white">发表评论</h3>
          <form @submit.prevent="submitComment" class="space-y-4">
            <div class="grid md:grid-cols-2 gap-4">
              <input
                v-model="commentForm.author"
                type="text"
                placeholder="您的名字"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white"
                required
              />
              <input
                v-model="commentForm.email"
                type="email"
                placeholder="您的邮箱"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <textarea
              v-model="commentForm.content"
              placeholder="您的评论"
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white"
              required
            ></textarea>
            <button
              type="submit"
              :disabled="submitting"
              class="bg-primary hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              {{ submitting ? '提交中...' : '发表评论' }}
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- 文章不存在 -->
    <div v-else class="text-center py-12">
      <p class="text-gray-600 dark:text-gray-400 text-lg mb-4">文章不存在或已被删除</p>
      <router-link to="/" class="text-primary hover:underline font-semibold">返回首页</router-link>
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
const submitting = ref(false)
const commentForm = ref({
  author: '',
  email: '',
  content: ''
})

const renderedContent = ref('')

const formatDate = (date) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const estimateReadTime = (content) => {
  if (!content) return 1
  const words = content.length
  return Math.max(1, Math.ceil(words / 300))
}

const fetchArticle = async () => {
  loading.value = true
  try {
    const response = await articleAPI.getArticleById(route.params.id)
    article.value = response.data

    // 记录浏览
    articleAPI.recordView(route.params.id).catch(() => {})

    // 渲染 Markdown
    renderedContent.value = marked(article.value.content || '')

    // 获取评论
    await fetchComments()
  } catch (error) {
    console.error('Failed to fetch article:', error)
    article.value = null
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
    comments.value = []
  }
}

const submitComment = async () => {
  submitting.value = true
  try {
    await commentAPI.createComment(route.params.id, commentForm.value)
    commentForm.value = { author: '', email: '', content: '' }
    alert('评论已提交，等待审核')
  } catch (error) {
    console.error('Failed to submit comment:', error)
    alert('评论提交失败，请稍后重试')
  } finally {
    submitting.value = false
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

.dark .prose,
.prose.dark\:prose-invert {
  color: #e5e7eb;
}

.prose :deep(h2) {
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.prose :deep(h3) {
  font-size: 1.25rem;
  font-weight: bold;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.prose :deep(p) {
  margin-bottom: 1rem;
  line-height: 1.75;
}

.prose :deep(ul),
.prose :deep(ol) {
  margin-bottom: 1rem;
  margin-left: 1.5rem;
}

.prose :deep(li) {
  margin-bottom: 0.5rem;
}

.prose :deep(code) {
  background-color: #f3f4f6;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  color: #dc2626;
}

.dark .prose :deep(code) {
  background-color: #374151;
  color: #fca5a5;
}

.prose :deep(pre) {
  background-color: #1f2937;
  color: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.prose :deep(pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
}

.prose :deep(blockquote) {
  border-left: 4px solid #10b981;
  padding-left: 1rem;
  font-style: italic;
  color: #6b7280;
  margin-bottom: 1rem;
}

.dark .prose :deep(blockquote) {
  color: #9ca3af;
}

.prose :deep(a) {
  color: #10b981;
}

.prose :deep(a:hover) {
  text-decoration: underline;
}

.prose :deep(img) {
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}
</style>

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
        <span class="text-gray-600 dark:text-gray-400">{{ formatDate(article.published_at) }}</span>
      </div>

      <h1 class="text-3xl md:text-4xl font-bold mb-4 dark:text-white">{{ article.title }}</h1>

      <div class="flex items-center justify-between text-gray-700 dark:text-gray-400 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700 flex-wrap gap-4">
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
      <div class="prose prose-lg prose-slate max-w-none mb-8 dark:prose-invert" v-html="renderedContent"></div>

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

      <!-- 打赏按钮 -->
      <div class="flex justify-center mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
        <button
          @click="showDonation = true"
          class="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-8 py-3 rounded-full font-semibold transition shadow-lg flex items-center gap-2"
        >
          <span class="text-xl">☕</span>
          请作者喝杯咖啡
        </button>
      </div>

      <!-- 打赏弹窗 -->
      <DonationModal :show="showDonation" @close="showDonation = false" />

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

// 配置 marked：启用 GFM（支持表格、删除线、有序列表等），关闭 pedantic 模式
marked.setOptions({
  gfm: true,
  breaks: false,
  pedantic: false
})
import DonationModal from '../components/DonationModal.vue'

const route = useRoute()

const article = ref(null)
const comments = ref([])
const loading = ref(true)
const submitting = ref(false)
const showDonation = ref(false)
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
/* ===== 标题 ===== */
.prose :deep(h1) {
  font-size: 2rem;
  font-weight: 800;
  margin-top: 2.5rem;
  margin-bottom: 1.25rem;
  line-height: 1.3;
  color: inherit;
}

.prose :deep(h2) {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
  line-height: 1.4;
  color: inherit;
}

.prose :deep(h3) {
  font-size: 1.25rem;
  font-weight: 700;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  line-height: 1.4;
  color: inherit;
}

.prose :deep(h4) {
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
  color: inherit;
}

.prose :deep(h5) {
  font-size: 1rem;
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: inherit;
}

.prose :deep(h6) {
  font-size: 0.9rem;
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: #6b7280;
}

/* ===== 段落 ===== */
.prose :deep(p) {
  margin-bottom: 1rem;
  line-height: 1.75;
}

/* ===== 列表 ===== */
.prose :deep(ul) {
  list-style-type: disc;
  margin-bottom: 1rem;
  margin-left: 1.75rem;
  padding-left: 0;
}

.prose :deep(ol) {
  list-style-type: decimal;
  margin-bottom: 1rem;
  margin-left: 1.75rem;
  padding-left: 0;
}

.prose :deep(li) {
  margin-bottom: 0.375rem;
  line-height: 1.7;
  display: list-item;
}

.prose :deep(li > ul),
.prose :deep(li > ol) {
  margin-top: 0.375rem;
  margin-bottom: 0.375rem;
}

/* ===== 行内格式 ===== */
.prose :deep(em) {
  font-style: italic;
}

.prose :deep(strong) {
  font-weight: 700;
}

.prose :deep(del) {
  text-decoration: line-through;
  color: #9ca3af;
}

/* ===== 代码 ===== */
.prose :deep(code) {
  background-color: #f3f4f6;
  padding: 0.125rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
  color: #dc2626;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.dark .prose :deep(code) {
  background-color: #374151;
  color: #fca5a5;
}

.prose :deep(pre) {
  background-color: #1f2937;
  color: #f3f4f6;
  padding: 1rem 1.25rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.prose :deep(pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
  font-size: 0.875rem;
}

/* ===== 引用 ===== */
.prose :deep(blockquote) {
  border-left: 4px solid #10b981;
  padding: 0.5rem 1rem;
  margin-left: 0;
  margin-bottom: 1rem;
  font-style: italic;
  color: #4b5563;
  background-color: #f9fafb;
  border-radius: 0 0.25rem 0.25rem 0;
}

.dark .prose :deep(blockquote) {
  color: #9ca3af;
  background-color: #1f2937;
}

/* ===== 链接 ===== */
.prose :deep(a) {
  color: #10b981;
  text-decoration: underline;
  text-decoration-color: transparent;
  transition: text-decoration-color 0.2s;
}

.prose :deep(a:hover) {
  text-decoration-color: #10b981;
}

/* ===== 图片 ===== */
.prose :deep(img) {
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  max-width: 100%;
  height: auto;
}

/* ===== 分割线 ===== */
.prose :deep(hr) {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 2rem 0;
}

.dark .prose :deep(hr) {
  border-top-color: #374151;
}

/* ===== 表格 ===== */
.prose :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  overflow-x: auto;
  display: block;
}

.prose :deep(th) {
  background-color: #f3f4f6;
  font-weight: 600;
  text-align: left;
  padding: 0.6rem 0.9rem;
  border: 1px solid #d1d5db;
}

.dark .prose :deep(th) {
  background-color: #374151;
  border-color: #4b5563;
}

.prose :deep(td) {
  padding: 0.5rem 0.9rem;
  border: 1px solid #d1d5db;
  vertical-align: top;
}

.dark .prose :deep(td) {
  border-color: #4b5563;
}

.prose :deep(tr:nth-child(even) td) {
  background-color: #f9fafb;
}

.dark .prose :deep(tr:nth-child(even) td) {
  background-color: #1f2937;
}
</style>

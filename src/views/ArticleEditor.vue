<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-8 dark:text-white">
      {{ isEdit ? '编辑文章' : '创建文章' }}
    </h1>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- 标题 -->
      <div>
        <label class="block text-sm font-semibold mb-2 dark:text-gray-300">标题 *</label>
        <input
          v-model="form.title"
          type="text"
          placeholder="文章标题"
          class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-800 dark:text-white"
          required
        />
      </div>

      <!-- Slug -->
      <div>
        <label class="block text-sm font-semibold mb-2 dark:text-gray-300">Slug</label>
        <input
          v-model="form.slug"
          type="text"
          placeholder="article-url-slug"
          class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-800 dark:text-white"
        />
      </div>

      <!-- 分类 -->
      <div>
        <label class="block text-sm font-semibold mb-2 dark:text-gray-300">分类</label>
        <select
          v-model="form.category_id"
          class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-800 dark:text-white"
        >
          <option value="">选择分类</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <!-- 封面图片 -->
      <div>
        <label class="block text-sm font-semibold mb-2 dark:text-gray-300">封面图片 URL</label>
        <input
          v-model="form.cover_image"
          type="url"
          placeholder="https://example.com/image.jpg"
          class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-800 dark:text-white"
        />
        <div v-if="form.cover_image" class="mt-2">
          <img :src="form.cover_image" alt="封面预览" class="max-h-48 rounded-lg" />
        </div>
      </div>

      <!-- 摘要 -->
      <div>
        <label class="block text-sm font-semibold mb-2 dark:text-gray-300">摘要</label>
        <textarea
          v-model="form.excerpt"
          rows="2"
          placeholder="文章摘要（可选）"
          class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-800 dark:text-white"
        ></textarea>
      </div>

      <!-- 内容 -->
      <div>
        <label class="block text-sm font-semibold mb-2 dark:text-gray-300">内容 * (支持 Markdown)</label>
        <textarea
          v-model="form.content"
          rows="15"
          placeholder="使用 Markdown 编写文章内容..."
          class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-800 dark:text-white font-mono"
          required
        ></textarea>
      </div>

      <!-- 标签 -->
      <div>
        <label class="block text-sm font-semibold mb-2 dark:text-gray-300">标签</label>
        <div class="flex flex-wrap gap-2 mb-2">
          <span
            v-for="tag in selectedTags"
            :key="tag.id"
            class="bg-primary text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
          >
            {{ tag.name }}
            <button type="button" @click="removeTag(tag.id)" class="hover:text-red-200">✕</button>
          </span>
        </div>
        <select
          @change="addTag($event)"
          class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-800 dark:text-white"
        >
          <option value="">添加标签</option>
          <option v-for="tag in availableTags" :key="tag.id" :value="tag.id">
            {{ tag.name }}
          </option>
        </select>
      </div>

      <!-- 错误信息 -->
      <div v-if="error" class="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
        {{ error }}
      </div>

      <!-- 按钮 -->
      <div class="flex gap-4 flex-wrap">
        <button
          type="submit"
          :disabled="loading"
          class="bg-primary hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          {{ loading ? '保存中...' : (isEdit ? '更新文章' : '创建文章') }}
        </button>
        <button
          v-if="!isEdit"
          type="button"
          @click="handleSubmit(true)"
          :disabled="loading"
          class="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          创建并发布
        </button>
        <router-link
          to="/my-articles"
          class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          取消
        </router-link>
      </div>
    </form>

    <!-- Markdown 预览 -->
    <div v-if="form.content" class="mt-12">
      <h2 class="text-2xl font-bold mb-4 dark:text-white">预览</h2>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div class="prose prose-lg max-w-none dark:prose-invert" v-html="renderedContent"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { categoryAPI, tagAPI } from '../api/index'
import api from '../api/index'
import { marked } from 'marked'

const router = useRouter()
const route = useRoute()
const { isAuthenticated } = useAuth()

const isEdit = computed(() => !!route.params.id)

const form = ref({
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  cover_image: '',
  category_id: '',
  status: 'draft'
})

const categories = ref([])
const tags = ref([])
const selectedTags = ref([])
const loading = ref(false)
const error = ref('')

const availableTags = computed(() => {
  const selectedIds = selectedTags.value.map(t => t.id)
  return tags.value.filter(t => !selectedIds.includes(t.id))
})

const renderedContent = computed(() => {
  return marked(form.value.content || '')
})

const fetchCategories = async () => {
  try {
    const response = await categoryAPI.getCategories()
    categories.value = response.data || []
  } catch (err) {
    console.error('Failed to fetch categories:', err)
  }
}

const fetchTags = async () => {
  try {
    const response = await tagAPI.getTags()
    tags.value = response.data || []
  } catch (err) {
    console.error('Failed to fetch tags:', err)
  }
}

const fetchArticle = async () => {
  if (!isEdit.value) return
  try {
    const response = await api.get(`/articles/${route.params.id}`)
    const article = response.data
    form.value = {
      title: article.title || '',
      slug: article.slug || '',
      content: article.content || '',
      excerpt: article.excerpt || '',
      cover_image: article.cover_image || '',
      category_id: article.category_id || '',
      status: article.status || 'draft'
    }
    selectedTags.value = article.tags || []
  } catch (err) {
    console.error('Failed to fetch article:', err)
    error.value = '加载文章失败'
  }
}

const addTag = (event) => {
  const tagId = event.target.value
  if (!tagId) return
  const tag = tags.value.find(t => t.id === tagId)
  if (tag && !selectedTags.value.find(t => t.id === tagId)) {
    selectedTags.value.push(tag)
  }
  event.target.value = ''
}

const removeTag = (tagId) => {
  selectedTags.value = selectedTags.value.filter(t => t.id !== tagId)
}

const handleSubmit = async (publish = false) => {
  if (!form.value.title || !form.value.content) {
    error.value = '标题和内容不能为空'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const data = {
      title: form.value.title,
      slug: form.value.slug,
      content: form.value.content,
      excerpt: form.value.excerpt,
      cover_image: form.value.cover_image,
      category_id: form.value.category_id,
      tag_ids: selectedTags.value.map(t => t.id),
      submit: publish  // true=发布, false=草稿
    }

    if (isEdit.value) {
      await api.put(`/user/articles/${route.params.id}`, data)
    } else {
      await api.post('/user/articles', data)
    }

    router.push('/my-articles')
  } catch (err) {
    console.error('Failed to save article:', err)
    error.value = err.response?.data?.error || '保存失败，请检查是否已登录'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }
  fetchCategories()
  fetchTags()
  fetchArticle()
})
</script>

<style scoped>
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
</style>

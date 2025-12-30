import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
})

// 文章相关 API
export const articleAPI = {
  // 获取文章列表
  getArticles: (page = 1, pageSize = 10) => 
    api.get('/articles', { params: { page, pageSize } }),

  // 获取文章详情
  getArticleById: (id) => 
    api.get(`/articles/${id}`),

  // 按分类获取文章
  getArticlesByCategory: (categoryId, page = 1, pageSize = 10) =>
    api.get(`/articles/category/${categoryId}`, { params: { page, pageSize } }),

  // 按标签获取文章
  getArticlesByTag: (tagId, page = 1, pageSize = 10) =>
    api.get(`/articles/tag/${tagId}`, { params: { page, pageSize } }),

  // 记录浏览
  recordView: (id) =>
    api.post(`/articles/${id}/view`),

  // 获取文章统计
  getStats: (id) =>
    api.get(`/articles/${id}/stats`)
}

// 分类相关 API
export const categoryAPI = {
  // 获取分类列表
  getCategories: () =>
    api.get('/categories')
}

// 标签相关 API
export const tagAPI = {
  // 获取标签列表
  getTags: () =>
    api.get('/tags')
}

// 评论相关 API
export const commentAPI = {
  // 获取评论
  getComments: (articleId) =>
    api.get(`/articles/${articleId}/comments`),

  // 创建评论
  createComment: (articleId, data) =>
    api.post(`/articles/${articleId}/comments`, data)
}

export default api

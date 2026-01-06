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

// 用户文章管理 API
export const userArticleAPI = {
  // 获取我的文章
  getMyArticles: (page = 1, pageSize = 10) =>
    api.get('/user/articles', { params: { page, pageSize } }),

  // 创建文章
  createArticle: (data) =>
    api.post('/user/articles', data),

  // 更新文章
  updateArticle: (id, data) =>
    api.put(`/user/articles/${id}`, data),

  // 删除文章
  deleteArticle: (id) =>
    api.delete(`/user/articles/${id}`)
}

// 管理员文章管理 API
export const adminArticleAPI = {
  // 获取所有文章
  getAllArticles: (page = 1, pageSize = 10, status = '') =>
    api.get('/admin/articles', { params: { page, pageSize, status } }),

  // 获取待审核文章
  getPendingArticles: (page = 1, pageSize = 10) =>
    api.get('/admin/articles/pending', { params: { page, pageSize } }),

  // 发布文章
  publishArticle: (id) =>
    api.patch(`/admin/articles/${id}/publish`),

  // 拒绝文章
  rejectArticle: (id, reason = '') =>
    api.patch(`/admin/articles/${id}/reject`, { reason }),

  // 删除文章
  deleteArticle: (id) =>
    api.delete(`/admin/articles/${id}`)
}

// 管理员用户管理 API
export const adminUserAPI = {
  // 获取所有用户
  getAllUsers: (page = 1, pageSize = 10) =>
    api.get('/admin/users', { params: { page, pageSize } }),

  // 更新用户角色
  updateUserRole: (id, role) =>
    api.put(`/admin/users/${id}/role`, { role }),

  // 删除用户
  deleteUser: (id) =>
    api.delete(`/admin/users/${id}`)
}

// 用户个人资料 API
export const profileAPI = {
  // 更新个人资料
  updateProfile: (data) =>
    api.put('/user/profile', data),

  // 修改密码
  updatePassword: (data) =>
    api.put('/user/password', data)
}

export default api

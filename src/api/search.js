import api from './index'

export const searchAPI = {
  // 搜索文章
  searchArticles: (query, page = 1, pageSize = 10) =>
    api.get('/articles/search', {
      params: { q: query, page, pageSize }
    }),

  // 获取热门搜索
  getHotSearches: () =>
    api.get('/articles/search/hot')
}

export default searchAPI

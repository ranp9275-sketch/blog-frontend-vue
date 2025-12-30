# 技术博客系统 - Vue 3 前端

## 📚 项目概述

这是一个基于 **Vue 3 + TypeScript + Tailwind CSS** 的现代化技术博客前端应用。

### 核心特性

- ✅ **现代化 UI 设计**：参考 www.beilang.tech 风格
- ✅ **响应式布局**：完美适配移动端和桌面端
- ✅ **快速加载**：使用 Vite 构建工具
- ✅ **文章管理**：列表、详情、分类、标签
- ✅ **评论系统**：用户评论功能
- ✅ **浏览统计**：记录文章访问量
- ✅ **深色主题**：支持深色导航栏和绿色高亮

## 🏗️ 项目结构

```
blog-frontend-vue/
├── src/
│   ├── views/
│   │   ├── Home.vue              # 首页
│   │   ├── ArticleDetail.vue     # 文章详情
│   │   ├── Archive.vue           # 归档
│   │   ├── Categories.vue        # 分类
│   │   ├── Tags.vue              # 标签
│   │   └── About.vue             # 关于
│   ├── components/               # 可复用组件
│   ├── api/
│   │   └── index.js              # API 调用
│   ├── router/
│   │   └── index.js              # 路由配置
│   ├── App.vue                   # 根组件
│   ├── main.js                   # 入口文件
│   └── style.css                 # 全局样式
├── index.html                    # HTML 模板
├── vite.config.js                # Vite 配置
├── tailwind.config.js            # Tailwind 配置
├── postcss.config.js             # PostCSS 配置
├── package.json                  # 项目依赖
└── README.md                     # 项目说明
```

## 🚀 快速开始

### 前置要求

- Node.js 16+
- npm 或 pnpm

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 启动开发服务器

```bash
npm run dev
# 或
pnpm dev
```

访问 `http://localhost:5173`

### 构建生产版本

```bash
npm run build
# 或
pnpm build
```

## 🎨 设计特点

### 配色方案

- **主色**：绿色 (#10b981)
- **深色背景**：#1f2937
- **浅色背景**：#f9fafb
- **文字颜色**：#1f2937

### 布局结构

1. **导航栏**：深色导航栏，绿色高亮按钮
2. **英雄区**：全屏背景图片，大标题和 CTA 按钮
3. **文章列表**：卡片式布局，支持分类筛选
4. **文章详情**：Markdown 渲染，评论系统
5. **页脚**：简洁的页脚信息

## 📡 API 集成

前端通过 Axios 与后端 API 通信：

```javascript
// 获取文章列表
GET /api/articles?page=1&pageSize=10

// 获取文章详情
GET /api/articles/:id

// 记录浏览
POST /api/articles/:id/view

// 获取评论
GET /api/articles/:id/comments

// 创建评论
POST /api/articles/:id/comments
```

## 🔧 配置说明

### 环境变量

创建 `.env.local` 文件：

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### API 代理

在 `vite.config.js` 中配置代理：

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

## 📦 依赖说明

| 包名 | 版本 | 说明 |
|------|------|------|
| vue | ^3.3.4 | Vue 框架 |
| vue-router | ^4.2.5 | 路由管理 |
| axios | ^1.5.0 | HTTP 客户端 |
| marked | ^9.1.6 | Markdown 渲染 |
| dayjs | ^1.11.10 | 日期处理 |
| tailwindcss | ^3.3.5 | CSS 框架 |
| vite | ^4.5.0 | 构建工具 |

## 🎯 功能清单

### 已实现

- [x] 首页展示
- [x] 文章列表
- [x] 文章详情
- [x] 分类筛选
- [x] 标签展示
- [x] 评论功能
- [x] 浏览统计
- [x] 响应式设计
- [x] Markdown 渲染

### 待实现

- [ ] 搜索功能
- [ ] 归档页面
- [ ] 深色模式切换
- [ ] 用户登陆
- [ ] 文章收藏

## 🐳 Docker 部署

### Dockerfile

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 构建镜像

```bash
docker build -t blog-frontend-vue .
```

### 运行容器

```bash
docker run -p 80:80 blog-frontend-vue
```

## 📖 相关资源

- [Vue 3 文档](https://vuejs.org/)
- [Vue Router 文档](https://router.vuejs.org/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Vite 文档](https://vitejs.dev/)
- [Marked 文档](https://marked.js.org/)

## 📝 开发指南

### 添加新页面

1. 在 `src/views/` 下创建新的 `.vue` 文件
2. 在 `src/router/index.js` 中添加路由
3. 在导航栏中添加链接

### 调用 API

```javascript
import { articleAPI } from '@/api/index'

const articles = await articleAPI.getArticles(1, 10)
```

### 样式指南

使用 Tailwind CSS 类名：

```vue
<div class="bg-white rounded-lg shadow-md p-6">
  <h1 class="text-2xl font-bold text-primary">标题</h1>
</div>
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**项目创建时间**：2024 年 12 月
**最后更新**：2024 年 12 月 30 日
**版本**：1.0.0

祝您的技术博客平台蓬勃发展！🚀

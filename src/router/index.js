import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ArticleDetail from '../views/ArticleDetail.vue'
import Archive from '../views/Archive.vue'
import Categories from '../views/Categories.vue'
import Tags from '../views/Tags.vue'
import About from '../views/About.vue'
import Search from '../views/Search.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Favorites from '../views/Favorites.vue'
import MyArticles from '../views/MyArticles.vue'
import ArticleEditor from '../views/ArticleEditor.vue'
import AdminArticles from '../views/AdminArticles.vue'
import AdminCategories from '../views/AdminCategories.vue'
import AdminTags from '../views/AdminTags.vue'
import AdminUsers from '../views/AdminUsers.vue'
import AdminDonation from '../views/AdminDonation.vue'
import Profile from '../views/Profile.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: ArticleDetail
  },
  {
    path: '/archive',
    name: 'Archive',
    component: Archive
  },
  {
    path: '/categories',
    name: 'Categories',
    component: Categories
  },
  {
    path: '/tags',
    name: 'Tags',
    component: Tags
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/search',
    name: 'Search',
    component: Search
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: Favorites
  },
  {
    path: '/my-articles',
    name: 'MyArticles',
    component: MyArticles
  },
  {
    path: '/write',
    name: 'ArticleEditor',
    component: ArticleEditor
  },
  {
    path: '/edit/:id',
    name: 'EditArticle',
    component: ArticleEditor
  },
  {
    path: '/admin/articles',
    name: 'AdminArticles',
    component: AdminArticles
  },
  {
    path: '/admin/categories',
    name: 'AdminCategories',
    component: AdminCategories
  },
  {
    path: '/admin/tags',
    name: 'AdminTags',
    component: AdminTags
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: AdminUsers
  },
  {
    path: '/admin/donation',
    name: 'AdminDonation',
    component: AdminDonation
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

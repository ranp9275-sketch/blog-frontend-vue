<template>
  <div :class="{ dark: isDark }" class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
    <!-- 导航栏 -->
    <nav class="bg-darker sticky top-0 z-50 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <!-- Logo -->
        <router-link to="/" class="text-2xl font-bold text-primary" @click="closeMenu">
          Tech Blog
        </router-link>

        <!-- 桌面菜单 -->
        <div class="hidden md:flex items-center gap-6">
          <router-link to="/" class="text-gray-300 hover:text-primary transition">首页</router-link>
          <router-link to="/archive" class="text-gray-300 hover:text-primary transition">归档</router-link>
          <router-link to="/categories" class="text-gray-300 hover:text-primary transition">分类</router-link>
          <router-link to="/tags" class="text-gray-300 hover:text-primary transition">标签</router-link>
          <router-link to="/about" class="text-gray-300 hover:text-primary transition">关于</router-link>
        </div>

        <!-- 右侧操作 -->
        <div class="flex items-center gap-4">
          <router-link to="/search" class="text-gray-300 hover:text-primary transition hidden md:inline text-xl">🔍</router-link>
          
          <button 
            @click="toggleDarkMode" 
            class="text-xl p-1"
            :title="isDark ? '切换到亮色模式' : '切换到深色模式'"
          >
            {{ isDark ? '☀️' : '🌙' }}
          </button>

          <!-- 用户菜单 - 桌面 -->
          <div v-if="isAuthenticated" class="hidden md:flex items-center gap-3">
            <router-link to="/write" class="text-primary hover:text-green-400 transition text-sm font-semibold">✏️ 写文章</router-link>
            <router-link to="/favorites" class="text-gray-300 hover:text-primary transition text-sm">收藏</router-link>
            <router-link to="/my-articles" class="text-gray-300 hover:text-primary transition text-sm">我的文章</router-link>
            <router-link v-if="isAdmin" to="/admin/articles" class="text-yellow-400 hover:text-yellow-300 transition text-sm">管理</router-link>
            <span class="text-gray-500">|</span>
            <router-link to="/profile" class="text-gray-300 hover:text-primary transition text-sm">{{ user?.name }}</router-link>
            <button @click="handleLogout" class="text-gray-400 hover:text-red-400 transition text-sm">登出</button>
          </div>
          <div v-else class="hidden md:flex items-center gap-3">
            <router-link to="/login" class="text-gray-300 hover:text-primary transition text-sm">登录</router-link>
            <router-link to="/register" class="bg-primary hover:bg-green-600 text-white px-3 py-1 rounded transition text-sm">注册</router-link>
          </div>

          <!-- 移动菜单按钮 -->
          <button @click="toggleMenu" class="md:hidden text-primary text-2xl p-1">
            {{ menuOpen ? '✕' : '☰' }}
          </button>
        </div>
      </div>

      <!-- 移动菜单 -->
      <transition name="slide">
        <div v-if="menuOpen" class="md:hidden bg-darker border-t border-gray-700">
          <router-link to="/" class="block px-4 py-3 text-gray-300 hover:text-primary hover:bg-gray-800" @click="closeMenu">首页</router-link>
          <router-link to="/archive" class="block px-4 py-3 text-gray-300 hover:text-primary hover:bg-gray-800" @click="closeMenu">归档</router-link>
          <router-link to="/categories" class="block px-4 py-3 text-gray-300 hover:text-primary hover:bg-gray-800" @click="closeMenu">分类</router-link>
          <router-link to="/tags" class="block px-4 py-3 text-gray-300 hover:text-primary hover:bg-gray-800" @click="closeMenu">标签</router-link>
          <router-link to="/about" class="block px-4 py-3 text-gray-300 hover:text-primary hover:bg-gray-800" @click="closeMenu">关于</router-link>
          <router-link to="/search" class="block px-4 py-3 text-gray-300 hover:text-primary hover:bg-gray-800" @click="closeMenu">搜索</router-link>
          <router-link v-if="isAuthenticated" to="/favorites" class="block px-4 py-3 text-gray-300 hover:text-primary hover:bg-gray-800" @click="closeMenu">收藏</router-link>
          <router-link v-if="isAuthenticated" to="/my-articles" class="block px-4 py-3 text-gray-300 hover:text-primary hover:bg-gray-800" @click="closeMenu">我的文章</router-link>
          <router-link v-if="isAuthenticated" to="/write" class="block px-4 py-3 text-gray-300 hover:text-primary hover:bg-gray-800" @click="closeMenu">写文章</router-link>
          <router-link v-if="isAdmin" to="/admin/articles" class="block px-4 py-3 text-yellow-400 hover:text-yellow-300 hover:bg-gray-800" @click="closeMenu">管理</router-link>
          
          <div v-if="isAuthenticated" class="border-t border-gray-700 px-4 py-3">
            <router-link to="/profile" class="block text-gray-300 hover:text-primary text-sm py-1 mb-2" @click="closeMenu">{{ user?.name }} (个人资料)</router-link>
            <button @click="handleLogout" class="text-gray-300 hover:text-primary transition text-sm">登出</button>
          </div>
          <div v-else class="border-t border-gray-700 px-4 py-3 space-y-2">
            <router-link to="/login" class="block text-gray-300 hover:text-primary text-sm py-1" @click="closeMenu">登录</router-link>
            <router-link to="/register" class="block text-gray-300 hover:text-primary text-sm py-1" @click="closeMenu">注册</router-link>
          </div>
        </div>
      </transition>
    </nav>

    <!-- 主内容 -->
    <main class="max-w-7xl mx-auto px-4 py-8 md:py-12 min-h-[calc(100vh-200px)]">
      <router-view />
    </main>

    <!-- 页脚 -->
    <footer class="bg-darker text-gray-400 py-10 mt-12">
      <div class="max-w-7xl mx-auto px-4">
        <!-- 主要内容 -->
        <div class="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-gray-700">
          <!-- Logo 和版权 -->
          <div class="text-center md:text-left">
            <h3 class="text-xl font-bold text-primary mb-2">Tech Blog</h3>
            <p class="text-sm">&copy; 2025 Tech Blog. All rights reserved.</p>
          </div>
          
          <!-- 链接 -->
          <div class="flex items-center gap-6 text-sm">
            <router-link to="/about" class="hover:text-primary transition">关于</router-link>
            <a href="https://github.com/ranp9275-sketch" target="_blank" class="hover:text-primary transition flex items-center gap-1">
              <span>GitHub</span>
            </a>
          </div>
        </div>

        <!-- 备案信息 -->
        <div class="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs text-gray-500">
          <a 
            href="https://beian.miit.gov.cn/" 
            target="_blank" 
            rel="noopener" 
            class="hover:text-gray-300 transition flex items-center gap-1.5"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd"/>
            </svg>
            <span>ICP备案号：蜀ICP备2025177100号-1</span>
          </a>
          <a 
            href="http://www.beian.gov.cn/" 
            target="_blank" 
            rel="noopener" 
            class="hover:text-gray-300 transition flex items-center gap-1.5"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2A11.954 11.954 0 0110 1.944zM10 14a4 4 0 100-8 4 4 0 000 8z" clip-rule="evenodd"/>
            </svg>
            <span>蜀公网安备 蜀ICP备2025177100号</span>
          </a>
        </div>

        <!-- 底部说明 -->
        <p class="text-center text-xs text-gray-600 mt-4">
          Made with ❤️ using Vue 3 + Golang
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDarkMode } from './composables/useDarkMode'
import { useAuth } from './composables/useAuth'

const router = useRouter()
const route = useRoute()
const menuOpen = ref(false)
const { isDark, toggleDarkMode } = useDarkMode()
const { isAuthenticated, user, logout, getCurrentUser } = useAuth()

const isAdmin = computed(() => user.value?.role === 'admin')

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const closeMenu = () => {
  menuOpen.value = false
}

const handleLogout = () => {
  logout()
  closeMenu()
  router.push('/')
}

// 路由变化时关闭菜单
watch(() => route.path, () => {
  closeMenu()
})

onMounted(() => {
  // 初始化用户信息
  if (isAuthenticated.value) {
    getCurrentUser()
  }
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

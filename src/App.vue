<template>
  <div :class="{ dark: isDark }" class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition">
    <!-- 导航栏 -->
    <nav class="bg-darker sticky top-0 z-50 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <!-- Logo -->
        <router-link to="/" class="text-2xl font-bold text-primary">
          Tech Blog
        </router-link>

        <!-- 桌面菜单 -->
        <div class="hidden md:flex items-center gap-8">
          <router-link to="/" class="text-gray-300 hover:text-primary transition">首页</router-link>
          <router-link to="/archive" class="text-gray-300 hover:text-primary transition">归档</router-link>
          <router-link to="/categories" class="text-gray-300 hover:text-primary transition">分类</router-link>
          <router-link to="/tags" class="text-gray-300 hover:text-primary transition">标签</router-link>
          <router-link to="/about" class="text-gray-300 hover:text-primary transition">关于</router-link>
          <router-link v-if="isAuthenticated" to="/favorites" class="text-gray-300 hover:text-primary transition">收藏</router-link>
        </div>

        <!-- 右侧操作 -->
        <div class="flex items-center gap-4">
          <router-link to="/search" class="text-gray-300 hover:text-primary transition hidden md:inline">🔍</router-link>
          
          <button 
            @click="toggleDarkMode" 
            class="text-primary text-xl"
            :title="isDark ? '切换到亮色模式' : '切换到深色模式'"
          >
            {{ isDark ? '☀️' : '🌙' }}
          </button>

          <!-- 用户菜单 -->
          <div v-if="isAuthenticated" class="hidden md:flex items-center gap-2">
            <span class="text-gray-300 text-sm">{{ user?.name }}</span>
            <button @click="handleLogout" class="text-gray-300 hover:text-primary transition text-sm">登出</button>
          </div>
          <div v-else class="hidden md:flex items-center gap-2">
            <router-link to="/login" class="text-gray-300 hover:text-primary transition text-sm">登陆</router-link>
            <router-link to="/register" class="bg-primary hover:bg-green-600 text-white px-3 py-1 rounded transition text-sm">注册</router-link>
          </div>

          <!-- 移动菜单按钮 -->
          <button @click="toggleMenu" class="md:hidden text-primary text-xl">☰</button>
        </div>
      </div>

      <!-- 移动菜单 -->
      <div v-if="menuOpen" class="md:hidden bg-darker border-t border-gray-700">
        <router-link to="/" class="block px-4 py-2 text-gray-300 hover:text-primary">首页</router-link>
        <router-link to="/archive" class="block px-4 py-2 text-gray-300 hover:text-primary">归档</router-link>
        <router-link to="/categories" class="block px-4 py-2 text-gray-300 hover:text-primary">分类</router-link>
        <router-link to="/tags" class="block px-4 py-2 text-gray-300 hover:text-primary">标签</router-link>
        <router-link to="/about" class="block px-4 py-2 text-gray-300 hover:text-primary">关于</router-link>
        <router-link to="/search" class="block px-4 py-2 text-gray-300 hover:text-primary">搜索</router-link>
        <router-link v-if="isAuthenticated" to="/favorites" class="block px-4 py-2 text-gray-300 hover:text-primary">收藏</router-link>
        
        <div v-if="isAuthenticated" class="border-t border-gray-700 px-4 py-2">
          <p class="text-gray-300 mb-2 text-sm">{{ user?.name }}</p>
          <button @click="handleLogout" class="text-gray-300 hover:text-primary transition text-sm">登出</button>
        </div>
        <div v-else class="border-t border-gray-700 px-4 py-2 space-y-2">
          <router-link to="/login" class="block text-gray-300 hover:text-primary text-sm">登陆</router-link>
          <router-link to="/register" class="block text-gray-300 hover:text-primary text-sm">注册</router-link>
        </div>
      </div>
    </nav>

    <!-- 主内容 -->
    <main class="max-w-7xl mx-auto px-4 py-12">
      <router-view />
    </main>

    <!-- 页脚 -->
    <footer class="bg-darker text-gray-400 py-8 mt-12">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <p>&copy; 2024 Tech Blog. All rights reserved.</p>
        <p class="text-sm mt-2">Made with ❤️ by <a href="https://github.com/ranp9275-sketch" class="text-primary hover:underline">ranp9275-sketch</a></p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDarkMode } from './composables/useDarkMode'
import { useAuth } from './composables/useAuth'

const router = useRouter()
const menuOpen = ref(false)
const { isDark, toggleDarkMode } = useDarkMode()
const { isAuthenticated, user, logout, getCurrentUser } = useAuth()

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const handleLogout = () => {
  logout()
  router.push('/')
  menuOpen.value = false
}

onMounted(() => {
  // 初始化用户信息
  if (isAuthenticated.value) {
    getCurrentUser()
  }
})
</script>

<style scoped>
.dark {
  color-scheme: dark;
}
</style>

<template>
  <div class="min-h-screen bg-light">
    <!-- 导航栏 -->
    <nav class="sticky top-0 z-50 bg-dark shadow-lg">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <router-link to="/" class="text-2xl font-bold text-primary flex items-center gap-2">
          <span class="bg-primary text-white px-3 py-1 rounded">lht</span>
          <span class="text-white">blog</span>
        </router-link>

        <div class="hidden md:flex items-center gap-8">
          <router-link to="/" class="text-gray-300 hover:text-primary transition">首页</router-link>
          <router-link to="/archive" class="text-gray-300 hover:text-primary transition">归档</router-link>
          <router-link to="/categories" class="text-gray-300 hover:text-primary transition">分类</router-link>
          <router-link to="/tags" class="text-gray-300 hover:text-primary transition">标签</router-link>
          <router-link to="/about" class="text-gray-300 hover:text-primary transition">关于</router-link>
        </div>

        <div class="flex items-center gap-4">
          <input
            type="text"
            placeholder="搜索..."
            class="hidden md:block px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button class="md:hidden text-primary">🔍</button>
          <button @click="toggleMenu" class="md:hidden text-primary">☰</button>
        </div>
      </div>

      <!-- 移动菜单 -->
      <div v-if="menuOpen" class="md:hidden bg-darker border-t border-gray-700">
        <router-link to="/" class="block px-4 py-2 text-gray-300 hover:text-primary">首页</router-link>
        <router-link to="/archive" class="block px-4 py-2 text-gray-300 hover:text-primary">归档</router-link>
        <router-link to="/categories" class="block px-4 py-2 text-gray-300 hover:text-primary">分类</router-link>
        <router-link to="/tags" class="block px-4 py-2 text-gray-300 hover:text-primary">标签</router-link>
        <router-link to="/about" class="block px-4 py-2 text-gray-300 hover:text-primary">关于</router-link>
      </div>
    </nav>

    <!-- 主内容 -->
    <main class="max-w-7xl mx-auto px-4 py-8">
      <router-view />
    </main>

    <!-- 页脚 -->
    <footer class="bg-dark text-gray-400 py-8 mt-16">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <p>&copy; 2024 技术博客. 保留所有权利。</p>
        <p class="text-sm mt-2">Powered by Vue 3 + Golang Gin</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const menuOpen = ref(false)

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}
</script>

<style scoped>
</style>

<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-4xl font-bold mb-8 dark:text-white">关于</h1>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 space-y-8">
      <section>
        <h2 class="text-2xl font-bold mb-4 dark:text-white">关于本博客</h2>
        <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
          这是一个专注于技术分享的博客平台，涵盖云原生、DevOps、编程语言、数据库等领域的深度文章。
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-bold mb-4 dark:text-white">技术栈</h2>
        <ul class="space-y-2 text-gray-600 dark:text-gray-400">
          <li class="flex items-center gap-2">
            <span class="text-primary">✓</span>
            前端: Vue 3 + Tailwind CSS
          </li>
          <li class="flex items-center gap-2">
            <span class="text-primary">✓</span>
            后端: Golang Gin + MySQL + Redis
          </li>
          <li class="flex items-center gap-2">
            <span class="text-primary">✓</span>
            部署: Docker + Kubernetes
          </li>
        </ul>
      </section>

      <section>
        <h2 class="text-2xl font-bold mb-4 dark:text-white">联系方式</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          如有任何问题或建议，欢迎通过以下方式联系我们：
        </p>
        <ul class="space-y-2 text-gray-600 dark:text-gray-400">
          <li class="flex items-center gap-2">
            <span>📧</span>
            邮箱: 4553664@qq.com
          </li>
          <li class="flex items-center gap-2">
            <span>🐙</span>
            GitHub: github.com/ranp9275-sketch
          </li>
        </ul>
      </section>

      <!-- 打赏支持 -->
      <section class="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <h2 class="text-2xl font-bold mb-4 dark:text-white">支持作者</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          如果觉得内容对你有帮助，欢迎请作者喝杯咖啡 ☕
        </p>
        <button
          @click="showDonation = true"
          class="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-8 py-3 rounded-full font-semibold transition shadow-lg"
        >
          ☕ 打赏支持
        </button>
      </section>
    </div>

    <!-- 打赏弹窗 -->
    <DonationModal :show="showDonation" @close="showDonation = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DonationModal from '../components/DonationModal.vue'

const showDonation = ref(false)
</script>

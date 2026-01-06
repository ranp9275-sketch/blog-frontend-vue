<template>
  <div class="max-w-md mx-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <h1 class="text-3xl font-bold mb-8 text-center dark:text-white">登录</h1>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <!-- 邮箱 -->
        <div>
          <label class="block text-sm font-semibold mb-2 dark:text-gray-300">邮箱</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="your@email.com"
            class="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <!-- 密码 -->
        <div>
          <label class="block text-sm font-semibold mb-2 dark:text-gray-300">密码</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            class="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <!-- 错误信息 -->
        <div v-if="error" class="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {{ error }}
        </div>

        <!-- 登录按钮 -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-primary hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-semibold transition"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <!-- 注册链接 -->
      <p class="text-center mt-6 text-gray-600 dark:text-gray-400">
        还没有账户？
        <router-link to="/register" class="text-primary hover:underline font-semibold">
          立即注册
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { login } = useAuth()

const form = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  const success = await login(form.value.email, form.value.password)

  if (success) {
    router.push('/')
  } else {
    error.value = '登录失败，请检查邮箱和密码'
  }

  loading.value = false
}
</script>

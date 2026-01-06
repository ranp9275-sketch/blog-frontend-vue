<template>
  <div class="max-w-md mx-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <h1 class="text-3xl font-bold mb-8 text-center dark:text-white">注册</h1>

      <form @submit.prevent="handleRegister" class="space-y-6">
        <!-- 名字 -->
        <div>
          <label class="block text-sm font-semibold mb-2 dark:text-gray-300">名字</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Your Name"
            class="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

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

        <!-- 确认密码 -->
        <div>
          <label class="block text-sm font-semibold mb-2 dark:text-gray-300">确认密码</label>
          <input
            v-model="form.confirmPassword"
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

        <!-- 注册按钮 -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-primary hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-semibold transition"
        >
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>

      <!-- 登录链接 -->
      <p class="text-center mt-6 text-gray-600 dark:text-gray-400">
        已有账户？
        <router-link to="/login" class="text-primary hover:underline font-semibold">
          立即登录
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
const { register } = useAuth()

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
  // 验证密码
  if (form.value.password !== form.value.confirmPassword) {
    error.value = '两次输入的密码不一致'
    return
  }

  if (form.value.password.length < 6) {
    error.value = '密码长度至少 6 位'
    return
  }

  loading.value = true
  error.value = ''

  const success = await register(form.value.email, form.value.password, form.value.name)

  if (success) {
    router.push('/')
  } else {
    error.value = '注册失败，邮箱可能已被使用'
  }

  loading.value = false
}
</script>

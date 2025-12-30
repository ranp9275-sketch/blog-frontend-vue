<template>
  <div class="max-w-md mx-auto">
    <div class="bg-white rounded-lg shadow-lg p-8">
      <h1 class="text-3xl font-bold mb-8 text-center">登陆</h1>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <!-- 邮箱 -->
        <div>
          <label class="block text-sm font-semibold mb-2">邮箱</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="your@email.com"
            class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            required
          />
        </div>

        <!-- 密码 -->
        <div>
          <label class="block text-sm font-semibold mb-2">密码</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            required
          />
        </div>

        <!-- 错误信息 -->
        <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {{ error }}
        </div>

        <!-- 登陆按钮 -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-primary hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-semibold transition"
        >
          {{ loading ? '登陆中...' : '登陆' }}
        </button>
      </form>

      <!-- 注册链接 -->
      <p class="text-center mt-6 text-gray-600">
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

  const success = await login(form.email, form.password)

  if (success) {
    router.push('/')
  } else {
    error.value = '登陆失败，请检查邮箱和密码'
  }

  loading.value = false
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold mb-8 dark:text-white">个人设置</h1>

    <!-- 未登录提示 -->
    <div v-if="!isAuthenticated" class="bg-blue-100 dark:bg-blue-900 border border-blue-400 dark:border-blue-700 text-blue-700 dark:text-blue-300 px-6 py-4 rounded-lg">
      <p>请先 <router-link to="/login" class="underline font-semibold">登录</router-link></p>
    </div>

    <div v-else class="space-y-8">
      <!-- 基本信息 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold mb-6 dark:text-white">基本信息</h2>
        <form @submit.prevent="updateProfile" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-2 dark:text-gray-300">用户名</label>
            <input
              v-model="profileForm.name"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2 dark:text-gray-300">邮箱</label>
            <input
              v-model="profileForm.email"
              type="email"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-gray-300"
              disabled
            />
            <p class="text-xs text-gray-500 mt-1">邮箱不可修改</p>
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2 dark:text-gray-300">头像 URL</label>
            <input
              v-model="profileForm.avatar"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-700 dark:text-white"
            />
            <div v-if="profileForm.avatar" class="mt-2">
              <img :src="profileForm.avatar" alt="头像预览" class="w-20 h-20 rounded-full object-cover" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2 dark:text-gray-300">个人简介</label>
            <textarea
              v-model="profileForm.bio"
              rows="3"
              placeholder="介绍一下自己..."
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-700 dark:text-white"
            ></textarea>
          </div>
          <div v-if="profileError" class="text-red-500 text-sm">{{ profileError }}</div>
          <div v-if="profileSuccess" class="text-green-500 text-sm">{{ profileSuccess }}</div>
          <button
            type="submit"
            :disabled="profileLoading"
            class="bg-primary hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            {{ profileLoading ? '保存中...' : '保存修改' }}
          </button>
        </form>
      </div>

      <!-- 修改密码 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold mb-6 dark:text-white">修改密码</h2>
        <form @submit.prevent="updatePassword" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-2 dark:text-gray-300">当前密码</label>
            <input
              v-model="passwordForm.oldPassword"
              type="password"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2 dark:text-gray-300">新密码</label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2 dark:text-gray-300">确认新密码</label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div v-if="passwordError" class="text-red-500 text-sm">{{ passwordError }}</div>
          <div v-if="passwordSuccess" class="text-green-500 text-sm">{{ passwordSuccess }}</div>
          <button
            type="submit"
            :disabled="passwordLoading"
            class="bg-primary hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            {{ passwordLoading ? '修改中...' : '修改密码' }}
          </button>
        </form>
      </div>

      <!-- 账户信息 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold mb-4 dark:text-white">账户信息</h2>
        <div class="space-y-2 text-gray-600 dark:text-gray-400">
          <p>角色：<span class="font-semibold">{{ user?.role === 'admin' ? '管理员' : '普通用户' }}</span></p>
          <p>注册时间：<span class="font-semibold">{{ formatDate(user?.created_at) }}</span></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import api from '../api/index'
import dayjs from 'dayjs'

const { isAuthenticated, user, getCurrentUser } = useAuth()

const profileForm = ref({
  name: '',
  email: '',
  avatar: '',
  bio: ''
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const profileLoading = ref(false)
const profileError = ref('')
const profileSuccess = ref('')

const passwordLoading = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')

const formatDate = (date) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const loadProfile = () => {
  if (user.value) {
    profileForm.value = {
      name: user.value.name || '',
      email: user.value.email || '',
      avatar: user.value.avatar || '',
      bio: user.value.bio || ''
    }
  }
}

const updateProfile = async () => {
  profileLoading.value = true
  profileError.value = ''
  profileSuccess.value = ''

  try {
    await api.put('/user/profile', {
      name: profileForm.value.name,
      avatar: profileForm.value.avatar,
      bio: profileForm.value.bio
    })
    await getCurrentUser()
    profileSuccess.value = '保存成功'
  } catch (err) {
    profileError.value = err.response?.data?.error || '保存失败'
  } finally {
    profileLoading.value = false
  }
}

const updatePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = '两次输入的密码不一致'
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    passwordError.value = '新密码长度至少 6 位'
    return
  }

  passwordLoading.value = true
  passwordError.value = ''
  passwordSuccess.value = ''

  try {
    await api.put('/user/password', {
      old_password: passwordForm.value.oldPassword,
      new_password: passwordForm.value.newPassword
    })
    passwordSuccess.value = '密码修改成功'
    passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  } catch (err) {
    passwordError.value = err.response?.data?.error || '密码修改失败'
  } finally {
    passwordLoading.value = false
  }
}

onMounted(async () => {
  if (isAuthenticated.value) {
    await getCurrentUser()
    loadProfile()
  }
})
</script>

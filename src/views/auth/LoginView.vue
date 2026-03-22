<template>
  <div class="auth-form">
    <div class="auth-brand">
      <div class="auth-brand__mark" aria-hidden="true">
        <i class="pi pi-ticket text-lg text-white" />
      </div>
    </div>

    <h1 class="auth-form__title">Welcome back</h1>
    <p class="auth-form__subtitle">Sign in to manage your support tickets</p>

    <form class="auth-form__fields" @submit.prevent="handleLogin">
      <div class="auth-field">
        <label class="auth-label" for="email">Email</label>
        <InputText
          id="email"
          v-model="email"
          type="email"
          placeholder="you@example.com"
          class="auth-input w-full"
          :class="{ 'p-invalid': errors.email }"
          autocomplete="email"
        />
        <small v-if="errors.email" class="auth-error">{{ errors.email }}</small>
      </div>

      <div class="auth-field">
        <label class="auth-label" for="password">Password</label>
        <Password
          id="password"
          v-model="password"
          placeholder="Your password"
          class="auth-password w-full"
          fluid
          :feedback="false"
          toggleMask
          inputClass="auth-input w-full"
          :class="{ 'p-invalid': errors.password }"
          autocomplete="current-password"
        />
        <small v-if="errors.password" class="auth-error">{{ errors.password }}</small>
      </div>

      <Message
        v-if="serverError"
        severity="error"
        :closable="false"
        class="auth-message"
      >
        {{ serverError }}
      </Message>

      <Button
        type="submit"
        label="Sign in"
        class="auth-btn-primary w-full rounded-4xl!"
        :loading="loading"
      />

      <p class="auth-footer">
        <span class="auth-footer__muted">Don&apos;t have an account?</span>
        <router-link to="/register" class="auth-link">Register</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation } from '@vue/apollo-composable'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useAuthStore } from '../../stores/auth'
import { LOGIN } from '../../graphql/mutations'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errors = ref({})
const serverError = ref('')

const { mutate: loginMutate, loading } = useMutation(LOGIN)

function validate() {
  errors.value = {}

  if (!email.value) {
    errors.value.email = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    errors.value.email = 'Please enter a valid email'
  }

  if (!password.value) {
    errors.value.password = 'Password is required'
  } else if (password.value.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
  }

  return Object.keys(errors.value).length === 0
}

async function handleLogin() {
  serverError.value = ''

  if (!validate()) return

  try {
    const result = await loginMutate({
      email: email.value,
      password: password.value,
    })

    const { token, user, errors: apiErrors } = result.data.login

    if (apiErrors && apiErrors.length > 0) {
      serverError.value = apiErrors[0]
      return
    }

    authStore.setAuth(user, token)

    if (user.role === 'admin') {
      router.push('/admin/dashboard')
    } else {
      router.push('/tickets')
    }
  } catch {
    serverError.value = 'Something went wrong. Please try again.'
  }
}
</script>

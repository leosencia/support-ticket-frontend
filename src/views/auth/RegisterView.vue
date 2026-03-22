<template>
  <div class="auth-form">
    <div class="auth-brand">
      <div class="auth-brand__mark" aria-hidden="true">
        <i class="pi pi-ticket text-lg text-white" />
      </div>
    </div>

    <h1 class="auth-form__title">Create an account</h1>
    <p class="auth-form__subtitle">Register to submit and track support tickets</p>

    <form class="auth-form__fields" @submit.prevent="handleRegister">
      <div class="auth-field">
        <label class="auth-label" for="reg-email">Email</label>
        <InputText
          id="reg-email"
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
        <label class="auth-label" for="reg-password">Password</label>
        <Password
          id="reg-password"
          v-model="password"
          placeholder="At least 6 characters"
          class="auth-password w-full"
          fluid
          :feedback="false"
          toggleMask
          inputClass="auth-input w-full"
          :class="{ 'p-invalid': errors.password }"
          autocomplete="new-password"
        />
        <small v-if="errors.password" class="auth-error">{{ errors.password }}</small>
      </div>

      <div class="auth-field">
        <label class="auth-label" for="passwordConfirmation">Confirm password</label>
        <Password
          id="passwordConfirmation"
          v-model="passwordConfirmation"
          placeholder="Repeat your password"
          class="auth-password w-full"
          fluid
          :feedback="false"
          toggleMask
          inputClass="auth-input w-full"
          :class="{ 'p-invalid': errors.passwordConfirmation }"
          autocomplete="new-password"
        />
        <small v-if="errors.passwordConfirmation" class="auth-error">{{ errors.passwordConfirmation }}</small>
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
        label="Create account"
        class="auth-btn-primary w-full rounded-4xl!"
        :loading="loading"
      />

      <p class="auth-footer">
        <span class="auth-footer__muted">Already have an account?</span>
        <router-link to="/login" class="auth-link">Sign in</router-link>
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
import { REGISTER } from '../../graphql/mutations'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const errors = ref({})
const serverError = ref('')

const { mutate: registerMutate, loading } = useMutation(REGISTER)

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

  if (!passwordConfirmation.value) {
    errors.value.passwordConfirmation = 'Please confirm your password'
  } else if (passwordConfirmation.value !== password.value) {
    errors.value.passwordConfirmation = 'Passwords do not match'
  }

  return Object.keys(errors.value).length === 0
}

async function handleRegister() {
  serverError.value = ''

  if (!validate()) return

  try {
    const result = await registerMutate({
      email: email.value,
      password: password.value,
      passwordConfirmation: passwordConfirmation.value,
    })

    const { token, user, errors: apiErrors } = result.data.register

    if (apiErrors && apiErrors.length > 0) {
      serverError.value = apiErrors[0]
      return
    }

    authStore.setAuth(user, token)
    router.push('/tickets')
  } catch {
    serverError.value = 'Something went wrong. Please try again.'
  }
}
</script>

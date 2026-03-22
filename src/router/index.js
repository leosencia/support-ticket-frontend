import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AuthLayout from '@/layouts/AuthLayout.vue'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import UserLayout from '@/layouts/UserLayout.vue'
import TicketsView from '@/views/user/TicketsView.vue'
import CreateTicketView from '@/views/user/CreateTicketView.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminDashboardView from '@/views/admin/AdminDashboardView.vue'
import AdminTicketsView from '@/views/admin/AdminTicketsView.vue'
import TicketDetailedView from '@/views/user/TicketDetailedView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    {
      path: '/login',
      component: AuthLayout,
      children: [
        {
          path: '',
          name: 'login',
          component: LoginView,
          meta: { guestOnly: true },
        },
      ],
    },
    {
      path: '/register',
      component: AuthLayout,
      children: [
        {
          path: '',
          name: 'register',
          component: RegisterView,
          meta: { guestOnly: true },
        },
      ],
    },
    {
      path: '/',
      component: UserLayout,
      meta: { requiresAuth: true },
      children: [
        { path: 'tickets', name: 'tickets', component: TicketsView },
        { path: 'tickets/new', name: 'create-ticket', component: CreateTicketView },
        { path: 'tickets/:id', name: 'ticket-detailed', component: TicketDetailedView },
      ],
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        { path: 'dashboard', name: 'admin-dashboard', component: AdminDashboardView },
        { path: 'tickets', name: 'manage-tickets', component: AdminTicketsView },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isLoggedIn = !!authStore.token
  const isAdmin = authStore.user?.role === 'admin'

  if (to.meta.requiresAuth && !isLoggedIn) {
    return next({ name: 'login' })
  }

  if (to.meta.requiresAdmin && !isAdmin) {
    return next({ name: 'tickets' })
  }

  if (to.meta.guestOnly && isLoggedIn) {
    if (isAdmin) {
      return next({ name: 'admin-dashboard' })
    }
    return next({ name: 'tickets' })
  }

  next()
})

export default router
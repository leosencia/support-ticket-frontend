import HomeView from '@/views/HomeView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import {useAuthStore} from '../stores/auth'
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
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/',
      component: AuthLayout,
      children: [
        {
          path: 'login',
          name: 'login',
          component: LoginView,
          meta: {guestOnly: true}
        },
        {
          path: 'register',
          name: 'register',
          component: RegisterView,
          meta: {guestOnly: true}
        },
      ]
    },
    {
      path: '/',
      component: UserLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'tickets',
          name: 'tickets',
          component: TicketsView,
        },
        {
          path: 'tickets/new',
          name: 'create-ticket',
          component: CreateTicketView
        },
        {
          path: 'tickets/:id',
          name: 'ticket-detailed',
          component: TicketDetailedView
        }
      ]
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: AdminDashboardView
        },
        {
          path: 'tickets',
          name: 'manage-tickets',
          component: AdminTicketsView
        }
      ]
    }
  ],
})

// route-guard 
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isLoggedIn = !!authStore.token
  const isAdmin = authStore.user?.role === "admin"

  // check for authentication, if requires auth AND is not logged in redirect to login --- next({name: 'name})
  if (to.meta.requiresAuth && !isLoggedIn) {
    return next({name: 'login'})
  }

  // check for admin role equirement, if requiresAdmin && is NOT admin, redirect to tickets
  if (to.meta.requiresAdmin && !isAdmin) {
    return next({name: 'tickets'})
  }

  // check whether route is for guest and user is logged in, redirect to appropriate routes if not (based on user role)-- 
  if (to.meta.guestOnly && isLoggedIn) {
    if (isAdmin) {
      return next({name: 'admin-dashboard'})
    } else {
      return next({name: 'tickets'})
    }
  }

  //default
  next()
})

export default router

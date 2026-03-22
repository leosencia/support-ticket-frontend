<template>
    <div class="admin-layout">
        <Toast/>
        <span>Admin Panel</span>
        <nav>
            <router-link to="/admin/dashboard">Dashboard</router-link>
            <router-link to="/admin/tickets">Manage Tickets</router-link>
            <button @click="handleLogout">Logout</button>
        </nav>
        <main>
            <router-view/>
        </main>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth'
import { Toast } from 'primevue';

const router = useRouter();
const authStore = useAuthStore()

function handleLogout() {
    authStore.logout()
    router.push('/login')
}

</script>
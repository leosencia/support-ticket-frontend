<template>
    <div class="user-layout">
        <Toast/>
        <span>Support Tickets</span>
        <nav>
            <router-link to="/tickets">My Tickets</router-link>
            <router-link to="/tickets/new">New Ticket</router-link>
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

function handleLogout(){
    authStore.logout()
    router.push('/login')
}

</script>
import './assets/main.css'
import { createApp, provide, h } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Material from '@primevue/themes/material'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import 'primeicons/primeicons.css'

import App from './App.vue'
import router from './router'
import apolloClient from './apollo'
import { DefaultApolloClient } from '@vue/apollo-composable'

// const app = createApp(App)

const app = createApp({
    setup() {
        provide(DefaultApolloClient, apolloClient)
    },
    render: () => h(App)
})

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: Material,
        options: {
            darkModeSelector: ".dark-mode"
        }
    }
})
app.use(ToastService)
app.use(ConfirmationService)

app.mount('#app')

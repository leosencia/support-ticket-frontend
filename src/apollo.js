import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { useAuthStore } from './stores/auth'

const httpLink = createHttpLink({
    uri: import.meta.env.VITE_API_URL
})

const authLink = setContext((_, {headers}) => {
    const authStore = useAuthStore()
    const token = authStore.token

    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}`: ''
        }
    }
})

const errorLink = onError(({graphQLErrors, networkError}) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(({message}) => {
            console.log(`GraphQL error: ${message}`)

            // if token expired or is invalid do: log user out, redirect to login page
            if (message.includes('Token has expired') || message.includes('Invalid token')) {
                const authStore = useAuthStore()
                authStore.logout()
                window.location.href = '/login'
            }
        })
    }

    if (networkError) {
        // just log
        console.log(`Network error: ${networkError}`)
    }
})

const apolloClient = new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache()
})

export default apolloClient;
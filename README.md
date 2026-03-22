# Support Ticket Management System — Client

A Vue 3 Single Page Application for the Support Ticket Management System. Built with Vue 3, Apollo Client, and PrimeVue.

---

## Tech Stack

- **Vue 3** — frontend framework (Composition API)
- **Vue Router 4** — client-side routing
- **Pinia** — state management
- **Apollo Client** — GraphQL client
- **PrimeVue** — UI component library

---

## Prerequisites

- Node.js 18+
- npm 9+

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/support-ticket-client.git
cd support-ticket-client
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure the API URL

Open `src/apollo.js` and make sure the API URL points to your backend:
Copy the example env file:
```bash
cp .env.example .env
```

Update `.env` with your API URL:
```
VITE_API_URL=http://localhost:3000/graphql
```

### 4. Start the development server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## Test Accounts

| Role  | Email | Password |
|-------|-------|----------|
| Admin | admin@support.com | password123 |
| User  | juan@example.com | password123 |
| User  | maria@example.com | password123 |

---

## Features

### User
- Register and log in
- Submit support tickets with subject, category, description, and priority
- View all personal tickets with status and priority badges
- Edit open tickets
- Cancel open tickets

### Admin
- Dashboard with ticket statistics overview
- View and manage all tickets
- Filter tickets by status, category, and priority
- Update ticket status and priority
- Assign tickets to support staff
- Delete tickets

---

## Project Structure
```
src/
├── apollo.js              # Apollo Client setup with JWT auth
├── main.js                # App entry point
├── App.vue                # Root component
├── router/
│   └── index.js           # Routes and navigation guards
├── stores/
│   └── auth.js            # Pinia auth store
├── graphql/
│   ├── queries.js         # All GraphQL queries
│   └── mutations.js       # All GraphQL mutations
├── layouts/
│   ├── AuthLayout.vue     # Layout for login/register
│   ├── UserLayout.vue     # Layout for user pages
│   └── AdminLayout.vue    # Layout for admin pages
└── views/
    ├── auth/
    │   ├── LoginView.vue
    │   └── RegisterView.vue
    ├── user/
    │   ├── TicketsView.vue
    │   ├── CreateTicketView.vue
    │   └── TicketDetailView.vue
    └── admin/
        ├── AdminDashboardView.vue
        └── AdminTicketsView.vue
```

---

## Key Architectural Decisions

### SPA with Vue Router
The app is a Single Page Application — only one HTML file is ever loaded. Vue Router handles all navigation client-side, swapping components in and out without page reloads.

### JWT Authentication
On login, the server returns a JWT token which is stored in `localStorage` and Pinia. Apollo Client automatically attaches it to every GraphQL request via an auth link. The token persists across page refreshes.

### Role-Based Access
Navigation guards in Vue Router check the user's role before every route change. Regular users are redirected away from admin routes. Unauthenticated users are redirected to login.

### Apollo Cache Management
List pages use `fetchPolicy: 'network-only'` to always fetch fresh data. Mutations use `refetchQueries` to keep the cache in sync after writes.

---

## Building for Production
```bash
npm run build
```

Output is in the `dist/` folder.

---

## Deployment

This app is deployed at: 
```

---

## ✅ Where to Put These Files
```
support-ticket-api/
└── README.md          ← Rails backend README

support-ticket-client/
└── README.md          ← Vue frontend README
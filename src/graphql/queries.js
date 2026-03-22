import { gql } from "@apollo/client/core";

// getTickets, getTicket, getLoggedInUser, getDashboardStats

// getTickets return values: id, subject, description, category, priority, status, assignedTo, createdAt, updatedAt, requester (id, email)
export const GET_TICKETS = gql`
    query GetTickets{
        tickets{
            id
            subject
            description
            category
            priority
            status
            assignedTo
            createdAt
            updatedAt
            requester{
                id
                email
            }
        }
    }
`

// getTicket takes one param: id
export const GET_TICKET = gql`
    query GetTicket($id: ID!){
        ticket(id: $id){
            id
            subject
            description
            category
            priority
            status
            assignedTo
            createdAt
            updatedAt
            requester{
                id
                email
            }
        }
    }
`

// get logged in user || getMe
export const GET_ME = gql`
    query GetMe{
        me{
            id
            email
            role
        }
    }
`

// getDashboardStats return values: totalTickets, openTickets, resolvedTickets, highPriorityTickets
export const GET_DASHBOARD_STATS = gql`
    query GetDashboardStats{
        dashboardStats{
            totalTickets
            openTickets
            resolvedTickets
            highPriorityTickets
        }
    }
`

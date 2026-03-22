import { gql } from "@apollo/client/core";

// mutations: login, register, logout, createTicket, updateTicket, deleteTicket

// params email, password
export const LOGIN = gql`
    mutation Login($email: String!, $password: String!){
        login(email: $email, password: $password){
            user{
                email
                id
                role
            }
            token
            errors
        }
    }
`

export const REGISTER = gql`
    mutation Register($email: String!, $password: String!, $passwordConfirmation: String!){
        register(email: $email, password: $password, passwordConfirmation: $passwordConfirmation){
            user{
                email
                id
                role
            }
            token
            errors
        }
    }
`

export const LOGOUT = gql`
    mutation Logout{
        logout{
            message
            errors
        }
    }
`

export const CREATE_TICKET = gql`
    mutation CreateTicket($subject: String!, $description: String!, $category: String!, $priority: String!){
        createTicket(subject: $subject, description: $description, category: $category, priority: $priority){
            ticket{
                subject
                description
                category
                priority
                status
            }
            errors
        }
    }
`

export const UPDATE_TICKET = gql`
    mutation UpdateTicket($id: ID!, $subject: String, $description: String, $category: String, $priority: String!, $status: String, $assignedTo: String){
        updateTicket(
            id: $id
            subject: $subject
            description: $description
            category: $category
            priority: $priority
            status: $status
            assignedTo: $assignedTo
        ){
            ticket {
                id
                subject
                status
                assignedTo
            }
            errors
        }
    }
`

export const DELETE_TICKET = gql`
    mutation DeleteTicket($id: ID!){
        deleteTicket(id: $id){
            message
            errors
        }
    }
`


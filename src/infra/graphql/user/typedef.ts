import { gql } from 'apollo-server-fastify';

const UserTypeDef = gql`
  type User {
    id: ID!
    first_name: String!
    last_name: String!
    email: String!
    admin: Boolean!
    active: Boolean
  }

  type SignupOutput {
    token: String!
    user: User!
  }

  extend type Query {
    getUserById(id: String!): User!
  }

  input Signup {
    first_name: String!
    last_name: String!
    email: String!
    password: String!
  }

  input Login {
    email: String!
    password: String!
  }

  input UpdateUser {
    first_name: String!
    last_name: String!
    email: String!
  }

  extend type Mutation {
    signup(input: Signup!): SignupOutput!
    login(input: Login!): SignupOutput!
    updateUser(input: UpdateUser!): ID!
    forgotPassword(email: String!): String!
    resetPassword(token: String!, password: String!): String!
  }
`;

export default UserTypeDef;

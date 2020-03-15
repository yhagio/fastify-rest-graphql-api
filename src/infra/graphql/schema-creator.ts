import merge from 'lodash.merge';
import { gql } from 'apollo-server-fastify';

import UserTypeDef from './user/typedef';
import UserResolver from './user/resolver';

const BaseSchema = gql`
  type Query {
    _: Boolean
  }
  type Mutation {
    _: Boolean
  }
  type Subscription {
    _: Boolean
  }
`;

export const typeDefs = [BaseSchema, UserTypeDef];
export const resolvers = merge({}, UserResolver);

import { gql } from "graphql-tag";
// Define the schema
const typeDefs = gql`
  type Message {
    id: ID!
    text: String!
  }

  type Subscription {
    messageAdded: Message
  }

  type Query {
    messages: [Message]
  }

  type Mutation {
    addMessage(text: String!): Message
  }
`;

export default typeDefs;

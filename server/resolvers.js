import { PubSub } from "graphql-subscriptions";
const pubsub = new PubSub();

const resolvers = {
  Subscription: {
    messageAdded: {
      subscribe: () => pubsub.asyncIterator(["MESSAGE_ADDED"]),
    },
  },
  Query: {
    messages: () => messages,
  },
  Mutation: {
    addMessage: (_, { text }) => {
      const message = { id: Date.now(), text };
      pubsub.publish("MESSAGE_ADDED", { messageAdded: message });
      return message;
    },
  },
};

export default resolvers;

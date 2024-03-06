import React, { useState, useEffect } from "react";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useSubscription,
  useMutation,
  gql,
} from "@apollo/client";

// GraphQL mutation to add a new message
const ADD_MESSAGE = gql`
  mutation AddMessage($text: String!) {
    addMessage(text: $text) {
      id
      text
    }
  }
`;

// GraphQL subscription to receive new messages
const MESSAGE_ADDED_SUBSCRIPTION = gql`
  subscription {
    messageAdded {
      id
      text
    }
  }
`;

// Chat component
function Chat() {
  const [messages, setMessages] = useState([]);
  const [addMessage] = useMutation(ADD_MESSAGE);

  // Subscribe to the MESSAGE_ADDED_SUBSCRIPTION and update the messages state when a new message is received
  const { data: messageAddedData } = useSubscription(
    MESSAGE_ADDED_SUBSCRIPTION
  );

  // Update the messages state when a new message is received
  useEffect(() => {
    if (messageAddedData) {
      setMessages((prevMessages) => [
        ...prevMessages,
        messageAddedData.messageAdded,
      ]);
    }
  }, [messageAddedData]);

  // Handle sending a new message
  const handleSendMessage = async (text) => {
    try {
      await addMessage({ variables: { text } });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <ul>
        {messages.map((message) => (
          <li key={message.id}>{message.text}</li>
        ))}
      </ul>
      <input
        type="text"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSendMessage(e.target.value);
            e.target.value = "";
          }
        }}
      />
    </div>
  );
}

// Create a WebSocketLink for GraphQL subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: "ws://localhost:4000/subscriptions",
    on: {
      error: (err) => console.error(err),
      open: () => console.log("connected"),
      close: () => console.log("disconnected"),
    },
    options: {
      reconnect: true,
    },
  })
);

// Create an ApolloClient with the WebSocketLink and InMemoryCache
const client = new ApolloClient({
  link: wsLink,
  cache: new InMemoryCache(),
});

// Wrap the app with the ApolloProvider and render the Chat component
function App() {
  return (
    <ApolloProvider client={client}>
      <Chat />
    </ApolloProvider>
  );
}

export default App;

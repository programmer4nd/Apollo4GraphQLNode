import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { createUploadLink } from 'apollo-upload-client';
const httpLink = new createUploadLink({  //HttpLink
  uri: 'http://localhost:4100/graphql',
  credentials: 'same-origin'//'include'
});
const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists 
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: "",
      //'Apollo-Require-Preflight': 'true'
    }
  }
});
// const client = new ApolloClient({
//   uri: 'http://localhost:4000/graphql',
//   cache: new InMemoryCache(),
//   link: authLink.concat(httpLink),
// });
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink),//ApolloLink.from([httpLink]),
  fetchOptions: {
    mode: "no-cors",
  },
});
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ApolloProvider client={client}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </ApolloProvider>,

);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

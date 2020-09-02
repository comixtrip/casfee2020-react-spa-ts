import React, { useEffect } from 'react';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context';
import { useAuth0 } from '@auth0/auth0-react';
import { useRecoilState } from 'recoil';
import { atomTokenState } from '../atom.js';
import { split, from } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';

const ApolloWrapper: React.FC<any> = ({ children }) => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [bearerToken, setBearerToken] = useRecoilState<any>(atomTokenState);

  console.log('ApolloWrapper');

  useEffect(() => {
    console.log('useEffect');
    const getToken = async () => {
      const token = isAuthenticated ? await getAccessTokenSilently() : '';
      console.log('token', token);
      if (token.length) {
        console.log('settoken');
        setBearerToken(token);
        localStorage.setItem('token', token);
      }
    };
    getToken();
  }, [getAccessTokenSilently, isAuthenticated]);

  const httpLink = new HttpLink({
    uri: 'http://localhost:8080/v1/graphql',
  });

  const wsLink = new WebSocketLink({
    uri: 'ws://localhost:8080/v1/graphql',
    options: {
      reconnect: true,
      connectionParams: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      },
    },
  });

  const authLink = setContext((_, { headers, ...rest }) => {
    if (!localStorage.getItem('token')) return { headers };
    console.log('bearerToken', bearerToken);
    return {
      ...rest,
      headers: {
        ...headers,
        authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    };
  });

  /* Set up local cache */
  const cache = new InMemoryCache();

  interface Definintion {
    kind: string;
    operation?: string;
  }

  const link = split(
    // split based on operation type
    ({ query }) => {
      const { kind, operation }: Definintion = getMainDefinition(query);
      return kind === 'OperationDefinition' && operation === 'subscription';
    },
    wsLink,
    authLink.concat(httpLink),
  );

  /* Create Apollo Client */
  const client = new ApolloClient({
    link,
    cache,
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default ApolloWrapper;

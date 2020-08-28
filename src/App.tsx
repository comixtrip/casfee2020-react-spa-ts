import React, { useState } from 'react';
import { ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import ChatApp from './components/ChatApp';
import NotFound from './components/NotFound';
import Header from './components/Header';
import { useApolloClient } from '@apollo/react-hooks';
import { useRecoilState } from 'recoil';
import { userState } from './atom.js';
import { Route, Switch, Redirect } from 'react-router-dom';

const USER = gql`
  query($user_id: Int!) {
    user(where: { id: { _eq: $user_id } }) {
      id
      username
    }
  }
`;

const App: React.FC = () => {
  const [inputValue, setInputValue] = useState<any>();
  const [state, setState] = useRecoilState<any>(userState);

  const client = useApolloClient();

  const handleNameChange = (event: any) => {
    setInputValue(event.target.value);
  };

  const handleNameSubmit = async (event: any) => {
    event.preventDefault();
    const user = await client.query({
      query: USER,
      variables: {
        user_id: inputValue,
      },
    });
    const state = {
      isLoggedIn: true,
      username: user.data.user[0].username,
      user_id: user.data.user[0].id,
    };
    setState(state);
  };

  return (
    <div className="app">
      {state.isLoggedIn ? (
        <ApolloConsumer>
          {(client) => {
            return (
              <React.Fragment>
                <Header />
                <Switch>
                  <Route
                    exact
                    path="/:channel"
                    render={(props) => (
                      <ChatApp
                        {...props}
                        client={client}
                        username={state.username}
                        user_id={state.user_id}
                      />
                    )}
                  />
                  <Redirect from="/" exact to="/casfee20" />
                  <Route
                    exact
                    path="/not-found"
                    render={(props) => <NotFound />}
                  />
                  <Redirect to="/not-found" />
                </Switch>
              </React.Fragment>
            );
          }}
        </ApolloConsumer>
      ) : (
        <React.Fragment>
          <form onSubmit={handleNameSubmit}>
            <label>Name:</label>
            <select value={inputValue} onChange={handleNameChange}>
              <option>select name</option>
              <option value="1">tom</option>
              <option value="3">roli</option>
              <option value="15">hasura</option>
              <option value="4">kimibimi</option>
            </select>
            <input type="submit" value="Submit" />
          </form>
        </React.Fragment>
      )}
    </div>
  );
};

export default App;

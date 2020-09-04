import React from 'react';
import { Route } from 'react-router-dom';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import Loading from './Loading';

interface PrivateRouteProps {
  component: any;
  path: any;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component, ...path }) => {
  return (
    <Route
      component={withAuthenticationRequired(component, {
        onRedirecting: () => <Loading />,
      })}
      {...path}
    />
  );
};

export default PrivateRoute;
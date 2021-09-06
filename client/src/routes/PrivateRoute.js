import React from 'react';
import { Route, useHistory } from 'react-router-dom';

export default function PrivateRoute({ component: Component, ...rest }) {
  const token = localStorage.getItem('accessToken');
  const history = useHistory();
  return (
    <Route
      {...rest}
      render={(props) => {
        return token != null ? (
          <Component {...props} />
        ) : (
          history.push({
            pathname: '/',
            message: 'Please log in to access this page.',
          })
        );
      }}
    ></Route>
  );
}

/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import { useShallowEqualSelector } from '@hooks';
import { Route, Redirect } from 'react-router-dom';
import * as selectors from '@store/selectors';

function PrivateRoute(props) {
  const { component: Component, ...rest } = props;
  const { session } = useShallowEqualSelector(selectors.getSession);

  return (
    <Route
      {...rest}
      render={props =>
        session.user && session.user._id ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
}

PrivateRoute.propTypes = {
  component: PropTypes.func.isRequired,
};

export default PrivateRoute;

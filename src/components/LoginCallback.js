import React from 'react';
import { withRouter } from 'react-router-dom';
import { parse } from 'qs';

import { setToken } from '../services/AuthService';

class LoginCallback extends React.Component {

  componentDidMount () {
    setToken(
      parse(this.props.location.hash.slice(1)).access_token
    );
    this.props.history.push('/');
  }

  render () {
    return (
      <span>...</span>
    );
  }
}

export default withRouter(LoginCallback);
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import * as RouteConstants from '../constants/RouteConstants';

import Home from './Home';
import TransferPlaylist from './transfer-playlist/TransferPlaylist';
import LoginCallback from './LoginCallback';

export default class Routes extends React.Component {
  render () {
    return (
      <Switch>
        <Route exact path={RouteConstants.HOME} component={Home}/>
        <Route path={RouteConstants.TRANSFER_PLAYLIST} component={TransferPlaylist}/>
        <Route path={RouteConstants.LOGIN_CALLBACK} component={LoginCallback}/>
      </Switch>
    );
  }
}
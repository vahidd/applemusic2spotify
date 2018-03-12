import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, withRouter } from 'react-router-dom';

import * as RouteConstants from '../../constants/RouteConstants';

class Header extends React.Component {
  render () {
    return (
      <Layout.Header id="header">
        <h1>Apple Music 2 Spotify <span role="img" aria-label="Music">🥁</span></h1>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={[this.props.location.pathname]}
          style={{lineHeight: '64px'}}
        >
          <Menu.Item key={RouteConstants.HOME}>
            <Link to={RouteConstants.HOME}>Home</Link>
          </Menu.Item>
          <Menu.Item key={RouteConstants.TRANSFER_PLAYLIST}>
            <Link to={RouteConstants.TRANSFER_PLAYLIST}>Transfer Playlist</Link>
          </Menu.Item>
        </Menu>
      </Layout.Header>
    );
  }
}

export default withRouter(Header);
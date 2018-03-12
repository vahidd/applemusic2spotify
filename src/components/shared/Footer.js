import React from 'react';
import { Layout } from 'antd';

export default class Footer extends React.Component {
  render () {
    return (
      <Layout.Footer style={{textAlign: 'center'}}>
        Proudly created with <a href="https://github.com/facebook/create-react-app">creat-react-app</a>
        <span> and </span>
        <a href="https://ant.design/">Ant Design</a>
      </Layout.Footer>
    );
  }
}
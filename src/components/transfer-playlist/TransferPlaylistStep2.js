import React from 'react';
import PropTypes from 'prop-types';
import { Table, Icon, Button } from 'antd';

import AppleMusicPlaylist from '../../services/AppleMusicPlaylist';

export default class TransferPlaylistStep2 extends React.Component {

  state = {
    selectedRowKeys: []
  };

  nextStep () {
    this.props.playlist.filter(this.state.selectedRowKeys);
    this.props.next();
  };

  onSelectChange = (selectedRowKeys) => {
    this.setState({selectedRowKeys});
  };

  nextStepButton () {
    const {selectedRowKeys} = this.state;
    const hasSelected = selectedRowKeys.length > 0;
    return <div style={{margin: '16px 0', textAlign: 'right'}}>
           <span style={{marginRight: 8}}>
            {hasSelected ? `Selected ${selectedRowKeys.length} items` : ''}
          </span>
      <Button
        type="primary"
        size={'large'}
        onClick={this.nextStep.bind(this)}
        disabled={!hasSelected}
      >
        Next Step<Icon type="arrow-right"/>
      </Button>
    </div>;
  }

  render () {
    const {selectedRowKeys} = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    return (
      <div>
        {this.nextStepButton()}
        <Table
          rowSelection={rowSelection}
          columns={[
            {
              title    : 'Name',
              dataIndex: 'name',
            },
            {
              title    : 'Artist',
              dataIndex: 'artist',
            },
            {
              title    : 'Album',
              dataIndex: 'album',
            }
          ]}
          rowKey={'index'}
          dataSource={this.props.playlist.playlist}
          pagination={false}
          bordered
        />
        {this.nextStepButton()}
      </div>
    );
  }
}

TransferPlaylistStep2.propTypes = {
  playlist: PropTypes.instanceOf(AppleMusicPlaylist).isRequired,
  next    : PropTypes.func.isRequired
};
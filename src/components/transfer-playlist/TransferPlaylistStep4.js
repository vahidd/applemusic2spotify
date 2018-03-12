import React from 'react';
import PropTypes from 'prop-types';
import { chunk } from 'lodash';
import { Button, Card, Dropdown, Menu, Form, Input, Modal, Checkbox, Table, Alert } from 'antd';

import { getPlaylists, createPlaylist, addTrackToPlaylist } from '../../services/ApiService';

const FormItem = Form.Item;
const {TextArea} = Input;

class TransferPlaylistStep4 extends React.Component {

  state = {
    playlist                  : null,
    userPlaylists             : null,
    fetchingPlaylists         : false,
    isCreatingPlaylist        : false,
    createPlaylistModalVisible: false,
    isImporting               : false
  };

  componentDidMount () {
    this.props.playlist.onChange(() => {
      this.forceUpdate();
    });
  }

  selectPlaylist () {
    if (this.state.userPlaylists !== null) {
      return;
    }
    this.setState({fetchingPlaylists: true});
    getPlaylists()
      .then((res) => {
        this.setState({
          fetchingPlaylists: false,
          userPlaylists    : res.data
        });
      })
      .catch(() => {
        alert('Couldn\'t get playlists. Please try again.');
      });
  }

  selectPlaylistsMenu () {
    return <Menu onClick={(event) => {
      this.setState({
        playlist: event.item.props.playlist
      }, () => {
        this.importSong();
      });
    }}>
      {this.state.userPlaylists === null ? null : this.state.userPlaylists.items.map((playlist, index) => {
        return <Menu.Item key={index} playlist={playlist}>
          {playlist.name}
        </Menu.Item>;
      })}
    </Menu>;
  }

  createPlaylistModal () {
    const {getFieldDecorator} = this.props.form;
    return <Modal
      title="Create Playlist"
      closable={false}
      maskClosable={true}
      visible={this.state.createPlaylistModalVisible}
      onCancel={() => this.setState({createPlaylistModalVisible: false})}
      footer={[
        <Button key="back" onClick={() => this.setState({createPlaylistModalVisible: false})}>Cancel</Button>,
        <Button key="submit" type="primary" loading={this.state.isCreatingPlaylist} onClick={this.createPlaylist.bind(this)}>
          Create
        </Button>,
      ]}
    >
      <Form onSubmit={this.createPlaylist.bind(this)}>
        <FormItem>
          {getFieldDecorator('name', {
            validateTrigger: 'onBlur',
            rules          : [
              {
                required: true,
                message : 'Please enter a name'
              }
            ]
          })(
            <Input placeholder="Playlist Name"/>
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('description', {
            initialValue: ''
          })(
            <TextArea autosize={true} placeholder="Playlist Description"/>
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('isPublic', {
            initialValue: true
          })(
            <Checkbox defaultChecked={true}>This is a public playlist!</Checkbox>
          )}
        </FormItem>
      </Form>
    </Modal>;
  }

  createPlaylist (e) {
    if (e)
      e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          isCreatingPlaylist: true
        });
        createPlaylist(
          this.props.user.id,
          values.name,
          values.description,
          values.isPublic
        )
          .then((res) => {
            this.setState({
              isCreatingPlaylist        : false,
              createPlaylistModalVisible: false,
              playlist                  : res.data
            });
            this.importSong();
          })
          .catch(() => {
            alert(`Couldn't create the playlist. Please refresh the page.`);
          });
      }
    });

  }

  async importSong () {
    this.props.playlist.setSpotifyStatus('importing');
    const songs = this.props.playlist.getPlaylist('withResult');
    const chunks = chunk(songs, 100);
    for (let index = 0; chunks.length > index; index++) {
      let songsUri = [];
      for (let songIndex = 0; chunks[index].length > songIndex; songIndex++) {
        songsUri.push(chunks[index][songIndex].spotifySelected.uri);
      }
      await addTrackToPlaylist(this.props.user.id, this.state.playlist.id, songsUri);
    }
    this.props.playlist.setSpotifyStatus('done');
  }

  importTable () {
    return (
      <Table
        loading={this.state.isImporting}
        bordered={true}
        rowKey="index"
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
        dataSource={this.props.playlist.getPlaylist('withResult')}
        pagination={false}/>
    );
  }

  render () {
    const {playlist} = this.props;
    if (playlist.spotifyStatus === 'done') {
      return <Alert
        message="All Songs Imported"
        description={<div>
          All songs imported. <br/>
          <a href={this.state.playlist.external_urls.spotify}>{this.state.playlist.name}</a>
        </div>}
        type="success"
        showIcon
      />;
    }
    return <div>
      {this.state.playlist === null &&
      <Card style={{marginRight: 'auto', marginLeft: 'auto', width: 650, textAlign: 'center'}}>
        <Button
          type="primary"
          size="large"
          onClick={() => this.setState({createPlaylistModalVisible: true})}
          style={{marginRight: 5}}>
          Create a New Playlist
        </Button>
        <Dropdown trigger={['click']} overlay={this.selectPlaylistsMenu()} placement="bottomLeft">
          <Button
            type="primary"
            size="large"
            onClick={this.selectPlaylist.bind(this)}
            loading={this.state.fetchingPlaylists}
            style={{marginLeft: 5}}>
            Import to Existing Playlist
          </Button>
        </Dropdown>
      </Card>}
      {this.state.playlist !== null && this.importTable()}

      {this.createPlaylistModal()}
    </div>;
  }
}

TransferPlaylistStep4.propTypes = {
  user    : PropTypes.object.isRequired,
  playlist: PropTypes.object.isRequired
};

export default Form.create()(TransferPlaylistStep4);
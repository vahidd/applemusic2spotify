import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  Icon,
  Button,
  Tag,
  Modal,
  List,
  Avatar,
  Switch,
  Popconfirm,
  Popover,
  Form,
  Input
} from 'antd';
import { each } from 'lodash';
import { formatSeconds } from '../../services/UtilsService';

import AppleMusicPlaylist from '../../services/AppleMusicPlaylist';

const FormItem = Form.Item;

class TransferPlaylistStep3 extends React.Component {

  state = {
    settingsItem   : null,
    settingsVisible: false
  };

  componentDidMount () {
    this.props.playlist.onChange(() => {
      this.forceUpdate();
    });
  }

  buttons (placement) {
    let nextStepDisabled = true;
    const {playlist} = this.props;
    const {spotifyStatus} = playlist;
    for (let index = 0; playlist.playlist.length > index; index++) {
      if (playlist.playlist[index].spotifyStatus === 'withResult') {
        nextStepDisabled = false;
      }
    }
    return <div style={{margin: '16px 0', textAlign: 'right'}}>
      <Popover
        trigger="click"
        placement={placement === 'top' ? 'bottomRight' : 'topRight'}
        content={this.settings()}
      >
        <Button
          size={'large'}
          style={{marginRight: 7}}
          icon='setting'
        >
          Search Settings
        </Button>
      </Popover>
      <Button
        size={'large'}
        icon='pause-circle'
        style={{marginRight: 7}}
        disabled={spotifyStatus !== 'searching'}
        onClick={this.pause.bind(this)}
      >
        Pause
      </Button>
      <Button
        size={'large'}
        icon='play-circle'
        style={{marginRight: 7}}
        disabled={spotifyStatus !== 'paused' && spotifyStatus !== null}
        onClick={this.resume.bind(this)}
      >
        Start/Resume
      </Button>

      {
        playlist.spotifyStatus !== 'searchComplete' &&
        <Popconfirm
          title="The search is not complete. Are you sure you want to go to the next step?"
          onConfirm={this.nextStep.bind(this)}
          okText="Yes"
          placement={placement === 'top' ? 'bottomRight' : 'topRight'}
          cancelText="No">
          <Button
            type="primary"
            size={'large'}
            disabled={nextStepDisabled}
          >
            Next Step
            <Icon type="arrow-right"/>
          </Button>
        </Popconfirm>
      }
      {
        playlist.spotifyStatus === 'searchComplete' &&
        <Button
          type="primary"
          size={'large'}
          onClick={this.nextStep.bind(this)}
          disabled={nextStepDisabled}
        >
          Next Step<Icon type="arrow-right"/>
        </Button>
      }

    </div>;
  }

  nextStep () {
    this.props.nextStep();
  }

  pause () {
    this.props.playlist.pauseSearch();
  }

  resume () {
    this.props.playlist.startSearch();
  }

  trackLabel (track) {
    const status = track.spotifyStatus;
    switch (status) {
      default:
      case 'pending':
        return <Tag color="#7f8c8d">Pending</Tag>;
      case 'failed':
        return <Tag color="#e74c3c">Failed</Tag>;
      case 'searching':
        return <Tag color="#8e44ad">Searching</Tag>;
      case 'noResult':
        return <Tag color="#f1c40f">No Result</Tag>;
      case 'withResult':
        return <Tag color="#27ae60">Found</Tag>;
    }
  }

  statusColumn (text, row) {
    const status = row.spotifyStatus;
    return <div>
      {this.trackLabel(row)}
      {
        status === 'withResult' &&
        <Button
          size={'small'}
          onClick={() => {
            this.setState({settingsItem: row.index, settingsVisible: true});
          }}><Icon type="setting"/></Button>}
    </div>;
  }

  settings () {
    const {getFieldDecorator} = this.props.form;
    return (
      <Form
        style={{width: 300}}
        onSubmit={this.settingsFormSave.bind(this)}
      >
        <FormItem
          label='Search Format'
          help="Placeholders: {name}, {artist}, {album}, {composer}, {discCount}, {discNumber}, {genre}, {trackCount}, {trackNumber} and {year}"
        >
          {getFieldDecorator('searchFormat',
            {
              initialValue: this.props.playlist.settings.searchFormat,
              rules       : [{required: true, message: 'Please fill the field.'}],
            })(
            <Input placeholder="Search Format"/>
          )}
        </FormItem>
        <FormItem style={{marginBottom: 0}}>
          <Button
            type="primary"
            style={{width: '100%'}}
            htmlType="submit"
            icon='smile-o'
          >
            Done
          </Button>
        </FormItem>
      </Form>
    );
  }

  settingsFormSave (e) {
    e.preventDefault();
    const {props} = this;
    props.form.validateFields((errors, values) => {
      if (!errors) {
        each(values, (value, key) => {
          props.playlist.option(key, value);
        });
      }
    });
  }

  songSettingsModal () {
    const {playlist} = this.props;
    const {settingsItem} = this.state;
    let track, data = [], selectedTrack;
    if (this.state.settingsItem !== null) {
      track = playlist.playlist[settingsItem];
      selectedTrack = playlist.playlist[settingsItem].spotifySelected;
      for (let index = 0; track.spotifyResults.length > index; index++) {
        let spotifyTrack = track.spotifyResults[index];
        data.push({
          index,
          id         : spotifyTrack.id,
          name       : spotifyTrack.name,
          link       : spotifyTrack.external_urls.spotify,
          image      : spotifyTrack.album.images[1].url,
          duration   : spotifyTrack.duration_ms / 1000,
          trackNumber: spotifyTrack.track_number,
          artistName : spotifyTrack.artists[0].name,
          artistLink : spotifyTrack.artists[0].external_urls.spotify,
          albumName  : spotifyTrack.album.name,
          albumLink  : spotifyTrack.album.external_urls.spotify,
          track      : spotifyTrack
        });
      }
    }
    return <Modal
      title="Song Settings"
      visible={this.state.settingsVisible}
      footer={null}
      onCancel={() => {
        this.setState({settingsVisible: false});
        setTimeout(() => this.setState({settingsItem: null}), 200);
      }}
    >
      <List
        itemLayout="horizontal"
        dataSource={data}
        renderItem={item => {
          const switchAction = <Switch
            checked={selectedTrack.id === item.id}
            onChange={() => {
              playlist.setSpotifySelected(settingsItem, item.id);
            }}/>;
          return <List.Item actions={[switchAction]}>
            <List.Item.Meta
              avatar={<Avatar src={item.image} size="large"/>}
              description={<p>Album: <a href={item.albumLink}>{item.albumName}</a> - {formatSeconds(item.duration)}</p>}
              title={<a href={item.link} target="_blank">{item.artistName} - {item.name}</a>}
            />
          </List.Item>;
        }}
      />
    </Modal>;
  }

  render () {
    return <div>
      {this.buttons('top')}
      <Table
        rowKey="index"
        columns={[
          {
            title    : 'Status',
            dataIndex: 'status',
            width    : '13%',
            render   : this.statusColumn.bind(this)
          },
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
        dataSource={this.props.playlist.playlist}
        pagination={false}
        bordered
      />
      {this.buttons('bottom')}
      {this.songSettingsModal()}
    </div>;
  }
}

TransferPlaylistStep3.propTypes = {
  playlist: PropTypes.instanceOf(AppleMusicPlaylist).isRequired,
  nextStep: PropTypes.func.isRequired
};

export default Form.create()(TransferPlaylistStep3);
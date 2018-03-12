import React from 'react';
import PropTypes from 'prop-types';
import { Upload, Button, Icon, Card, notification } from 'antd';
import AppleMusicPlaylist from '../../services/AppleMusicPlaylist';

export default class TransferPlaylistStep1 extends React.Component {

  beforeUpload (file) {
    let reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = (evt) => {
      const text = evt.target.result;
      try {
        this.props.playlist.setPlaylist(text);
        this.props.onUpload();
      }
      catch (error) {
        notification.error({
          message    : 'Error',
          description: error.message
        });
      }
    };
    reader.onerror = function (evt) {
      notification.error({
        message    : 'Error',
        description: 'Couldn\'t read file content. please try again.'
      });
    };
    return false;
  }

  render () {
    return <Card style={{marginRight: 'auto', marginLeft: 'auto', width: 650, textAlign: 'center'}}>
      <p>
        Select your playlist from iTunes and from "File" menu click on "Library > Export Playlist...". <br/>
        Then from "Format" menu select "Unicode Text" and save the file. <br/>
        Upload the file from the following field:
      </p>
      <Upload beforeUpload={this.beforeUpload.bind(this)} fileList={[]}>
        <Button>
          <Icon type="upload"/> Select File
        </Button>
      </Upload>
    </Card>;
  }
}

TransferPlaylistStep1.propTypes = {
  playlist: PropTypes.instanceOf(AppleMusicPlaylist).isRequired,
  onUpload: PropTypes.func.isRequired
};
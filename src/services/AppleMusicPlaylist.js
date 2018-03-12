import Papa from 'papaparse';
import axios from 'axios';
import axiosCancel from 'axios-cancel';
import { findIndex } from 'lodash';

import { API_URL } from '../constants/Constants';
import { getToken } from './AuthService';

axiosCancel(axios);

export default class AppleMusicPlaylist {

  constructor (settings) {
    this._playlist = [];
    this.changeCallbacks = [];
    this.spotifyStatus = null;
    this.settings = {
      searchFormat: '{name} {artist}',
      ...settings
    };
  }

  setPlaylist (playlist) {
    let parsed = Papa.parse(playlist, {
      header: true
    });
    if (parsed.errors.length && !parsed.data.length) {
      throw new Error('Couldn\'t parse the playlist.');
    }
    parsed.data.pop();
    for (let index = 0; parsed.data.length > index; index++) {
      const
        track = parsed.data[index],
        keys = Object.keys(track);
      if (!keys.includes('Name') || !keys.includes('Artist') || !keys.includes('Album')) {
        throw new Error('Playlist is not a valid apple music playlist.');
      }
      this._playlist.push({
        index,
        name           : track.Name,
        artist         : track.Artist,
        album          : track.Album,
        composer       : track.Composer,
        discCount      : track['Disc Count'],
        discNumber     : track['Disc Number'],
        genre          : track.Genre,
        trackCount     : track['Track Count'],
        trackNumber    : track['Track Number'],
        year           : track.Year,
        spotifyStatus  : 'pending',
        spotifyResults : null,
        spotifySelected: null
      });
    }
  }

  filter (indexes) {
    const newPlaylist = [];
    for (let i = 0; indexes.length > i; i++) {
      newPlaylist.push(this._playlist[indexes[i]]);
    }
    this._playlist = newPlaylist;
  }

  get playlist () {
    return this._playlist;
  }

  getPlaylist (status) {
    const output = [];
    for (let index = 0; this._playlist.length > index; index++) {
      if (this._playlist[index].spotifyStatus === status) {
        output.push(this._playlist[index]);
      }
    }
    return output;
  }

  setSpotifySelected (trackIndex, id) {
    const track = this._playlist[trackIndex];
    let selectedIndex = findIndex(track.spotifyResults, {id});
    track.spotifySelected = track.spotifyResults[selectedIndex];
    this.triggerChange();
    return this;
  }

  setSpotifyStatus (status) {
    this.spotifyStatus = status;
    this.triggerChange();

    return this;
  }

  onChange (cb) {
    this.changeCallbacks.push(cb);
  }

  triggerChange () {
    for (let index = 0; this.changeCallbacks.length > index; index++) {
      this.changeCallbacks[index]();
    }
  }

  startSearch () {
    this.searchTimeout = setTimeout(this._search.bind(this), 1);
  }

  searchKeyword (track) {
    const placeholders = ['{name}', '{artist}', '{album}', '{composer}', '{discCount}', '{discNumber}', '{genre}', '{trackCount}', '{trackNumber}', '{year}'];
    let keyword = this.settings.searchFormat;
    for (let index = 0; placeholders.length > index; index++) {
      keyword = keyword.replace(placeholders[index], track[placeholders[index].slice(1, -1)]);
    }
    return keyword;
  }

  option (key, value) {
    this.settings[key] = value;

    return this;
  }

  _search () {
    let track;
    for (let index = 0; this._playlist.length > index; index++) {
      if (this._playlist[index].spotifyStatus === 'pending') {
        track = this._playlist[index];
        break;
      }
    }
    if (!track) {
      this.spotifyStatus = 'searchComplete';
      this.triggerChange();
      return;
    }
    this.spotifyStatus = 'searching';
    track.spotifyStatus = 'searching';
    this.triggerChange();
    axios.get(
      `${API_URL}/v1/search`,
      {
        requestId: 'search',
        headers  : {
          Authorization: `Bearer ${getToken()}`
        },
        params   : {
          type : 'track',
          q    : this.searchKeyword(track),
          limit: 10
        }
      }
    )
      .then((res) => {
        track.spotifyStatus = res.data.tracks.total === 0 ? 'noResult' : 'withResult';
        track.spotifyResults = res.data.tracks.items;
        if (res.data.tracks.total)
          track.spotifySelected = res.data.tracks.items[0];
        this.searchTimeout = setTimeout(this._search.bind(this), 10);
      })
      .catch((error) => {
        track.spotifyStatus = axios.isCancel(error) ? 'pending' : 'failed';
      })
      .finally(() => {
        this.triggerChange();
      });

  }

  pauseSearch () {
    this.spotifyStatus = 'paused';
    clearTimeout(this.searchTimeout);
    this.triggerChange();
    axios.cancel('search');
  }

}
import originalAxios from 'axios';

import { API_URL } from '../constants/Constants';
import { getToken } from './AuthService';

export const axios = () => {
  if (typeof axios.instance === 'undefined') {
    axios.instance = originalAxios.create({
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
  }
  return axios.instance;
};

export const getCurrentUser = () => {
  return axios().get(
    `${API_URL}/v1/me`
  );
};

export const search = (search) => {
  return axios().get(
    `${API_URL}/v1/search`,
    {
      params: search
    }
  );
};

export const getPlaylists = () => {
  return axios().get(
    `${API_URL}/v1/me/playlists`
  );
};

export const createPlaylist = (userId, name, description = '', isPublic = false) => {
  return axios().post(
    `${API_URL}/v1/users/${userId}/playlists`,
    {
      name,
      description,
      'public': isPublic
    }
  );
};
export const addTrackToPlaylist = (userId, playlistId, uris) => {
  return axios().post(
    `${API_URL}/v1/users/${userId}/playlists/${playlistId}/tracks`,
    {uris}
  );
};
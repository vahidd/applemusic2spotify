import { SPOTIFY_CLIENT_ID } from '../constants/Constants';

export const getLoginUrl = (scopes = [
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-library-read',
  'user-library-modify',
  'user-top-read'
]) => {
  let queryArgs = [];
  queryArgs.push(`client_id=${SPOTIFY_CLIENT_ID}`);
  queryArgs.push(`response_type=token`);
  queryArgs.push(`redirect_uri=${encodeURIComponent(`${window.location.protocol}//${window.location.host}${window.location.pathname}login-callback`)}`);
  queryArgs.push(`scope=${scopes.join(' ')}`);
  return `https://accounts.spotify.com/authorize/?${queryArgs.join('&')}`;
};

export const isLoggedIn = () => localStorage.getItem('__token') !== null;

export const getToken = () => localStorage.getItem('__token');

export const logout = () => localStorage.removeItem('__token');

export const setToken = (token) => {
  localStorage.setItem('__token', token);
};
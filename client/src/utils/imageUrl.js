import { API_BASE_URL } from '../api/client';

export function getFullImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) {
    return url.replace('localhost', window.location.hostname);
  }
  const base = API_BASE_URL.replace(/\/$/, '');
  return `${base}${url}`;
}

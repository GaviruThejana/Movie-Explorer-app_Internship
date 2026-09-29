import axios from 'axios';

const API_KEY = (process.env.REACT_APP_TMDB_API_KEY || '').trim();

// TMDb accepts either a v3 API key (query param) or a v4 read-access token (Bearer header).
const isV4Token = API_KEY.startsWith('eyJ');

export const IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const hasApiKey = () =>
  Boolean(API_KEY) && API_KEY !== 'your_tmdb_api_key_here';

const tmdb = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  timeout: 12000,
  headers: {
    Accept: 'application/json',
    ...(isV4Token ? { Authorization: `Bearer ${API_KEY}` } : {}),
  },
  params: {
    language: 'en-US',
    ...(!isV4Token && API_KEY ? { api_key: API_KEY } : {}),
  },
});

/**
 * Converts any axios / TMDb error into a short, user-friendly message.
 */
export const getErrorMessage = (error) => {
  if (axios.isCancel(error)) return null;
  if (!hasApiKey()) {
    return 'TMDb API key is missing. Add REACT_APP_TMDB_API_KEY to your .env file and restart the dev server.';
  }
  if (error?.code === 'ECONNABORTED') {
    return 'The request timed out. Please check your connection and try again.';
  }
  if (!error?.response) {
    return 'Network error – unable to reach TMDb. Please check your internet connection.';
  }
  const { status, data } = error.response;
  if (status === 401) return 'Invalid TMDb API key. Please verify REACT_APP_TMDB_API_KEY in your .env file.';
  if (status === 404) return 'We could not find what you were looking for.';
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (status >= 500) return 'TMDb is having trouble right now. Please try again later.';
  return data?.status_message || 'Something went wrong. Please try again.';
};

tmdb.interceptors.request.use((config) => {
  if (!hasApiKey()) {
    const err = new Error('Missing TMDb API key');
    err.isMissingKey = true;
    return Promise.reject(err);
  }
  return config;
});

/**
 * Build a full image URL, or return null when the path is missing
 * so components can render their own fallback.
 */
export const getImageUrl = (path, size = 'w500') =>
  path ? `${IMAGE_BASE}/${size}${path}` : null;

export const getYear = (date) => (date ? String(date).slice(0, 4) : '—');

export const formatRuntime = (minutes) => {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
};

/* ------------------------------------------------------------------ */
/* API helpers                                                         */
/* ------------------------------------------------------------------ */

export const fetchTrending = async ({ page = 1, timeWindow = 'week', signal } = {}) => {
  const { data } = await tmdb.get(`/trending/movie/${timeWindow}`, {
    params: { page },
    signal,
  });
  return data;
};

export const searchMovies = async ({ query, page = 1, signal } = {}) => {
  const { data } = await tmdb.get('/search/movie', {
    params: { query, page, include_adult: false },
    signal,
  });
  return data;
};

export const fetchMovieDetails = async (id, { signal } = {}) => {
  const { data } = await tmdb.get(`/movie/${id}`, {
    params: { append_to_response: 'credits,videos,recommendations' },
    signal,
  });
  return data;
};

export const fetchGenres = async ({ signal } = {}) => {
  const { data } = await tmdb.get('/genre/movie/list', { signal });
  return data.genres || [];
};

/**
 * Pick the best YouTube trailer from a TMDb videos payload.
 * Preference: official trailer → any trailer → teaser → any YouTube video.
 */
export const pickTrailer = (videos = []) => {
  const yt = videos.filter((v) => v.site === 'YouTube');
  return (
    yt.find((v) => v.type === 'Trailer' && v.official) ||
    yt.find((v) => v.type === 'Trailer') ||
    yt.find((v) => v.type === 'Teaser') ||
    yt[0] ||
    null
  );
};

export default tmdb;

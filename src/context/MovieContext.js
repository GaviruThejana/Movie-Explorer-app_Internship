import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { useAuth } from './AuthContext';

const MovieContext = createContext(null);

const SEARCH_KEY = 'movie-explorer:last-search';
const favKey = (username) => `movie-explorer:favorites:${username || 'guest'}`;

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
};

/** Keep only the fields we need so LocalStorage stays small. */
const toFavorite = (movie) => ({
  id: movie.id,
  title: movie.title || movie.name || 'Untitled',
  poster_path: movie.poster_path || null,
  backdrop_path: movie.backdrop_path || null,
  release_date: movie.release_date || '',
  vote_average: typeof movie.vote_average === 'number' ? movie.vote_average : 0,
  overview: movie.overview || '',
  addedAt: new Date().toISOString(),
});

export const MovieProvider = ({ children }) => {
  const { user } = useAuth();
  const username = user?.username;

  const [favorites, setFavorites] = useState(() => readJSON(favKey(username), []));
  const [lastSearch, setLastSearchState] = useState(() => readJSON(SEARCH_KEY, ''));
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  // Reload favorites whenever the logged-in user changes (favorites are per user).
  useEffect(() => {
    setFavorites(readJSON(favKey(username), []));
  }, [username]);

  // Keep favorites in sync across browser tabs.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === favKey(username)) setFavorites(readJSON(favKey(username), []));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [username]);

  const notify = useCallback((message, severity = 'info') => {
    if (!message) return;
    setToast({ open: true, message, severity });
  }, []);

  const persistFavorites = useCallback(
    (updater) => {
      setFavorites((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        writeJSON(favKey(username), next);
        return next;
      });
    },
    [username]
  );

  const isFavorite = useCallback((id) => favorites.some((m) => m.id === id), [favorites]);

  const addFavorite = useCallback(
    (movie) => {
      if (!movie?.id) return;
      persistFavorites((prev) =>
        prev.some((m) => m.id === movie.id) ? prev : [toFavorite(movie), ...prev]
      );
      notify(`Added "${movie.title || movie.name}" to favorites`, 'success');
    },
    [persistFavorites, notify]
  );

  const removeFavorite = useCallback(
    (id, title) => {
      persistFavorites((prev) => prev.filter((m) => m.id !== id));
      notify(title ? `Removed "${title}" from favorites` : 'Removed from favorites', 'info');
    },
    [persistFavorites, notify]
  );

  const toggleFavorite = useCallback(
    (movie) => {
      if (!movie?.id) return;
      if (favorites.some((m) => m.id === movie.id)) {
        removeFavorite(movie.id, movie.title || movie.name);
      } else {
        addFavorite(movie);
      }
    },
    [favorites, addFavorite, removeFavorite]
  );

  const clearFavorites = useCallback(() => {
    persistFavorites([]);
    notify('All favorites cleared', 'info');
  }, [persistFavorites, notify]);

  const setLastSearch = useCallback((term) => {
    const value = String(term || '');
    setLastSearchState(value);
    writeJSON(SEARCH_KEY, value);
  }, []);

  const value = useMemo(
    () => ({
      favorites,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      clearFavorites,
      lastSearch,
      setLastSearch,
      notify,
    }),
    [favorites, isFavorite, addFavorite, removeFavorite, toggleFavorite, clearFavorites, lastSearch, setLastSearch, notify]
  );

  const handleClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setToast((t) => ({ ...t, open: false }));
  };

  return (
    <MovieContext.Provider value={value}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={toast.severity === 'error' ? 6000 : 3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={toast.severity} variant="filled" sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </MovieContext.Provider>
  );
};

export const useMovies = () => {
  const ctx = useContext(MovieContext);
  if (!ctx) throw new Error('useMovies must be used inside <MovieProvider>');
  return ctx;
};

export default MovieContext;

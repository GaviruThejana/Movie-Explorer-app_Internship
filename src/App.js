import React from 'react';
import { BrowserRouter, Link, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { Alert, Box, Button, Container, Typography } from '@mui/material';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MovieProvider } from './context/MovieContext';
import { hasApiKey } from './api/tmdb';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import Favorites from './pages/Favorites';

/** Redirects to /login (remembering where the user wanted to go) when not signed in. */
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
};

/** Shell for signed-in pages: navbar + page content. */
const AppLayout = () => (
  <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <Navbar />
    {!hasApiKey() && (
      <Container maxWidth="xl" sx={{ pt: 2 }}>
        <Alert severity="warning">
          No TMDb API key found. Create a <code>.env</code> file with <code>REACT_APP_TMDB_API_KEY=your_key</code> and
          restart <code>npm start</code>.
        </Alert>
      </Container>
    )}
    <Box component="main" sx={{ flexGrow: 1 }}>
      <Outlet />
    </Box>
    <Box component="footer" sx={{ py: 3, textAlign: 'center', borderTop: 1, borderColor: 'divider' }}>
      <Typography variant="caption" color="text.secondary">
        Movie data provided by{' '}
        <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
          TMDb
        </a>
        . This product uses the TMDb API but is not endorsed or certified by TMDb.
      </Typography>
    </Box>
  </Box>
);

const NotFound = () => (
  <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
    <Typography variant="h2" component="h1" gutterBottom>
      404
    </Typography>
    <Typography color="text.secondary" sx={{ mb: 3 }}>
      This page wandered off the set.
    </Typography>
    <Button variant="contained" component={Link} to="/">
      Back to home
    </Button>
  </Container>
);

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <MovieProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/movie/:id" element={<MovieDetails />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </MovieProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;

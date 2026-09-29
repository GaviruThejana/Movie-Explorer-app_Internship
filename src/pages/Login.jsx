import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import MovieFilterIcon from '@mui/icons-material/MovieFilter';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname
    ? `${location.state.from.pathname}${location.state.from.search || ''}`
    : '/';

  const [form, setForm] = useState({ username: '', password: '' });
  const [touched, setTouched] = useState({ username: false, password: false });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to={from} replace />;

  const usernameError = touched.username && form.username.trim().length < 3;
  const passwordError = touched.password && form.password.length < 4;

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ username: true, password: true });
    setSubmitting(true);
    // Tiny delay to mimic a network request and show the loading state.
    setTimeout(() => {
      const result = login(form.username, form.password);
      setSubmitting(false);
      if (result.ok) navigate(from, { replace: true });
      else setError(result.error);
    }, 400);
  };

  const fillDemo = () => {
    setForm({ username: 'demo', password: 'demo1234' });
    setError('');
  };

  return (
    <Box
      sx={(theme) => ({
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        background:
          theme.palette.mode === 'dark'
            ? `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.18)}, transparent 45%),
               radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, 0.2)}, transparent 45%),
               ${theme.palette.background.default}`
            : `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.25)}, transparent 45%),
               radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, 0.12)}, transparent 45%),
               ${theme.palette.background.default}`,
      })}
    >
      <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
        <IconButton onClick={toggleMode} aria-label="Toggle dark mode" sx={{ position: 'absolute', top: 16, right: 16 }}>
          {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Tooltip>

      <Card
        elevation={0}
        sx={(theme) => ({
          width: '100%',
          maxWidth: 420,
          border: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(10px)',
          bgcolor: alpha(theme.palette.background.paper, 0.85),
        })}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 3,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              <MovieFilterIcon fontSize="large" />
            </Box>
            <Typography variant="h5" component="h1" fontWeight={800} textAlign="center">
              Movie Explorer
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Discover your favorite films. Sign in to continue.
            </Typography>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" noValidate onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Username"
                value={form.username}
                onChange={handleChange('username')}
                onBlur={() => setTouched((t) => ({ ...t, username: true }))}
                error={usernameError}
                helperText={usernameError ? 'At least 3 characters' : ' '}
                autoComplete="username"
                autoFocus
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange('password')}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                error={passwordError}
                helperText={passwordError ? 'At least 4 characters' : ' '}
                autoComplete="current-password"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((s) => !s)}
                        edge="end"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button type="submit" variant="contained" size="large" disabled={submitting} fullWidth>
                {submitting ? 'Signing in…' : 'Sign in'}
              </Button>
              <Button variant="text" onClick={fillDemo} fullWidth>
                Use demo credentials
              </Button>
            </Stack>
          </Box>

          <Typography variant="caption" color="text.secondary" display="block" textAlign="center" sx={{ mt: 2 }}>
            This is a mock login — any username (3+ chars) and password (4+ chars) will work.
            Your session is stored locally in this browser.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;

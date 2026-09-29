import React, { useEffect, useRef, useState } from 'react';
import { Link as RouterLink, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import MovieFilterIcon from '@mui/icons-material/MovieFilter';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import HomeIcon from '@mui/icons-material/Home';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LogoutIcon from '@mui/icons-material/Logout';
import { useThemeMode } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useMovies } from '../context/MovieContext';
import useDebounce from '../hooks/useDebounce';

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: <HomeIcon fontSize="small" /> },
  { to: '/favorites', label: 'Favorites', icon: <FavoriteIcon fontSize="small" /> },
];

const SearchField = ({ value, onChange, onClear, onSubmit, inputRef, fullWidth }) => (
  <Box
    component="form"
    role="search"
    onSubmit={(e) => {
      e.preventDefault();
      onSubmit();
    }}
    sx={(theme) => ({
      display: 'flex',
      alignItems: 'center',
      borderRadius: 999,
      px: 1.5,
      height: 40,
      width: fullWidth ? '100%' : { md: 280, lg: 360 },
      bgcolor: alpha(theme.palette.text.primary, 0.06),
      border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
      transition: 'all .2s',
      '&:focus-within': {
        bgcolor: alpha(theme.palette.text.primary, 0.1),
        borderColor: theme.palette.primary.main,
      },
    })}
  >
    <InputBase
      inputRef={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search movies…"
      inputProps={{ 'aria-label': 'Search movies' }}
      sx={{ flex: 1, fontSize: 14 }}
      startAdornment={
        <InputAdornment position="start">
          <SearchIcon fontSize="small" />
        </InputAdornment>
      }
      endAdornment={
        value ? (
          <InputAdornment position="end">
            <IconButton size="small" aria-label="Clear search" onClick={onClear} edge="end">
              <CloseIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null
      }
    />
  </Box>
);

const Navbar = () => {
  const { mode, toggleMode } = useThemeMode();
  const { user, logout } = useAuth();
  const { favorites, setLastSearch } = useMovies();
  const navigate = useNavigate();
  const location = useLocation();

  const urlQuery = location.pathname === '/' ? new URLSearchParams(location.search).get('q') || '' : '';

  const [term, setTerm] = useState(urlQuery);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const typedRef = useRef(false);
  const desktopInputRef = useRef(null);
  const mobileInputRef = useRef(null);

  const debouncedTerm = useDebounce(term, 500);

  // Keep the input in sync when the URL changes from elsewhere (back button, links),
  // but never overwrite what the user is actively typing.
  useEffect(() => {
    const focused =
      document.activeElement === desktopInputRef.current ||
      document.activeElement === mobileInputRef.current;
    if (!focused) {
      setTerm(urlQuery);
      typedRef.current = false;
    }
  }, [urlQuery]);

  // Debounced navigation → Home reads ?q= from the URL.
  useEffect(() => {
    if (!typedRef.current) return;
    const q = debouncedTerm.trim();
    if (q === urlQuery.trim() && location.pathname === '/') return;
    if (!q && location.pathname !== '/') return;
    setLastSearch(q);
    navigate(q ? `/?q=${encodeURIComponent(q)}` : '/', { replace: location.pathname === '/' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTerm]);

  const handleChange = (value) => {
    typedRef.current = true;
    setTerm(value);
  };

  const handleSubmit = () => {
    const q = term.trim();
    typedRef.current = false;
    setLastSearch(q);
    navigate(q ? `/?q=${encodeURIComponent(q)}` : '/');
  };

  const handleClear = () => {
    typedRef.current = false;
    setTerm('');
    setLastSearch('');
    if (location.pathname === '/') navigate('/', { replace: true });
  };

  const handleLogout = () => {
    setAnchorEl(null);
    setDrawerOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  const initial = (user?.username || '?').charAt(0).toUpperCase();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="inherit"
      sx={(theme) => ({
        backdropFilter: 'blur(12px)',
        bgcolor: alpha(theme.palette.background.default, 0.85),
        borderBottom: `1px solid ${theme.palette.divider}`,
      })}
    >
      <Toolbar sx={{ gap: 1.5, minHeight: { xs: 60, md: 68 } }}>
        <IconButton
          edge="start"
          aria-label="Open menu"
          onClick={() => setDrawerOpen(true)}
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Box
          component={RouterLink}
          to="/"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'inherit', textDecoration: 'none', mr: 2 }}
        >
          <MovieFilterIcon color="primary" />
          <Typography variant="h6" noWrap sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Movie<Box component="span" sx={{ color: 'primary.main' }}>Explorer</Box>
          </Typography>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
          {NAV_LINKS.map((link) => (
            <Button
              key={link.to}
              component={NavLink}
              to={link.to}
              end
              color="inherit"
              startIcon={
                link.to === '/favorites' ? (
                  <Badge badgeContent={favorites.length} color="secondary" max={99}>
                    {link.icon}
                  </Badge>
                ) : (
                  link.icon
                )
              }
              sx={{
                opacity: 0.75,
                borderRadius: 999,
                px: 2,
                '&.active': { opacity: 1, bgcolor: 'action.selected' },
              }}
            >
              {link.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <SearchField
            value={term}
            onChange={handleChange}
            onClear={handleClear}
            onSubmit={handleSubmit}
            inputRef={desktopInputRef}
          />
        </Box>

        <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          <IconButton onClick={toggleMode} aria-label="Toggle dark mode">
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title={user?.username || 'Account'}>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} aria-label="Account menu" sx={{ p: 0.5 }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 700 }}>
              {initial}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Signed in as
            </Typography>
            <Typography fontWeight={700}>{user?.username}</Typography>
          </Box>
          <Divider />
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              navigate('/favorites');
            }}
          >
            <ListItemIcon>
              <FavoriteIcon fontSize="small" />
            </ListItemIcon>
            My favorites ({favorites.length})
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>

      {/* Mobile search row */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, px: 2, pb: 1.5 }}>
        <SearchField
          value={term}
          onChange={handleChange}
          onClear={handleClear}
          onSubmit={handleSubmit}
          inputRef={mobileInputRef}
          fullWidth
        />
      </Box>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260, py: 2 }} role="presentation">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, mb: 2 }}>
            <MovieFilterIcon color="primary" />
            <Typography variant="h6" fontWeight={800}>
              Movie Explorer
            </Typography>
          </Box>
          <Divider />
          <List>
            {NAV_LINKS.map((link) => (
              <ListItemButton
                key={link.to}
                component={NavLink}
                to={link.to}
                end
                onClick={() => setDrawerOpen(false)}
                sx={{ '&.active': { bgcolor: 'action.selected' } }}
              >
                <ListItemIcon>
                  {link.to === '/favorites' ? (
                    <Badge badgeContent={favorites.length} color="secondary" max={99}>
                      {link.icon}
                    </Badge>
                  ) : (
                    link.icon
                  )}
                </ListItemIcon>
                <ListItemText primary={link.label} />
              </ListItemButton>
            ))}
            <ListItemButton
              onClick={() => {
                toggleMode();
              }}
            >
              <ListItemIcon>{mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}</ListItemIcon>
              <ListItemText primary={mode === 'dark' ? 'Light mode' : 'Dark mode'} />
            </ListItemButton>
          </List>
          <Divider />
          <List>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Logout" secondary={user?.username} />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;

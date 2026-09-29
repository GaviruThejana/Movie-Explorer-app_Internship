import React, { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import SearchIcon from '@mui/icons-material/Search';
import MovieCard from '../components/MovieCard';
import { GRID_BREAKPOINTS } from '../components/SkeletonLoader';
import { useMovies } from '../context/MovieContext';

const SORTS = {
  recent: { label: 'Recently added', fn: (a, b) => String(b.addedAt || '').localeCompare(String(a.addedAt || '')) },
  rating: { label: 'Top rated', fn: (a, b) => (b.vote_average || 0) - (a.vote_average || 0) },
  newest: { label: 'Release (newest)', fn: (a, b) => String(b.release_date || '').localeCompare(String(a.release_date || '')) },
  title: { label: 'Title A–Z', fn: (a, b) => String(a.title || '').localeCompare(String(b.title || '')) },
};

const Favorites = () => {
  const { favorites, removeFavorite, clearFavorites } = useMovies();
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('recent');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const list = q ? favorites.filter((m) => (m.title || '').toLowerCase().includes(q)) : favorites;
    return [...list].sort(SORTS[sort].fn);
  }, [favorites, filter, sort]);

  const handleRemove = (movie) => removeFavorite(movie.id, movie.title);

  if (!favorites.length) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack
          alignItems="center"
          spacing={2}
          sx={(theme) => ({
            py: 8,
            px: 3,
            textAlign: 'center',
            borderRadius: 4,
            border: `1px dashed ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.text.primary, 0.02),
          })}
        >
          <Box
            sx={(theme) => ({
              width: 80,
              height: 80,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              bgcolor: alpha(theme.palette.secondary.main, 0.12),
              color: 'secondary.main',
            })}
          >
            <FavoriteBorderIcon sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h5" component="h1">
            No favorites yet
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
            Tap the heart on any movie to save it here. Your favorites are stored in this browser and will be waiting
            for you next time.
          </Typography>
          <Button component={RouterLink} to="/" variant="contained" size="large">
            Discover movies
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', md: 'center' }}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" component="h1">
            My Favorites
          </Typography>
          <Typography color="text.secondary">
            {favorites.length} saved movie{favorites.length === 1 ? '' : 's'}
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            size="small"
            placeholder="Filter favorites…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel id="fav-sort-label">Sort by</InputLabel>
            <Select labelId="fav-sort-label" label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)}>
              {Object.entries(SORTS).map(([key, { label }]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button color="error" variant="outlined" startIcon={<DeleteSweepIcon />} onClick={() => setConfirmOpen(true)}>
            Clear all
          </Button>
        </Stack>
      </Stack>

      {visible.length ? (
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
          {visible.map((movie) => (
            <Grid item key={movie.id} {...GRID_BREAKPOINTS}>
              <MovieCard movie={movie} onRemove={handleRemove} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
          No favorites match “{filter}”.
        </Typography>
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Clear all favorites?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will remove all {favorites.length} movies from your favorites. This can't be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              clearFavorites();
              setConfirmOpen(false);
            }}
          >
            Clear all
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Favorites;

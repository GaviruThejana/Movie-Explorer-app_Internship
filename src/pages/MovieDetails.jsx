import React, { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LanguageIcon from '@mui/icons-material/Language';
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import useFetch from '../hooks/useFetch';
import { fetchMovieDetails, formatRuntime, getImageUrl, getYear, pickTrailer } from '../api/tmdb';
import { useMovies } from '../context/MovieContext';
import { PosterImage } from '../components/MovieCard';
import MovieCard from '../components/MovieCard';
import TrailerModal, { YouTubeEmbed } from '../components/TrailerModal';
import { DetailsSkeleton, GRID_BREAKPOINTS } from '../components/SkeletonLoader';

const formatMoney = (n) =>
  n ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n) : '—';

const formatDate = (d) =>
  d ? new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

const CastCard = ({ person }) => {
  const img = getImageUrl(person.profile_path, 'w185');
  return (
    <Box sx={{ width: 110, flexShrink: 0, textAlign: 'center' }}>
      <Avatar
        src={img || undefined}
        alt={person.name}
        sx={{ width: 96, height: 96, mx: 'auto', mb: 1, fontSize: 32, bgcolor: 'action.selected', color: 'text.secondary' }}
      >
        {person.name?.charAt(0)}
      </Avatar>
      <Typography variant="body2" fontWeight={700} noWrap title={person.name}>
        {person.name}
      </Typography>
      <Typography variant="caption" color="text.secondary" noWrap display="block" title={person.character}>
        {person.character || '—'}
      </Typography>
    </Box>
  );
};

const Fact = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '.06em' }}>
      {label}
    </Typography>
    <Typography fontWeight={600}>{value}</Typography>
  </Box>
);

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite, notify } = useMovies();
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [backdropFailed, setBackdropFailed] = useState(false);

  const isValidId = /^\d+$/.test(id || '');

  const { data: movie, loading, error, refetch } = useFetch((signal) => fetchMovieDetails(id, { signal }), [id], {
    enabled: isValidId,
  });

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setBackdropFailed(false);
    setTrailerOpen(false);
  }, [id]);

  useEffect(() => {
    if (error) notify(error, 'error');
  }, [error, notify]);

  useEffect(() => {
    if (movie?.title) document.title = `${movie.title} (${getYear(movie.release_date)}) – Movie Explorer`;
    return () => {
      document.title = 'Movie Explorer – Discover Your Favorite Films';
    };
  }, [movie]);

  const trailer = useMemo(() => pickTrailer(movie?.videos?.results), [movie]);
  const cast = useMemo(() => (movie?.credits?.cast || []).slice(0, 20), [movie]);
  const directors = useMemo(
    () => (movie?.credits?.crew || []).filter((c) => c.job === 'Director').map((c) => c.name),
    [movie]
  );
  const recommendations = useMemo(() => (movie?.recommendations?.results || []).slice(0, 10), [movie]);

  if (!isValidId) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="warning" action={<Button onClick={() => navigate('/')}>Go home</Button>}>
          That doesn't look like a valid movie link.
        </Alert>
      </Container>
    );
  }

  if (loading) return <DetailsSkeleton />;

  if (error || !movie) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert
          severity="error"
          action={
            <Stack direction="row" spacing={1}>
              <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={refetch}>
                Retry
              </Button>
              <Button color="inherit" size="small" onClick={() => navigate('/')}>
                Home
              </Button>
            </Stack>
          }
        >
          {error || 'Movie not found.'}
        </Alert>
      </Container>
    );
  }

  const fav = isFavorite(movie.id);
  const rating = movie.vote_average || 0;
  const backdrop = !backdropFailed && getImageUrl(movie.backdrop_path, 'original');
  const runtime = formatRuntime(movie.runtime);

  return (
    <Box sx={{ pb: 8 }}>
      {/* Backdrop */}
      <Box sx={{ position: 'relative', height: { xs: 240, sm: 320, md: 480 }, overflow: 'hidden', bgcolor: 'background.paper' }}>
        {backdrop ? (
          <Box
            component="img"
            src={backdrop}
            alt=""
            aria-hidden
            onError={() => setBackdropFailed(true)}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }}
          />
        ) : (
          <Box
            sx={(theme) => ({
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.35)}, ${alpha(
                theme.palette.secondary.main,
                0.35
              )})`,
            })}
          />
        )}
        <Box
          sx={(theme) => ({
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(0deg, ${theme.palette.background.default} 0%, ${alpha(
              theme.palette.background.default,
              0.6
            )} 35%, transparent 75%)`,
          })}
        />
        <Button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
          startIcon={<ArrowBackIcon />}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            color: '#fff',
            bgcolor: 'rgba(0,0,0,.45)',
            backdropFilter: 'blur(6px)',
            borderRadius: 999,
            px: 2,
            '&:hover': { bgcolor: 'rgba(0,0,0,.65)' },
          }}
        >
          Back
        </Button>
      </Box>

      <Container maxWidth="lg" sx={{ mt: { xs: -10, md: -20 }, position: 'relative' }}>
        <Grid container spacing={{ xs: 3, md: 5 }}>
          {/* Poster */}
          <Grid item xs={12} sm={4} md={3}>
            <Paper
              elevation={8}
              sx={{ borderRadius: 3, overflow: 'hidden', width: { xs: 180, sm: '100%' }, mx: { xs: 'auto', sm: 0 } }}
            >
              <PosterImage path={movie.poster_path} title={movie.title} size="w500" />
            </Paper>
          </Grid>

          {/* Main info */}
          <Grid item xs={12} sm={8} md={9} sx={{ pt: { sm: '120px !important', md: '180px !important' } }}>
            <Typography variant="h3" component="h1" sx={{ fontSize: { xs: '1.8rem', md: '2.8rem' }, lineHeight: 1.1 }}>
              {movie.title}{' '}
              <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                ({getYear(movie.release_date)})
              </Box>
            </Typography>
            {movie.tagline && (
              <Typography variant="h6" color="text.secondary" sx={{ fontStyle: 'italic', fontWeight: 400, mt: 1 }}>
                “{movie.tagline}”
              </Typography>
            )}

            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap sx={{ my: 2 }}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <StarRoundedIcon sx={{ color: '#f5c518' }} />
                <Typography variant="h6" component="span">
                  {rating ? rating.toFixed(1) : 'NR'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  /10 · {(movie.vote_count || 0).toLocaleString()} votes
                </Typography>
              </Stack>
              {runtime && (
                <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
                  <AccessTimeIcon fontSize="small" />
                  <Typography variant="body2">{runtime}</Typography>
                </Stack>
              )}
              <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
                <CalendarMonthIcon fontSize="small" />
                <Typography variant="body2">{formatDate(movie.release_date)}</Typography>
              </Stack>
              {movie.original_language && (
                <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
                  <LanguageIcon fontSize="small" />
                  <Typography variant="body2">{movie.original_language.toUpperCase()}</Typography>
                </Stack>
              )}
            </Stack>

            <Box sx={{ maxWidth: 360, mb: 2 }}>
              <LinearProgress
                variant="determinate"
                value={Math.min(rating * 10, 100)}
                color={rating >= 7.5 ? 'success' : rating >= 6 ? 'warning' : 'error'}
                sx={{ height: 6, borderRadius: 999 }}
              />
            </Box>

            {movie.genres?.length > 0 && (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
                {movie.genres.map((g) => (
                  <Chip key={g.id} label={g.name} variant="outlined" />
                ))}
              </Stack>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 3 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrowRoundedIcon />}
                onClick={() => setTrailerOpen(true)}
                disabled={!trailer}
              >
                {trailer ? 'Watch trailer' : 'No trailer'}
              </Button>
              <Button
                variant={fav ? 'contained' : 'outlined'}
                color="secondary"
                size="large"
                startIcon={fav ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                onClick={() => toggleFavorite(movie)}
              >
                {fav ? 'Remove from favorites' : 'Add to favorites'}
              </Button>
              {movie.homepage && (
                <Button
                  variant="text"
                  size="large"
                  endIcon={<OpenInNewIcon />}
                  href={movie.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Official site
                </Button>
              )}
            </Stack>

            <Typography variant="h6" gutterBottom>
              Overview
            </Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.8, mb: 3 }}>
              {movie.overview || 'No overview available for this movie.'}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Fact label="Director" value={directors.join(', ') || '—'} />
              </Grid>
              <Grid item xs={6} md={3}>
                <Fact label="Status" value={movie.status || '—'} />
              </Grid>
              <Grid item xs={6} md={3}>
                <Fact label="Budget" value={formatMoney(movie.budget)} />
              </Grid>
              <Grid item xs={6} md={3}>
                <Fact label="Revenue" value={formatMoney(movie.revenue)} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Cast */}
        <Divider sx={{ my: 5 }} />
        <Typography variant="h5" component="h2" gutterBottom>
          Top Cast
        </Typography>
        {cast.length ? (
          <Stack
            direction="row"
            spacing={2}
            sx={{
              overflowX: 'auto',
              pb: 2,
              scrollSnapType: 'x mandatory',
              '& > *': { scrollSnapAlign: 'start' },
              '&::-webkit-scrollbar': { height: 8 },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'action.selected', borderRadius: 999 },
            }}
          >
            {cast.map((person) => (
              <CastCard key={person.credit_id || person.id} person={person} />
            ))}
          </Stack>
        ) : (
          <Typography color="text.secondary">No cast information available.</Typography>
        )}

        {/* Trailer embed */}
        <Divider sx={{ my: 5 }} />
        <Typography variant="h5" component="h2" gutterBottom>
          Trailer
        </Typography>
        <Box sx={{ maxWidth: 900 }}>
          <YouTubeEmbed videoKey={trailer?.key} title={`${movie.title} trailer`} />
          {trailer?.name && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              {trailer.name}
            </Typography>
          )}
        </Box>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <>
            <Divider sx={{ my: 5 }} />
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h5" component="h2">
                You might also like
              </Typography>
              <Button component={RouterLink} to="/">
                Explore more
              </Button>
            </Stack>
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
              {recommendations.map((m) => (
                <Grid item key={m.id} {...GRID_BREAKPOINTS}>
                  <MovieCard movie={m} />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>

      <TrailerModal
        open={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        videoKey={trailer?.key}
        title={movie.title}
      />
    </Box>
  );
};

export default MovieDetails;

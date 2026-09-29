import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
} from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import HistoryIcon from '@mui/icons-material/History';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MovieCard from '../components/MovieCard';
import SkeletonLoader, { GRID_BREAKPOINTS, HeroSkeleton, MovieCardSkeleton } from '../components/SkeletonLoader';
import { fetchGenres, fetchTrending, getErrorMessage, getImageUrl, getYear, searchMovies } from '../api/tmdb';
import { useMovies } from '../context/MovieContext';

const MAX_PAGES = 500; // TMDb hard limit

const SORTS = {
  default: { label: 'Relevance', fn: null },
  rating: { label: 'Top rated', fn: (a, b) => (b.vote_average || 0) - (a.vote_average || 0) },
  newest: { label: 'Newest', fn: (a, b) => String(b.release_date || '').localeCompare(String(a.release_date || '')) },
  oldest: {
    label: 'Oldest',
    fn: (a, b) => String(a.release_date || '9999').localeCompare(String(b.release_date || '9999')),
  },
  title: { label: 'Title A–Z', fn: (a, b) => String(a.title || '').localeCompare(String(b.title || '')) },
};

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

const Hero = ({ movies, genreMap }) => {
  const { isFavorite, toggleFavorite } = useMovies();
  const featured = useMemo(() => movies.filter((m) => m.backdrop_path).slice(0, 6), [movies]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => setIndex(0), [featured]);

  useEffect(() => {
    if (featured.length < 2 || paused) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % featured.length), 7000);
    return () => clearInterval(timer);
  }, [featured.length, paused]);

  if (!featured.length) return null;
  const movie = featured[index] || featured[0];
  const fav = isFavorite(movie.id);
  const go = (delta) => setIndex((i) => (i + delta + featured.length) % featured.length);

  return (
    <Box
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      sx={{
        position: 'relative',
        borderRadius: 4,
        overflow: 'hidden',
        minHeight: { xs: 360, md: 460 },
        display: 'flex',
        alignItems: 'flex-end',
        color: '#fff',
        bgcolor: '#000',
      }}
    >
      {featured.map((m, i) => (
        <Box
          key={m.id}
          component="img"
          src={getImageUrl(m.backdrop_path, 'w1280')}
          alt=""
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: i === index ? 1 : 0,
            transition: 'opacity .8s ease',
          }}
        />
      ))}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, rgba(0,0,0,.9) 0%, rgba(0,0,0,.6) 45%, rgba(0,0,0,.1) 100%), linear-gradient(0deg, rgba(0,0,0,.85) 0%, transparent 55%)',
        }}
      />

      <Box sx={{ position: 'relative', p: { xs: 3, md: 6 }, maxWidth: 680 }}>
        <Chip
          icon={<WhatshotIcon />}
          label={`Trending #${index + 1}`}
          color="secondary"
          size="small"
          sx={{ mb: 2, fontWeight: 700 }}
        />
        <Typography variant="h3" component="h1" sx={{ fontSize: { xs: '1.9rem', md: '3rem' }, lineHeight: 1.1, mb: 1.5 }}>
          {movie.title}
        </Typography>
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <StarRoundedIcon sx={{ color: '#f5c518' }} fontSize="small" />
            <Typography fontWeight={700}>{movie.vote_average ? movie.vote_average.toFixed(1) : 'NR'}</Typography>
          </Stack>
          <Typography sx={{ opacity: 0.8 }}>{getYear(movie.release_date)}</Typography>
          {(movie.genre_ids || []).slice(0, 3).map((gid) =>
            genreMap[gid] ? (
              <Chip
                key={gid}
                label={genreMap[gid]}
                size="small"
                variant="outlined"
                sx={{ color: '#fff', borderColor: 'rgba(255,255,255,.4)' }}
              />
            ) : null
          )}
        </Stack>
        <Typography
          sx={{
            opacity: 0.85,
            mb: 3,
            display: '-webkit-box',
            WebkitLineClamp: { xs: 3, md: 4 },
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {movie.overview || 'No overview available.'}
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <Button component={RouterLink} to={`/movie/${movie.id}`} variant="contained" size="large" startIcon={<InfoOutlinedIcon />}>
            View details
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => toggleFavorite(movie)}
            startIcon={fav ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            sx={{ color: '#fff', borderColor: 'rgba(255,255,255,.5)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,.08)' } }}
          >
            {fav ? 'Saved' : 'Favorite'}
          </Button>
        </Stack>
      </Box>

      {featured.length > 1 && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ position: 'absolute', right: { xs: 16, md: 32 }, bottom: { xs: 16, md: 32 } }}>
          <Button
            onClick={() => go(-1)}
            aria-label="Previous"
            sx={{ minWidth: 0, p: 0.5, color: '#fff', bgcolor: 'rgba(255,255,255,.12)', borderRadius: 999 }}
          >
            <ChevronLeftIcon />
          </Button>
          {featured.map((m, i) => (
            <Box
              key={m.id}
              component="button"
              aria-label={`Show ${m.title}`}
              onClick={() => setIndex(i)}
              sx={{
                width: i === index ? 22 : 8,
                height: 8,
                p: 0,
                border: 0,
                cursor: 'pointer',
                borderRadius: 999,
                bgcolor: i === index ? 'primary.main' : 'rgba(255,255,255,.45)',
                transition: 'all .3s',
                display: { xs: 'none', sm: 'block' },
              }}
            />
          ))}
          <Button
            onClick={() => go(1)}
            aria-label="Next"
            sx={{ minWidth: 0, p: 0.5, color: '#fff', bgcolor: 'rgba(255,255,255,.12)', borderRadius: 999 }}
          >
            <ChevronRightIcon />
          </Button>
        </Stack>
      )}
    </Box>
  );
};

/* ------------------------------------------------------------------ */
/* Home page                                                           */
/* ------------------------------------------------------------------ */

const initialState = { items: [], page: 0, totalPages: 1, totalResults: 0, loading: true, loadingMore: false, error: null };

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').trim();
  const isSearching = query.length > 0;

  const { notify, lastSearch, setLastSearch } = useMovies();

  const [timeWindow, setTimeWindow] = useState('week');
  const [genre, setGenre] = useState('all');
  const [sort, setSort] = useState('default');
  const [genres, setGenres] = useState([]);
  const [state, setState] = useState(initialState);
  const [heroMovies, setHeroMovies] = useState([]);

  const requestIdRef = useRef(0);
  const controllerRef = useRef(null);
  const sentinelRef = useRef(null);

  const genreMap = useMemo(() => Object.fromEntries(genres.map((g) => [g.id, g.name])), [genres]);

  // Genres (for filter + hero chips) – non-critical, fail silently.
  useEffect(() => {
    const controller = new AbortController();
    fetchGenres({ signal: controller.signal })
      .then(setGenres)
      .catch(() => {});
    return () => controller.abort();
  }, []);

  // Remember last search term.
  useEffect(() => {
    if (query) setLastSearch(query);
  }, [query, setLastSearch]);

  const loadPage = useCallback(
    async (page) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      const requestId = ++requestIdRef.current;

      setState((s) => ({ ...s, loading: page === 1, loadingMore: page > 1, error: null }));

      try {
        const data = isSearching
          ? await searchMovies({ query, page, signal: controller.signal })
          : await fetchTrending({ page, timeWindow, signal: controller.signal });

        if (requestId !== requestIdRef.current) return;

        setState((s) => {
          const base = page === 1 ? [] : s.items;
          const seen = new Set(base.map((m) => m.id));
          const fresh = (data.results || []).filter((m) => !seen.has(m.id));
          return {
            items: [...base, ...fresh],
            page: data.page || page,
            totalPages: Math.min(data.total_pages || 1, MAX_PAGES),
            totalResults: data.total_results || 0,
            loading: false,
            loadingMore: false,
            error: null,
          };
        });

        if (page === 1 && !isSearching) setHeroMovies(data.results || []);
      } catch (err) {
        if (axios.isCancel(err) || requestId !== requestIdRef.current) return;
        const message = getErrorMessage(err);
        setState((s) => ({ ...s, loading: false, loadingMore: false, error: message }));
        notify(message, 'error');
      }
    },
    [isSearching, query, timeWindow, notify]
  );

  // Reset + load first page whenever the query or trending window changes.
  useEffect(() => {
    setState(initialState);
    loadPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => controllerRef.current?.abort();
  }, [loadPage]);

  const hasMore = state.page < state.totalPages;
  const busy = state.loading || state.loadingMore;

  const loadMore = useCallback(() => {
    if (!busy && hasMore && !state.error) loadPage(state.page + 1);
  }, [busy, hasMore, state.error, state.page, loadPage]);

  // Infinite scroll – disabled while a genre filter is active so filtering
  // cannot trigger an unbounded chain of requests (Load More button is shown instead).
  const autoLoad = genre === 'all';
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !autoLoad || !hasMore || busy || state.error) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '600px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [autoLoad, hasMore, busy, state.error, loadMore]);

  const visible = useMemo(() => {
    let list = state.items;
    if (genre !== 'all') list = list.filter((m) => (m.genre_ids || []).includes(Number(genre)));
    const sorter = SORTS[sort]?.fn;
    return sorter ? [...list].sort(sorter) : list;
  }, [state.items, genre, sort]);

  const clearSearch = () => setSearchParams({});

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Hero – only on the trending view */}
      {!isSearching && (
        <Box sx={{ mb: { xs: 3, md: 5 } }}>
          {state.loading && !heroMovies.length ? <HeroSkeleton /> : <Hero movies={heroMovies} genreMap={genreMap} />}
        </Box>
      )}

      {/* Section header + filters */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" component="h2">
            {isSearching ? (
              <>
                Results for “<Box component="span" sx={{ color: 'primary.main' }}>{query}</Box>”
              </>
            ) : (
              'Trending Movies'
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isSearching
              ? state.loading
                ? 'Searching…'
                : `${state.totalResults.toLocaleString()} movie${state.totalResults === 1 ? '' : 's'} found`
              : 'What everyone is watching right now'}
          </Typography>
          {isSearching ? (
            <Button size="small" onClick={clearSearch} sx={{ mt: 0.5, px: 0 }}>
              ← Back to trending
            </Button>
          ) : (
            lastSearch && (
              <Chip
                icon={<HistoryIcon />}
                label={`Last search: ${lastSearch}`}
                onClick={() => setSearchParams({ q: lastSearch })}
                onDelete={() => setLastSearch('')}
                size="small"
                sx={{ mt: 1 }}
              />
            )
          )}
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
          {!isSearching && (
            <ToggleButtonGroup
              size="small"
              exclusive
              value={timeWindow}
              onChange={(_, v) => v && setTimeWindow(v)}
              aria-label="Trending window"
            >
              <ToggleButton value="day">Today</ToggleButton>
              <ToggleButton value="week">This week</ToggleButton>
            </ToggleButtonGroup>
          )}
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="genre-label">Genre</InputLabel>
            <Select labelId="genre-label" label="Genre" value={genre} onChange={(e) => setGenre(e.target.value)}>
              <MenuItem value="all">All genres</MenuItem>
              {genres.map((g) => (
                <MenuItem key={g.id} value={String(g.id)}>
                  {g.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="sort-label">Sort by</InputLabel>
            <Select labelId="sort-label" label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)}>
              {Object.entries(SORTS).map(([key, { label }]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      {/* Error state (first page) */}
      {state.error && !state.items.length && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={() => loadPage(1)}>
              Retry
            </Button>
          }
        >
          {state.error}
        </Alert>
      )}

      {/* Grid */}
      {state.loading ? (
        <SkeletonLoader count={15} />
      ) : visible.length ? (
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
          {visible.map((movie) => (
            <Grid item key={movie.id} {...GRID_BREAKPOINTS}>
              <MovieCard movie={movie} />
            </Grid>
          ))}
          {state.loadingMore &&
            Array.from({ length: 5 }).map((_, i) => (
              <Grid item key={`more-${i}`} {...GRID_BREAKPOINTS}>
                <MovieCardSkeleton />
              </Grid>
            ))}
        </Grid>
      ) : (
        !state.error && (
          <Stack
            alignItems="center"
            spacing={1.5}
            sx={(theme) => ({
              py: 8,
              px: 2,
              textAlign: 'center',
              borderRadius: 4,
              border: `1px dashed ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.text.primary, 0.02),
            })}
          >
            <SearchOffIcon sx={{ fontSize: 56, color: 'text.secondary' }} />
            <Typography variant="h6">
              {genre !== 'all' ? 'No movies match this genre yet' : 'No movies found'}
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
              {genre !== 'all'
                ? 'Try a different genre, or load more results below.'
                : isSearching
                ? `We couldn't find anything for “${query}”. Check the spelling or try another title.`
                : 'Nothing to show right now.'}
            </Typography>
            {genre !== 'all' ? (
              <Button onClick={() => setGenre('all')}>Clear genre filter</Button>
            ) : (
              isSearching && <Button onClick={clearSearch}>Browse trending</Button>
            )}
          </Stack>
        )
      )}

      {/* Pagination controls */}
      {!state.loading && state.items.length > 0 && (
        <Stack alignItems="center" spacing={2} sx={{ mt: 4, mb: 2 }}>
          {state.error && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => loadPage(state.page + 1)}>
                  Retry
                </Button>
              }
            >
              {state.error}
            </Alert>
          )}
          {hasMore ? (
            <>
              <Box ref={sentinelRef} sx={{ height: 1, width: '100%' }} />
              {state.loadingMore ? (
                <CircularProgress size={28} />
              ) : (
                !state.error && (
                  <Button variant="outlined" onClick={loadMore} size="large" sx={{ borderRadius: 999, px: 4 }}>
                    Load more
                  </Button>
                )
              )}
              <Typography variant="caption" color="text.secondary">
                Page {state.page} of {state.totalPages.toLocaleString()}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              You've reached the end 🎬
            </Typography>
          )}
        </Stack>
      )}
    </Container>
  );
};

export default Home;

import React, { memo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import { getImageUrl, getYear } from '../api/tmdb';
import { useMovies } from '../context/MovieContext';

/**
 * Shown whenever a poster is missing or fails to load.
 */
export const PosterFallback = ({ title, sx }) => (
  <Box
    sx={(theme) => ({
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1,
      p: 2,
      textAlign: 'center',
      color: 'text.secondary',
      background: `linear-gradient(160deg, ${alpha(theme.palette.primary.main, 0.18)}, ${alpha(
        theme.palette.secondary.main,
        0.12
      )})`,
      ...sx,
    })}
  >
    <LocalMoviesIcon sx={{ fontSize: 48, opacity: 0.6 }} />
    {title && (
      <Typography variant="body2" fontWeight={600} sx={{ opacity: 0.85 }}>
        {title}
      </Typography>
    )}
    <Typography variant="caption" sx={{ opacity: 0.6 }}>
      No poster available
    </Typography>
  </Box>
);

/**
 * Image with automatic fallback when src is empty or fails to load.
 */
export const PosterImage = ({ path, title, size = 'w500', sx }) => {
  const [failed, setFailed] = useState(false);
  const src = getImageUrl(path, size);

  return (
    <Box sx={{ position: 'relative', width: '100%', aspectRatio: '2 / 3', bgcolor: 'action.hover', overflow: 'hidden', ...sx }}>
      {src && !failed ? (
        <Box
          component="img"
          src={src}
          alt={title ? `${title} poster` : 'Movie poster'}
          loading="lazy"
          onError={() => setFailed(true)}
          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <PosterFallback title={title} />
      )}
    </Box>
  );
};

export const ratingColor = (rating) => {
  if (rating >= 7.5) return 'success';
  if (rating >= 6) return 'warning';
  if (rating > 0) return 'error';
  return 'default';
};

const MovieCard = ({ movie, onRemove }) => {
  const { isFavorite, toggleFavorite } = useMovies();
  const fav = isFavorite(movie.id);
  const title = movie.title || movie.name || 'Untitled';
  const rating = typeof movie.vote_average === 'number' ? movie.vote_average : 0;

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove) onRemove(movie);
    else toggleFavorite(movie);
  };

  return (
    <Card
      elevation={0}
      sx={(theme) => ({
        height: '100%',
        position: 'relative',
        border: `1px solid ${theme.palette.divider}`,
        transition: 'transform .25s ease, box-shadow .25s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: `0 16px 32px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.5 : 0.15)}`,
        },
        '&:hover .poster-img img': { transform: 'scale(1.05)' },
      })}
    >
      <CardActionArea
        component={RouterLink}
        to={`/movie/${movie.id}`}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <Box className="poster-img" sx={{ '& img': { transition: 'transform .4s ease' } }}>
          <PosterImage path={movie.poster_path} title={title} size="w342" />
        </Box>
        <CardContent sx={{ flexGrow: 1, p: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Typography
            variant="subtitle2"
            fontWeight={700}
            title={title}
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.3,
              minHeight: '2.6em',
            }}
          >
            {title}
          </Typography>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {getYear(movie.release_date)}
            </Typography>
            <Chip
              size="small"
              icon={<StarRoundedIcon />}
              label={rating ? rating.toFixed(1) : 'NR'}
              color={ratingColor(rating)}
              variant="outlined"
              sx={{ height: 22, fontWeight: 700, '& .MuiChip-label': { px: 0.75 } }}
            />
          </Stack>
        </CardContent>
      </CardActionArea>

      <Tooltip title={onRemove ? 'Remove from favorites' : fav ? 'Remove from favorites' : 'Add to favorites'}>
        <IconButton
          onClick={handleFavorite}
          aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
          size="small"
          sx={(theme) => ({
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 2,
            bgcolor: alpha(theme.palette.common.black, 0.55),
            color: fav ? theme.palette.secondary.main : theme.palette.common.white,
            backdropFilter: 'blur(4px)',
            '&:hover': { bgcolor: alpha(theme.palette.common.black, 0.75) },
          })}
        >
          {fav ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
        </IconButton>
      </Tooltip>
    </Card>
  );
};

export default memo(MovieCard);

import React from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';

/**
 * Responsive 16:9 YouTube embed.
 */
export const YouTubeEmbed = ({ videoKey, title, autoplay = false }) => {
  if (!videoKey) {
    return (
      <Box
        sx={{
          aspectRatio: '16 / 9',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          bgcolor: 'action.hover',
          borderRadius: 2,
          color: 'text.secondary',
        }}
      >
        <VideocamOffIcon sx={{ fontSize: 48, opacity: 0.6 }} />
        <Typography variant="body2">No trailer available for this movie.</Typography>
      </Box>
    );
  }

  const params = new URLSearchParams({ rel: '0', modestbranding: '1', ...(autoplay ? { autoplay: '1' } : {}) });

  return (
    <Box sx={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: 2, overflow: 'hidden', bgcolor: '#000' }}>
      <Box
        component="iframe"
        src={`https://www.youtube-nocookie.com/embed/${videoKey}?${params.toString()}`}
        title={title || 'Movie trailer'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
      />
    </Box>
  );
};

/**
 * Modal dialog that plays a YouTube trailer.
 */
const TrailerModal = ({ open, onClose, videoKey, title }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { bgcolor: '#0b0b0d', color: '#fff' } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
        <Typography variant="h6" component="span" noWrap>
          {title ? `${title} — Trailer` : 'Trailer'}
        </Typography>
        <IconButton onClick={onClose} aria-label="Close trailer" sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', pb: 3 }}>
        {open && <YouTubeEmbed videoKey={videoKey} title={title} autoplay />}
      </DialogContent>
    </Dialog>
  );
};

export default TrailerModal;

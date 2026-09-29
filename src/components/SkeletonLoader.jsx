import React from 'react';
import { Box, Card, CardContent, Grid, Skeleton, Stack } from '@mui/material';

export const GRID_BREAKPOINTS = { xs: 6, sm: 4, md: 3, lg: 2.4, xl: 2 };

/** A single movie-card-shaped skeleton. */
export const MovieCardSkeleton = () => (
  <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
    <Skeleton variant="rectangular" animation="wave" sx={{ width: '100%', height: 'auto', aspectRatio: '2 / 3' }} />
    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
      <Skeleton animation="wave" width="90%" />
      <Skeleton animation="wave" width="60%" />
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
        <Skeleton animation="wave" width={36} />
        <Skeleton animation="wave" variant="rounded" width={44} height={22} />
      </Stack>
    </CardContent>
  </Card>
);

/** A grid of card skeletons matching the real movie grid. */
const SkeletonLoader = ({ count = 10 }) => (
  <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
    {Array.from({ length: count }).map((_, i) => (
      <Grid item key={i} {...GRID_BREAKPOINTS}>
        <MovieCardSkeleton />
      </Grid>
    ))}
  </Grid>
);

/** Skeleton for the Home hero banner. */
export const HeroSkeleton = () => (
  <Skeleton
    variant="rectangular"
    animation="wave"
    sx={{ width: '100%', height: { xs: 360, md: 460 }, borderRadius: 4 }}
  />
);

/** Skeleton for the Movie Details page. */
export const DetailsSkeleton = () => (
  <Box>
    <Skeleton variant="rectangular" animation="wave" sx={{ width: '100%', height: { xs: 220, md: 420 } }} />
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 3 }, mt: { xs: -8, md: -16 } }}>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={4} md={3}>
          <Skeleton
            variant="rectangular"
            animation="wave"
            sx={{ width: { xs: 180, sm: '100%' }, height: 'auto', aspectRatio: '2 / 3', borderRadius: 3, mx: { xs: 'auto', sm: 0 } }}
          />
        </Grid>
        <Grid item xs={12} sm={8} md={9} sx={{ pt: { sm: '160px !important' } }}>
          <Skeleton animation="wave" height={56} width="70%" />
          <Skeleton animation="wave" width="40%" />
          <Stack direction="row" spacing={1} sx={{ my: 2 }}>
            {[70, 90, 60].map((w) => (
              <Skeleton key={w} variant="rounded" animation="wave" width={w} height={28} />
            ))}
          </Stack>
          <Skeleton animation="wave" />
          <Skeleton animation="wave" />
          <Skeleton animation="wave" width="80%" />
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Skeleton variant="rounded" animation="wave" width={150} height={42} />
            <Skeleton variant="rounded" animation="wave" width={180} height={42} />
          </Stack>
        </Grid>
      </Grid>
      <Stack direction="row" spacing={2} sx={{ mt: 5, overflow: 'hidden' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Box key={i} sx={{ flexShrink: 0 }}>
            <Skeleton variant="circular" animation="wave" width={96} height={96} />
            <Skeleton animation="wave" width={90} />
          </Box>
        ))}
      </Stack>
    </Box>
  </Box>
);

export default SkeletonLoader;

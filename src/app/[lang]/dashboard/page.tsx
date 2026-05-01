import { FC } from 'react';
import Link from 'next/link';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TranslateIcon from '@mui/icons-material/Translate';
import RateReviewIcon from '@mui/icons-material/RateReview';
import SourceIcon from '@mui/icons-material/LocalLibrary';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getDashboardStats } from '@repository/dashboard.repository';
import { Params } from '@/types';
import { Routes } from '../../routes';

const statFormatter = new Intl.NumberFormat('en');

const Dashboard: FC<{ params: Params }> = async ({ params }) => {
  const { lang } = await params;
  const stats = await getDashboardStats();
  const reviewTotal =
    stats.pendingProposals + stats.approvedProposals + stats.rejectedProposals || 1;
  const reviewProgress = Math.round((stats.approvedProposals / reviewTotal) * 100);

  const statCards = [
    {
      label: 'Published words',
      value: stats.words,
      helper: 'Entries available to readers',
      icon: <MenuBookIcon color="primary" />,
    },
    {
      label: 'Definitions',
      value: stats.definitions,
      helper: 'Meanings, nuances, and usage notes',
      icon: <DashboardIcon color="secondary" />,
    },
    {
      label: 'Sentence translations',
      value: stats.translations,
      helper: 'Examples and full phrases in reviewable form',
      icon: <TranslateIcon color="success" />,
    },
    {
      label: 'Sources',
      value: stats.sources,
      helper: 'References backing the dictionary',
      icon: <SourceIcon color="warning" />,
    },
  ];

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box>
        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
          <Typography variant="h4" component="h1" fontWeight={700}>
            Dashboard
          </Typography>
          <Chip
            color={stats.pendingProposals > 0 ? 'warning' : 'success'}
            label={`${stats.pendingProposals} pending`}
            icon={stats.pendingProposals > 0 ? <RateReviewIcon /> : <CheckCircleIcon />}
          />
        </Stack>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 760 }}>
          Every accepted proposal makes Gafargan more useful: cleaner entries, better examples,
          and more trustworthy translations for readers.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {statCards.map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    {card.label}
                  </Typography>
                  {card.icon}
                </Stack>
                <Typography variant="h4" component="p" fontWeight={700} sx={{ mt: 1 }}>
                  {statFormatter.format(card.value)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {card.helper}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                gap={2}
                alignItems={{ xs: 'stretch', sm: 'center' }}
              >
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Review queue
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Focus here first when preparing a clean public release.
                  </Typography>
                </Box>
                <Button
                  component={Link}
                  href={`/${lang}/${Routes.Dictionary}`}
                  variant="contained"
                  startIcon={<RateReviewIcon />}
                >
                  Open reviews
                </Button>
              </Stack>

              <Box sx={{ mt: 3 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2">Approved proposal share</Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {reviewProgress}%
                  </Typography>
                </Stack>
                <LinearProgress variant="determinate" value={reviewProgress} sx={{ height: 8 }} />
              </Box>

              <Grid container spacing={1.5} sx={{ mt: 2 }}>
                <Grid size={{ xs: 4 }}>
                  <Alert severity="warning" icon={false}>
                    <Typography variant="caption">Pending</Typography>
                    <Typography fontWeight={700}>{stats.pendingProposals}</Typography>
                  </Alert>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Alert severity="success" icon={false}>
                    <Typography variant="caption">Approved</Typography>
                    <Typography fontWeight={700}>{stats.approvedProposals}</Typography>
                  </Alert>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Alert severity="error" icon={false}>
                    <Typography variant="caption">Rejected</Typography>
                    <Typography fontWeight={700}>{stats.rejectedProposals}</Typography>
                  </Alert>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700}>
                Today&apos;s priorities
              </Typography>
              <Stack gap={1.5} sx={{ mt: 2 }}>
                <Stack direction="row" alignItems="center" gap={1.25}>
                  <RateReviewIcon color="warning" />
                  <Typography>Review pending dictionary proposals with side-by-side changes.</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" gap={1.25}>
                  <TranslateIcon color="success" />
                  <Typography>Add sentence translations that show real usage.</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" gap={1.25}>
                  <SourceIcon color="primary" />
                  <Typography>Keep sources attached so every entry stays auditable.</Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

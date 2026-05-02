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
import { initTranslations } from '@i18n/index';
import { Params } from '@/types';
import { Routes } from '../../routes';

const numberFormatLocale = {
  eng: 'en',
  rus: 'ru',
  lez: 'ru',
  tur: 'tr',
};

const Dashboard: FC<{ params: Params }> = async ({ params }) => {
  const { lang } = await params;
  const { t } = await initTranslations(lang);
  const stats = await getDashboardStats();
  const statFormatter = new Intl.NumberFormat(numberFormatLocale[lang] ?? 'en');
  const reviewTotal =
    stats.pendingProposals + stats.approvedProposals + stats.rejectedProposals || 1;
  const reviewProgress = Math.round((stats.approvedProposals / reviewTotal) * 100);

  const statCards = [
    {
      label: t('dashboardHome.stats.words.label', { ns: 'dashboard' }),
      value: stats.words,
      helper: t('dashboardHome.stats.words.helper', { ns: 'dashboard' }),
      icon: <MenuBookIcon color="primary" />,
    },
    {
      label: t('dashboardHome.stats.definitions.label', { ns: 'dashboard' }),
      value: stats.definitions,
      helper: t('dashboardHome.stats.definitions.helper', { ns: 'dashboard' }),
      icon: <DashboardIcon color="secondary" />,
    },
    {
      label: t('dashboardHome.stats.translations.label', { ns: 'dashboard' }),
      value: stats.translations,
      helper: t('dashboardHome.stats.translations.helper', { ns: 'dashboard' }),
      icon: <TranslateIcon color="success" />,
    },
    {
      label: t('dashboardHome.stats.sources.label', { ns: 'dashboard' }),
      value: stats.sources,
      helper: t('dashboardHome.stats.sources.helper', { ns: 'dashboard' }),
      icon: <SourceIcon color="warning" />,
    },
  ];

  const workspaces = [
    {
      title: t('dashboardHome.workspaces.dictionary.title', { ns: 'dashboard' }),
      description: t('dashboardHome.workspaces.dictionary.description', { ns: 'dashboard' }),
      href: `/${lang}/${Routes.Dictionary}?tab=add`,
      button: t('dashboardHome.workspaces.dictionary.button', { ns: 'dashboard' }),
      icon: <MenuBookIcon color="primary" />,
    },
    {
      title: t('dashboardHome.workspaces.translations.title', { ns: 'dashboard' }),
      description: t('dashboardHome.workspaces.translations.description', { ns: 'dashboard' }),
      href: `/${lang}/${Routes.Translations}?tab=propose`,
      button: t('dashboardHome.workspaces.translations.button', { ns: 'dashboard' }),
      icon: <TranslateIcon color="success" />,
    },
    {
      title: t('dashboardHome.workspaces.sources.title', { ns: 'dashboard' }),
      description: t('dashboardHome.workspaces.sources.description', { ns: 'dashboard' }),
      href: `/${lang}/${Routes.Sources}?tab=propose`,
      button: t('dashboardHome.workspaces.sources.button', { ns: 'dashboard' }),
      icon: <SourceIcon color="warning" />,
    },
  ];

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box>
        {/* <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
          <Typography variant="h4" component="h1" fontWeight={700}>
            {t('dashboardHome.title', { ns: 'dashboard' })}
          </Typography>
          <Chip
            color={stats.pendingProposals > 0 ? 'warning' : 'success'}
            label={t('dashboardHome.pendingChip', {
              ns: 'dashboard',
              count: stats.pendingProposals,
            })}
            icon={stats.pendingProposals > 0 ? <RateReviewIcon /> : <CheckCircleIcon />}
          />
        </Stack> */}
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 760 }}>
          {t('dashboardHome.subtitle', { ns: 'dashboard' })}
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
                    {t('dashboardHome.review.title', { ns: 'dashboard' })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('dashboardHome.review.description', { ns: 'dashboard' })}
                  </Typography>
                </Box>
                <Button
                  component={Link}
                  href={`/${lang}/${Routes.Dictionary}?tab=review-proposals`}
                  variant="contained"
                  startIcon={<RateReviewIcon />}
                >
                  {t('dashboardHome.review.button', { ns: 'dashboard' })}
                </Button>
              </Stack>

              <Box sx={{ mt: 3 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    {t('dashboardHome.review.progressLabel', { ns: 'dashboard' })}
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {reviewProgress}%
                  </Typography>
                </Stack>
                <LinearProgress variant="determinate" value={reviewProgress} sx={{ height: 8 }} />
              </Box>

              <Grid container spacing={1.5} sx={{ mt: 2 }}>
                <Grid size={{ xs: 4 }}>
                  <Alert severity="warning" icon={false}>
                    <Typography variant="caption">
                      {t('dashboardHome.review.pending', { ns: 'dashboard' })}
                    </Typography>
                    <Typography fontWeight={700}>{stats.pendingProposals}</Typography>
                  </Alert>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Alert severity="success" icon={false}>
                    <Typography variant="caption">
                      {t('dashboardHome.review.approved', { ns: 'dashboard' })}
                    </Typography>
                    <Typography fontWeight={700}>{stats.approvedProposals}</Typography>
                  </Alert>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Alert severity="error" icon={false}>
                    <Typography variant="caption">
                      {t('dashboardHome.review.rejected', { ns: 'dashboard' })}
                    </Typography>
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
                {t('dashboardHome.workspaces.title', { ns: 'dashboard' })}
              </Typography>
              <Stack gap={1.5} sx={{ mt: 2 }}>
                {workspaces.map((workspace) => (
                  <Stack
                    key={workspace.href}
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                    justifyContent="space-between"
                    gap={1.25}
                  >
                    <Stack direction="row" alignItems="center" gap={1.25}>
                      {workspace.icon}
                      <Box>
                        <Typography fontWeight={600}>{workspace.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {workspace.description}
                        </Typography>
                      </Box>
                    </Stack>
                    <Button component={Link} href={workspace.href} size="small">
                      {workspace.button}
                    </Button>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

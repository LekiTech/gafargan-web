'use client';

import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LoginIcon from '@mui/icons-material/Login';
import { useTranslation } from 'react-i18next';
import { loginDashboardUser } from './actions';

type ErrorType = 'missing' | 'invalid' | 'server' | 'rate-limited' | undefined;

function getErrorMessage(
  error: ErrorType,
  t: (key: string, options?: Record<string, any>) => string,
  retryAfterMinutes?: number,
): string | undefined {
  switch (error) {
    case 'missing':
      return t('auth.login.errors.missing', { ns: 'dashboard' });

    case 'invalid':
      return t('auth.login.errors.invalid', { ns: 'dashboard' });

    case 'server':
      return t('auth.login.errors.server', { ns: 'dashboard' });

    case 'rate-limited':
      return t('auth.login.errors.rateLimited', {
        ns: 'dashboard',
        count: retryAfterMinutes,
      });

    default:
      return undefined;
  }
}

export default function LoginForm({
  lang,
  redirectTo,
  error,
  retryAfter,
}: {
  lang: string;
  redirectTo?: string;
  error?: string;
  retryAfter?: string;
}) {
  const { t } = useTranslation(lang);
  const retryAfterMinutes = retryAfter ? Math.ceil(Number(retryAfter) / 60) : 15;
  const errorMessage = getErrorMessage(error as ErrorType, t, retryAfterMinutes);

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        py: 6,
        bgcolor: 'background.default',
      }}
    >
      <Card variant="outlined" sx={{ width: '100%', maxWidth: 420, borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={2.5}>
            <Stack spacing={1}>
              <LockIcon color="primary" />
              <Typography variant="h4" component="h1" fontWeight={700}>
                {t('auth.login.title', { ns: 'dashboard' })}
              </Typography>
              {/* <Typography color="text.secondary">
                {t('auth.login.subtitle', { ns: 'dashboard' })}
              </Typography> */}
            </Stack>

            {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

            <Box component="form" action={loginDashboardUser}>
              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="redirectTo" value={redirectTo ?? ''} />
              <Stack spacing={2}>
                <TextField
                  name="email"
                  type="email"
                  label={t('auth.login.email', { ns: 'dashboard' })}
                  autoComplete="email"
                  required
                  fullWidth
                />
                <TextField
                  name="password"
                  type="password"
                  label={t('auth.login.password', { ns: 'dashboard' })}
                  autoComplete="current-password"
                  required
                  fullWidth
                />
                <Button type="submit" variant="contained" size="large" startIcon={<LoginIcon />}>
                  {t('auth.login.submit', { ns: 'dashboard' })}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

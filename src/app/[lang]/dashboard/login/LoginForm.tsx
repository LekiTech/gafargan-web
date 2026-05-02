'use client';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LoginIcon from '@mui/icons-material/Login';
import { loginDashboardUser } from './actions';

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
  const retryAfterMinutes = retryAfter ? Math.ceil(Number(retryAfter) / 60) : 15;
  const errorMessage =
    error === 'missing'
      ? 'Enter your email and password.'
      : error === 'invalid'
        ? 'Invalid credentials or dashboard role.'
        : error === 'server'
          ? 'Sign in is temporarily unavailable. Please try again.'
          : error === 'rate-limited'
            ? `Too many failed attempts. Try again in ${retryAfterMinutes} minute${
                retryAfterMinutes === 1 ? '' : 's'
              }.`
        : undefined;

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
                Dashboard sign in
              </Typography>
              <Typography color="text.secondary">
                Use an account with an Admin or Moderator role.
              </Typography>
            </Stack>

            {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

            <Box component="form" action={loginDashboardUser}>
              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="redirectTo" value={redirectTo ?? ''} />
              <Stack spacing={2}>
                <TextField
                  name="email"
                  type="email"
                  label="Email"
                  autoComplete="email"
                  required
                  fullWidth
                />
                <TextField
                  name="password"
                  type="password"
                  label="Password"
                  autoComplete="current-password"
                  required
                  fullWidth
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<LoginIcon />}
                >
                  Sign in
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

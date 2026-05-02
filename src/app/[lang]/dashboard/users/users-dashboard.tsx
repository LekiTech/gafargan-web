'use client';

import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import PeopleIcon from '@mui/icons-material/People';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Language, Role } from '@repository/entities/enums';
import { WebsiteLang } from '@api/types.model';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

type DashboardUserModel = {
  id: number;
  name: string | null;
  email: string;
  role: Role;
  language: Language | null;
  verified: boolean | null;
  createdAt: string;
  updatedAt: string;
};

type UserDraft = {
  id?: number;
  name: string;
  email: string;
  password: string;
  role: Role;
  language: Language | '';
  verified: boolean;
};

const emptyDraft: UserDraft = {
  name: '',
  email: '',
  password: '',
  role: Role.User,
  language: '',
  verified: false,
};

const toDraft = (user: DashboardUserModel): UserDraft => ({
  id: user.id,
  name: user.name ?? '',
  email: user.email,
  password: '',
  role: user.role,
  language: user.language ?? '',
  verified: Boolean(user.verified),
});

const dateLocales: Record<WebsiteLang, string> = {
  eng: 'en',
  lez: 'ru',
  rus: 'ru',
  tur: 'tr',
};

const formatDate = (value: string, lang: WebsiteLang) =>
  new Intl.DateTimeFormat(dateLocales[lang] ?? 'en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

const getApiErrorKey = (message?: string) =>
  message?.startsWith('users.errors.') ? message : 'users.errors.saveFailed';

export default function UsersDashboard() {
  const { lang } = useParams() as { lang: WebsiteLang };
  const { t } = useTranslation(lang);
  const [users, setUsers] = React.useState<DashboardUserModel[]>([]);
  const [currentUserId, setCurrentUserId] = React.useState<number | null>(null);
  const [draft, setDraft] = React.useState<UserDraft | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const isEditing = Boolean(draft?.id);

  const loadUsers = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('users/api');
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body?.message ?? 'users.errors.loadFailed');
      }

      setUsers(body.users);
      setCurrentUserId(body.currentUserId);
    } catch (loadError) {
      setError(
        t(loadError instanceof Error ? loadError.message : 'users.errors.loadFailed', {
          ns: 'dashboard',
        }),
      );
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const updateDraft = <K extends keyof UserDraft>(key: K, value: UserDraft[K]) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  };

  const handleClose = () => {
    if (isSaving) {
      return;
    }
    setDraft(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!draft) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('users/api', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...draft,
          language: draft.language || null,
        }),
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body?.message ?? 'users.errors.saveFailed');
      }

      setUsers((current) => {
        if (isEditing) {
          return current.map((user) => (user.id === body.user.id ? body.user : user));
        }

        return [...current, body.user];
      });
      setSuccess(
        t(isEditing ? 'users.messages.updated' : 'users.messages.created', { ns: 'dashboard' }),
      );
      setDraft(null);
    } catch (saveError) {
      setError(
        t(getApiErrorKey(saveError instanceof Error ? saveError.message : undefined), {
          ns: 'dashboard',
        }),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ display: 'grid', gap: 2.5 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        gap={2}
      >
        <Stack direction="row" alignItems="center" gap={1.25}>
          <PeopleIcon color="primary" />
          <Box>
            <Typography variant="h5" component="h1" fontWeight={700}>
              {t('users.title', { ns: 'dashboard' })}
            </Typography>
            <Typography color="text.secondary">
              {t('users.description', { ns: 'dashboard' })}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadUsers}
            disabled={isLoading}
          >
            {t('users.actions.refresh', { ns: 'dashboard' })}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDraft(emptyDraft)}>
            {t('users.actions.add', { ns: 'dashboard' })}
          </Button>
        </Stack>
      </Stack>

      {success ? <Alert severity="success">{success}</Alert> : null}
      {error && !draft ? <Alert severity="error">{error}</Alert> : null}

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          <TableContainer>
            <Table
              sx={{ minWidth: 760 }}
              aria-label={t('users.table.ariaLabel', { ns: 'dashboard' })}
            >
              <TableHead>
                <TableRow>
                  <TableCell>{t('users.fields.name', { ns: 'dashboard' })}</TableCell>
                  <TableCell>{t('users.fields.email', { ns: 'dashboard' })}</TableCell>
                  <TableCell>{t('users.fields.role', { ns: 'dashboard' })}</TableCell>
                  <TableCell>{t('users.fields.language', { ns: 'dashboard' })}</TableCell>
                  <TableCell>{t('users.fields.verified', { ns: 'dashboard' })}</TableCell>
                  <TableCell>{t('users.fields.updated', { ns: 'dashboard' })}</TableCell>
                  <TableCell align="right">
                    {t('users.fields.actions', { ns: 'dashboard' })}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7}>{t('users.empty.loading', { ns: 'dashboard' })}</TableCell>
                  </TableRow>
                ) : null}
                {!isLoading && users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>{t('users.empty.none', { ns: 'dashboard' })}</TableCell>
                  </TableRow>
                ) : null}
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Stack spacing={0.25}>
                        <Typography>{user.name || '-'}</Typography>
                        {user.id === currentUserId ? (
                          <Typography variant="caption" color="text.secondary">
                            {t('users.currentSession', { ns: 'dashboard' })}
                          </Typography>
                        ) : null}
                      </Stack>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.language ?? '-'}</TableCell>
                    <TableCell>
                      {t(user.verified ? 'users.boolean.yes' : 'users.boolean.no', {
                        ns: 'dashboard',
                      })}
                    </TableCell>
                    <TableCell>{formatDate(user.updatedAt, lang)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        aria-label={t('users.actions.editUser', {
                          ns: 'dashboard',
                          email: user.email,
                        })}
                        onClick={() => setDraft(toDraft(user))}
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={Boolean(draft)} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {t(isEditing ? 'users.dialog.editTitle' : 'users.dialog.addTitle', { ns: 'dashboard' })}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && draft ? <Alert severity="error">{error}</Alert> : null}
            <TextField
              label={t('users.fields.name', { ns: 'dashboard' })}
              value={draft?.name ?? ''}
              onChange={(event) => updateDraft('name', event.target.value)}
              fullWidth
            />
            <TextField
              label={t('users.fields.email', { ns: 'dashboard' })}
              type="email"
              value={draft?.email ?? ''}
              onChange={(event) => updateDraft('email', event.target.value)}
              required
              fullWidth
            />
            <TextField
              label={t(isEditing ? 'users.fields.newPassword' : 'users.fields.password', {
                ns: 'dashboard',
              })}
              type="password"
              value={draft?.password ?? ''}
              onChange={(event) => updateDraft('password', event.target.value)}
              helperText={
                isEditing ? t('users.helpers.keepPassword', { ns: 'dashboard' }) : undefined
              }
              required={!isEditing}
              fullWidth
            />
            <FormControl fullWidth required>
              <InputLabel id="user-role-label">
                {t('users.fields.role', { ns: 'dashboard' })}
              </InputLabel>
              <Select
                labelId="user-role-label"
                label={t('users.fields.role', { ns: 'dashboard' })}
                value={draft?.role ?? Role.User}
                onChange={(event) => updateDraft('role', event.target.value as Role)}
              >
                {Object.values(Role).map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="user-language-label">
                {t('users.fields.language', { ns: 'dashboard' })}
              </InputLabel>
              <Select
                labelId="user-language-label"
                label={t('users.fields.language', { ns: 'dashboard' })}
                value={draft?.language ?? ''}
                onChange={(event) => updateDraft('language', event.target.value as Language | '')}
              >
                <MenuItem value="">{t('users.languageNone', { ns: 'dashboard' })}</MenuItem>
                {Object.values(Language).map((language) => (
                  <MenuItem key={language} value={language}>
                    {language}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(draft?.verified)}
                  onChange={(event) => updateDraft('verified', event.target.checked)}
                />
              }
              label={t('users.fields.verified', { ns: 'dashboard' })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSaving}>
            {t('addNewWord.cancel', { ns: 'dashboard' })}
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={isSaving}
          >
            {t(isSaving ? 'users.actions.saving' : 'addNewWord.save', { ns: 'dashboard' })}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

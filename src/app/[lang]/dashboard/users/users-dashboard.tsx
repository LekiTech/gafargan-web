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

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export default function UsersDashboard() {
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
        throw new Error(body?.message ?? 'Could not load users');
      }

      setUsers(body.users);
      setCurrentUserId(body.currentUserId);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load users');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
        throw new Error(body?.message ?? 'Could not save user');
      }

      setUsers((current) => {
        if (isEditing) {
          return current.map((user) => (user.id === body.user.id ? body.user : user));
        }

        return [...current, body.user];
      });
      setSuccess(isEditing ? 'User updated.' : 'User created.');
      setDraft(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save user');
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
              Users
            </Typography>
            <Typography color="text.secondary">
              Manage dashboard access, roles, and password resets.
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
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDraft(emptyDraft)}>
            Add user
          </Button>
        </Stack>
      </Stack>

      {success ? <Alert severity="success">{success}</Alert> : null}
      {error && !draft ? <Alert severity="error">{error}</Alert> : null}

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          <TableContainer>
            <Table sx={{ minWidth: 760 }} aria-label="Dashboard users">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Language</TableCell>
                  <TableCell>Verified</TableCell>
                  <TableCell>Updated</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7}>Loading users...</TableCell>
                  </TableRow>
                ) : null}
                {!isLoading && users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>No users found.</TableCell>
                  </TableRow>
                ) : null}
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Stack spacing={0.25}>
                        <Typography>{user.name || '-'}</Typography>
                        {user.id === currentUserId ? (
                          <Typography variant="caption" color="text.secondary">
                            Current session
                          </Typography>
                        ) : null}
                      </Stack>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.language ?? '-'}</TableCell>
                    <TableCell>{user.verified ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{formatDate(user.updatedAt)}</TableCell>
                    <TableCell align="right">
                      <IconButton aria-label={`Edit ${user.email}`} onClick={() => setDraft(toDraft(user))}>
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
        <DialogTitle>{isEditing ? 'Edit user' : 'Add user'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && draft ? <Alert severity="error">{error}</Alert> : null}
            <TextField
              label="Name"
              value={draft?.name ?? ''}
              onChange={(event) => updateDraft('name', event.target.value)}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={draft?.email ?? ''}
              onChange={(event) => updateDraft('email', event.target.value)}
              required
              fullWidth
            />
            <TextField
              label={isEditing ? 'New password' : 'Password'}
              type="password"
              value={draft?.password ?? ''}
              onChange={(event) => updateDraft('password', event.target.value)}
              helperText={isEditing ? 'Leave blank to keep the current password.' : undefined}
              required={!isEditing}
              fullWidth
            />
            <FormControl fullWidth required>
              <InputLabel id="user-role-label">Role</InputLabel>
              <Select
                labelId="user-role-label"
                label="Role"
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
              <InputLabel id="user-language-label">Language</InputLabel>
              <Select
                labelId="user-language-label"
                label="Language"
                value={draft?.language ?? ''}
                onChange={(event) => updateDraft('language', event.target.value as Language | '')}
              >
                <MenuItem value="">None</MenuItem>
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
              label="Verified"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

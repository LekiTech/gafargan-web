'use client';

import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Paper,
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
import SendIcon from '@mui/icons-material/Send';
import TranslateIcon from '@mui/icons-material/Translate';
import RateReviewIcon from '@mui/icons-material/RateReview';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { WebsiteLang } from '@api/types.model';
import { LangDialects } from '@repository/constants';
import { Proposal } from '@repository/entities/Proposal';
import { ProposalStatus } from '@repository/entities/enums';
import { Translation } from '@repository/entities/Translation';
import { PaginatedResponse } from '@repository/types.model';
import {
  SourceModel,
  SourceModelType,
  STATE,
  TranslationModel,
} from '../models/proposal.model';
import { SourcesCreatableSelect } from '../components/SearchableCreatableSelect';
import { langDialectIdToString } from '../utils';
import { useTranslation } from 'react-i18next';

type PhraseDraft = {
  id: string;
  from: string;
  to: string;
};

const createDraft = (): PhraseDraft => ({
  id: crypto.randomUUID(),
  from: '',
  to: '',
});

const phrasePreview = (translation: Translation) =>
  Object.entries(translation.phrasesPerLangDialect ?? {})
    .map(([langDialectId, phrases]) =>
      phrases.map((phrase) => `${langDialectId}: ${phrase.phrase}`).join('\n'),
    )
    .filter(Boolean)
    .join('\n\n');

const statusColor = (status: ProposalStatus) => {
  switch (status) {
    case ProposalStatus.APPROVED:
      return 'success';
    case ProposalStatus.REJECTED:
      return 'error';
    default:
      return 'warning';
  }
};

const TranslationsDashboard: React.FC<{
  lang: WebsiteLang;
  translations: PaginatedResponse<Translation>;
  sourceModels: SourceModelType[];
  proposals: Proposal[];
}> = ({ lang, translations, sourceModels, proposals }) => {
  const { t } = useTranslation(lang);
  const [sources] = React.useState<SourceModel[]>(sourceModels.map((source) => new SourceModel(source)));
  const [selectedSource, setSelectedSource] = React.useState<SourceModel>(sources[0]);
  const [fromLangDialectId, setFromLangDialectId] = React.useState(1);
  const [toLangDialectId, setToLangDialectId] = React.useState(25);
  const [drafts, setDrafts] = React.useState<PhraseDraft[]>([createDraft()]);
  const [alert, setAlert] = React.useState<{ severity: 'success' | 'error' | 'info'; text: string }>();

  const dialectOptions = React.useMemo(
    () =>
      Object.entries(LangDialects).map(([id]) => ({
        id: Number(id),
        label: langDialectIdToString(Number(id), t),
      })),
    [t],
  );

  const updateDraft = (id: string, patch: Partial<PhraseDraft>) => {
    setDrafts((current) =>
      current.map((draft) => (draft.id === id ? { ...draft, ...patch } : draft)),
    );
  };

  const submit = async () => {
    const entries = drafts
      .map((draft) => ({
        from: draft.from.trim(),
        to: draft.to.trim(),
      }))
      .filter((draft) => draft.from && draft.to);

    if (entries.length === 0) {
      setAlert({ severity: 'info', text: 'Add at least one complete sentence pair.' });
      return;
    }

    const translationModels = entries.map(
      (entry) =>
        new TranslationModel({
          state: STATE.ADDED,
          phrasesPerLangDialect: {
            [fromLangDialectId]: [{ phrase: entry.from }],
            [toLangDialectId]: [{ phrase: entry.to }],
          },
          tags: [],
        }),
    );

    const result = await fetch('translations/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entries: translationModels,
        defaultSource: selectedSource,
      }),
    });

    if (result.status >= 300) {
      setAlert({ severity: 'error', text: 'Could not send translations for review.' });
      return;
    }

    setAlert({ severity: 'success', text: 'Translations were sent for review.' });
    setDrafts([createDraft()]);
  };

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box>
        <Stack direction="row" alignItems="center" gap={1}>
          <TranslateIcon color="primary" />
          <Typography variant="h4" component="h1" fontWeight={700}>
            Sentence translations
          </Typography>
        </Stack>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 760 }}>
          Add complete sentence pairs, idioms, and usage examples that can be reviewed before they
          become public.
        </Typography>
      </Box>

      {alert && <Alert severity={alert.severity}>{alert.text}</Alert>}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardHeader title="Propose translations" />
            <CardContent>
              <Grid container columns={{ xs: 6 }} spacing={1.5} sx={{ mb: 2 }}>
                <Grid size={{ xs: 6 }}>
                  <SourcesCreatableSelect
                    label="Source"
                    options={sources}
                    value={selectedSource}
                    lang={lang}
                    onChange={setSelectedSource}
                    readonly={false}
                    placeholder="Choose or add"
                  />
                </Grid>
                <Grid size={{ xs: 6 }} display="flex" alignItems="center" gap={1}>
                  <Select
                    size="small"
                    value={fromLangDialectId}
                    sx={{ flex: 1 }}
                    onChange={(event) => setFromLangDialectId(Number(event.target.value))}
                  >
                    {dialectOptions.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <Typography>→</Typography>
                  <Select
                    size="small"
                    value={toLangDialectId}
                    sx={{ flex: 1 }}
                    onChange={(event) => setToLangDialectId(Number(event.target.value))}
                  >
                    {dialectOptions.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
              </Grid>

              <Stack gap={1.5}>
                {drafts.map((draft, idx) => (
                  <Grid key={draft.id} container spacing={1.5}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        label={`Source sentence ${idx + 1}`}
                        value={draft.from}
                        onChange={(event) => updateDraft(draft.id, { from: event.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        label={`Translation ${idx + 1}`}
                        value={draft.to}
                        onChange={(event) => updateDraft(draft.id, { to: event.target.value })}
                      />
                    </Grid>
                  </Grid>
                ))}
              </Stack>
            </CardContent>
            <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setDrafts((current) => [...current, createDraft()])}
              >
                Add pair
              </Button>
              <Button variant="contained" startIcon={<SendIcon />} onClick={submit}>
                Send to review
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardHeader
              avatar={<RateReviewIcon color="warning" />}
              title="Translation proposal queue"
              subheader={`${proposals.filter((proposal) => proposal.status === ProposalStatus.PENDING).length} pending`}
            />
            <CardContent>
              <Stack divider={<Divider flexItem />} gap={1}>
                {proposals.slice(0, 6).map((proposal) => (
                  <Stack
                    key={proposal.id}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    gap={1}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={700}>
                        Proposal #{proposal.id}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(proposal.proposedAt).toLocaleString()}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      color={statusColor(proposal.status) as any}
                      label={proposal.status}
                    />
                  </Stack>
                ))}
                {proposals.length === 0 && (
                  <Typography color="text.secondary">No translation proposals yet.</Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardHeader
          avatar={<CheckCircleIcon color="success" />}
          title="Published sentence translations"
          subheader={`${translations.totalItems} total`}
        />
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Sentences</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell>Updated</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {translations.items.map((translation) => (
                  <TableRow key={translation.id}>
                    <TableCell>{translation.id}</TableCell>
                    <TableCell>
                      <Typography component="pre" sx={{ m: 0, whiteSpace: 'pre-wrap' }}>
                        {phrasePreview(translation)}
                      </Typography>
                    </TableCell>
                    <TableCell>{translation.tags?.join(', ') || '—'}</TableCell>
                    <TableCell>{new Date(translation.updatedAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {translations.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography color="text.secondary">No published translations yet.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TranslationsDashboard;

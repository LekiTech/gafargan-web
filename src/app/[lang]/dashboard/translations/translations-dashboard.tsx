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
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
import { SourceModel, SourceModelType, TranslationModel } from '../models/proposal.model';
import { SourcesCreatableSelect } from '../components/SearchableCreatableSelect';
import { langDialectIdToString } from '../utils';
import { useTranslation } from 'react-i18next';
import { ExampleLine } from '../dictionary/components/WordEntryForm/ExampleLine';
import { flipAndMergeTags } from '@/search/definition/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type ExampleDraft = {
  id: string;
  value: TranslationModel;
};

const createDraft = (fromLangDialectId = 1, toLangDialectId = 25): ExampleDraft => ({
  id: crypto.randomUUID(),
  value: TranslationModel.createEmpty([fromLangDialectId, toLangDialectId]),
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
  const { t, i18n } = useTranslation(lang);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sources] = React.useState<SourceModel[]>(
    sourceModels.map((source) => new SourceModel(source)),
  );
  const [selectedSource, setSelectedSource] = React.useState<SourceModel>(sources[0]);
  const [fromLangDialectId, setFromLangDialectId] = React.useState(1);
  const [toLangDialectId, setToLangDialectId] = React.useState(25);
  const [drafts, setDrafts] = React.useState<ExampleDraft[]>([createDraft()]);
  const [alert, setAlert] = React.useState<{
    severity: 'success' | 'error' | 'info';
    text: string;
  }>();
  const tagEntries = i18n.getResourceBundle(lang, 'tags');
  const allTags = React.useMemo(
    () =>
      Object.entries(flipAndMergeTags(tagEntries)).filter(
        (kv) => kv != null && kv[0] != null && kv[1] != null,
      ) as [string, string][],
    [tagEntries],
  );

  const dialectOptions = React.useMemo(
    () =>
      Object.entries(LangDialects).map(([id]) => ({
        id: Number(id),
        label: langDialectIdToString(Number(id), t),
      })),
    [t],
  );

  const updateDraft = (id: string, value: TranslationModel) => {
    setDrafts((current) => current.map((draft) => (draft.id === id ? { ...draft, value } : draft)));
  };

  const deleteDraft = (id: string) => {
    setDrafts((current) =>
      current.length === 1
        ? [createDraft(fromLangDialectId, toLangDialectId)]
        : current.filter((draft) => draft.id !== id),
    );
  };

  const hasCompletePhrase = (draft: TranslationModel) =>
    draft
      .getAllLangDialectIds()
      .map((langDialectId) => draft.getPhrasesByLangDialect(langDialectId) ?? [])
      .flat()
      .some((phrase) => phrase.phrase.trim().length > 0);

  const handleTranslationsPageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  const submit = async () => {
    const entries = drafts.map((draft) => draft.value).filter(hasCompletePhrase);

    if (entries.length === 0) {
      setAlert({ severity: 'info', text: 'Add at least one complete sentence pair.' });
      return;
    }

    const result = await fetch('translations/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entries,
        sourceId: selectedSource.getId(),
      }),
    });

    if (result.status >= 300) {
      setAlert({ severity: 'error', text: 'Could not send translations for review.' });
      return;
    }

    setAlert({ severity: 'success', text: 'Translations were sent for review.' });
    setDrafts([createDraft(fromLangDialectId, toLangDialectId)]);
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

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardHeader title="Propose translations" />
        <CardContent>
          <Grid container columns={{ xs: 6 }} spacing={1.5} sx={{ mb: 2 }}>
            <Grid size={{ xs: 6 }}>
              <SourcesCreatableSelect
                label={t('addNewWord.source', { ns: 'dashboard' })}
                options={sources}
                value={selectedSource}
                lang={lang}
                onChange={setSelectedSource}
                readonly={false}
                placeholder="Choose a source"
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
            {drafts.map((draft) => (
              <ExampleLine
                key={draft.id}
                example={draft.value}
                onChange={(value) => updateDraft(draft.id, value)}
                onDelete={() => deleteDraft(draft.id)}
                isInnerBlockExample={false}
                tagEntries={tagEntries}
                allTags={allTags}
                lang={lang}
                readonly={false}
              />
            ))}
          </Stack>
        </CardContent>
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Button
            startIcon={<AddIcon />}
            onClick={() =>
              setDrafts((current) => [...current, createDraft(fromLangDialectId, toLangDialectId)])
            }
          >
            Add example
          </Button>
          <Button variant="contained" startIcon={<SendIcon />} onClick={submit}>
            Send to review
          </Button>
        </CardActions>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardHeader
          avatar={<CheckCircleIcon color="success" />}
          title="Published sentence translations"
          subheader={`${translations.totalItems} total`}
        />
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1.5 }}
          >
            <Pagination
              count={translations.totalPages}
              page={translations.currentPage}
              siblingCount={1}
              showFirstButton
              showLastButton
              onChange={handleTranslationsPageChange}
            />
            <Select
              size="small"
              value={translations.pageSize}
              onChange={(event) => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('page', '1');
                params.set('pageSize', event.target.value.toString());
                router.replace(`${pathname}?${params.toString()}`);
              }}
            >
              {[10, 20, 50, 100].map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
          </Stack>
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
          {translations.totalPages > 1 && (
            <Stack alignItems="center" sx={{ mt: 1.5 }}>
              <Pagination
                count={translations.totalPages}
                page={translations.currentPage}
                siblingCount={1}
                showFirstButton
                showLastButton
                onChange={handleTranslationsPageChange}
              />
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TranslationsDashboard;

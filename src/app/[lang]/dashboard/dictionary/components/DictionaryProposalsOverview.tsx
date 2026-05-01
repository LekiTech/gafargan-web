import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { ProposalStatus, ProposalType } from '@repository/entities/enums';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Box,
  Divider,
  IconButton,
  Modal,
  Stack,
  TableFooter,
  TablePagination,
  Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import TranslateIcon from '@mui/icons-material/Translate';
import PendingIcon from '@mui/icons-material/AccessTime';
import ApprovedIcon from '@mui/icons-material/CheckCircle';
import RejectedIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import ApproveIcon from '@mui/icons-material/CheckCircleOutline';
import RejectIcon from '@mui/icons-material/CancelOutlined';

import {
  DictionaryProposalModel,
  DictionaryProposalModelNestedType,
  SourceModelType,
  STATE,
  WordModelExistingNestedType,
  WordModelNestedType,
} from '@/dashboard/models/proposal.model';
import { Proposal } from '@repository/entities/Proposal';
import { WordEntryForm } from './WordEntryForm';
import { WebsiteLang } from '@api/types.model';
import { approveProposal, rejectProposal } from '@repository/proposal.repository';
import { langDialectIdToString } from '@/dashboard/utils';
import { useTranslation } from 'react-i18next';
import { FORM_ENTRY_STATE } from './WordEntryForm/constants';
import { ParsedTextComp } from '../../../components/ParsedTextComp';
import { TagComp } from '../../../components/TagComp';
import { expressionFont } from '@/fonts';
import { toLowerCaseLezgi } from '../../../../utils';

const ProposalsTypeChip: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case ProposalType.DICTIONARY:
      return <Chip variant="outlined" label={type} icon={<MenuBookIcon />} />;
    case ProposalType.SOURCE:
      return <Chip variant="outlined" label={type} icon={<LocalLibraryIcon />} />;
    case ProposalType.TRANSLATIONS:
      return <Chip variant="outlined" label={type} icon={<TranslateIcon />} />;
    default:
      return <Chip label={type} />;
  }
};

const ProposalsStatusChip: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case ProposalStatus.APPROVED:
      return <Chip variant="outlined" color="success" label={status} icon={<ApprovedIcon />} />;
    case ProposalStatus.REJECTED:
      return <Chip variant="outlined" color="error" label={status} icon={<RejectedIcon />} />;
    default:
      return <Chip color="warning" label={status} icon={<PendingIcon />} />;
  }
};

const stateColor = (state?: string) => {
  switch (state) {
    case STATE.ADDED:
      return 'success';
    case STATE.MODIFIED:
      return 'warning';
    case STATE.DELETED:
      return 'error';
    default:
      return 'default';
  }
};

const stateBorderColor = (state?: string) => {
  switch (state) {
    case STATE.ADDED:
      return 'success.light';
    case STATE.MODIFIED:
      return 'warning.light';
    case STATE.DELETED:
      return 'error.dark';
    default:
      return 'divider';
  }
};

const stateLabel = (state?: string) => {
  switch (state) {
    case STATE.ADDED:
      return 'new';
    case STATE.MODIFIED:
      return 'changed';
    case STATE.DELETED:
      return 'removed';
    default:
      return 'current';
  }
};

const normalizeComparable = (value: unknown) => JSON.stringify(value ?? null);

const findById = <T,>(items: T[] | undefined, id?: number): T | undefined =>
  id === undefined ? undefined : items?.find((item: any) => item.id === id);

const getSourceName = (sourceModels: SourceModelType[], sourceId?: number) => {
  if (!sourceId) {
    return undefined;
  }
  return sourceModels.find((source) => 'id' in source && source.id === sourceId)?.name;
};

const ChangeChip: React.FC<{ state?: string; changed?: boolean }> = ({ state, changed }) => {
  if (!state && !changed) {
    return null;
  }

  return (
    <Chip
      size="small"
      color={stateColor(state ?? STATE.MODIFIED) as any}
      variant="outlined"
      label={state ? stateLabel(state) : 'changed'}
      sx={{ height: 22, fontSize: 12 }}
    />
  );
};

const Tags: React.FC<{ tags?: string[] }> = ({ tags }) => {
  const { t } = useTranslation();
  if (!tags || tags.length === 0) {
    return null;
  }
  return (
    <Stack direction="row" gap={0.5} flexWrap="wrap" sx={{ mb: 0.5 }}>
      {tags.map((tag, idx) => (
        <TagComp key={`${tag}_${idx}`} label={t(tag, { ns: 'tags' })} />
      ))}
    </Stack>
  );
};

const TranslationPreview: React.FC<{
  lang: WebsiteLang;
  translation: any;
  fromLangDialectId: number;
  toLangDialectId: number;
  borderColor?: string;
}> = ({ translation, fromLangDialectId, toLangDialectId, borderColor }) => {
  const { t } = useTranslation();
  const phrasesByLang = translation.phrasesPerLangDialect ?? {};
  const sourcePhrases = phrasesByLang[fromLangDialectId] ?? [];
  const targetPhrases = phrasesByLang[toLangDialectId] ?? [];
  const fallbackLangIds = Object.keys(phrasesByLang)
    .map(Number)
    .filter((id) => id !== fromLangDialectId && id !== toLangDialectId);

  return (
    <Box sx={{ pl: 2, borderLeft: '2px solid', borderColor: borderColor || 'divider' }}>
      <Stack gap={0.5}>
        {[
          [fromLangDialectId, sourcePhrases],
          [toLangDialectId, targetPhrases],
          ...fallbackLangIds.map((id) => [id, phrasesByLang[id]] as const),
        ].map(([langDialectId, phrases]) =>
          phrases?.length ? (
            <Box key={langDialectId}>
              <Typography variant="caption" color="text.secondary">
                {langDialectIdToString(Number(langDialectId), t)}
              </Typography>
              {phrases.map((phrase: { phrase: string; tags?: string[] }, idx: number) => (
                <Box key={`${phrase.phrase}_${idx}`}>
                  <Tags tags={phrase.tags} />
                  <Typography component="div" variant="body2">
                    <ParsedTextComp text={phrase.phrase} />
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : null,
        )}
        <Tags tags={translation.tags} />
      </Stack>
    </Box>
  );
};

const DefinitionPreview: React.FC<{
  definition: any;
  previousDefinition?: any;
  lang: WebsiteLang;
  fromLangDialectId: number;
  toLangDialectId: number;
}> = ({ definition, previousDefinition, lang, fromLangDialectId, toLangDialectId }) => {
  const { t } = useTranslation();
  const changed =
    previousDefinition &&
    normalizeComparable(previousDefinition) !==
      normalizeComparable({
        ...definition,
        state: previousDefinition.state,
      });

  return (
    <Box
      sx={{
        py: 1.25,
        opacity: definition.state === STATE.DELETED ? 0.65 : 1,
        borderLeft: '4px solid',
        borderColor: stateBorderColor(definition.state),
        pl: 1.5,
      }}
    >
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.5 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Meaning
        </Typography>
        <ChangeChip state={definition.state} changed={changed} />
      </Stack>
      <Tags tags={definition.tags} />
      <Stack gap={0.75}>
        {definition.values?.map((value: { value: string; tags?: string[] }, idx: number) => (
          <Stack key={`${value.value}_${idx}`} direction="row" gap={1} alignItems="flex-start">
            <Typography
              variant="body2"
              sx={{ minWidth: 22, fontWeight: 700, color: 'text.secondary' }}
            >
              {t(`alphabet.${idx}`)}:
            </Typography>
            <Box>
              <Tags tags={value.tags} />
              <Typography component="div" variant="body1" sx={{ fontSize: 18 }}>
                <ParsedTextComp text={value.value} />
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
      {definition.examples?.length > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.75 }}>
            Examples
          </Typography>
          <Stack gap={1}>
            {definition.examples.map((example: any, idx: number) => (
              <TranslationPreview
                key={`definition_example_${idx}`}
                lang={lang}
                translation={example}
                fromLangDialectId={fromLangDialectId}
                toLangDialectId={toLangDialectId}
                borderColor={stateBorderColor(example.state)}
              />
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

const WordSidePreview: React.FC<{
  title: string;
  word?: WordModelNestedType | WordModelExistingNestedType;
  oppositeWord?: WordModelNestedType | WordModelExistingNestedType;
  sourceModels: SourceModelType[];
  lang: WebsiteLang;
  fromLangDialectId: number;
  toLangDialectId: number;
}> = ({ title, word, oppositeWord, sourceModels, lang, fromLangDialectId, toLangDialectId }) => {
  const { t } = useTranslation(lang);

  if (!word) {
    return (
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 2,
          minHeight: 220,
          bgcolor: 'action.hover',
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Typography color="text.secondary">No existing published entry.</Typography>
      </Box>
    );
  }

  const spellingChanged = oppositeWord && word.spelling !== oppositeWord.spelling;
  const sourceName = getSourceName(sourceModels, word.sourceId);

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: 2,
        minHeight: 220,
      }}
    >
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
        <Typography
          variant="h3"
          className={expressionFont.className}
          sx={{
            fontSize: { xs: '2.25rem', md: '3rem' },
            wordBreak: 'break-word',
            textDecoration: word.state === STATE.DELETED ? 'line-through' : 'none',
          }}
        >
          {toLowerCaseLezgi(word.spelling)}
        </Typography>
        <ChangeChip state={word.state} changed={spellingChanged} />
      </Stack>
      <Typography variant="caption" color="text.secondary">
        {langDialectIdToString(word.langDialectId, t)}
        {sourceName ? ` · ${sourceName}` : ''}
      </Typography>

      {word.spellingVariants?.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Word variants
          </Typography>
          <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 0.75 }}>
            {word.spellingVariants.map((variant) => {
              const previousVariant = findById(
                oppositeWord?.spellingVariants,
                'id' in variant ? variant.id : undefined,
              );
              const variantChanged =
                previousVariant &&
                normalizeComparable(previousVariant) !==
                  normalizeComparable({ ...variant, state: previousVariant.state });
              return (
                <Chip
                  key={`${variant.spelling}_${'id' in variant ? variant.id : 'new'}`}
                  variant="outlined"
                  label={toLowerCaseLezgi(variant.spelling)}
                  color={stateColor(variant.state) as any}
                  icon={
                    variant.state !== STATE.UNCHANGED || variantChanged ? (
                      <span style={{ width: 4 }} />
                    ) : undefined
                  }
                />
              );
            })}
          </Stack>
        </Box>
      )}

      <Stack gap={2} sx={{ mt: 2.5 }}>
        {word.wordDetails.map((detail, detailIdx) => {
          const previousDetail: any = findById(
            oppositeWord?.wordDetails,
            'id' in detail ? detail.id : undefined,
          );
          const detailChanged =
            previousDetail &&
            normalizeComparable(previousDetail) !==
              normalizeComparable({ ...detail, state: previousDetail.state });
          const detailSourceName = getSourceName(sourceModels, detail.sourceId);

          return (
            <Box key={`${detail.inflection}_${detailIdx}`}>
              <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {detailIdx + 1}
                </Typography>
                {detail.inflection && (
                  <Typography variant="h6" color="text.secondary">
                    {detail.inflection}
                  </Typography>
                )}
                <ChangeChip state={detail.state} changed={detailChanged} />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {langDialectIdToString(detail.langDialectId, t)}
                {detailSourceName ? ` · ${detailSourceName}` : ''}
              </Typography>
              <Stack gap={1} sx={{ mt: 1 }}>
                {detail.definitions.map((definition, definitionIdx) => (
                  <DefinitionPreview
                    key={`${definitionIdx}_${'id' in definition ? definition.id : 'new'}`}
                    definition={definition}
                    previousDefinition={findById(
                      previousDetail?.definitions,
                      'id' in definition ? definition.id : undefined,
                    )}
                    lang={lang}
                    fromLangDialectId={fromLangDialectId}
                    toLangDialectId={toLangDialectId}
                  />
                ))}
              </Stack>
              {(detail.examples?.length ?? 0) > 0 && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.75 }}>
                    Other examples
                  </Typography>
                  <Stack gap={1}>
                    {detail.examples?.map((example, idx) => (
                      <TranslationPreview
                        key={`detail_example_${idx}`}
                        lang={lang}
                        translation={example}
                        fromLangDialectId={fromLangDialectId}
                        toLangDialectId={toLangDialectId}
                        borderColor={stateBorderColor(example.state)}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
              {detailIdx < word.wordDetails.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

const ProposalDiff: React.FC<{
  proposal: Proposal;
  baselineWords: Record<number, Record<number, WordModelExistingNestedType>>;
  sourceModels: SourceModelType[];
  lang: WebsiteLang;
}> = ({ proposal, baselineWords, sourceModels, lang }) => {
  const dictionaryData = proposal.data as DictionaryProposalModelNestedType;

  return (
    <Stack gap={2}>
      <Typography variant="h6" fontWeight={700}>
        Review changes
      </Typography>
      {dictionaryData.entries.map((entry, idx) => {
        const baseline = 'id' in entry ? baselineWords[proposal.id]?.[entry.id] : undefined;
        const isNewWord = entry.state === STATE.ADDED && !baseline;

        return (
          <Card key={`${entry.state}-${'id' in entry ? entry.id : idx}`} variant="outlined">
            <CardHeader
              title={
                <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                  <Typography variant="subtitle1" fontWeight={700}>
                    {entry.spelling || `Entry ${idx + 1}`}
                  </Typography>
                  <Chip
                    size="small"
                    color={stateColor(entry.state) as any}
                    variant="outlined"
                    label={entry.state}
                  />
                </Stack>
              }
            />
            <CardContent sx={{ pt: 0 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: isNewWord ? '1fr' : { xs: '1fr', md: '1fr 1fr' },
                  gap: 2,
                  alignItems: 'start',
                }}
              >
                {!isNewWord && (
                  <WordSidePreview
                    title="Before proposal changes"
                    word={baseline}
                    oppositeWord={entry}
                    sourceModels={sourceModels}
                    lang={lang}
                    fromLangDialectId={dictionaryData.fromLangDialectId}
                    toLangDialectId={dictionaryData.toLangDialectId}
                  />
                )}
                <WordSidePreview
                  title={isNewWord ? 'New entry after approval' : 'Proposal after approval'}
                  word={entry}
                  oppositeWord={baseline}
                  sourceModels={sourceModels}
                  lang={lang}
                  fromLangDialectId={dictionaryData.fromLangDialectId}
                  toLangDialectId={dictionaryData.toLangDialectId}
                />
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
};

const DictionaryProposalsOverview: React.FC<{
  lang: WebsiteLang;
  sourceModels: SourceModelType[];
  proposals: Proposal[];
  readonly: boolean;
  baselineWords: Record<number, Record<number, WordModelExistingNestedType>>;
}> = ({ lang, sourceModels, proposals, readonly, baselineWords }) => {
  const { t } = useTranslation(lang);
  const [selectedProposal, setSelectedProposal] = React.useState<Proposal | undefined>();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              {/* Type is not needed because we will review proposals for every type on its dedicated route  */}
              {/* <TableCell>Type</TableCell> */}
              <TableCell align="left">ID</TableCell>
              <TableCell align="left">Proposed at</TableCell>
              <TableCell align="left">Proposed by</TableCell>
              {/* <TableCell align="left">Reviewed by</TableCell> */}
              <TableCell align="left">Words amount</TableCell>
              <TableCell align="left">Languages</TableCell>
              <TableCell align="left">Status</TableCell>
              <TableCell align="left">Comment</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {proposals
              .slice(
                rowsPerPage > 0 ? page * rowsPerPage : 0,
                rowsPerPage > 0 ? page * rowsPerPage + rowsPerPage : proposals.length,
              )
              .map((proposal) => {
                const dictionaryData: DictionaryProposalModelNestedType =
                  proposal.data! as DictionaryProposalModelNestedType;
                return (
                  <TableRow
                    key={proposal.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    {/* <TableCell component="th" scope="row">
                  <ProposalsTypeChip type={row.type} />
                </TableCell> */}
                    <TableCell align="left">{proposal.id}</TableCell>
                    <TableCell align="left">
                      {new Date(proposal.proposedAt).toLocaleString()}
                    </TableCell>
                    <TableCell align="left">{proposal.proposedBy.name}</TableCell>
                    {/* <TableCell align="left">{proposal.reviewedBy?.name}</TableCell> */}
                    <TableCell align="left">{dictionaryData.entries.length}</TableCell>
                    <TableCell align="left">
                      {langDialectIdToString(dictionaryData.fromLangDialectId, t) +
                        ' → ' +
                        langDialectIdToString(dictionaryData.toLangDialectId, t)}
                    </TableCell>
                    <TableCell align="left">
                      <ProposalsStatusChip status={proposal.status} />
                    </TableCell>
                    <TableCell align="left">{proposal.comment}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => setSelectedProposal(proposal)}>
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                colSpan={3}
                count={proposals.length}
                rowsPerPage={rowsPerPage}
                page={page}
                slotProps={{
                  select: {
                    inputProps: {
                      'aria-label': 'rows per page',
                    },
                    native: true,
                  },
                }}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(parseInt(event.target.value, 10));
                  setPage(0);
                }}
                // ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
      {selectedProposal !== undefined && (
        <Modal
          open={selectedProposal !== undefined}
          onClose={() => setSelectedProposal(undefined)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Card
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '1200px',
            }}
          >
            <CardHeader
              action={
                <IconButton aria-label="settings" onClick={() => setSelectedProposal(undefined)}>
                  <CloseIcon />
                </IconButton>
              }
              title={
                <Stack direction="row" gap={2}>
                  {selectedProposal.proposedBy.name}{' '}
                  <ProposalsStatusChip status={selectedProposal.status} />
                </Stack>
              }
              subheader={new Date(selectedProposal.proposedAt).toLocaleString()}
            />
            <CardContent sx={{ maxHeight: '70vh', overflowY: 'scroll', mb: '20px' }}>
              <Stack gap={4}>
                <ProposalDiff
                  proposal={selectedProposal}
                  baselineWords={baselineWords}
                  sourceModels={sourceModels}
                  lang={lang}
                />
              </Stack>
            </CardContent>
            {!readonly && (
              <CardActions sx={{ justifyContent: 'center' }}>
                {/* // TODO: fix real user ID */}
                <Button
                  variant="outlined"
                  startIcon={<RejectIcon />}
                  onClick={async () => {
                    const comment = prompt('What is the reason for rejection?');
                    if (comment) {
                      try {
                        await rejectProposal(selectedProposal.id, 1, comment);
                        window.location.reload();
                      } catch (e: any) {
                        alert(`Cannot reject proposal. ${e.message}`);
                      }
                    }
                  }}
                >
                  Reject
                </Button>
                {/* // TODO: fix real user ID */}
                <Button
                  variant="contained"
                  startIcon={<ApproveIcon />}
                  onClick={async () => {
                    try {
                      await approveProposal(selectedProposal.id, 1);
                      window.location.reload();
                    } catch (e: any) {
                      alert(`Cannot approve proposal. ${e.message}`);
                    }
                  }}
                >
                  Approve
                </Button>
                {/* <IconButton aria-label="share">
                <ThumbDownIcon color="error" />
              </IconButton> */}
              </CardActions>
            )}
          </Card>
        </Modal>
      )}
    </>
  );
};

export default DictionaryProposalsOverview;

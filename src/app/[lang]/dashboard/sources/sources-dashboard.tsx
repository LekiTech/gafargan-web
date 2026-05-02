'use client';

import * as React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Link as MuiLink,
  Modal,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ApproveIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LibraryBooksIcon from '@mui/icons-material/LocalLibrary';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RateReviewIcon from '@mui/icons-material/RateReview';
import RejectIcon from '@mui/icons-material/CancelOutlined';
import SendIcon from '@mui/icons-material/Send';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { WebsiteLang } from '@api/types.model';
import { SourceModelType, STATE } from '../models/proposal.model';
import { Proposal } from '@repository/entities/Proposal';
import { ProposalStatus } from '@repository/entities/enums';
import { PaginatedResponse } from '@repository/types.model';
import { approveProposal, rejectProposal } from '@repository/proposal.repository';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const sourceTabs = ['published', 'propose', 'review'] as const;
type SourceTab = (typeof sourceTabs)[number];

type SourceDraft = {
  name: string;
  authors: string;
  publicationYear: string;
  providedBy: string;
  providedByUrl: string;
  processedBy: string;
  copyright: string;
  seeSourceUrl: string;
  description: string;
};

const emptyDraft: SourceDraft = {
  name: '',
  authors: '',
  publicationYear: '',
  providedBy: '',
  providedByUrl: '',
  processedBy: '',
  copyright: '',
  seeSourceUrl: '',
  description: '',
};

const tabParamToIndex = (tab: string | null) => {
  const index = sourceTabs.indexOf(tab as SourceTab);
  return index === -1 ? 0 : index;
};

const a11yProps = (index: number) => ({
  id: `sources-tab-${index}`,
  'aria-controls': `sources-tabpanel-${index}`,
});

const TabPanel: React.FC<{
  children?: React.ReactNode;
  index: number;
  value: number;
}> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`sources-tabpanel-${index}`}
    aria-labelledby={`sources-tab-${index}`}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

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

const sourceValue = (value?: string) => (value && value.trim().length > 0 ? value : '-');

const toOptional = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const draftToProposal = (draft: SourceDraft): SourceModelType => ({
  state: STATE.ADDED,
  name: draft.name.trim(),
  authors: toOptional(draft.authors),
  publicationYear: toOptional(draft.publicationYear),
  providedBy: toOptional(draft.providedBy),
  providedByUrl: toOptional(draft.providedByUrl),
  processedBy: toOptional(draft.processedBy),
  copyright: toOptional(draft.copyright),
  seeSourceUrl: toOptional(draft.seeSourceUrl),
  description: toOptional(draft.description),
});

const Field: React.FC<{
  label: string;
  value?: string;
  multiline?: boolean;
}> = ({ label, value, multiline = false }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography sx={{ whiteSpace: multiline ? 'pre-wrap' : 'normal' }}>
      {sourceValue(value)}
    </Typography>
  </Box>
);

const SourceForm: React.FC<{
  draft: SourceDraft;
  onChange: (draft: SourceDraft) => void;
}> = ({ draft, onChange }) => {
  const { t } = useTranslation();
  const update = (key: keyof SourceDraft) => (event: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...draft, [key]: event.target.value });

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
        gap: 2,
      }}
    >
      <TextField
        label={t('sources.fields.name', { ns: 'dashboard' })}
        value={draft.name}
        onChange={update('name')}
        required
        fullWidth
      />
      <TextField
        label={t('sources.fields.authors', { ns: 'dashboard' })}
        value={draft.authors}
        onChange={update('authors')}
        fullWidth
      />
      <TextField
        label={t('sources.fields.publicationYear', { ns: 'dashboard' })}
        value={draft.publicationYear}
        onChange={update('publicationYear')}
        fullWidth
      />
      <TextField
        label={t('sources.fields.providedBy', { ns: 'dashboard' })}
        value={draft.providedBy}
        onChange={update('providedBy')}
        fullWidth
      />
      <TextField
        label={t('sources.fields.providedByUrl', { ns: 'dashboard' })}
        value={draft.providedByUrl}
        onChange={update('providedByUrl')}
        fullWidth
      />
      <TextField
        label={t('sources.fields.processedBy', { ns: 'dashboard' })}
        value={draft.processedBy}
        onChange={update('processedBy')}
        fullWidth
      />
      <TextField
        label={t('sources.fields.copyright', { ns: 'dashboard' })}
        value={draft.copyright}
        onChange={update('copyright')}
        fullWidth
      />
      <TextField
        label={t('sources.fields.sourceUrl', { ns: 'dashboard' })}
        value={draft.seeSourceUrl}
        onChange={update('seeSourceUrl')}
        fullWidth
      />
      <TextField
        label={t('sources.fields.description', { ns: 'dashboard' })}
        value={draft.description}
        onChange={update('description')}
        multiline
        minRows={4}
        fullWidth
        sx={{ gridColumn: { md: '1 / -1' } }}
      />
    </Box>
  );
};

const SourcePreview: React.FC<{ source: SourceModelType }> = ({ source }) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
        gap: 2,
      }}
    >
      <Field label={t('sources.fields.name', { ns: 'dashboard' })} value={source.name} />
      <Field label={t('sources.fields.authors', { ns: 'dashboard' })} value={source.authors} />
      <Field
        label={t('sources.fields.publicationYear', { ns: 'dashboard' })}
        value={source.publicationYear}
      />
      <Field
        label={t('sources.fields.providedBy', { ns: 'dashboard' })}
        value={source.providedBy}
      />
      <Field
        label={t('sources.fields.providedByUrl', { ns: 'dashboard' })}
        value={source.providedByUrl}
      />
      <Field
        label={t('sources.fields.processedBy', { ns: 'dashboard' })}
        value={source.processedBy}
      />
      <Field label={t('sources.fields.copyright', { ns: 'dashboard' })} value={source.copyright} />
      <Field
        label={t('sources.fields.sourceUrl', { ns: 'dashboard' })}
        value={source.seeSourceUrl}
      />
      <Box sx={{ gridColumn: { md: '1 / -1' } }}>
        <Field
          label={t('sources.fields.description', { ns: 'dashboard' })}
          value={source.description}
          multiline
        />
      </Box>
    </Box>
  );
};

const SourcesDashboard: React.FC<{
  lang: WebsiteLang;
  sources: SourceModelType[];
  proposals: PaginatedResponse<Proposal>;
  proposalsHistory: PaginatedResponse<Proposal>;
}> = ({ lang, sources, proposals, proposalsHistory }) => {
  const { t } = useTranslation(lang);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = tabParamToIndex(searchParams.get('tab'));
  const [draft, setDraft] = React.useState<SourceDraft>(emptyDraft);
  const [selectedProposal, setSelectedProposal] = React.useState<Proposal | undefined>();
  const [alert, setAlert] = React.useState<{
    severity: 'success' | 'error' | 'info';
    text: string;
  }>();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    const params = new URLSearchParams(searchParams.toString());
    const tab = sourceTabs[newValue];
    if (tab === sourceTabs[0]) {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const replaceProposalPaginationParams = (
    newPage: number,
    newRowsPerPage: number,
    options?: { history?: boolean },
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    const keyPrefix = options?.history ? 'proposalsHistory' : 'proposals';
    params.set('tab', 'review');
    params.set(`${keyPrefix}Page`, Math.max(1, newPage + 1).toString());
    params.set(`${keyPrefix}PageSize`, newRowsPerPage.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  const submit = async () => {
    if (draft.name.trim().length === 0) {
      setAlert({
        severity: 'info',
        text: t('sources.messages.addSourceName', { ns: 'dashboard' }),
      });
      return;
    }

    const result = await fetch('sources/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draftToProposal(draft)),
    });

    if (result.status >= 300) {
      setAlert({
        severity: 'error',
        text: t('sources.messages.sendFailed', { ns: 'dashboard' }),
      });
      return;
    }

    setAlert({
      severity: 'success',
      text: t('sources.messages.sentSuccessfully', { ns: 'dashboard' }),
    });
    setDraft(emptyDraft);
  };

  const renderProposalsTable = (
    paginatedProposals: PaginatedResponse<Proposal>,
    options?: { history?: boolean },
  ) => {
    const tablePage = Math.max(0, paginatedProposals.currentPage - 1);
    const rowsPerPage = paginatedProposals.pageSize;

    return (
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('proposals.table.id', { ns: 'dashboard' })}</TableCell>
              <TableCell>{t('proposals.table.proposedAt', { ns: 'dashboard' })}</TableCell>
              <TableCell>{t('proposals.table.proposedBy', { ns: 'dashboard' })}</TableCell>
              <TableCell>{t('proposals.table.source', { ns: 'dashboard' })}</TableCell>
              <TableCell>{t('proposals.table.status', { ns: 'dashboard' })}</TableCell>
              <TableCell>{t('proposals.table.comment', { ns: 'dashboard' })}</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedProposals.items.map((proposal) => {
              const source = proposal.data as SourceModelType;
              return (
                <TableRow key={proposal.id}>
                  <TableCell>{proposal.id}</TableCell>
                  <TableCell>{new Date(proposal.proposedAt).toLocaleString()}</TableCell>
                  <TableCell>{proposal.proposedBy.name}</TableCell>
                  <TableCell>{source.name}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={statusColor(proposal.status) as any}
                      label={t(`proposalStatuses.${proposal.status}`, {
                        ns: 'dashboard',
                        defaultValue: proposal.status,
                      })}
                    />
                  </TableCell>
                  <TableCell>{proposal.comment}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => setSelectedProposal(proposal)}>
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
            {paginatedProposals.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography color="text.secondary">
                    {t('sources.empty.proposals', { ns: 'dashboard' })}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[
                  5,
                  10,
                  25,
                  { label: t('common.all', { ns: 'dashboard' }), value: -1 },
                ]}
                count={paginatedProposals.totalItems}
                rowsPerPage={rowsPerPage}
                page={tablePage}
                onPageChange={(_, newPage) =>
                  replaceProposalPaginationParams(newPage, rowsPerPage, options)
                }
                onRowsPerPageChange={(event) =>
                  replaceProposalPaginationParams(0, parseInt(event.target.value, 10), options)
                }
                slotProps={{
                  select: {
                    inputProps: {
                      'aria-label': t('pagination.rowsPerPage', { ns: 'dashboard' }),
                    },
                    native: true,
                  },
                }}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box>
        {/* <Stack direction="row" alignItems="center" gap={1}>
          <LibraryBooksIcon color="primary" />
          <Typography variant="h4" component="h1" fontWeight={700}>
            Sources
          </Typography>
        </Stack> */}
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 760 }}>
          {t('sources.description', { ns: 'dashboard' })}
        </Typography>
      </Box>

      {alert && <Alert severity={alert.severity}>{alert.text}</Alert>}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label={t('sources.tabs.ariaLabel', { ns: 'dashboard' })}
        >
          <Tab label={t('sources.tabs.published', { ns: 'dashboard' })} {...a11yProps(0)} />
          <Tab label={t('sources.tabs.propose', { ns: 'dashboard' })} {...a11yProps(1)} />
          <Tab label={t('sources.tabs.review', { ns: 'dashboard' })} {...a11yProps(2)} />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardHeader
            avatar={<LibraryBooksIcon color="primary" />}
            title={t('sources.published.title', { ns: 'dashboard' })}
            subheader={t('pagination.total', {
              ns: 'dashboard',
              count: sources.length,
            })}
          />
          <CardContent>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('proposals.table.id', { ns: 'dashboard' })}</TableCell>
                    <TableCell>{t('sources.fields.name', { ns: 'dashboard' })}</TableCell>
                    <TableCell>{t('sources.fields.authors', { ns: 'dashboard' })}</TableCell>
                    <TableCell>{t('sources.fields.year', { ns: 'dashboard' })}</TableCell>
                    <TableCell>{t('sources.fields.providedBy', { ns: 'dashboard' })}</TableCell>
                    <TableCell>{t('sources.fields.processedBy', { ns: 'dashboard' })}</TableCell>
                    <TableCell>{t('sources.fields.url', { ns: 'dashboard' })}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sources.map((source) => (
                    <TableRow key={source.state === STATE.ADDED ? source.name : source.id}>
                      <TableCell>
                        {source.state === STATE.ADDED || source.id === -1 ? '-' : source.id}
                      </TableCell>
                      <TableCell>
                        {'id' in source && source.id === -1 ? t('fieldworkData') : source.name}
                      </TableCell>
                      <TableCell>{sourceValue(source.authors)}</TableCell>
                      <TableCell>{sourceValue(source.publicationYear)}</TableCell>
                      <TableCell>
                        {source.providedByUrl ? (
                          <MuiLink
                            href={source.providedByUrl}
                            target="_blank"
                            rel="noopener"
                            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                          >
                            {sourceValue(source.providedBy)}
                          </MuiLink>
                        ) : (
                          sourceValue(source.providedBy)
                        )}
                      </TableCell>
                      <TableCell>{sourceValue(source.processedBy)}</TableCell>
                      <TableCell>
                        {source.seeSourceUrl ? (
                          <MuiLink
                            href={source.seeSourceUrl}
                            target="_blank"
                            rel="noopener"
                            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                          >
                            {t('common.open', { ns: 'dashboard' })}{' '}
                            <OpenInNewIcon fontSize="inherit" />
                          </MuiLink>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {sources.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Typography color="text.secondary">
                          {t('sources.empty.published', { ns: 'dashboard' })}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardHeader
            avatar={<AddIcon color="primary" />}
            title={t('sources.propose.title', { ns: 'dashboard' })}
          />
          <CardContent>
            <SourceForm draft={draft} onChange={setDraft} />
          </CardContent>
          <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
            <Button variant="contained" startIcon={<SendIcon />} onClick={submit}>
              {t('addNewWord.sendToReview', { ns: 'dashboard' })}
            </Button>
          </CardActions>
        </Card>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardHeader
            avatar={<RateReviewIcon color="warning" />}
            title={t('sources.review.title', { ns: 'dashboard' })}
            subheader={t('proposals.pendingCount', {
              ns: 'dashboard',
              count: proposals.totalItems,
            })}
          />
          <CardContent>
            <Stack gap={2}>
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {t('proposals.needsReview', { ns: 'dashboard' })}
                </Typography>
                {renderProposalsTable(proposals)}
              </Box>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">{t('proposals.history', { ns: 'dashboard' })}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {renderProposalsTable(proposalsHistory, { history: true })}
                </AccordionDetails>
              </Accordion>
            </Stack>
          </CardContent>
        </Card>
      </TabPanel>

      {selectedProposal && (
        <Modal
          open={selectedProposal !== undefined}
          onClose={() => setSelectedProposal(undefined)}
          aria-labelledby="sources-proposal-title"
        >
          <Card
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(900px, 95vw)',
              maxHeight: '90vh',
              overflow: 'hidden',
            }}
          >
            <CardHeader
              action={
                <IconButton onClick={() => setSelectedProposal(undefined)}>
                  <CloseIcon />
                </IconButton>
              }
              title={
                <Stack direction="row" gap={2}>
                  {selectedProposal.proposedBy.name}
                  <Chip
                    size="small"
                    color={statusColor(selectedProposal.status) as any}
                    label={t(`proposalStatuses.${selectedProposal.status}`, {
                      ns: 'dashboard',
                      defaultValue: selectedProposal.status,
                    })}
                  />
                </Stack>
              }
              subheader={new Date(selectedProposal.proposedAt).toLocaleString()}
            />
            <CardContent sx={{ maxHeight: '70vh', overflowY: 'auto', mb: '20px' }}>
              <SourcePreview source={selectedProposal.data as SourceModelType} />
            </CardContent>
            {selectedProposal.status === ProposalStatus.PENDING && (
              <CardActions sx={{ justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<RejectIcon />}
                  onClick={async () => {
                    const comment = prompt(t('proposals.rejectionReason', { ns: 'dashboard' }));
                    if (comment) {
                      try {
                        await rejectProposal(selectedProposal.id, 1, comment);
                        window.location.reload();
                      } catch (e: any) {
                        window.alert(
                          t('proposals.cannotReject', { ns: 'dashboard', message: e.message }),
                        );
                      }
                    }
                  }}
                >
                  {t('proposals.reject', { ns: 'dashboard' })}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<ApproveIcon />}
                  onClick={async () => {
                    try {
                      await approveProposal(selectedProposal.id, 1);
                      window.location.reload();
                    } catch (e: any) {
                      window.alert(
                        t('proposals.cannotApprove', { ns: 'dashboard', message: e.message }),
                      );
                    }
                  }}
                >
                  {t('proposals.approve', { ns: 'dashboard' })}
                </Button>
              </CardActions>
            )}
          </Card>
        </Modal>
      )}
    </Box>
  );
};

export default SourcesDashboard;

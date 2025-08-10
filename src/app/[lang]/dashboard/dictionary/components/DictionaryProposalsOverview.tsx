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
  IconButton,
  Modal,
  Stack,
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
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';

import {
  DictionaryProposalModel,
  SourceModel,
  SourceModelType,
} from '@/dashboard/models/proposal.model';
import { Proposal } from '@repository/entities/Proposal';
import { WordEntryForm } from './WordEntryForm';
import { WebsiteLang } from '@api/types.model';
import { approveProposal, rejectProposal } from '@repository/proposal.repository';

function createData(
  id: number,
  type: string,
  proposedBy: string,
  status: string,
  reviewedBy?: string,
  comment?: string,
) {
  return { id, type, proposedBy, status, reviewedBy, comment };
}

const rows = [
  createData(1, ProposalType.DICTIONARY, 'K.Z. Tadzjibov', ProposalStatus.APPROVED, 'R. Gasratov'),
  createData(2, ProposalType.SOURCE, 'K.Z. Tadzjibov', ProposalStatus.PENDING),
  createData(
    3,
    ProposalType.DICTIONARY,
    'K.Z. Tadzjibov',
    ProposalStatus.REJECTED,
    'R. Gamidov',
    'a lot of typos',
  ),
  createData(4, ProposalType.TRANSLATIONS, 'A. Magomedov', ProposalStatus.APPROVED, 'R. Gamidov'),
  createData(5, ProposalType.DICTIONARY, 'A. Magomedov', ProposalStatus.APPROVED, 'R. Gamidov'),
];

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

const DictionaryProposalsOverview: React.FC<{
  lang: WebsiteLang;
  sourceModels: SourceModelType[];
  proposals: Proposal[];
  readonly: boolean;
}> = ({ lang, sourceModels, proposals, readonly }) => {
  const [selectedProposal, setSelectedProposal] = React.useState<Proposal | undefined>();
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
              <TableCell align="left">Reviewed by</TableCell>
              <TableCell align="left">Status</TableCell>
              <TableCell align="left">Comment</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {proposals.map((proposal) => (
              <TableRow
                key={proposal.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                {/* <TableCell component="th" scope="row">
                  <ProposalsTypeChip type={row.type} />
                </TableCell> */}
                <TableCell align="left">{proposal.id}</TableCell>
                <TableCell align="left">{new Date(proposal.proposedAt).toLocaleString()}</TableCell>
                <TableCell align="left">{proposal.proposedBy.name}</TableCell>
                <TableCell align="left">{proposal.reviewedBy?.name}</TableCell>
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
            ))}
          </TableBody>
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
              <WordEntryForm
                lang={lang}
                sourceModels={sourceModels}
                dictionaryModel={DictionaryProposalModel.fromNestedTypes(
                  selectedProposal!.data!.entries,
                  selectedProposal!.data!.source,
                )}
                readonly={true}
              />
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
                    await approveProposal(selectedProposal.id, 1);
                    window.location.reload();
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

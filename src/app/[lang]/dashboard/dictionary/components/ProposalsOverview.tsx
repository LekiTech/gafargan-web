import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { ProposalStatus, ProposalType } from '@repository/entities/enums';
import { Chip, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import TranslateIcon from '@mui/icons-material/Translate';
import PendingIcon from '@mui/icons-material/AccessTime';
import ApprovedIcon from '@mui/icons-material/CheckCircle';
import RejectedIcon from '@mui/icons-material/Cancel';

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

const ProposalsOverview: React.FC = () => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            {/* Type is not needed because we will review proposals for every type on its dedicated route  */}
            {/* <TableCell>Type</TableCell> */}
            <TableCell align="left">Proposed by</TableCell>
            <TableCell align="left">Reviewed by</TableCell>
            <TableCell align="left">Status</TableCell>
            <TableCell align="left">Comment</TableCell>
            <TableCell align="right"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              {/* <TableCell component="th" scope="row">
                <ProposalsTypeChip type={row.type} />
              </TableCell> */}
              <TableCell align="left">{row.proposedBy}</TableCell>
              <TableCell align="left">{row.reviewedBy}</TableCell>
              <TableCell align="left">
                <ProposalsStatusChip status={row.status} />
              </TableCell>
              <TableCell align="left">{row.comment}</TableCell>
              <TableCell align="right">
                <IconButton>
                  <VisibilityIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProposalsOverview;

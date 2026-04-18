import { Chip } from '@mui/material';
import { STATE } from '../../../models/proposal.model';

export const StateChip: React.FC<{ state: string }> = ({ state }) => {
  if (state === STATE.DELETED) {
    return <Chip size="small" color="error" label="Deleted" />;
  }

  if (state === STATE.MODIFIED) {
    return <Chip size="small" color="warning" label="Modified" />;
  }

  if (state === STATE.ADDED) {
    return <Chip size="small" color="success" label="Added" />;
  }

  return null;
};

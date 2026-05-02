import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { STATE } from '../../../models/proposal.model';

export const StateChip: React.FC<{ state: string }> = ({ state }) => {
  const { t } = useTranslation();

  if (state === STATE.DELETED) {
    return <Chip size="small" color="error" label={t('states.deleted', { ns: 'dashboard' })} />;
  }

  if (state === STATE.MODIFIED) {
    return <Chip size="small" color="warning" label={t('states.modified', { ns: 'dashboard' })} />;
  }

  if (state === STATE.ADDED) {
    return <Chip size="small" color="success" label={t('states.added', { ns: 'dashboard' })} />;
  }

  return null;
};

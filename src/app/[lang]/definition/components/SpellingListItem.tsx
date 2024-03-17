import React, { FC } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ListItemIcon, ListSubheader, SxProps, Theme } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export const SpellingListItem: FC<{
  id: string;
  spelling: string;
  showIcon?: boolean;
  sx?: SxProps<Theme>;
}> = ({ id, spelling, showIcon, sx }) => {
  const path = usePathname();
  const searchParams = useSearchParams();
  const href = `${path}?fromLang=${searchParams.get('fromLang')}&toLang=${searchParams.get(
    'toLang',
  )}&exp=${spelling}`;
  return (
    <ListSubheader
      component="a"
      href={href}
      target="_blank"
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: '25px',
        mt: '10px',
        backgroundColor: 'inherit',
        width: 'fit-content',
        ...sx,
      }}
    >
      {spelling}
      {showIcon !== false && (
        <ListItemIcon sx={{ minWidth: 'unset' }}>
          <OpenInNewIcon fontSize="small" sx={{ ml: '10px' }} />
        </ListItemIcon>
      )}
    </ListSubheader>
  );
};

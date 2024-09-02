import React, { FC } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Box, ListItemIcon, ListSubheader, SxProps, Theme } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export const SpellingListItem: FC<{
  id: string;
  spelling: string;
  showIcon?: boolean;
  fromLang?: string;
  toLang?: string;
  sx?: SxProps<Theme>;
}> = ({ id, spelling, showIcon, fromLang, toLang, sx }) => {
  const path = usePathname();
  const searchParams = useSearchParams();
  const href = `${path}?fromLang=${fromLang ?? searchParams.get('fromLang')}&toLang=${toLang ?? searchParams.get('toLang')
    }&exp=${spelling}`;
  return (
    <Box
      component="a"
      href={href}
      target="_blank"
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: '25px',
        mt: '10px',
        backgroundColor: 'inherit',
        color: 'inherit',
        textDecoration: 'inherit',
        font: 'inherit',
        fontFamily: 'inherit',
        fontSize: 'inherit',
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
    </Box>
  );
};

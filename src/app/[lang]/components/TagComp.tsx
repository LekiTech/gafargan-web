'use client';
import { colors } from '@/colors';
import { Chip } from '@mui/material';
import { red } from '@mui/material/colors';
import { FC } from 'react';

export const TagComp: FC<{
  label: string;
  styles?: { marginLeft?: string; marginRight?: string };
}> = ({ label, styles }) => {
  return (
    <Chip
      size="small"
      sx={{
        maxWidth: '250px',
        fontSize: '12px',
        width: 'fit-content',
        cursor: 'pointer',
        ':hover': { backgroundColor: red[50], color: colors.secondary },
        marginLeft: styles?.marginLeft,
        marginRight: styles?.marginRight,
      }}
      label={label}
    />
  );
};

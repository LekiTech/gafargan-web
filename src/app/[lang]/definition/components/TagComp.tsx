'use client';
import { colors } from '@/colors';
import { Chip } from '@mui/material';
import { red } from '@mui/material/colors';
import { FC } from 'react';

export const TagComp: FC<{ label: string }> = ({ label }) => {
  return (
    <Chip
      size="small"
      sx={{
        maxWidth: '250px',
        fontSize: '12px',
        width: 'wrap-content',
        cursor: 'pointer',
        ':hover': { backgroundColor: red[50], color: colors.secondary },
      }}
      label={label}
    />
  );
};

'use client';
import React, { FC } from 'react';
import { Box } from '@mui/material';

/**
 * Intended usage is on some pages below the top bar to create vertical spacing
 */
export const VerticalSpacing: FC = () => {
  return (
    <Box
      sx={(theme) => ({
        display: 'block',
        width: '100%',
        height: '45px',
        // mb: '150px',
        [theme.breakpoints.down('md')]: {
          // mb: '50px',
          height: '0px',
        },
      })}
    />
  );
};

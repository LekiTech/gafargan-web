'use client';

import React, { FC } from 'react';
import { Snackbar, Paper, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { colors } from '@/colors';

const ANDROID_IOS_CLOSED_STORAGE_KEY = 'android-ios-promo-snackbar-closed';

export const PromoSnackbar: FC<{ children: React.ReactNode; flexDirection?: 'column' | 'row' }> = ({
  children,
  flexDirection,
}) => {
  const isClosedPreviously = localStorage.getItem(ANDROID_IOS_CLOSED_STORAGE_KEY);
  const [open, setOpen] = React.useState(isClosedPreviously !== 'true');
  const handleClose = () => {
    setOpen(false);
    localStorage.setItem(ANDROID_IOS_CLOSED_STORAGE_KEY, 'true');
  };
  return (
    <Snackbar open={open}>
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.secondary + 'dd', //'primary.main',
          color: 'white',
          padding: 1,
          textAlign: 'center',
          display: 'flex',
          flexDirection: flexDirection ?? 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {children}
        <IconButton
          aria-label="close"
          color="inherit"
          size="small"
          sx={{ position: 'absolute', right: 8, top: 8 }}
          onClick={handleClose}
        >
          <CloseIcon />
        </IconButton>
      </Paper>
    </Snackbar>
  );
};

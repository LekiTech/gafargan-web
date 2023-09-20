'use client';
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { Avatar, Typography } from '@mui/material';
import Search from './Search';
import { DictionaryLang } from '../api/types';
import images from '@/store/images';
import { ElevationScroll } from './ElevateScroll';
import { colors } from '@/colors';

type TopBarProps = {
  langs: Record<DictionaryLang, string>;
  searchLabel: string;
};

const TopBar = (props: TopBarProps) => {
  const { langs, searchLabel } = props;
  console.log('TopBar', props);
  return (
    <ElevationScroll {...props}>
      <AppBar
        sx={{
          backgroundColor: colors.primary, //'white',
          color: colors.text.light, //'#333',
          borderBottomStyle: 'solid',
          borderBottomWidth: '1px',
          borderBottomColor: 'grey.300',
        }}
      >
        <Toolbar sx={{ display: 'flex', alignItems: 'center', p: '10px' }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifySelf: 'start',
            }}
          >
            <Avatar src={images.logo.src} sx={{ m: '10px' }} />
            Гафарган
          </Typography>
          <Search searchLabel={searchLabel} langs={langs} />
        </Toolbar>
      </AppBar>
    </ElevationScroll>
  );
};

export default TopBar;

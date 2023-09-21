'use client';
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { Avatar, Box, Grid, Typography } from '@mui/material';
import Search from './Search';
import { DictionaryLang, WebsiteLang } from '../api/types';
import images from '@/store/images';
import { ElevationScroll } from './ElevateScroll';
import { colors } from '@/colors';
import WebLanguageSelect from './WebLanguageSelect';
import Link from 'next/link';

type TopBarProps = {
  currentLang: WebsiteLang;
  webLangs: Record<WebsiteLang, string>;
  dictLangs: Record<DictionaryLang, string>;
  searchLabel: string;
};

const TopBar = (props: TopBarProps) => {
  const { currentLang, webLangs, dictLangs, searchLabel } = props;
  return (
    <ElevationScroll {...props}>
      <AppBar
        sx={{
          backgroundColor: colors.primary, //'white',
          color: colors.text.light, //'#333',
          borderBottomStyle: 'solid',
          borderBottomWidth: '1px',
          borderBottomColor: colors.primaryTint,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ display: 'flex', alignItems: 'center', p: '10px' }}>
          <Grid container>
            <Grid item xs={12} sm={1}>
              <Link href={`/${currentLang}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifySelf: 'start',
                    // color: colors.text.light,
                    // textDecoration: 'none',
                  }}
                >
                  <Avatar src={images.logo.src} sx={{ m: '10px' }} />
                  Гафарган
                </Typography>
              </Link>
            </Grid>
            <Grid item xs={12} sm={9}>
              <Search searchLabel={searchLabel} langs={dictLangs} />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Box
                sx={{
                  m: '10px',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'end',
                  alignItems: 'center',
                }}
              >
                <WebLanguageSelect currentLang={currentLang} webLangs={webLangs} />
              </Box>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </ElevationScroll>
  );
};

export default TopBar;

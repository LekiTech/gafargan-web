'use client';
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { Avatar, Box, Grid, Typography, useScrollTrigger, useTheme } from '@mui/material';
import { Search } from './Search';
import { DictionaryLang, WebsiteLang } from '../../../api/types.model';
import images from '@/store/images';
import { ElevationScroll } from './ElevateScroll';
import { colors } from '@/colors';
import WebLanguageSelect from './WebLanguageSelect';
import Link from 'next/link';
import { opensansFont } from '@/fonts';

type TopBarProps = {
  currentLang: WebsiteLang;
  // webLangs: Record<WebsiteLang, string>;
  // dictLangs: Record<DictionaryLang, string>;
  // searchLabel: string;
};

const TopBar = (props: TopBarProps) => {
  const { currentLang } = props;
  const trigger = useScrollTrigger({
    threshold: 10,
  });
  const theme = useTheme();

  return (
    // <div> top bar </div>
    <Box
      sx={{
        mb: '170px',
        [theme.breakpoints.down('md')]: {
          // mb: trigger ? '100px' : '200px'
          mb: '200px'
        }
      }}
    >
      <ElevationScroll {...props}>
        <AppBar
          sx={(theme) => ({
            position: 'fixed',
            backgroundColor: colors.primary, //'white',
            color: colors.text.light, //'#333',
            borderBottomStyle: 'solid',
            borderBottomWidth: '1px',
            borderBottomColor: colors.primaryTint,
            zIndex: (theme) => theme.zIndex.drawer + 1,
          })}
        >
          <Toolbar
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: '10px',
            }}
          >
            <Grid
              container
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                maxWidth: '1400px',
              }}
            >
              <Grid item xs={6} md={2} sx={{ mt: '10px', display: 'flex', alignItems: 'flex-start' }}>
                {/* <Grid item xs={6} md={2} sx={{ display: 'flex', alignItems: 'center' }}> */}
                <Link href={`/${currentLang}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  <Typography
                    variant="h6"
                    component="div"
                    className={opensansFont.className}
                    // className={lusitanaFont.className}
                    sx={(theme) => ({
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifySelf: 'start',
                      [theme.breakpoints.down('lg')]: {
                        fontSize: '1rem',
                      },
                      // width: '150px',
                      // color: colors.text.light,
                      // textDecoration: 'none',
                    })}
                  >
                    <Avatar
                      src={images.logo.src}
                      sx={(theme) => ({
                        width: '56px',
                        height: '56px',
                        mr: '10px',
                        [theme.breakpoints.down('lg')]: {
                          width: '36px',
                          height: '36px',
                          mr: '7px',
                        },
                      })}
                    />
                    {/* Гафарган */}
                    Gafargan
                  </Typography>
                </Link>
              </Grid>
              <Grid
                item
                xs={12}
                md={8}
                order={{ xs: 3, md: 2 }}
                sx={(theme) => ({
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  mt: '10px',
                  [theme.breakpoints.down('md')]: {
                    mt: '15px',
                    display: trigger ? 'none' : 'flex',
                  },
                })}
              >
                <Search lang={currentLang} />
              </Grid>
              <Grid item xs={6} md={2} order={{ xs: 2, md: 3 }}>
                <Box
                  sx={{
                    m: '10px',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'end',
                    alignItems: 'center',
                  }}
                >
                  <WebLanguageSelect
                    currentLang={currentLang}
                    webLangs={{ lez: 'Lezgi', rus: 'Russian', eng: 'English', tur: 'Turkish' }} //{t('languages', { returnObjects: true }) as Record<WebsiteLang, string>}
                  />
                  {/* <WebLanguageSelect currentLang={currentLang} webLangs={webLangs} /> */}
                </Box >
              </Grid >
            </Grid >
          </Toolbar >
        </AppBar >
      </ElevationScroll >
    </Box >
  );
};

export default TopBar;

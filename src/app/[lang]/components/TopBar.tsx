'use client';
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import {
  Avatar,
  Box,
  Grid,
  Typography,
  useMediaQuery,
  useScrollTrigger,
  useTheme,
} from '@mui/material';
import { Search } from './Search';
import { DictionaryLang, WebsiteLang } from '../../../api/types.model';
import images from '@/store/images';
import { ElevationScroll } from './ElevateScroll';
import { colors } from '@/colors';
import WebLanguageSelect from './WebLanguageSelect';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { expressionFont, lusitanaFont, opensansFont } from '@/fonts';
// import { HideOnScroll } from './HideScroll';
import { usePathname, useSearchParams } from 'next/navigation';
import { createUserProfile } from '@api/mixpanel';

type TopBarProps = {
  currentLang: WebsiteLang;
  sessionId?: string;
  // webLangs: Record<WebsiteLang, string>;
  // dictLangs: Record<DictionaryLang, string>;
  // searchLabel: string;
};

const TopBar = (props: TopBarProps) => {
  const { currentLang, sessionId } = props;
  const trigger = useScrollTrigger({
    threshold: 25,
  });
  const theme = useTheme();
  const isMdSize = useMediaQuery(theme.breakpoints.down('md'));
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const pathSplit = pathname.split('/');
  const pageName = pathSplit[pathSplit.length - 1];

  React.useEffect(() => {
    if (!sessionId) {
      // console.log('Creating new user profile');
      // console.log('params', params);
      const properties: Record<string, string> = {};
      // Extract UTM parameters from searchParams
      const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
      utmKeys.forEach((key) => {
        const value = searchParams.has(key) ? searchParams.get(key) : null;
        if (value !== null) {
          properties[key] = value;
        }
      });
      createUserProfile(properties);
    }
  }, []);
  return (
    // <div> top bar </div>
    <Box
      sx={{
        mb: '170px',
        [theme.breakpoints.down('md')]: {
          // mb: trigger ? '100px' : '200px'
          mb: '200px',
        },
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
                flex: 1,
                flexDirection: 'row',
                justifyContent: pageName == 'translate' ? 'space-between' : 'center',
                maxWidth: '1400px',
              }}
            >
              <Grid
                size={{ xs: 6, md: 2 }}
                sx={(theme) => ({
                  mt: '10px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  [theme.breakpoints.down('md')]: {
                    mt: '0px',
                  },
                })}
              >
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
                        fontSize: '0.8rem',
                        display: trigger ? 'none' : 'flex',
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
                          width: '32px',
                          height: '32px',
                          mr: '7px',
                        },
                      })}
                    />
                    {/* Гафарган */}
                    Gafargan
                  </Typography>
                </Link>
              </Grid>
              {pageName !== 'translate' && (
                <Grid
                  size={{ xs: 12, md: 8 }}
                  order={{ xs: 3, md: 2 }}
                  sx={(theme) => ({
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    mt: '10px',
                    [theme.breakpoints.down('md')]: {
                      mt: '0px',
                      // display: trigger ? 'none' : 'flex',
                    },
                  })}
                >
                  <Search lang={currentLang} hideLangs={trigger} />
                </Grid>
              )}
              <Grid size={{ xs: 6, md: 2 }} order={{ xs: 2, md: 3 }}>
                <Box
                  sx={(theme) => ({
                    m: '10px',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'end',
                    alignItems: 'center',
                    [theme.breakpoints.down('md')]: {
                      mt: '0px',
                      display: trigger ? 'none' : 'flex',
                    },
                  })}
                >
                  <WebLanguageSelect
                    currentLang={currentLang}
                    flagHeight={isMdSize ? 12 : 20}
                    flagWidth={isMdSize ? 18 : 30}
                    fontSize={isMdSize ? '0.8rem' : 18}
                    webLangs={{ lez: 'Lezgi', rus: 'Russian', eng: 'English', tur: 'Turkish' }} //{t('languages', { returnObjects: true }) as Record<WebsiteLang, string>}
                  />
                  {/* <WebLanguageSelect currentLang={currentLang} webLangs={webLangs} /> */}
                </Box>
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
      </ElevationScroll>
    </Box>
  );
};

export default TopBar;

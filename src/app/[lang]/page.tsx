// "use client";
import React, { FC, use } from 'react';
import { useRouter } from 'next/router'
// import '@/i18n';
import images from '@/store/images';
import { Autocomplete, Button, IconButton, Stack, TextField } from '@mui/material';
import { useTranslation } from '../i18n';
import Search from './components/Search';

const colors = {
  primary: '#0f3b2e',
  primaryTint: '#132e05',
  secondary: '#bb1614',
  secondaryTint: '#810000',
}

type HomeProps = { 
  params: { lang: string },
  searchParams: { fromLang: string, toLang: string },
};

const Home: FC<HomeProps> = async (props) => {
  const { 
    params: { lang }, 
    searchParams: { fromLang, toLang } 
  } = props;
  // const [options, setOptions] = React.useState<string[]>([]);
  console.log(props);
  const options: string[] = [];
  const { t } = await useTranslation(lang);
  // const [lang, setLang] = React.useState({
  //   from: 'lez',
  //   to: 'rus',
  // });
  // const lang = {
  //   from: 'lez',
  //   to: 'rus',
  // };
  const selectedLanguages = {
    from: fromLang ?? 'lez',
    to: toLang ?? 'rus'
  }
  return (
    <Stack spacing={2} sx={{alignItems: 'center', pt: '25px'}}>
      <Stack direction="row" spacing={2}>
        <h1>Gafargan</h1>
        <Search 
          fromLang={{name: t(`languages.${selectedLanguages.from}`), code: selectedLanguages.from}}
          toLang={{name: t(`languages.${selectedLanguages.to}`), code: selectedLanguages.to}}
        />
        {/* <Stack direction="row" spacing={0}>
          <Autocomplete
            sx={{ width: 300 }}
            freeSolo
            id="free-solo-2-demo"
            disableClearable
            options={options}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Жагъурун"
                InputProps={{
                  ...params.InputProps,
                  type: 'search',
                }}
              />
            )}
          />
          <Button variant="contained">
            <SearchIcon fontSize="large" />
          </Button>
          {/* <IconButton aria-label="search" onClick={() => setLang({ from: lang.to, to: lang.from })}>
            <SearchIcon />
          </IconButton> * /}
        </Stack> */}
      </Stack>
      {/* <Stack direction="row" spacing={2} sx={{alignItems: 'center'}}>
        {t(`languages.${lang.from}`)}
        <IconButton aria-label="switch" onClick={() => {
        //  setLang({ from: lang.to, to: lang.from })
        }}>
          <SwitchIcon />
        </IconButton>
        {t(`languages.${lang.to}`)}
      </Stack> */}
    </Stack>
  );
}

export default Home;
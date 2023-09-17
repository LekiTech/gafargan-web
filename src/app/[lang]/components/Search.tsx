"use client";
import React, { FC } from 'react';
import { usePathname, useRouter,  } from 'next/navigation'
// import '@/i18n';
import images from '@/store/images';
import { Autocomplete, Button, IconButton, Stack, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SwitchIcon from '@mui/icons-material/SyncAlt';

const colors = {
  primary: '#0f3b2e',
  primaryTint: '#132e05',
  secondary: '#bb1614',
  secondaryTint: '#810000',
}

const Search: FC<{fromLang: {code: string, name: string}, toLang: {code: string, name: string}}> = ({fromLang, toLang}) => {
  const router = useRouter()
  const pathname = usePathname()
  
  
  const [options, setOptions] = React.useState<string[]>([]);

  return (
    <Stack spacing={2} sx={{alignItems: 'center', pt: '25px'}}>
      <Stack direction="row" spacing={0}>
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
        </IconButton> */}
      </Stack>
      <Stack direction="row" spacing={2} sx={{alignItems: 'center'}}>
        {fromLang.name}
        <IconButton aria-label="switch" onClick={() => {
        //  setLang({ from: lang.to, to: lang.from })
          router.push(pathname + `?fromLang=${toLang.code}&toLang=${fromLang.code}`)
        }}>
          <SwitchIcon />
        </IconButton>
        {toLang.name}
      </Stack>
    </Stack>
  );
}

export default Search;
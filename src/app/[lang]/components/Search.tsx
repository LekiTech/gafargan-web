"use client";
import React, { FC } from 'react';
import { usePathname, useRouter,  } from 'next/navigation'
// import '@/i18n';
import images from '@/store/images';
import { Box, Button, IconButton, Stack, TextField } from '@mui/material';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import SearchIcon from '@mui/icons-material/Search';
import SwitchIcon from '@mui/icons-material/SyncAlt';
import ClientExpressionApi from '@/api/clientExpression';
import { Lang } from '@/api/types';

const colors = {
  primary: '#0f3b2e',
  primaryTint: '#132e05',
  secondary: '#bb1614',
  secondaryTint: '#810000',
}

const Search: FC<{fromLang: {code: Lang, name: string}, toLang: {code: Lang, name: string}}> = ({fromLang, toLang}) => {
  const router = useRouter()
  const pathname = usePathname()
  
  
  const [options, setOptions] = React.useState<string[]>([]);

  return (
    <Stack spacing={2} sx={{alignItems: 'center', pt: '25px'}}>
      <Stack direction="row" spacing={0}>
        <Autocomplete
          id="free-solo-search"
          sx={{ width: 300 }}
          freeSolo={true}
          disableClearable={true}
          onInputChange={async (e, v, r) => setOptions(await ClientExpressionApi.search({exp: v, fromLang: fromLang.code, toLang: toLang.code}))}
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
          renderOption={(props, option, state, ownerState) => (
          <Box
            sx={{
              borderRadius: '8px',
              margin: '5px',
              [`&.${autocompleteClasses.option}`]: {
                padding: '8px',
              },
            }}
            component="li"
            {...props}
            onClick={(event) => {
              if (props.onClick) {
                props.onClick(event);
              }
              router.push(pathname + `/definition?fromLang=${fromLang.code}&toLang=${toLang.code}&exp=${option}`)
            }}
          >
            {ownerState.getOptionLabel(option)}
          </Box>)}
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
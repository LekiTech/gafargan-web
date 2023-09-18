'use client';
import React, { FC } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
};

const roundingRadius = '100px';

const Search: FC<{
  fromLang: { code: Lang; name: string };
  toLang: { code: Lang; name: string };
}> = ({ fromLang, toLang }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [options, setOptions] = React.useState<string[]>([]);
  const [inputValue, setInputValue] = React.useState('');

  const goToDefinition = (exp: string) => {
    const prefix = pathname.includes('definition') ? pathname : pathname + '/definition';
    router.push(prefix + `?fromLang=${fromLang.code}&toLang=${toLang.code}&exp=${exp}`);
  };

  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center', pt: '25px' }}>
      {fromLang.name}
      <IconButton
        aria-label="switch"
        onClick={() => {
          //  setLang({ from: lang.to, to: lang.from })
          router.push(pathname + `?fromLang=${toLang.code}&toLang=${fromLang.code}`);
        }}
      >
        <SwitchIcon />
      </IconButton>
      {toLang.name}
      <Stack direction="row" spacing={0}>
        <Autocomplete
          id="free-solo-search"
          sx={{ width: 300 }}
          freeSolo={true}
          disableClearable={true}
          inputValue={inputValue}
          // On `Enter` key press
          onChange={(e, v, r) => goToDefinition(v)}
          // On input change, visible to user text change
          onInputChange={async (e, v, r) => {
            setInputValue(v);
            setOptions(
              await ClientExpressionApi.search({
                exp: v,
                fromLang: fromLang.code,
                toLang: toLang.code,
              }),
            );
          }}
          options={options}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Жагъурун"
              InputProps={{
                ...params.InputProps,
                type: 'search',
                style: {
                  borderStartStartRadius: roundingRadius,
                  borderEndStartRadius: roundingRadius,
                },
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
                goToDefinition(option);
              }}
            >
              {ownerState.getOptionLabel(option)}
            </Box>
          )}
        />
        <Button
          variant="contained"
          sx={{ borderEndEndRadius: roundingRadius, borderStartEndRadius: roundingRadius }}
          onClick={() => goToDefinition(inputValue)}
        >
          <SearchIcon fontSize="large" />
        </Button>
        {/* <IconButton aria-label="search" onClick={() => setLang({ from: lang.to, to: lang.from })}>
          <SearchIcon />
        </IconButton> */}
      </Stack>
      {/* <Stack direction="row" spacing={2} sx={{alignItems: 'center'}}>
        {fromLang.name}
        <IconButton aria-label="switch" onClick={() => {
        //  setLang({ from: lang.to, to: lang.from })
          router.push(pathname + `?fromLang=${toLang.code}&toLang=${fromLang.code}`)
        }}>
          <SwitchIcon />
        </IconButton>
        {toLang.name}
      </Stack> */}
    </Stack>
  );
};

export default Search;

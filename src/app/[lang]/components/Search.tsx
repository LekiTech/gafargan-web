'use client';
import React, { FC } from 'react';
import { usePathname, useRouter } from 'next/navigation';
// import '@/i18n';
import images from '@/store/images';
import { Box, Button, IconButton, MenuItem, Select, Stack, TextField } from '@mui/material';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import SearchIcon from '@mui/icons-material/Search';
import SwitchIcon from '@mui/icons-material/SyncAlt';
import ClientExpressionApi from '@/api/clientExpression';
import { DictionaryLang } from '@/api/types';
import { DictionaryLangs } from '@/api/constants';
import { useSearchParams } from 'next/navigation';
import { colors } from '@/colors';

// const colors = {
//   primary: '#0f3b2e',
//   primaryTint: '#132e05',
//   secondary: '#bb1614',
//   secondaryTint: '#810000',
// };

const roundingRadius = '100px';

const Search: FC<{
  langs: Record<DictionaryLang, string>;
  // fromLang: { code: WebsiteLang; name: string };
  // toLang: { code: WebsiteLang; name: string };
  searchLabel: string;
}> = ({ langs, searchLabel }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchLang = {
    from: (searchParams.get('fromLang') ?? 'lez') as DictionaryLang,
    to: (searchParams.get('toLang') ?? 'rus') as DictionaryLang,
  };
  const pathname = usePathname();

  const [options, setOptions] = React.useState<string[]>([]);
  const [inputValue, setInputValue] = React.useState('');

  const goToDefinition = (exp: string) => {
    const prefix = pathname.includes('definition') ? pathname : pathname + '/definition';
    router.push(prefix + `?fromLang=${searchLang.from}&toLang=${searchLang.to}&exp=${exp}`);
  };

  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
      {/* {fromLang.name} */}
      <Stack direction="row" spacing={0} sx={{ width: '400px', justifyContent: 'end' }}>
        <Select
          variant="standard"
          value={searchLang.from}
          sx={{ color: colors.text.light, '.MuiSelect-icon': { color: colors.text.light } }}
          // onChange={handleChange}
          // defaultValue={fromLang.code}
        >
          {DictionaryLangs.map((lang) => (
            <MenuItem key={lang.toString()} value={lang}>
              {langs[lang]}
            </MenuItem>
          ))}
        </Select>
        <IconButton
          aria-label="switch"
          sx={{ color: colors.text.light }}
          onClick={() => {
            //  setLang({ from: lang.to, to: lang.from })
            router.push(pathname + `?fromLang=${searchLang.to}&toLang=${searchLang.from}`);
          }}
        >
          <SwitchIcon />
        </IconButton>
        {/* {toLang.name} */}
        <Select
          variant="standard"
          value={searchLang.to}
          sx={{ color: colors.text.light, '.MuiSelect-icon': { color: colors.text.light } }}
          // onChange={handleChange}
          // defaultValue={toLang.code}
        >
          {/* <MenuItem value={toLang.code}>{toLang.name}</MenuItem> */}
          {DictionaryLangs.map((lang) => (
            <MenuItem key={lang.toString()} value={lang}>
              {langs[lang]}
            </MenuItem>
          ))}
        </Select>
      </Stack>
      <Stack direction="row" spacing={0}>
        <Autocomplete
          id="free-solo-search"
          sx={{ minWidth: 600 }}
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
                fromLang: searchLang.from,
                toLang: searchLang.to,
              }),
            );
          }}
          options={options}
          renderInput={(params) => (
            <TextField
              {...params}
              label={searchLabel}
              InputProps={{
                ...params.InputProps,
                type: 'search',
                style: {
                  borderStartStartRadius: roundingRadius,
                  borderEndStartRadius: roundingRadius,
                  backgroundColor: '#fff',
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
          sx={{
            borderEndEndRadius: roundingRadius,
            borderStartEndRadius: roundingRadius,
            backgroundColor: colors.secondary,
          }}
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

'use client';
import React, { FC } from 'react';
import { usePathname, useRouter } from 'next/navigation';
// import '@/i18n';
import images from '@/store/images';
import { Box, Button, IconButton, MenuItem, Select, Stack, TextField } from '@mui/material';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import SearchIcon from '@mui/icons-material/Search';
import SwitchIcon from '@mui/icons-material/SyncAlt';
// import ClientExpressionApi from '@/api/clientExpression';
import * as expressionApi from '../../api/expressionApi';
import { DictionaryPairs } from '@/store/constants';
import { useSearchParams } from 'next/navigation';
import { colors } from '@/colors';
import { DictionaryLang } from '../../api/types.model';
import { SuggestionResponseDto } from '../../api/types.dto';
import { DictionaryLangs } from '../../api/languages';

// const colors = {
//   primary: '#0f3b2e',
//   primaryTint: '#132e05',
//   secondary: '#bb1614',
//   secondaryTint: '#810000',
// };

function findPairLang(lang: DictionaryLang) {
  return DictionaryPairs.find((pair) => pair.includes(lang))?.filter((pl) => pl !== lang)[0];
}

const roundingRadius = '100px';

const Search: FC<{
  langs: Record<DictionaryLang, string>;
  // fromLang: { code: WebsiteLang; name: string };
  // toLang: { code: WebsiteLang; name: string };
  searchLabel: string;
}> = ({ langs, searchLabel }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchLang = {
    from: (searchParams.get('fromLang') ?? 'lez') as DictionaryLang,
    to: (searchParams.get('toLang') ?? 'rus') as DictionaryLang,
  };

  const [options, setOptions] = React.useState<SuggestionResponseDto[]>([]);
  const [inputValue, setInputValue] = React.useState<string>('');

  const goToDefinition = (exp: string) => {
    if (exp === undefined || exp === null || exp.trim() === '') {
      return;
    }
    const prefix = pathname.includes('definition') ? pathname : pathname + '/definition';
    router.push(prefix + `?fromLang=${searchLang.from}&toLang=${searchLang.to}&exp=${exp}`);
  };

  const changeDictLang = (args: { lang: DictionaryLang; isFrom: boolean }) => {
    const { lang, isFrom } = args;
    const otherLang = findPairLang(lang);
    if (otherLang == undefined) {
      console.error(`Did not find pair language for '${lang}'`);
      return;
    }
    const langsParams = isFrom
      ? `?fromLang=${lang}&toLang=${otherLang}`
      : `?fromLang=${otherLang}&toLang=${lang}`;
    const otherParamsArray: string[] = [];
    searchParams.forEach((value, key, parent) => {
      if (key !== 'fromLang' && key !== 'toLang') {
        otherParamsArray.push(`${key}=${value}`);
      }
    });
    const otherParams = otherParamsArray.length > 0 ? '&' + otherParamsArray.join('&') : '';
    router.push(pathname + langsParams + otherParams);
    return;
  };

  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
      {/* {fromLang.name} */}
      <Stack direction="row" spacing={0} sx={{ justifyContent: 'end' }}>
        <Select
          variant="standard"
          value={searchLang.from}
          disableUnderline={true}
          sx={{
            color: colors.text.light,
            '.MuiSelect-icon': { color: colors.text.light },
          }}
          onChange={(e) => {
            changeDictLang({ lang: e.target.value as DictionaryLang, isFrom: true });
          }}
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
          disableUnderline={true}
          sx={{
            color: colors.text.light,
            '& .MuiSelect-icon': { color: colors.text.light },
          }}
          onChange={(e) => {
            changeDictLang({ lang: e.target.value as DictionaryLang, isFrom: false });
          }}
        >
          {/* <MenuItem value={toLang.code}>{toLang.name}</MenuItem> */}
          {DictionaryPairs.filter((pair) => pair.includes(searchLang.from)).map((pair) => {
            const lang = pair.filter((pl) => pl !== searchLang.from)[0];
            return (
              <MenuItem key={pair.toString()} value={lang}>
                {langs[lang as DictionaryLang]}
              </MenuItem>
            );
          })}
        </Select>
      </Stack>
      <Stack direction="row" spacing={0}>
        <Autocomplete
          id="free-solo-search"
          sx={{ minWidth: 400 }}
          freeSolo={true}
          disableClearable={true}
          inputValue={inputValue}
          // On `Enter` key press
          onChange={(e, v, r) => {
            // check below if 'v' is a string
            if (typeof v === 'string') {
              goToDefinition(v);
              return;
            }
            goToDefinition(v.spelling);
          }}
          // On input change, visible to user text change
          onInputChange={async (e, v, r) => {
            setInputValue(v);
            setOptions(
              await expressionApi.suggestions({
                spelling: v,
                expLang: searchLang.from,
                defLang: searchLang.to,
                size: 10,
              }),
            );
          }}
          options={options}
          renderInput={(params) => {
            return (
              <TextField
                {...params}
                // label={searchLabel}
                InputProps={{
                  ...params.InputProps,
                  placeholder: searchLabel,
                  type: 'search',
                  style: {
                    borderStartStartRadius: roundingRadius,
                    borderEndStartRadius: roundingRadius,
                    backgroundColor: '#fff',
                  },
                }}
              />
            );
          }}
          getOptionLabel={(option) => {
            if (typeof option === 'string') {
              return option;
            }
            return option.spelling.toLowerCase();
          }}
          renderOption={(props, option, state, ownerState) => {
            return (
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
                  goToDefinition(option.spelling);
                }}
              >
                {ownerState.getOptionLabel(option.spelling.toLowerCase())}
              </Box>
            );
          }}
        />
        <Button
          variant="contained"
          sx={{
            borderEndEndRadius: roundingRadius,
            borderStartEndRadius: roundingRadius,
            backgroundColor: colors.secondary,
            ':hover': {
              backgroundColor: colors.secondaryTint,
            },
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

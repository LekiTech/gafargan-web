'use client';
import React, { FC, SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { ReadonlyURLSearchParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Backdrop, Box, Button, CircularProgress, IconButton, MenuItem, Select, Stack, TextField } from '@mui/material';
import Autocomplete, {
  AutocompleteRenderInputParams,
  autocompleteClasses,
} from '@mui/material/Autocomplete';
import SearchIcon from '@mui/icons-material/Search';
import SwitchIcon from '@mui/icons-material/SyncAlt';
import * as expressionApi from '@api/expressionApi';
import { DictionaryPairs } from '@/store/constants';
import { colors } from '@/colors';
import { DictionaryLang } from '@api/types.model';
import { SuggestionResponseDto } from '@api/types.dto';
import { DictionaryLangs } from '@api/languages';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { toLowerCaseLezgi } from '../../utils';
import { useDebounceFn } from '../../use/useDebounceFn';
import BaseLoader from '../../../ui/BaseLoader';

function findPairLang(lang: DictionaryLang) {
  return DictionaryPairs.find((pair) => pair.includes(lang))?.filter((pl) => pl !== lang)[0];
}

const goToDefinition = (
  exp: string,
  pathname: string,
  searchLang: {
    from: 'lez' | 'rus' | 'tab';
    to: 'lez' | 'rus' | 'tab';
  },
  router: AppRouterInstance,
) => {
  if (exp === undefined || exp === null || exp.trim() === '') {
    return;
  }
  const prefix = pathname.includes('definition') ? pathname : pathname + '/definition';
  const href = prefix + `?fromLang=${searchLang.from}&toLang=${searchLang.to}&exp=${exp}`;
  router.push(href);
};

const changeDictLang = (args: {
  lang: DictionaryLang;
  isFrom: boolean;
  otherLang?: DictionaryLang;
  searchParams: ReadonlyURLSearchParams;
  router: AppRouterInstance;
  pathname: string;
}) => {
  const { lang, isFrom, searchParams, router, pathname } = args;
  const otherLang = args.otherLang ?? findPairLang(lang);
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

const roundingRadius = '100px';

export const Search: FC<{
  langs: Record<DictionaryLang, string>;
  // fromLang: { code: WebsiteLang; name: string };
  // toLang: { code: WebsiteLang; name: string };
  searchLabel: string;
}> = ({ langs, searchLabel }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchLang, setSearchLang] = useState({
    from: 'lez' as DictionaryLang,
    to: 'rus' as DictionaryLang,
  });
  const exp = searchParams.get('exp');
  const [options, setOptions] = React.useState<SuggestionResponseDto[]>([]);
  const [inputValue, setInputValue] = React.useState<string>(exp ? toLowerCaseLezgi(exp) : '');
  const [shouldPerformSearch, setShouldPerformSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [prevSearch, setPrevSearch] = useState('')

  useEffect(() => {
    setSearchLang({
      from: (searchParams.get('fromLang') ?? 'lez') as DictionaryLang,
      to: (searchParams.get('toLang') ?? 'rus') as DictionaryLang,
    });
  }, [searchParams]);

  useEffect(() => {
    if (shouldPerformSearch) {
      if (!searchParams.toString() || searchParams.toString() !== prevSearch || exp !== inputValue) {
        setIsLoading(true);
      }
      goToDefinition(inputValue, pathname, searchLang, router);
      setShouldPerformSearch(false);
    }
  }, [inputValue, pathname, router, searchLang, shouldPerformSearch]);

  useEffect(() => {
    setIsLoading(false);
    setPrevSearch(searchParams.toString())
  }, [pathname, searchParams])

  // Получение списка подсказок по дебаунс
  const debounceSetOptions = useCallback(useDebounceFn(async (value: string) => {
    setOptions(
      await expressionApi.suggestions({
        spelling: value,
        expLang: searchLang.from,
        defLang: searchLang.to,
        size: 10,
      })
    );
  }, 500), [])

  const handleInputSearchValue = (e: SyntheticEvent<Element, Event>, value: string) => {    
    e.preventDefault();
    setInputValue(value);
    debounceSetOptions(value);
  }

  const handleChangeSearchValue = (e: SyntheticEvent<Element, Event>) => {
    e.preventDefault();
    // check below if 'v' is a string
    // if (typeof v === 'string') {
    //   goToDefinition(v, pathname, searchLang, router);
    //   return;
    // }
    // goToDefinition(v.spelling, pathname, searchLang, router);
    setShouldPerformSearch(true);
  }

  return (
    <Stack
      // direction={isLgBreakpoint ? 'row' : 'column-reverse'}
      spacing={2}
      sx={(theme) => ({
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        [theme.breakpoints.down('lg')]: {
          flexDirection: 'column-reverse',
        },
      })}
    >

      <BaseLoader  isLoading={isLoading} setIsLoading={setIsLoading}/>
      {/* {fromLang.name} */}
      <Stack direction="row" spacing={0} sx={{ justifyContent: 'center', alignItems: 'center' }}>
        <Select
          variant="standard"
          value={searchLang.from}
          disableUnderline={true}
          sx={{
            color: colors.text.light,
            '.MuiSelect-icon': { color: colors.text.light },
          }}
          onChange={(e) => {
            changeDictLang({
              lang: e.target.value as DictionaryLang,
              isFrom: true,
              searchParams,
              router,
              pathname,
            });
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
            changeDictLang({
              lang: searchLang.to,
              isFrom: true,
              otherLang: searchLang.from,
              searchParams,
              router,
              pathname,
            });
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
            changeDictLang({
              lang: e.target.value as DictionaryLang,
              isFrom: false,
              searchParams,
              router,
              pathname,
            });
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
      <Stack direction="row" spacing={0} sx={{ mt: '0 !important' }}>
        <Autocomplete
          id="free-solo-search"
          sx={(theme) => ({
            minWidth: 400,
            [theme.breakpoints.down('md')]: {
              minWidth: '70vw',
            },
          })}
          freeSolo={true}
          disableClearable={true}
          inputValue={inputValue}
          // On `Enter` key press
          onChange={handleChangeSearchValue}
          // On input change, visible to user text change
          onInputChange={handleInputSearchValue}
          options={options}
          renderInput={(params) => (
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
          )}
          getOptionLabel={(option) => {
            if (typeof option === 'string') {
              return option;
            }
            return toLowerCaseLezgi(option.spelling);
          }}
          renderOption={(props, option, state, ownerState) => {
            // @ts-ignore
            const { key, ...otherProps } = props;
            return (
              <Box
                key={key ?? option.id}
                sx={{
                  borderRadius: '8px',
                  margin: '5px',
                  [`&.${autocompleteClasses.option}`]: {
                    padding: '8px',
                  },
                }}
                component="li"
                // {...props}
                {...otherProps}
                onClick={(event) => {
                  event.preventDefault();
                  // goToDefinition(option.spelling, pathname, searchLang, router);
                  setShouldPerformSearch(true);
                  if (props.onClick) {
                    props.onClick(event);
                  }
                }}
              >
                {ownerState.getOptionLabel(toLowerCaseLezgi(option.spelling))}
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
          onClick={(e) => {
            e.preventDefault();
            // goToDefinition(inputValue, pathname, searchLang, router);
            setShouldPerformSearch(true);
          }}
        >
          <SearchIcon fontSize="large" />
        </Button>
      </Stack>
    </Stack>
  );
};

// export default Search;

'use client';
import React, { FC, SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { ReadonlyURLSearchParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  TextFieldProps,
  Typography,
} from '@mui/material';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import SwitchIcon from '@mui/icons-material/SyncAlt';
import SearchIcon from '@mui/icons-material/Search';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import ClearIcon from '@mui/icons-material/Clear';
import { searchAdvanced, suggestionsFuzzy } from '@repository/word.repository';
import { DictionaryPairs } from '@/store/constants';
import { colors } from '@/colors';
import { DictionaryLang, WebsiteLang } from '@api/types.model';
import { DictionaryLangs, LangToId } from '@api/languages';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { normalizeLezgiString, toLowerCaseLezgi } from '../../../utils';
import { useDebounceFn } from '../../../use/useDebounceFn';
import BaseLoader from '../../../../ui/BaseLoader';
import { useTranslation } from 'react-i18next';
import { trackTranslationSearch } from '@api/mixpanel';
import { AdvancedSearchQuery, FoundSpelling } from '@repository/types.model';
import { flipAndMergeTags } from '../definition/utils';

const MOBILE_INPUT_HEIGHT = 30;
const MOBILE_FILLED_INPUT_HEIGHT = 35;

interface SearchLang {
  from: DictionaryLang;
  to: DictionaryLang;
}

function findPairLang(lang: DictionaryLang) {
  return DictionaryPairs.find((pair) => pair.includes(lang))?.filter((pl) => pl !== lang)[0];
}

const goToDefinition = (
  exp: string,
  pathname: string,
  searchLang: SearchLang,
  router: AppRouterInstance,
) => {
  if (exp === undefined || exp === null || exp.trim() === '') {
    return;
  }
  const prefix = pathname.includes('definition') ? pathname : pathname + '/definition';
  const href = prefix + `?fromLang=${searchLang.from}&toLang=${searchLang.to}&exp=${exp}`;
  router.push(href);
};

const goToPaginatedResult = (
  searchQuery: AdvancedSearchQuery,
  pathname: string,
  searchLang: SearchLang,
  router: AppRouterInstance,
) => {
  if (searchQuery === undefined || searchQuery === null || Object.keys(searchQuery).length === 0) {
    return;
  }
  const prefix = pathname.includes('definition') ? pathname : pathname + '/definition';
  const queryParams = [
    `fromLang=${searchLang.from}`,
    `toLang=${searchLang.to}`,
    `adv=1`,
    `page=${searchQuery.page}`,
    `pageSize=${searchQuery.pageSize}`,
  ];
  if (searchQuery.starts) {
    queryParams.push(`&s=${searchQuery.starts}`);
  }
  if (searchQuery.contains) {
    queryParams.push(`&c=${searchQuery.contains}`);
  }
  if (searchQuery.ends) {
    queryParams.push(`&e=${searchQuery.ends}`);
  }
  if (searchQuery.minLength) {
    queryParams.push(`&minl=${searchQuery.minLength}`);
  }
  if (searchQuery.maxLength) {
    queryParams.push(`&maxl=${searchQuery.maxLength}`);
  }
  if (searchQuery.tag) {
    queryParams.push(`&tag=${searchQuery.tag}`);
  }
  const href = `${prefix}?${queryParams.join('&')}`;
  router.push(href);
};

const changeDictLang = (args: {
  lang: DictionaryLang;
  isFrom: boolean;
  otherLang?: DictionaryLang;
  searchParams: ReadonlyURLSearchParams;
  router: AppRouterInstance;
  pathname: string;
  setIsLoading: (isLoading: boolean) => void;
}) => {
  const { lang, isFrom, searchParams, router, pathname, setIsLoading } = args;
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
  setIsLoading(true);
  router.push(pathname + langsParams + otherParams);
  return;
};

const roundingRadius = 28;
const roundingRadiusPx = `${roundingRadius}px`;

export const Search: FC<{
  lang: WebsiteLang;
  hideLangs?: boolean;
  // langs: Record<DictionaryLang, string>;
  // fromLang: { code: WebsiteLang; name: string };
  // toLang: { code: WebsiteLang; name: string };
  // searchLabel: string;
  // }> = ({ langs, searchLabel }) => {
}> = ({ lang, hideLangs }) => {
  const { t } = useTranslation(lang);
  const langs = t('languages', { ns: 'common', returnObjects: true }) as Record<
    DictionaryLang,
    string
  >;
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  // const langs = {
  //   lez: 'Lezgi',
  //   rus: 'Russian',
  //   eng: 'English',
  //   tur: 'Turkish',
  // } as unknown as Record<DictionaryLang, string>;
  // const searchLabel = 'search';
  // const toolsLabel = 'tools';

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchLang, setSearchLang] = useState<SearchLang>({
    from: 'lez' as DictionaryLang,
    to: 'rus' as DictionaryLang,
  });
  // const exp = searchParams.get('exp');
  const [isLoading, setIsLoading] = useState(false);
  const [prevSearch, setPrevSearch] = useState('');

  useEffect(() => {
    setSearchLang({
      from: (searchParams.get('fromLang') ?? 'lez') as DictionaryLang,
      to: (searchParams.get('toLang') ?? 'rus') as DictionaryLang,
    });
  }, [searchParams]);

  useEffect(() => {
    setIsLoading(false);
    setPrevSearch(searchParams.toString());
  }, [searchParams]);

  const areSearchParamsAllowingNewSearch =
    !searchParams.toString() || searchParams.toString() !== prevSearch;

  return (
    <Stack direction="column" spacing={2} sx={{ flex: 1 }}>
      <BaseLoader isLoading={isLoading} setIsLoading={setIsLoading} />

      {isAdvancedSearch ? (
        <AdvancedSearchInput
          router={router}
          pathname={pathname}
          searchParams={searchParams}
          searchLang={searchLang}
          websiteLang={lang}
          setIsLoading={setIsLoading}
          setIsAdvancedSearch={setIsAdvancedSearch}
        />
      ) : (
        <SimpleSearchInput
          router={router}
          pathname={pathname}
          searchParams={searchParams}
          areSearchParamsAllowingNewSearch={areSearchParamsAllowingNewSearch}
          websiteLang={lang}
          searchLang={searchLang}
          setIsLoading={setIsLoading}
          setIsAdvancedSearch={setIsAdvancedSearch}
        />
      )}

      <Stack
        direction="row"
        spacing={0}
        sx={(theme) => ({
          pl: '20px',
          pr: '20px',
          justifyContent: 'center',
          alignItems: 'center',
          [theme.breakpoints.down('md')]: {
            marginTop: '6px !important',
            marginBottom: '0 !important',
            paddingBottom: '0 !important',
            display: hideLangs === true ? 'none' : undefined,
          },
        })}
      >
        {/* <Stack direction="row" spacing={0} sx={{ pl: '20px', pr: '20px', justifyContent: 'space-between', alignItems: 'center' }}> */}
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
                setIsLoading,
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
            sx={{ color: colors.text.light, pb: 0, pt: 0 }}
            onClick={() => {
              changeDictLang({
                lang: searchLang.to,
                isFrom: true,
                otherLang: searchLang.from,
                searchParams,
                router,
                pathname,
                setIsLoading,
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
                setIsLoading,
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
      </Stack>
    </Stack>
  );
};

const SimpleSearchInput: FC<{
  router: AppRouterInstance;
  pathname: string;
  searchParams: ReadonlyURLSearchParams;
  areSearchParamsAllowingNewSearch: boolean;
  websiteLang: WebsiteLang;
  searchLang: SearchLang;
  setIsLoading: (isLoading: boolean) => void;
  setIsAdvancedSearch: (isAdvancedSearch: boolean) => void;
}> = ({
  router,
  pathname,
  searchParams,
  areSearchParamsAllowingNewSearch,
  websiteLang,
  searchLang,
  setIsLoading,
  setIsAdvancedSearch,
}) => {
  const { t } = useTranslation(websiteLang);
  const exp = searchParams.get('exp');
  const [options, setOptions] = useState<FoundSpelling[]>([]);
  const [inputValue, setInputValue] = useState<string>(exp ? toLowerCaseLezgi(exp) : '');
  const [shouldPerformSearch, setShouldPerformSearch] = useState(false);
  useEffect(() => {
    if (inputValue.length === 0) {
      return;
    }
    if (shouldPerformSearch) {
      const normalizedValue = normalizeLezgiString(inputValue);
      if (areSearchParamsAllowingNewSearch || exp !== normalizedValue) {
        setIsLoading(true);
      }
      goToDefinition(normalizedValue, pathname, searchLang, router);
      setShouldPerformSearch(false);
    }
  }, [inputValue, areSearchParamsAllowingNewSearch, searchLang, shouldPerformSearch]);

  // Получение списка подсказок по дебаунс
  const debounceSetOptions = useCallback(
    useDebounceFn(async (value: string, expLang: DictionaryLang, defLang: DictionaryLang) => {
      const foundSpellings = await suggestionsFuzzy({
        spelling: value,
        wordLangDialectIds: LangToId[expLang],
        definitionsLangDialectIds: LangToId[defLang],
      });

      setOptions(foundSpellings);
    }, 500),
    [],
  );

  const handleInputSearchValue = (e: SyntheticEvent<Element, Event>, value: string) => {
    e.preventDefault();
    setInputValue(value);
    debounceSetOptions(value, searchLang.from, searchLang.to);
  };

  const onEnterPressSearch = (e: SyntheticEvent<Element, Event>) => {
    e.preventDefault();
    setShouldPerformSearch(true);
    trackTranslationSearch({
      fromLang: searchLang.from,
      toLang: searchLang.to,
      searchQuery: inputValue,
      searchType: 'enter_key',
    })
      .then()
      .catch((err) => console.error(err));
  };
  return (
    <Stack direction="row" spacing={0} sx={{ mt: '0 !important', width: '100%' }}>
      <Autocomplete
        sx={(theme) => ({
          // minWidth: 400,
          // [theme.breakpoints.down('md')]: {
          width: '100%',
          // },
        })}
        freeSolo={true}
        // disableClearable={true}
        inputValue={inputValue}
        // On `Enter` key press
        onChange={onEnterPressSearch}
        // On input change, visible to user text change
        onInputChange={handleInputSearchValue}
        options={options}
        // show all options
        filterOptions={(options, state) => options}
        blurOnSelect={true}
        renderInput={(params) => (
          <TextField
            {...params}
            type="search"
            placeholder={t('enterSearchWord', { ns: 'common' })}
            sx={(theme) => ({
              '& .MuiInputBase-input': {
                borderStartStartRadius: roundingRadius,
                borderEndStartRadius: roundingRadius,
                backgroundColor: '#fff',
                paddingLeft: '10px !important',
                [theme.breakpoints.down('md')]: {
                  paddingTop: '0 !important',
                  paddingBottom: '0 !important',
                  paddingRight: '0 !important',
                  height: `${MOBILE_INPUT_HEIGHT}px !important`,
                },
              },
              '& .MuiInputBase-root': {
                borderStartStartRadius: roundingRadius,
                borderEndStartRadius: roundingRadius,
                borderStartEndRadius: 0,
                borderEndEndRadius: 0,
                backgroundColor: '#fff',
                [theme.breakpoints.down('md')]: {
                  padding: '0 0 0 0 !important',
                  height: `${MOBILE_INPUT_HEIGHT}px !important`,
                },
                "& input[type='search']::-webkit-search-cancel-button, input[type='search']::-webkit-search-decoration":
                  {
                    display: 'none',
                    appearance: 'none',
                  },
              },
            })}
          />
        )}
        slotProps={{
          clearIndicator: {
            // size: 'large',
            sx: (theme) => ({
              [theme.breakpoints.up('md')]: {
                height: 40,
                width: 40,
                '& .MuiSvgIcon-root': {
                  fontSize: 36,
                },
              },
            }),
          },
          // input: {
          //   type: 'search',
          //   sx: {
          //     "& input[type='search']::-webkit-search-cancel-button, input[type='search']::-webkit-search-decoration":
          //       {
          //         display: 'none',
          //         appearance: 'none',
          //       },
          //   },
          //   endAdornment:
          //     inputValue.length > 0 ? (
          //       <InputAdornment position="end">
          //         <IconButton onClick={() => setInputValue('')}>
          //           <ClearIcon />
          //         </IconButton>
          //       </InputAdornment>
          //     ) : undefined,
          // },
        }}
        getOptionLabel={(option) => {
          if (typeof option === 'string') {
            return option;
          }
          return toLowerCaseLezgi(option.word_spelling);
        }}
        renderOption={(props, option, state, ownerState) => {
          // @ts-ignore
          const { key, ...otherProps } = props;
          const optionLabel = toLowerCaseLezgi(
            option.word_spelling + (option.variant_spelling ? ` (${option.variant_spelling})` : ''),
          );
          return (
            <Box
              key={`${option.id}_${option.variant_id}`}
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
                event.currentTarget.blur();
                event.preventDefault();
                setShouldPerformSearch(true);
                trackTranslationSearch({
                  fromLang: searchLang.from,
                  toLang: searchLang.to,
                  searchQuery: option.word_spelling,
                  searchType: 'option_select',
                })
                  .then()
                  .catch((err) => console.error(err));
                if (props.onClick) {
                  props.onClick(event);
                }
              }}
            >
              {ownerState.getOptionLabel(optionLabel)}
            </Box>
          );
        }}
      />
      <IconButton
        sx={(theme) => ({
          height: '100%',
          backgroundColor: '#fff',
          borderRadius: 0,
          borderStyle: 'solid',
          borderWidth: '1px',
          borderColor: 'rgba(0, 0, 0, 0.23)',
          borderLeftWidth: '0 !important',
          borderRightWidth: '0 !important',
          color: colors.text.dark,
          padding: '4px 8px',
          '&:hover': {
            backgroundColor: '#ddd',
          },
          [theme.breakpoints.down('md')]: {
            height: `${MOBILE_INPUT_HEIGHT}px !important`,
          },
        })}
        onClick={() => setIsAdvancedSearch(true)}
      >
        <SettingsOutlinedIcon
          sx={(theme) => ({
            fontSize: 40,
            [theme.breakpoints.down('md')]: {
              fontSize: 24,
            },
          })}
        />
      </IconButton>
      <Button
        variant="contained"
        sx={(theme) => ({
          borderEndEndRadius: roundingRadiusPx,
          borderStartEndRadius: roundingRadiusPx,
          borderStartStartRadius: 0,
          borderEndStartRadius: 0,
          backgroundColor: colors.secondary,
          ':hover': {
            backgroundColor: colors.secondaryTint,
          },
          [theme.breakpoints.down('md')]: {
            height: `${MOBILE_INPUT_HEIGHT}px !important`,
          },
        })}
        onClick={(e) => {
          e.currentTarget.blur();
          e.preventDefault();
          // goToDefinition(inputValue, pathname, searchLang, router);
          setShouldPerformSearch(true);
          trackTranslationSearch({
            fromLang: searchLang.from,
            toLang: searchLang.to,
            searchQuery: inputValue,
            searchType: 'search_button',
          })
            .then()
            .catch((err) => console.error(err));
          //@ts-ignore
          document?.activeElement?.blur();
        }}
      >
        <SearchIcon
          // fontSize="large"
          sx={(theme) => ({
            fontSize: 40,
            [theme.breakpoints.down('md')]: {
              fontSize: 24,
            },
          })}
        />
      </Button>
    </Stack>
  );
};

const advancedInputSlotProps: TextFieldProps['slotProps'] = {
  input: {
    disableUnderline: true,
    autoComplete: 'off',
    sx: (theme) => ({
      [theme.breakpoints.down('md')]: {
        '& .MuiInputBase-input': {
          paddingTop: '10px !important',
        },
      },
    }),
  },
  inputLabel: {
    sx: (theme) => ({
      [theme.breakpoints.down('md')]: {
        fontSize: '0.7rem',
        lineHeight: '1em',
        height: `${MOBILE_FILLED_INPUT_HEIGHT / 2}px !important`,
      },
    }),
  },
};

const AdvancedSearchInput: FC<{
  router: AppRouterInstance;
  pathname: string;
  searchParams: ReadonlyURLSearchParams;
  searchLang: SearchLang;
  websiteLang: WebsiteLang;
  setIsAdvancedSearch: (isAdvancedSearch: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
}> = ({
  router,
  pathname,
  searchParams,
  searchLang,
  websiteLang,
  setIsAdvancedSearch,
  setIsLoading,
}) => {
  const { t, i18n } = useTranslation(searchLang.from);
  const exp = searchParams.get('exp');
  const tagEntries = i18n.getResourceBundle(websiteLang, 'tags');
  const allTags = Object.entries(flipAndMergeTags(tagEntries)).filter(
    (kv) => kv != null && kv[0] != null && kv[1] != null,
  ) as [string, string][];
  const [inputValues, setInputValues] = useState<AdvancedSearchQuery>({
    page: 1,
    pageSize: 10,
    wordLangDialectIds: LangToId[searchLang.from],
    definitionsLangDialectIds: LangToId[searchLang.to],
  });

  useEffect(() => {
    setInputValues((prevValue) => ({
      ...prevValue,
      wordLangDialectIds: LangToId[searchLang.from],
      definitionsLangDialectIds: LangToId[searchLang.to],
    }));
  }, [searchLang]);

  // useEffect(() => {
  //   goToPaginatedResult(inputValues, pathname, searchLang, router);
  // }, [inputValues, pathname, router, searchLang])

  return (
    <Grid container spacing={0.5} columns={{ xs: 6, lg: 8 }}>
      <Grid size={{ xs: 3, lg: 2 }} order={1}>
        <TextField
          fullWidth
          variant="filled"
          slotProps={advancedInputSlotProps}
          size="small"
          label={'Starts'}
          sx={(theme) => ({
            backgroundColor: '#fff',
            borderEndStartRadius: roundingRadiusPx,
            borderStartStartRadius: roundingRadiusPx,
            [theme.breakpoints.down('md')]: {
              height: `${MOBILE_FILLED_INPUT_HEIGHT}px !important`,
            },
          })}
          value={inputValues.starts ?? ''}
          onChange={(e) => setInputValues({ ...inputValues, starts: e.target.value })}
        />
      </Grid>
      <Grid size={{ xs: 3, lg: 2 }} order={{ xs: 2, lg: 3 }}>
        <TextField
          fullWidth
          variant="filled"
          slotProps={advancedInputSlotProps}
          label={'Ends'}
          size="small"
          sx={(theme) => ({
            backgroundColor: '#fff',
            borderEndEndRadius: roundingRadiusPx,
            borderStartEndRadius: roundingRadiusPx,
            [theme.breakpoints.down('md')]: {
              height: `${MOBILE_FILLED_INPUT_HEIGHT}px !important`,
            },
          })}
          value={inputValues.ends ?? ''}
          onChange={(e) => setInputValues({ ...inputValues, ends: e.target.value })}
        />
      </Grid>
      <Grid size={{ xs: 4, lg: 4 }} order={{ xs: 3, lg: 2 }}>
        <TextField
          fullWidth
          variant="filled"
          slotProps={advancedInputSlotProps}
          label={'Contains'}
          size="small"
          sx={(theme) => ({
            backgroundColor: '#fff',
            [theme.breakpoints.down('lg')]: {
              borderRadius: roundingRadiusPx,
            },
            [theme.breakpoints.down('md')]: {
              height: `${MOBILE_FILLED_INPUT_HEIGHT}px !important`,
            },
          })}
          value={inputValues.contains ?? ''}
          onChange={(e) => setInputValues({ ...inputValues, contains: e.target.value })}
        />
      </Grid>
      <Grid size={2} order={{ xs: 5, lg: 4 }}>
        <TextField
          fullWidth
          variant="filled"
          slotProps={advancedInputSlotProps}
          label={'Min length'}
          type="number"
          size="small"
          sx={(theme) => ({
            backgroundColor: '#fff',
            borderEndStartRadius: roundingRadiusPx,
            borderStartStartRadius: roundingRadiusPx,
            [theme.breakpoints.down('md')]: {
              height: `${MOBILE_FILLED_INPUT_HEIGHT}px !important`,
            },
          })}
          value={inputValues.minLength ?? ''}
          onChange={(e) =>
            setInputValues({
              ...inputValues,
              minLength: e.target.value.length > 0 ? parseInt(e.target.value) : undefined,
            })
          }
        />
      </Grid>
      <Grid size={2} order={{ xs: 6, lg: 5 }}>
        <TextField
          fullWidth
          variant="filled"
          slotProps={advancedInputSlotProps}
          label={'Max length'}
          type="number"
          size="small"
          sx={(theme) => ({
            backgroundColor: '#fff',
            borderEndEndRadius: roundingRadiusPx,
            borderStartEndRadius: roundingRadiusPx,
            [theme.breakpoints.down('md')]: {
              height: `${MOBILE_FILLED_INPUT_HEIGHT}px !important`,
            },
          })}
          value={inputValues.maxLength ?? ''}
          onChange={(e) =>
            setInputValues({
              ...inputValues,
              maxLength: e.target.value.length > 0 ? parseInt(e.target.value) : undefined,
            })
          }
        />
      </Grid>
      <Grid size={2} order={{ xs: 7, lg: 6 }}>
        <Select
          defaultValue={''}
          displayEmpty
          renderValue={(selected) => {
            const parsedSelected = JSON.parse(selected as string) as [string, string] | [];
            if (parsedSelected.length === 0) {
              return (
                <Typography
                  component={'span'}
                  sx={(theme) => ({
                    [theme.breakpoints.down('md')]: { fontSize: '0.7rem', lineHeight: '1em' },
                  })}
                >
                  Tags
                </Typography>
              );
            }
            // display the tag name
            return parsedSelected[0];
          }}
          value={
            inputValues.tag ? JSON.stringify([tagEntries[inputValues.tag], inputValues.tag]) : '[]'
          }
          onChange={(e) => {
            const value = JSON.parse(e.target.value);
            console.log('selected tag value:', value);
            setInputValues({ ...inputValues, tag: value[1] ?? undefined });
          }}
          size="small"
          sx={(theme) => ({
            backgroundColor: '#fff',
            borderRadius: roundingRadiusPx,
            width: '100%',
            height: '100%',
            [theme.breakpoints.down('md')]: {
              height: `${MOBILE_FILLED_INPUT_HEIGHT}px !important`,
            },
          })}
        >
          <MenuItem value={'[]'}>-</MenuItem>
          {allTags.map(([tagName, tagValues]) => (
            <MenuItem key={tagName} value={JSON.stringify([tagName, tagValues])}>
              {tagName}
            </MenuItem>
          ))}
        </Select>
      </Grid>
      <Grid size={2} order={{ xs: 4, lg: 6 }}>
        <Stack
          direction="row"
          spacing={0}
          sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}
        >
          <Button
            variant="contained"
            sx={(theme) => ({
              borderEndStartRadius: roundingRadiusPx,
              borderStartStartRadius: roundingRadiusPx,
              borderStartEndRadius: 0,
              borderEndEndRadius: 0,
              backgroundColor: '#fff',
              color: colors.text.dark,
              width: `100% !important`,
              ':hover': {
                backgroundColor: '#ddd',
              },
              [theme.breakpoints.down('md')]: {
                height: `${MOBILE_FILLED_INPUT_HEIGHT}px !important`,
                minWidth: `${MOBILE_FILLED_INPUT_HEIGHT}px !important`,
              },
              [theme.breakpoints.up('md')]: {
                padding: '4px 16px !important',
              },
            })}
            onClick={() => setIsAdvancedSearch(false)}
          >
            <SettingsIcon
              sx={(theme) => ({
                fontSize: 40,
                [theme.breakpoints.down('md')]: {
                  fontSize: 24,
                },
              })}
            />
          </Button>
          <Button
            variant="contained"
            sx={(theme) => ({
              borderEndEndRadius: roundingRadiusPx,
              borderStartEndRadius: roundingRadiusPx,
              borderStartStartRadius: 0,
              borderEndStartRadius: 0,
              backgroundColor: colors.secondary,
              width: `100% !important`,
              ':hover': {
                backgroundColor: colors.secondaryTint,
              },
              [theme.breakpoints.down('md')]: {
                height: `${MOBILE_FILLED_INPUT_HEIGHT}px !important`,
                minWidth: `${MOBILE_FILLED_INPUT_HEIGHT}px !important`,
              },
              [theme.breakpoints.up('md')]: {
                padding: '4px 16px !important',
              },
            })}
            onClick={(e) => {
              e.currentTarget.blur();
              e.preventDefault();
              // searchAdvanced(inputValues).then((r) => console.log(r));
              goToPaginatedResult(inputValues, pathname, searchLang, router);
              // goToDefinition(inputValue, pathname, searchLang, router);
              // setShouldPerformSearch(true);
              // trackTranslationSearch({
              //   fromLang: searchLang.from,
              //   toLang: searchLang.to,
              //   searchQuery: inputValue,
              //   searchType: 'search_button',
              // })
              //   .then()
              //   .catch((err) => console.error(err));
            }}
          >
            <SearchIcon
              // fontSize="large"
              sx={(theme) => ({
                fontSize: 40,
                [theme.breakpoints.down('md')]: {
                  fontSize: 24,
                },
              })}
            />
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
};

'use client';
import React, { FC, KeyboardEventHandler, useEffect, useState } from 'react';
import { ReadonlyURLSearchParams, usePathname, useRouter } from 'next/navigation';
import {
  Button,
  Grid,
  MenuItem,
  Select,
  Stack,
  TextField,
  TextFieldProps,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
// import { colors } from '@/colors';
import { WebsiteLang } from '@api/types.model';
import { LangToId } from '@api/languages';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { toNumber } from '../../../utils';
import { useTranslation } from 'react-i18next';
import { trackAdvancedSearch } from '@api/mixpanel';
import { AdvancedSearchQuery } from '@repository/types.model';
import { flipAndMergeTags } from '@/search/definition/utils';
import { getUid } from '../../../utils/localstorage';
import { Colors } from '@/colors';
import { SearchLang } from './types';
import { MOBILE_FILLED_INPUT_HEIGHT, roundingRadiusPx } from './constants';
import { replaceVerticalBar } from '../../../utils/normalizeLezgi';

const goToPaginatedResult = (
  searchQuery: AdvancedSearchQuery,
  pathname: string,
  searchLang: SearchLang,
  router: AppRouterInstance,
  basePrefix: string,
) => {
  if (searchQuery === undefined || searchQuery === null || Object.keys(searchQuery).length === 0) {
    return;
  }
  const prefix = pathname.includes(basePrefix) ? pathname : pathname + `/${basePrefix}`;
  const queryParams = [
    `fromLang=${searchLang.from}`,
    `toLang=${searchLang.to}`,
    `adv=1`,
    `page=${searchQuery.page}`,
    `pageSize=${searchQuery.pageSize}`,
  ];
  if (searchQuery.starts) {
    queryParams.push(`&s=${replaceVerticalBar(searchQuery.starts)}`);
  }
  if (searchQuery.contains) {
    queryParams.push(`&c=${replaceVerticalBar(searchQuery.contains)}`);
  }
  if (searchQuery.ends) {
    queryParams.push(`&e=${replaceVerticalBar(searchQuery.ends)}`);
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
  console.debug('queryParams', queryParams);
  const href = `${prefix}?${queryParams.join('&')}`;
  router.push(href);
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

function getSingleInputTagValue(inputTag: string): string {
  if (inputTag.includes(';')) {
    return inputTag.split(';')[0];
  }
  return inputTag;
}

export const AdvancedSearchInput: FC<{
  searchParams: ReadonlyURLSearchParams;
  searchLang: SearchLang;
  websiteLang: WebsiteLang;
  areSearchParamsAllowingNewSearch: boolean;
  setIsAdvancedSearch?: (isAdvancedSearch: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  colors: Colors;
  basePrefix?: string;
}> = ({
  searchParams,
  searchLang,
  websiteLang,
  areSearchParamsAllowingNewSearch,
  setIsAdvancedSearch,
  setIsLoading,
  colors,
  basePrefix = 'definition',
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { t, i18n } = useTranslation(searchLang.from);
  const starts = searchParams.get('s') ?? undefined;
  const contains = searchParams.get('c') ?? undefined;
  const ends = searchParams.get('e') ?? undefined;
  const minLengthStr = searchParams.get('minl') ?? undefined;
  const maxLengthStr = searchParams.get('maxl') ?? undefined;
  const tag = searchParams.get('tag') ?? undefined;
  const tagEntries = i18n.getResourceBundle(websiteLang, 'tags');
  const allTags = Object.entries(flipAndMergeTags(tagEntries)).filter(
    (kv) => kv != null && kv[0] != null && kv[1] != null,
  ) as [string, string][];
  const [inputValues, setInputValues] = useState<AdvancedSearchQuery>({
    page: toNumber(searchParams.get('page') ?? 1),
    pageSize: toNumber(searchParams.get('pageSize') ?? 10),
    starts,
    contains,
    ends,
    minLength: minLengthStr ? toNumber(minLengthStr) : undefined,
    maxLength: maxLengthStr ? toNumber(maxLengthStr) : undefined,
    tag,
    wordLangDialectIds: LangToId[searchLang.from],
    definitionsLangDialectIds: LangToId[searchLang.to],
  });
  const [prevInputValues, setPrevInputValues] = useState<AdvancedSearchQuery>(inputValues);

  useEffect(() => {
    setInputValues((prevValue) => ({
      ...prevValue,
      wordLangDialectIds: LangToId[searchLang.from],
      definitionsLangDialectIds: LangToId[searchLang.to],
    }));
  }, [searchLang]);

  const [shouldPerformSearch, setShouldPerformSearch] = useState(false);
  useEffect(() => {
    if (shouldPerformSearch) {
      console.debug('areSearchParamsAllowingNewSearch', areSearchParamsAllowingNewSearch);
      if (
        areSearchParamsAllowingNewSearch ||
        JSON.stringify(prevInputValues) != JSON.stringify(inputValues)
      ) {
        setIsLoading(true);
      }
      goToPaginatedResult(inputValues, pathname, searchLang, router, basePrefix);
      setPrevInputValues(inputValues);
      setShouldPerformSearch(false);
    }
  }, [inputValues, areSearchParamsAllowingNewSearch, searchLang, shouldPerformSearch]);

  const onEnterPressSearch: KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Enter') {
      setShouldPerformSearch(true);
      trackAdvancedSearch({ searchQuery: inputValues, searchType: 'enter_key' }, getUid()!)
        .then()
        .catch((err) => console.error(err));
      // goToPaginatedResult(inputValues, pathname, searchLang, router);
    }
  };
  // useEffect(() => {
  //   goToPaginatedResult(inputValues, pathname, searchLang, router);
  // }, [inputValues, pathname, router, searchLang])
  console.debug('roundingRadiusPx', roundingRadiusPx);
  return (
    <Grid container spacing={0.5} columns={{ xs: 6, lg: 8 }}>
      <Grid size={{ xs: 3, lg: 2 }} order={1}>
        <TextField
          fullWidth
          variant="filled"
          slotProps={advancedInputSlotProps}
          size="small"
          label={t('advancedSearch.starts')}
          sx={(theme) => ({
            backgroundColor: '#fff',
            borderEndStartRadius: roundingRadiusPx,
            borderStartStartRadius: roundingRadiusPx,
            [theme.breakpoints.down('md')]: {
              height: `${MOBILE_FILLED_INPUT_HEIGHT}px !important`,
            },
            '& .MuiInputBase-root': {
              borderEndStartRadius: roundingRadiusPx,
              borderStartStartRadius: roundingRadiusPx,
            },
          })}
          value={inputValues.starts ?? ''}
          onChange={(e) => setInputValues({ ...inputValues, starts: e.target.value })}
          onKeyDown={onEnterPressSearch}
        />
      </Grid>
      <Grid size={{ xs: 3, lg: 2 }} order={{ xs: 2, lg: 3 }}>
        <TextField
          fullWidth
          variant="filled"
          slotProps={advancedInputSlotProps}
          label={t('advancedSearch.ends')}
          size="small"
          sx={(theme) => ({
            backgroundColor: '#fff',
            borderEndEndRadius: roundingRadiusPx,
            borderStartEndRadius: roundingRadiusPx,
            [theme.breakpoints.down('md')]: {
              height: `${MOBILE_FILLED_INPUT_HEIGHT}px !important`,
            },
            '& .MuiInputBase-root': {
              borderEndEndRadius: roundingRadiusPx,
              borderStartEndRadius: roundingRadiusPx,
            },
          })}
          value={inputValues.ends ?? ''}
          onChange={(e) => setInputValues({ ...inputValues, ends: e.target.value })}
          onKeyDown={onEnterPressSearch}
        />
      </Grid>
      <Grid size={{ xs: 4, lg: 4 }} order={{ xs: 3, lg: 2 }}>
        <TextField
          fullWidth
          variant="filled"
          slotProps={advancedInputSlotProps}
          label={t('advancedSearch.contains')}
          size="small"
          sx={(theme) => ({
            backgroundColor: '#fff',
            [theme.breakpoints.down('lg')]: {
              borderRadius: roundingRadiusPx,
              '& .MuiInputBase-root': { borderRadius: roundingRadiusPx },
            },
            [theme.breakpoints.down('md')]: {
              height: `${MOBILE_FILLED_INPUT_HEIGHT}px !important`,
            },
          })}
          value={inputValues.contains ?? ''}
          onChange={(e) => setInputValues({ ...inputValues, contains: e.target.value })}
          onKeyDown={onEnterPressSearch}
        />
      </Grid>
      <Grid size={2} order={{ xs: 5, lg: 4 }}>
        <TextField
          fullWidth
          variant="filled"
          slotProps={advancedInputSlotProps}
          label={t('advancedSearch.minLength')}
          type="number"
          size="small"
          sx={(theme) => ({
            backgroundColor: '#fff',
            borderEndStartRadius: roundingRadiusPx,
            borderStartStartRadius: roundingRadiusPx,
            [theme.breakpoints.down('md')]: {
              height: `${MOBILE_FILLED_INPUT_HEIGHT}px !important`,
            },
            '& .MuiInputBase-root': {
              borderEndStartRadius: roundingRadiusPx,
              borderStartStartRadius: roundingRadiusPx,
            },
          })}
          value={inputValues.minLength ?? ''}
          onChange={(e) =>
            setInputValues({
              ...inputValues,
              minLength: e.target.value.length > 0 ? parseInt(e.target.value) : undefined,
            })
          }
          onKeyDown={onEnterPressSearch}
        />
      </Grid>
      <Grid size={2} order={{ xs: 6, lg: 5 }}>
        <TextField
          fullWidth
          variant="filled"
          slotProps={advancedInputSlotProps}
          label={t('advancedSearch.maxLength')}
          type="number"
          size="small"
          sx={(theme) => ({
            backgroundColor: '#fff',
            borderEndEndRadius: roundingRadiusPx,
            borderStartEndRadius: roundingRadiusPx,
            [theme.breakpoints.down('md')]: {
              height: `${MOBILE_FILLED_INPUT_HEIGHT}px !important`,
            },
            '& .MuiInputBase-root': {
              borderEndEndRadius: roundingRadiusPx,
              borderStartEndRadius: roundingRadiusPx,
            },
          })}
          value={inputValues.maxLength ?? ''}
          onChange={(e) =>
            setInputValues({
              ...inputValues,
              maxLength: e.target.value.length > 0 ? parseInt(e.target.value) : undefined,
            })
          }
          onKeyDown={onEnterPressSearch}
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
                  {t('advancedSearch.tags')}
                </Typography>
              );
            }
            // display the tag name
            return parsedSelected[0];
          }}
          value={
            inputValues.tag
              ? JSON.stringify([
                  tagEntries[getSingleInputTagValue(inputValues.tag)],
                  inputValues.tag,
                ])
              : '[]'
          }
          onChange={(e) => {
            const value = JSON.parse(e.target.value);
            console.debug('selected tag value:', value);
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
          {setIsAdvancedSearch ? (
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
          ) : null}
          <Button
            variant="contained"
            sx={(theme) => ({
              borderEndEndRadius: roundingRadiusPx,
              borderStartEndRadius: roundingRadiusPx,
              borderStartStartRadius: setIsAdvancedSearch ? 0 : roundingRadiusPx,
              borderEndStartRadius: setIsAdvancedSearch ? 0 : roundingRadiusPx,
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
              setShouldPerformSearch(true);
              trackAdvancedSearch(
                { searchQuery: inputValues, searchType: 'search_button' },
                getUid()!,
              )
                .then()
                .catch((err) => console.error(err));
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

'use client';
import { DictionaryPairs, findPairLang } from '@/store/constants';
import { DictionaryLangs } from '@api/languages';
import { DictionaryLang, WebsiteLang } from '@api/types.model';
import { Stack, Select, MenuItem, IconButton } from '@mui/material';
import SwitchIcon from '@mui/icons-material/SyncAlt';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { ReadonlyURLSearchParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FC } from 'react';
import { SearchLang } from './types';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/colors';

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
  // router.push(pathname + langsParams + otherParams);
  window.history.replaceState({}, '', pathname + langsParams + otherParams);
  return;
};

export const DictionarySelect: FC<{
  searchLang: SearchLang;
  hideLangs?: boolean;
  lang: WebsiteLang;
  setIsLoading: (isLoading: boolean) => void;
  colors: Colors;
}> = ({ searchLang, hideLangs, lang, setIsLoading, colors }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation(lang);
  const langs = t('languages', { ns: 'common', returnObjects: true }) as Record<
    DictionaryLang,
    string
  >;
  return (
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
  );
};

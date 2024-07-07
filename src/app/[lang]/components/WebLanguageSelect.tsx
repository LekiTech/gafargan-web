'use client';
import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { MenuItem, Select, Typography } from '@mui/material';
import { WebsiteLang } from '../../../api/types.model';
import images from '@/store/images';
import Image from 'next/image';
// import { useMediaQuery } from 'react-responsive';
import { colors } from '@/colors';
import { useTranslation } from 'react-i18next';

type WebLanguageSelectProps = {
  currentLang: WebsiteLang;
  webLangs: Record<WebsiteLang, string>;
};

const WebLanguageSelect = (props: WebLanguageSelectProps) => {
  const { currentLang, webLangs } = props;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const getLangLabel = (lang: WebsiteLang) => t(`languages.${lang}`);
  // const isMdBreakpoint = useMediaQuery({
  //   query: '(min-width: 900px)',
  // });

  const changeWebLang = (lang: WebsiteLang) => {
    const params = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const path = pathname.startsWith(`/${currentLang}`)
      ? pathname.replace(`/${currentLang}`, `/${lang}`) + params
      : `/${lang}/${params}`;
    router.push(path);
  };
  return (
    <Select
      variant="standard"
      value={currentLang}
      disableUnderline={true}
      onChange={(e) => changeWebLang(e.target.value as WebsiteLang)}
      sx={{
        color: colors.text.light,
        '.MuiSelect-icon': { color: colors.text.light },
        '.MuiSelect-select': {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        },
      }}
    >
      <MenuItem value={'lez'}>
        <Image
          width="30"
          height="20"
          src={images.lezgiFlag}
          alt="lez"
          style={{ marginRight: '10px' }}
        />
        {getLangLabel('lez')}
      </MenuItem>
      <MenuItem value={'rus'}>
        <Image
          width="30"
          height="20"
          src={images.russianFlag}
          alt="rus"
          style={{ marginRight: '10px' }}
        />
        {getLangLabel('rus')}
      </MenuItem>
      <MenuItem value={'eng'}>
        <Image
          width="30"
          height="20"
          src={images.ukFlag}
          alt="eng"
          style={{ marginRight: '10px' }}
        />
        {getLangLabel('eng')}
      </MenuItem>
      <MenuItem value={'tur'}>
        <Image
          width="30"
          height="20"
          src={images.turFlag}
          alt="tur"
          style={{ marginRight: '10px' }}
        />
        {getLangLabel('tur')}
      </MenuItem>
    </Select>
  );
};

export default WebLanguageSelect;

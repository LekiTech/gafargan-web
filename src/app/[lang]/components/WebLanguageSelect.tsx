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

type WebLanguageSelectProps = {
  currentLang: WebsiteLang;
  webLangs: Record<WebsiteLang, string>;
};

const WebLanguageSelect = (props: WebLanguageSelectProps) => {
  const { currentLang, webLangs } = props;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // const isMdBreakpoint = useMediaQuery({
  //   query: '(min-width: 900px)',
  // });

  const changeWebLang = (lang: WebsiteLang) => {
    const params = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const path = pathname.startsWith(`/${currentLang}`)
      ? pathname.replace(`/${currentLang}`, `/${lang}`) + params
      : `/${lang}/${params}`;
    console.log('Lang to switch:', lang, 'newPath:', path);
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
        {webLangs['lez']}
      </MenuItem>
      <MenuItem value={'rus'}>
        <Image
          width="30"
          height="20"
          src={images.russianFlag}
          alt="rus"
          style={{ marginRight: '10px' }}
        />
        {webLangs['rus']}
      </MenuItem>
      <MenuItem value={'eng'}>
        <Image
          width="30"
          height="20"
          src={images.ukFlag}
          alt="eng"
          style={{ marginRight: '10px' }}
        />
        {webLangs['eng']}
      </MenuItem>
      <MenuItem value={'tur'}>
        <Image
          width="30"
          height="20"
          src={images.turFlag}
          alt="tur"
          style={{ marginRight: '10px' }}
        />
        {webLangs['tur']}
      </MenuItem>
    </Select>
  );
};

export default WebLanguageSelect;

'use client';
import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { MenuItem, Select } from '@mui/material';
import { WebsiteLang } from '../api/types';
import images from '@/store/images';
import { colors } from '@/colors';
import Image from 'next/image';

type WebLanguageSelectProps = {
  currentLang: WebsiteLang;
  webLangs: Record<WebsiteLang, string>;
};

const WebLanguageSelect = (props: WebLanguageSelectProps) => {
  const { currentLang, webLangs } = props;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const changeWebLang = (lang: WebsiteLang) => {
    const params = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const path = pathname.replace(`/${currentLang}`, `/${lang}`) + params;
    router.push(path);
  };
  return (
    <Select
      variant="standard"
      value={currentLang}
      onChange={(e) => changeWebLang(e.target.value as WebsiteLang)}
      sx={{
        color: colors.text.light,
        '.MuiSelect-icon': { color: colors.text.light },
        ':before': { borderBottomColor: colors.text.light },
        ':after': { borderBottomColor: colors.secondary },
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
    </Select>
  );
};

export default WebLanguageSelect;

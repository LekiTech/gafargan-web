'use client';
import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { LinearProgress, MenuItem, Select, SxProps, Theme, Typography } from '@mui/material';
import { WebsiteLang } from '../../../api/types.model';
import images from '@/store/images';
import Image from 'next/image';
// import { useMediaQuery } from 'react-responsive';
import { colors } from '@/colors';
import { useTranslation } from 'react-i18next';
import { trackWebsiteLanguageChange } from '@api/mixpanel';
import { getUid } from '../../utils/localstorage';

type WebLanguageSelectProps = {
  currentLang: WebsiteLang;
  flagWidth: number;
  flagHeight: number;
  fontSize: string | number;
  fontColor?: string;
};

const WebLanguageSelect = (props: WebLanguageSelectProps) => {
  const { currentLang, flagWidth, flagHeight, fontSize, fontColor } = props;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const getLangLabel = (lang: WebsiteLang) => t(`languages.${lang}`);
  const [showLoading, setShowLoading] = React.useState(true);

  const changeWebLang = (lang: WebsiteLang) => {
    setShowLoading(true);
    const params = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const path = pathname.startsWith(`/${currentLang}`)
      ? pathname.replace(`/${currentLang}`, `/${lang}`) + params
      : `/${lang}/${params}`;
    trackWebsiteLanguageChange(lang, getUid()!)
      .then(() => console.log('language changed'))
      .catch((err) => console.error('Error tracking language change:', err));
    // it should be the last action to avoid issues
    router.push(path);
  };
  return (
    <React.Fragment>
      {showLoading && <LinearProgress />}
      <Select
        variant="standard"
        value={currentLang}
        disableUnderline={true}
        onChange={(e) => changeWebLang(e.target.value as WebsiteLang)}
        sx={{
          color: fontColor ?? colors.text.light,
          '.MuiSelect-icon': { color: fontColor ?? colors.text.light },
          '.MuiSelect-select': {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          },
        }}
      >
        <MenuItem value={'lez'}>
          <Image
            width={flagWidth}
            height={flagHeight}
            src={images.lezgiFlag}
            alt="lez"
            style={{ marginRight: '10px' }}
          />
          <span style={{ fontSize: fontSize }}>{getLangLabel('lez')}</span>
        </MenuItem>
        <MenuItem value={'rus'}>
          <Image
            width={flagWidth}
            height={flagHeight}
            src={images.russianFlag}
            alt="rus"
            style={{ marginRight: '10px' }}
          />
          <span style={{ fontSize: fontSize }}>{getLangLabel('rus')}</span>
        </MenuItem>
        <MenuItem value={'eng'}>
          <Image
            width={flagWidth}
            height={flagHeight}
            src={images.ukFlag}
            alt="eng"
            style={{ marginRight: '10px' }}
          />
          <span style={{ fontSize: fontSize }}>{getLangLabel('eng')}</span>
        </MenuItem>
        <MenuItem value={'tur'}>
          <Image
            width={flagWidth}
            height={flagHeight}
            src={images.turFlag}
            alt="tur"
            style={{ marginRight: '10px' }}
          />
          <span style={{ fontSize: fontSize }}>{getLangLabel('tur')}</span>
        </MenuItem>
      </Select>
    </React.Fragment>
  );
};

export default WebLanguageSelect;

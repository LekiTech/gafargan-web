import logo from '@/assets/images/Logo_white.svg';
import cross from '@/assets/images/cross.svg';
import doubleArrowsRed from '@/assets/images/double_arrows_red.svg';
import doubleArrowsGrey from '@/assets/images/double_arrows_grey.svg';
import emptyBox from '@/assets/images/empty_box.svg';
import numbersImage from '@/assets/images/preview_wooden-blocks-numbers-white-background-137766061.webp';
import booksImage from '@/assets/images/preview_spectacles-open-books-15550565.webp';
import calendarImage from '@/assets/images/red-pushpin-calendar-page-remind-marked-important-eve-events-vintage-retro-color-tone-89568116.webp';
import lezgiFlag from '@/assets/images/flags/lez.png';
import russianFlag from '@/assets/images/flags/rus.png';
import ukFlag from '@/assets/images/flags/uk.png';
import usFlag from '@/assets/images/flags/us.png';
import turFlag from '@/assets/images/flags/tur.png';

// stores assets
// android
import androidEng from '@/assets/images/google-play/eng.png';
import androidRus from '@/assets/images/google-play/rus.png';
import androidTur from '@/assets/images/google-play/tur.png';
// ios
import iosEng from '@/assets/images/app-store/eng.svg';
import iosRus from '@/assets/images/app-store/rus.svg';
import iosTur from '@/assets/images/app-store/tur.svg';

const images = {
  logo,
  cross,
  doubleArrowsRed,
  doubleArrowsGrey,
  emptyBox,
  numbersImage,
  booksImage,
  calendarImage,
  lezgiFlag,
  russianFlag,
  ukFlag,
  usFlag,
  turFlag,
  stores: {
    android: {
      eng: androidEng,
      rus: androidRus,
      tur: androidTur,
    },
    ios: {
      eng: iosEng,
      rus: iosRus,
      tur: iosTur,
    },
  },
};

export default images;

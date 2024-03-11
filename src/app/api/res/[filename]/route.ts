import { NextRequest, NextResponse } from 'next/server';
import { lezgiNumbersAudios } from '@/store/audios';

export type LezgiNumbersAudios = keyof typeof lezgiNumbersAudios;
const CURRENT_PATH = '/api/res/';

export async function GET(request: NextRequest, response: NextResponse) {
  const pathname = request.nextUrl.pathname;
  const filenameEscaped = pathname.replace(CURRENT_PATH, ''); //.replace('.mp3', '');
  const filename = decodeURIComponent(filenameEscaped);
  // console.log(filename);

  // const fileUrl = lezgiNumbersAudios[filename as LezgiNumbersAudios];

  // if (!fileUrl) {
  //   return new NextResponse(`Not found mp3 file: "${filename}"`, { status: 404 });
  // }

  // TODO: find another way to fetch the file,
  //       probably better to fetch from github repo of this project
  return await fetch(
    `https://github.com/LekiTech/lezgi-numbers/raw/main/static/arthur/mp3/${filename}`,
    // process.env.URL + '/' + fileUrl,
  );
}

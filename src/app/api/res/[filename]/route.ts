import { NextRequest, NextResponse } from 'next/server';
import { lezgiNumbersAudios } from '@/store/audios';

export type LezgiNumbersAudios = keyof typeof lezgiNumbersAudios;
const CURRENT_PATH = '/api/res/';

export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const filenameEscaped = pathname.replace(CURRENT_PATH, ''); //.replace('.mp3', '');
  let filename: string;
  try {
    // Strip leading slashes that the TTS player may add (e.g. `/api/res//сад.mp3`)
    filename = decodeURIComponent(filenameEscaped).replace(/^\/+/, '');
  } catch {
    return new NextResponse('Bad request', { status: 400 });
  }

  // Only allow a single plain `.mp3` file name, to prevent path traversal to other GitHub resources
  if (!/^[^/\\?#%]+\.mp3$/.test(filename) || filename.includes('..')) {
    return new NextResponse('Not found', { status: 404 });
  }
  // console.log(filename);

  // const fileUrl = lezgiNumbersAudios[filename as LezgiNumbersAudios];

  // if (!fileUrl) {
  //   return new NextResponse(`Not found mp3 file: "${filename}"`, { status: 404 });
  // }

  // TODO: find another way to fetch the file,
  //       probably better to fetch from github repo of this project
  return await fetch(
    `https://github.com/LekiTech/lezgi-numbers/raw/main/static/arthur/mp3/${encodeURIComponent(filename)}`,
    // process.env.URL + '/' + fileUrl,
  );
}

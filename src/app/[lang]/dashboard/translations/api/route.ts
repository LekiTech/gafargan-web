import { NextRequest, NextResponse } from 'next/server';
import { SourceModel, TranslationsProposalModel } from '@/dashboard/models/proposal.model';
import { createProposal } from '@repository/proposal.repository';
import { ProposalType } from '@repository/entities/enums';
import { DUMMY_USER_ID } from '@repository/constants';
import { getTranslationLinkTargetsForWords, simpleSearch } from '@repository/word.repository';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search') ?? undefined;
  const fromLangDialectId = searchParams.get('fromLangDialectId');
  const wordIds = searchParams
    .getAll('wordId')
    .map(Number)
    .filter((id) => Number.isFinite(id));
  const [words, targets] = await Promise.all([
    search
      ? simpleSearch({ spelling: search, fromLangDialectId: Number(fromLangDialectId), limit: 20 })
      : [],
    getTranslationLinkTargetsForWords(wordIds),
  ]);

  return NextResponse.json({ words, targets });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body?.entries || !Array.isArray(body.entries) || body.entries.length === 0) {
    return NextResponse.json({ message: 'No translation entries provided' }, { status: 400 });
  }

  const entries = body.entries.map((entry: any) => ({
    ...entry,
    links: entry.links ?? [],
  }));

  const proposal = new TranslationsProposalModel(
    entries as any,
    new SourceModel(
      body.defaultSource ?? {
        state: 'unchanged',
        id: body.sourceId,
        name: '',
      },
    ),
  );

  await createProposal({
    type: ProposalType.TRANSLATIONS,
    data: proposal,
    proposedById: DUMMY_USER_ID,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}

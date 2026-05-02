import { NextRequest, NextResponse } from 'next/server';
import { TranslationsProposalModel } from '@/dashboard/models/proposal.model';
import { createProposal } from '@repository/proposal.repository';
import { ProposalType } from '@repository/entities/enums';
import { getTranslationLinkTargetsForWords, simpleSearch } from '@repository/word.repository';
import { requireDashboardApiUser } from '@/dashboard/auth';

export async function GET(request: NextRequest) {
  const { response } = await requireDashboardApiUser();
  if (response) {
    return response;
  }

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
  const { user, response } = await requireDashboardApiUser();
  if (response) {
    return response;
  }

  const body = await request.json();

  if (!body?.entries || !Array.isArray(body.entries) || body.entries.length === 0) {
    return NextResponse.json({ message: 'No translation entries provided' }, { status: 400 });
  }

  const entries = body.entries.map((entry: any) => ({
    ...entry,
    links: entry.links ?? [],
  }));

  const proposal = new TranslationsProposalModel(entries as any, body.sourceId as number);

  await createProposal({
    type: ProposalType.TRANSLATIONS,
    data: proposal,
    proposedById: user.id,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}

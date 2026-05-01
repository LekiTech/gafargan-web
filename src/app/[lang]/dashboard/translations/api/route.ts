import { NextRequest, NextResponse } from 'next/server';
import {
  SourceModel,
  TranslationModel,
  TranslationsProposalModel,
} from '@/dashboard/models/proposal.model';
import { createProposal } from '@repository/proposal.repository';
import { ProposalType } from '@repository/entities/enums';
import { DUMMY_USER_ID } from '@repository/constants';

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body?.entries || !Array.isArray(body.entries) || body.entries.length === 0) {
    return NextResponse.json({ message: 'No translation entries provided' }, { status: 400 });
  }

  const proposal = new TranslationsProposalModel(
    body.entries.map((entry: any) => new TranslationModel(entry)),
    new SourceModel(body.defaultSource),
  );

  await createProposal({
    type: ProposalType.TRANSLATIONS,
    data: proposal,
    proposedById: DUMMY_USER_ID,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}

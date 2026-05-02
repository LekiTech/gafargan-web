import { NextRequest, NextResponse } from 'next/server';
import { SourceModelType, STATE } from '@/dashboard/models/proposal.model';
import { createProposal } from '@repository/proposal.repository';
import { ProposalType } from '@repository/entities/enums';
import { DUMMY_USER_ID } from '@repository/constants';

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body?.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    return NextResponse.json({ message: 'Source name is required' }, { status: 400 });
  }

  const source: SourceModelType = {
    state: body.state ?? STATE.ADDED,
    ...(Number.isFinite(body.id) ? { id: body.id } : {}),
    name: body.name,
    authors: body.authors,
    publicationYear: body.publicationYear,
    providedBy: body.providedBy,
    providedByUrl: body.providedByUrl,
    processedBy: body.processedBy,
    copyright: body.copyright,
    seeSourceUrl: body.seeSourceUrl,
    description: body.description,
  } as SourceModelType;

  await createProposal({
    type: ProposalType.SOURCE,
    data: source,
    proposedById: DUMMY_USER_ID,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}

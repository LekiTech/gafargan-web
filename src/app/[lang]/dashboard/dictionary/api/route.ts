import { NextRequest, NextResponse } from 'next/server';
import { DictionaryProposalModel } from '@/dashboard/models/proposal.model';
import { createProposal } from '@repository/proposal.repository';
import { ProposalType } from '@repository/entities/enums';
import { requireDashboardApiUser } from '@/dashboard/auth';

export async function POST(request: NextRequest) {
  const { user, response } = await requireDashboardApiUser();
  if (response) {
    return response;
  }

  // const requestHeaders = await headers();
  // console.log('Received request headers:', requestHeaders.entries().toArray());
  const body = await request.json();
  // console.log('Creating new word:', body);
  if (body && body.entries && Array.isArray(body.entries) && body.entries.length > 0) {
    const dictionary = new DictionaryProposalModel(
      body.entries,
      body.source,
      body.fromLangDialectId,
      body.toLangDialectId,
    );
    const result = await createProposal({
      type: ProposalType.DICTIONARY,
      data: dictionary,
      proposedById: user.id,
    });
    console.debug('Proposal for dictionary created:', JSON.stringify(result, null, 2));
  }
  // Handle the creation of a new word here
  return NextResponse.json({ success: true }, { status: 201 });
}

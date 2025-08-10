import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { DictionaryProposalModel } from '@/dashboard/models/proposal.model';
import { createProposal } from '@repository/proposal.repository';
import { ProposalType } from '@repository/entities/enums';
import { DUMMY_USER_ID } from '@repository/constants';

export async function POST(request: NextRequest) {
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
      // TODO: replace after auth implementation
      proposedById: DUMMY_USER_ID,
    });
    console.log('Proposal for dictionary created:', JSON.stringify(result, null, 2));
  }
  // Handle the creation of a new word here
  return NextResponse.json({ success: true }, { status: 201 });
}

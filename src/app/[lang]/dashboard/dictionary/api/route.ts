import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { DictionaryProposalModel } from '@/dashboard/models/proposal.model';

export async function POST(request: NextRequest) {
  // const requestHeaders = await headers();
  // console.log('Received request headers:', requestHeaders.entries().toArray());
  const body = await request.json();
  // console.log('Creating new word:', body);
  if (body && body.entries && Array.isArray(body.entries) && body.entries.length > 0) {
    const dictionary = new DictionaryProposalModel(body.entries, body.source);
    console.log('Dictionary created:', JSON.stringify(dictionary, null, 2));
  }
  // Handle the creation of a new word here
  return NextResponse.json({ success: true }, { status: 201 });
}

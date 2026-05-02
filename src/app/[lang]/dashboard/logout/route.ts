import { NextResponse } from 'next/server';
import { clearDashboardSession } from '../auth';

export async function POST() {
  await clearDashboardSession();

  return NextResponse.json({ success: true });
}


import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // This will trigger a server-side error that Sentry will capture
  throw new Error('Sentry Server-side Test Error - API Route');

  return NextResponse.json({ message: 'This will never be reached' });
}

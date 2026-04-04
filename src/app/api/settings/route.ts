export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import sql from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const settings = await sql`SELECT key, value FROM site_settings`;
  const result: Record<string, string> = {};
  settings.forEach((s: { key: string; value: string }) => {
    result[s.key] = s.value;
  });
  return NextResponse.json(result);
}

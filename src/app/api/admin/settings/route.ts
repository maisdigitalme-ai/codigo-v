export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import sql from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const settings = await sql`SELECT key, value FROM site_settings`;
  const result: Record<string, string> = {};
  settings.forEach((s: { key: string; value: string }) => {
    result[s.key] = s.value;
  });
  return NextResponse.json(result);
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const body = await request.json();
  const { key, value } = body;

  if (!key || value === undefined) {
    return NextResponse.json({ error: 'key y value son requeridos' }, { status: 400 });
  }

  await sql`
    INSERT INTO site_settings (key, value, updated_at) 
    VALUES (${key}, ${value}, NOW())
    ON CONFLICT (key) DO UPDATE SET value = ${value}, updated_at = NOW()
  `;

  return NextResponse.json({ success: true });
}

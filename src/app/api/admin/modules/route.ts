import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });

  const modules = await sql`
    SELECT m.*, COUNT(l.id) as lesson_count
    FROM modules m
    LEFT JOIN lessons l ON l.module_id = m.id
    GROUP BY m.id
    ORDER BY m.position
  `;

  return NextResponse.json(modules);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });

  const { title, description, thumbnailUrl } = await request.json();
  const maxPos = await sql`SELECT COALESCE(MAX(position), 0) as max FROM modules`;
  const position = parseInt(maxPos[0].max) + 1;

  const newModule = await sql`
    INSERT INTO modules (title, description, thumbnail_url, position)
    VALUES (${title}, ${description || ''}, ${thumbnailUrl || ''}, ${position})
    RETURNING *
  `;

  return NextResponse.json(newModule[0]);
}

import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });

  const lessons = await sql`
    SELECT l.*, m.title as module_title
    FROM lessons l
    JOIN modules m ON m.id = l.module_id
    ORDER BY m.position, l.position
  `;

  return NextResponse.json(lessons);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });

  const { moduleId, title, description, videoEmbed, isFree, duration } = await request.json();

  const maxPos = await sql`SELECT COALESCE(MAX(position), 0) as max FROM lessons WHERE module_id = ${moduleId}`;
  const position = parseInt(maxPos[0].max) + 1;

  const lesson = await sql`
    INSERT INTO lessons (module_id, title, description, video_embed, is_free, duration, position)
    VALUES (${moduleId}, ${title}, ${description || ''}, ${videoEmbed || ''}, ${isFree || false}, ${duration || ''}, ${position})
    RETURNING *
  `;

  return NextResponse.json(lesson[0]);
}

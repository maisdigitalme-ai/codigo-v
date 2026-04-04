import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { lessonId, completed } = await request.json();

  await sql`
    INSERT INTO progress (user_id, lesson_id, completed, completed_at)
    VALUES (${session.id}, ${lessonId}, ${completed}, ${completed ? new Date() : null})
    ON CONFLICT (user_id, lesson_id) 
    DO UPDATE SET completed = ${completed}, completed_at = ${completed ? new Date() : null}
  `;

  return NextResponse.json({ success: true });
}

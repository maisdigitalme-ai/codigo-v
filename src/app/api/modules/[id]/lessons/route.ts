import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const lessons = await sql`
    SELECT l.*,
      CASE WHEN p.completed = true THEN true ELSE false END as completed
    FROM lessons l
    LEFT JOIN progress p ON p.lesson_id = l.id AND p.user_id = ${session.id}
    WHERE l.module_id = ${params.id} AND l.is_published = true
    ORDER BY l.position
  `;

  return NextResponse.json(lessons);
}

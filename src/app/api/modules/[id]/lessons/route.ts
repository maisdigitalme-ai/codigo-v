import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
import { checkModuleDripLock } from '@/lib/drip-check';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  // Check if the module (or its parent course) is locked by drip
  const { locked } = await checkModuleDripLock(session.id, parseInt(params.id), session.isAdmin);
  if (locked) {
    return NextResponse.json({ error: 'Contenido bloqueado' }, { status: 403 });
  }

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

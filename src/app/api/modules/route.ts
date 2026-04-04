import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const modules = await sql`
    SELECT m.*, 
      COUNT(l.id) as lesson_count,
      COUNT(CASE WHEN p.completed = true AND p.user_id = ${session.id} THEN 1 END) as completed_count
    FROM modules m
    LEFT JOIN lessons l ON l.module_id = m.id AND l.is_published = true
    LEFT JOIN progress p ON p.lesson_id = l.id AND p.user_id = ${session.id}
    WHERE m.is_published = true
    GROUP BY m.id
    ORDER BY m.position
  `;

  return NextResponse.json(modules);
}

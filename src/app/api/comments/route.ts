import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
import { checkLessonDripLock } from '@/lib/drip-check';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get('lessonId');

  if (!lessonId) return NextResponse.json([]);

  // Check if the lesson is locked by drip
  const { locked } = await checkLessonDripLock(session.id, parseInt(lessonId), session.isAdmin);
  if (locked) {
    return NextResponse.json({ error: 'Contenido bloqueado' }, { status: 403 });
  }

  const comments = await sql`
    SELECT c.*, u.name as user_name
    FROM comments c
    JOIN users u ON u.id = c.user_id
    WHERE c.lesson_id = ${lessonId}
    ORDER BY c.created_at DESC
    LIMIT 50
  `;

  return NextResponse.json(comments);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { lessonId, content } = await request.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: 'El comentario no puede estar vacío' }, { status: 400 });
  }

  // Check if the lesson is locked by drip
  const { locked } = await checkLessonDripLock(session.id, lessonId, session.isAdmin);
  if (locked) {
    return NextResponse.json({ error: 'Contenido bloqueado' }, { status: 403 });
  }

  const comment = await sql`
    INSERT INTO comments (user_id, lesson_id, content)
    VALUES (${session.id}, ${lessonId}, ${content.trim()})
    RETURNING id, content, created_at
  `;

  return NextResponse.json({ ...comment[0], user_name: session.name });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const commentId = searchParams.get('id');

  if (!session.isAdmin) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  }

  await sql`DELETE FROM comments WHERE id = ${commentId!}`;
  return NextResponse.json({ success: true });
}

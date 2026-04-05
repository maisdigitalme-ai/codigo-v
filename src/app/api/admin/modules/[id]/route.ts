import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });

  const { title, description, thumbnailUrl, isPublished, courseId, dripEnabled, dripDays } = await request.json();

  if (courseId !== undefined) {
    await sql`UPDATE modules SET course_id = ${courseId} WHERE id = ${params.id}`;
  }

  await sql`
    UPDATE modules SET
      title = COALESCE(${title ?? null}, title),
      description = COALESCE(${description ?? null}, description),
      thumbnail_url = COALESCE(${thumbnailUrl ?? null}, thumbnail_url),
      is_published = COALESCE(${isPublished ?? null}, is_published),
      drip_enabled = COALESCE(${dripEnabled ?? null}, drip_enabled),
      drip_days = COALESCE(${dripDays ?? null}, drip_days)
    WHERE id = ${params.id}
  `;

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });

  await sql`DELETE FROM modules WHERE id = ${params.id}`;
  return NextResponse.json({ success: true });
}

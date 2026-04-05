import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });

  const { title, description, thumbnailUrl, isPublished, contentType, position, dripEnabled, dripDays } = await request.json();

  await sql`
    UPDATE courses SET
      title = COALESCE(${title ?? null}, title),
      description = COALESCE(${description ?? null}, description),
      thumbnail_url = COALESCE(${thumbnailUrl ?? null}, thumbnail_url),
      is_published = COALESCE(${isPublished ?? null}, is_published),
      content_type = COALESCE(${contentType ?? null}, content_type),
      position = COALESCE(${position ?? null}, position),
      drip_enabled = COALESCE(${dripEnabled ?? null}, drip_enabled),
      drip_days = COALESCE(${dripDays ?? null}, drip_days)
    WHERE id = ${params.id}
  `;

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });

  // Unlink modules from this course first
  await sql`UPDATE modules SET course_id = NULL WHERE course_id = ${params.id}`;
  await sql`DELETE FROM courses WHERE id = ${params.id}`;
  return NextResponse.json({ success: true });
}

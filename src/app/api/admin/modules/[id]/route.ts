import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });

  const { title, description, thumbnailUrl, isPublished } = await request.json();

  await sql`
    UPDATE modules SET
      title = COALESCE(${title}, title),
      description = COALESCE(${description}, description),
      thumbnail_url = COALESCE(${thumbnailUrl}, thumbnail_url),
      is_published = COALESCE(${isPublished}, is_published)
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

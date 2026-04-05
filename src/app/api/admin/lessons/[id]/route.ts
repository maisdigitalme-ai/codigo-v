import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });

  const lesson = await sql`SELECT * FROM lessons WHERE id = ${params.id}`;
  if (!lesson.length) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  return NextResponse.json(lesson[0]);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });

  const { title, description, videoEmbed, isPublished, isFree, duration, dripEnabled, dripDays } = await request.json();

  await sql`
    UPDATE lessons SET
      title = COALESCE(${title}, title),
      description = COALESCE(${description}, description),
      video_embed = ${videoEmbed !== undefined ? videoEmbed : sql`video_embed`},
      is_published = COALESCE(${isPublished}, is_published),
      is_free = COALESCE(${isFree}, is_free),
      duration = COALESCE(${duration}, duration),
      drip_enabled = COALESCE(${dripEnabled ?? null}, drip_enabled),
      drip_days = COALESCE(${dripDays ?? null}, drip_days)
    WHERE id = ${params.id}
  `;

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });

  await sql`DELETE FROM lessons WHERE id = ${params.id}`;
  return NextResponse.json({ success: true });
}

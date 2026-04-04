export const dynamic = 'force-dynamic';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import sql from '@/lib/db';
import DashboardClient from '@/components/DashboardClient';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const modules = await sql`
    SELECT m.*, 
      COUNT(DISTINCT l.id) as lesson_count,
      COUNT(DISTINCT CASE WHEN p.completed = true AND p.user_id = ${session.id} THEN p.lesson_id END) as completed_count
    FROM modules m
    LEFT JOIN lessons l ON l.module_id = m.id AND l.is_published = true
    LEFT JOIN progress p ON p.lesson_id = l.id AND p.user_id = ${session.id}
    WHERE m.is_published = true
    GROUP BY m.id
    ORDER BY m.position
  `;

  return (
    <DashboardClient
      modules={JSON.parse(JSON.stringify(modules))}
      user={{ name: session.name, email: session.email, isAdmin: session.isAdmin }}
    />
  );
}

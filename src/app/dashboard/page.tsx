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

  // Separate modules by course group
  const codigoVModules = modules.filter((m: any) => !m.course_group || m.course_group === 'codigo-v');
  const secretosModules = modules.filter((m: any) => m.course_group === 'secretos-sexuales');

  // Fetch site settings
  const settingsRows = await sql`SELECT key, value FROM site_settings`;
  const settings: Record<string, string> = {};
  settingsRows.forEach((s: { key: string; value: string }) => {
    settings[s.key] = s.value;
  });

  return (
    <DashboardClient
      modules={JSON.parse(JSON.stringify(codigoVModules))}
      secretosModules={JSON.parse(JSON.stringify(secretosModules))}
      user={{ name: session.name, email: session.email, isAdmin: session.isAdmin }}
      settings={settings}
    />
  );
}

export const dynamic = 'force-dynamic';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import sql from '@/lib/db';
import DashboardClient from '@/components/DashboardClient';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  // Fetch courses
  const courses = await sql`
    SELECT * FROM courses WHERE is_published = true ORDER BY position
  `;

  // Fetch user enrolled_at for drip content
  const userRow = await sql`SELECT enrolled_at FROM users WHERE id = ${session.id}`;
  const enrolledAt = userRow[0]?.enrolled_at ? new Date(userRow[0].enrolled_at) : new Date();
  const now = new Date();
  const daysSinceEnrollment = Math.floor((now.getTime() - enrolledAt.getTime()) / (1000 * 60 * 60 * 24));

  // Fetch all modules with progress
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

  // Calculate drip lock status for each module (admin always sees everything)
  const modulesWithDrip = modules.map((m: any) => {
    const isLocked = !session.isAdmin && m.drip_enabled && m.drip_days > 0 && daysSinceEnrollment < m.drip_days;
    const daysRemaining = isLocked ? m.drip_days - daysSinceEnrollment : 0;
    return { ...m, is_locked: isLocked, days_remaining: daysRemaining };
  });

  // Calculate drip lock status for each course (admin always sees everything)
  const coursesWithDrip = courses.map((c: any) => {
    const isLocked = !session.isAdmin && c.drip_enabled && c.drip_days > 0 && daysSinceEnrollment < c.drip_days;
    const daysRemaining = isLocked ? c.drip_days - daysSinceEnrollment : 0;
    return { ...c, is_locked: isLocked, days_remaining: daysRemaining };
  });

  // Group modules by course
  const courseGroups = coursesWithDrip.map((course: any) => ({
    ...course,
    modules: modulesWithDrip.filter((m: any) => m.course_id === course.id),
  }));

  // Also get unassigned modules (fallback to old course_group logic)
  const assignedIds = new Set(modulesWithDrip.filter((m: any) => m.course_id).map((m: any) => m.id));
  const unassignedModules = modulesWithDrip.filter((m: any) => !assignedIds.has(m.id));

  // If no courses exist yet, fall back to old behavior
  const fallbackCodigoV = modulesWithDrip.filter((m: any) => !m.course_group || m.course_group === 'codigo-v');
  const fallbackSecretos = modulesWithDrip.filter((m: any) => m.course_group === 'secretos-sexuales');

  // Fetch site settings
  const settingsRows = await sql`SELECT key, value FROM site_settings`;
  const settings: Record<string, string> = {};
  settingsRows.forEach((s: { key: string; value: string }) => {
    settings[s.key] = s.value;
  });

  return (
    <DashboardClient
      courses={JSON.parse(JSON.stringify(courseGroups))}
      modules={JSON.parse(JSON.stringify(fallbackCodigoV))}
      secretosModules={JSON.parse(JSON.stringify(fallbackSecretos))}
      unassignedModules={JSON.parse(JSON.stringify(unassignedModules))}
      user={{ name: session.name, email: session.email, isAdmin: session.isAdmin }}
      settings={settings}
    />
  );
}

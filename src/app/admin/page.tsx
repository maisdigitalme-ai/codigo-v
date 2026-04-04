export const dynamic = 'force-dynamic';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminClient from '@/components/AdminClient';

export default async function AdminPage() {
  const session = await getSession();
  if (!session?.isAdmin) redirect('/dashboard');

  return <AdminClient userName={session.name} userEmail={session.email} />;
}

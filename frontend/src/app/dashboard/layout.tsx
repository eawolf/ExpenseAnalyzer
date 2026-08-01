import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ClientLayout from './ClientLayout';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login?redirect=/dashboard');
  }

  return <ClientLayout>{children}</ClientLayout>;
}

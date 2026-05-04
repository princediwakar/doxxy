import { getAuthenticatedUser } from '@/lib/auth-server';
import Layout from '@/components/Layout';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await getAuthenticatedUser(); // proxy handles redirect, this double-checks
  return <Layout>{children}</Layout>;
}

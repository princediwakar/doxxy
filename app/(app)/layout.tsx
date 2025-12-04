import Layout from '@/components/Layout';
import PrivateRoute from '@/components/PrivateRoute';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivateRoute>
      <Layout>{children}</Layout>
    </PrivateRoute>
  );
}
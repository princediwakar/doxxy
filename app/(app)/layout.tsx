import PrivateRoute from '@/components/PrivateRoute';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PrivateRoute>{children}</PrivateRoute>;
}
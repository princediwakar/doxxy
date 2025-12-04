import { AppHeader } from '@/components/AppHeader'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AppHeader />
      {children}
    </>
  )
}
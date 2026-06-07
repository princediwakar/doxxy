import { redirect } from "next/navigation";
import { getAuthenticatedUser, getActiveClinic } from "@/lib/auth-server";
import ClinicSubNav from "@/components/ClinicSubNav";

export default async function ClinicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();
  const clinic = await getActiveClinic(user.id);

  if (!clinic || clinic.role !== "superadmin") {
    redirect("/schedule");
  }

  return (
    // FIX: Enforced padding across all screen sizes (px-4 md:px-8)
    <div className="flex flex-col w-full max-w-7xl mx-auto px-4 md:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Clinic Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your clinic's operational details, staff access, and billing.
        </p>
      </div>

      <ClinicSubNav />

      <div className="w-full pt-4">
        {children}
      </div>
    </div>
  );
}
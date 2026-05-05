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
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <ClinicSubNav />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}

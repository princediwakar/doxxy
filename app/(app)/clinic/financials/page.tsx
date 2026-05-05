import { getAuthenticatedUser, getActiveClinic } from "@/lib/auth-server";
import { getFinancialsData } from "@/lib/data/financials";
import FinancialsPageClient from "@/components/financials/FinancialsPageClient";
import { Card, CardContent } from "@/components/ui/card";
import { IndianRupee } from "lucide-react";

export default async function FinancialsPage() {
  const user = await getAuthenticatedUser();
  const clinic = await getActiveClinic(user.id);

  if (!clinic?.id) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <IndianRupee className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Select a clinic to view financials.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = await getFinancialsData(clinic.id);

  return <FinancialsPageClient data={data} />;
}

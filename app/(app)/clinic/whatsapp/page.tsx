import { Spinner } from "@/components/ui/loading";
import { Suspense } from "react";
import WhatsAppConnection from "@/components/settings/WhatsAppConnection";
import { isWhatsAppEnabled } from "@/lib/feature-flags";
import { notFound } from "next/navigation";

export default function WhatsAppSettingsPage() {
  if (!isWhatsAppEnabled) notFound();

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-4">
          <Spinner size="md" />
        </div>
      }
    >
      <WhatsAppConnection />
    </Suspense>
  );
}

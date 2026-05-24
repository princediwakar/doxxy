import { Spinner } from "@/components/ui/loading";
import { Suspense } from "react";
import WhatsAppConnection from "@/components/settings/WhatsAppConnection";

export default function WhatsAppSettingsPage() {
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

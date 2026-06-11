import { ReceiveInventoryClient } from "@/components/pharmacy/receive/ReceiveInventoryClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Receive Inventory | Pharmacy | Doxxy",
  description: "Receive new inventory via bill scan or spreadsheet import.",
};

export default function ReceiveInventoryPage() {
  return (
    // Added h-full and overflow-hidden to strictly contain the UI
    <div className="flex-col flex h-full w-full overflow-hidden bg-muted/20">
      <ReceiveInventoryClient />
    </div>
  );
}
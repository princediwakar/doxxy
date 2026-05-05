import { getAuthenticatedUser, getActiveClinic } from '@/lib/auth-server';
import { getInventory, getProcurements } from '@/lib/data/pharmacy';
import PharmacyPageClient from '@/components/pharmacy/PharmacyPageClient';

export default async function PharmacyPage() {
  const user = await getAuthenticatedUser();
  const member = await getActiveClinic(user.id);
  const clinicId = member?.clinic_id;

  const [inventory, procurements] = clinicId
    ? await Promise.all([getInventory(clinicId), getProcurements(clinicId)])
    : [[], []];

  return (
    <PharmacyPageClient
      serverInventory={inventory}
      serverProcurements={procurements}
    />
  );
}

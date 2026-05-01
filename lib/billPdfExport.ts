import { showErrorToast } from "@/lib/error-utils";
import { generateBillPrintContent, generateBillFilename } from "@/components/billing/billingPrintUtils";
import type { Bill } from "@/types/billing";
import type { DbClinic } from "@/types/core";

export async function sendBillViaWhatsApp(
  bill: Bill,
  patientPhone: string,
  patient: { name?: string | null } | null,
  clinic: DbClinic | null
): Promise<void> {
  const sanitizedPhone = patientPhone.replace(/\D/g, "");

  try {
    const html = generateBillPrintContent(bill, patient as Parameters<typeof generateBillPrintContent>[1], clinic);

    const [jsPDFModule, html2canvasModule] = await Promise.all([
      import("jspdf"),
      import("html2canvas"),
    ]);

    const jsPDF = jsPDFModule.default;
    const html2canvas = html2canvasModule.default;

    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "-9999px";
    container.innerHTML = html;
    document.body.appendChild(container);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });

    document.body.removeChild(container);

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const filename = `${generateBillFilename(bill, patient as Parameters<typeof generateBillFilename>[1], clinic?.name)}.pdf`;
    pdf.save(filename);

    window.open(`https://wa.me/${sanitizedPhone}`, "_blank");
  } catch (error) {
    showErrorToast(error, { title: "Failed to generate bill PDF" });
  }
}

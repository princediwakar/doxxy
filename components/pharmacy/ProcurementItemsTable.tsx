"use client";
import { type UseFormReturn, type FieldArrayWithId, Controller } from "react-hook-form";
import { ProcurementFormValues, ProcurementItemFormValues } from "@/types/pharmacy";
import { Medicine } from "@/types/prescriptions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MedicineCombobox } from "@/components/ui/medicine-combobox";
import { Plus, Trash2, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

const EMPTY_ITEM: ProcurementItemFormValues = { extracted_name: "", batch_number: "", expiry_date: "", quantity: 1, unit_price: 0, mrp: 0, total_price: 0 };

interface ItemsTableProps {
  form: UseFormReturn<ProcurementFormValues>;
  fields: FieldArrayWithId<ProcurementFormValues, "items", "id">[];
  append: (value: ProcurementItemFormValues) => void;
  remove: (index: number) => void;
  createMedicine: (name: string) => Promise<{ id: number; name: string } | null>;
}

export function ProcurementItemsTable({
  form, fields, append, remove, createMedicine,
}: ItemsTableProps) {
  const recalc = (i: number) => {
    const q = form.getValues(`items.${i}.quantity`) || 0;
    const p = form.getValues(`items.${i}.unit_price`) || 0;
    if (q > 0 && p > 0) form.setValue(`items.${i}.total_price`, Math.round(q * p * 100) / 100);
  };
  const selectMedicine = (i: number, m: Medicine) => {
    form.setValue(`items.${i}.extracted_name`, m.name);
    form.setValue(`items.${i}.medicine_id`, m.id);
  };
  const createForRow = async (i: number, name: string) => {
    const r = await createMedicine(name);
    if (r) {
      form.setValue(`items.${i}.medicine_id`, r.id);
      form.setValue(`items.${i}.extracted_name`, r.name);
      toast.success(`Medicine "${r.name}" created and linked!`);
    }
  };
  return (
    <div className="border rounded-xl shadow-sm bg-card overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b bg-muted/30">
        <h3 className="font-semibold">
          Items List
          {fields.length > 0 && (
            <span className="ml-2 text-xs text-muted-foreground font-normal">
              ({fields.length} items)
            </span>
          )}
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(EMPTY_ITEM)}
        >
          <Plus className="w-4 h-4 mr-1" /> Add Row
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold">
            <tr>
              <th className="px-4 py-3 w-[300px]">Medicine</th>
              <th className="px-4 py-3 w-[150px]">Packet No.</th>
              <th className="px-4 py-3 w-[150px]">Expiry Date</th>
              <th className="px-4 py-3 w-[100px]">Qty</th>
              <th className="px-4 py-3 w-[130px]">Unit Price (₹)</th>
              <th className="px-4 py-3 w-[130px]">M.R.P (₹)</th>
              <th className="px-4 py-3 w-[130px]">Total (₹)</th>
              <th className="px-4 py-3 w-[50px]"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {fields.map((field, index) => (
              <tr key={field.id} className="hover:bg-muted/20 transition-colors group">
                <td className="px-4 py-2">
                  <Controller
                    name={`items.${index}.extracted_name`}
                    control={form.control}
                    render={({ field: nameField }) => (
                      <div className="flex flex-col gap-0.5">
                        <MedicineCombobox
                          value={nameField.value}
                          onValueChange={nameField.onChange}
                          onMedicineSelect={(medicine) =>
                            selectMedicine(index, medicine)
                          }
                          onCreateMedicine={(name) => createForRow(index, name)}
                          placeholder="Select or type..."
                          className="border-0 shadow-none bg-transparent h-8 px-2"
                          showCreateButton={false}
                        />
                        <Controller
                          name={`items.${index}.medicine_id`}
                          control={form.control}
                          render={({ field: idField }) =>
                            idField.value ? (
                              <span className="text-[10px] text-green-600 px-2 flex items-center gap-1">
                                <CheckCircle className="w-2.5 h-2.5" /> In catalog
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-600 px-2 flex items-center gap-1 font-medium">
                                <AlertCircle className="w-2.5 h-2.5" /> New - add to catalog
                              </span>
                            )
                          }
                        />
                      </div>
                    )}
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    {...form.register(`items.${index}.batch_number`)}
                    className="h-8 border-0 shadow-none bg-transparent focus-visible:ring-1 focus-visible:bg-background"
                    placeholder="Packet number..."
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="date"
                    {...form.register(`items.${index}.expiry_date`)}
                    className="h-8 border-0 shadow-none bg-transparent focus-visible:ring-1 focus-visible:bg-background"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    min="1"
                    {...form.register(`items.${index}.quantity`, {
                      valueAsNumber: true,
                      onChange: () => recalc(index),
                    })}
                    className="h-8 border-0 shadow-none bg-transparent focus-visible:ring-1 focus-visible:bg-background"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...form.register(`items.${index}.unit_price`, {
                      valueAsNumber: true,
                      onChange: () => recalc(index),
                    })}
                    className="h-8 border-0 shadow-none bg-transparent focus-visible:ring-1 focus-visible:bg-background"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...form.register(`items.${index}.mrp`, { valueAsNumber: true })}
                    className="h-8 border-0 shadow-none bg-transparent focus-visible:ring-1 focus-visible:bg-background"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register(`items.${index}.total_price`, { valueAsNumber: true })}
                    className="h-8 border-0 shadow-none bg-transparent font-medium focus-visible:ring-1 focus-visible:bg-background"
                  />
                </td>
                <td className="px-4 py-2 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {fields.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <Sparkles className="w-8 h-8 mb-2 opacity-30" />
                    <p>No items added yet.</p>
                    <p className="text-xs">Add a row manually or scan a bill with AI.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

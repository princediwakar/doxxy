// components/billing/ServiceItemsSection.tsx
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Pill, Package, AlertTriangle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList, CommandGroup } from '@/components/ui/command';
import { Spinner } from '@/components/ui/loading';
import { cn } from '@/lib/utils';
import { useDebounce } from 'use-debounce';
import { useQuery } from '@tanstack/react-query';
import { queryMedicineSearch, queryInventory } from '@/lib/queries/pharmacy';
import { useAppState } from '@/contexts/AppStateContext';
import type { InventoryItemWithMedicine } from '@/types/core';
import type { Medicine } from '@/types/prescriptions';
import type { ServiceItem } from '@/hooks/useBilling';

interface ServiceItemsSectionProps {
  serviceItems: ServiceItem[];
  onUpdateItem: (index: number, field: keyof ServiceItem, value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onSelectMedicine?: (index: number, medicine: Medicine, inventoryItem?: InventoryItemWithMedicine) => void;
  mode: 'create' | 'view' | 'edit';
}

function SourceDot({ source }: { source?: string | null }) {
  if (!source || source === 'manual') return null;
  return (
    <span
      className={cn(
        'absolute top-1 right-1 w-2.5 h-2.5 rounded-full border border-white',
        source === 'inventory' ? 'bg-green-500' : 'bg-blue-500'
      )}
      title={source === 'inventory' ? 'From inventory' : 'From catalog'}
    />
  );
}

const formatComposition = (comp1: string | null, comp2: string | null) => {
  if (!comp1) return null;
  return comp2 ? `${comp1} + ${comp2}` : comp1;
};

function formatExpiry(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

type BatchStatus = 'out_of_stock' | 'low_stock' | 'expiring_soon' | 'ok';

function getBatchStatus(item: InventoryItemWithMedicine): BatchStatus {
  if (item.current_stock <= 0) return 'out_of_stock';
  const expiry = new Date(item.expiry_date);
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  if (expiry <= nextMonth) return 'expiring_soon';
  if (item.current_stock <= item.reorder_level) return 'low_stock';
  return 'ok';
}

export const ServiceItemsSection: React.FC<ServiceItemsSectionProps> = ({
  serviceItems,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
  onSelectMedicine,
  mode,
}) => {
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const { activeClinicId } = useAppState();

  const { data: medicines = [], isLoading: medicinesLoading } = useQuery({
    queryKey: ['medicines', 'search', debouncedQuery],
    queryFn: () => queryMedicineSearch(debouncedQuery),
    staleTime: 10 * 60 * 1000,
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['pharmacy_inventory', activeClinicId],
    queryFn: () => queryInventory(activeClinicId!),
    enabled: !!activeClinicId,
    staleTime: 2 * 60 * 1000,
  });

  const inventoryByMedicineId = React.useMemo(() => {
    const map = new Map<number, InventoryItemWithMedicine[]>();
    for (const item of inventory ?? []) {
      const existing = map.get(item.medicine_id) ?? [];
      existing.push(item);
      map.set(item.medicine_id, existing);
    }
    return map;
  }, [inventory]);

  const handleOpenPicker = useCallback((index: number) => {
    setPickerIndex(index);
    setSearchQuery('');
  }, []);

  const handleSelectMedicine = useCallback(
    (medicine: Medicine, specificInventoryItem?: InventoryItemWithMedicine) => {
      if (pickerIndex === null || !onSelectMedicine) return;

      // If a specific batch was picked, use it. Otherwise fall back to best in-stock batch.
      let inventoryItem = specificInventoryItem;
      if (!inventoryItem) {
        const stockItems = inventoryByMedicineId.get(medicine.id);
        inventoryItem = stockItems?.find((i) => i.current_stock > 0);
      }

      onSelectMedicine(pickerIndex, medicine, inventoryItem);
      setPickerIndex(null);
      setSearchQuery('');
    },
    [pickerIndex, inventoryByMedicineId, onSelectMedicine]
  );

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Service Items</h3>

      <div className="space-y-3">
        {serviceItems.map((item, index) => {
          // Determine if this item has a stock warning
          const hasInventorySource = item.source === 'inventory' && item.inventory_item_id;
          const inventoryItem = hasInventorySource
            ? inventory.find((i) => i.id === item.inventory_item_id)
            : null;
          const stockWarning =
            inventoryItem && item.quantity > inventoryItem.current_stock
              ? `Only ${inventoryItem.current_stock} in stock`
              : null;

          return (
            <div key={index} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5">
                <div className="flex gap-1 items-center">
                  {mode !== 'view' && onSelectMedicine && (
                    <Popover
                      open={pickerIndex === index}
                      onOpenChange={(open) => {
                        if (open) {
                          handleOpenPicker(index);
                        } else {
                          setPickerIndex(null);
                          setSearchQuery('');
                        }
                      }}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 shrink-0"
                          title="Pick a medicine from catalog or inventory"
                        >
                          <Pill className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-96 p-0" align="start">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Search medicines..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                            className="h-9"
                          />
                          <CommandList className="max-h-80">
                            <CommandEmpty>
                              {medicinesLoading ? (
                                <div className="flex items-center justify-center py-6">
                                  <Spinner size="md" />
                                </div>
                              ) : (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                  {debouncedQuery
                                    ? `No medicines found for "${debouncedQuery}"`
                                    : 'Start typing to search medicines...'}
                                </div>
                              )}
                            </CommandEmpty>
                            {medicines.map((medicine) => {
                              const stockItems = inventoryByMedicineId.get(medicine.id) ?? [];
                              const inStockItems = stockItems.filter((i) => i.current_stock > 0);
                              const hasStock = inStockItems.length > 0;

                              // Show each batch as a separate selectable item when there's inventory
                              if (stockItems.length > 0) {
                                return (
                                  <CommandGroup key={medicine.id} heading={medicine.name}>
                                    {stockItems.map((batch) => {
                                      const batchStatus = getBatchStatus(batch);
                                      const isUnavailable = batchStatus === 'out_of_stock';
                                      return (
                                        <CommandItem
                                          key={batch.id}
                                          value={`${medicine.name}-${batch.batch_number}`}
                                          onSelect={() => !isUnavailable && handleSelectMedicine(medicine, batch)}
                                          disabled={isUnavailable}
                                          className={cn('flex-col items-start gap-0.5', isUnavailable && 'opacity-50 cursor-not-allowed')}
                                        >
                                          <div className="flex w-full items-center gap-2">
                                            <Package className="h-3.5 w-3.5 shrink-0 text-green-600" />
                                            <span className="text-xs text-muted-foreground flex-1">
                                              Batch: <strong>{batch.batch_number}</strong>
                                              {' · '}Exp: {formatExpiry(batch.expiry_date)}
                                              {' · '}MRP: ₹{batch.mrp.toFixed(2)}
                                            </span>
                                            <span className={cn(
                                              'text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0',
                                              batchStatus === 'out_of_stock' && 'bg-red-100 text-red-700',
                                              batchStatus === 'low_stock' && 'bg-amber-100 text-amber-700',
                                              batchStatus === 'expiring_soon' && 'bg-orange-100 text-orange-700',
                                              batchStatus === 'ok' && 'bg-green-100 text-green-700',
                                            )}>
                                              {batchStatus === 'out_of_stock' && 'Out of Stock'}
                                              {batchStatus === 'low_stock' && `${batch.current_stock} left`}
                                              {batchStatus === 'expiring_soon' && `${batch.current_stock} · Exp soon`}
                                              {batchStatus === 'ok' && `${batch.current_stock} units`}
                                            </span>
                                          </div>
                                        </CommandItem>
                                      );
                                    })}
                                  </CommandGroup>
                                );
                              }

                              // No inventory — show from catalog
                              return (
                                <CommandItem
                                  key={medicine.id}
                                  value={medicine.name}
                                  onSelect={() => handleSelectMedicine(medicine)}
                                >
                                  <Pill className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                                  <div className="flex flex-col flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="truncate">{medicine.name}</span>
                                      <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                                        Catalog
                                      </span>
                                    </div>
                                    {medicine.short_composition1 && (
                                      <span className="text-xs text-muted-foreground">
                                        {formatComposition(medicine.short_composition1, medicine.short_composition2)}
                                      </span>
                                    )}
                                  </div>
                                  {medicine.price != null && (
                                    <span className="text-xs text-muted-foreground ml-2 shrink-0">
                                      ₹{medicine.price}
                                    </span>
                                  )}
                                </CommandItem>
                              );
                            })}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                  <div className="relative flex-1">
                    <Input
                      placeholder="Service description"
                      value={item.description}
                      onChange={(e) => onUpdateItem(index, 'description', e.target.value)}
                      disabled={mode === 'view'}
                    />
                    {item.source && item.source !== 'manual' && (
                      <SourceDot source={item.source} />
                    )}
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                <div className="relative">
                  <Input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => onUpdateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    disabled={mode === 'view'}
                    className={cn(stockWarning && 'border-amber-400 focus-visible:ring-amber-400')}
                  />
                  {stockWarning && (
                    <div className="absolute -bottom-5 left-0 flex items-center gap-1 text-[10px] text-amber-600 whitespace-nowrap">
                      <AlertTriangle className="h-3 w-3" />
                      {stockWarning}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-2">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Rate"
                  value={item.rate}
                  onChange={(e) => onUpdateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                  disabled={mode === 'view'}
                />
              </div>

              <div className="col-span-2">
                <Input
                  type="number"
                  value={item.amount.toFixed(2)}
                  disabled
                  className="bg-muted"
                  placeholder="Amount"
                />
              </div>

              {mode !== 'view' && (
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveItem(index)}
                    disabled={serviceItems.length === 1}
                    className="h-10 w-10 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Spacer for qty warning labels */}
      {serviceItems.some((item) => {
        const inv = inventory.find((i) => i.id === item.inventory_item_id);
        return inv && item.quantity > inv.current_stock;
      }) && <div className="h-2" />}

      {mode !== 'view' && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddItem}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      )}
    </div>
  );
};

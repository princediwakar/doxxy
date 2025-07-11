import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { ServiceItem } from '@/hooks/useBilling';

interface ServiceItemsSectionProps {
  serviceItems: ServiceItem[];
  onUpdateItem: (index: number, field: keyof ServiceItem, value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  mode: 'create' | 'view' | 'edit';
}

export const ServiceItemsSection: React.FC<ServiceItemsSectionProps> = ({
  serviceItems,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
  mode,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Service Items</h3>
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

      <div className="space-y-3">
        {serviceItems.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-5">
              <label className="text-xs font-medium text-muted-foreground">
                Description
              </label>
              <Input
                placeholder="Service description"
                value={item.description}
                onChange={(e) => onUpdateItem(index, 'description', e.target.value)}
                disabled={mode === 'view'}
              />
            </div>
            
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground">
                Quantity
              </label>
              <Input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => onUpdateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                disabled={mode === 'view'}
              />
            </div>
            
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground">
                Rate (₹)
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={item.rate}
                onChange={(e) => onUpdateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                disabled={mode === 'view'}
              />
            </div>
            
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground">
                Amount (₹)
              </label>
              <Input
                type="number"
                value={item.amount.toFixed(2)}
                disabled
                className="bg-muted"
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
        ))}
      </div>
    </div>
  );
}; 
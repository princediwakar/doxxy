import React from 'react';
import { Button } from '@/components/ui/button';

export const ThemeShowcase: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-primary">Doxxy Healthcare Theme</h2>
      
      {/* Buttons */}
      <div className="flex gap-3 flex-wrap">
        <Button className="bg-primary text-primary-foreground">Primary Action</Button>
        <Button variant="secondary">Secondary</Button>
        <Button className="bg-accent text-accent-foreground">Success Action</Button>
      </div>

      {/* Status Badges */}
      <div className="flex gap-3 flex-wrap">
        <span className="status-badge status-active">Active</span>
        <span className="status-badge status-pending">Pending</span>
        <span className="status-badge status-urgent">Critical</span>
      </div>

      {/* Alert Examples */}
      <div className="space-y-3">
        <div className="bg-success/10 border border-success/20 text-success p-3 rounded">
          Patient record updated successfully
        </div>
        <div className="bg-warning/10 border border-warning/20 text-warning p-3 rounded">
          Lab results require review
        </div>
      </div>
    </div>
  );
}; 
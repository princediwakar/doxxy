import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { InviteFormData, DepartmentWithType } from "@/hooks/useClinicMembers";
import { Enums } from "@/integrations/supabase/types";

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeDepartments: DepartmentWithType[];
  onInvite: (formData: InviteFormData & { name: string; phone: string }) => Promise<void>;
  loading?: boolean;
}

export const InviteMemberDialog: React.FC<InviteMemberDialogProps> = ({
  open,
  onOpenChange,
  activeDepartments,
  onInvite,
  loading = false,
}) => {
  const [formData, setFormData] = useState<InviteFormData & { name: string; phone: string }>({
    email: "",
    role: "doctor",
    departmentId: "no-department",
    name: "",
    phone: "",
  });

  const handleSubmit = async () => {
    if (!formData.email || !formData.name || !formData.phone) {
      return;
    }
    
    try {
      await onInvite(formData);
      // Reset form and close dialog
      setFormData({
        email: "",
        role: "doctor",
        departmentId: "no-department",
        name: "",
        phone: "",
      });
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setFormData({
        email: "",
        role: "doctor",
        departmentId: "no-department",
        name: "",
        phone: "",
      });
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite New Member</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Phone</label>
            <Input
              type="tel"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Role</label>
            <Select 
              value={formData.role} 
              onValueChange={(value: Enums<'user_role'>) => 
                setFormData(prev => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="superadmin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Department</label>
            <Select 
              value={formData.departmentId} 
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, departmentId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Available Departments</SelectLabel>
                  <SelectItem value="no-department">No Department</SelectItem>
                  {activeDepartments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.department_types?.name || 'Unknown Department'}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading || !formData.email || !formData.name || !formData.phone}
          >
            {loading ? "Inviting..." : "Send Invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 
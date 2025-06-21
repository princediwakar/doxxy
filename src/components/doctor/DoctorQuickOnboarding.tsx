import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Stethoscope, 
  X,
  Loader2
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const supabase = getSupabase();

interface DoctorQuickOnboardingProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DoctorQuickOnboarding({ open, onClose, onSuccess }: DoctorQuickOnboardingProps) {
  const { user, activeClinic } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    selectedDepartment: '',
    primarySpecialization: '',
    phone: '',
    consultationFee: '500',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch available departments
  const { data: departments = [] } = useQuery({
    queryKey: ['clinicDepartments', activeClinic?.clinic_id],
    queryFn: async () => {
      if (!activeClinic?.clinic_id) return [];
      const { data, error } = await supabase
        .from('clinic_departments')
        .select('id, department_types(id, name)')
        .eq('clinic_id', activeClinic.clinic_id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!activeClinic?.clinic_id && open,
  });

  const createDoctorMutation = useMutation({
    mutationFn: async () => {
      if (!user || !activeClinic) throw new Error('User or clinic not found');

      // Create the doctor profile (without department_id - proper multi-tenant architecture)
      const { error: doctorError } = await supabase.from('doctors').insert({
        user_id: user.id,
        clinic_id: activeClinic.clinic_id,
        name: user.user_metadata?.name || user.email || '',
        email: user.email || '',
        phone: formData.phone || user.phone || '',
        primary_specialization: formData.primarySpecialization,
        consultation_fee_min: parseInt(formData.consultationFee),
        consultation_fee_max: parseInt(formData.consultationFee) + 200,
        is_active: true,
        bio: `Medical professional specializing in ${formData.primarySpecialization}`,
      });

      if (doctorError) throw doctorError;

      // Update department assignment in clinic_members table (proper multi-tenant approach)
      if (formData.selectedDepartment) {
        const { error: deptError } = await supabase
          .from('clinic_members')
          .update({ department_id: formData.selectedDepartment })
          .eq('user_id', user.id)
          .eq('clinic_id', activeClinic.clinic_id);
        
        if (deptError) console.warn('Department linking failed:', deptError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userHasDoctorProfile'] });
      toast({ 
        title: "Success",
        description: "Medical profile created successfully! You can now see patients and manage appointments.",
      });
      onSuccess();
      onClose();
    },
    onError: (error) => {
      console.error('Error creating doctor profile:', error);
      toast({ 
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create medical profile.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.primarySpecialization.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your medical specialization.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    createDoctorMutation.mutate();
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-100 p-2 rounded-full">
              <Stethoscope className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">Setup Medical Profile</DialogTitle>
              <p className="text-sm text-muted-foreground">Complete the essentials to start practicing</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Department Selection */}
                <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-medium">
              Department <span className="text-muted-foreground">(Optional)</span>
                  </Label>
            <Select value={formData.selectedDepartment} onValueChange={(value) => setFormData(prev => ({ ...prev, selectedDepartment: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select your primary department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.department_types?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
            <p className="text-xs text-muted-foreground">This helps with appointment categorization</p>
                </div>

          {/* Specialization */}
                <div className="space-y-2">
            <Label htmlFor="specialization" className="text-sm font-medium">
              Medical Specialization <span className="text-red-500">*</span>
                  </Label>
                  <Input
              id="specialization"
                    value={formData.primarySpecialization}
                    onChange={(e) => setFormData(prev => ({ ...prev, primarySpecialization: e.target.value }))}
              placeholder="e.g., Cardiology, Neurology, General Medicine"
              required
                  />
            <p className="text-xs text-muted-foreground">Your area of medical expertise</p>
                </div>

          {/* Phone */}
                  <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Professional Phone <span className="text-muted-foreground">(Optional)</span>
            </Label>
                    <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+91 98765 43210"
            />
            <p className="text-xs text-muted-foreground">For patient contact and appointments</p>
                </div>

          {/* Consultation Fee */}
                <div className="space-y-2">
            <Label htmlFor="fee" className="text-sm font-medium">
              Consultation Fee <span className="text-muted-foreground">(₹)</span>
                  </Label>
                  <Input
              id="fee"
              type="number"
              value={formData.consultationFee}
              onChange={(e) => setFormData(prev => ({ ...prev, consultationFee: e.target.value }))}
              placeholder="500"
              min="0"
            />
            <p className="text-xs text-muted-foreground">Base consultation fee (you can adjust this later)</p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
          <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Medical Profile
          </Button>
        </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
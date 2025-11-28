import React from "react";
import { Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MedicineCombobox } from "@/components/ui/medicine-combobox";
import { Plus, Trash2, Calendar, User, Stethoscope } from "lucide-react";
import { formatTimeIST } from '@/lib/utils';
import { PrescriptionFormValues } from "@/types/prescriptions";

interface AppointmentSelectorProps {
  appointmentsForSelect: Array<{
    id: string;
    patient_name: string;
    doctor_name: string;
    date: string;
    time: string;
    status: string;
  }>;
  selectedAppointmentId: string | null;
  setSelectedAppointmentId: (id: string | null) => void;
  selectedAppointment: {
    id: string;
    patient_name: string;
    doctor_name: string;
    date: string;
    time: string;
    status: string;
  } | null | undefined;
  isLoading: boolean;
}

export const AppointmentSelector: React.FC<AppointmentSelectorProps> = ({
  appointmentsForSelect,
  selectedAppointmentId,
  setSelectedAppointmentId,
  selectedAppointment,
  isLoading
}) => (
  <div className="space-y-4">
    <div>
      <label className="text-sm font-medium mb-2 block">Select Appointment (Optional)</label>
      <Select
        value={selectedAppointmentId || ""}
        onValueChange={(value) => setSelectedAppointmentId(value === "none" ? null : value)}
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder="Choose an appointment or create prescription manually" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No appointment (Manual prescription)</SelectItem>
          {appointmentsForSelect.map((apt) => (
            <SelectItem key={apt.id} value={apt.id}>
              <div className="flex items-center gap-2 text-xs">
                <User className="h-3 w-3" />
                {apt.patient_name}
                <Calendar className="h-3 w-3 ml-2" />
                {new Date(apt.date).toLocaleDateString()} {formatTimeIST(apt.time)}
                <Stethoscope className="h-3 w-3 ml-2" />
                {apt.doctor_name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {selectedAppointment && (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm">{selectedAppointment.patient_name}</h4>
              <p className="text-xs text-gray-600">
                {new Date(selectedAppointment.date).toLocaleDateString()} at {formatTimeIST(selectedAppointment.time)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">Dr. {selectedAppointment.doctor_name}</p>
              <Badge variant="outline" className="text-xs">
                {selectedAppointment.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);

interface ManualSelectorsProps {
  doctors: Array<{
    id: string;
    name: string;
    department_name?: string;
  }>;
  patients: Array<{
    id: string;
    name: string;
    phone?: string | null;
  }>;
  manualDoctorId: string | null;
  setManualDoctorId: (id: string | null) => void;
  manualPatientId: string | null;
  setManualPatientId: (id: string | null) => void;
  selectedDoctor: {
    id: string;
    name: string;
    department_name?: string;
  } | null | undefined;
  selectedPatient: {
    id: string;
    name: string;
    phone?: string | null;
  } | null | undefined;
  isLoading: boolean;
}

export const ManualSelectors: React.FC<ManualSelectorsProps> = ({
  doctors,
  patients,
  manualDoctorId,
  setManualDoctorId,
  manualPatientId,
  setManualPatientId,
  selectedDoctor,
  selectedPatient,
  isLoading
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="text-sm font-medium mb-2 block">Doctor</label>
      <Select
        value={manualDoctorId || ""}
        onValueChange={(value) => setManualDoctorId(value)}
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select doctor" />
        </SelectTrigger>
        <SelectContent>
          {doctors.map((doctor) => (
            <SelectItem key={doctor.id} value={doctor.id}>
              {doctor.name}
              {doctor.department_name && (
                <span className="text-xs text-gray-500 ml-2">({doctor.department_name})</span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedDoctor && (
        <p className="text-xs text-gray-600 mt-1">
          Selected: {selectedDoctor.name}
          {selectedDoctor.department_name && ` (${selectedDoctor.department_name})`}
        </p>
      )}
    </div>

    <div>
      <label className="text-sm font-medium mb-2 block">Patient</label>
      <Select
        value={manualPatientId || ""}
        onValueChange={(value) => setManualPatientId(value)}
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select patient" />
        </SelectTrigger>
        <SelectContent>
          {patients.map((patient) => (
            <SelectItem key={patient.id} value={patient.id}>
              {patient.name}
              {patient.phone && (
                <span className="text-xs text-gray-500 ml-2">({patient.phone})</span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedPatient && (
        <p className="text-xs text-gray-600 mt-1">
          Selected: {selectedPatient.name}
          {selectedPatient.phone && ` (${selectedPatient.phone})`}
        </p>
      )}
    </div>
  </div>
);

interface MedicationFieldsProps {
  fields: Array<{
    id: string;
    name?: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
  }>;
  control: Control<PrescriptionFormValues>;
  handleMedicineSelect: (index: number, medicine: { name: string }, autoFillData: {
    dosage: string;
    route: string;
    suggestedFrequency?: string;
  }) => void;
  removeMedication: (index: number) => void;
  addMedication: () => void;
}

export const MedicationFields: React.FC<MedicationFieldsProps> = ({
  fields,
  control,
  handleMedicineSelect,
  removeMedication,
  addMedication
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-medium">Medications</h3>
      <Button
        type="button"
        onClick={addMedication}
        size="sm"
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Medication
      </Button>
    </div>

    {fields.map((field, index) => (
      <Card key={field.id} className="p-4">
        <div className="flex items-start justify-between mb-4">
          <h4 className="font-medium text-sm">Medication {index + 1}</h4>
          {fields.length > 1 && (
            <Button
              type="button"
              onClick={() => removeMedication(index)}
              size="sm"
              variant="destructive"
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name={`medications.${index}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medicine Name</FormLabel>
                <FormControl>
                  <MedicineCombobox
                    value={field.value}
                    onMedicineSelect={(medicine, autoFillData) => {
                      handleMedicineSelect(index, medicine, autoFillData);
                    }}
                    placeholder="Search for medicine..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`medications.${index}.dosage`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dosage</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., 500mg" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`medications.${index}.frequency`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="OD">OD (Once Daily)</SelectItem>
                    <SelectItem value="BD">BD (Twice Daily)</SelectItem>
                    <SelectItem value="TDS">TDS (Three Times Daily)</SelectItem>
                    <SelectItem value="QID">QID (Four Times Daily)</SelectItem>
                    <SelectItem value="PRN">PRN (As Needed)</SelectItem>
                    <SelectItem value="SOS">SOS (As Required)</SelectItem>
                    <SelectItem value="Q4H">Q4H (Every 4 Hours)</SelectItem>
                    <SelectItem value="Q6H">Q6H (Every 6 Hours)</SelectItem>
                    <SelectItem value="Q8H">Q8H (Every 8 Hours)</SelectItem>
                    <SelectItem value="Q12H">Q12H (Every 12 Hours)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`medications.${index}.duration`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., 7 days" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name={`medications.${index}.instructions`}
          render={({ field }) => (
            <FormItem className="mt-4">
              <FormLabel>Instructions</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="e.g., Take after meals, Avoid alcohol..."
                  rows={2}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Card>
    ))}
  </div>
);

interface NotesFieldProps {
  control: Control<PrescriptionFormValues>;
}

export const NotesField: React.FC<NotesFieldProps> = ({ control }) => (
  <FormField
    control={control}
    name="notes"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Additional Notes (Optional)</FormLabel>
        <FormControl>
          <Textarea 
            {...field} 
            placeholder="Any additional instructions or notes..."
            rows={3}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
); 
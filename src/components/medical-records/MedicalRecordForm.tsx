
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MedicalRecordFormProps {
  appointment: any;
  onComplete: () => void;
  onCancel: () => void;
}

export function MedicalRecordForm({ appointment, onComplete, onCancel }: MedicalRecordFormProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  
  // General form data
  const [generalData, setGeneralData] = useState({
    chief_complaint: "",
    diagnosis: "",
    notes: "",
    symptoms: "",
    treatment_plan: ""
  });

  // Prescription data
  const [medications, setMedications] = useState([
    { name: "", dosage: "", frequency: "", duration: "" }
  ]);
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>();

  const addMedication = () => {
    setMedications([...medications, { name: "", dosage: "", frequency: "", duration: "" }]);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const updated = medications.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    );
    setMedications(updated);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Create a simple medical record entry
      const recordData = {
        appointment_id: appointment.id,
        patient_id: appointment.patient_id,
        doctor_id: appointment.doctor_id,
        chief_complaint: generalData.chief_complaint,
        diagnosis: generalData.diagnosis,
        notes: generalData.notes,
        symptoms: generalData.symptoms,
        treatment_plan: generalData.treatment_plan,
        medications: medications.filter(med => med.name.trim() !== ""),
        prescription_notes: prescriptionNotes,
        follow_up_date: followUpDate ? format(followUpDate, 'yyyy-MM-dd') : null
      };

      // For now, we'll just update the appointment with medical notes
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'Completed',
          notes: `${generalData.chief_complaint ? 'Chief Complaint: ' + generalData.chief_complaint + '\n' : ''}${generalData.diagnosis ? 'Diagnosis: ' + generalData.diagnosis + '\n' : ''}${generalData.notes}`
        })
        .eq('id', appointment.id);

      if (error) throw error;

      toast.success("Medical record saved successfully");
      onComplete();
    } catch (error) {
      console.error("Error saving medical record:", error);
      toast.error("Failed to save medical record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Medical Record</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Patient: {appointment.patients?.name}</span>
            <Badge variant="outline">{appointment.department}</Badge>
            <span>Date: {format(new Date(appointment.date), 'PPP')}</span>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">Clinical Notes</TabsTrigger>
          <TabsTrigger value="prescription">Prescription</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="chief_complaint">Chief Complaint</Label>
              <Input
                id="chief_complaint"
                value={generalData.chief_complaint}
                onChange={(e) => setGeneralData(prev => ({ ...prev, chief_complaint: e.target.value }))}
                placeholder="Patient's main complaint"
              />
            </div>
            
            <div>
              <Label htmlFor="symptoms">Symptoms</Label>
              <Textarea
                id="symptoms"
                value={generalData.symptoms}
                onChange={(e) => setGeneralData(prev => ({ ...prev, symptoms: e.target.value }))}
                placeholder="Detailed description of symptoms"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Input
                id="diagnosis"
                value={generalData.diagnosis}
                onChange={(e) => setGeneralData(prev => ({ ...prev, diagnosis: e.target.value }))}
                placeholder="Preliminary or final diagnosis"
              />
            </div>
            
            <div>
              <Label htmlFor="treatment_plan">Treatment Plan</Label>
              <Textarea
                id="treatment_plan"
                value={generalData.treatment_plan}
                onChange={(e) => setGeneralData(prev => ({ ...prev, treatment_plan: e.target.value }))}
                placeholder="Treatment plan and recommendations"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={generalData.notes}
                onChange={(e) => setGeneralData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional clinical observations"
                rows={3}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="prescription" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Medications</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMedication}>
                <Plus className="h-4 w-4 mr-2" />
                Add Medication
              </Button>
            </div>
            
            {medications.map((medication, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Medication {index + 1}</h4>
                      {medications.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMedication(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Medicine Name</Label>
                        <Input
                          value={medication.name}
                          onChange={(e) => updateMedication(index, 'name', e.target.value)}
                          placeholder="e.g., Aspirin"
                        />
                      </div>
                      <div>
                        <Label>Dosage</Label>
                        <Input
                          value={medication.dosage}
                          onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                          placeholder="e.g., 500mg"
                        />
                      </div>
                      <div>
                        <Label>Frequency</Label>
                        <Input
                          value={medication.frequency}
                          onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                          placeholder="e.g., Twice daily"
                        />
                      </div>
                      <div>
                        <Label>Duration</Label>
                        <Input
                          value={medication.duration}
                          onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                          placeholder="e.g., 7 days"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <div>
              <Label htmlFor="prescription_notes">Instructions</Label>
              <Textarea
                id="prescription_notes"
                value={prescriptionNotes}
                onChange={(e) => setPrescriptionNotes(e.target.value)}
                placeholder="Additional instructions for the patient"
                rows={3}
              />
            </div>
            
            <div>
              <Label>Follow-up Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !followUpDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {followUpDate ? format(followUpDate, "PPP") : "Select follow-up date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={followUpDate}
                    onSelect={setFollowUpDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Complete Consultation"}
        </Button>
      </div>
    </div>
  );
}

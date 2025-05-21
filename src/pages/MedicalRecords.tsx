
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, FileText, Eye, Printer } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { MedicalRecordModal } from "@/components/MedicalRecordModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MedicalRecords = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [openModal, setOpenModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchMedicalRecords();
    fetchPendingAppointments();
  }, []);

  const fetchMedicalRecords = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select(`
          *,
          patients (name),
          doctors (name, specialization),
          appointments (date, time, status)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Fetch specialty-specific records and prescriptions for each medical record
      const enhancedRecords = await Promise.all(data.map(async (record) => {
        // Get neurology records if applicable
        const { data: neurologyData } = await supabase
          .from('neurology_records')
          .select('*')
          .eq('medical_record_id', record.id)
          .maybeSingle();
          
        // Get ophthalmology records if applicable
        const { data: ophthalmologyData } = await supabase
          .from('ophthalmology_records')
          .select('*')
          .eq('medical_record_id', record.id)
          .maybeSingle();
          
        // Get prescription if exists
        const { data: prescriptionData } = await supabase
          .from('prescriptions')
          .select('*')
          .eq('medical_record_id', record.id)
          .maybeSingle();
          
        return {
          ...record,
          neurologyRecord: neurologyData || null,
          ophthalmologyRecord: ophthalmologyData || null,
          prescription: prescriptionData || null
        };
      }));
      
      setMedicalRecords(enhancedRecords);
    } catch (error) {
      console.error("Error fetching medical records:", error);
      toast.error("Failed to load medical records");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (name),
          doctors (name, specialization)
        `)
        .in('status', ['Scheduled', 'In Progress'])
        .order('date', { ascending: true });
        
      if (error) throw error;
      
      // Format the appointments for easy use
      const formattedAppointments = data.map(app => ({
        id: app.id,
        patient_id: app.patient_id,
        doctor_id: app.doctor_id,
        patient: app.patients.name,
        doctor: app.doctors.name,
        doctorSpecialty: app.doctors.specialization,
        date: app.date,
        time: app.time,
        status: app.status,
        type: app.type
      }));
      
      setAppointments(formattedAppointments);
    } catch (error) {
      console.error("Error fetching pending appointments:", error);
    }
  };

  const handleViewRecord = (record) => {
    // Prepare the appointment data needed for the modal
    const appointmentData = {
      id: record.appointment_id,
      patient_id: record.patient_id,
      doctor_id: record.doctor_id,
      patient: record.patients.name,
      doctor: record.doctors.name,
      doctorSpecialty: record.doctors.specialization,
      date: record.appointments.date,
      time: record.appointments.time,
      status: record.appointments.status
    };
    
    setSelectedRecord(record);
    setSelectedAppointment(appointmentData);
    setOpenModal(true);
  };

  const handleCreateRecord = (appointment) => {
    setSelectedRecord(null);
    setSelectedAppointment(appointment);
    setOpenModal(true);
  };

  const handlePrint = (record) => {
    // Create a printable view in a new window
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      toast.error("Please allow pop-ups to print medical records");
      return;
    }
    
    const recordType = record.record_type;
    let specialtyData = '';
    
    if (recordType === 'Neurology' && record.neurologyRecord) {
      specialtyData = `
        <h3 class="text-lg font-bold mt-4">Neurology Assessment</h3>
        <div class="mt-2">
          <p><strong>Neurological Exam:</strong> ${record.neurologyRecord.neurological_exam || 'Not recorded'}</p>
          <p><strong>Motor Function:</strong> ${record.neurologyRecord.motor_function || 'Not recorded'}</p>
          <p><strong>Sensory Function:</strong> ${record.neurologyRecord.sensory_function || 'Not recorded'}</p>
          <p><strong>Reflexes:</strong> ${record.neurologyRecord.reflexes || 'Not recorded'}</p>
          <p><strong>Coordination:</strong> ${record.neurologyRecord.coordination || 'Not recorded'}</p>
          <p><strong>Cognitive Assessment:</strong> ${record.neurologyRecord.cognitive_assessment || 'Not recorded'}</p>
          <p><strong>Scan Results:</strong> ${record.neurologyRecord.scan_results || 'Not recorded'}</p>
        </div>
      `;
    } else if (recordType === 'Ophthalmology' && record.ophthalmologyRecord) {
      specialtyData = `
        <h3 class="text-lg font-bold mt-4">Ophthalmology Assessment</h3>
        <div class="mt-2">
          <p><strong>Visual Acuity (Right):</strong> ${record.ophthalmologyRecord.visual_acuity_right || 'Not recorded'}</p>
          <p><strong>Visual Acuity (Left):</strong> ${record.ophthalmologyRecord.visual_acuity_left || 'Not recorded'}</p>
          <p><strong>Intraocular Pressure (Right):</strong> ${record.ophthalmologyRecord.intraocular_pressure_right || 'Not recorded'}</p>
          <p><strong>Intraocular Pressure (Left):</strong> ${record.ophthalmologyRecord.intraocular_pressure_left || 'Not recorded'}</p>
          <p><strong>Eye Examination:</strong> ${record.ophthalmologyRecord.eye_examination || 'Not recorded'}</p>
          <p><strong>Fundoscopy:</strong> ${record.ophthalmologyRecord.fundoscopy || 'Not recorded'}</p>
          <p><strong>Color Vision:</strong> ${record.ophthalmologyRecord.color_vision || 'Not recorded'}</p>
          <p><strong>Peripheral Vision:</strong> ${record.ophthalmologyRecord.peripheral_vision || 'Not recorded'}</p>
        </div>
      `;
    }
    
    // Prescription section
    let prescriptionData = '';
    if (record.prescription) {
      const medicines = record.prescription.medicines || [];
      let medicinesList = '';
      
      if (medicines.length > 0) {
        medicinesList = `
          <ul class="list-disc pl-5 mt-2">
            ${medicines.map(med => `<li>
              <strong>${med.name}</strong> - ${med.dosage}
              ${med.frequency ? ` • ${med.frequency}` : ''}
              ${med.duration ? ` • ${med.duration}` : ''}
            </li>`).join('')}
          </ul>
        `;
      } else {
        medicinesList = '<p class="italic">No medications prescribed</p>';
      }
      
      const followUpDate = record.prescription.follow_up_date 
        ? format(new Date(record.prescription.follow_up_date), 'MMM dd, yyyy') 
        : 'Not scheduled';
        
      prescriptionData = `
        <h3 class="text-lg font-bold mt-4">Prescription</h3>
        <div class="mt-2">
          <h4 class="font-semibold">Medications:</h4>
          ${medicinesList}
          <p class="mt-2"><strong>Instructions:</strong> ${record.prescription.instructions || 'No special instructions'}</p>
          <p><strong>Follow-up Date:</strong> ${followUpDate}</p>
        </div>
      `;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Medical Record - ${record.patients.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .section { margin-bottom: 15px; }
            .footer { margin-top: 40px; font-size: 12px; text-align: center; }
            @media print {
              .no-print { display: none; }
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: right; margin-bottom: 20px;">
            <button onclick="window.print();" style="padding: 8px 16px; background: #4f46e5; color: white; border: none; border-radius: 4px; cursor: pointer;">Print Record</button>
          </div>
          
          <div class="header">
            <h1 style="margin-bottom: 5px;">MediClinic</h1>
            <h2>${record.record_type} Department</h2>
            <p>Medical Record</p>
          </div>
          
          <div class="section">
            <table style="width: 100%;">
              <tr>
                <td><strong>Patient:</strong> ${record.patients.name}</td>
                <td><strong>Date:</strong> ${format(new Date(record.created_at), 'MMM dd, yyyy')}</td>
              </tr>
              <tr>
                <td><strong>Doctor:</strong> ${record.doctors.name}</td>
                <td><strong>Department:</strong> ${record.doctors.specialization}</td>
              </tr>
            </table>
          </div>
          
          <hr />
          
          <div class="section">
            <h3 class="text-lg font-bold">General Information</h3>
            <p><strong>Chief Complaint:</strong> ${record.chief_complaint || 'Not recorded'}</p>
            <p><strong>Diagnosis:</strong> ${record.diagnosis || 'Not recorded'}</p>
            <p><strong>Notes:</strong> ${record.notes || 'No additional notes'}</p>
          </div>
          
          ${specialtyData}
          
          ${prescriptionData}
          
          <hr />
          
          <div class="footer">
            <p>This is an official medical record from MediClinic. Please keep for your records.</p>
            <p>Generated on ${format(new Date(), 'MMMM dd, yyyy - h:mm a')}</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus(); // Focus on the new window
    }, 500);
  };

  // Filter records based on search term and active tab
  const filteredRecords = medicalRecords.filter((record) => {
    const matchesSearch =
      (record.patients && record.patients.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.doctors && record.doctors.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.diagnosis && record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesTab = activeTab === 'all' || record.record_type.toLowerCase() === activeTab.toLowerCase();
    
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Medical Records</h1>
          <p className="text-muted-foreground">View and manage patient medical records</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search records by patient, doctor or diagnosis..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Records</TabsTrigger>
          <TabsTrigger value="neurology">Neurology</TabsTrigger>
          <TabsTrigger value="ophthalmology">Ophthalmology</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>All Medical Records</CardTitle>
                  <CardDescription>
                    {filteredRecords.length} records found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">Loading medical records...</p>
                    </div>
                  ) : filteredRecords.length === 0 ? (
                    <div className="text-center py-10">
                      <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold">No records found</h3>
                      <p className="text-muted-foreground">Try different search terms</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredRecords.map((record) => (
                        <Card key={record.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">{record.patients?.name}</h3>
                                  <Badge variant="outline">{record.record_type}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Dr. {record.doctors?.name} • {format(new Date(record.created_at), 'MMM dd, yyyy')}
                                </p>
                              </div>
                              <div className="flex gap-2 mt-2 sm:mt-0">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleViewRecord(record)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handlePrint(record)}
                                >
                                  <Printer className="h-4 w-4 mr-1" />
                                  Print
                                </Button>
                              </div>
                            </div>
                            <div className="px-4 py-2 bg-muted/20 border-t">
                              <div>
                                <span className="font-medium">Diagnosis:</span> {record.diagnosis || "Not specified"}
                              </div>
                              <div className="text-sm truncate">
                                <span className="font-medium">Notes:</span> {record.notes || "No notes"}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Pending Appointments</CardTitle>
                  <CardDescription>
                    Create medical records for scheduled appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {appointments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No pending appointments</p>
                  ) : (
                    <div className="space-y-3">
                      {appointments.map((appointment) => (
                        <div key={appointment.id} className="p-3 border rounded-md">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{appointment.patient}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(appointment.date), 'MMM dd')} • {appointment.time}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {appointment.doctorSpecialty} • Dr. {appointment.doctor}
                              </p>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleCreateRecord(appointment)}
                            >
                              Create
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="neurology" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Neurology Records</CardTitle>
              <CardDescription>
                Medical records from the Neurology department
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Loading neurology records...</p>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-10">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No neurology records found</h3>
                  <p className="text-muted-foreground">Try different search terms</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRecords.map((record) => (
                    <Card key={record.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{record.patients?.name}</h3>
                            <Badge variant="outline">Neurology</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Dr. {record.doctors?.name} • {format(new Date(record.created_at), 'MMM dd, yyyy')}
                          </p>
                          <div className="text-sm mb-4">
                            <p className="font-medium">Diagnosis:</p>
                            <p className="text-muted-foreground">{record.diagnosis || "Not specified"}</p>
                          </div>

                          {record.neurologyRecord && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div>
                                <p className="font-semibold">Motor Function:</p>
                                <p className="text-muted-foreground truncate">{record.neurologyRecord.motor_function || "Not recorded"}</p>
                              </div>
                              <div>
                                <p className="font-semibold">Sensory Function:</p>
                                <p className="text-muted-foreground truncate">{record.neurologyRecord.sensory_function || "Not recorded"}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex border-t">
                          <Button 
                            variant="ghost" 
                            className="flex-1 rounded-none h-10"
                            onClick={() => handleViewRecord(record)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="flex-1 rounded-none h-10 border-l"
                            onClick={() => handlePrint(record)}
                          >
                            <Printer className="h-4 w-4 mr-1" />
                            Print
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ophthalmology" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Ophthalmology Records</CardTitle>
              <CardDescription>
                Medical records from the Ophthalmology department
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Loading ophthalmology records...</p>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-10">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No ophthalmology records found</h3>
                  <p className="text-muted-foreground">Try different search terms</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRecords.map((record) => (
                    <Card key={record.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{record.patients?.name}</h3>
                            <Badge variant="outline">Ophthalmology</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Dr. {record.doctors?.name} • {format(new Date(record.created_at), 'MMM dd, yyyy')}
                          </p>
                          <div className="text-sm mb-4">
                            <p className="font-medium">Diagnosis:</p>
                            <p className="text-muted-foreground">{record.diagnosis || "Not specified"}</p>
                          </div>

                          {record.ophthalmologyRecord && (
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <p className="font-semibold">Visual Acuity (R):</p>
                                <p className="text-muted-foreground">{record.ophthalmologyRecord.visual_acuity_right || "Not recorded"}</p>
                              </div>
                              <div>
                                <p className="font-semibold">Visual Acuity (L):</p>
                                <p className="text-muted-foreground">{record.ophthalmologyRecord.visual_acuity_left || "Not recorded"}</p>
                              </div>
                              <div>
                                <p className="font-semibold">Pressure (R):</p>
                                <p className="text-muted-foreground">{record.ophthalmologyRecord.intraocular_pressure_right || "Not recorded"}</p>
                              </div>
                              <div>
                                <p className="font-semibold">Pressure (L):</p>
                                <p className="text-muted-foreground">{record.ophthalmologyRecord.intraocular_pressure_left || "Not recorded"}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex border-t">
                          <Button 
                            variant="ghost" 
                            className="flex-1 rounded-none h-10"
                            onClick={() => handleViewRecord(record)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="flex-1 rounded-none h-10 border-l"
                            onClick={() => handlePrint(record)}
                          >
                            <Printer className="h-4 w-4 mr-1" />
                            Print
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <MedicalRecordModal
        open={openModal}
        onOpenChange={setOpenModal}
        appointment={selectedAppointment}
        existingRecord={selectedRecord}
      />
    </div>
  );
};

export default MedicalRecords;

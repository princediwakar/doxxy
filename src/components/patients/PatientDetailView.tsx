import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CreditCard, Edit, Eye, FileText, History, Mail, MapPin, Phone, Pill, Stethoscope } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ConsultationWithAppointment, PatientWithConsultations, Prescription, Consultation } from "@/types/patients";
import { MedicalTimeline } from "./MedicalTimeline";

interface PatientDetailViewProps {
    patient: PatientWithConsultations;
    onEditPatient: () => void;
    onScheduleAppointment: () => void;
    onCreateBill: () => void;
    onViewConsultation: (consultation: ConsultationWithAppointment | Consultation) => void;
    onViewPrescription: (prescription: Prescription) => void;
    isLoading: boolean;
}

export const PatientDetailView = ({
    patient,
    onEditPatient,
    onScheduleAppointment,
    onCreateBill,
    onViewConsultation,
    onViewPrescription,
    isLoading
}: PatientDetailViewProps) => {
    return (
        <div className="space-y-6">
            <Card className="">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl ">{patient.name}</CardTitle>
                            <p className="text-muted-foreground">
                                {patient.gender} • Age {patient.age || 'N/A'} •
                                Medical ID: {patient.medical_id || 'Not assigned'}
                            </p>
                        </div>
                        <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={onEditPatient}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                            <Button variant="outline" size="sm" onClick={onScheduleAppointment}>
                                <Calendar className="h-4 w-4 mr-2" />
                                Schedule
                            </Button>
                            <Button variant="outline" size="sm" onClick={onCreateBill}>
                                <CreditCard className="h-4 w-4 mr-2" />
                                Bill
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {patient.phone && (
                            <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{patient.phone}</span>
                            </div>
                        )}
                        {patient.email && (
                            <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{patient.email}</span>
                            </div>
                        )}
                        {patient.address && (
                            <div className="flex items-start space-x-2 md:col-span-3">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <span className="text-sm">{patient.address}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="consultations" className="space-y-4">
                <div className="flex items-center justify-between">
                    <TabsList className="bg-muted/30">
                        <TabsTrigger
                            value="consultations"
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                            <Stethoscope className="h-4 w-4 mr-2" />
                            Consultations ({patient.consultations.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="prescriptions"
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                            <Pill className="h-4 w-4 mr-2" />
                            Prescriptions ({patient.prescriptions.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="timeline"
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                            <History className="h-4 w-4 mr-2" />
                            Timeline
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="consultations" className="space-y-4">
                    <Card className="">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 ">
                                <Stethoscope className="h-5 w-5" />
                                <span>Consultation History</span>
                                <Badge variant="default" className="status-badge status-active">{patient.consultations.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[500px]">
                                {patient.consultations.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p>No consultations found</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {patient.consultations.map((consultation) => (
                                            <Card key={consultation.id} className=" hover:transition-shadow">
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center space-x-2">
                                                                <Calendar className="h-4 w-4 text-primary" />
                                                                <span className="font-medium">
                                                                    {format(parseISO(consultation.appointment.date), 'PPP')}
                                                                </span>
                                                                <Badge variant="secondary" className="status-badge status-pending">
                                                                    {consultation.appointment.department_name || 'General'}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                {consultation.appointment.doctor_name}
                                                            </p>
                                                            {consultation.specialty_data && typeof consultation.specialty_data === 'object' &&
                                                                'chief_complaint' in consultation.specialty_data && (
                                                                    <p className="text-sm">
                                                                        <strong>Chief Complaint:</strong> {
                                                                            (consultation.specialty_data as { chief_complaint?: string }).chief_complaint
                                                                        }
                                                                    </p>
                                                                )}
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => onViewConsultation(consultation)}
                                                            >
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="prescriptions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Pill className="h-5 w-5" />
                                <span>Prescription History</span>
                                <Badge variant="default" className="status-badge status-active">{patient.prescriptions.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[500px]">
                                {patient.prescriptions.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Pill className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p>No prescriptions found</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {patient.prescriptions.map((prescription) => (
                                            <Card
                                                key={prescription.id}
                                                className=" cursor-pointer hover:shadow-md transition-shadow"
                                                onClick={() => onViewPrescription(prescription)}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-2">
                                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                                <span className="font-medium">
                                                                    {format(parseISO(prescription.created_at!), 'PPP')}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="text-sm">
                                                            <strong>Medications:</strong>
                                                            <div className="mt-1 text-muted-foreground">
                                                                {Array.isArray(prescription.medications)
                                                                    ? `${prescription.medications.length} medication(s) prescribed`
                                                                    : typeof prescription.medications === 'string'
                                                                        ? prescription.medications.substring(0, 100) + (prescription.medications.length > 100 ? '...' : '')
                                                                        : 'Medication details available'
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <History className="h-5 w-5" />
                                <span>Medical Timeline</span>
                                <Badge variant="default" className="status-badge status-active">
                                    {patient.consultations.length + patient.prescriptions.length} events
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <MedicalTimeline
                                consultations={patient.consultations}
                                prescriptions={patient.prescriptions}
                                onViewConsultation={onViewConsultation}
                                onViewPrescription={onViewPrescription}
                                loading={isLoading}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

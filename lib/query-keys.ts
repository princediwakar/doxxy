export const queryKeys = {
  appointments: {
    all: ['appointments'] as const,
    byClinic: (clinicId: string) => ['appointments', clinicId] as const,
    byPatient: (patientId: string) => ['patientAppointments', patientId] as const,
  },
  patients: {
    all: ['patients'] as const,
    byClinic: (clinicId: string) => ['patients', clinicId] as const,
    byId: (patientId: string) => ['patient', patientId] as const,
    withRecords: (clinicId: string, search: string, page: number) =>
      ['patientsWithMedicalRecords', clinicId, search, page] as const,
  },
  inventory: {
    all: ['pharmacy_inventory'] as const,
    byClinic: (clinicId: string) => ['pharmacy_inventory', clinicId] as const,
  },
  procurements: {
    all: ['pharmacy_procurements'] as const,
    byClinic: (clinicId: string) => ['pharmacy_procurements', clinicId] as const,
  },
  doctors: {
    all: ['doctors'] as const,
    byClinic: (clinicId: string) => ['doctors', clinicId] as const,
    forAppointment: (clinicId: string) => ['doctorsForAppointment', clinicId] as const,
    currentForClinic: (clinicId: string, userId: string) => ['currentDoctorDetails', clinicId, userId] as const,
    details: (doctorId: string, clinicId: string) => ['doctorDetails', doctorId, clinicId] as const,
  },
  dashboard: {
    data: (clinicId: string) => ['dashboardData', clinicId] as const,
    doctor: (clinicId: string, userId: string) => ['doctorDashboardData', clinicId, userId] as const,
    analytics: (clinicId: string, startDate: string, endDate: string) => ['clinicAnalytics', clinicId, startDate, endDate] as const,
    doctorAnalytics: (doctorId: string, startDate: string, endDate: string) => ['doctorAnalytics', doctorId, startDate, endDate] as const,
    demographics: (clinicId: string, doctorId: string | null) => ['demographics', clinicId, doctorId ?? 'all'] as const,
    providerPerformance: (clinicId: string, startDate: string, endDate: string) => ['providerPerformance', clinicId, startDate, endDate] as const,
  },
  medicines: {
    search: (query: string) => ['medicines', query] as const,
    selected: (value: string) => ['selected-medicine', value] as const,
  },
  clinics: {
    details: (clinicId: string) => ['clinic', clinicId] as const,
  },
  billing: {
    byClinic: (clinicId: string, month: string) => ['bills', clinicId, month] as const,
    stats: (clinicId: string, month: string) => ['billingStats', clinicId, month] as const,
    byPatient: (patientId: string) => ['bills', 'patient', patientId] as const,
    byAppointment: (appointmentId: string) => ['bills', 'appointment', appointmentId] as const,
    financials: (clinicId: string) => ['financials', clinicId] as const,
  },
  clinicDepartments: {
    allTypes: ['departmentTypes'] as const,
    byClinic: (clinicId: string) => ['clinicDepartmentsForClinic', clinicId] as const,
    forMembers: (clinicId: string) => ['clinicDepartments', clinicId] as const,
  },
  consultations: {
    byAppointment: (appointmentId: string) => ['consultation', appointmentId] as const,
  },
  prescriptions: {
    details: (prescriptionId: string) => ['prescriptionDetails', prescriptionId] as const,
  },
  profile: {
    user: (userId: string) => ['userProfile', userId] as const,
    doctor: (userId: string, clinicId: string) => ['doctorProfile', userId, clinicId] as const,
  },
  clinicMembers: {
    byClinic: (clinicId: string) => ['clinicMembers', clinicId] as const,
    pendingInvitations: (clinicId: string) => ['pendingInvitations', clinicId] as const,
  },
  voice: {
    transcribe: ['voice', 'transcribe'] as const,
  },
} as const;

// Path: app/(onboarding)/create-clinic/create-clinic-form.tsx
"use client";

import * as React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppState } from "@/contexts/AppStateContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { showErrorToast } from "@/lib/error-utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryDepartmentTypes } from "@/lib/queries/clinic";
import { queryKeys } from "@/lib/query-keys";
import { createClinicWithAdmin } from "@/actions/clinic";
import {
  clinicDetailsSchema,
  departmentsSchema,
  doctorProfileSchema,
  type ClinicDetailsForm,
  type DepartmentsForm,
  type DoctorProfileForm,
} from "./create-clinic-schemas";
import { ClinicDetailsStep } from "./clinic-details-step";
import { DepartmentsStep } from "./departments-step";
import { DoctorRoleStep } from "./doctor-role-step";

const StepIndicator = ({ step }: { step: 1 | 2 | 3 }) => (
  <div className="flex justify-center mb-6">
    <div className={`flex items-center space-x-2 text-sm font-medium ${step === 1 ? 'text-primary' : 'text-muted-foreground'}`}>
      1. Clinic Details
    </div>
    <div className="mx-2">→</div>
    <div className={`flex items-center space-x-2 text-sm font-medium ${step === 2 ? 'text-primary' : 'text-muted-foreground'}`}>
      2. Departments
    </div>
    <div className="mx-2">→</div>
    <div className={`flex items-center space-x-2 text-sm font-medium ${step === 3 ? 'text-primary' : 'text-muted-foreground'}`}>
      3. Your Role
    </div>
  </div>
);

export const CreateClinicForm = () => {
  const { user, setActiveClinicId } = useAppState();
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [clinicDetails, setClinicDetails] = React.useState<ClinicDetailsForm>({
    name: "",
    address: "",
    email: "",
    phone: "",
    website: "",
    google_place_id: "",
    google_place_data: undefined,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const DEFAULT_DOCTOR_PROFILE: DoctorProfileForm = {
    isDoctor: 'no',
    selectedDepartment: '',
    consultationFee: 0,
    invitedDoctorEmail: '',
  };

  const { data: departmentTypes, isLoading: isLoadingDepartmentTypes, error: departmentTypesError } = useQuery({
    queryKey: queryKeys.clinicDepartments.allTypes,
    queryFn: () => queryDepartmentTypes(),
    staleTime: 30 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 3,
  });

  const queryClient = useQueryClient();

  const detailsForm = useForm<ClinicDetailsForm>({
    resolver: zodResolver(clinicDetailsSchema),
    defaultValues: clinicDetails,
    mode: "onTouched",
  });

  const departmentsForm = useForm<DepartmentsForm>({
    resolver: zodResolver(departmentsSchema),
    defaultValues: { departments: [] },
    mode: "onTouched",
  });

  const doctorForm = useForm<DoctorProfileForm>({
    resolver: zodResolver(doctorProfileSchema),
    defaultValues: DEFAULT_DOCTOR_PROFILE,
    mode: "onTouched",
  });

  React.useEffect(() => {
    if (step !== 1) return;
    detailsForm.reset(clinicDetails);
  }, [step, clinicDetails, detailsForm]);

  React.useEffect(() => {
    if (step !== 2) return;
    departmentsForm.reset({ departments: [] });
  }, [step, departmentTypes, departmentsForm]);

  React.useEffect(() => {
    if (step !== 3) return;
    doctorForm.reset(DEFAULT_DOCTOR_PROFILE);
  }, [step, doctorForm]);

  const handleNext: SubmitHandler<ClinicDetailsForm> = (data) => {
    setClinicDetails(data);
    setStep(2);
  };

  const handleDepartmentsNext: SubmitHandler<DepartmentsForm> = () => {
    setStep(3);
  };

  const handleBackFromDepartments = () => setStep(1);
  const handleBackFromDoctor = () => setStep(2);

  const handleSubmit = async (data: DoctorProfileForm) => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      const result = await createClinicWithAdmin({
        clinicName: clinicDetails.name,
        address: clinicDetails.address,
        email: clinicDetails.email,
        phone: clinicDetails.phone,
        website: clinicDetails.website,
        googlePlaceId: clinicDetails.google_place_id || undefined,
        googlePlaceData: clinicDetails.google_place_data,
        userId: user.id,
        userPhone: user.phone,
        departments: departmentsForm.getValues('departments'),
        isDoctor: data.isDoctor === 'yes',
        selectedDepartment: data.selectedDepartment,
        consultationFee: data.consultationFee,
        invitedDoctorEmail: data.invitedDoctorEmail,
        userName: user.user_metadata?.name,
        userEmail: user.email,
      });

      if ('error' in result && result.error) {
        toast.error(result.error);
        return;
      }

      if ('clinicId' in result && result.clinicId) {
        setActiveClinicId(result.clinicId);
      }

      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      queryClient.invalidateQueries({ queryKey: ['doctorDashboardData'] });

      toast.success(`Clinic "${clinicDetails.name}" created successfully.`);
      router.replace("/schedule");
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-md medical-card p-6 border-4 border-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-2 text-center text-foreground">Create New Clinic</h1>
        <div className="text-center mb-2">
          <Link href="/help/superadmin" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">
            Need help? Read our guide
          </Link>
        </div>
        <StepIndicator step={step} />

        {step === 1 && (
          <ClinicDetailsStep form={detailsForm} onSubmit={handleNext} />
        )}

        {step === 2 && (
          <DepartmentsStep
            form={departmentsForm}
            departmentTypes={departmentTypes}
            isLoading={isLoadingDepartmentTypes}
            hasError={!!departmentTypesError}
            onSubmit={handleDepartmentsNext}
            onBack={handleBackFromDepartments}
          />
        )}

        {step === 3 && (
          <DoctorRoleStep
            form={doctorForm}
            departmentTypes={departmentTypes}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onBack={handleBackFromDoctor}
          />
        )}
      </div>
    </div>
  );
};

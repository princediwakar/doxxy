export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          clinic_id: string
          created_at: string | null
          date: string
          doctor_id: string
          id: string
          notes: string | null
          patient_id: string
          status: Database["public"]["Enums"]["appointment_status"] | null
          time: string
          type: Database["public"]["Enums"]["appointment_type"] | null
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          date: string
          doctor_id: string
          id?: string
          notes?: string | null
          patient_id: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          time: string
          type?: Database["public"]["Enums"]["appointment_type"] | null
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          date?: string
          doctor_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          time?: string
          type?: Database["public"]["Enums"]["appointment_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      bills: {
        Row: {
          amount: number
          appointment_id: string | null
          billing_type: string | null
          clinic_id: string
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          id: string
          invoice_number: string | null
          items: Json | null
          notes: string | null
          patient_id: string
          service_items: Json | null
          status: Database["public"]["Enums"]["bill_status"] | null
          tax_percentage: number | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          billing_type?: string | null
          clinic_id: string
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          invoice_number?: string | null
          items?: Json | null
          notes?: string | null
          patient_id: string
          service_items?: Json | null
          status?: Database["public"]["Enums"]["bill_status"] | null
          tax_percentage?: number | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          billing_type?: string | null
          clinic_id?: string
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          invoice_number?: string | null
          items?: Json | null
          notes?: string | null
          patient_id?: string
          service_items?: Json | null
          status?: Database["public"]["Enums"]["bill_status"] | null
          tax_percentage?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bills_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_departments: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          department_type_id: string | null
          id: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          department_type_id?: string | null
          id?: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          department_type_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_departments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_departments_department_type_id_fkey"
            columns: ["department_type_id"]
            isOneToOne: false
            referencedRelation: "department_types"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_members: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          department_id: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          department_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          department_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_members_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_members_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "clinic_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinics_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          appointment_id: string | null
          clinic_id: string
          clinical_notes: Json | null
          created_at: string | null
          doctor_id: string | null
          id: string
          patient_id: string
          specialty_data: Json | null
        }
        Insert: {
          appointment_id?: string | null
          clinic_id: string
          clinical_notes?: Json | null
          created_at?: string | null
          doctor_id?: string | null
          id?: string
          patient_id: string
          specialty_data?: Json | null
        }
        Update: {
          appointment_id?: string | null
          clinic_id?: string
          clinical_notes?: Json | null
          created_at?: string | null
          doctor_id?: string | null
          id?: string
          patient_id?: string
          specialty_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      department_types: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      doctors: {
        Row: {
          additional_qualifications: string | null
          availability: string | null
          bio: string | null
          board_certifications: string[] | null
          clinic_id: string | null
          clinic_timings: Json | null
          consultation_fee: number | null
          created_at: string | null
          email: string | null
          fellowship_details: string | null
          graduation_year: number | null
          id: string
          is_active: boolean | null
          languages_spoken: string[] | null
          medical_college: string | null
          medical_council: string | null
          medical_degree: string | null
          medical_license_expiry: string | null
          medical_license_state: string | null
          medical_qualifications: string[] | null
          medical_registration_number: string | null
          medical_specializations: string[] | null
          medical_university: string | null
          name: string
          pg_completion_year: number | null
          pg_institution: string | null
          pg_specialization: string | null
          phone: string | null
          postgraduate_degree: string | null
          practice_timings: Json | null
          primary_specialization: string | null
          professional_summary: string | null
          profile_completion_percentage: number | null
          research_experience: string | null
          subspecialty: string[] | null
          user_id: string | null
          years_of_experience: number | null
        }
        Insert: {
          additional_qualifications?: string | null
          availability?: string | null
          bio?: string | null
          board_certifications?: string[] | null
          clinic_id?: string | null
          clinic_timings?: Json | null
          consultation_fee?: number | null
          created_at?: string | null
          email?: string | null
          fellowship_details?: string | null
          graduation_year?: number | null
          id?: string
          is_active?: boolean | null
          languages_spoken?: string[] | null
          medical_college?: string | null
          medical_council?: string | null
          medical_degree?: string | null
          medical_license_expiry?: string | null
          medical_license_state?: string | null
          medical_qualifications?: string[] | null
          medical_registration_number?: string | null
          medical_specializations?: string[] | null
          medical_university?: string | null
          name: string
          pg_completion_year?: number | null
          pg_institution?: string | null
          pg_specialization?: string | null
          phone?: string | null
          postgraduate_degree?: string | null
          practice_timings?: Json | null
          primary_specialization?: string | null
          professional_summary?: string | null
          profile_completion_percentage?: number | null
          research_experience?: string | null
          subspecialty?: string[] | null
          user_id?: string | null
          years_of_experience?: number | null
        }
        Update: {
          additional_qualifications?: string | null
          availability?: string | null
          bio?: string | null
          board_certifications?: string[] | null
          clinic_id?: string | null
          clinic_timings?: Json | null
          consultation_fee?: number | null
          created_at?: string | null
          email?: string | null
          fellowship_details?: string | null
          graduation_year?: number | null
          id?: string
          is_active?: boolean | null
          languages_spoken?: string[] | null
          medical_college?: string | null
          medical_council?: string | null
          medical_degree?: string | null
          medical_license_expiry?: string | null
          medical_license_state?: string | null
          medical_qualifications?: string[] | null
          medical_registration_number?: string | null
          medical_specializations?: string[] | null
          medical_university?: string | null
          name?: string
          pg_completion_year?: number | null
          pg_institution?: string | null
          pg_specialization?: string | null
          phone?: string | null
          postgraduate_degree?: string | null
          practice_timings?: Json | null
          primary_specialization?: string | null
          professional_summary?: string | null
          profile_completion_percentage?: number | null
          research_experience?: string | null
          subspecialty?: string[] | null
          user_id?: string | null
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medicines: {
        Row: {
          created_at: string | null
          id: number
          is_discontinued: boolean | null
          manufacturer_name: string | null
          name: string
          pack_size_label: string | null
          pack_type: string | null
          price: number | null
          short_composition1: string | null
          short_composition2: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          is_discontinued?: boolean | null
          manufacturer_name?: string | null
          name: string
          pack_size_label?: string | null
          pack_type?: string | null
          price?: number | null
          short_composition1?: string | null
          short_composition2?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          is_discontinued?: boolean | null
          manufacturer_name?: string | null
          name?: string
          pack_size_label?: string | null
          pack_type?: string | null
          price?: number | null
          short_composition1?: string | null
          short_composition2?: string | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          clinic_id: string
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          gender: string | null
          id: string
          medical_id: string | null
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          clinic_id: string
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          medical_id?: string | null
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          clinic_id?: string
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          medical_id?: string | null
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          appointment_id: string | null
          clinic_id: string
          consultation_id: string | null
          created_at: string | null
          doctor_id: string
          id: string
          medications: Json | null
          patient_id: string
        }
        Insert: {
          appointment_id?: string | null
          clinic_id: string
          consultation_id?: string | null
          created_at?: string | null
          doctor_id: string
          id?: string
          medications?: Json | null
          patient_id: string
        }
        Update: {
          appointment_id?: string | null
          clinic_id?: string
          consultation_id?: string | null
          created_at?: string | null
          doctor_id?: string
          id?: string
          medications?: Json | null
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_clinic_with_admin: {
        Args: { clinic_name: string; user_phone?: string }
        Returns: Json
      }
      create_doctor_profile: {
        Args:
          | {
              p_user_id: string
              p_clinic_id: string
              p_name: string
              p_email?: string
              p_primary_specialization?: string
              p_consultation_fee?: number
              p_availability?: string
              p_bio?: string
            }
          | {
              p_user_id: string
              p_clinic_id: string
              p_name: string
              p_email?: string
              p_primary_specialization?: string
              p_consultation_fee?: number
              p_availability?: string
              p_bio?: string
              p_department_id?: string
            }
        Returns: string
      }
      get_appointments_with_details_by_clinic: {
        Args: { clinic_id: string }
        Returns: {
          id: string
          patient_id: string
          doctor_id: string
          date: string
          time: string
          type: Database["public"]["Enums"]["appointment_type"]
          status: Database["public"]["Enums"]["appointment_status"]
          notes: string
          created_at: string
          patient_name: string
          doctor_name: string
          department_name: string
          billing_status: string
        }[]
      }
      get_bills_by_clinic: {
        Args: { clinic_id: string }
        Returns: {
          id: string
          patient_id: string
          patient_name: string
          appointment_id: string
          amount: number
          status: string
          invoice_number: string
          due_date: string
          created_at: string
          updated_at: string
        }[]
      }
      get_consultation_by_appointment: {
        Args: { p_appointment_id: string }
        Returns: {
          id: string
          appointment_id: string
          chief_complaint: string
          history_present_illness: string
          physical_examination: string
          assessment_diagnosis: string
          plan_treatment: string
          prescriptions: Json
          notes: string
          created_at: string
          updated_at: string
        }[]
      }
      get_dashboard_data: {
        Args: { _clinic_id: string }
        Returns: {
          total_patients: number
          total_doctors: number
          total_appointments: number
          appointments_today: number
          pending_consultations: number
          completed_consultations: number
          all_relevant_appointments: Json
        }[]
      }
      get_doctor_dashboard_data: {
        Args: { _clinic_id: string; _user_id: string }
        Returns: {
          total_patients: number
          total_appointments: number
          pending_consultations: number
          completed_consultations: number
          upcoming_appointments: Json
          my_patients: Json
        }[]
      }
      get_doctors_by_clinic: {
        Args: { clinic_id: string }
        Returns: {
          id: string
          user_id: string
          name: string
          email: string
          phone: string
          bio: string
          created_at: string
          role: string
          department_name: string
          department_id: string
          is_active: boolean
          primary_specialization: string
          medical_specializations: string[]
          years_of_experience: number
          consultation_fee: number
          languages_spoken: string[]
          practice_timings: Json
          professional_summary: string
          medical_registration_number: string
          medical_qualifications: string[]
          medical_council: string
          medical_license_state: string
          medical_license_expiry: string
          subspecialty: string[]
          board_certifications: string[]
          fellowship_details: string
          medical_college: string
          graduation_year: number
          clinic_timings: Json
        }[]
      }
      get_patients_by_clinic: {
        Args: { _clinic_id: string; _limit?: number; _offset?: number }
        Returns: {
          id: string
          name: string
          phone: string
          email: string
          medical_id: string
          gender: string
          address: string
          date_of_birth: string
          created_at: string
          clinic_id: string
        }[]
      }
      get_user_clinic_memberships: {
        Args: { user_id: string }
        Returns: {
          clinic_id: string
          clinic_name: string
          role: Database["public"]["Enums"]["user_role"]
          joined_at: string
        }[]
      }
      get_user_clinics: {
        Args: Record<PropertyKey, never>
        Returns: {
          clinic_id: string
        }[]
      }
      search_medicines: {
        Args: { search_term?: string; limit_count?: number }
        Returns: {
          id: number
          name: string
          price: number
          is_discontinued: boolean
          manufacturer_name: string
          pack_size_label: string
          pack_type: string
          short_composition1: string
          short_composition2: string
          created_at: string
        }[]
      }
    }
    Enums: {
      appointment_status:
        | "Scheduled"
        | "In Progress"
        | "Completed"
        | "Cancelled"
      appointment_type: "Walk-in" | "Digital"
      bill_status: "Paid" | "Pending" | "Overdue"
      user_role: "staff" | "doctor" | "superadmin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      appointment_status: [
        "Scheduled",
        "In Progress",
        "Completed",
        "Cancelled",
      ],
      appointment_type: ["Walk-in", "Digital"],
      bill_status: ["Paid", "Pending", "Overdue"],
      user_role: ["staff", "doctor", "superadmin"],
    },
  },
} as const

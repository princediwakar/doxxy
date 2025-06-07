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
          status: Database["public"]["Enums"]["appointment_status"]
          time: string
          type: Database["public"]["Enums"]["appointment_type"]
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          date: string
          doctor_id: string
          id?: string
          notes?: string | null
          patient_id: string
          status: Database["public"]["Enums"]["appointment_status"]
          time: string
          type: Database["public"]["Enums"]["appointment_type"]
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          date?: string
          doctor_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          time?: string
          type?: Database["public"]["Enums"]["appointment_type"]
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
          clinic_id: string
          created_at: string | null
          description: string | null
          id: string
          invoice_number: string | null
          patient_id: string
          status: Database["public"]["Enums"]["bill_status"]
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          clinic_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          invoice_number?: string | null
          patient_id: string
          status?: Database["public"]["Enums"]["bill_status"]
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          clinic_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          invoice_number?: string | null
          patient_id?: string
          status?: Database["public"]["Enums"]["bill_status"]
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
          clinic_id: string
          created_at: string | null
          department_type_id: string
          id: string
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          department_type_id: string
          id?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          department_type_id?: string
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
          clinic_id: string
          created_at: string | null
          department_id: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          department_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          department_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
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
        ]
      }
      clinics: {
        Row: {
          address: string | null
          created_at: string | null
          created_by: string
          email: string | null
          id: string
          name: string
          phone: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          created_by: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          created_by?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          website?: string | null
        }
        Relationships: []
      }
      consultations: {
        Row: {
          appointment_id: string | null
          clinic_id: string
          clinical_notes: Json | null
          created_at: string | null
          doctor_id: string
          id: string
          patient_id: string
          specialty_data: Json | null
        }
        Insert: {
          appointment_id?: string | null
          clinic_id: string
          clinical_notes?: Json | null
          created_at?: string | null
          doctor_id: string
          id?: string
          patient_id: string
          specialty_data?: Json | null
        }
        Update: {
          appointment_id?: string | null
          clinic_id?: string
          clinical_notes?: Json | null
          created_at?: string | null
          doctor_id?: string
          id?: string
          patient_id?: string
          specialty_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
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
          availability: string | null
          bio: string | null
          clinic_id: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          user_id: string | null
        }
        Insert: {
          availability?: string | null
          bio?: string | null
          clinic_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          user_id?: string | null
        }
        Update: {
          availability?: string | null
          bio?: string | null
          clinic_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          chief_complaint: string | null
          clinic_id: string
          created_at: string | null
          diagnosis: string | null
          id: string
          notes: string | null
          patient_id: string
          symptoms: string | null
          treatment_plan: string | null
        }
        Insert: {
          chief_complaint?: string | null
          clinic_id: string
          created_at?: string | null
          diagnosis?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          symptoms?: string | null
          treatment_plan?: string | null
        }
        Update: {
          chief_complaint?: string | null
          clinic_id?: string
          created_at?: string | null
          diagnosis?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          symptoms?: string | null
          treatment_plan?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
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
          clinic_id: string
          consultation_id: string | null
          created_at: string | null
          doctor_id: string
          follow_up_date: string | null
          id: string
          instructions: string | null
          medical_record_id: string | null
          medications: Json
          patient_id: string
        }
        Insert: {
          clinic_id: string
          consultation_id?: string | null
          created_at?: string | null
          doctor_id: string
          follow_up_date?: string | null
          id?: string
          instructions?: string | null
          medical_record_id?: string | null
          medications: Json
          patient_id: string
        }
        Update: {
          clinic_id?: string
          consultation_id?: string | null
          created_at?: string | null
          doctor_id?: string
          follow_up_date?: string | null
          id?: string
          instructions?: string | null
          medical_record_id?: string | null
          medications?: Json
          patient_id?: string
        }
        Relationships: [
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
            foreignKeyName: "prescriptions_medical_record_id_fkey"
            columns: ["medical_record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
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
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_clinic_member: {
        Args: {
          new_user_id: string
          target_clinic_id: string
          new_role: Database["public"]["Enums"]["user_role"]
          new_department_id?: string
        }
        Returns: undefined
      }
      create_clinic_with_admin: {
        Args: { clinic_name: string; user_phone?: string }
        Returns: {
          clinic_id: string
          membership_id: string
        }[]
      }
      debug_clinic_creation: {
        Args: { user_uuid: string }
        Returns: {
          can_create_clinic: boolean
          auth_uid_value: string
          user_exists: boolean
        }[]
      }
      get_appointments_with_details_by_clinic: {
        Args: { clinic_id: string }
        Returns: {
          id: string
          patient_id: string
          doctor_id: string
          date: string
          time: string
          type: string
          status: string
          notes: string
          created_at: string
          patient_name: string
          doctor_name: string
          department_name: string
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
          availability: string
          bio: string
          created_at: string
          role: string
          department_name: string
          department_id: string
          is_active: boolean
        }[]
      }
      get_patients_by_clinic: {
        Args: { _clinic_id: string; _limit?: number; _offset?: number }
        Returns: {
          id: string
          clinic_id: string
          created_at: string
          date_of_birth: string
          email: string
          gender: string
          medical_id: string
          name: string
          phone: string
          address: string
        }[]
      }
      get_patients_by_doctor: {
        Args: {
          _clinic_id: string
          _doctor_user_id: string
          _limit?: number
          _offset?: number
        }
        Returns: {
          id: string
          clinic_id: string
          created_at: string
          date_of_birth: string
          email: string
          gender: string
          medical_id: string
          name: string
          phone: string
          address: string
        }[]
      }
      get_user_clinic_memberships: {
        Args: { user_id: string }
        Returns: {
          membership_id: string
          clinic_id: string
          role: Database["public"]["Enums"]["user_role"]
          department_id: string
          clinic_name: string
          clinic_created_by: string
        }[]
      }
      repair_clinic_relationships: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      set_auth_uid: {
        Args: { uid: string }
        Returns: undefined
      }
      update_clinic_member_details: {
        Args: {
          member_user_id: string
          target_clinic_id: string
          updated_role?: Database["public"]["Enums"]["user_role"]
          updated_department_id?: string
        }
        Returns: undefined
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

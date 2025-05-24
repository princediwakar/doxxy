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
          created_at: string | null
          date: string
          department: Database["public"]["Enums"]["department_type"]
          doctor_id: string
          id: string
          notes: string | null
          patient_id: string
          status: Database["public"]["Enums"]["appointment_status"]
          time: string
          type: Database["public"]["Enums"]["appointment_type"]
        }
        Insert: {
          created_at?: string | null
          date: string
          department: Database["public"]["Enums"]["department_type"]
          doctor_id: string
          id?: string
          notes?: string | null
          patient_id: string
          status?: Database["public"]["Enums"]["appointment_status"]
          time: string
          type?: Database["public"]["Enums"]["appointment_type"]
        }
        Update: {
          created_at?: string | null
          date?: string
          department?: Database["public"]["Enums"]["department_type"]
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
          consultation_id: string
          created_at: string | null
          id: string
          invoice_number: string | null
          patient_id: string
          status: Database["public"]["Enums"]["bill_status"]
        }
        Insert: {
          amount: number
          consultation_id: string
          created_at?: string | null
          id?: string
          invoice_number?: string | null
          patient_id: string
          status?: Database["public"]["Enums"]["bill_status"]
        }
        Update: {
          amount?: number
          consultation_id?: string
          created_at?: string | null
          id?: string
          invoice_number?: string | null
          patient_id?: string
          status?: Database["public"]["Enums"]["bill_status"]
        }
        Relationships: [
          {
            foreignKeyName: "bills_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
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
      consultations: {
        Row: {
          appointment_id: string
          clinical_notes: Json
          created_at: string | null
          department: Database["public"]["Enums"]["department_type"]
          doctor_id: string
          id: string
          patient_id: string
        }
        Insert: {
          appointment_id: string
          clinical_notes?: Json
          created_at?: string | null
          department: Database["public"]["Enums"]["department_type"]
          doctor_id: string
          id?: string
          patient_id: string
        }
        Update: {
          appointment_id?: string
          clinical_notes?: Json
          created_at?: string | null
          department?: Database["public"]["Enums"]["department_type"]
          doctor_id?: string
          id?: string
          patient_id?: string
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
      doctors: {
        Row: {
          availability: string | null
          bio: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          specialization: Database["public"]["Enums"]["department_type"]
        }
        Insert: {
          availability?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          id: string
          name: string
          phone?: string | null
          specialization: Database["public"]["Enums"]["department_type"]
        }
        Update: {
          availability?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          specialization?: Database["public"]["Enums"]["department_type"]
        }
        Relationships: [
          {
            foreignKeyName: "doctors_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          appointment_id: string
          chief_complaint: string | null
          created_at: string | null
          diagnosis: string | null
          doctor_id: string
          id: string
          notes: string | null
          patient_id: string
          record_type: string
          symptoms: string | null
          treatment_plan: string | null
        }
        Insert: {
          appointment_id: string
          chief_complaint?: string | null
          created_at?: string | null
          diagnosis?: string | null
          doctor_id: string
          id?: string
          notes?: string | null
          patient_id: string
          record_type: string
          symptoms?: string | null
          treatment_plan?: string | null
        }
        Update: {
          appointment_id?: string
          chief_complaint?: string | null
          created_at?: string | null
          diagnosis?: string | null
          doctor_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
          record_type?: string
          symptoms?: string | null
          treatment_plan?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
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
      neurology_records: {
        Row: {
          cognitive_assessment: string | null
          coordination: string | null
          created_at: string | null
          id: string
          medical_record_id: string
          motor_function: string | null
          neurological_exam: string | null
          reflexes: string | null
          scan_results: string | null
          sensory_function: string | null
        }
        Insert: {
          cognitive_assessment?: string | null
          coordination?: string | null
          created_at?: string | null
          id?: string
          medical_record_id: string
          motor_function?: string | null
          neurological_exam?: string | null
          reflexes?: string | null
          scan_results?: string | null
          sensory_function?: string | null
        }
        Update: {
          cognitive_assessment?: string | null
          coordination?: string | null
          created_at?: string | null
          id?: string
          medical_record_id?: string
          motor_function?: string | null
          neurological_exam?: string | null
          reflexes?: string | null
          scan_results?: string | null
          sensory_function?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "neurology_records_medical_record_id_fkey"
            columns: ["medical_record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
        ]
      }
      ophthalmology_records: {
        Row: {
          color_vision: string | null
          created_at: string | null
          eye_examination: string | null
          fundoscopy: string | null
          id: string
          intraocular_pressure_left: string | null
          intraocular_pressure_right: string | null
          medical_record_id: string
          peripheral_vision: string | null
          visual_acuity_left: string | null
          visual_acuity_right: string | null
        }
        Insert: {
          color_vision?: string | null
          created_at?: string | null
          eye_examination?: string | null
          fundoscopy?: string | null
          id?: string
          intraocular_pressure_left?: string | null
          intraocular_pressure_right?: string | null
          medical_record_id: string
          peripheral_vision?: string | null
          visual_acuity_left?: string | null
          visual_acuity_right?: string | null
        }
        Update: {
          color_vision?: string | null
          created_at?: string | null
          eye_examination?: string | null
          fundoscopy?: string | null
          id?: string
          intraocular_pressure_left?: string | null
          intraocular_pressure_right?: string | null
          medical_record_id?: string
          peripheral_vision?: string | null
          visual_acuity_left?: string | null
          visual_acuity_right?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ophthalmology_records_medical_record_id_fkey"
            columns: ["medical_record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
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
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          medical_id?: string | null
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          consultation_id: string
          created_at: string | null
          doctor_id: string | null
          follow_up_date: string | null
          id: string
          instructions: string | null
          medications: Json
          patient_id: string
        }
        Insert: {
          consultation_id: string
          created_at?: string | null
          doctor_id?: string | null
          follow_up_date?: string | null
          id?: string
          instructions?: string | null
          medications?: Json
          patient_id: string
        }
        Update: {
          consultation_id?: string
          created_at?: string | null
          doctor_id?: string | null
          follow_up_date?: string | null
          id?: string
          instructions?: string | null
          medications?: Json
          patient_id?: string
        }
        Relationships: [
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
          avatar_url: string | null
          created_at: string | null
          department: Database["public"]["Enums"]["department_type"] | null
          email: string
          id: string
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: Database["public"]["Enums"]["department_type"] | null
          email: string
          id: string
          name: string
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: Database["public"]["Enums"]["department_type"] | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      appointment_status:
        | "Scheduled"
        | "In Progress"
        | "Completed"
        | "Cancelled"
      appointment_type: "Walk-in" | "Digital"
      bill_status: "Paid" | "Pending" | "Overdue"
      department_type: "Neurology" | "Ophthalmology"
      user_role: "admin" | "doctor"
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
      department_type: ["Neurology", "Ophthalmology"],
      user_role: ["admin", "doctor"],
    },
  },
} as const

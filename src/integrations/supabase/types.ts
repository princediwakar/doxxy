export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      appointment_billing: {
        Row: {
          amount: number
          appointment_id: string
          billing_type: string
          clinic_id: string
          created_at: string | null
          credits_used: number | null
          id: string
          monthly_billing_cycle_id: string | null
        }
        Insert: {
          amount?: number
          appointment_id: string
          billing_type: string
          clinic_id: string
          created_at?: string | null
          credits_used?: number | null
          id?: string
          monthly_billing_cycle_id?: string | null
        }
        Update: {
          amount?: number
          appointment_id?: string
          billing_type?: string
          clinic_id?: string
          created_at?: string | null
          credits_used?: number | null
          id?: string
          monthly_billing_cycle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_billing_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_billing_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_billing_monthly_billing_cycle_id_fkey"
            columns: ["monthly_billing_cycle_id"]
            isOneToOne: false
            referencedRelation: "monthly_billing_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
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
          invoice_number: string
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
          invoice_number: string
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
          invoice_number?: string
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
      clinic_credits: {
        Row: {
          clinic_id: string
          created_at: string | null
          credit_balance: number
          id: string
          total_credits_purchased: number
          total_credits_used: number
          updated_at: string | null
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          credit_balance?: number
          id?: string
          total_credits_purchased?: number
          total_credits_used?: number
          updated_at?: string | null
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          credit_balance?: number
          id?: string
          total_credits_purchased?: number
          total_credits_used?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_credits_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: true
            referencedRelation: "clinics"
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
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          department_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          department_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
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
          accreditations: string[] | null
          address: string | null
          clinic_images: string[] | null
          created_at: string | null
          created_by: string | null
          description: string | null
          email: string | null
          established_year: number | null
          id: string
          is_public: boolean | null
          license_number: string | null
          name: string
          operating_hours: Json | null
          phone: string | null
          slug: string | null
          social_media: Json | null
          website: string | null
        }
        Insert: {
          accreditations?: string[] | null
          address?: string | null
          clinic_images?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          email?: string | null
          established_year?: number | null
          id?: string
          is_public?: boolean | null
          license_number?: string | null
          name: string
          operating_hours?: Json | null
          phone?: string | null
          slug?: string | null
          social_media?: Json | null
          website?: string | null
        }
        Update: {
          accreditations?: string[] | null
          address?: string | null
          clinic_images?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          email?: string | null
          established_year?: number | null
          id?: string
          is_public?: boolean | null
          license_number?: string | null
          name?: string
          operating_hours?: Json | null
          phone?: string | null
          slug?: string | null
          social_media?: Json | null
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
      contact_messages: {
        Row: {
          city: string | null
          company: string | null
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          phone: string | null
        }
        Insert: {
          city?: string | null
          company?: string | null
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
        }
        Update: {
          city?: string | null
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
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
          clinic_id: string
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
          updated_at: string | null
          user_id: string
          years_of_experience: number | null
        }
        Insert: {
          additional_qualifications?: string | null
          availability?: string | null
          bio?: string | null
          board_certifications?: string[] | null
          clinic_id: string
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
          updated_at?: string | null
          user_id: string
          years_of_experience?: number | null
        }
        Update: {
          additional_qualifications?: string | null
          availability?: string | null
          bio?: string | null
          board_certifications?: string[] | null
          clinic_id?: string
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
          updated_at?: string | null
          user_id?: string
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
      monthly_billing_cycles: {
        Row: {
          appointments_count: number
          billing_month: string
          clinic_id: string
          created_at: string | null
          due_date: string
          id: string
          payment_status: string
          payment_transaction_id: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          appointments_count?: number
          billing_month: string
          clinic_id: string
          created_at?: string | null
          due_date: string
          id?: string
          payment_status?: string
          payment_transaction_id?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          appointments_count?: number
          billing_month?: string
          clinic_id?: string
          created_at?: string | null
          due_date?: string
          id?: string
          payment_status?: string
          payment_transaction_id?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_billing_cycles_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_billing_cycles_payment_transaction_id_fkey"
            columns: ["payment_transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
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
      payment_transactions: {
        Row: {
          amount: number
          clinic_id: string
          created_at: string | null
          credits_purchased: number | null
          currency: string
          id: string
          metadata: Json | null
          payment_method: string | null
          payment_status: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          transaction_type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          clinic_id: string
          created_at?: string | null
          credits_purchased?: number | null
          currency?: string
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          transaction_type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          clinic_id?: string
          created_at?: string | null
          credits_purchased?: number | null
          currency?: string
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          transaction_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_clinic_id_fkey"
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
      add_clinic_credits: {
        Args:
          | {
              clinic_id_param: string
              credits_to_add: number
              transaction_id_param?: string
            }
          | {
              p_clinic_id: string
              p_credits: number
              p_payment_id?: string
              p_order_id?: string
            }
        Returns: boolean
      }
      add_clinic_member: {
        Args: {
          new_user_id: string
          target_clinic_id: string
          new_role: Database["public"]["Enums"]["user_role"]
          new_department_id: string
        }
        Returns: Json
      }
      create_clinic_with_admin: {
        Args: { clinic_name: string; user_phone?: string }
        Returns: Json
      }
      create_consultation: {
        Args: {
          p_patient_id: string
          p_appointment_id: string
          p_chief_complaint: string
          p_history_present_illness: string
          p_physical_examination: string
          p_assessment_diagnosis: string
          p_plan_treatment: string
          p_prescriptions?: Json
          p_notes?: string
        }
        Returns: string
      }
      create_doctor_profile: {
        Args: {
          p_user_id: string
          p_clinic_id: string
          p_name: string
          p_email: string
          p_primary_specialization?: string
          p_consultation_fee?: number
          p_availability?: Json
          p_bio?: string
          p_department_id?: string
        }
        Returns: string
      }
      create_patient: {
        Args: {
          p_clinic_id: string
          p_name: string
          p_phone: string
          p_email: string
          p_medical_id: string
          p_gender: string
          p_address: string
          p_date_of_birth: string
        }
        Returns: string
      }
      deduct_appointment_credit: {
        Args: {
          appointment_id_param: string
          clinic_id_param: string
          credits_to_deduct?: number
        }
        Returns: boolean
      }
      delete_consultation: {
        Args: { p_consultation_id: string }
        Returns: boolean
      }
      delete_patient: {
        Args: { p_patient_id: string }
        Returns: boolean
      }
      generate_clinic_slug: {
        Args: { clinic_name: string; clinic_id?: string }
        Returns: string
      }
      generate_invoice_number: {
        Args: { clinic_id_arg: string }
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
      get_clinic_billing_summary: {
        Args: { clinic_id_param: string }
        Returns: {
          credit_balance: number
          total_credits_purchased: number
          total_credits_used: number
          current_month_appointments: number
          current_month_amount: number
          pending_payments: number
        }[]
      }
      get_clinic_credit_balance: {
        Args: { clinic_id_param: string }
        Returns: number
      }
      get_clinic_members: {
        Args: { p_clinic_id: string }
        Returns: {
          id: string
          user_id: string
          clinic_id: string
          role: Database["public"]["Enums"]["user_role"]
          department_id: string
          created_at: string
          profile: Json
          department: Json
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
      get_consultation_details: {
        Args: { p_consultation_id: string }
        Returns: {
          id: string
          patient_id: string
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
          patient_details: Json
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
          name: string
          department_name: string
        }[]
      }
      get_patient_details: {
        Args: { p_patient_id: string }
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
          consultations: Json
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
      get_profile: {
        Args: { user_id: string }
        Returns: {
          id: string
          email: string
          name: string
          phone: string
          created_at: string
          updated_at: string
        }[]
      }
      get_profile_details: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          name: string
          email: string
          phone: string
          address: string
          medical_license_number: string
          medical_license_expiry: string
          specialization: string
          qualifications: string
          avatar_url: string
          created_at: string
          updated_at: string
          clinics: Json
        }[]
      }
      get_profile_image_url: {
        Args: { p_user_id: string }
        Returns: string
      }
      get_public_clinic_by_slug: {
        Args: { p_slug: string }
        Returns: {
          id: string
          name: string
          slug: string
          description: string
          address: string
          phone: string
          email: string
          website: string
          operating_hours: Json
          social_media: Json
          clinic_images: string[]
          established_year: number
          license_number: string
          accreditations: string[]
          is_public: boolean
        }[]
      }
      get_public_clinics: {
        Args: { search_term?: string; limit_count?: number }
        Returns: {
          id: string
          name: string
          slug: string
          description: string
          address: string
          phone: string
          email: string
          website: string
          operating_hours: Json
          social_media: Json
          clinic_images: string[]
          established_year: number
          license_number: string
          accreditations: string[]
          is_public: boolean
          doctor_count: number
        }[]
      }
      get_public_doctors_by_clinic: {
        Args: { p_clinic_id: string }
        Returns: {
          id: string
          name: string
          primary_specialization: string
          medical_specializations: string[]
          years_of_experience: number
          bio: string
          consultation_fee: number
          languages_spoken: string[]
          medical_qualifications: string[]
          department_name: string
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
      get_user_clinics_simple: {
        Args: Record<PropertyKey, never>
        Returns: {
          clinic_id: string
        }[]
      }
      invite_and_add_member: {
        Args: {
          p_email: string
          p_name: string
          p_clinic_id: string
          p_role: Database["public"]["Enums"]["user_role"]
          p_phone?: string
          p_department_id?: string
          p_availability?: string
          p_bio?: string
        }
        Returns: Json
      }
      is_superadmin_in_clinic: {
        Args: { check_clinic_id: string }
        Returns: boolean
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
      submit_contact_form: {
        Args: {
          name: string
          email: string
          message: string
          phone?: string
          company?: string
          city?: string
        }
        Returns: string
      }
      update_clinic_member_details: {
        Args: {
          member_user_id: string
          target_clinic_id: string
          updated_role: Database["public"]["Enums"]["user_role"]
          updated_department_id?: string
        }
        Returns: undefined
      }
      update_consultation: {
        Args: {
          p_consultation_id: string
          p_chief_complaint?: string
          p_history_present_illness?: string
          p_physical_examination?: string
          p_assessment_diagnosis?: string
          p_plan_treatment?: string
          p_prescriptions?: Json
          p_notes?: string
        }
        Returns: string
      }
      update_patient: {
        Args: {
          p_patient_id: string
          p_name?: string
          p_phone?: string
          p_email?: string
          p_medical_id?: string
          p_gender?: string
          p_address?: string
          p_date_of_birth?: string
        }
        Returns: string
      }
      update_profile: {
        Args: {
          p_user_id: string
          p_name: string
          p_email: string
          p_phone: string
        }
        Returns: {
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          phone: string | null
          updated_at: string | null
        }
      }
      update_profile_image: {
        Args: { p_user_id: string; p_avatar_url: string }
        Returns: {
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          phone: string | null
          updated_at: string | null
        }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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

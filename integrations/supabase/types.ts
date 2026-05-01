export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
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
          role?: Database["public"]["Enums"]["user_role"]
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
          {
            foreignKeyName: "fk_clinic_members_profiles"
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
          {
            foreignKeyName: "fk_doctors_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          batch_number: string
          clinic_id: string
          created_at: string
          current_stock: number
          expiry_date: string
          id: string
          medicine_id: number
          reorder_level: number
          mrp: number
          unit_cost_price: number
          updated_at: string
        }
        Insert: {
          batch_number: string
          clinic_id: string
          created_at?: string
          current_stock?: number
          expiry_date: string
          id?: string
medicine_id: number
          reorder_level?: number
          mrp?: number
          unit_cost_price?: number
          updated_at?: string
        }
        Update: {
          batch_number?: string
          clinic_id?: string
          created_at?: string
          current_stock?: number
          expiry_date?: string
          id?: string
          medicine_id?: number
          reorder_level?: number
          selling_price?: number
          unit_cost_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
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
          age: number | null
          clinic_id: string
          created_at: string | null
          email: string | null
          gender: string | null
          id: string
          medical_id: string | null
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          age?: number | null
          clinic_id: string
          created_at?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          medical_id?: string | null
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          age?: number | null
          clinic_id?: string
          created_at?: string | null
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
      pending_invitations: {
        Row: {
          accepted_at: string | null
          clinic_id: string
          created_at: string | null
          department_id: string | null
          email: string
          expires_at: string | null
          id: string
          invitation_token: string | null
          invited_by: string | null
          name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          clinic_id: string
          created_at?: string | null
          department_id?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invitation_token?: string | null
          invited_by?: string | null
          name?: string | null
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          clinic_id?: string
          created_at?: string | null
          department_id?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invitation_token?: string | null
          invited_by?: string | null
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pending_invitations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_invitations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "clinic_departments"
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
      procurement_items: {
        Row: {
          batch_number: string | null
          created_at: string
          expiry_date: string | null
          extracted_name: string | null
          id: string
          medicine_id: number | null
          procurement_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          expiry_date?: string | null
          extracted_name?: string | null
          id?: string
          medicine_id?: number | null
          procurement_id: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          expiry_date?: string | null
          extracted_name?: string | null
          id?: string
          medicine_id?: number | null
          procurement_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "procurement_items_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procurement_items_procurement_id_fkey"
            columns: ["procurement_id"]
            isOneToOne: false
            referencedRelation: "procurements"
            referencedColumns: ["id"]
          },
        ]
      }
      procurements: {
        Row: {
          clinic_id: string
          created_at: string
          created_by: string | null
          id: string
          image_url: string | null
          invoice_date: string
          invoice_number: string
          status: Database["public"]["Enums"]["procurement_status"]
          supplier_name: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          invoice_date: string
          invoice_number: string
          status?: Database["public"]["Enums"]["procurement_status"]
          supplier_name: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          invoice_date?: string
          invoice_number?: string
          status?: Database["public"]["Enums"]["procurement_status"]
          supplier_name?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "procurements_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          password_hash: string | null
          phone: string | null
          session_expires_at: string | null
          session_token: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          password_hash?: string | null
          phone?: string | null
          session_expires_at?: string | null
          session_token?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          password_hash?: string | null
          phone?: string | null
          session_expires_at?: string | null
          session_token?: string | null
          updated_at?: string | null
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
          new_department_id?: string
          new_role: Database["public"]["Enums"]["user_role"]
          new_user_id: string
          target_clinic_id: string
        }
        Returns: Json
      }
      calculate_clinic_credit_usage: {
        Args: { clinic_id_param: string }
        Returns: {
          appointments_count: number
          clinic_id: string
          completed_count: number
          credits_used: number
          in_progress_count: number
        }[]
      }
      create_clinic_with_admin: {
        Args: { clinic_name: string; user_phone?: string }
        Returns: Json
      }
      create_consultation: {
        Args: {
          p_appointment_id: string
          p_assessment_diagnosis: string
          p_chief_complaint: string
          p_history_present_illness: string
          p_notes?: string
          p_patient_id: string
          p_physical_examination: string
          p_plan_treatment: string
          p_prescriptions?: Json
        }
        Returns: string
      }
      create_doctor_profile: {
        Args: {
          p_availability?: Json
          p_bio?: string
          p_clinic_id: string
          p_consultation_fee?: number
          p_department_id?: string
          p_email: string
          p_name: string
          p_primary_specialization?: string
          p_user_id: string
        }
        Returns: string
      }
      debug_invitation_flow: { Args: { user_email: string }; Returns: Json }
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
      delete_patient: { Args: { p_patient_id: string }; Returns: boolean }
      fix_empty_display_names: { Args: never; Returns: number }
      generate_clinic_slug: {
        Args: { clinic_id?: string; clinic_name: string }
        Returns: string
      }
      generate_invoice_number: {
        Args: { clinic_id_arg: string }
        Returns: string
      }
      get_appointments_with_details_by_clinic: {
        Args: { clinic_id: string }
        Returns: {
          created_at: string
          date: string
          department_name: string
          doctor_avatar_url: string
          doctor_id: string
          doctor_name: string
          id: string
          notes: string
          patient_id: string
          patient_name: string
          status: Database["public"]["Enums"]["appointment_status"]
          time: string
          type: Database["public"]["Enums"]["appointment_type"]
          user_id: string
        }[]
      }
      get_clinic_billing_summary: {
        Args: { clinic_id_param: string }
        Returns: {
          credit_balance: number
          current_month_amount: number
          current_month_appointments: number
          pending_payments: number
          total_credits_purchased: number
          total_credits_used: number
        }[]
      }
      get_clinic_credit_balance: {
        Args: { clinic_id_param: string }
        Returns: number
      }
      get_clinic_members: {
        Args: { p_clinic_id: string }
        Returns: {
          clinic_id: string
          created_at: string
          department: Json
          department_id: string
          id: string
          profile: Json
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }[]
      }
      get_consultation_by_appointment: {
        Args: { p_appointment_id: string }
        Returns: {
          appointment_id: string
          assessment_diagnosis: string
          chief_complaint: string
          created_at: string
          history_present_illness: string
          id: string
          notes: string
          physical_examination: string
          plan_treatment: string
          prescriptions: Json
          updated_at: string
        }[]
      }
      get_consultation_details: {
        Args: { p_consultation_id: string }
        Returns: {
          appointment_id: string
          assessment_diagnosis: string
          chief_complaint: string
          created_at: string
          history_present_illness: string
          id: string
          notes: string
          patient_details: Json
          patient_id: string
          physical_examination: string
          plan_treatment: string
          prescriptions: Json
          updated_at: string
        }[]
      }
      get_dashboard_data: {
        Args: { _clinic_id: string }
        Returns: {
          all_relevant_appointments: Json
          appointments_today: number
          completed_consultations: number
          pending_consultations: number
          total_appointments: number
          total_doctors: number
          total_patients: number
        }[]
      }
      get_doctor_dashboard_data: {
        Args: { _clinic_id: string; _user_id: string }
        Returns: {
          completed_consultations: number
          my_patients: Json
          pending_consultations: number
          total_appointments: number
          total_patients: number
          upcoming_appointments: Json
        }[]
      }
      get_doctors_by_clinic: {
        Args: { clinic_id: string }
        Returns: {
          bio: string
          department_name: string
          email: string
          id: string
          name: string
          phone: string
          user_id: string
        }[]
      }
      get_patient_details: {
        Args: { p_patient_id: string }
        Returns: {
          address: string
          age: number
          clinic_id: string
          consultations: Json
          created_at: string
          email: string
          gender: string
          id: string
          medical_id: string
          name: string
          phone: string
        }[]
      }
      get_patients_by_clinic: {
        Args: { _clinic_id: string; _limit?: number; _offset?: number }
        Returns: {
          address: string
          age: number
          clinic_id: string
          created_at: string
          email: string
          gender: string
          id: string
          medical_id: string
          name: string
          phone: string
        }[]
      }
      get_profile: {
        Args: { user_id: string }
        Returns: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string
          updated_at: string
        }[]
      }
      get_profile_details: {
        Args: { p_user_id: string }
        Returns: {
          address: string
          avatar_url: string
          clinics: Json
          created_at: string
          email: string
          id: string
          medical_license_expiry: string
          medical_license_number: string
          name: string
          phone: string
          qualifications: string
          specialization: string
          updated_at: string
        }[]
      }
      get_profile_image_url: { Args: { p_user_id: string }; Returns: string }
      get_public_clinic_by_slug: {
        Args: { p_slug: string }
        Returns: {
          accreditations: string[]
          address: string
          clinic_images: string[]
          description: string
          email: string
          established_year: number
          id: string
          is_public: boolean
          license_number: string
          name: string
          operating_hours: Json
          phone: string
          slug: string
          social_media: Json
          website: string
        }[]
      }
      get_public_clinics: {
        Args: { limit_count?: number; search_term?: string }
        Returns: {
          accreditations: string[]
          address: string
          clinic_images: string[]
          description: string
          doctor_count: number
          email: string
          established_year: number
          id: string
          is_public: boolean
          license_number: string
          name: string
          operating_hours: Json
          phone: string
          slug: string
          social_media: Json
          website: string
        }[]
      }
      get_public_doctors_by_clinic: {
        Args: { p_clinic_id: string }
        Returns: {
          bio: string
          consultation_fee: number
          department_name: string
          id: string
          languages_spoken: string[]
          medical_qualifications: string[]
          medical_specializations: string[]
          name: string
          primary_specialization: string
          years_of_experience: number
        }[]
      }
      get_user_clinic_memberships: {
        Args: { user_id: string }
        Returns: {
          clinic_id: string
          clinic_name: string
          joined_at: string
          role: Database["public"]["Enums"]["user_role"]
        }[]
      }
      get_user_role_in_clinic: {
        Args: { check_clinic_id: string }
        Returns: string
      }
      handle_new_user_manual: {
        Args: { user_record: unknown }
        Returns: undefined
      }
      has_doctor_profile: {
        Args: { clinic_id_param: string }
        Returns: boolean
      }
      invite_user_by_email: {
        Args: {
          p_clinic_id: string
          p_department_id?: string
          p_email: string
          p_name?: string
          p_phone?: string
          p_role?: Database["public"]["Enums"]["user_role"]
        }
        Returns: Json
      }
      is_superadmin: { Args: never; Returns: boolean }
      is_superadmin_in_clinic: {
        Args: { check_clinic_id: string }
        Returns: boolean
      }
      search_medicines: {
        Args: { limit_count?: number; search_term?: string }
        Returns: {
          created_at: string
          id: number
          is_discontinued: boolean
          manufacturer_name: string
          name: string
          pack_size_label: string
          pack_type: string
          price: number
          short_composition1: string
          short_composition2: string
          similarity_score: number
        }[]
      }
      submit_contact_form: {
        Args: {
          city?: string
          company?: string
          email: string
          message: string
          name: string
          phone?: string
        }
        Returns: string
      }
      sync_all_clinic_credits: {
        Args: never
        Returns: {
          credit_balance: number
          new_credits_used: number
          old_credits_used: number
          result_clinic_id: string
          total_credits_purchased: number
          updated: boolean
        }[]
      }
      sync_credits_one_time: { Args: never; Returns: undefined }
      update_clinic_member_details: {
        Args: {
          member_user_id: string
          target_clinic_id: string
          updated_department_id?: string
          updated_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: undefined
      }
      update_consultation: {
        Args: {
          p_assessment_diagnosis?: string
          p_chief_complaint?: string
          p_consultation_id: string
          p_history_present_illness?: string
          p_notes?: string
          p_physical_examination?: string
          p_plan_treatment?: string
          p_prescriptions?: Json
        }
        Returns: string
      }
      update_profile: {
        Args: {
          p_email: string
          p_name: string
          p_phone: string
          p_user_id: string
        }
        Returns: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          password_hash: string | null
          phone: string | null
          session_expires_at: string | null
          session_token: string | null
          updated_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_profile_image: {
        Args: { p_avatar_url: string; p_user_id: string }
        Returns: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          password_hash: string | null
          phone: string | null
          session_expires_at: string | null
          session_token: string | null
          updated_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      user_clinic_ids: { Args: never; Returns: string[] }
      verify_and_process_payment: {
        Args: {
          p_clinic_id: string
          p_credits_purchased: number
          p_razorpay_payment_id: string
          p_razorpay_signature: string
          p_transaction_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      appointment_status:
        | "Scheduled"
        | "In Progress"
        | "Completed"
        | "Cancelled"
      appointment_type: "Walk-in" | "Digital"
      procurement_status: "Draft" | "Verified" | "Completed"
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
      procurement_status: ["Draft", "Verified", "Completed"],
      user_role: ["staff", "doctor", "superadmin"],
    },
  },
} as const

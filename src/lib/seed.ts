// seed.ts
import { createClient } from '@supabase/supabase-js';

// Replace with your actual values
const SUPABASE_URL = 'https://chftygsapwhahqbqlfdx.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoZnR5Z3NhcHdoYWhxYnFsZmR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg1NTg2MywiZXhwIjoyMDYzNDMxODYzfQ.ASnmMNUF7Sa0FN6z_ug0H_v5Q-qFjEErrvAXa8-cDSg';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  // 1. Seed Auth users
  const usersToCreate = [
    {
      email: 'admin@clinic.com',
      password: 'AdminPass123!',
      user_metadata: { role: 'admin' }
    },
    {
      email: 'doctor1@clinic.com',
      password: 'DoctorPass123!',
      user_metadata: { role: 'doctor', department: 'Neurology' }
    },
    {
      email: 'doctor2@clinic.com',
      password: 'DoctorPass456!',
      user_metadata: { role: 'doctor', department: 'Ophthalmology' }
    }
    // Add more users as needed
  ];

  const userIds: Record<string, string> = {};

  for (const user of usersToCreate) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: user.user_metadata
    });
    if (error) {
      console.error(`Error creating user ${user.email}:`, error.message);
    } else if (data?.user) {
      userIds[user.email] = data.user.id;
      console.log(`Created user: ${user.email}`);
    }
  }

  // 3. Seed doctors (link to Auth users)
  const doctorsToInsert = [
    {
      name: 'Dr. John Smith',
      email: 'doctor1@clinic.com',
      specialization: 'Neurology',
      phone: '+1234567890',
      bio: 'Neurology specialist with 10 years of experience'
    },
    {
      name: 'Dr. Jane Doe',
      email: 'doctor2@clinic.com',
      specialization: 'Ophthalmology',
      phone: '+1234567891',
      bio: 'Ophthalmology specialist with 8 years of experience'
    }
  ];

  const { data: doctors, error: docError } = await supabase
    .from('doctors')
    .insert(doctorsToInsert)
    .select();

  if (docError) {
    console.error('Error inserting doctors:', docError.message);
  } else {
    console.log('Inserted doctors:', doctors);
  }

  // 4. Seed patients
  const patientsToInsert = [
    {
      name: 'Alice Johnson',
      email: 'alice.johnson@email.com',
      phone: '+1234567890',
      date_of_birth: '1985-05-15',
      gender: 'Female',
      address: '123 Main St, City, State',
      medical_id: 'MED123456'
    },
    {
      name: 'Bob Wilson',
      email: 'bob.wilson@email.com',
      phone: '+1234567892',
      date_of_birth: '1978-08-22',
      gender: 'Male',
      address: '456 Oak Ave, City, State',
      medical_id: 'MED789012'
    }
  ];

  const { data: patients, error: patientError } = await supabase
    .from('patients')
    .insert(patientsToInsert)
    .select();

  if (patientError) {
    console.error('Error inserting patients:', patientError.message);
  } else {
    console.log('Inserted patients:', patients);
  }

  // 5. Seed appointments
  const appointmentsToInsert = [
    {
      patient_id: patients[0].id,
      doctor_id: doctors[0].id,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      time: '09:00:00',
      type: 'Walk-in',
      status: 'Scheduled',
      department: 'Neurology',
      notes: 'Patient requested morning appointment'
    },
    {
      patient_id: patients[1].id,
      doctor_id: doctors[1].id,
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
      time: '14:30:00',
      type: 'Digital',
      status: 'Scheduled',
      department: 'Ophthalmology',
      notes: 'Virtual appointment requested'
    }
  ];

  const { data: appointments, error: appointmentError } = await supabase
    .from('appointments')
    .insert(appointmentsToInsert)
    .select();

  if (appointmentError) {
    console.error('Error inserting appointments:', appointmentError.message);
  } else {
    console.log('Inserted appointments:', appointments);
  }

  // 6. Seed bills
  const billsToInsert = [
    {
      appointment_id: appointments[0].id,
      patient_id: patients[0].id,
      amount: 150.00,
      status: 'Pending',
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      payment_method: 'Credit Card',
      insurance_info: 'Provider: HealthCare Plus, Policy: HC123456'
    },
    {
      appointment_id: appointments[1].id,
      patient_id: patients[1].id,
      amount: 200.00,
      status: 'Paid',
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      payment_method: 'Insurance',
      insurance_info: 'Provider: MediCover, Policy: MC789012'
    }
  ];

  const { data: bills, error: billError } = await supabase
    .from('bills')
    .insert(billsToInsert)
    .select();

  if (billError) {
    console.error('Error inserting bills:', billError.message);
  } else {
    console.log('Inserted bills:', bills);
  }

  // 7. Seed medical records
  const medicalRecordsToInsert = [
    {
      appointment_id: appointments[0].id,
      patient_id: patients[0].id,
      doctor_id: doctors[0].id,
      record_type: 'Neurology',
      chief_complaint: 'Headaches and dizziness',
      diagnosis: 'Migraine',
      symptoms: 'Severe headache, sensitivity to light, nausea',
      treatment_plan: 'Prescribed medication and lifestyle changes',
      medications: [
        {
          name: 'Sumatriptan',
          dosage: '50mg',
          frequency: 'As needed',
          duration: '7 days'
        }
      ],
      follow_up_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      appointment_id: appointments[1].id,
      patient_id: patients[1].id,
      doctor_id: doctors[1].id,
      record_type: 'Ophthalmology',
      chief_complaint: 'Blurred vision',
      diagnosis: 'Myopia',
      symptoms: 'Difficulty seeing distant objects',
      treatment_plan: 'Prescription glasses',
      medications: [],
      follow_up_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const { data: medicalRecords, error: medicalRecordError } = await supabase
    .from('medical_records')
    .insert(medicalRecordsToInsert)
    .select();

  if (medicalRecordError) {
    console.error('Error inserting medical records:', medicalRecordError.message);
  } else {
    console.log('Inserted medical records:', medicalRecords);
  }

  // 8. Seed neurology records
  const neurologyRecordsToInsert = [
    {
      medical_record_id: medicalRecords[0].id,
      neurological_exam: 'Normal cranial nerves, no focal deficits',
      motor_function: 'Normal strength in all extremities',
      sensory_function: 'Intact to light touch and pinprick',
      reflexes: '2+ throughout',
      coordination: 'Normal finger-to-nose and heel-to-shin',
      cognitive_assessment: 'Alert and oriented x3',
      scan_results: 'MRI shows no acute abnormalities'
    }
  ];

  const { data: neurologyRecords, error: neurologyRecordError } = await supabase
    .from('neurology_records')
    .insert(neurologyRecordsToInsert)
    .select();

  if (neurologyRecordError) {
    console.error('Error inserting neurology records:', neurologyRecordError.message);
  } else {
    console.log('Inserted neurology records:', neurologyRecords);
  }

  // 9. Seed ophthalmology records
  const ophthalmologyRecordsToInsert = [
    {
      medical_record_id: medicalRecords[1].id,
      visual_acuity_right: '20/40',
      visual_acuity_left: '20/40',
      intraocular_pressure_right: '14 mmHg',
      intraocular_pressure_left: '15 mmHg',
      eye_examination: 'Normal anterior segment',
      fundoscopy: 'Normal optic nerve and retina',
      color_vision: 'Normal',
      peripheral_vision: 'Full to confrontation'
    }
  ];

  const { data: ophthalmologyRecords, error: ophthalmologyRecordError } = await supabase
    .from('ophthalmology_records')
    .insert(ophthalmologyRecordsToInsert)
    .select();

  if (ophthalmologyRecordError) {
    console.error('Error inserting ophthalmology records:', ophthalmologyRecordError.message);
  } else {
    console.log('Inserted ophthalmology records:', ophthalmologyRecords);
  }

  // 10. Seed consultations
  const consultationsToInsert = [
    {
      appointment_id: appointments[0].id,
      patient_id: patients[0].id,
      doctor_id: doctors[0].id,
      department: 'Neurology',
      clinical_notes: {
        history: 'Patient reports 3-day history of severe headaches',
        examination: 'Neurological exam normal',
        assessment: 'Migraine with aura',
        plan: 'Start preventive medication'
      }
    },
    {
      appointment_id: appointments[1].id,
      patient_id: patients[1].id,
      doctor_id: doctors[1].id,
      department: 'Ophthalmology',
      clinical_notes: {
        history: 'Progressive blurry vision over 6 months',
        examination: 'Refraction shows -2.00 in both eyes',
        assessment: 'Simple myopia',
        plan: 'Prescribe corrective lenses'
      }
    }
  ];

  const { data: consultations, error: consultationError } = await supabase
    .from('consultations')
    .insert(consultationsToInsert)
    .select();

  if (consultationError) {
    console.error('Error inserting consultations:', consultationError.message);
  } else {
    console.log('Inserted consultations:', consultations);
  }

  // 11. Seed prescriptions
  const prescriptionsToInsert = [
    {
      consultation_id: consultations[0].id,
      patient_id: patients[0].id,
      doctor_id: doctors[0].id,
      medical_record_id: medicalRecords[0].id,
      medications: [
        {
          name: 'Sumatriptan',
          dosage: '50mg',
          frequency: 'As needed',
          duration: '7 days',
          instructions: 'Take at first sign of migraine'
        },
        {
          name: 'Propranolol',
          dosage: '40mg',
          frequency: 'Twice daily',
          duration: '30 days',
          instructions: 'Take with food'
        }
      ],
      instructions: 'Take medications as prescribed. Follow up in 30 days.',
      follow_up_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      consultation_id: consultations[1].id,
      patient_id: patients[1].id,
      doctor_id: doctors[1].id,
      medical_record_id: medicalRecords[1].id,
      medications: [],
      instructions: 'Wear prescribed glasses for distance vision. Follow up in 60 days.',
      follow_up_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const { data: prescriptions, error: prescriptionError } = await supabase
    .from('prescriptions')
    .insert(prescriptionsToInsert)
    .select();

  if (prescriptionError) {
    console.error('Error inserting prescriptions:', prescriptionError.message);
  } else {
    console.log('Inserted prescriptions:', prescriptions);
  }

  console.log('Seeding complete!');
}

main().catch((err) => {
  console.error('Seeding failed:', err);
});
// seed.ts
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';

// Replace with your actual values

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SERVICE_ROLE_KEY);

async function main() {
  console.log("Starting database seeding...");

  // 1. Seed Auth users and link to profiles and doctors
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

  const createdUsers = [];

  console.log("Seeding Auth users...");
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
      createdUsers.push(data.user);
      console.log(`Created user: ${user.email} with ID ${data.user.id}`);
    }
  }

  if (createdUsers.length === usersToCreate.length) {
      console.log("All Auth users created successfully.");
  } else {
      console.warn(`Only created ${createdUsers.length}/${usersToCreate.length} Auth users. Check errors above.`);
  }

  const doctorUsers = createdUsers.filter(user => user.user_metadata?.role === 'doctor');
  const adminUser = createdUsers.find(user => user.user_metadata?.role === 'admin');

  // 3. Seed doctors (link to Auth users by ID)
  const doctorsToInsert = [
    { // Ensure ID is present and is the user ID
      id: doctorUsers.find(u => u.email === 'doctor1@clinic.com')?.id,
      name: 'Dr. John Smith',
      email: 'doctor1@clinic.com',
      specialization: 'Neurology',
      phone: '+1234567890',
      bio: 'Neurology specialist with 10 years of experience'
    },
    { // Ensure ID is present and is the user ID
      id: doctorUsers.find(u => u.email === 'doctor2@clinic.com')?.id,
      name: 'Dr. Jane Doe',
      email: 'doctor2@clinic.com',
      specialization: 'Ophthalmology',
      phone: '+1234567891',
      bio: 'Ophthalmology specialist with 8 years of experience'
    }
  ].filter(doc => doc.id) as { id: string; name: string; email: string; specialization: string; phone?: string | null; bio?: string | null; }[]; // Filter out any docs where id is null

  if (doctorsToInsert.length > 0) {
      console.log(`Seeding ${doctorsToInsert.length} doctors...`);
      const { data: insertedDoctors, error: docError } = await supabase
        .from('doctors')
        .insert(doctorsToInsert)
        .select(); // Select inserted data to get generated IDs if any (though we provide IDs here)

      if (docError) {
        console.error('Error inserting doctors:', docError.message);
      } else if (insertedDoctors) {
        console.log('Inserted doctors:', insertedDoctors);

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

        console.log(`Seeding ${patientsToInsert.length} patients...`);
        const { data: insertedPatients, error: patientError } = await supabase
          .from('patients')
          .insert(patientsToInsert)
          .select(); // Select inserted data to get generated IDs

        if (patientError) {
          console.error('Error inserting patients:', patientError.message);
        } else if (insertedPatients && insertedPatients.length > 0) {
          console.log('Inserted patients:', insertedPatients);

          // 5. Seed appointments
          const appointmentsToInsert = [
            {
              patient_id: insertedPatients[0].id,
              doctor_id: insertedDoctors.find(d => d.email === 'doctor1@clinic.com')?.id,
              date: format(new Date(), 'yyyy-MM-dd'), // Set date to today
              time: '09:00:00',
              type: 'Walk-in',
              status: 'Scheduled',
              department: 'Neurology',
              notes: 'Patient requested morning appointment'
            },
            {
              patient_id: insertedPatients[1].id,
              doctor_id: insertedDoctors.find(d => d.email === 'doctor2@clinic.com')?.id,
              date: format(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // Tomorrow
              time: '14:30:00',
              type: 'Digital',
              status: 'Scheduled',
              department: 'Ophthalmology',
              notes: 'Virtual appointment requested'
            },
             {
              patient_id: insertedPatients[0].id,
              doctor_id: insertedDoctors.find(d => d.email === 'doctor1@clinic.com')?.id,
              date: format(new Date(), 'yyyy-MM-dd'), // Today
              time: '10:00:00',
              type: 'Walk-in',
              status: 'Completed',
              department: 'Neurology',
              notes: 'Completed today'
            },
             {
              patient_id: insertedPatients[1].id,
              doctor_id: insertedDoctors.find(d => d.email === 'doctor2@clinic.com')?.id,
              date: format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // Last week
              time: '11:00:00',
              type: 'Digital',
              status: 'Completed',
              department: 'Ophthalmology',
              notes: 'Completed last week'
            }
          ].filter(appt => appt.patient_id && appt.doctor_id);

          if (appointmentsToInsert.length > 0) {
              console.log(`Seeding ${appointmentsToInsert.length} appointments...`);
              const { data: insertedAppointments, error: appointmentError } = await supabase
                .from('appointments')
                .insert(appointmentsToInsert)
                .select(); // Select inserted data to get generated IDs

              if (appointmentError) {
                console.error('Error inserting appointments:', appointmentError.message);
              } else if (insertedAppointments && insertedAppointments.length > 0) {
                console.log('Inserted appointments:', insertedAppointments);

                // 6. Seed bills
                const billsToInsert = [
                  {
                    // Find the correct appointment ID from the inserted appointments
                    appointment_id: insertedAppointments.find(a => a.patient_id === insertedPatients[0].id && a.date === format(new Date(), 'yyyy-MM-dd') && a.time === '09:00:00')?.id,
                    patient_id: insertedPatients[0].id,
                    amount: 150.00,
                    status: 'Pending',
                    // Ensure date format is correct (YYYY-MM-DD)
                    due_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
                    // payment_method is nullable, no need to include if not needed.
                    insurance_info: 'Provider: HealthCare Plus, Policy: HC123456'
                  },
                  {
                     // Find the correct appointment ID from the inserted appointments
                     appointment_id: insertedAppointments.find(a => a.patient_id === insertedPatients[1].id && a.date === format(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd') && a.time === '14:30:00')?.id,
                    patient_id: insertedPatients[1].id,
                    amount: 200.00,
                    status: 'Paid',
                    // Ensure date format is correct (YYYY-MM-DD)
                     due_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
                    // payment_method is nullable, no need to include if not needed.
                    insurance_info: 'Provider: MediCover, Policy: MC789012'
                  }
                ].filter(bill => bill.patient_id && bill.appointment_id); // Only insert if patient and appointment exist

                if (billsToInsert.length > 0) {
                    console.log(`Seeding ${billsToInsert.length} bills...`);
                    const { data: insertedBills, error: billError } = await supabase
                      .from('bills')
                      .insert(billsToInsert)
                      .select();

                    if (billError) {
                      console.error('Error inserting bills:', billError.message);
                    } else {
                      console.log('Inserted bills:', insertedBills);
                    }
                } else {
                     console.warn("No valid bills to insert after filtering. Check appointment IDs.");
                }

                // 7. Seed medical records
                const medicalRecordsToInsert = [
                  {
                     // Find the correct appointment ID
                     appointment_id: insertedAppointments.find(a => a.patient_id === insertedPatients[0].id && a.date === format(new Date(), 'yyyy-MM-dd') && a.time === '09:00:00')?.id,
                    patient_id: insertedPatients[0].id,
                    // Find the correct doctor ID
                    doctor_id: insertedDoctors.find(d => d.email === 'doctor1@clinic.com')?.id,
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
                    // Ensure date format is correct (YYYY-MM-DD)
                     follow_up_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
                  },
                  {
                     // Find the correct appointment ID
                     appointment_id: insertedAppointments.find(a => a.patient_id === insertedPatients[1].id && a.date === format(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd') && a.time === '14:30:00')?.id,
                    patient_id: insertedPatients[1].id,
                    // Find the correct doctor ID
                    doctor_id: insertedDoctors.find(d => d.email === 'doctor2@clinic.com')?.id,
                    record_type: 'Ophthalmology',
                    chief_complaint: 'Blurred vision',
                    diagnosis: 'Myopia',
                    symptoms: 'Difficulty seeing distant objects',
                    treatment_plan: 'Prescription glasses',
                    medications: [],
                    // Ensure date format is correct (YYYY-MM-DD)
                     follow_up_date: format(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
                  }
                ].filter(mr => mr.patient_id && mr.doctor_id && mr.appointment_id); // Only insert if patient, doctor, and appointment exist

                if (medicalRecordsToInsert.length > 0) {
                  console.log(`Seeding ${medicalRecordsToInsert.length} medical records...`);
                  const { data: insertedMedicalRecords, error: medicalRecordError } = await supabase
                    .from('medical_records')
                    .insert(medicalRecordsToInsert)
                    .select();

                  if (medicalRecordError) {
                    console.error('Error inserting medical records:', medicalRecordError.message);
                  } else if (insertedMedicalRecords && insertedMedicalRecords.length > 0) {
                    console.log('Inserted medical records:', insertedMedicalRecords);

                    // 8. Seed neurology records
                    const neurologyRecordsToInsert = [
                      {
                        // Find the correct medical record ID
                        medical_record_id: insertedMedicalRecords.find(mr => mr.patient_id === insertedPatients[0].id && mr.record_type === 'Neurology')?.id,
                        neurological_exam: 'Normal cranial nerves, no focal deficits',
                        motor_function: 'Normal strength in all extremities',
                        sensory_function: 'Intact to light touch and pinprick',
                        reflexes: '2+ throughout',
                        coordination: 'Normal finger-to-nose and heel-to-shin',
                        cognitive_assessment: 'Alert and oriented x3',
                        scan_results: 'MRI shows no acute abnormalities'
                      }
                    ].filter(nr => nr.medical_record_id); // Only insert if medical record exists

                    if (neurologyRecordsToInsert.length > 0) {
                      console.log(`Seeding ${neurologyRecordsToInsert.length} neurology records...`);
                      const { data: neurologyRecords, error: neurologyRecordError } = await supabase
                        .from('neurology_records')
                        .insert(neurologyRecordsToInsert)
                        .select();

                      if (neurologyRecordError) {
                        console.error('Error inserting neurology records:', neurologyRecordError.message);
                      } else {
                        console.log('Inserted neurology records:', neurologyRecords);
                      }
                    } else {
                        console.warn("No valid neurology records to insert after filtering. Check medical record IDs.");
                    }

                    // 9. Seed ophthalmology records
                    const ophthalmologyRecordsToInsert = [
                      {
                         // Find the correct medical record ID
                         medical_record_id: insertedMedicalRecords.find(mr => mr.patient_id === insertedPatients[1].id && mr.record_type === 'Ophthalmology')?.id,
                        visual_acuity_right: '20/40',
                        visual_acuity_left: '20/40',
                        intraocular_pressure_right: '14 mmHg',
                        intraocular_pressure_left: '15 mmHg',
                        eye_examination: 'Normal anterior segment',
                        fundoscopy: 'Normal optic nerve and retina',
                        color_vision: 'Normal',
                        peripheral_vision: 'Full to confrontation'
                      }
                    ].filter(or => or.medical_record_id); // Only insert if medical record exists

                     if (ophthalmologyRecordsToInsert.length > 0) {
                      console.log(`Seeding ${ophthalmologyRecordsToInsert.length} ophthalmology records...`);
                      const { data: ophthalmologyRecords, error: ophthalmologyRecordError } = await supabase
                        .from('ophthalmology_records')
                        .insert(ophthalmologyRecordsToInsert)
                        .select();

                      if (ophthalmologyRecordError) {
                        console.error('Error inserting ophthalmology records:', ophthalmologyRecordError.message);
                      } else {
                        console.log('Inserted ophthalmology records:', ophthalmologyRecords);
                      }
                     } else {
                         console.warn("No valid ophthalmology records to insert after filtering. Check medical record IDs.");
                     }

                    // 10. Seed consultations
                    const consultationsToInsert = [
                      {
                         // Find the correct appointment ID
                         appointment_id: insertedAppointments.find(a => a.patient_id === insertedPatients[0].id && a.date === format(new Date(), 'yyyy-MM-dd') && a.time === '09:00:00')?.id,
                        patient_id: insertedPatients[0].id,
                        // Find the correct doctor ID
                        doctor_id: insertedDoctors.find(d => d.email === 'doctor1@clinic.com')?.id,
                        department: 'Neurology',
                        clinical_notes: {
                          history: 'Patient reports 3-day history of severe headaches',
                          examination: 'Neurological exam normal',
                          assessment: 'Migraine with aura',
                          plan: 'Start preventive medication'
                        }
                      },
                      {
                         // Find the correct appointment ID
                         appointment_id: insertedAppointments.find(a => a.patient_id === insertedPatients[1].id && a.date === format(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd') && a.time === '14:30:00')?.id,
                        patient_id: insertedPatients[1].id,
                        // Find the correct doctor ID
                        doctor_id: insertedDoctors.find(d => d.email === 'doctor2@clinic.com')?.id,
                        department: 'Ophthalmology',
                        clinical_notes: {
                          history: 'Progressive blurry vision over 6 months',
                          examination: 'Refraction shows -2.00 in both eyes',
                          assessment: 'Simple myopia',
                          plan: 'Prescribe corrective lenses'
                        }
                      }
                    ].filter(c => c.patient_id && c.doctor_id && c.appointment_id); // Only insert if patient, doctor, and appointment exist

                     if (consultationsToInsert.length > 0) {
                      console.log(`Seeding ${consultationsToInsert.length} consultations...`);
                      const { data: insertedConsultations, error: consultationError } = await supabase
                        .from('consultations')
                        .insert(consultationsToInsert)
                        .select();

                      if (consultationError) {
                        console.error('Error inserting consultations:', consultationError.message);
                      } else if (insertedConsultations && insertedConsultations.length > 0) {
                        console.log('Inserted consultations:', insertedConsultations);

                        // 11. Seed prescriptions
                        const prescriptionsToInsert = [
                          {
                            // Find the correct consultation ID
                            consultation_id: insertedConsultations.find(c => c.patient_id === insertedPatients[0].id && c.department === 'Neurology')?.id,
                            patient_id: insertedPatients[0].id,
                            // Find the correct doctor ID
                            doctor_id: insertedDoctors.find(d => d.email === 'doctor1@clinic.com')?.id,
                            // Find the correct medical record ID
                             medical_record_id: insertedMedicalRecords.find(mr => mr.patient_id === insertedPatients[0].id && mr.record_type === 'Neurology')?.id,
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
                            // Ensure date format is correct (YYYY-MM-DD)
                             follow_up_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
                          },
                          {
                             // Find the correct consultation ID
                             consultation_id: insertedConsultations.find(c => c.patient_id === insertedPatients[1].id && c.department === 'Ophthalmology')?.id,
                            patient_id: insertedPatients[1].id,
                            // Find the correct doctor ID
                            doctor_id: insertedDoctors.find(d => d.email === 'doctor2@clinic.com')?.id,
                            // Find the correct medical record ID
                             medical_record_id: insertedMedicalRecords.find(mr => mr.patient_id === insertedPatients[1].id && mr.record_type === 'Ophthalmology')?.id,
                            medications: [],
                            instructions: 'Wear prescribed glasses for distance vision. Follow up in 60 days.',
                            // Ensure date format is correct (YYYY-MM-DD)
                             follow_up_date: format(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
                          }
                        ].filter(p => p.patient_id && p.doctor_id && p.medical_record_id && p.consultation_id); // Only insert if all foreign keys exist

                        if (prescriptionsToInsert.length > 0) {
                          console.log(`Seeding ${prescriptionsToInsert.length} prescriptions...`);
                          const { data: insertedPrescriptions, error: prescriptionError } = await supabase
                            .from('prescriptions')
                            .insert(prescriptionsToInsert)
                            .select();

                          if (prescriptionError) {
                            console.error('Error inserting prescriptions:', prescriptionError.message);
                          } else {
                            console.log('Inserted prescriptions:', insertedPrescriptions);
                          }
                        } else {
                             console.warn("No valid prescriptions to insert after filtering. Check foreign key IDs.");
                        }

                        console.log('Seeding process completed.');

                      } else {
                          console.warn("No consultations were inserted. Skipping prescriptions seed.");
                          console.log('Seeding process completed (without prescriptions).');
                      }
                   } else {
                      console.warn("No valid consultations to insert after filtering. Check foreign key IDs.");
                      console.log('Seeding process completed (without consultations and prescriptions).');
                   }

                } else {
                    console.warn("No medical records were inserted. Skipping neurology, ophthalmology, consultations, and prescriptions seeds.");
                     console.log('Seeding process completed (without neurology, ophthalmology, consultations, prescriptions).');
                }
              } else {
                   console.warn("No valid medical records to insert after filtering. Check foreign key IDs.");
                   console.log('Seeding process completed (without medical records, neurology, ophthalmology, consultations, prescriptions).');
              }

            } else {
              console.warn("No appointments were inserted. Skipping bills, medical records, consultations, and prescriptions seeds.");
               console.log('Seeding process completed (without bills, medical records, neurology, ophthalmology, consultations, prescriptions).');
            }
          } else {
             console.warn("No valid appointments to insert after filtering. Check patient and doctor IDs.");
              console.log('Seeding process completed (without appointments, bills, medical records, neurology, ophthalmology, consultations, prescriptions).');
          }

        } else {
           console.warn("No patients were inserted. Skipping appointments, bills, medical records, consultations, and prescriptions seeds.");
            console.log('Seeding process completed (without appointments, bills, medical records, neurology, ophthalmology, consultations, prescriptions).');
        }
      } else {
         console.warn("No doctors were inserted. Skipping patient, appointment, bill, medical record, consultation, and prescription seeds.");
          console.log('Seeding process completed (without patients, appointments, bills, medical records, neurology, ophthalmology, consultations, prescriptions).');
      }

    } else {
      console.warn("No valid doctors to insert after filtering. Check user IDs.");
      console.log('Seeding process completed (without doctors, patients, appointments, bills, medical records, neurology, ophthalmology, consultations, prescriptions).');
    }
}

main().catch((err) => {
  console.error('Seeding failed:', err);
});
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { format } from 'date-fns';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for seeding

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined.');
  console.error('Please ensure you have a .env.local file in the project root with these variables.');
  console.error(`VITE_SUPABASE_URL is: ${supabaseUrl}`);
  console.error(`SUPABASE_SERVICE_ROLE_KEY is: ${supabaseServiceRoleKey ? '***defined***' : '***undefined***'}`);
  process.exit(1);
}

// Create a Supabase client with the service role key
// This bypasses RLS for seeding purposes
const supabase = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function seedDatabase() {
  console.log('Starting database seeding...');

  try {
    // Clear existing data (optional, but good for idempotent seeding)
    console.log('Clearing existing data...');
    // Delete in reverse order of dependencies
    await supabase.from('prescriptions').delete().neq('id', uuidv4());
    await supabase.from('consultations').delete().neq('id', uuidv4());
    await supabase.from('medical_records').delete().neq('id', uuidv4());
    await supabase.from('bills').delete().neq('id', uuidv4());
    await supabase.from('appointments').delete().neq('id', uuidv4());
    await supabase.from('patients').delete().neq('id', uuidv4());
    await supabase.from('doctors').delete().neq('id', uuidv4());
    await supabase.from('clinic_members').delete().neq('id', uuidv4());
    await supabase.from('clinic_departments').delete().neq('id', uuidv4());
    await supabase.from('department_types').delete().neq('id', uuidv4());
    await supabase.from('clinics').delete().neq('id', uuidv4());
    // Note: We don't typically delete from `profiles` as it's linked to auth.users
    // For a clean seed, one might manually clear auth.users and profiles if needed,
    // but for seeding sample clinic data, clearing dependent tables is sufficient.
    console.log('Existing data cleared.');

    // --- Seed Department Types ---
    console.log('Seeding department types...');
    const { data: departmentTypes, error: departmentTypeError } = await supabase
      .from('department_types')
      .insert([
        { name: 'Neurology' },
        { name: 'Ophthalmology' },
      ])
      .select();
    if (departmentTypeError) throw departmentTypeError;
    const neurologyDeptType = departmentTypes.find(dt => dt.name === 'Neurology');
    const ophthalmologyDeptType = departmentTypes.find(dt => dt.name === 'Ophthalmology');
    console.log('Department types seeded.');

    // --- Seed Clinics ---
    console.log('Seeding clinics...');
    // Create a dummy user profile to be the creator of the clinics
    const { data: adminProfileData, error: adminProfileError } = await supabase
      .from('profiles')
      .insert({ id: uuidv4(), email: 'admin@example.com', name: 'Super Admin' })
      .select()
      .single();
    if (adminProfileError) {
        // If profile already exists (e.g., from a previous partial run or auth user), fetch it
        if (adminProfileError.code === '23505') { // Unique violation code
             const { data: existingAdmin, error: fetchAdminError } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', 'admin@example.com')
                .single();
            if (fetchAdminError) throw fetchAdminError;
            adminProfileData.id = existingAdmin.id; // Use the existing user ID
            console.log('Admin profile already exists, using existing ID.');
        } else {
            throw adminProfileError;
        }
    }
    const adminUserId = adminProfileData.id;

    const { data: clinics, error: clinicError } = await supabase
      .from('clinics')
      .insert([
        { name: 'NeuroCare Clinic', created_by: adminUserId, address: '123 Neural Ave', phone: '555-1111', email: 'info@neurocare.com' },
        { name: 'Vision Plus Center', created_by: adminUserId, address: '456 Optic Way', phone: '555-2222', email: 'info@visionplus.com' },
      ])
      .select();
    if (clinicError) throw clinicError;
    const neuroCareClinic = clinics.find(c => c.name === 'NeuroCare Clinic');
    const visionPlusClinic = clinics.find(c => c.name === 'Vision Plus Center');
    console.log('Clinics seeded.');

    // --- Seed Clinic Departments (linking clinics to department types) ---
    console.log('Seeding clinic departments...');
    const { data: clinicDepartments, error: clinicDepartmentError } = await supabase
        .from('clinic_departments')
        .insert([
            { clinic_id: neuroCareClinic!.id, department_type_id: neurologyDeptType!.id },
            { clinic_id: visionPlusClinic!.id, department_type_id: ophthalmologyDeptType!.id },
        ])
        .select();
    if (clinicDepartmentError) throw clinicDepartmentError;
    const neuroCareNeurologyDept = clinicDepartments.find(cd => cd.clinic_id === neuroCareClinic!.id && cd.department_type_id === neurologyDeptType!.id);
    const visionPlusOphthalmologyDept = clinicDepartments.find(cd => cd.clinic_id === visionPlusClinic!.id && cd.department_type_id === ophthalmologyDeptType!.id);
    console.log('Clinic departments seeded.');

    // --- Seed Profiles, Doctors, and Clinic Members ---
    console.log('Seeding profiles, doctors, and clinic members...');
    const usersToSeed = [
      { email: 'doctor.neuro@neurocare.com', name: 'Dr. Anya Sharma', role: 'doctor' as Database['public']['Enums']['user_role'], clinic: neuroCareClinic, department: neuroCareNeurologyDept },
      { email: 'staff.neuro@neurocare.com', name: 'Jane Smith', role: 'staff' as Database['public']['Enums']['user_role'], clinic: neuroCareClinic, department: null },
      { email: 'superadmin.neuro@neurocare.com', name: 'David Lee', role: 'superadmin' as Database['public']['Enums']['user_role'], clinic: neuroCareClinic, department: null },
      { email: 'doctor.ophtha@visionplus.com', name: 'Dr. Ben Carter', role: 'doctor' as Database['public']['Enums']['user_role'], clinic: visionPlusClinic, department: visionPlusOphthalmologyDept },
      { email: 'staff.ophtha@visionplus.com', name: 'Sarah Chen', role: 'staff' as Database['public']['Enums']['user_role'], clinic: visionPlusClinic, department: null },
      { email: 'superadmin.ophtha@visionplus.com', name: 'Emily Wong', role: 'superadmin' as Database['public']['Enums']['user_role'], clinic: visionPlusClinic, department: null },
    ];

    const seededUsers = [];
    for (const user of usersToSeed) {
        let userId: string;

        // Attempt to get user by email first by listing users and filtering
        const { data: existingAuthUsersResponse, error: fetchAuthUserError } = await supabase.auth.admin.listUsers();

        if (fetchAuthUserError) { // Throw any error during listing users
            throw fetchAuthUserError;
        }

        // Find the user by email in the list
        // Use a type assertion or careful access as types might be inaccurate
        const existingAuthUser = existingAuthUsersResponse?.users.find((u: { id: string; email?: string | null }) => u.email === user.email);

        if (existingAuthUser) {
            // User already exists in auth.users, use their ID
            userId = existingAuthUser.id;
            console.log(`Auth user with email ${user.email} already exists. Using existing ID: ${userId}`);
        } else {
            // User does not exist in auth.users, create them
             const newUserId = uuidv4();
             const { data: newAuthUserData, error: authUserError } = await supabase.auth.admin.createUser({
                id: newUserId, // Use the generated UUID
                email: user.email,
                password: 'password', // Dummy password for seed users
                email_confirm: true, // Auto-confirm email
            });

            if (authUserError) {
                 // If creation failed for any reason, throw the error
                 throw authUserError;
            }
            userId = newAuthUserData.user.id; // Use the newly created auth user ID
            console.log(`Created auth user and got ID: ${userId}`);
        }

        // Now seed or update Profile using the SAME userId obtained above
        // Use upsert to handle cases where the profile might exist without a proper auth.users link
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: userId, // Always use the auth.users ID
                email: user.email,
                name: user.name
            })
            .select() // Select the upserted data to confirm
            .single();

        if (profileError) { // Throw any error during profile upsert
            throw profileError;
        }

        // 2. Seed Doctor (if role is doctor)
        if (user.role === 'doctor') {
            // Find the department type name using the department_type_id from clinic_department
            const departmentTypeName = user.department?.department_type_id
                ? departmentTypes.find(dt => dt.id === user.department.department_type_id)?.name || 'medical field'
                : 'medical field';

            const { error: doctorError } = await supabase
                .from('doctors')
                .insert({
                    id: userId, // doctors.id is the same as profiles.id/user_id
                    name: user.name,
                    email: user.email,
                    phone: '555-3333',
                    availability: 'Mon-Fri, 9 AM - 5 PM',
                    bio: `Specializes in ${departmentTypeName}.`, // Use the found department type name
                });
            if (doctorError && doctorError.code !== '23505') throw doctorError; // Ignore unique constraint errors if doctor already exists
        }

        // 3. Seed Clinic Member
        const { error: memberError } = await supabase
            .from('clinic_members')
            .insert({
                user_id: userId,
                clinic_id: user.clinic!.id,
                role: user.role,
                department_id: user.department?.id || null,
            });
         if (memberError && memberError.code !== '23505') throw memberError; // Ignore unique constraint errors if member already exists

        seededUsers.push({...user, id: userId});
    }
     const doctorNeuro = seededUsers.find(u => u.email === 'doctor.neuro@neurocare.com')!;
     const doctorOphtha = seededUsers.find(u => u.email === 'doctor.ophtha@visionplus.com')!;
     const staffNeuro = seededUsers.find(u => u.email === 'staff.neuro@neurocare.com')!;


    console.log('Profiles, doctors, and clinic members seeded.');

    // --- Seed Patients ---
    console.log('Seeding patients...');
    const { data: patients, error: patientError } = await supabase
      .from('patients')
      .insert([
        { clinic_id: neuroCareClinic!.id, name: 'Alice Wonderland', date_of_birth: '1990-01-15', gender: 'Female', email: 'alice@example.com', phone: '555-4444', address: '101 Fairyland Ln' },
        { clinic_id: neuroCareClinic!.id, name: 'Bob Thebuilder', date_of_birth: '1985-05-20', gender: 'Male', email: 'bob@example.com', phone: '555-5555', address: '202 Construction St' },
        { clinic_id: visionPlusClinic!.id, name: 'Charlie Bucket', date_of_birth: '2000-11-11', gender: 'Male', email: 'charlie@example.com', phone: '555-6666', address: '303 Chocolate Rd' },
      ])
      .select();
    if (patientError) throw patientError;
    const alice = patients.find(p => p.name === 'Alice Wonderland');
    const bob = patients.find(p => p.name === 'Bob Thebuilder');
    const charlie = patients.find(p => p.name === 'Charlie Bucket');
    console.log('Patients seeded.');

    // --- Seed Appointments ---
    console.log('Seeding appointments...');
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data: appointments, error: appointmentError } = await supabase
      .from('appointments')
      .insert([
        { clinic_id: neuroCareClinic!.id, patient_id: alice!.id, doctor_id: doctorNeuro!.id, date: today, time: '10:00', type: 'Walk-in', status: 'Scheduled', notes: 'Initial consultation' },
        { clinic_id: neuroCareClinic!.id, patient_id: bob!.id, doctor_id: doctorNeuro!.id, date: today, time: '11:00', type: 'Digital', status: 'In Progress', notes: 'Follow-up call' },
        { clinic_id: visionPlusClinic!.id, patient_id: charlie!.id, doctor_id: doctorOphtha!.id, date: today, time: '14:00', type: 'Walk-in', status: 'Scheduled', notes: 'Eye exam' },
      ])
      .select();
    if (appointmentError) throw appointmentError;
    const aliceAppt = appointments.find(a => a.patient_id === alice!.id);
    const bobAppt = appointments.find(a => a.patient_id === bob!.id);
    const charlieAppt = appointments.find(a => a.patient_id === charlie!.id);
    console.log('Appointments seeded.');

    // --- Seed Consultations (one-to-one with appointments) ---
    console.log('Seeding consultations...');
    const { data: consultations, error: consultationError } = await supabase
      .from('consultations')
      .insert([
        {
            appointment_id: aliceAppt!.id,
            clinic_id: neuroCareClinic!.id,
            doctor_id: doctorNeuro!.id,
            patient_id: alice!.id,
            clinical_notes: { summary: 'Patient reported headaches.', diagnosis: 'Migraine', treatment: 'Prescribed medication.' },
            specialty_data: { type: 'Neurology', symptoms: ['headache', 'nausea'] }
        },
         {
            appointment_id: charlieAppt!.id,
            clinic_id: visionPlusClinic!.id,
            doctor_id: doctorOphtha!.id,
            patient_id: charlie!.id,
            clinical_notes: { summary: 'Patient needs new glasses.', diagnosis: 'Myopia', treatment: 'Prescribed new lenses.' },
            specialty_data: { type: 'Ophthalmology', prescription: { sphere: -2.5, cylinder: -0.5 } }
        },
      ])
      .select();
    if (consultationError) throw consultationError;
     const aliceConsultation = consultations.find(c => c.patient_id === alice!.id);
     const charlieConsultation = consultations.find(c => c.patient_id === charlie!.id);
    console.log('Consultations seeded.');

     // --- Seed Medical Records ---
    console.log('Seeding medical records...');
    const { data: medicalRecords, error: medicalRecordError } = await supabase
      .from('medical_records')
      .insert([
        {
            clinic_id: neuroCareClinic!.id,
            patient_id: alice!.id,
            chief_complaint: 'Chronic headaches',
            symptoms: 'Severe throbbing pain, nausea, sensitivity to light and sound',
            diagnosis: 'Migraine without aura',
            treatment_plan: 'Acute medication, lifestyle changes, trigger identification',
            notes: 'Patient needs follow up in 1 month.'
        },
         {
            clinic_id: visionPlusClinic!.id,
            patient_id: charlie!.id,
            chief_complaint: 'Blurred vision',
            symptoms: 'Difficulty seeing distant objects clearly',
            diagnosis: 'Myopia',
            treatment_plan: 'Prescribe corrective lenses',
            notes: 'Annual eye exams recommended.'
        },
      ])
      .select();
    if (medicalRecordError) throw medicalRecordError;
     const aliceMedicalRecord = medicalRecords.find(mr => mr.patient_id === alice!.id);
     const charlieMedicalRecord = medicalRecords.find(mr => mr.patient_id === charlie!.id);
    console.log('Medical records seeded.');


    // --- Seed Prescriptions ---
    console.log('Seeding prescriptions...');
     const { data: prescriptions, error: prescriptionError } = await supabase
       .from('prescriptions')
       .insert([
         {
           clinic_id: neuroCareClinic!.id,
           patient_id: alice!.id,
           doctor_id: doctorNeuro!.id,
           consultation_id: aliceConsultation!.id,
           medical_record_id: aliceMedicalRecord!.id,
           medications: [
             { name: 'Sumatriptan', dosage: '50mg', frequency: 'As needed for migraine', duration: 'Until symptoms resolve' },
             { name: 'Propranolol', dosage: '20mg', frequency: 'Twice daily', duration: 'Ongoing' },
           ],
           instructions: 'Take Sumatriptan at first sign of migraine. Take Propranolol regularly as a preventative.',
           follow_up_date: format(new Date(new Date().setDate(new Date().getDate() + 30)), 'yyyy-MM-dd'), // 30 days from now
         },
          {
            clinic_id: visionPlusClinic!.id,
            patient_id: charlie!.id,
            doctor_id: doctorOphtha!.id,
            consultation_id: charlieConsultation!.id,
            medical_record_id: charlieMedicalRecord!.id,
            medications: [
              { name: 'Corrective Lenses', type: 'Glasses', strength: 'Sphere -2.5, Cylinder -0.5' },
            ],
            instructions: 'Wear glasses for distance vision.',
            follow_up_date: format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), 'yyyy-MM-dd'), // 1 year from now
          },
       ])
       .select();
     if (prescriptionError) throw prescriptionError;
     console.log('Prescriptions seeded.');

     // --- Seed Bills ---
    console.log('Seeding bills...');
    const { data: bills, error: billError } = await supabase
      .from('bills')
      .insert([
        {
            clinic_id: neuroCareClinic!.id,
            patient_id: alice!.id,
            appointment_id: aliceAppt!.id,
            amount: 150.00,
            description: 'Initial Consultation Fee',
            status: 'Pending',
            invoice_number: 'INV-NC-001'
        },
         {
            clinic_id: neuroCareClinic!.id,
            patient_id: bob!.id,
            appointment_id: bobAppt!.id,
            amount: 75.00,
            description: 'Follow-up Consultation Fee',
            status: 'Paid',
            invoice_number: 'INV-NC-002'
        },
         {
            clinic_id: visionPlusClinic!.id,
            patient_id: charlie!.id,
            appointment_id: charlieAppt!.id,
            amount: 200.00,
            description: 'Comprehensive Eye Exam',
            status: 'Overdue',
            invoice_number: 'INV-VP-001'
        },
      ])
      .select();
    if (billError) throw billError;
    console.log('Bills seeded.');


    console.log('Database seeding completed successfully!');

  } catch (error: unknown) {
    console.error('Database seeding failed:', (error as Error).message);
    console.error('Details:', error);
  } finally {
      // Note: In a real application, you might want to manually disconnect the client if needed,
      // but tsx usually handles process exit correctly.
  }
}

seedDatabase();

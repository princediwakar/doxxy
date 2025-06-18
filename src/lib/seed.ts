import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { format, addDays, addWeeks, addMonths } from 'date-fns';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined.');
  console.error('Please ensure you have a .env.local file in the project root with these variables.');
  console.error(`VITE_SUPABASE_URL is: ${supabaseUrl}`);
  console.error(`SUPABASE_SERVICE_ROLE_KEY is: ${supabaseServiceRoleKey ? '***defined***' : '***undefined***'}`);
  process.exit(1);
}

// Create a Supabase client with the service role key
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

// Existing user IDs provided by user
const EXISTING_USERS = {
  SUPERADMIN: '45a33c25-665b-4c86-8fdc-ecc0da97e49a',
  DOCTOR_1: '935bc4a8-b78d-4be1-b71b-5a53484e071b', // Dr. Priya Sharma (Neurologist)
  DOCTOR_2: '84c692f9-51a7-40c4-8894-bd84b056fe1d', // Dr. Rajesh Kumar (Ophthalmologist)
  DOCTOR_3: '64f6d550-bb44-4ad0-aef7-4e76e76805af', // Dr. Meera Patel (Neurologist)
};

// Existing clinic and department data
const EXISTING_CLINIC_ID = '582509f8-4d6a-41b3-8c31-553a9cb7bc90';

async function seedDatabase() {
  console.log('🏥 Starting database seeding with existing users and clinic...');

  try {
    // Clear existing seed data while preserving user setup
    console.log('🧹 Clearing existing seed data...');
    await supabase.from('prescriptions').delete().eq('clinic_id', EXISTING_CLINIC_ID);
    await supabase.from('consultations').delete().eq('clinic_id', EXISTING_CLINIC_ID);
    await supabase.from('medical_records').delete().eq('clinic_id', EXISTING_CLINIC_ID);
    await supabase.from('bills').delete().eq('clinic_id', EXISTING_CLINIC_ID);
    await supabase.from('appointments').delete().eq('clinic_id', EXISTING_CLINIC_ID);
    await supabase.from('patients').delete().eq('clinic_id', EXISTING_CLINIC_ID);
    await supabase.from('doctors').delete().eq('clinic_id', EXISTING_CLINIC_ID);
    console.log('✅ Existing seed data cleared.');

    // Update profiles for existing users
    console.log('👥 Updating profiles for existing users...');
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert([
        { 
          id: EXISTING_USERS.SUPERADMIN, 
          name: 'Dr. Admin Singh', 
          email: 'admin@neurovision.com',
          phone: '+91-9876543210'
        },
        { 
          id: EXISTING_USERS.DOCTOR_1, 
          name: 'Dr. Priya Sharma', 
          email: 'priya.sharma@neurovision.com',
          phone: '+91-9876543211'
        },
        { 
          id: EXISTING_USERS.DOCTOR_2, 
          name: 'Dr. Rajesh Kumar', 
          email: 'rajesh.kumar@neurovision.com',
          phone: '+91-9876543212'
        },
        { 
          id: EXISTING_USERS.DOCTOR_3, 
          name: 'Dr. Meera Patel', 
          email: 'meera.patel@neurovision.com',
          phone: '+91-9876543213'
        },
      ], { onConflict: 'id' });
    
    if (profileError) throw profileError;
    console.log('✅ Profiles updated.');

    // Create doctor records for the doctor users
    console.log('🩺 Creating doctor records...');
    const { error: doctorError } = await supabase
      .from('doctors')
      .insert([
        {
          user_id: EXISTING_USERS.DOCTOR_1,
          name: 'Dr. Priya Sharma',
          email: 'priya.sharma@neurovision.com',
          phone: '+91-9876543211',
          clinic_id: EXISTING_CLINIC_ID,
          availability: 'Mon-Fri 9:00 AM - 5:00 PM',
          bio: 'Specialist in Neurology with 8+ years of experience. Expert in treating neurological disorders, epilepsy, and migraines.',
          is_active: true
        },
        {
          user_id: EXISTING_USERS.DOCTOR_2,
          name: 'Dr. Rajesh Kumar',
          email: 'rajesh.kumar@neurovision.com',
          phone: '+91-9876543212',
          clinic_id: EXISTING_CLINIC_ID,
          availability: 'Mon-Sat 10:00 AM - 6:00 PM',
          bio: 'Ophthalmologist specializing in retinal diseases, cataract surgery, and pediatric eye care with 10+ years of experience.',
          is_active: true
        },
        {
          user_id: EXISTING_USERS.DOCTOR_3,
          name: 'Dr. Meera Patel',
          email: 'meera.patel@neurovision.com',
          phone: '+91-9876543213',
          clinic_id: EXISTING_CLINIC_ID,
          availability: 'Tue-Sat 9:00 AM - 4:00 PM',
          bio: 'Neurologist with expertise in stroke treatment, movement disorders, and cognitive neurology. Fellowship in epilepsy management.',
          is_active: true
        },
      ]);
    
    if (doctorError) throw doctorError;
    console.log('✅ Doctor records created.');

    console.log('🎉 Database seeding completed successfully!');
    console.log('📊 Seeded data summary:');
    console.log(`  🏥 Clinic: Neurovision (existing)`);
    console.log(`  👥 Users: 4 (1 superadmin, 3 doctors)`);
    console.log('🔗 The seeded data is now available in your Neurovision clinic!');

  } catch (error: unknown) {
    console.error('❌ Database seeding failed:', (error as Error).message);
    console.error('Details:', error);
    process.exit(1);
  }
}

// Execute seeding if this file is run directly
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;

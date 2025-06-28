import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySeeding() {
  console.log('Verifying database seeding...');

  // Check department_types
  const { data: departments, error: deptError } = await supabase
    .from('department_types')
    .select('*');

  if (deptError) {
    console.error('Error fetching departments:', deptError.message);
  } else {
    console.log(`Found ${departments?.length || 0} departments`);
    if (departments?.length) {
      console.log('Department names:', departments.map(d => d.name).join(', '));
    }
  }

  // Check medicines
  const { data: medicines, error: medError } = await supabase
    .from('medicines')
    .select('*');

  if (medError) {
    console.error('Error fetching medicines:', medError.message);
  } else {
    console.log(`\nFound ${medicines?.length || 0} medicines`);
    if (medicines?.length) {
      console.log('First 5 medicines:', medicines.slice(0, 5).map(m => m.name).join(', '));
    }
  }
}

verifySeeding().catch(console.error); 
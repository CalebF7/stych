import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nrnabcsrkpkbavhkjpmq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ybmFiY3Nya3BrYmF2aGtqcG1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNDQyMDUsImV4cCI6MjEwMjcyMDIwNX0.c37ezVKPmop_kacsMIaqjpsbtEusZxWw_2OBOcL3-s0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  console.log('Querying Supabase products...');
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error('Error fetching:', error.message);
    } else {
      console.log('Successfully fetched rows:', data.length);
      data.forEach((row, i) => {
        console.log(`\n[Row ${i + 1}]`);
        console.log('ID:', row.id);
        console.log('Name:', row.name);
        console.log('Price:', row.price);
        console.log('Images JSON:', JSON.stringify(row.images));
      });
    }
  } catch (err) {
    console.error('Catch error:', err.message);
  }
}

test();

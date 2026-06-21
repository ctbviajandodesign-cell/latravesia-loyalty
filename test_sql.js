const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://hbwsllomhamlqjnldngs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhid3NsbG9taGFtbHFqbmxkbmdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODI0NjQ1NiwiZXhwIjoyMDkzODIyNDU2fQ.SISaetNeHESVQdBWb9M_Mj8NRskYH3Bzs_IKpJEYFek');
supabase.rpc('exec_sql', { sql: 'SELECT 1' }).then(console.log);

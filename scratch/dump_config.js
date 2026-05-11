const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const url = 'https://hbwsllomhamlqjnldngs.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhid3NsbG9taGFtbHFqbmxkbmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNDY0NTYsImV4cCI6MjA5MzgyMjQ1Nn0.0BrhuDjz7ttiGAvTUDMjsjownRPntaBBThQ98Vce54o';

const supabase = createClient(url, key);

async function main() {
  const { data, error } = await supabase.from('config').select('*');
  if (error) {
    console.error(error);
  } else {
    fs.writeFileSync('scratch/config_dump.json', JSON.stringify(data, null, 2));
    console.log('Dumped config to scratch/config_dump.json');
  }
}

main();

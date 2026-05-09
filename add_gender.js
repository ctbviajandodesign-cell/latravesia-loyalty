const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { error } = await supabase.rpc('execute_sql', {
    sql_query: "ALTER TABLE clientes ADD COLUMN IF NOT EXISTS genero TEXT DEFAULT 'No especificado';"
  });
  
  if (error) console.error(error);
  else console.log('Columna genero añadida');
}
run();

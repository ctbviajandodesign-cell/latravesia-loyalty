const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { error } = await supabase
    .from('config')
    .upsert({ clave: 'resend_api_key', valor: 're_bTZpd7w1_FS5g2KqwK42PySeHsSobRfy1' }, { onConflict: 'clave' });
  
  if (error) console.error(error);
  else console.log('API Key insertada con éxito');
}
run();

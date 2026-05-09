const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
  console.log("Intentando añadir columna 'visitas'...");
  // Nota: Si no tienes habilitado RPC para SQL, esto fallará, 
  // pero intentaremos insertar un campo para forzar el esquema.
  
  // Intento de actualización de esquema vía REST (PostgREST no permite ALTER TABLE directo vía cliente JS generalmente)
  // Así que lo mejor es que el usuario lo corra en el SQL Editor de Supabase si esto falla.
  
  // Sin embargo, podemos intentar una inserción de prueba.
  const { error } = await supabase.from('clientes').select('visitas').limit(1);
  
  if (error) {
    console.log("La columna 'visitas' NO existe o hay un error:", error.message);
    console.log("\n⚠️ ACCIÓN REQUERIDA:");
    console.log("Por favor, ve a tu panel de Supabase > SQL Editor y pega este código:");
    console.log("\nALTER TABLE clientes ADD COLUMN IF NOT EXISTS visitas INTEGER DEFAULT 0;");
  } else {
    console.log("¡La columna 'visitas' ya existe! El error podría ser caché.");
  }
}

fix();

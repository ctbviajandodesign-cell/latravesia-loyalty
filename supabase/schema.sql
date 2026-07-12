-- ============================================================
-- La Travesía Loyalty — Schema completo (actualizado)
-- ============================================================

-- CLIENTES
create table clientes (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  apellido text not null,
  telefono text unique not null,
  email text,
  fecha_nacimiento date,
  genero text check (genero in ('Masculino', 'Femenino', 'Otro')),
  total_visitas integer default 1,
  visitas integer default 1,
  fecha_ultima_visita date,
  acepta_marketing boolean default true,
  created_at timestamp default now()
);

-- RULETAS
create table ruletas (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  fecha_inicio date,
  fecha_fin date,
  dias text[] default array['viernes','sabado','domingo'],
  condicion text default 'todos',
  visitas_minimas integer default 0,
  activa boolean default true,
  configuracion jsonb,
  created_at timestamp default now()
);

-- PREMIOS
create table premios (
  id uuid default gen_random_uuid() primary key,
  ruleta_id uuid references ruletas(id) on delete cascade,
  nombre text not null,
  descripcion text,
  emoji text default '🎁',
  probabilidad float default 1.0,
  stock integer default -1,
  activo boolean default true,
  orden integer default 0,
  created_at timestamp default now()
);

-- VISITAS
create table visitas (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid references clientes(id) on delete cascade,
  fecha date default current_date,
  ruleta_id uuid references ruletas(id) on delete set null,
  premio_ganado text,
  created_at timestamp default now(),
  unique(cliente_id, fecha)
);

-- CONFIG (clave-valor global)
create table config (
  clave text primary key,
  valor text
);

-- Valores por defecto
insert into config (clave, valor) values
  ('nombre_restaurante', 'La Travesía'),
  ('pin_validacion', '1234'),
  ('visitas_para_premio', '10'),
  ('google_maps_link', ''),
  ('instagram_link', ''),
  ('facebook_link', ''),
  ('tiktok_link', ''),
  ('whatsapp_group_link', ''),
  ('whatsapp_join_label', 'Unirme al grupo de WhatsApp de la comunidad'),
  ('whatsapp_join_enabled', 'true'),
  ('admin_email', ''),
  ('admin_whatsapp', ''),
  ('resend_api_key', ''),
  ('welcome_email_subject', '¡Bienvenido al Club La Travesía!'),
  ('welcome_email_body', 'Hola {nombre}, ya eres parte de nuestra comunidad. Te esperamos cada fin de semana.'),
  ('welcome_image_url', ''),
  ('birthday_email_subject', '¡Feliz Cumpleaños de parte de La Travesía!'),
  ('birthday_email_body', 'Hola {nombre}, en tu día especial tenemos una sorpresa para ti. ¡Ven y reclamar tu regalo!'),
  ('birthday_image_url', ''),
  ('loyalty_email_subject', '¡Felicidades! Has alcanzado tu meta de visitas'),
  ('loyalty_email_body', 'Hola {nombre}, has completado tus visitas. ¡Ven a reclamar tu premio exclusivo!'),
  ('loyalty_image_url', ''),
  ('premio_visitas', 'Menú completo gratis');

-- ============================================================
-- SEGURIDAD (RLS)
-- ============================================================
alter table config enable row level security;
alter table clientes enable row level security;
alter table ruletas enable row level security;
alter table premios enable row level security;
alter table visitas enable row level security;

-- Politicas Públicas de Lectura (Configuración y Ruletas)
create policy "Config es publica para leer" on config for select using (true);
create policy "Ruletas son publicas para leer" on ruletas for select using (true);
create policy "Premios son publicos para leer" on premios for select using (true);

-- Nota: clientes y visitas no tienen políticas públicas, 
-- todo el acceso desde el frontend debe realizarse mediante Server Actions 
-- (que usan Service Role Key y bypassean el RLS).

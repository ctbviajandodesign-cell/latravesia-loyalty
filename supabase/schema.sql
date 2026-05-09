-- CLIENTES
create table clientes (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  apellido text not null,
  telefono text unique not null,
  email text,
  fecha_nacimiento date,
  total_visitas integer default 1,
  fecha_ultima_visita date,
  como_conocio text,
  acepta_marketing boolean default true,
  created_at timestamp default now()
);

-- VISITAS
create table visitas (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid references clientes(id),
  fecha date default current_date,
  ruleta_id uuid references ruletas(id),
  premio_ganado text,
  created_at timestamp default now(),
  unique(cliente_id, fecha)
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
  created_at timestamp default now()
);

-- PREMIOS
create table premios (
  id uuid default gen_random_uuid() primary key,
  ruleta_id uuid references ruletas(id) on delete cascade,
  nombre text not null,
  emoji text default '🎁',
  activo boolean default true,
  orden integer default 0,
  created_at timestamp default now()
);

-- CONFIG
create table config (
  clave text primary key,
  valor text
);

insert into config (clave, valor) values
  ('nombre_restaurante', 'La Travesía'),
  ('link_whatsapp', ''),
  ('link_instagram', 'https://instagram.com/latravesia'),
  ('link_facebook', 'https://facebook.com/latravesia'),
  ('link_tiktok', 'https://tiktok.com/@latravesia'),
  ('mensaje_cumpleanos_email', 
   'Hola {{nombre}}, en tu cumpleaños te tenemos una sorpresa especial. Ven a La Travesía y presenta tu cédula para reclamar tu regalo. ¡Te esperamos!'),
  ('mensaje_cumpleanos_whatsapp',
   '🎂 ¡Feliz cumpleaños {{nombre}}! En La Travesía tenemos un regalo especial para ti. Ven este fin de semana, presenta tu cédula y sorpréndete 🎉'),
  ('premio_cumpleanos', 'Postre de cumpleaños gratis'),
  ('visitas_para_premio', '10'),
  ('premio_visitas', 'Menú completo gratis');

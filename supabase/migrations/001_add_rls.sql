-- ============================================================
-- Migración 001: Habilitar Row Level Security (RLS)
-- ============================================================
-- IMPORTANTE: Antes de aplicar esta migración, las páginas
-- del admin dashboard deben migrarse para usar supabaseAdmin
-- (service role key) en lugar del cliente anon. De lo contrario,
-- las operaciones de escritura del admin fallarán.
--
-- El cliente service_role bypassa RLS automáticamente.
-- ============================================================

-- Habilitar RLS en todas las tablas
alter table clientes enable row level security;
alter table visitas enable row level security;
alter table ruletas enable row level security;
alter table premios enable row level security;
alter table config enable row level security;

-- ----------------------------------------------------------------
-- CLIENTES
-- ----------------------------------------------------------------
-- Registro público (anon puede insertar nuevos clientes)
create policy "clientes_insert_anon"
  on clientes for insert
  to anon
  with check (true);

-- Lectura pública para validar check-in por ID
create policy "clientes_select_anon"
  on clientes for select
  to anon
  using (true);

-- Solo service_role puede actualizar y eliminar
create policy "clientes_update_service"
  on clientes for update
  to service_role
  using (true);

create policy "clientes_delete_service"
  on clientes for delete
  to service_role
  using (true);

-- ----------------------------------------------------------------
-- VISITAS
-- ----------------------------------------------------------------
create policy "visitas_insert_anon"
  on visitas for insert
  to anon
  with check (true);

create policy "visitas_select_anon"
  on visitas for select
  to anon
  using (true);

create policy "visitas_update_service"
  on visitas for update
  to service_role
  using (true);

create policy "visitas_delete_service"
  on visitas for delete
  to service_role
  using (true);

-- ----------------------------------------------------------------
-- RULETAS (solo lectura pública, escritura solo admin)
-- ----------------------------------------------------------------
create policy "ruletas_select_anon"
  on ruletas for select
  to anon
  using (true);

create policy "ruletas_write_service"
  on ruletas for all
  to service_role
  using (true);

-- ----------------------------------------------------------------
-- PREMIOS (solo lectura pública)
-- ----------------------------------------------------------------
create policy "premios_select_anon"
  on premios for select
  to anon
  using (true);

create policy "premios_write_service"
  on premios for all
  to service_role
  using (true);

-- ----------------------------------------------------------------
-- CONFIG (solo lectura pública, escritura solo admin)
-- ----------------------------------------------------------------
create policy "config_select_anon"
  on config for select
  to anon
  using (true);

create policy "config_write_service"
  on config for all
  to service_role
  using (true);

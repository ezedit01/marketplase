-- =========================================================
-- MIGRACIÓN 007 — SERVICIOS LOCALES (ETAPA 4)
-- Ejecutar en Supabase: SQL Editor > New query, DESPUÉS de 006.
--
-- Mismo patrón que "businesses": tabla independiente, no se mezcla con
-- listings ni con businesses. A diferencia de un negocio, un servicio no
-- tiene local/dirección fija necesariamente, así que no pedimos ese campo
-- obligatorio, y reutilizamos la foto de perfil del usuario en vez de
-- pedir subir una imagen nueva (menos fricción para publicar).
-- =========================================================

create table service_categories (
  id serial primary key,
  name text not null,
  slug text unique not null,
  order_index int not null default 0
);

insert into service_categories (name, slug, order_index) values
  ('Electricistas', 'electricistas', 1),
  ('Plomeros', 'plomeros', 2),
  ('Albañiles', 'albaniles', 3),
  ('Mecánicos', 'mecanicos', 4),
  ('Técnicos', 'tecnicos', 5),
  ('Fotógrafos', 'fotografos', 6),
  ('Diseñadores', 'disenadores', 7),
  ('Profesores', 'profesores', 8),
  ('Otros profesionales', 'otros-profesionales', 9);

create table services (
  id uuid default gen_random_uuid() primary key,
  provider_id uuid references profiles(id) on delete cascade not null,
  title text not null, -- ej: "Electricista matriculado"
  slug text unique not null,
  category_id int references service_categories(id),
  description text,
  location text, -- zona donde trabaja, texto libre
  whatsapp text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index services_category_idx on services(category_id);
create index services_status_idx on services(status);
create index services_provider_idx on services(provider_id);

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table service_categories enable row level security;

create policy "Categorías de servicio públicas para lectura"
  on service_categories for select using (true);

create policy "Solo admin modifica categorías de servicio"
  on service_categories for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

alter table services enable row level security;

create policy "Servicios activos visibles para todos"
  on services for select using (
    status = 'active' or provider_id = auth.uid()
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Usuario autenticado puede publicar su servicio"
  on services for insert with check (auth.uid() = provider_id);

create policy "Prestador edita su propio servicio"
  on services for update using (
    auth.uid() = provider_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Prestador elimina su propio servicio"
  on services for delete using (
    auth.uid() = provider_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

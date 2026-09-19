-- =========================================================
-- MIGRACIÓN 011 — PUNTO VIAJES + COMISIONES/ENCOMIENDAS
-- Ejecutar en Supabase: SQL Editor > New query, DESPUÉS de 010.
--
-- Dos tablas independientes (mismo criterio que negocios/servicios/etc):
-- "trips" (alguien ya va a viajar y ofrece lugares) y "errands" (encargos
-- — traer algo, comprar algo, un trámite — que pueden ser ofrecidos por
-- quien viaja, o pedidos por quien necesita el encargo, sin depender de
-- que exista primero un viaje publicado).
-- =========================================================

create table travel_destinations (
  id serial primary key,
  name text not null,
  slug text unique not null,
  order_index int not null default 0
);

insert into travel_destinations (name, slug, order_index) values
  ('Santiago del Estero', 'santiago-del-estero', 1),
  ('Ojo de Agua', 'ojo-de-agua', 2),
  ('Sumampa', 'sumampa', 3),
  ('Córdoba', 'cordoba', 4),
  ('Otro destino', 'otro-destino', 5);

-- =========================================================
-- VIAJES
-- =========================================================
create table trips (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  slug text unique not null,
  origin text not null default 'Sol de Julio',
  destination_id int references travel_destinations(id) not null,
  trip_date date not null,
  departure_time text, -- texto libre, ej: "07:30"
  return_time text, -- opcional, ej: "18:00"
  round_trip boolean not null default false,
  seats_available int not null default 1,
  price text, -- texto libre: "$3000" o "Consultar"
  description text,
  whatsapp text,
  status text not null default 'active' check (status in ('active', 'completed', 'deleted')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index trips_destination_idx on trips(destination_id);
create index trips_date_idx on trips(trip_date);
create index trips_status_idx on trips(status);
create index trips_user_idx on trips(user_id);

alter table trips enable row level security;

create policy "Viajes visibles para todos"
  on trips for select using (
    status in ('active', 'completed') or user_id = auth.uid()
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Usuario autenticado publica un viaje"
  on trips for insert with check (auth.uid() = user_id);

create policy "Usuario edita su propio viaje"
  on trips for update using (
    auth.uid() = user_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Usuario elimina su propio viaje"
  on trips for delete using (
    auth.uid() = user_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- =========================================================
-- COMISIONES / ENCOMIENDAS
-- =========================================================
create table errands (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  slug text unique not null,
  mode text not null check (mode in ('ofrezco', 'necesito')),
  errand_type text not null check (
    errand_type in ('encomiendas', 'compras', 'tramites', 'retiro_paquetes', 'traslado_objetos', 'otro')
  ),
  origin text not null default 'Sol de Julio',
  destination_id int references travel_destinations(id) not null,
  errand_date date, -- fecha del viaje u otra fecha límite, opcional
  description text,
  budget text, -- texto libre: "$1000" o "A convenir"
  whatsapp text,
  status text not null default 'active' check (status in ('active', 'completed', 'deleted')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index errands_destination_idx on errands(destination_id);
create index errands_mode_idx on errands(mode);
create index errands_type_idx on errands(errand_type);
create index errands_status_idx on errands(status);
create index errands_user_idx on errands(user_id);

alter table errands enable row level security;

create policy "Comisiones visibles para todos"
  on errands for select using (
    status in ('active', 'completed') or user_id = auth.uid()
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Usuario autenticado publica una comision"
  on errands for insert with check (auth.uid() = user_id);

create policy "Usuario edita su propia comision"
  on errands for update using (
    auth.uid() = user_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Usuario elimina su propia comision"
  on errands for delete using (
    auth.uid() = user_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

alter table travel_destinations enable row level security;

create policy "Destinos públicos para lectura"
  on travel_destinations for select using (true);

create policy "Solo admin modifica destinos"
  on travel_destinations for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- =========================================================
-- REPORTES: extender la tabla existente para cubrir viajes y comisiones
-- (en vez de duplicar el sistema de reportes que ya existe para listings)
-- =========================================================
alter table reports alter column listing_id drop not null;
alter table reports add column if not exists trip_id uuid references trips(id) on delete cascade;
alter table reports add column if not exists errand_id uuid references errands(id) on delete cascade;
alter table reports add constraint reports_target_check check (
  (listing_id is not null)::int + (trip_id is not null)::int + (errand_id is not null)::int = 1
);

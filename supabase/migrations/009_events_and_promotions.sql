-- =========================================================
-- MIGRACIÓN 009 — EVENTOS Y PROMOCIONES (ETAPA 5, parte 2)
-- Ejecutar en Supabase: SQL Editor > New query, DESPUÉS de 008.
-- =========================================================

-- =========================================================
-- EVENTOS
-- =========================================================
create table event_categories (
  id serial primary key,
  name text not null,
  slug text unique not null,
  order_index int not null default 0
);

insert into event_categories (name, slug, order_index) values
  ('Deportivo', 'deportivo', 1),
  ('Cultural', 'cultural', 2),
  ('Feria', 'feria', 3),
  ('Fiesta', 'fiesta', 4),
  ('Comunitario', 'comunitario', 5),
  ('Otros', 'otros-evento', 6);

create table events (
  id uuid default gen_random_uuid() primary key,
  organizer_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  slug text unique not null,
  category_id int references event_categories(id),
  description text,
  location text,
  event_date date not null,
  event_time text, -- texto libre, ej: "21:00" o "Desde las 18hs"
  whatsapp text, -- opcional, para consultas
  status text not null default 'active' check (status in ('active', 'cancelled', 'deleted')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_date_idx on events(event_date);
create index events_category_idx on events(category_id);
create index events_status_idx on events(status);
create index events_organizer_idx on events(organizer_id);

alter table event_categories enable row level security;

create policy "Categorías de evento públicas para lectura"
  on event_categories for select using (true);

create policy "Solo admin modifica categorías de evento"
  on event_categories for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

alter table events enable row level security;

create policy "Eventos visibles para todos"
  on events for select using (
    status in ('active', 'cancelled') or organizer_id = auth.uid()
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Usuario autenticado puede publicar un evento"
  on events for insert with check (auth.uid() = organizer_id);

create policy "Organizador edita su propio evento"
  on events for update using (
    auth.uid() = organizer_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Organizador elimina su propio evento"
  on events for delete using (
    auth.uid() = organizer_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- =========================================================
-- PROMOCIONES (siempre ligadas a un negocio existente)
-- =========================================================
create table promotions (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade not null,
  title text not null, -- ej: "2x1 en hamburguesas"
  slug text unique not null,
  discount_info text, -- ej: "20% OFF", "2x1", texto libre
  description text,
  starts_at date,
  ends_at date, -- si es null, no tiene vencimiento definido
  status text not null default 'active' check (status in ('active', 'inactive')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index promotions_business_idx on promotions(business_id);
create index promotions_status_idx on promotions(status);
create index promotions_ends_idx on promotions(ends_at);

alter table promotions enable row level security;

create policy "Promociones activas visibles para todos"
  on promotions for select using (
    status = 'active'
    or exists (select 1 from businesses where businesses.id = promotions.business_id and businesses.owner_id = auth.uid())
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Dueño del negocio crea promociones de su negocio"
  on promotions for insert with check (
    exists (select 1 from businesses where businesses.id = promotions.business_id and businesses.owner_id = auth.uid())
  );

create policy "Dueño del negocio edita sus promociones"
  on promotions for update using (
    exists (select 1 from businesses where businesses.id = promotions.business_id and businesses.owner_id = auth.uid())
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Dueño del negocio elimina sus promociones"
  on promotions for delete using (
    exists (select 1 from businesses where businesses.id = promotions.business_id and businesses.owner_id = auth.uid())
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

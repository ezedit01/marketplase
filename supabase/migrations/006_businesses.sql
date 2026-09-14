-- =========================================================
-- MIGRACIÓN 006 — NEGOCIOS LOCALES (ETAPA 3)
-- Ejecutar en Supabase: SQL Editor > New query, DESPUÉS de 005.
--
-- Diseño: los negocios son una entidad separada de "listings" (ver
-- ARCHITECTURE.md). No se mezclan con el marketplace de compra/venta;
-- es un directorio aparte que convive en la misma plataforma.
-- =========================================================

-- =========================================================
-- CATEGORÍAS DE NEGOCIO (taxonomía separada de las de productos)
-- =========================================================
create table business_categories (
  id serial primary key,
  name text not null,
  slug text unique not null,
  order_index int not null default 0
);

insert into business_categories (name, slug, order_index) values
  ('Ferretería', 'ferreteria', 1),
  ('Supermercado', 'supermercado', 2),
  ('Rotisería', 'rotiseria', 3),
  ('Tienda de ropa', 'tienda-de-ropa', 4),
  ('Peluquería y Barbería', 'peluqueria-y-barberia', 5),
  ('Talleres', 'talleres', 6),
  ('Panadería', 'panaderia', 7),
  ('Restaurante', 'restaurante', 8),
  ('Otros', 'otros-negocio', 9);

-- =========================================================
-- NEGOCIOS
-- =========================================================
create table businesses (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  slug text unique not null,
  category_id int references business_categories(id),
  logo_url text,
  description text,
  address text,
  whatsapp text,
  hours text, -- texto libre por ahora, ej: "Lun a Vie 9-13 y 17-21, Sáb 9-13"
  status text not null default 'active' check (status in ('active', 'inactive')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index businesses_category_idx on businesses(category_id);
create index businesses_status_idx on businesses(status);
create index businesses_owner_idx on businesses(owner_id);

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table business_categories enable row level security;

create policy "Categorías de negocio públicas para lectura"
  on business_categories for select using (true);

create policy "Solo admin modifica categorías de negocio"
  on business_categories for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

alter table businesses enable row level security;

create policy "Negocios activos visibles para todos"
  on businesses for select using (
    status = 'active' or owner_id = auth.uid()
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Usuario autenticado puede crear su negocio"
  on businesses for insert with check (auth.uid() = owner_id);

create policy "Dueño edita su propio negocio"
  on businesses for update using (
    auth.uid() = owner_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Dueño elimina su propio negocio"
  on businesses for delete using (
    auth.uid() = owner_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- =========================================================
-- STORAGE: logos de negocio
-- =========================================================
insert into storage.buckets (id, name, public)
values ('business-logos', 'business-logos', true)
on conflict (id) do nothing;

create policy "Logos de negocio son públicos"
  on storage.objects for select using (bucket_id = 'business-logos');

create policy "Usuario autenticado sube logo de negocio"
  on storage.objects for insert with check (
    bucket_id = 'business-logos' and auth.role() = 'authenticated'
  );

create policy "Usuario reemplaza su propio logo de negocio"
  on storage.objects for update using (
    bucket_id = 'business-logos' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Usuario elimina su propio logo de negocio"
  on storage.objects for delete using (
    bucket_id = 'business-logos' and auth.uid()::text = (storage.foldername(name))[1]
  );

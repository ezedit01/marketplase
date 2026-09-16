-- =========================================================
-- MIGRACIÓN 008 — EMPLEOS LOCALES (ETAPA 5, parte 1)
-- Ejecutar en Supabase: SQL Editor > New query, DESPUÉS de 007.
--
-- Mismo patrón que businesses/services: tabla independiente. El "estado"
-- de un empleo se parece más al de listings (activo/cubierto/eliminado)
-- que al de negocios/servicios, porque una búsqueda laboral SÍ se cierra
-- cuando se cubre el puesto — como marcar un producto como vendido.
-- =========================================================

create table job_categories (
  id serial primary key,
  name text not null,
  slug text unique not null,
  order_index int not null default 0
);

insert into job_categories (name, slug, order_index) values
  ('Ventas', 'ventas', 1),
  ('Gastronomía', 'gastronomia', 2),
  ('Construcción', 'construccion', 3),
  ('Administración', 'administracion', 4),
  ('Oficios', 'oficios', 5),
  ('Otros', 'otros-empleo', 6);

create table jobs (
  id uuid default gen_random_uuid() primary key,
  poster_id uuid references profiles(id) on delete cascade not null,
  title text not null, -- ej: "Busco vendedor para local de ropa"
  slug text unique not null,
  category_id int references job_categories(id),
  employment_type text check (employment_type in ('tiempo_completo', 'medio_tiempo', 'temporal', 'por_dia')),
  description text,
  location text,
  salary_info text, -- texto libre, ej: "A convenir" o "$400.000 + comisión"
  whatsapp text,
  status text not null default 'active' check (status in ('active', 'closed', 'deleted')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index jobs_category_idx on jobs(category_id);
create index jobs_status_idx on jobs(status);
create index jobs_poster_idx on jobs(poster_id);

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table job_categories enable row level security;

create policy "Categorías de empleo públicas para lectura"
  on job_categories for select using (true);

create policy "Solo admin modifica categorías de empleo"
  on job_categories for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

alter table jobs enable row level security;

create policy "Empleos activos o cubiertos visibles para todos"
  on jobs for select using (
    status in ('active', 'closed') or poster_id = auth.uid()
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Usuario autenticado puede publicar un empleo"
  on jobs for insert with check (auth.uid() = poster_id);

create policy "Quien publicó edita su propio empleo"
  on jobs for update using (
    auth.uid() = poster_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Quien publicó elimina su propio empleo"
  on jobs for delete using (
    auth.uid() = poster_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

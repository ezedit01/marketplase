-- =========================================================
-- MARKETPLACE DEL PUEBLO — SCHEMA INICIAL (MVP)
-- Ejecutar en Supabase: Dashboard > SQL Editor > New query
-- =========================================================

-- Extensión para búsqueda de texto (fuzzy search)
create extension if not exists pg_trgm;

-- =========================================================
-- 1. PROFILES (extiende auth.users)
-- =========================================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  whatsapp text,
  location text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- Se crea automáticamente un profile cuando alguien se registra
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================
-- 2. CATEGORIES
-- =========================================================
create table categories (
  id serial primary key,
  name text not null,
  slug text unique not null,
  icon text,
  order_index int not null default 0
);

insert into categories (name, slug, order_index) values
  ('Vehículos', 'vehiculos', 1),
  ('Motos', 'motos', 2),
  ('Celulares', 'celulares', 3),
  ('Electrónica', 'electronica', 4),
  ('Hogar', 'hogar', 5),
  ('Muebles', 'muebles', 6),
  ('Ropa', 'ropa', 7),
  ('Herramientas', 'herramientas', 8),
  ('Inmuebles', 'inmuebles', 9),
  ('Animales', 'animales', 10),
  ('Deportes', 'deportes', 11),
  ('Otros', 'otros', 12);

-- =========================================================
-- 3. LISTINGS (publicaciones)
-- =========================================================
create table listings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  slug text unique not null,
  description text,
  price numeric,
  category_id int references categories(id),
  condition text check (condition in ('new', 'used')),
  location text,
  status text not null default 'active' check (status in ('active', 'sold', 'deleted')),
  featured boolean not null default false,
  views int not null default 0,
  search_vector tsvector generated always as (
    setweight(to_tsvector('spanish', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(description, '')), 'B')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_search_idx on listings using gin(search_vector);
create index listings_category_idx on listings(category_id);
create index listings_status_idx on listings(status);
create index listings_created_idx on listings(created_at desc);
create index listings_title_trgm_idx on listings using gin (title gin_trgm_ops);

-- =========================================================
-- 4. LISTING_IMAGES
-- =========================================================
create table listing_images (
  id serial primary key,
  listing_id uuid references listings(id) on delete cascade not null,
  url text not null,
  is_main boolean not null default false,
  order_index int not null default 0
);

create index listing_images_listing_idx on listing_images(listing_id);

-- =========================================================
-- 5. REPORTS
-- =========================================================
create table reports (
  id serial primary key,
  listing_id uuid references listings(id) on delete cascade not null,
  reporter_id uuid references profiles(id) on delete set null,
  reason text not null check (reason in ('estafa', 'prohibido', 'inapropiado', 'falsa', 'otro')),
  details text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now()
);

-- =========================================================
-- 6. FUNCIÓN: incrementar vistas (evita condiciones de carrera)
-- =========================================================
create function increment_listing_views(listing_id_input uuid)
returns void as $$
begin
  update listings set views = views + 1 where id = listing_id_input;
end;
$$ language plpgsql security definer;

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

-- PROFILES
alter table profiles enable row level security;

create policy "Profiles públicos para lectura"
  on profiles for select using (true);

create policy "Usuario edita su propio perfil"
  on profiles for update using (auth.uid() = id);

-- CATEGORIES
alter table categories enable row level security;

create policy "Categorías públicas para lectura"
  on categories for select using (true);

create policy "Solo admin modifica categorías"
  on categories for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- LISTINGS
alter table listings enable row level security;

create policy "Publicaciones activas visibles para todos"
  on listings for select using (
    status = 'active' or status = 'sold' or user_id = auth.uid()
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Usuario autenticado puede publicar"
  on listings for insert with check (auth.uid() = user_id);

create policy "Usuario edita sus propias publicaciones"
  on listings for update using (
    auth.uid() = user_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Usuario elimina sus propias publicaciones"
  on listings for delete using (
    auth.uid() = user_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- LISTING_IMAGES
alter table listing_images enable row level security;

create policy "Imágenes visibles para todos"
  on listing_images for select using (true);

create policy "Dueño de la publicación gestiona sus imágenes"
  on listing_images for all using (
    exists (
      select 1 from listings
      where listings.id = listing_images.listing_id
      and (listings.user_id = auth.uid()
        or exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
    )
  );

-- REPORTS
alter table reports enable row level security;

create policy "Cualquier usuario autenticado puede reportar"
  on reports for insert with check (auth.uid() = reporter_id);

create policy "Solo admin ve y gestiona reportes"
  on reports for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Solo admin actualiza reportes"
  on reports for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- =========================================================
-- STORAGE: bucket para imágenes de publicaciones
-- (esto también se puede crear desde el Dashboard > Storage)
-- =========================================================
insert into storage.buckets (id, name, public)
values ('listings-images', 'listings-images', true)
on conflict (id) do nothing;

create policy "Imágenes de publicaciones son públicas"
  on storage.objects for select using (bucket_id = 'listings-images');

create policy "Usuario autenticado sube imágenes"
  on storage.objects for insert with check (
    bucket_id = 'listings-images' and auth.role() = 'authenticated'
  );

create policy "Usuario elimina sus propias imágenes"
  on storage.objects for delete using (
    bucket_id = 'listings-images' and auth.uid()::text = (storage.foldername(name))[1]
  );

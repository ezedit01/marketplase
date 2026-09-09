-- =========================================================
-- MIGRACIÓN 002 — FAVORITOS + PREPARACIÓN DE ALERTAS
-- Ejecutar en Supabase: SQL Editor > New query, DESPUÉS de schema.sql
-- =========================================================

-- =========================================================
-- FAVORITOS
-- =========================================================
create table favorites (
  user_id uuid references profiles(id) on delete cascade not null,
  listing_id uuid references listings(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create index favorites_user_idx on favorites(user_id);
create index favorites_listing_idx on favorites(listing_id);

alter table favorites enable row level security;

create policy "Usuario ve sus propios favoritos"
  on favorites for select using (auth.uid() = user_id);

create policy "Usuario agrega sus propios favoritos"
  on favorites for insert with check (auth.uid() = user_id);

create policy "Usuario elimina sus propios favoritos"
  on favorites for delete using (auth.uid() = user_id);

-- =========================================================
-- PREPARACIÓN PARA ALERTAS DE BÚSQUEDA (fase futura)
-- No se usa todavía desde la UI. Se deja creada para no romper
-- la arquitectura cuando se implemente el feature completo
-- (requiere un cron/edge function que compare listings nuevos
-- contra estas alertas y dispare una notificación).
-- =========================================================
create table search_alerts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  query text,
  category_id int references categories(id),
  min_price numeric,
  max_price numeric,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index search_alerts_user_idx on search_alerts(user_id);
create index search_alerts_active_idx on search_alerts(active) where active = true;

alter table search_alerts enable row level security;

create policy "Usuario gestiona sus propias alertas"
  on search_alerts for all using (auth.uid() = user_id);

-- =========================================================
-- CONTADOR DE FAVORITOS EN LISTINGS (para ordenar/destacar
-- por popularidad más adelante sin tener que hacer un COUNT
-- costoso en cada query de listado)
-- =========================================================
alter table listings add column if not exists favorites_count int not null default 0;

create function public.handle_favorite_change()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update listings set favorites_count = favorites_count + 1 where id = new.listing_id;
  elsif (TG_OP = 'DELETE') then
    update listings set favorites_count = greatest(favorites_count - 1, 0) where id = old.listing_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_favorite_change
  after insert or delete on favorites
  for each row execute procedure public.handle_favorite_change();

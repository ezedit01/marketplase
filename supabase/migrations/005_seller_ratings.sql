-- =========================================================
-- MIGRACIÓN 005 — CALIFICACIONES DE VENDEDORES
-- Ejecutar en Supabase: SQL Editor > New query, DESPUÉS de 004.
-- =========================================================

create table seller_ratings (
  id uuid default gen_random_uuid() primary key,
  seller_id uuid references profiles(id) on delete cascade not null,
  rater_id uuid references profiles(id) on delete cascade not null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (seller_id, rater_id) -- una calificación por persona por vendedor
);

create index seller_ratings_seller_idx on seller_ratings(seller_id);

alter table seller_ratings enable row level security;

create policy "Calificaciones públicas para lectura"
  on seller_ratings for select using (true);

create policy "Usuario califica a otros, no a si mismo"
  on seller_ratings for insert with check (auth.uid() = rater_id and rater_id != seller_id);

create policy "Usuario edita su propia calificacion"
  on seller_ratings for update using (auth.uid() = rater_id) with check (auth.uid() = rater_id);

create policy "Usuario elimina su propia calificacion"
  on seller_ratings for delete using (auth.uid() = rater_id);

-- Promedio y cantidad cacheados en profiles, para no tener que calcular
-- el promedio cada vez que se muestra un perfil o una publicación.
alter table profiles add column if not exists rating_avg numeric;
alter table profiles add column if not exists rating_count int not null default 0;

create function public.handle_rating_change()
returns trigger as $$
declare
  target_seller uuid;
begin
  target_seller := coalesce(new.seller_id, old.seller_id);
  update profiles set
    rating_avg = (select round(avg(rating)::numeric, 2) from seller_ratings where seller_id = target_seller),
    rating_count = (select count(*) from seller_ratings where seller_id = target_seller)
  where id = target_seller;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_rating_change
  after insert or update or delete on seller_ratings
  for each row execute procedure public.handle_rating_change();

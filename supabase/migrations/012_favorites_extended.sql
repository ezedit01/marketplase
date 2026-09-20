-- =========================================================
-- MIGRACIÓN 012 — FAVORITOS DE NEGOCIOS Y SERVICIOS
-- Ejecutar en Supabase: SQL Editor > New query, DESPUÉS de 011.
--
-- La tabla favorites original tenía (user_id, listing_id) como primary
-- key compuesta con listing_id NOT NULL. Para poder guardar favoritos de
-- negocios/servicios también, hace falta una primary key propia (id) y
-- que cada columna de "destino" sea opcional — con un check constraint
-- que exige que se llene exactamente una (mismo patrón que ya usamos en
-- reports para viajes/comisiones).
-- =========================================================

alter table favorites drop constraint favorites_pkey;

alter table favorites add column id uuid default gen_random_uuid();
alter table favorites add column business_id uuid references businesses(id) on delete cascade;
alter table favorites add column service_id uuid references services(id) on delete cascade;

alter table favorites alter column listing_id drop not null;

update favorites set id = gen_random_uuid() where id is null;
alter table favorites alter column id set not null;
alter table favorites add primary key (id);

alter table favorites add constraint favorites_target_check check (
  (listing_id is not null)::int + (business_id is not null)::int + (service_id is not null)::int = 1
);

-- Evita que la misma persona favorite dos veces la misma cosa
create unique index favorites_user_listing_uidx on favorites(user_id, listing_id) where listing_id is not null;
create unique index favorites_user_business_uidx on favorites(user_id, business_id) where business_id is not null;
create unique index favorites_user_service_uidx on favorites(user_id, service_id) where service_id is not null;

create index favorites_business_idx on favorites(business_id);
create index favorites_service_idx on favorites(service_id);

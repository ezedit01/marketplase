-- =========================================================
-- MIGRACIÓN 013 — REPORTAR NEGOCIOS, SERVICIOS, EMPLEOS Y EVENTOS
-- Ejecutar en Supabase: SQL Editor > New query, DESPUÉS de 012.
--
-- Mismo patrón que la migración 011 (que agregó trip_id/errand_id a
-- reports): sumamos las columnas que faltan y reemplazamos el check
-- constraint para que siga exigiendo "exactamente un destino" entre las
-- siete opciones ahora disponibles.
-- =========================================================

alter table reports add column if not exists business_id uuid references businesses(id) on delete cascade;
alter table reports add column if not exists service_id uuid references services(id) on delete cascade;
alter table reports add column if not exists job_id uuid references jobs(id) on delete cascade;
alter table reports add column if not exists event_id uuid references events(id) on delete cascade;

alter table reports drop constraint if exists reports_target_check;
alter table reports add constraint reports_target_check check (
  (listing_id is not null)::int +
  (trip_id is not null)::int +
  (errand_id is not null)::int +
  (business_id is not null)::int +
  (service_id is not null)::int +
  (job_id is not null)::int +
  (event_id is not null)::int = 1
);

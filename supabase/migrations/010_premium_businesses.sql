-- =========================================================
-- MIGRACIÓN 010 — PERFILES COMERCIALES PREMIUM
-- Ejecutar en Supabase: SQL Editor > New query, DESPUÉS de 009.
--
-- Por ahora is_premium lo activa el admin a mano (no hay cobro conectado
-- todavía — eso viene en la etapa de "destacados pagos"). Cuando se arme
-- el cobro real, la lógica de pago simplemente va a terminar poniendo
-- is_premium = true, sin tener que tocar nada de lo que ya existe acá.
-- =========================================================

alter table businesses add column if not exists is_premium boolean not null default false;
alter table businesses add column if not exists cover_image_url text;

-- El bucket de logos ya existe (business-logos, migración 006) y sus
-- políticas de storage no dependen del tipo de imagen, así que la portada
-- se sube al mismo bucket sin necesidad de crear uno nuevo.

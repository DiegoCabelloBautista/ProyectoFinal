-- ============================================================
-- Migración: Sistema de Rachas (Streaks)
-- Ejecutar: docker exec -i gymtrackpro-db-1 mysql -u root -p8326 gymtrack_db < backend/streak_migration.sql
-- ============================================================

USE gymtrack_pro;

-- Añadir columnas solo si no existen (seguro para re-ejecutar)
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS current_streak  INT          NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS longest_streak  INT          NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_workout_date DATE        DEFAULT NULL;

-- Índice para consultas rápidas por fecha del último entrenamiento
CREATE INDEX IF NOT EXISTS idx_users_last_workout ON users(last_workout_date);

SELECT 'Migración de streaks completada ✅' AS resultado;

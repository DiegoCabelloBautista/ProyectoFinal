-- ============================================
-- SCRIPT DE MIGRACIÓN - SISTEMA DE GAMIFICACIÓN
-- GymTrack Pro - v2.0
-- ============================================

-- Seleccionar base de datos
USE gymtrack_db;

-- ============================================
-- 1. AÑADIR CAMPOS DE GAMIFICACIÓN A USERS
-- ============================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INT DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS coins INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_icon VARCHAR(50) DEFAULT 'person';
ALTER TABLE users ADD COLUMN IF NOT EXISTS username_color VARCHAR(20) DEFAULT '#00C9FF';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS title VARCHAR(50) DEFAULT NULL;

-- ============================================
-- 2. CREAR TABLA DE ACHIEVEMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    icon VARCHAR(50) DEFAULT 'emoji_events',
    category VARCHAR(50),
    requirement_value INT,
    xp_reward INT DEFAULT 50,
    coins_reward INT DEFAULT 5
);

-- ============================================
-- 3. CREAR TABLA DE USER_ACHIEVEMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS user_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    achievement_id INT NOT NULL,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
);

-- ============================================
-- 4. CREAR TABLA DE SHOP_ITEMS
-- ============================================

CREATE TABLE IF NOT EXISTS shop_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    item_type VARCHAR(50),
    value VARCHAR(100),
    price INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    required_level INT DEFAULT 1
);

-- ============================================
-- 5. POBLAR TABLA DE SHOP_ITEMS
-- ============================================

-- Avatares
INSERT INTO shop_items (name, description, item_type, value, price, required_level) VALUES
('Avatar Fuego', 'Icono de llama ardiente', 'avatar', 'local_fire_department', 20, 3),
('Avatar Estrella', 'Brilla como una estrella', 'avatar', 'star', 30, 5),
('Avatar Rayo', 'Velocidad y poder', 'avatar', 'flash_on', 40, 8),
('Avatar Diamante', 'Exclusivo y premium', 'avatar', 'diamond', 100, 15),
('Avatar Corona', 'Eres la realeza del gym', 'avatar', 'workspace_premium', 150, 20),
('Avatar Legendario', 'Solo para élite', 'avatar', 'military_tech', 300, 30);

-- Colores
INSERT INTO shop_items (name, description, item_type, value, price, required_level) VALUES
('Verde Neón', 'Brilla en verde', 'color', '#92FE9D', 15, 2),
('Rosa Vibrante', 'Destaca en rosa', 'color', '#FF6B9D', 15, 2),
('Dorado', 'Color premium', 'color', '#FFD700', 50, 10),
('Púrpura Místico', 'Misterioso y elegante', 'color', '#9D4EDD', 60, 12),
('Rojo Fuego', 'Intensidad pura', 'color', '#FF4444', 40, 8),
('Arcoiris', 'Todos los colores', 'color', 'linear-gradient', 200, 25);

-- Títulos
INSERT INTO shop_items (name, description, item_type, value, price, required_level) VALUES
('Título: Novato Dedicado', 'Para los que empiezan con fuerza', 'title', 'Novato Dedicado', 10, 1),
('Título: Guerrero de Hierro', 'Forjado en el gimnasio', 'title', 'Iron Warrior', 80, 15),
('Título: Bestia del Gym', 'Dominas el gimnasio', 'title', 'Gym Beast', 120, 20),
('Título: Leyenda Viviente', 'Tu nombre es leyenda', 'title', 'Gym Legend', 250, 35),
('Título: Dios del Olimpo', 'Has alcanzado lo imposible', 'title', 'Olympus God', 500, 50);

-- Badge
INSERT INTO shop_items (name, description, item_type, value, price, required_level) VALUES
('Badge Verificado', 'Marca de autenticidad', 'badge', 'verified', 75, 10);

-- ============================================
-- 6. POBLAR TABLA DE ACHIEVEMENTS
-- ============================================

-- Logros por Sesiones
INSERT INTO achievements (name, description, icon, category, requirement_value, xp_reward, coins_reward) VALUES
('Primera Sesión', 'Completa tu primer entrenamiento', 'emoji_events', 'sessions', 1, 10, 5),
('5 Sesiones', 'Completa 5 entrenamientos', 'emoji_events', 'sessions', 5, 25, 10),
('10 Sesiones', 'Completa 10 entrenamientos', 'emoji_events', 'sessions', 10, 50, 20),
('25 Sesiones', 'Completa 25 entrenamientos', 'emoji_events', 'sessions', 25, 100, 40),
('50 Sesiones', 'Completa 50 entrenamientos', 'emoji_events', 'sessions', 50, 200, 75),
('100 Sesiones', 'Completa 100 entrenamientos', 'emoji_events', 'sessions', 100, 500, 150);

-- Logros por Volumen
INSERT INTO achievements (name, description, icon, category, requirement_value, xp_reward, coins_reward) VALUES
('1 Tonelada', 'Levanta 1,000 kg totales', 'fitness_center', 'volume', 1000, 30, 15),
('10 Toneladas', 'Levanta 10,000 kg totales', 'fitness_center', 'volume', 10000, 100, 40),
('50 Toneladas', 'Levanta 50,000 kg totales', 'fitness_center', 'volume', 50000, 300, 100),
('100 Toneladas', 'Levanta 100,000 kg totales', 'fitness_center', 'volume', 100000, 600, 200);

-- Logros por Niveles
INSERT INTO achievements (name, description, icon, category, requirement_value, xp_reward, coins_reward) VALUES
('Nivel 5', 'Alcanza el nivel 5', 'trending_up', 'level', 5, 50, 25),
('Nivel 10', 'Alcanza el nivel 10', 'trending_up', 'level', 10, 100, 50),
('Nivel 20', 'Alcanza el nivel 20', 'trending_up', 'level', 20, 250, 100),
('Nivel 30', 'Alcanza el nivel 30', 'trending_up', 'level', 30, 500, 200),
('Nivel 50', 'Alcanza el nivel 50', 'trending_up', 'level', 50, 1000, 500);

-- ============================================
-- 7. ACTUALIZAR USUARIOS EXISTENTES (OPCIONAL)
-- ============================================

-- Dar XP inicial a todos los usuarios existentes
-- UPDATE users SET xp = 100, level = 2, coins = 20;

-- ============================================
-- ¡MIGRACIÓN COMPLETADA!
-- ============================================

SELECT 'Migración completada exitosamente!' AS status;
SELECT COUNT(*) AS total_shop_items FROM shop_items;
SELECT COUNT(*) AS total_achievements FROM achievements;

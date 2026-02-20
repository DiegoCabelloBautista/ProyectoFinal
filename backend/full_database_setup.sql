CREATE DATABASE IF NOT EXISTS gymtrack_pro;
USE gymtrack_pro;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS workout_logs;
DROP TABLE IF EXISTS workout_sessions;
DROP TABLE IF EXISTS routine_exercises;
DROP TABLE IF EXISTS routines;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS user_achievements;
DROP TABLE IF EXISTS achievements;
DROP TABLE IF EXISTS shop_items;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- Crear tabla users con todos los campos (básicos + gamificación)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    -- Campos de gamificación
    xp INT DEFAULT 0,
    level INT DEFAULT 1,
    coins INT DEFAULT 0,
    avatar_icon VARCHAR(50) DEFAULT 'person',
    username_color VARCHAR(20) DEFAULT '#00C9FF',
    is_verified BOOLEAN DEFAULT FALSE,
    title VARCHAR(50) DEFAULT NULL
);

-- Crear tabla exercises
CREATE TABLE IF NOT EXISTS exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    muscle_group VARCHAR(50),
    description TEXT,
    image_url VARCHAR(255)
);

-- Crear tabla routines
CREATE TABLE IF NOT EXISTS routines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Crear tabla routine_exercises
CREATE TABLE IF NOT EXISTS routine_exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    routine_id INT NOT NULL,
    exercise_id INT NOT NULL,
    sets INT DEFAULT 3,
    reps_target INT DEFAULT 10,
    `order` INT DEFAULT 0,
    FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

-- Crear tabla workout_sessions
CREATE TABLE IF NOT EXISTS workout_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    routine_id INT,
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (routine_id) REFERENCES routines(id)
);

-- Crear tabla workout_logs
CREATE TABLE IF NOT EXISTS workout_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    exercise_id INT NOT NULL,
    set_number INT NOT NULL,
    weight FLOAT,
    reps INT,
    rpe INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

-- Crear tabla achievements
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

-- Crear tabla user_achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    achievement_id INT NOT NULL,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
);

-- Crear tabla shop_items
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

-- POBLAR DATOS

-- Shop Items - Avatares
INSERT IGNORE INTO shop_items (name, description, item_type, value, price, required_level) VALUES
('Avatar Fuego', 'Icono de llama ardiente', 'avatar', 'local_fire_department', 20, 3),
('Avatar Estrella', 'Brilla como una estrella', 'avatar', 'star', 30, 5),
('Avatar Rayo', 'Velocidad y poder', 'avatar', 'flash_on', 40, 8),
('Avatar Diamante', 'Exclusivo y premium', 'avatar', 'diamond', 100, 15),
('Avatar Corona', 'Eres la realeza del gym', 'avatar', 'workspace_premium', 150, 20),
('Avatar Legendario', 'Solo para élite', 'avatar', 'military_tech', 300, 30);

-- Shop Items - Colores
INSERT IGNORE INTO shop_items (name, description, item_type, value, price, required_level) VALUES
('Verde Neón', 'Brilla en verde', 'color', '#92FE9D', 15, 2),
('Rosa Vibrante', 'Destaca en rosa', 'color', '#FF6B9D', 15, 2),
('Dorado', 'Color premium', 'color', '#FFD700', 50, 10),
('Púrpura Místico', 'Misterioso y elegante', 'color', '#9D4EDD', 60, 12),
('Rojo Fuego', 'Intensidad pura', 'color', '#FF4444', 40, 8),
('Arcoiris', 'Todos los colores', 'color', 'linear-gradient', 200, 25);

-- Shop Items - Títulos
INSERT IGNORE INTO shop_items (name, description, item_type, value, price, required_level) VALUES
('Título: Novato Dedicado', 'Para los que empiezan con fuerza', 'title', 'Novato Dedicado', 10, 1),
('Título: Guerrero de Hierro', 'Forjado en el gimnasio', 'title', 'Iron Warrior', 80, 15),
('Título: Bestia del Gym', 'Dominas el gimnasio', 'title', 'Gym Beast', 120, 20),
('Título: Leyenda Viviente', 'Tu nombre es leyenda', 'title', 'Gym Legend', 250, 35),
('Título: Dios del Olimpo', 'Has alcanzado lo imposible', 'title', 'Olympus God', 500, 50);

-- Shop Items - Badge
INSERT IGNORE INTO shop_items (name, description, item_type, value, price, required_level) VALUES
('Badge Verificado', 'Marca de autenticidad', 'badge', 'verified', 75, 10);

-- Achievements - Por sesiones
INSERT IGNORE INTO achievements (name, description, icon, category, requirement_value, xp_reward, coins_reward) VALUES
('Primera Sesión', 'Completa tu primer entrenamiento', 'emoji_events', 'sessions', 1, 10, 5),
('5 Sesiones', 'Completa 5 entrenamientos', 'emoji_events', 'sessions', 5, 25, 10),
('10 Sesiones', 'Completa 10 entrenamientos', 'emoji_events', 'sessions', 10, 50, 20),
('25 Sesiones', 'Completa 25 entrenamientos', 'emoji_events', 'sessions', 25, 100, 40),
('50 Sesiones', 'Completa 50 entrenamientos', 'emoji_events', 'sessions', 50, 200, 75),
('100 Sesiones', 'Completa 100 entrenamientos', 'emoji_events', 'sessions', 100, 500, 150);

-- Achievements - Por volumen
INSERT IGNORE INTO achievements (name, description, icon, category, requirement_value, xp_reward, coins_reward) VALUES
('1 Tonelada', 'Levanta 1,000 kg totales', 'fitness_center', 'volume', 1000, 30, 15),
('10 Toneladas', 'Levanta 10,000 kg totales', 'fitness_center', 'volume', 10000, 100, 40),
('50 Toneladas', 'Levanta 50,000 kg totales', 'fitness_center', 'volume', 50000, 300, 100),
('100 Toneladas', 'Levanta 100,000 kg totales', 'fitness_center', 'volume', 100000, 600, 200);

-- Achievements - Por niveles
INSERT IGNORE INTO achievements (name, description, icon, category, requirement_value, xp_reward, coins_reward) VALUES
('Nivel 5', 'Alcanza el nivel 5', 'trending_up', 'level', 5, 50, 25),
('Nivel 10', 'Alcanza el nivel 10', 'trending_up', 'level', 10, 100, 50),
('Nivel 20', 'Alcanza el nivel 20', 'trending_up', 'level', 20, 250, 100),
('Nivel 30', 'Alcanza el nivel 30', 'trending_up', 'level', 30, 500, 200),
('Nivel 50', 'Alcanza el nivel 50', 'trending_up', 'level', 50, 1000, 500);

-- Ejercicios de ejemplo
INSERT IGNORE INTO exercises (name, muscle_group, description) VALUES
('Press de Banca', 'Pecho', 'Ejercicio fundamental para pecho'),
('Sentadilla', 'Piernas', 'El rey de los ejercicios'),
('Peso Muerto', 'Espalda', 'Ejercicio compuesto para espalda'),
('Press Militar', 'Hombros', 'Press de hombros de pie'),
('Remo con Barra', 'Espalda', 'Remo horizontal para dorsales'),
('Curl de Bíceps', 'Brazos', 'Curl con barra para bíceps');

SELECT 'Base de datos creada correctamente!' AS Status;
SELECT COUNT(*) AS TotalShopItems FROM shop_items;
SELECT COUNT(*) AS TotalAchievements FROM achievements;
SELECT COUNT(*) AS TotalExercises FROM exercises;

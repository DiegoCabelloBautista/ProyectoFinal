-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Servidor: db
-- Tiempo de generación: 12-05-2026 a las 13:57:59
-- Versión del servidor: 10.6.25-MariaDB-ubu2204
-- Versión de PHP: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `gymtrack_pro`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `achievements`
--

CREATE TABLE `achievements` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `requirement_value` int(11) DEFAULT NULL,
  `xp_reward` int(11) DEFAULT NULL,
  `coins_reward` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `achievements`
--

INSERT INTO `achievements` (`id`, `name`, `description`, `icon`, `category`, `requirement_value`, `xp_reward`, `coins_reward`) VALUES
(1, 'Primer Paso', 'Completa tu primera sesión de entrenamiento', 'emoji_events', 'sessions', 1, 100, 10),
(2, 'Constancia', 'Mantén una racha de 3 días', 'local_fire_department', 'streak', 3, 200, 20),
(3, 'Guerrero Semanal', 'Completa 5 sesiones de entrenamiento', 'calendar_today', 'sessions', 5, 300, 30),
(4, 'Bestia del Hierro', 'Mueve más de 1000kg en una sesión', 'fitness_center', 'volume', 1000, 500, 50),
(5, 'Corazón de Acero', 'Completa 10 sesiones de cardio', 'Directions_run', 'cardio', 10, 400, 40),
(6, 'Madrugador', 'Entrena antes de las 9:00 AM', 'wb_sunny', 'time', 1, 150, 15),
(7, 'Noctámbulo', 'Entrena después de las 10:00 PM', 'dark_mode', 'time', 1, 150, 15),
(8, 'Coleccionista', 'Compra 5 objetos en la tienda', 'shopping_cart', 'shop', 5, 500, 50),
(9, 'Influencer', 'Recibe 10 likes en tus rutinas', 'favorite', 'social', 10, 600, 60),
(10, 'Filántropo', 'Dale like a 20 rutinas de otros', 'thumb_up', 'social', 20, 200, 20),
(11, 'Crítico', 'Deja 5 valoraciones en rutinas', 'star', 'reviews', 5, 200, 20),
(12, 'Mentor', 'Asigna tu primera rutina como coach', 'school', 'coach', 1, 1000, 100),
(13, 'Cuerpo de Élite', 'Alcanza el Nivel 20', 'workspace_premium', 'level', 20, 2000, 200),
(14, 'Leyenda Viva', 'Alcanza el Nivel 50', 'diamond', 'level', 50, 10000, 1000),
(15, 'Imparable', 'Mantén una racha de 30 días', 'auto_awesome', 'streak', 30, 5000, 500);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `body_metrics`
--

CREATE TABLE `body_metrics` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `weight` float DEFAULT NULL,
  `body_fat` float DEFAULT NULL,
  `arm_cm` float DEFAULT NULL,
  `waist_cm` float DEFAULT NULL,
  `chest_cm` float DEFAULT NULL,
  `leg_cm` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `exercises`
--

CREATE TABLE `exercises` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `muscle_group` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `exercises`
--

INSERT INTO `exercises` (`id`, `name`, `muscle_group`, `description`, `image_url`) VALUES
(1, 'Press de Banca con Barra', 'Pecho', NULL, NULL),
(2, 'Press Inclinado con Mancuernas', 'Pecho', NULL, NULL),
(3, 'Press Declinado', 'Pecho', NULL, NULL),
(4, 'Aperturas en Polea', 'Pecho', NULL, NULL),
(5, 'Flexiones (Push-ups)', 'Pecho', NULL, NULL),
(6, 'Dips de Pecho (Fondos)', 'Pecho', NULL, NULL),
(7, 'Press de Pecho en Máquina', 'Pecho', NULL, NULL),
(8, 'Aperturas con Mancuernas', 'Pecho', NULL, NULL),
(9, 'Cruce de Poleas Altas', 'Pecho', NULL, NULL),
(10, 'Peck Deck (Aperturas Máquina)', 'Pecho', NULL, NULL),
(11, 'Dominadas', 'Espalda', NULL, NULL),
(12, 'Remo con Barra', 'Espalda', NULL, NULL),
(13, 'Jalón al Pecho', 'Espalda', NULL, NULL),
(14, 'Remo en Polea Baja', 'Espalda', NULL, NULL),
(15, 'Pull-over en Polea', 'Espalda', NULL, NULL),
(16, 'Hiperextensiones', 'Espalda', NULL, NULL),
(17, 'Remo con Mancuerna', 'Espalda', NULL, NULL),
(18, 'Jalón tras Nuca', 'Espalda', NULL, NULL),
(19, 'Peso Muerto Convencional', 'Espalda', NULL, NULL),
(20, 'Remo en Barra T', 'Espalda', NULL, NULL),
(21, 'Press Militar con Barra', 'Hombros', NULL, NULL),
(22, 'Elevaciones Laterales', 'Hombros', NULL, NULL),
(23, 'Press Arnold', 'Hombros', NULL, NULL),
(24, 'Face Pulls', 'Hombros', NULL, NULL),
(25, 'Pájaros (Posterior)', 'Hombros', NULL, NULL),
(26, 'Encogimientos de Hombros', 'Hombros', NULL, NULL),
(27, 'Press Hombros Mancuernas', 'Hombros', NULL, NULL),
(28, 'Elevaciones Frontales', 'Hombros', NULL, NULL),
(29, 'Elevaciones Laterales Polea', 'Hombros', NULL, NULL),
(30, 'Remo al Cuello', 'Hombros', NULL, NULL),
(31, 'Sentadillas con Barra', 'Piernas', NULL, NULL),
(32, 'Prensa de Piernas', 'Piernas', NULL, NULL),
(33, 'Extensión de Cuádriceps', 'Piernas', NULL, NULL),
(34, 'Zancadas (Lunges)', 'Piernas', NULL, NULL),
(35, 'Sentadilla Búlgara', 'Piernas', NULL, NULL),
(36, 'Step-ups con Mancuernas', 'Piernas', NULL, NULL),
(37, 'Sentadilla Hack', 'Piernas', NULL, NULL),
(38, 'Goblet Squat', 'Piernas', NULL, NULL),
(39, 'Extensiones a una pierna', 'Piernas', NULL, NULL),
(40, 'Sissy Squat', 'Piernas', NULL, NULL),
(41, 'Peso Muerto Rumano', 'Isquios', NULL, NULL),
(42, 'Curl Femoral Tumbado', 'Isquios', NULL, NULL),
(43, 'Curl Femoral Sentado', 'Isquios', NULL, NULL),
(44, 'Peso Muerto Sumo', 'Isquios', NULL, NULL),
(45, 'Buenos Días (Good Mornings)', 'Isquios', NULL, NULL),
(46, 'Curl Femoral a una mano', 'Isquios', NULL, NULL),
(47, 'Glute-Ham Raise', 'Isquios', NULL, NULL),
(48, 'Nordic Curls', 'Isquios', NULL, NULL),
(49, 'Peso Muerto con Mancuernas', 'Isquios', NULL, NULL),
(50, 'Puente de Isquios', 'Isquios', NULL, NULL),
(51, 'Hip Thrust (Empuje Cadera)', 'Glúteos', NULL, NULL),
(52, 'Patada de Glúteo en Polea', 'Glúteos', NULL, NULL),
(53, 'Abductores en Máquina', 'Glúteos', NULL, NULL),
(54, 'Clamshells (Almejas)', 'Glúteos', NULL, NULL),
(55, 'Monster Walk', 'Glúteos', NULL, NULL),
(56, 'Fire Hydrants', 'Glúteos', NULL, NULL),
(57, 'Step-up Lateral', 'Glúteos', NULL, NULL),
(58, 'Frog Pumps', 'Glúteos', NULL, NULL),
(59, 'Sentadilla Sumo', 'Glúteos', NULL, NULL),
(60, 'Extensiones de Cadera Banco', 'Glúteos', NULL, NULL),
(61, 'Curl de Bíceps con Barra', 'Bíceps', NULL, NULL),
(62, 'Martillo (Hammer Curl)', 'Bíceps', NULL, NULL),
(63, 'Curl Predicador', 'Bíceps', NULL, NULL),
(64, 'Curl Mancuernas Alterno', 'Bíceps', NULL, NULL),
(65, 'Curl Concentrado', 'Bíceps', NULL, NULL),
(66, 'Curl en Polea Baja', 'Bíceps', NULL, NULL),
(67, 'Curl Spider (Araña)', 'Bíceps', NULL, NULL),
(68, 'Curl Inclinado Mancuernas', 'Bíceps', NULL, NULL),
(69, 'Zottman Curl', 'Bíceps', NULL, NULL),
(70, 'Curl con Barra Z', 'Bíceps', NULL, NULL),
(71, 'Press Francés', 'Tríceps', NULL, NULL),
(72, 'Extensión en Polea Alta', 'Tríceps', NULL, NULL),
(73, 'Patada de Tríceps', 'Tríceps', NULL, NULL),
(74, 'Dips en Paralelas', 'Tríceps', NULL, NULL),
(75, 'Press de Banca Cerrado', 'Tríceps', NULL, NULL),
(76, 'Extensión tras nuca Mancuerna', 'Tríceps', NULL, NULL),
(77, 'Pushdown con Cuerda', 'Tríceps', NULL, NULL),
(78, 'Skullcrushers con Mancuernas', 'Tríceps', NULL, NULL),
(79, 'Extensión Polea a una mano', 'Tríceps', NULL, NULL),
(80, 'Fondos entre Bancos', 'Tríceps', NULL, NULL),
(81, 'Plancha Abdominal', 'Abdominales', NULL, NULL),
(82, 'Crunches (Encogimientos)', 'Abdominales', NULL, NULL),
(83, 'Elevación de Piernas', 'Abdominales', NULL, NULL),
(84, 'Rueda Abdominal', 'Abdominales', NULL, NULL),
(85, 'Twist Ruso', 'Abdominales', NULL, NULL),
(86, 'Woodchoppers Polea', 'Abdominales', NULL, NULL),
(87, 'Deadbug', 'Abdominales', NULL, NULL),
(88, 'Mountain Climbers', 'Abdominales', NULL, NULL),
(89, 'Hanging Leg Raises', 'Abdominales', NULL, NULL),
(90, 'V-Ups (Abdominales V)', 'Abdominales', NULL, NULL),
(91, 'Burpees', 'Cardio', NULL, NULL),
(92, 'Saltos al Cajón', 'Cardio', NULL, NULL),
(93, 'Correr en Cinta', 'Cardio', NULL, NULL),
(94, 'Remo en Máquina', 'Cardio', NULL, NULL),
(95, 'Elíptica', 'Cardio', NULL, NULL),
(96, 'Bicicleta Estática', 'Cardio', NULL, NULL),
(97, 'Jumping Jacks', 'Cardio', NULL, NULL),
(98, 'Salto a la Comba', 'Cardio', NULL, NULL),
(99, 'Boxeo (Saco)', 'Cardio', NULL, NULL),
(100, 'Kettlebell Swings', 'Cardio', NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `followers`
--

CREATE TABLE `followers` (
  `follower_id` int(11) NOT NULL,
  `followed_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `followers`
--

INSERT INTO `followers` (`follower_id`, `followed_id`, `created_at`) VALUES
(8, 9, '2026-05-12 13:21:02'),
(9, 8, '2026-05-12 13:21:17');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `routines`
--

CREATE TABLE `routines` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT NULL,
  `music_url` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `routines`
--

INSERT INTO `routines` (`id`, `user_id`, `name`, `description`, `created_at`, `is_public`, `music_url`) VALUES
(3, 8, 'Chest Day', 'Generada por el Asistente Inteligente de GymTrackPro.', '2026-05-12 13:20:31', 1, NULL),
(4, 9, 'Chest Day (de diego)', 'Generada por el Asistente Inteligente de GymTrackPro.', '2026-05-12 13:21:21', 0, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `routine_exercises`
--

CREATE TABLE `routine_exercises` (
  `id` int(11) NOT NULL,
  `routine_id` int(11) NOT NULL,
  `exercise_id` int(11) NOT NULL,
  `order` int(11) DEFAULT NULL,
  `sets` int(11) DEFAULT NULL,
  `reps_target` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `routine_exercises`
--

INSERT INTO `routine_exercises` (`id`, `routine_id`, `exercise_id`, `order`, `sets`, `reps_target`) VALUES
(11, 3, 8, 0, 3, '10-12'),
(12, 3, 10, 1, 4, '12-15'),
(13, 3, 1, 2, 4, '10-12'),
(14, 3, 5, 3, 4, '12-15'),
(15, 3, 3, 4, 3, '10-12'),
(16, 3, 6, 5, 4, '12-15'),
(17, 4, 8, 0, 3, '10-12'),
(18, 4, 10, 1, 4, '12-15'),
(19, 4, 1, 2, 4, '10-12'),
(20, 4, 5, 3, 4, '12-15'),
(21, 4, 3, 4, 3, '10-12'),
(22, 4, 6, 5, 4, '12-15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `routine_likes`
--

CREATE TABLE `routine_likes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `routine_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `routine_likes`
--

INSERT INTO `routine_likes` (`id`, `user_id`, `routine_id`, `created_at`) VALUES
(1, 9, 3, '2026-05-12 13:21:20');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `routine_reviews`
--

CREATE TABLE `routine_reviews` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `routine_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `saved_routines`
--

CREATE TABLE `saved_routines` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `original_routine_id` int(11) NOT NULL,
  `saved_at` datetime DEFAULT NULL,
  `is_assigned` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `saved_routines`
--

INSERT INTO `saved_routines` (`id`, `user_id`, `original_routine_id`, `saved_at`, `is_assigned`) VALUES
(2, 9, 3, '2026-05-12 13:21:21', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `shop_items`
--

CREATE TABLE `shop_items` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `item_type` varchar(50) DEFAULT NULL,
  `value` varchar(100) DEFAULT NULL,
  `price` int(11) NOT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `required_level` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `shop_items`
--

INSERT INTO `shop_items` (`id`, `name`, `description`, `item_type`, `value`, `price`, `is_active`, `required_level`) VALUES
(1, 'Avatar: Atleta', 'Icono básico', 'avatar', 'person', 0, 1, 1),
(2, 'Avatar: Karateka', 'Icono de artes marciales', 'avatar', 'sports_martial_arts', 0, 1, 1),
(3, 'Avatar: Gimnasta', 'Icono de agilidad', 'avatar', 'sports_gymnastics', 0, 1, 1),
(4, 'Avatar: Pesista', 'Icono de fuerza', 'avatar', 'fitness_center', 50, 1, 5),
(5, 'Avatar: Zen', 'Icono de meditación', 'avatar', 'self_improvement', 100, 1, 10),
(6, 'Avatar: Luchador', 'Icono de combate', 'avatar', 'sports_kabaddi', 150, 1, 15),
(7, 'Avatar: MMA', 'Icono de octágono', 'avatar', 'sports_mma', 200, 1, 20),
(8, 'Avatar: Élite', 'Insignia de oficial militar', 'avatar', 'military_tech', 500, 1, 30),
(9, 'Avatar: Premium', 'Símbolo de prestigio', 'avatar', 'workspace_premium', 1000, 1, 40),
(10, 'Avatar: Leyenda', 'El diamante definitivo', 'avatar', 'diamond', 5000, 1, 50),
(11, 'Color: Cyan', 'Estilo clásico', 'color', '#00C9FF', 0, 1, 1),
(12, 'Color: Esmeralda', 'Estilo natural', 'color', '#10B981', 0, 1, 1),
(13, 'Color: Índigo', 'Estilo profundo', 'color', '#6366F1', 0, 1, 1),
(14, 'Color: Ambar', 'Estilo energético', 'color', '#F59E0B', 50, 1, 5),
(15, 'Color: Rosa', 'Estilo vibrante', 'color', '#EC4899', 100, 1, 10),
(16, 'Color: Púrpura', 'Estilo místico', 'color', '#A855F7', 150, 1, 15),
(17, 'Color: Carmesí', 'Estilo furia', 'color', '#F43F5E', 250, 1, 20),
(18, 'Color: Naranja', 'Estilo fuego', 'color', '#FB923C', 400, 1, 30),
(19, 'Color: Turquesa', 'Estilo océano', 'color', '#2DD4BF', 600, 1, 40),
(20, 'Color: Dorado', 'Estilo Campeón', 'color', '#FFD700', 2000, 1, 50),
(21, 'Proteína Whey', 'Multiplicador XP 1.5x (5 sesiones)', 'consumable', 'multiplier_1.5_5', 100, 1, 1),
(22, 'Pre-Entreno', 'Multiplicador XP 2.0x (3 sesiones)', 'consumable', 'multiplier_2.0_3', 150, 1, 5),
(23, 'Escudo de Racha', 'Protege tu racha si fallas un día', 'consumable', 'streak_shield', 200, 1, 1),
(24, 'Creatina', 'Multiplicador XP 1.2x (10 sesiones)', 'consumable', 'multiplier_1.2_10', 120, 1, 3),
(25, 'Cinturón de Fuerza', 'Bonus XP fijo en ejercicios pesados', 'equipment', 'xp_flat_10', 500, 1, 10),
(26, 'Guantes Pro', 'Más agarre, más XP en tirones', 'equipment', 'xp_pull_5', 300, 1, 5),
(27, 'Zapatillas Haltero', 'Bonus XP en ejercicios de pierna', 'equipment', 'xp_leg_10', 800, 1, 15),
(28, 'Magnesio', 'Bonus XP total pequeño pero constante', 'equipment', 'xp_total_5', 100, 1, 2),
(29, 'Rodilleras', 'Menos fatiga, permite más volumen', 'equipment', 'volume_boost', 400, 1, 12),
(30, 'Muñequeras', 'Mejor empuje en presses', 'equipment', 'xp_push_5', 250, 1, 8),
(31, 'Comba Veloz', 'Más XP en ejercicios de Cardio', 'equipment', 'xp_cardio_15', 200, 1, 1),
(32, 'Rueda Abdominal', 'Más XP en ejercicios de Core', 'equipment', 'xp_core_20', 250, 1, 4),
(33, 'Mancuernas Oro', 'Objeto de lujo (Título: Coleccionista)', 'title', 'Coleccionista', 5000, 1, 40),
(34, 'Pase VIP', 'Título: VIP + Multiplicador Permanente', 'title', 'VIP', 10000, 1, 50),
(35, 'Botella Agua Pro', 'Recuperación ligeramente más rápida', 'consumable', 'recovery_boost', 50, 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(64) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password_hash` varchar(256) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `xp` int(11) DEFAULT NULL,
  `level` int(11) DEFAULT NULL,
  `coins` int(11) DEFAULT NULL,
  `current_streak` int(11) DEFAULT NULL,
  `longest_streak` int(11) DEFAULT NULL,
  `last_workout_date` date DEFAULT NULL,
  `avatar_icon` varchar(50) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `username_color` varchar(20) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT NULL,
  `title` varchar(50) DEFAULT NULL,
  `role` varchar(20) DEFAULT NULL,
  `streak_shields` int(11) DEFAULT NULL,
  `xp_booster_multiplier` float DEFAULT NULL,
  `xp_booster_sessions` int(11) DEFAULT NULL,
  `trainer_note` varchar(255) DEFAULT NULL,
  `trainer_note_date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `created_at`, `xp`, `level`, `coins`, `current_streak`, `longest_streak`, `last_workout_date`, `avatar_icon`, `avatar_url`, `username_color`, `is_verified`, `title`, `role`, `streak_shields`, `xp_booster_multiplier`, `xp_booster_sessions`, `trainer_note`, `trainer_note_date`) VALUES
(8, 'diego', 'diego@gmail.com', 'scrypt:32768:8:1$mD92LFRjirj2JRrR$7a1a6d201ba0a383b1a351a05f4a7caa8ac3a310a4a7e6e9b8baf6b6522617b3620f9dfc78c75001a48e85cf46944863834f544822158201441979807c104e29', '2026-05-12 13:20:09', 0, 1, 0, 0, 0, NULL, 'person', NULL, '#00C9FF', 0, NULL, 'user', 0, 1, 0, NULL, NULL),
(9, 'prueba', 'prueba@gmail.com', 'scrypt:32768:8:1$N8jI39QedLfGqCXj$acc4a7267cad7efbd4af35c0908810f9d3b1dde7324988589dcc97dd882d3d844228f6d91995a30ff62247bc3d0efa0697daff37581e180be9e1b525f49d8e72', '2026-05-12 13:20:23', 0, 1, 0, 0, 0, NULL, 'person', NULL, '#00C9FF', 0, NULL, 'user', 0, 1, 0, NULL, NULL),
(14, 'admin_gtp', 'admin@gtp.com', 'scrypt:32768:8:1$T2byTRtan7A8nHMi$c85db24b2a0436a1587cf9326792a44d711739d2e0b09b236f364971399691e6657fd58b62be915353d95f81815e8579d3514f874c9e44cd38450b0bd320c981', '2026-05-12 13:57:34', 0, 1, 1000, 0, 0, NULL, 'admin_panel_settings', NULL, '#EF4444', 0, NULL, 'admin', 0, 1, 0, NULL, NULL),
(15, 'trainer_gtp', 'trainer@gtp.com', 'scrypt:32768:8:1$eQhvAoY5RDPH04TG$883d958c3eb6544dd4f330b3b7b3c75b5ffc669baff4544de6547b2239eacec5fe6d24391b2cca230bc6493c8cfd60bc8842b5f4e05b4cf373f27667f662d85a', '2026-05-12 13:57:34', 0, 1, 1000, 0, 0, NULL, 'sports', NULL, '#10B981', 0, NULL, 'trainer', 0, 1, 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_achievements`
--

CREATE TABLE `user_achievements` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `achievement_id` int(11) NOT NULL,
  `unlocked_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_items`
--

CREATE TABLE `user_items` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `purchased_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `workout_logs`
--

CREATE TABLE `workout_logs` (
  `id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `exercise_id` int(11) NOT NULL,
  `set_number` int(11) NOT NULL,
  `weight` float DEFAULT NULL,
  `reps` int(11) DEFAULT NULL,
  `rpe` int(11) DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `workout_sessions`
--

CREATE TABLE `workout_sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `routine_id` int(11) DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `achievements`
--
ALTER TABLE `achievements`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `body_metrics`
--
ALTER TABLE `body_metrics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `exercises`
--
ALTER TABLE `exercises`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `followers`
--
ALTER TABLE `followers`
  ADD PRIMARY KEY (`follower_id`,`followed_id`),
  ADD KEY `followed_id` (`followed_id`);

--
-- Indices de la tabla `routines`
--
ALTER TABLE `routines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_routines_user_id` (`user_id`);

--
-- Indices de la tabla `routine_exercises`
--
ALTER TABLE `routine_exercises`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_routine_exercises_exercise_id` (`exercise_id`),
  ADD KEY `ix_routine_exercises_routine_id` (`routine_id`);

--
-- Indices de la tabla `routine_likes`
--
ALTER TABLE `routine_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_like` (`user_id`,`routine_id`),
  ADD KEY `routine_id` (`routine_id`);

--
-- Indices de la tabla `routine_reviews`
--
ALTER TABLE `routine_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_routine_reviews_user_id` (`user_id`),
  ADD KEY `ix_routine_reviews_routine_id` (`routine_id`);

--
-- Indices de la tabla `saved_routines`
--
ALTER TABLE `saved_routines`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_save` (`user_id`,`original_routine_id`),
  ADD KEY `original_routine_id` (`original_routine_id`);

--
-- Indices de la tabla `shop_items`
--
ALTER TABLE `shop_items`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `user_achievements`
--
ALTER TABLE `user_achievements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `achievement_id` (`achievement_id`);

--
-- Indices de la tabla `user_items`
--
ALTER TABLE `user_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indices de la tabla `workout_logs`
--
ALTER TABLE `workout_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_workout_logs_session_id` (`session_id`),
  ADD KEY `ix_workout_logs_exercise_id` (`exercise_id`);

--
-- Indices de la tabla `workout_sessions`
--
ALTER TABLE `workout_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_workout_sessions_routine_id` (`routine_id`),
  ADD KEY `ix_workout_sessions_user_id` (`user_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `achievements`
--
ALTER TABLE `achievements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `body_metrics`
--
ALTER TABLE `body_metrics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `exercises`
--
ALTER TABLE `exercises`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT de la tabla `routines`
--
ALTER TABLE `routines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `routine_exercises`
--
ALTER TABLE `routine_exercises`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `routine_likes`
--
ALTER TABLE `routine_likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `routine_reviews`
--
ALTER TABLE `routine_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `saved_routines`
--
ALTER TABLE `saved_routines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `shop_items`
--
ALTER TABLE `shop_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `user_achievements`
--
ALTER TABLE `user_achievements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `user_items`
--
ALTER TABLE `user_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `workout_logs`
--
ALTER TABLE `workout_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `workout_sessions`
--
ALTER TABLE `workout_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `body_metrics`
--
ALTER TABLE `body_metrics`
  ADD CONSTRAINT `body_metrics_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `followers`
--
ALTER TABLE `followers`
  ADD CONSTRAINT `followers_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `followers_ibfk_2` FOREIGN KEY (`followed_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `routines`
--
ALTER TABLE `routines`
  ADD CONSTRAINT `routines_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `routine_exercises`
--
ALTER TABLE `routine_exercises`
  ADD CONSTRAINT `routine_exercises_ibfk_1` FOREIGN KEY (`routine_id`) REFERENCES `routines` (`id`),
  ADD CONSTRAINT `routine_exercises_ibfk_2` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`);

--
-- Filtros para la tabla `routine_likes`
--
ALTER TABLE `routine_likes`
  ADD CONSTRAINT `routine_likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `routine_likes_ibfk_2` FOREIGN KEY (`routine_id`) REFERENCES `routines` (`id`);

--
-- Filtros para la tabla `routine_reviews`
--
ALTER TABLE `routine_reviews`
  ADD CONSTRAINT `routine_reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `routine_reviews_ibfk_2` FOREIGN KEY (`routine_id`) REFERENCES `routines` (`id`);

--
-- Filtros para la tabla `saved_routines`
--
ALTER TABLE `saved_routines`
  ADD CONSTRAINT `saved_routines_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `saved_routines_ibfk_2` FOREIGN KEY (`original_routine_id`) REFERENCES `routines` (`id`);

--
-- Filtros para la tabla `user_achievements`
--
ALTER TABLE `user_achievements`
  ADD CONSTRAINT `user_achievements_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `user_achievements_ibfk_2` FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`id`);

--
-- Filtros para la tabla `user_items`
--
ALTER TABLE `user_items`
  ADD CONSTRAINT `user_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `user_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `shop_items` (`id`);

--
-- Filtros para la tabla `workout_logs`
--
ALTER TABLE `workout_logs`
  ADD CONSTRAINT `workout_logs_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `workout_sessions` (`id`),
  ADD CONSTRAINT `workout_logs_ibfk_2` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`);

--
-- Filtros para la tabla `workout_sessions`
--
ALTER TABLE `workout_sessions`
  ADD CONSTRAINT `workout_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `workout_sessions_ibfk_2` FOREIGN KEY (`routine_id`) REFERENCES `routines` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Servidor: db
-- Tiempo de generación: 11-05-2026 a las 20:39:58
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
(1, 'Primer Paso', 'Completa tu primer entrenamiento', 'fitness_center', 'sessions', 1, 50, 10),
(2, 'Atleta Regular', 'Completa 20 entrenamientos totales', 'event_available', 'sessions', 20, 200, 50),
(3, 'Leyenda del Gym', 'Completa 100 entrenamientos totales', 'military_tech', 'sessions', 100, 1000, 250),
(4, 'Semana de Acero', 'Mantén una racha de 7 días entrenando', 'calendar_today', 'streak', 7, 100, 25),
(5, 'Mes Inquebrantable', 'Mantén una racha de 30 días entrenando', 'workspace_premium', 'streak', 30, 500, 150),
(6, 'Imparable', 'Alcanza una racha legendaria de 100 días', 'local_fire_department', 'streak', 100, 2000, 1000),
(7, 'Primer Aplauso', 'Recibe tu primer LIKE en una rutina pública', 'thumb_up', 'social_likes', 1, 30, 15),
(8, 'Influencer Fitness', 'Acumula 50 LIKES entre todas tus rutinas', 'stars', 'social_likes', 50, 300, 150),
(9, 'Crítico Experto', 'Escribe 5 reseñas en rutinas de otros usuarios', 'rate_review', 'social_reviews', 5, 100, 40),
(10, 'Explorador', 'Guarda 5 rutinas de la comunidad en tu biblioteca', 'auto_stories', 'social_saves', 5, 80, 30),
(11, 'Maestro de Rutinas', 'Crea 10 rutinas propias', 'design_services', 'social_creates', 10, 150, 60),
(12, 'Conectado', 'Sigue a 10 atletas de la comunidad', 'person_add', 'social_follows', 10, 50, 20),
(13, 'Ascenso II', 'Alcanza el nivel 10', 'trending_up', 'level', 10, 200, 100),
(14, 'Veterano', 'Alcanza el nivel 25', 'shield', 'level', 25, 500, 250),
(15, 'Maestro del Olimpo', 'Alcanza el nivel 50', 'diamond', 'level', 50, 1500, 1000);

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

--
-- Volcado de datos para la tabla `body_metrics`
--

INSERT INTO `body_metrics` (`id`, `user_id`, `date`, `weight`, `body_fat`, `arm_cm`, `waist_cm`, `chest_cm`, `leg_cm`) VALUES
(1, 1, '2026-05-11', 84, NULL, NULL, NULL, NULL, NULL),
(2, 2, '2026-05-11', 75, NULL, NULL, NULL, NULL, NULL);

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
(1, 'Press de Banca Plano', 'Pecho', 'Ejercicio compuesto de empuje. Tumbado en banco, baja la barra al pecho y empuja.', NULL),
(2, 'Press de Banca Inclinado', 'Pecho', 'Variante inclinada que enfatiza la parte superior del pectoral.', NULL),
(3, 'Aperturas con Mancuernas', 'Pecho', 'Ejercicio de aislamiento. Abre los brazos en arco controlando el estiramiento.', NULL),
(4, 'Fondos en Paralelas', 'Pecho', 'Ejercicio en peso corporal. Inclina el torso hacia adelante para enfatizar el pecho.', NULL),
(5, 'Crossover en Polea', 'Pecho', 'Ejercicio de aislamiento con cable. Junta las manos al frente cruzando el plano.', NULL),
(6, 'Dominadas', 'Espalda', 'Ejercicio en peso corporal. Agarre prono ancho, sube hasta que la barbilla supere la barra.', NULL),
(7, 'Remo con Barra', 'Espalda', 'Ejercicio compuesto. Inclina el torso 45°, tira de la barra hacia el ombligo.', NULL),
(8, 'Jalón al Pecho', 'Espalda', 'Polea alta. Tira de la barra hasta el pecho manteniendo el torso erguido.', NULL),
(9, 'Remo en Polea Baja', 'Espalda', 'Cable sentado. Tira del asa hacia el abdomen y contrae la espalda.', NULL),
(10, 'Remo con Mancuerna', 'Espalda', 'Un brazo a la vez apoyado en banco. Tira la mancuerna hacia la cadera.', NULL),
(11, 'Press Militar con Barra', 'Hombros', 'Ejercicio compuesto de empuje vertical. Empuja la barra desde los hombros hacia arriba.', NULL),
(12, 'Elevaciones Laterales', 'Hombros', 'Aislamiento del deltoides lateral. Sube los brazos hasta la altura del hombro.', NULL),
(13, 'Elevaciones Frontales', 'Hombros', 'Aislamiento del deltoides anterior. Sube los brazos hasta 90° al frente.', NULL),
(14, 'Press Arnold', 'Hombros', 'Variante del press con mancuernas que incluye rotación del antebrazo.', NULL),
(15, 'Pájaro / Face Pull', 'Hombros', 'Cable a la altura de la cara. Trabaja el deltoides posterior y rotadores.', NULL),
(16, 'Curl con Barra', 'Bíceps', 'Ejercicio básico de bíceps. Mantén los codos pegados al cuerpo.', NULL),
(17, 'Curl Martillo', 'Bíceps', 'Agarre neutro. Enfatiza el braquial y braquiorradial.', NULL),
(18, 'Curl Concentrado', 'Bíceps', 'Sentado, apoya el codo en el muslo para máximo aislamiento.', NULL),
(19, 'Curl en Polea Baja', 'Bíceps', 'Cable. Permite tensión constante durante todo el recorrido.', NULL),
(20, 'Curl Inclinado', 'Bíceps', 'Tumbado en banco inclinado, mayor estiramiento del bíceps en el fondo.', NULL),
(21, 'Press Francés', 'Tríceps', 'Tumbado, baja la barra a la frente doblando los codos. Gran rango de movimiento.', NULL),
(22, 'Fondos en Banco', 'Tríceps', 'Peso corporal. Manos en banco, desciende doblando los codos.', NULL),
(23, 'Extensión en Polea Alta', 'Tríceps', 'Cable hacia abajo. Mantén los codos pegados al cuerpo.', NULL),
(24, 'Press Cerrado', 'Tríceps', 'Barra, agarre estrecho. Compuesto que también trabaja el pecho.', NULL),
(25, 'Kickback con Mancuerna', 'Tríceps', 'Inclinado, extiende el brazo hacia atrás hasta bloquearlo.', NULL),
(26, 'Sentadilla con Barra', 'Piernas', 'Ejercicio compuesto rey de piernas. Baja hasta que los muslos queden paralelos al suelo.', NULL),
(27, 'Prensa de Piernas', 'Piernas', 'Máquina. Empuja con los talones, rodillas sin bloquearse arriba.', NULL),
(28, 'Zancadas con Mancuernas', 'Piernas', 'Da un paso adelante y baja la rodilla trasera casi al suelo.', NULL),
(29, 'Curl de Isquiotibiales', 'Piernas', 'Máquina tumbado. Aislamiento de los isquios.', NULL),
(30, 'Extensión de Cuádriceps', 'Piernas', 'Máquina sentado. Extiende la rodilla hasta bloquear sin impulso.', NULL),
(31, 'Hip Thrust', 'Glúteos', 'Hombros en banco, barra sobre las caderas. Eleva la cadera hasta extensión completa.', NULL),
(32, 'Peso Muerto Rumano', 'Glúteos', 'Barra o mancuernas. Desciende manteniendo la espada recta y sintiendo el estiramiento.', NULL),
(33, 'Sentadilla Sumo', 'Glúteos', 'Stance ancho, puntas hacia afuera, mayor activación de glúteos y aductores.', NULL),
(34, 'Patada de Glúteo en Cable', 'Glúteos', 'Cable al tobillo, extiende la cadera hacia atrás con control.', NULL),
(35, 'Puente de Glúteo', 'Glúteos', 'Tumbado boca arriba, eleva la cadera apoyando pies en suelo. Con o sin peso.', NULL),
(36, 'Crunch Abdominal', 'Abdominales', 'Contrae el abdomen llevando los hombros hacia las rodillas. No jales del cuello.', NULL),
(37, 'Plancha', 'Abdominales', 'Posición de flexión sobre antebrazos. Mantén el cuerpo recto el mayor tiempo posible.', NULL),
(38, 'Elevación de Piernas', 'Abdominales', 'Colgado de barra o tumbado. Sube las piernas rectas hasta 90°.', NULL),
(39, 'Russian Twist', 'Abdominales', 'Sentado, pies levantados. Rota el torso de lado a lado con o sin peso.', NULL),
(40, 'Rueda Abdominal', 'Abdominales', 'Rodilla en suelo o de pie. Extiende los brazos y vuelve con control total.', NULL),
(41, 'Elevación de Talones de Pie', 'Gemelos', 'En máquina o libre. Sube sobre las puntas de los pies y baja lentamente.', NULL),
(42, 'Elevación de Talones Sentado', 'Gemelos', 'Máquina sentado. Enfatiza el sóleo. Rodillas a 90°.', NULL),
(43, 'Elevación en Prensa', 'Gemelos', 'Con los pies en la prensa, empuja con la punta. Excelente carga.', NULL),
(44, 'Saltos a la Comba', 'Gemelos', 'Cardio y potencia de gemelos. Mantén las rodillas ligeramente flexionadas.', NULL),
(45, 'Caminata sobre Puntas', 'Gemelos', 'Camina 20-30 metros sobre las puntas de los pies para activación continua.', NULL),
(46, 'Carrera en Cinta', 'Cardio', 'Cardio aeróbico. Ajusta la velocidad e inclinación según el objetivo.', NULL),
(47, 'Bicicleta Estática', 'Cardio', 'Bajo impacto en articulaciones. Ideal para calentamiento o LISS.', NULL),
(48, 'Remo Ergómetro', 'Cardio', 'Ejercicio de cuerpo completo con énfasis en espalda y piernas.', NULL),
(49, 'Burpees', 'Cardio', 'Ejercicio de alta intensidad: sentadilla, plancha, flexión y salto.', NULL),
(50, 'Salto a la Cuerda', 'Cardio', 'Coordinación y cardio. Alterna ritmo lento e intenso por intervalos.', NULL),
(51, 'Flexiones Diamante', 'Pecho', 'Manos en posición de diamante bajo el pecho. Trabaja el pecho interno y tríceps.', NULL),
(52, 'Pullover con Mancuerna', 'Pecho', 'Tumbado en banco, baja la mancuerna en arco por encima de la cabeza.', NULL),
(53, 'Press de Banca Declinado', 'Pecho', 'Banco inclinado hacia abajo. Enfatiza la parte inferior del pectoral.', NULL),
(54, 'Cable Crossover Bajo', 'Pecho', 'Poleas bajas. Junta las manos hacia arriba para activar el pecho superior.', NULL),
(55, 'Flexiones con Lastre', 'Pecho', 'Flexiones estándar con mochila o disco encima para añadir resistencia.', NULL),
(56, 'Remo al Mentón', 'Espalda', 'Barra o mancuernas. Sube hasta la barbilla activando trapecios y dorsales.', NULL),
(57, 'Pulldown de Brazo Recto', 'Espalda', 'Cable alto. Brazos casi rectos, empuja hacia abajo hasta los muslos.', NULL),
(58, 'Encogimientos de Hombros', 'Espalda', 'Barra o mancuernas. Eleva los hombros hacia las orejas. Trabaja trapecios.', NULL),
(59, 'Remo Invertido en Barra', 'Espalda', 'Debajo de una barra fija, tira del pecho hacia la barra. Peso corporal.', NULL),
(60, 'Buenos Días', 'Espalda', 'Barra en la espalda, inclina el torso hacia adelante. Trabaja la cadena posterior.', NULL),
(61, 'Elevaciones en W', 'Hombros', 'Cable o mancuernas. Eleva los brazos en forma de W activando el deltoides posterior.', NULL),
(62, 'Rotación Externa en Cable', 'Hombros', 'Cable bajo. Trabaja los rotadores externos del hombro, clave para salud articular.', NULL),
(63, 'Press Landmine', 'Hombros', 'Barra anclada al suelo. Press unilateral que reduce estrés en el hombro.', NULL),
(64, 'Elevaciones Laterales Sentado', 'Hombros', 'Sentado en banco, sin impulso. Mayor aislamiento del deltoides lateral.', NULL),
(65, 'Face Pull con Cuerda', 'Hombros', 'Cable a la cara con cuerda. Trabaja deltoides posterior y rotadores externos.', NULL),
(66, 'Curl Predicador', 'Bíceps', 'Banco predicador. Elimina el balanceo para máximo aislamiento del bíceps.', NULL),
(67, 'Curl Araña', 'Bíceps', 'Tumbado boca abajo en banco inclinado. Mayor estiramiento del bíceps.', NULL),
(68, 'Curl 21s', 'Bíceps', '21 repeticiones divididas en 3 rangos de movimiento. Alta congestión.', NULL),
(69, 'Curl Alterno con Supinación', 'Bíceps', 'Gira la mano al subir para máxima contracción del bíceps braquial.', NULL),
(70, 'Curl en Polea Alta', 'Bíceps', 'Cable alto. Simula la pose de bíceps para tensión máxima en la cima.', NULL),
(71, 'Skull Crusher con Mancuernas', 'Tríceps', 'Tumbado, baja las mancuernas a los lados de la cabeza. Gran estiramiento.', NULL),
(72, 'Extensión Sobre la Cabeza', 'Tríceps', 'Con mancuerna o cable, extiende los brazos por encima de la cabeza.', NULL),
(73, 'Dips en Paralelas Cerrado', 'Tríceps', 'Torso erguido y codos pegados al cuerpo para enfatizar el tríceps.', NULL),
(74, 'Patada de Tríceps en Cable', 'Tríceps', 'Cable bajo, inclina el torso y extiende el brazo hacia atrás.', NULL),
(75, 'Press Nórdico Inverso', 'Tríceps', 'Con los pies fijos, baja el torso controlando la extensión del codo.', NULL),
(76, 'Sentadilla Búlgara', 'Piernas', 'Pie trasero en banco. Gran activación de cuádriceps y glúteos unilateral.', NULL),
(77, 'Peso Muerto Convencional', 'Piernas', 'Ejercicio rey de fuerza. Trabaja isquios, glúteos y toda la espalda.', NULL),
(78, 'Step Up con Mancuernas', 'Piernas', 'Sube a un cajón alternando piernas. Excelente para equilibrio y fuerza.', NULL),
(79, 'Sentadilla Hack', 'Piernas', 'Máquina o barra detrás. Énfasis en la parte inferior del cuádriceps.', NULL),
(80, 'Bicicleta Estática HIIT', 'Piernas', 'Intervalos de alta intensidad en bici. Trabaja piernas y cardiovascular.', NULL),
(81, 'Abducción de Cadera', 'Glúteos', 'Máquina o cable. Separa las piernas hacia afuera activando glúteo medio.', NULL),
(82, 'Peso Muerto a Una Pierna', 'Glúteos', 'Unilateral con mancuerna. Gran trabajo de glúteo y equilibrio.', NULL),
(83, 'Marcha de Glúteo con Banda', 'Glúteos', 'Banda elástica en rodillas. Pasos laterales activando glúteo medio.', NULL),
(84, 'Sentadilla Goblet', 'Glúteos', 'Con una mancuerna o kettlebell al pecho. Perfecto para profundidad.', NULL),
(85, 'Empuje de Cadera con Pie Elevado', 'Glúteos', 'Pie en banco, mayor rango de movimiento para el glúteo.', NULL),
(86, 'Cable Crunch', 'Abdominales', 'Arrodillado ante la polea. Tira hacia abajo contrayendo el core.', NULL),
(87, 'Tijeras', 'Abdominales', 'Tumbado, alterna las piernas arriba y abajo sin tocar el suelo.', NULL),
(88, 'Rollout con Rueda', 'Abdominales', 'Extiende los brazos rodando hacia adelante. Exige estabilidad total del core.', NULL),
(89, 'Plancha Lateral', 'Abdominales', 'Apoyado en un antebrazo. Trabaja oblicuos y estabilizadores del core.', NULL),
(90, 'Dead Bug', 'Abdominales', 'Espalda en suelo. Extiende brazo y pierna opuestos sin perder el core.', NULL),
(91, 'Elevación de Talones con Peso', 'Gemelos', 'Con mancuernas o barra. Máxima carga en los gemelos de pie.', NULL),
(92, 'Elevación de Talones en Step', 'Gemelos', 'Sobre un escalón para mayor rango de movimiento.', NULL),
(93, 'Skipping Alto', 'Gemelos', 'Carrera en el sitio levantando las rodillas al máximo. Activa gemelos y cardio.', NULL),
(94, 'Saltos de Pliometría', 'Gemelos', 'Saltos explosivos al cajón o al suelo. Potencia y gemelos.', NULL),
(95, 'Caminar de Talones', 'Gemelos', 'Camina sobre los talones para activar el tibial anterior y los gemelos.', NULL),
(96, 'Battle Ropes', 'Cardio', 'Cuerdas de batalla. Ejercicio de alta intensidad que trabaja todo el cuerpo.', NULL),
(97, 'Jumping Jacks', 'Cardio', 'Saltos con apertura de piernas y brazos. Cardio de bajo impacto.', NULL),
(98, 'Escaladora', 'Cardio', 'Máquina escaladora. Simula subir escaleras con alta demanda cardiovascular.', NULL),
(99, 'Sprint en Intervalos', 'Cardio', 'Alterna sprints de 20s con recuperación de 40s durante 10 minutos.', NULL),
(100, 'Mountain Climbers', 'Cardio', 'En posición de plancha, lleva las rodillas al pecho alternativamente.', NULL);

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
(2, 1, '2026-05-11 11:17:48');

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
(15, 1, 'Push Day — Pecho, Hombros y Tríceps', 'Generada por el Asistente Inteligente de GymTrackPro.', '2026-05-11 11:16:48', 1, NULL),
(16, 2, 'Push Day — Pecho, Hombros y Tríceps (de diego)', 'Generada por el Asistente Inteligente de GymTrackPro.', '2026-05-11 11:17:51', 0, 'https://www.youtube.com/watch?v=ql3pTI8hVFw&list=RDql3pTI8hVFw&start_radio=1');

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
(78, 15, 55, 0, 4, '10-12'),
(79, 15, 54, 1, 4, '10-12'),
(80, 15, 1, 2, 3, '12-15'),
(81, 15, 22, 3, 4, '12-15'),
(82, 15, 74, 4, 4, '10-12'),
(83, 15, 65, 5, 4, '10-12'),
(84, 16, 55, 0, 4, '10-12'),
(85, 16, 54, 1, 4, '10-12'),
(86, 16, 1, 2, 3, '12-15'),
(87, 16, 22, 3, 4, '12-15'),
(88, 16, 74, 4, 4, '10-12'),
(89, 16, 65, 5, 4, '10-12');

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
(1, 2, 15, '2026-05-11 11:17:47');

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

--
-- Volcado de datos para la tabla `routine_reviews`
--

INSERT INTO `routine_reviews` (`id`, `user_id`, `routine_id`, `rating`, `comment`, `created_at`) VALUES
(1, 2, 15, 5, '', '2026-05-11 11:20:38');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `saved_routines`
--

CREATE TABLE `saved_routines` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `original_routine_id` int(11) NOT NULL,
  `saved_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `saved_routines`
--

INSERT INTO `saved_routines` (`id`, `user_id`, `original_routine_id`, `saved_at`) VALUES
(1, 2, 15, '2026-05-11 11:17:51');

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
(1, 'Escudo de Racha', 'Protege tu racha si olvidas entrenar un día.', 'consumable', 'streak_shield', 50, 1, 1),
(2, 'Pack Energía (1.5x XP)', 'Gana un 50% más de XP durante las próximas 3 sesiones.', 'consumable', 'multiplier_1.5_sessions_3', 30, 1, 3),
(3, 'Super Carga (2x XP)', 'Dobla tu XP durante las próximas 5 sesiones.', 'consumable', 'multiplier_2.0_sessions_5', 100, 1, 10),
(4, 'Avatar Fénix', 'El poder del renacimiento', 'avatar', 'fireplace', 250, 1, 25),
(5, 'Color Galáctico', 'Un color púrpura espacial', 'color', '#6A11CB', 80, 1, 15),
(6, 'Título: Máquina Humana', 'Sin descanso', 'title', 'Human Machine', 150, 1, 22),
(7, 'Avatar Pesas', 'Amante del hierro', 'avatar', 'fitness_center', 0, 1, 1),
(8, 'Avatar Corazón', 'Entrenamiento cardiovascular', 'avatar', 'favorite', 0, 1, 1),
(9, 'Avatar Rayo Azul', 'Energía pura', 'avatar', 'bolt', 0, 1, 1),
(10, 'Avatar Medalla', 'Espíritu competitivo', 'avatar', 'military_tech', 50, 1, 10),
(11, 'Azul Cielo', 'Color básico', 'color', '#00C9FF', 0, 1, 1),
(12, 'Naranja Fuego', 'Color cálido', 'color', '#F2994A', 0, 1, 1),
(13, 'Gris Acero', 'Color sólido', 'color', '#7E8C8D', 0, 1, 1),
(14, 'Esmeralda', 'Color de la suerte', 'color', '#27AE60', 30, 1, 5),
(15, 'Plata', 'Brillo metálico', 'color', '#BDC3C7', 45, 1, 8),
(16, 'Avatar Trofeo', 'Solo para campeones', 'avatar', 'emoji_events', 100, 1, 15),
(17, 'Avatar Cohete', 'Progreso explosivo', 'avatar', 'rocket', 150, 1, 20),
(18, 'Violeta Oscuro', 'Elegancia pura', 'color', '#8E44AD', 60, 1, 12),
(19, 'Carmesí', 'Pasión por el entreno', 'color', '#C0392B', 80, 1, 18),
(20, 'Avatar Diamante', 'Brillo eterno', 'avatar', 'diamond', 200, 1, 25),
(21, 'Avatar Corona Pro', 'El rey del gym', 'avatar', 'workspace_premium', 300, 1, 30),
(22, 'Avatar Fuego Azul', 'Calor extremo', 'avatar', 'local_fire_department', 400, 1, 40),
(23, 'Dorado Imperial', 'Lujo total', 'color', '#D4AF37', 200, 1, 25),
(24, 'Negro Mate', 'Oscuridad absoluta', 'color', '#2C3E50', 250, 1, 35),
(25, 'Rosa Neón', 'Estilo retro', 'color', '#FF007F', 300, 1, 45);

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
  `username_color` varchar(20) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT NULL,
  `title` varchar(50) DEFAULT NULL,
  `role` varchar(20) DEFAULT NULL,
  `streak_shields` int(11) DEFAULT NULL,
  `xp_booster_multiplier` float DEFAULT NULL,
  `xp_booster_sessions` int(11) DEFAULT NULL,
  `trainer_note` varchar(255) DEFAULT NULL,
  `trainer_note_date` datetime DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `created_at`, `xp`, `level`, `coins`, `current_streak`, `longest_streak`, `last_workout_date`, `avatar_icon`, `username_color`, `is_verified`, `title`, `role`, `streak_shields`, `xp_booster_multiplier`, `xp_booster_sessions`, `trainer_note`, `trainer_note_date`, `avatar_url`) VALUES
(1, 'diego', 'diego@gmail.com', 'scrypt:32768:8:1$J4mUHQStpEvPIefp$3620a1c376000aabb12c9945ad24f7642d868284c01ac21e1ad7f2e81af01b6870f30982f50854ec6834e5bdc0d240e9b9662da6ce6cad7c83c352ea99b21b7a', '2026-05-11 10:00:31', 290, 2, 10, 1, 1, '2026-05-11', 'bolt', '#00C9FF', 0, NULL, 'user', 4, 1, 0, NULL, NULL, '/static/uploads/avatar_user_1_Captura_de_pantalla_2025-06-14_151638.png'),
(2, 'prueba', 'user@example.com', 'scrypt:32768:8:1$APZ3wuY6Klt0TvRh$a572e62be72f7a0b416379a5b2169a1f8c78dca6a1247181174dcc4ee8d1598bfa5b07b4c348f4ca54e38ac515d697b802c1803b31c6970b38e62617466e41ec', '2026-05-11 11:17:35', 0, 1, 0, 0, 0, NULL, 'fitness_center', '#7E8C8D', 0, NULL, 'user', 0, 1, 0, NULL, NULL, NULL),
(3, 'admin_gtp', 'admin@gymtrackpro.com', 'scrypt:32768:8:1$aeHD47pbjNdwNCrz$ad4273b1ea0f1d26bdfc89915437ef2cba07ffd796c3606dc0f339d47157bbd95b9038dc52dffc6c13ca90a8a9f823497941fa177f1c640989c3b228c165b5ea', '2026-05-11 11:45:23', 0, 1, 0, 0, 0, NULL, 'person', '#00C9FF', 1, NULL, 'admin', 0, 1, 0, NULL, NULL, NULL),
(4, 'trainer_gtp', 'trainer@gymtrackpro.com', 'scrypt:32768:8:1$zLYkfaNNkqPHRLS1$f107839873adf4eed7891c1fcd84c2c4923d45058078fcc4dd7bf294e2abff1b6e2979f724cfbc77a88e87d79943d919f3d5cf65d9d205303b175c9aa33feff9', '2026-05-11 11:45:23', 0, 1, 0, 0, 0, NULL, 'person', '#00C9FF', 1, NULL, 'trainer', 0, 1, 0, NULL, NULL, NULL);

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

--
-- Volcado de datos para la tabla `user_items`
--

INSERT INTO `user_items` (`id`, `user_id`, `item_id`, `purchased_at`) VALUES
(1, 2, 7, '2026-05-11 11:33:12'),
(2, 2, 12, '2026-05-11 11:33:17'),
(3, 2, 13, '2026-05-11 11:36:14'),
(4, 1, 9, '2026-05-11 13:46:54'),
(5, 1, 8, '2026-05-11 13:49:26'),
(6, 1, 12, '2026-05-11 13:49:28'),
(7, 1, 11, '2026-05-11 14:10:05');

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

--
-- Volcado de datos para la tabla `workout_logs`
--

INSERT INTO `workout_logs` (`id`, `session_id`, `exercise_id`, `set_number`, `weight`, `reps`, `rpe`, `timestamp`) VALUES
(1, 5, 28, 1, 0, 0, NULL, '2026-05-11 10:10:34'),
(2, 5, 30, 1, 0, 0, NULL, '2026-05-11 10:10:38'),
(3, 21, 55, 1, 15, 5, NULL, '2026-05-11 11:23:27'),
(4, 21, 55, 2, 35, 5, NULL, '2026-05-11 11:23:35');

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
-- Volcado de datos para la tabla `workout_sessions`
--

INSERT INTO `workout_sessions` (`id`, `user_id`, `routine_id`, `start_time`, `end_time`) VALUES
(1, 1, NULL, '2026-05-11 10:03:28', NULL),
(2, 1, NULL, '2026-05-11 10:09:55', NULL),
(3, 1, NULL, '2026-05-11 10:09:56', '2026-05-11 10:09:57'),
(4, 1, NULL, '2026-05-11 10:10:26', '2026-05-11 10:10:30'),
(5, 1, NULL, '2026-05-11 10:10:32', '2026-05-11 10:10:40'),
(6, 1, NULL, '2026-05-11 10:44:04', NULL),
(7, 1, NULL, '2026-05-11 10:47:06', '2026-05-11 10:47:09'),
(8, 1, NULL, '2026-05-11 10:48:23', NULL),
(9, 1, NULL, '2026-05-11 10:49:11', NULL),
(10, 1, NULL, '2026-05-11 10:50:57', NULL),
(11, 1, NULL, '2026-05-11 10:50:58', '2026-05-11 10:50:59'),
(12, 1, NULL, '2026-05-11 10:51:02', '2026-05-11 10:51:03'),
(13, 1, NULL, '2026-05-11 10:51:14', '2026-05-11 10:51:20'),
(14, 1, NULL, '2026-05-11 10:54:34', '2026-05-11 10:54:36'),
(15, 1, NULL, '2026-05-11 10:58:29', '2026-05-11 10:58:38'),
(16, 1, NULL, '2026-05-11 10:58:49', '2026-05-11 11:00:18'),
(17, 1, NULL, '2026-05-11 11:01:01', '2026-05-11 11:01:09'),
(18, 1, NULL, '2026-05-11 11:05:06', '2026-05-11 11:05:19'),
(19, 1, NULL, '2026-05-11 11:05:41', '2026-05-11 11:06:15'),
(20, 1, 15, '2026-05-11 11:16:51', '2026-05-11 11:17:01'),
(21, 2, 16, '2026-05-11 11:23:23', NULL);

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
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `routine_exercises`
--
ALTER TABLE `routine_exercises`
  ADD PRIMARY KEY (`id`),
  ADD KEY `routine_id` (`routine_id`),
  ADD KEY `exercise_id` (`exercise_id`);

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
  ADD KEY `user_id` (`user_id`),
  ADD KEY `routine_id` (`routine_id`);

--
-- Indices de la tabla `saved_routines`
--
ALTER TABLE `saved_routines`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_save` (`user_id`,`original_routine_id`),
  ADD KEY `saved_routines_ibfk_2` (`original_routine_id`);

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
  ADD KEY `session_id` (`session_id`),
  ADD KEY `exercise_id` (`exercise_id`);

--
-- Indices de la tabla `workout_sessions`
--
ALTER TABLE `workout_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `workout_sessions_ibfk_2` (`routine_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `exercises`
--
ALTER TABLE `exercises`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT de la tabla `routines`
--
ALTER TABLE `routines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `routine_exercises`
--
ALTER TABLE `routine_exercises`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=90;

--
-- AUTO_INCREMENT de la tabla `routine_likes`
--
ALTER TABLE `routine_likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `routine_reviews`
--
ALTER TABLE `routine_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `saved_routines`
--
ALTER TABLE `saved_routines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `shop_items`
--
ALTER TABLE `shop_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `user_achievements`
--
ALTER TABLE `user_achievements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `user_items`
--
ALTER TABLE `user_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `workout_logs`
--
ALTER TABLE `workout_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `workout_sessions`
--
ALTER TABLE `workout_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

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
  ADD CONSTRAINT `saved_routines_ibfk_2` FOREIGN KEY (`original_routine_id`) REFERENCES `routines` (`id`) ON DELETE CASCADE;

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

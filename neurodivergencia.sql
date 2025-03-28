-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 27-03-2025 a las 23:34:39
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `neurodivergencia`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `caracteristicas`
--

CREATE TABLE `caracteristicas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `icono` varchar(50) DEFAULT NULL,
  `tipo` enum('general','especialidad') DEFAULT 'general',
  `estado` tinyint(1) DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `caracteristicas`
--

INSERT INTO `caracteristicas` (`id`, `nombre`, `descripcion`, `icono`, `tipo`, `estado`, `creado_en`) VALUES
(1, 'Atención a niños', NULL, 'child', 'general', 1, '2025-03-24 20:33:09'),
(2, 'Atención online', NULL, 'video', 'general', 1, '2025-03-24 20:33:09'),
(3, 'Urgencias', NULL, 'emergency', 'general', 1, '2025-03-24 20:33:09'),
(4, 'Accesible para discapacitados', NULL, 'accessible', 'general', 1, '2025-03-24 20:33:09'),
(5, 'Parking disponible', NULL, 'parking', 'general', 1, '2025-03-24 20:33:09'),
(6, 'Pagos con tarjeta', NULL, 'credit-card', 'general', 1, '2025-03-24 20:33:09');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `especialidades`
--

CREATE TABLE `especialidades` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `especialistas`
--

CREATE TABLE `especialistas` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `imagen_perfil` varchar(255) DEFAULT NULL,
  `titulo_profesional` varchar(255) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `experiencia` text DEFAULT NULL,
  `formacion` text DEFAULT NULL,
  `ubicacion` varchar(100) DEFAULT NULL,
  `latitud` decimal(10,8) DEFAULT NULL,
  `longitud` decimal(11,8) DEFAULT NULL,
  `precio_consulta` decimal(10,2) DEFAULT NULL,
  `precio_consulta_online` decimal(10,2) DEFAULT NULL,
  `moneda` varchar(3) DEFAULT 'USD',
  `porcentaje_aprobacion` decimal(5,2) DEFAULT 0.00,
  `total_valoraciones` int(11) DEFAULT 0,
  `total_pacientes` int(11) DEFAULT 0,
  `total_consultas` int(11) DEFAULT 0,
  `disponibilidad` text DEFAULT NULL,
  `idiomas` varchar(255) DEFAULT NULL,
  `verificado` tinyint(1) DEFAULT 0,
  `estado` enum('activo','inactivo','vacaciones') DEFAULT 'activo',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `especialista_caracteristica`
--

CREATE TABLE `especialista_caracteristica` (
  `id` int(11) NOT NULL,
  `especialista_id` int(11) NOT NULL,
  `caracteristica_id` int(11) NOT NULL,
  `valor` text DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `especialista_especialidad`
--

CREATE TABLE `especialista_especialidad` (
  `id` int(11) NOT NULL,
  `especialista_id` int(11) NOT NULL,
  `especialidad_id` int(11) NOT NULL,
  `experiencia` int(11) DEFAULT NULL COMMENT 'Años de experiencia en esta especialidad',
  `principal` tinyint(1) DEFAULT 0,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `especialista_red_social`
--

CREATE TABLE `especialista_red_social` (
  `id` int(11) NOT NULL,
  `especialista_id` int(11) NOT NULL,
  `red_social_id` int(11) NOT NULL,
  `url` varchar(255) NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `especialista_servicio`
--

CREATE TABLE `especialista_servicio` (
  `id` int(11) NOT NULL,
  `especialista_id` int(11) NOT NULL,
  `servicio_id` int(11) NOT NULL,
  `precio_personalizado` decimal(10,2) DEFAULT NULL,
  `duracion_personalizada` int(11) DEFAULT NULL,
  `disponible` tinyint(1) DEFAULT 1,
  `notas` text DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `redes_sociales`
--

CREATE TABLE `redes_sociales` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `icono` varchar(50) DEFAULT NULL,
  `base_url` varchar(255) DEFAULT NULL,
  `estado` tinyint(1) DEFAULT 1,
  `orden` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `redes_sociales`
--

INSERT INTO `redes_sociales` (`id`, `nombre`, `icono`, `base_url`, `estado`, `orden`) VALUES
(1, 'Facebook', 'fa-facebook', 'https://facebook.com/', 1, 0),
(2, 'Instagram', 'fa-instagram', 'https://instagram.com/', 1, 0),
(3, 'Twitter', 'fa-twitter', 'https://twitter.com/', 1, 0),
(4, 'LinkedIn', 'fa-linkedin', 'https://linkedin.com/in/', 1, 0),
(5, 'YouTube', 'fa-youtube', 'https://youtube.com/', 1, 0),
(6, 'TikTok', 'fa-tiktok', 'https://tiktok.com/@', 1, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resenas`
--

CREATE TABLE `resenas` (
  `id` int(11) NOT NULL,
  `especialista_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `calificacion` tinyint(4) NOT NULL CHECK (`calificacion` between 1 and 5),
  `comentario` text DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  `respuesta` text DEFAULT NULL,
  `fecha_respuesta` timestamp NULL DEFAULT NULL,
  `estado` enum('pendiente','aprobado','rechazado') DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicios`
--

CREATE TABLE `servicios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `duracion` int(11) DEFAULT NULL COMMENT 'Duración en minutos',
  `precio` decimal(10,2) DEFAULT NULL,
  `precio_online` decimal(10,2) DEFAULT NULL,
  `moneda` varchar(3) DEFAULT 'USD',
  `especialidad_id` int(11) DEFAULT NULL,
  `estado` tinyint(1) DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `rol` enum('admin','especialista','paciente') NOT NULL,
  `estado` enum('activo','inactivo','pendiente') DEFAULT 'pendiente',
  `token_verificacion` varchar(255) DEFAULT NULL,
  `token_recuperacion` varchar(255) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `genero` enum('masculino','femenino','otro','prefiero_no_decir') DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `email`, `password`, `nombre`, `apellido`, `telefono`, `avatar`, `rol`, `estado`, `token_verificacion`, `token_recuperacion`, `fecha_nacimiento`, `genero`, `creado_en`, `actualizado_en`) VALUES
(1, 'a@gmail.com', '$2b$10$RtPQtDPp/mB87J8Ir6Q/WOyPJik4XqfYDU/nrA53lc7G2gtb7mHTO', 'Arom', NULL, NULL, NULL, 'admin', 'activo', NULL, NULL, NULL, NULL, '2025-03-24 20:42:13', '2025-03-26 21:01:44'),
(2, 'j@gmail.com', '$2b$10$ggJbYS1YZev6Jw0CdbmZmuEJ5nw08biBIcrR662nAFmYHkboQRDFC', 'Juan', 'Perez', NULL, NULL, 'admin', 'pendiente', NULL, NULL, NULL, NULL, '2025-03-24 22:59:19', '2025-03-24 22:59:19'),
(3, 'k@gmail.com', '$2b$10$SmkQevfr/vX4Y807l4/sRu01QGHnWwrYS9quLgangjp2cMdVL6kTm', 'Karla', 'Solis', NULL, NULL, 'admin', 'pendiente', NULL, NULL, NULL, NULL, '2025-03-25 01:48:51', '2025-03-25 01:48:51'),
(4, 'p@gmail.com', '$2b$10$3laLj6fxw9mMg2exc7Q1jug3xKcHy8jmWiuPrJGzX.qPESUL3/w.O', 'Pepito', 'Pepita', NULL, NULL, 'admin', 'pendiente', NULL, NULL, NULL, NULL, '2025-03-25 02:00:38', '2025-03-25 02:00:38'),
(5, 'ma@gmail.com', '$2b$10$sL1pvpyLPVoaI7r.mrrAxuFPpfOa4GcT1Nc5FWj.AHruMC0u3i5NC', 'Marcia', 'Avendaño', NULL, NULL, 'paciente', 'pendiente', NULL, NULL, NULL, NULL, '2025-03-25 02:04:37', '2025-03-25 02:04:37'),
(6, 'v@gmail.com', '$2b$10$wXqqPYhQS0w5YFgh.L3nleFoSPyDfRzI.hRSlx32eGKbo6vVdbTBO', 'Vale', 'Valona', NULL, NULL, 'paciente', 'pendiente', NULL, NULL, NULL, NULL, '2025-03-25 02:07:28', '2025-03-25 02:07:28');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `caracteristicas`
--
ALTER TABLE `caracteristicas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `especialidades`
--
ALTER TABLE `especialidades`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `especialistas`
--
ALTER TABLE `especialistas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `especialista_caracteristica`
--
ALTER TABLE `especialista_caracteristica`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `especialista_id` (`especialista_id`,`caracteristica_id`),
  ADD KEY `caracteristica_id` (`caracteristica_id`);

--
-- Indices de la tabla `especialista_especialidad`
--
ALTER TABLE `especialista_especialidad`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `especialista_id` (`especialista_id`,`especialidad_id`),
  ADD KEY `especialidad_id` (`especialidad_id`);

--
-- Indices de la tabla `especialista_red_social`
--
ALTER TABLE `especialista_red_social`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `especialista_id` (`especialista_id`,`red_social_id`),
  ADD KEY `red_social_id` (`red_social_id`);

--
-- Indices de la tabla `especialista_servicio`
--
ALTER TABLE `especialista_servicio`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `especialista_id` (`especialista_id`,`servicio_id`),
  ADD KEY `servicio_id` (`servicio_id`);

--
-- Indices de la tabla `redes_sociales`
--
ALTER TABLE `redes_sociales`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `resenas`
--
ALTER TABLE `resenas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `especialista_id` (`especialista_id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `servicios`
--
ALTER TABLE `servicios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `especialidad_id` (`especialidad_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `caracteristicas`
--
ALTER TABLE `caracteristicas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `especialidades`
--
ALTER TABLE `especialidades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `especialistas`
--
ALTER TABLE `especialistas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `especialista_caracteristica`
--
ALTER TABLE `especialista_caracteristica`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `especialista_especialidad`
--
ALTER TABLE `especialista_especialidad`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `especialista_red_social`
--
ALTER TABLE `especialista_red_social`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `especialista_servicio`
--
ALTER TABLE `especialista_servicio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `redes_sociales`
--
ALTER TABLE `redes_sociales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `resenas`
--
ALTER TABLE `resenas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `servicios`
--
ALTER TABLE `servicios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `especialistas`
--
ALTER TABLE `especialistas`
  ADD CONSTRAINT `especialistas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `especialista_caracteristica`
--
ALTER TABLE `especialista_caracteristica`
  ADD CONSTRAINT `especialista_caracteristica_ibfk_1` FOREIGN KEY (`especialista_id`) REFERENCES `especialistas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `especialista_caracteristica_ibfk_2` FOREIGN KEY (`caracteristica_id`) REFERENCES `caracteristicas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `especialista_especialidad`
--
ALTER TABLE `especialista_especialidad`
  ADD CONSTRAINT `especialista_especialidad_ibfk_1` FOREIGN KEY (`especialista_id`) REFERENCES `especialistas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `especialista_especialidad_ibfk_2` FOREIGN KEY (`especialidad_id`) REFERENCES `especialidades` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `especialista_red_social`
--
ALTER TABLE `especialista_red_social`
  ADD CONSTRAINT `especialista_red_social_ibfk_1` FOREIGN KEY (`especialista_id`) REFERENCES `especialistas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `especialista_red_social_ibfk_2` FOREIGN KEY (`red_social_id`) REFERENCES `redes_sociales` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `especialista_servicio`
--
ALTER TABLE `especialista_servicio`
  ADD CONSTRAINT `especialista_servicio_ibfk_1` FOREIGN KEY (`especialista_id`) REFERENCES `especialistas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `especialista_servicio_ibfk_2` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `resenas`
--
ALTER TABLE `resenas`
  ADD CONSTRAINT `resenas_ibfk_1` FOREIGN KEY (`especialista_id`) REFERENCES `especialistas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `resenas_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `servicios`
--
ALTER TABLE `servicios`
  ADD CONSTRAINT `servicios_ibfk_1` FOREIGN KEY (`especialidad_id`) REFERENCES `especialidades` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

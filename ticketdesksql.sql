-- --------------------------------------------------------
-- Servidor:                     127.0.0.1
-- Versão do servidor:           8.4.3 - MySQL Community Server - GPL
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Copiando estrutura do banco de dados para ticketdesk
CREATE DATABASE IF NOT EXISTS `ticketdesk` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `ticketdesk`;

-- Copiando estrutura para tabela ticketdesk.comment
CREATE TABLE IF NOT EXISTS `comment` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ticketId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `isInternal` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Comment_ticketId_idx` (`ticketId`),
  KEY `Comment_userId_fkey` (`userId`),
  CONSTRAINT `Comment_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `ticket` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Comment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela ticketdesk.comment: ~8 rows (aproximadamente)
INSERT INTO `comment` (`id`, `ticketId`, `userId`, `message`, `isInternal`, `createdAt`) VALUES
	('19d93ce1-af90-4713-b071-bfbd3a0dfad2', 'eb6b934d-8f93-40d0-9066-6d548992e06f', '192282bc-2dc5-4def-be60-be42271a9283', 'teste', 1, '2026-05-14 12:58:59.121'),
	('21f0ef40-7863-4e67-a341-730bd70c3b54', 'eb6b934d-8f93-40d0-9066-6d548992e06f', '192282bc-2dc5-4def-be60-be42271a9283', 'testee', 0, '2026-05-15 10:44:08.787'),
	('47a6174f-8bdd-4c34-bd47-d3f92bdd2764', 'caf70cb3-0ca5-4199-a7e3-b2f4312c14ea', '192282bc-2dc5-4def-be60-be42271a9283', 'Finalização (EM_ANDAMENTO → RESOLVIDO): finalizado', 0, '2026-05-15 10:45:27.433'),
	('72b7f345-da90-43db-b0b9-4c58d1f0d6ca', 'c07da24f-1e28-4fbe-b801-b4920d34c9e6', '192282bc-2dc5-4def-be60-be42271a9283', 'Finalização (EM_ANDAMENTO → CANCELADO): nao sei fazer', 0, '2026-05-15 15:37:04.568'),
	('b82ad223-b7ed-44fb-951e-be93492e5260', '0c23c0cd-990c-461f-95aa-aa70b7b44363', '192282bc-2dc5-4def-be60-be42271a9283', 'teste', 1, '2026-05-14 13:00:01.461'),
	('bf0aa238-8037-4d41-bef5-a48f51b6ae99', 'eb6b934d-8f93-40d0-9066-6d548992e06f', '192282bc-2dc5-4def-be60-be42271a9283', 'teste', 0, '2026-05-15 12:43:19.891'),
	('e8d09d59-3a1c-4b7b-ac31-cd70bfac8371', '0c23c0cd-990c-461f-95aa-aa70b7b44363', 'c7fc51fd-ebdc-4ca4-afad-2a6a75aa3fb6', 'teste', 0, '2026-05-14 13:00:15.821'),
	('ff13a2e1-1a0c-45a6-80f7-9b40e59c0470', 'eb6b934d-8f93-40d0-9066-6d548992e06f', '192282bc-2dc5-4def-be60-be42271a9283', 'teste', 0, '2026-05-14 12:58:56.791');

-- Copiando estrutura para tabela ticketdesk.passwordreset
CREATE TABLE IF NOT EXISTS `passwordreset` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `usedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `PasswordReset_token_key` (`token`),
  KEY `PasswordReset_userId_fkey` (`userId`),
  CONSTRAINT `PasswordReset_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela ticketdesk.passwordreset: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela ticketdesk.ticket
CREATE TABLE IF NOT EXISTS `ticket` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('ABERTO','EM_ANDAMENTO','AGUARDANDO','RESOLVIDO','CANCELADO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ABERTO',
  `priority` enum('BAIXA','MEDIA','ALTA','CRITICA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEDIA',
  `category` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Outros',
  `requesterId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assignedToId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resolvedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `resolutionNote` text COLLATE utf8mb4_unicode_ci,
  `slaLevel` enum('ATE_120H','ATE_72H','ATE_48H','ATE_24H','ATE_8H','ATE_4H') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ATE_48H',
  `establishment` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `managerEmail` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `managerName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `occurrenceType` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `requesterEmail` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `technicianKey` enum('KAIQUE_OLIVEIRA','FERNANDO_FERNANDES','RODRIGO_CARMO','ALEXANDRE') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Ticket_requesterId_idx` (`requesterId`),
  KEY `Ticket_assignedToId_idx` (`assignedToId`),
  KEY `Ticket_status_idx` (`status`),
  KEY `Ticket_slaLevel_idx` (`slaLevel`),
  CONSTRAINT `Ticket_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Ticket_requesterId_fkey` FOREIGN KEY (`requesterId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela ticketdesk.ticket: ~4 rows (aproximadamente)
INSERT INTO `ticket` (`id`, `title`, `description`, `status`, `priority`, `category`, `requesterId`, `assignedToId`, `resolvedAt`, `createdAt`, `updatedAt`, `resolutionNote`, `slaLevel`, `establishment`, `managerEmail`, `managerName`, `occurrenceType`, `requesterEmail`, `technicianKey`) VALUES
	('0c23c0cd-990c-461f-95aa-aa70b7b44363', 'teste', 'teste', 'ABERTO', 'MEDIA', 'Software', 'c7fc51fd-ebdc-4ca4-afad-2a6a75aa3fb6', 'e779ed58-6196-4521-b0a6-d9fe2fa9f745', NULL, '2026-05-14 12:59:27.587', '2026-05-19 14:22:35.836', NULL, 'ATE_48H', NULL, NULL, NULL, NULL, NULL, NULL),
	('c07da24f-1e28-4fbe-b801-b4920d34c9e6', 'teste', 'teste', 'CANCELADO', 'MEDIA', 'Outros', 'c7fc51fd-ebdc-4ca4-afad-2a6a75aa3fb6', NULL, '2026-05-15 15:37:04.470', '2026-05-15 10:41:22.321', '2026-05-15 15:37:04.491', 'nao sei fazer', 'ATE_48H', 'Flamin', 'gestor.comercial@empresa.com.br', 'Gestor Comercial', 'rede', 'kaique.oliveira@bioleve.com.br', 'KAIQUE_OLIVEIRA'),
	('caf70cb3-0ca5-4199-a7e3-b2f4312c14ea', 'teste', 'teste', 'RESOLVIDO', 'MEDIA', 'Outros', 'c7fc51fd-ebdc-4ca4-afad-2a6a75aa3fb6', NULL, '2026-05-15 10:45:27.417', '2026-05-15 10:42:03.337', '2026-05-15 10:45:27.421', 'finalizado', 'ATE_48H', 'fladis', 'gestor.rh@empresa.com.br', 'Gestor de RH', 'rede', 'kaique.oliveira@bioleve.com.br', 'KAIQUE_OLIVEIRA'),
	('eb6b934d-8f93-40d0-9066-6d548992e06f', 'teste', 'teste', 'EM_ANDAMENTO', 'MEDIA', 'Software', '192282bc-2dc5-4def-be60-be42271a9283', NULL, NULL, '2026-05-14 12:58:36.335', '2026-05-19 14:22:41.760', NULL, 'ATE_48H', NULL, NULL, NULL, NULL, NULL, NULL);

-- Copiando estrutura para tabela ticketdesk.ticketattachment
CREATE TABLE IF NOT EXISTS `ticketattachment` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ticketId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fileName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `originalName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mimeType` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `size` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `TicketAttachment_ticketId_idx` (`ticketId`),
  CONSTRAINT `TicketAttachment_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `ticket` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela ticketdesk.ticketattachment: ~0 rows (aproximadamente)
INSERT INTO `ticketattachment` (`id`, `ticketId`, `fileName`, `originalName`, `mimeType`, `size`, `createdAt`) VALUES
	('589a4d5d-ce5f-48c9-be2d-c359f3f4b83b', 'caf70cb3-0ca5-4199-a7e3-b2f4312c14ea', '689d17dd-56cb-4405-9686-fef2b8f28407.jpg', 'wallpaper.jpg', 'image/jpeg', 1855257, '2026-05-15 10:42:03.358');

-- Copiando estrutura para tabela ticketdesk.tickethistory
CREATE TABLE IF NOT EXISTS `tickethistory` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ticketId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `field` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `oldValue` text COLLATE utf8mb4_unicode_ci,
  `newValue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `changedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `TicketHistory_ticketId_idx` (`ticketId`),
  CONSTRAINT `TicketHistory_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `ticket` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela ticketdesk.tickethistory: ~16 rows (aproximadamente)
INSERT INTO `tickethistory` (`id`, `ticketId`, `field`, `oldValue`, `newValue`, `changedAt`) VALUES
	('04ff95bb-0a04-4881-ac63-bfe612c6ddf4', 'eb6b934d-8f93-40d0-9066-6d548992e06f', 'status', 'ABERTO', 'AGUARDANDO', '2026-05-15 10:44:14.248'),
	('05931c11-52d2-4333-8d56-379c86bb2d24', 'eb6b934d-8f93-40d0-9066-6d548992e06f', 'status', 'AGUARDANDO', 'ABERTO', '2026-05-15 10:44:15.247'),
	('09dbe2f2-d3c2-45f5-badd-6b8c1e0c93aa', '0c23c0cd-990c-461f-95aa-aa70b7b44363', 'status', 'RESOLVIDO', 'EM_ANDAMENTO', '2026-05-14 13:38:50.465'),
	('11ceb1cf-85b9-49fb-b56f-e7cf13502cae', 'eb6b934d-8f93-40d0-9066-6d548992e06f', 'status', 'EM_ANDAMENTO', 'AGUARDANDO', '2026-05-19 14:22:40.561'),
	('16170dfc-9682-4fa8-b6ae-9b5c6ea514cf', '0c23c0cd-990c-461f-95aa-aa70b7b44363', 'status', 'AGUARDANDO', 'ABERTO', '2026-05-19 14:22:35.841'),
	('257bebcd-7fdd-4e26-a834-63e46338ba50', '0c23c0cd-990c-461f-95aa-aa70b7b44363', 'status', 'ABERTO', 'EM_ANDAMENTO', '2026-05-14 13:39:01.880'),
	('2e318c69-96f4-408d-b509-01cd69a4ade5', 'eb6b934d-8f93-40d0-9066-6d548992e06f', 'status', 'ABERTO', 'AGUARDANDO', '2026-05-15 15:11:19.942'),
	('3a0983b7-cc8c-48d4-9b6d-b77a77ead817', 'caf70cb3-0ca5-4199-a7e3-b2f4312c14ea', 'status', 'EM_ANDAMENTO', 'RESOLVIDO', '2026-05-15 10:45:27.425'),
	('3ea06ba2-4f0d-4c7a-9ea9-3d0718b86d41', '0c23c0cd-990c-461f-95aa-aa70b7b44363', 'status', 'EM_ANDAMENTO', 'RESOLVIDO', '2026-05-14 13:02:35.899'),
	('41917b26-308c-43d1-adb2-f356c68eb95a', '0c23c0cd-990c-461f-95aa-aa70b7b44363', 'status', 'EM_ANDAMENTO', 'ABERTO', '2026-05-15 15:11:24.175'),
	('4d6c2a3f-c3bb-47f0-a25f-e026459e877f', '0c23c0cd-990c-461f-95aa-aa70b7b44363', 'assignedToId', NULL, '192282bc-2dc5-4def-be60-be42271a9283', '2026-05-14 13:02:29.459'),
	('52b3efbb-db48-4894-b9a7-733f124538ff', 'eb6b934d-8f93-40d0-9066-6d548992e06f', 'status', 'EM_ANDAMENTO', 'AGUARDANDO', '2026-05-19 14:22:36.429'),
	('5394d66c-46f9-43e0-86a5-f8bcaa47f9ca', 'c07da24f-1e28-4fbe-b801-b4920d34c9e6', 'resolutionNote', NULL, 'nao sei fazer', '2026-05-15 15:37:04.540'),
	('6fa7a767-f064-40d0-9285-b8ed1c17653b', 'c07da24f-1e28-4fbe-b801-b4920d34c9e6', 'status', 'EM_ANDAMENTO', 'CANCELADO', '2026-05-15 15:37:04.540'),
	('71aca6fb-d185-4d92-b0cc-e6cff7431bd0', 'caf70cb3-0ca5-4199-a7e3-b2f4312c14ea', 'resolutionNote', NULL, 'finalizado', '2026-05-15 10:45:27.425'),
	('752d2dd4-4307-4696-a1bb-c05b4a9df4c9', 'eb6b934d-8f93-40d0-9066-6d548992e06f', 'status', 'AGUARDANDO', 'ABERTO', '2026-05-15 15:11:20.916'),
	('84bed368-30c2-49cc-b69c-1bd0f724162d', '0c23c0cd-990c-461f-95aa-aa70b7b44363', 'priority', 'CRITICA', 'MEDIA', '2026-05-14 13:38:53.737'),
	('9e07a2ea-4a43-49cd-8e32-09091fd7890d', '0c23c0cd-990c-461f-95aa-aa70b7b44363', 'status', 'ABERTO', 'AGUARDANDO', '2026-05-19 14:22:34.776'),
	('ab7285e8-bd92-4ff1-8a3e-6ad699239795', '0c23c0cd-990c-461f-95aa-aa70b7b44363', 'status', 'EM_ANDAMENTO', 'ABERTO', '2026-05-14 13:38:51.585'),
	('b8b6ad71-264c-4b00-8887-c731ede30ba6', 'eb6b934d-8f93-40d0-9066-6d548992e06f', 'status', 'ABERTO', 'EM_ANDAMENTO', '2026-05-15 15:11:21.880'),
	('bfeed52a-7776-4403-8a8e-10f3aa7d7ae0', 'eb6b934d-8f93-40d0-9066-6d548992e06f', 'status', 'AGUARDANDO', 'EM_ANDAMENTO', '2026-05-19 14:22:41.763'),
	('c8f825ee-b53f-4e6a-a309-28a5ed122269', 'eb6b934d-8f93-40d0-9066-6d548992e06f', 'status', 'AGUARDANDO', 'EM_ANDAMENTO', '2026-05-19 14:22:37.108'),
	('d396d296-ad5e-4b9a-a22a-7e214c806684', '0c23c0cd-990c-461f-95aa-aa70b7b44363', 'assignedToId', '192282bc-2dc5-4def-be60-be42271a9283', 'e779ed58-6196-4521-b0a6-d9fe2fa9f745', '2026-05-14 13:39:01.880'),
	('d6bd4011-9634-49de-b50b-38fa40320d9c', '0c23c0cd-990c-461f-95aa-aa70b7b44363', 'status', 'ABERTO', 'EM_ANDAMENTO', '2026-05-14 13:02:29.459');

-- Copiando estrutura para tabela ticketdesk.user
CREATE TABLE IF NOT EXISTS `user` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('ADMIN','TECNICO','USUARIO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USUARIO',
  `department` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela ticketdesk.user: ~4 rows (aproximadamente)
INSERT INTO `user` (`id`, `name`, `email`, `password`, `role`, `department`, `active`, `createdAt`, `updatedAt`) VALUES
	('192282bc-2dc5-4def-be60-be42271a9283', 'Administrador', 'admin@local.dev', '$2b$12$omrgD0U4aSJVF7dsU65KB.XYv/g.cdEBjDA8huHQNXjiWhfLfi6Lu', 'ADMIN', 'TI', 1, '2026-05-14 12:23:39.270', '2026-05-14 12:23:39.270'),
	('b6533956-9388-4667-a29f-9afa5367a639', 'Usuário Demo', 'usuario@local.dev', '$2b$12$r13ouQL0/opNUSO3AiOklOCgBK2VRtR3hBR8phecJQOXuIaVxlcWu', 'USUARIO', 'Financeiro', 1, '2026-05-14 12:23:39.861', '2026-05-14 12:23:39.861'),
	('c7fc51fd-ebdc-4ca4-afad-2a6a75aa3fb6', 'Kaique', 'kaique.oliveira@bioleve.com.br', '$2b$12$i6lob9SalhvVJ5IdTIc0R..si6Rvmq/PAqYxZyn2L69nKl2VXKhYW', 'USUARIO', 'T.I', 1, '2026-05-14 12:58:13.452', '2026-05-14 12:58:13.452'),
	('e779ed58-6196-4521-b0a6-d9fe2fa9f745', 'Técnico Demo', 'tecnico@local.dev', '$2b$12$pYV8rILeE1VzCNkAr9MjYen3kdIQd8dbaA29lHm1SoU1VJSOVcFIS', 'TECNICO', 'TI', 1, '2026-05-14 12:23:39.568', '2026-05-14 12:23:39.568');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

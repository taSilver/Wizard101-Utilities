-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 16, 2020 at 10:07 AM
-- Server version: 10.4.11-MariaDB
-- PHP Version: 7.4.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `wizard101`
--

-- --------------------------------------------------------

--
-- Table structure for table `accuracy`
--

DROP TABLE IF EXISTS `accuracy`;
CREATE TABLE `accuracy` (
  `gear_id` int(10) NOT NULL,
  `accuracy_school` varchar(10) NOT NULL,
  `accuracy_amt` int(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `block`
--

DROP TABLE IF EXISTS `block`;
CREATE TABLE `block` (
  `gear_id` int(10) NOT NULL,
  `block_school` varchar(10) NOT NULL,
  `block_amt` int(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `card`
--

DROP TABLE IF EXISTS `card`;
CREATE TABLE `card` (
  `card_id` int(5) NOT NULL,
  `card_name` varchar(30) NOT NULL,
  `card_link` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `critical`
--

DROP TABLE IF EXISTS `critical`;
CREATE TABLE `critical` (
  `gear_id` int(10) NOT NULL,
  `critical_school` varchar(10) NOT NULL,
  `critical_amt` int(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `damage_flat`
--

DROP TABLE IF EXISTS `damage_flat`;
CREATE TABLE `damage_flat` (
  `gear_id` int(10) NOT NULL,
  `dmg_f_school` varchar(10) NOT NULL,
  `dmg_f_amt` int(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `damage_percent`
--

DROP TABLE IF EXISTS `damage_percent`;
CREATE TABLE `damage_percent` (
  `gear_id` int(10) NOT NULL COMMENT 'foreign key',
  `dmg_p_school` int(10) NOT NULL COMMENT 'type of school of damage',
  `dmg_p_amt` int(3) NOT NULL COMMENT 'amount of damage'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `gear`
--

DROP TABLE IF EXISTS `gear`;
CREATE TABLE `gear` (
  `gear_id` int(10) NOT NULL COMMENT 'primary key',
  `gear_name` varchar(50) NOT NULL COMMENT 'Name of gear',
  `gear_school` varchar(10) NOT NULL DEFAULT 'universal' COMMENT 'School of gear',
  `gear_level` int(3) NOT NULL DEFAULT 0 COMMENT 'min level of gear',
  `gear_type` varchar(6) NOT NULL COMMENT 'type of gear, hat, robe etc.',
  `gear_category` varchar(50) DEFAULT NULL COMMENT 'General category of gear, e.g. waterworks, dragoon etc',
  `gear_url` varchar(150) NOT NULL COMMENT 'link to wiki page of item',
  `gear_meta` varchar(1) NOT NULL DEFAULT 'N' COMMENT 'Y or N for if gear is ''meta'' or not'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `gear_card`
--

DROP TABLE IF EXISTS `gear_card`;
CREATE TABLE `gear_card` (
  `gear_id` int(10) NOT NULL,
  `card_id` int(5) NOT NULL,
  `card_maycast` varchar(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `jewel`
--

DROP TABLE IF EXISTS `jewel`;
CREATE TABLE `jewel` (
  `jewel_id` int(3) NOT NULL,
  `jewel_name` varchar(50) NOT NULL,
  `jewel_level` int(3) NOT NULL,
  `jewel_amt` int(4) NOT NULL,
  `jewel_socket` varchar(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `misc_stats`
--

DROP TABLE IF EXISTS `misc_stats`;
CREATE TABLE `misc_stats` (
  `gear_id` int(10) NOT NULL,
  `misc_health` int(5) NOT NULL,
  `misc_mana` int(4) NOT NULL,
  `misc_incoming` int(3) NOT NULL,
  `misc_outgoing` int(3) NOT NULL,
  `misc_shadow_rating` int(4) NOT NULL,
  `misc_stun_resist` int(3) NOT NULL,
  `misc_pip_chance` int(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `pierce`
--

DROP TABLE IF EXISTS `pierce`;
CREATE TABLE `pierce` (
  `gear_id` int(10) NOT NULL,
  `pierce_school` varchar(10) NOT NULL,
  `pierce_amt` int(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `pip_conversion`
--

DROP TABLE IF EXISTS `pip_conversion`;
CREATE TABLE `pip_conversion` (
  `gear_id` int(10) NOT NULL,
  `pip_conversion_school` varchar(10) NOT NULL,
  `pip_conversion_amt` int(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `resist_flat`
--

DROP TABLE IF EXISTS `resist_flat`;
CREATE TABLE `resist_flat` (
  `gear_id` int(10) NOT NULL,
  `resist_flat_school` varchar(10) NOT NULL,
  `resist_flat_amt` int(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `resist_percent`
--

DROP TABLE IF EXISTS `resist_percent`;
CREATE TABLE `resist_percent` (
  `gear_id` int(10) NOT NULL,
  `resist_percent_school` varchar(10) NOT NULL,
  `resist_percent_amt` int(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `socket`
--

DROP TABLE IF EXISTS `socket`;
CREATE TABLE `socket` (
  `gear_id` int(10) NOT NULL,
  `socket_tear` int(1) NOT NULL,
  `socket_circle` int(1) NOT NULL,
  `socket_square` int(1) NOT NULL,
  `socket_triangle` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accuracy`
--
ALTER TABLE `accuracy`
  ADD PRIMARY KEY (`gear_id`,`accuracy_school`);

--
-- Indexes for table `block`
--
ALTER TABLE `block`
  ADD PRIMARY KEY (`gear_id`,`block_school`);

--
-- Indexes for table `card`
--
ALTER TABLE `card`
  ADD PRIMARY KEY (`card_id`);

--
-- Indexes for table `critical`
--
ALTER TABLE `critical`
  ADD PRIMARY KEY (`gear_id`,`critical_school`);

--
-- Indexes for table `damage_flat`
--
ALTER TABLE `damage_flat`
  ADD PRIMARY KEY (`gear_id`,`dmg_f_school`);

--
-- Indexes for table `damage_percent`
--
ALTER TABLE `damage_percent`
  ADD PRIMARY KEY (`gear_id`,`dmg_p_school`);

--
-- Indexes for table `gear`
--
ALTER TABLE `gear`
  ADD PRIMARY KEY (`gear_id`),
  ADD UNIQUE KEY `gear_name` (`gear_name`);

--
-- Indexes for table `gear_card`
--
ALTER TABLE `gear_card`
  ADD PRIMARY KEY (`gear_id`,`card_id`),
  ADD KEY `card_fk` (`card_id`);

--
-- Indexes for table `jewel`
--
ALTER TABLE `jewel`
  ADD PRIMARY KEY (`jewel_id`);

--
-- Indexes for table `misc_stats`
--
ALTER TABLE `misc_stats`
  ADD PRIMARY KEY (`gear_id`);

--
-- Indexes for table `pierce`
--
ALTER TABLE `pierce`
  ADD PRIMARY KEY (`gear_id`,`pierce_school`);

--
-- Indexes for table `pip_conversion`
--
ALTER TABLE `pip_conversion`
  ADD PRIMARY KEY (`gear_id`,`pip_conversion_school`);

--
-- Indexes for table `resist_flat`
--
ALTER TABLE `resist_flat`
  ADD PRIMARY KEY (`gear_id`,`resist_flat_school`);

--
-- Indexes for table `resist_percent`
--
ALTER TABLE `resist_percent`
  ADD PRIMARY KEY (`gear_id`,`resist_percent_school`);

--
-- Indexes for table `socket`
--
ALTER TABLE `socket`
  ADD PRIMARY KEY (`gear_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `card`
--
ALTER TABLE `card`
  MODIFY `card_id` int(5) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `gear`
--
ALTER TABLE `gear`
  MODIFY `gear_id` int(10) NOT NULL AUTO_INCREMENT COMMENT 'primary key';

--
-- Constraints for dumped tables
--

--
-- Constraints for table `accuracy`
--
ALTER TABLE `accuracy`
  ADD CONSTRAINT `gear_acc_fk` FOREIGN KEY (`gear_id`) REFERENCES `gear` (`gear_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `block`
--
ALTER TABLE `block`
  ADD CONSTRAINT `gear_block_fk` FOREIGN KEY (`gear_id`) REFERENCES `gear` (`gear_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `critical`
--
ALTER TABLE `critical`
  ADD CONSTRAINT `gear_critical_fk` FOREIGN KEY (`gear_id`) REFERENCES `gear` (`gear_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `damage_flat`
--
ALTER TABLE `damage_flat`
  ADD CONSTRAINT `gear_dmg_f_fk` FOREIGN KEY (`gear_id`) REFERENCES `gear` (`gear_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `damage_percent`
--
ALTER TABLE `damage_percent`
  ADD CONSTRAINT `gear_id_fk` FOREIGN KEY (`gear_id`) REFERENCES `gear` (`gear_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `gear_card`
--
ALTER TABLE `gear_card`
  ADD CONSTRAINT `card_fk` FOREIGN KEY (`card_id`) REFERENCES `card` (`card_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gear_card_fk` FOREIGN KEY (`gear_id`) REFERENCES `gear` (`gear_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `misc_stats`
--
ALTER TABLE `misc_stats`
  ADD CONSTRAINT `gear_misc_fk` FOREIGN KEY (`gear_id`) REFERENCES `gear` (`gear_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `pierce`
--
ALTER TABLE `pierce`
  ADD CONSTRAINT `gear_pierce_fk` FOREIGN KEY (`gear_id`) REFERENCES `gear` (`gear_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `pip_conversion`
--
ALTER TABLE `pip_conversion`
  ADD CONSTRAINT `gear_pip_con_fk` FOREIGN KEY (`gear_id`) REFERENCES `gear` (`gear_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `resist_flat`
--
ALTER TABLE `resist_flat`
  ADD CONSTRAINT `gear_res_f_fk` FOREIGN KEY (`gear_id`) REFERENCES `gear` (`gear_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `resist_percent`
--
ALTER TABLE `resist_percent`
  ADD CONSTRAINT `gear_resist_p_fk` FOREIGN KEY (`gear_id`) REFERENCES `gear` (`gear_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `socket`
--
ALTER TABLE `socket`
  ADD CONSTRAINT `socket_gear_id` FOREIGN KEY (`gear_id`) REFERENCES `gear` (`gear_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

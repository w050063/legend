/*
Navicat MySQL Data Transfer

Source Server         : localhost
Source Server Version : 50624
Source Host           : localhost:3306
Source Database       : nodejs

Target Server Type    : MYSQL
Target Server Version : 50624
File Encoding         : 65001

Date: 2016-12-30 22:47:53
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `t_accounts`
-- ----------------------------
DROP TABLE IF EXISTS `t_accounts`;
CREATE TABLE `t_accounts` (
  `id` varchar(16) NOT NULL,
  `password` varchar(16) NOT NULL,
  `name` varchar(32) NOT NULL,
  `create_time` varchar(16) NOT NULL DEFAULT '0',
  `last_time` varchar(16) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for `t_roles`
-- ----------------------------
DROP TABLE IF EXISTS `t_roles`;
CREATE TABLE `t_roles` (
  `id` varchar(16) NOT NULL,
  `map_id` varchar(4) NOT NULL,
  `x` int(4) NOT NULL,
  `y` int(4) NOT NULL,
  `type` varchar(16) NOT NULL,
  `camp` int(1) NOT NULL,
  `sex` int(1) NOT NULL,
  `direction` int(1) NOT NULL,
  `level` int(4) NOT NULL,
  `exp` int(8) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for `t_items`
-- ----------------------------
DROP TABLE IF EXISTS `t_items`;
CREATE TABLE `t_items` (
  `id` varchar(16) NOT NULL,
  `mid` varchar(16) NOT NULL,
  `owner` varchar(16) NOT NULL,
  `puton` int(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for `t_chats`
-- ----------------------------
DROP TABLE IF EXISTS `t_chats`;
CREATE TABLE `t_chats` (
  `id` int(16) unsigned NOT NULL AUTO_INCREMENT,
  `aid` varchar(16) NOT NULL,
  `chat` varchar(4096) NOT NULL,
  `chat_time` varchar(16) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- ----------------------------
-- Table structure for `t_guild`
-- ----------------------------
DROP TABLE IF EXISTS `t_guilds`;
CREATE TABLE `t_guilds` (
  `id` varchar(16) NOT NULL,
  `name` varchar(36) NOT NULL,
  `member` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- ----------------------------
-- Table structure for `t_custom`
-- ----------------------------
DROP TABLE IF EXISTS `t_custom`;
CREATE TABLE `t_custom` (
  `id` varchar(16) NOT NULL,
  `data` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
INSERT INTO t_custom(id,data) VALUES("0","{}");

-- ----------------------------
-- alter table
-- ----------------------------
alter table t_roles add column gold int(8) NOT NULL DEFAULT 0;
alter table t_roles add column office int(8) NOT NULL DEFAULT 0;
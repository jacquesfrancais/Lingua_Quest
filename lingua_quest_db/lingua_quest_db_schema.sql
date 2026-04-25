-- =========================================================
-- Database: lingua_quest_db
-- =========================================================

DROP DATABASE IF EXISTS lingua_quest_db;
CREATE DATABASE lingua_quest_db
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE lingua_quest_db;

-- =========================================================
-- Table: ItemLibrary
-- =========================================================
CREATE TABLE ItemLibrary (
  itemId INT NOT NULL AUTO_INCREMENT,
  nameFrench VARCHAR(100) NOT NULL,
  nameEnglish VARCHAR(100) DEFAULT NULL,
  itemType ENUM('Weapon','Armor','Consumable','Quest','Treasure') DEFAULT NULL,
  baseValue INT DEFAULT 0,
  weight DECIMAL(5,2) DEFAULT 0.00,
  extraData JSON DEFAULT NULL,
  PRIMARY KEY (itemId)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- Table: Characters
-- =========================================================
CREATE TABLE Characters (
  id INT NOT NULL AUTO_INCREMENT,
  characterName VARCHAR(100) DEFAULT 'New Adventurer',
  currentLocationID INT DEFAULT 101,
  hitPoints INT DEFAULT 100,
  maxHitPoints INT DEFAULT 100,
  strength INT DEFAULT 10,
  agility INT DEFAULT 10,
  charisma INT DEFAULT 10,
  gold DECIMAL(10,2) DEFAULT 50.00,
  speechSuccessCount INT DEFAULT 0,
  isShortcutUnlocked TINYINT(1) DEFAULT 0,
  ownerId VARCHAR(255) DEFAULT NULL,
  armor INT DEFAULT 0,
  experiencePoints INT DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY ownerId (ownerId)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- Table: Locations
-- =========================================================
CREATE TABLE Locations (
  nodeId INT NOT NULL,
  title VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  parentId INT DEFAULT NULL,
  nodeType VARCHAR(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  textFrench TEXT COLLATE utf8mb4_unicode_ci,
  textEnglish TEXT COLLATE utf8mb4_unicode_ci,
  northTarget INT DEFAULT 0,
  southTarget INT DEFAULT 0,
  eastTarget INT DEFAULT 0,
  westTarget INT DEFAULT 0,
  upTarget INT DEFAULT 0,
  downTarget INT DEFAULT 0,
  inTarget INT DEFAULT 0,
  outTarget INT DEFAULT 0,
  mapX INT DEFAULT NULL,
  mapY INT DEFAULT NULL,
  mapZ INT DEFAULT NULL,
  isDiscovered TINYINT(1) DEFAULT 0,
  PRIMARY KEY (nodeId)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- Table: Npcs
-- =========================================================
CREATE TABLE Npcs (
  npcId INT NOT NULL AUTO_INCREMENT,
  npcNameFrench VARCHAR(100) DEFAULT NULL,
  npcNameEnglish VARCHAR(100) DEFAULT NULL,
  homeNodeId INT DEFAULT NULL,
  currentLocationId INT DEFAULT NULL,
  npcStatus VARCHAR(50) DEFAULT 'Active',
  disposition VARCHAR(50) DEFAULT 'Neutral',
  hitPoints INT DEFAULT NULL,
  maxHitPoints INT DEFAULT NULL,
  strength INT DEFAULT NULL,
  agility INT DEFAULT NULL,
  charisma INT DEFAULT NULL,
  dialogueTreeId VARCHAR(100) DEFAULT NULL,
  isMerchant TINYINT(1) DEFAULT 0,
  greetingFrench TEXT,
  greetingEnglish TEXT,
  armor INT DEFAULT 0,
  isDead TINYINT(1) DEFAULT 0,
  isAlly TINYINT(1) DEFAULT 0,
  PRIMARY KEY (npcId)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- Table: ItemInstances
-- =========================================================
CREATE TABLE ItemInstances (
  instanceId INT NOT NULL AUTO_INCREMENT,
  itemId INT DEFAULT NULL,
  ownerType ENUM('Player','NPC','Room') DEFAULT NULL,
  ownerId INT DEFAULT NULL,
  PRIMARY KEY (instanceId),
  KEY itemId (itemId),
  CONSTRAINT iteminstances_ibfk_1
    FOREIGN KEY (itemId)
    REFERENCES ItemLibrary (itemId)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- Table: WorldTemplates
-- =========================================================
CREATE TABLE WorldTemplates (
  templateId INT NOT NULL AUTO_INCREMENT,
  itemId INT DEFAULT NULL,
  ownerType ENUM('Room','NPC','Player') DEFAULT NULL,
  ownerId INT DEFAULT NULL,
  PRIMARY KEY (templateId),
  KEY itemId (itemId),
  CONSTRAINT worldtemplates_ibfk_1
    FOREIGN KEY (itemId)
    REFERENCES ItemLibrary (itemId)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;
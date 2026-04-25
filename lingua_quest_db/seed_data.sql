-- Run after lingua_quest_db_schema.sql (or any time you need to reset world + seed data)
-- In PowerShell: cmd /c "mysql -u YourUser -p < lingua_quest_db\seed_data.sql"
USE lingua_quest_db;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE WorldTemplates;
TRUNCATE TABLE ItemInstances;
TRUNCATE TABLE Npcs;
TRUNCATE TABLE Characters;
TRUNCATE TABLE Locations;
TRUNCATE TABLE ItemLibrary;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO ItemLibrary (itemId, nameFrench, nameEnglish, itemType, baseValue, weight, extraData) VALUES
(1, 'Épée Rouillée', 'Rusty Sword', 'Weapon', 10, 3.00, '{"damage": 5}'),
(2, 'Hache de Guerre', 'Battle Axe', 'Weapon', 50, 6.00, '{"damage": 12}'),
(3, 'Dague en Os', 'Bone Dagger', 'Weapon', 15, 1.00, '{"damage": 4}'),
(4, 'Armure de Cuir', 'Leather Armor', 'Armor', 40, 10.00, '{"defense": 5}'),
(5, 'Bouclier de Bois', 'Wooden Shield', 'Armor', 20, 5.00, '{"defense": 3}'),
(6, 'Cotte de Mailles', 'Chainmail', 'Armor', 100, 20.00, '{"defense": 10}'),
(7, 'Collier en Argent', 'Silver Collar', 'Treasure', 75, 0.50, '{"flavor": "Un collier gravé."}'),
(8, 'Clé en Fer', 'Iron Key', 'Quest', 0, 0.10, '{"target": "Porte de la Cave"}'),
(9, 'Potion de Soins', 'Healing Potion', 'Consumable', 25, 0.50, '{"heal": 20}'),
(10, 'Statue en Or Massif', 'Solid Gold Statue', 'Treasure', 1000000, 200.00, '{"description": "Une statue incroyablement lourde et précieuse."}');

INSERT INTO Locations (nodeId, title, parentId, nodeType, textFrench, textEnglish, northTarget, southTarget, eastTarget, westTarget, upTarget, downTarget, inTarget, outTarget, mapX, mapY, mapZ, isDiscovered) VALUES
(101, 'Village', 1, 'Small', 'Vous êtes au centre d''un village.', 'You are in the center of a village.', 102, 0, 103, 0, 0, 0, 0, 0, 0, 0, 0, 1),
(102, 'Sentier', 1, 'Small', 'Un sentier menant à la grotte.', 'A path leading to the cave.', 105, 101, 0, 0, 0, 0, 106, 0, 0, 1, 0, 0),
(103, 'Forge', 1, 'Small', 'Une vieille forge avec une trappe.', 'An old forge with a trapdoor.', 0, 0, 104, 101, 0, 107, 0, 0, 1, 0, 0, 0),
(104, 'Jardin', 1, 'Small', 'Un jardin secret rempli de fleurs.', 'A secret garden filled with flowers.', 0, 0, 0, 103, 0, 0, 0, 0, 2, 0, 0, 0),
(105, 'Taverne', 1, 'Small', 'Une taverne chaleureuse.', 'A cozy tavern.', 0, 102, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0),
(106, 'Grotte', 1, 'Small', 'Une grotte sombre et humide.', 'A dark and damp cave.', 0, 0, 0, 0, 0, 0, 0, 102, 0, 1, 0, 0),
(107, 'Cave', 1, 'Small', 'Une cave poussiéreuse sous la forge.', 'A dusty cellar under the forge.', 0, 0, 0, 0, 103, 0, 0, 0, 1, 0, -1, 0);

INSERT INTO Characters (id, characterName, currentLocationID, hitPoints, maxHitPoints, strength, agility, charisma, gold, speechSuccessCount, isShortcutUnlocked, ownerId, armor, experiencePoints) VALUES
(1, 'Babarian Bob', 102, 120, 120, 18, 8, 15, 63.40, 113, 0, 'bob_user_001', 0, 0),
(2, 'Rowdy Randy', 101, 100, 100, 12, 15, 14, 50.00, 0, 0, 'randy_user_002', 0, 0);

INSERT INTO Npcs (npcId, npcNameFrench, npcNameEnglish, homeNodeId, currentLocationId, npcStatus, disposition, hitPoints, maxHitPoints, strength, agility, charisma, dialogueTreeId, isMerchant, greetingFrench, greetingEnglish, armor, isDead, isAlly) VALUES
(1, 'Le Loup Affamé', 'The Hungry Wolf', 102, 102, 'Active', 'Hostile', 30, 30, 12, 14, 2, 'wolf_growl.json', 0, 'Grrr… Vous m''entendez, humain ? Partez, ou sentez la morsure !', 'Grrr… You hear that, human? Leave, or feel the bite!', 2, 0, 0),
(2, 'Le Gobelin Voleur', 'The Thief Goblin', 105, 105, 'Active', 'Hostile', 20, 20, 8, 16, 4, 'goblin_threat.json', 0, 'Hé hé ! L''or, le sac, tout de suite !', 'Heh heh! The gold, the bag, right now!', 1, 0, 0),
(3, 'Le Squelette Gardien', 'The Skeleton Guardian', 107, 107, 'Active', 'Hostile', 45, 45, 15, 5, 1, 'skeleton_rattle.json', 0, 'Cliquetis… Pas un pas de plus, vivant, sans le mot.', 'Rattle… Not one more step, living one, without the word.', 5, 0, 0),
(4, 'Pierre le Forgeron', 'Pierre the Blacksmith', 103, 103, 'Active', 'Friendly', 80, 80, 18, 10, 12, 'pierre_forge.json', 1, 'Bienvenue à la forge. Je suis Pierre : que puis-je forger aujourd''hui ?', 'Welcome to the forge. I''m Pierre—what can I shape for you today?', 0, 0, 1),
(5, 'Sœur Béatrice', 'Sister Beatrice', 104, 104, 'Active', 'Friendly', 50, 50, 6, 8, 18, 'beatrice_heal.json', 0, 'Paix sur vous, voyageur. Le jardin soigne les âmes lourdes.', 'Peace upon you, traveler. The garden heals heavy souls.', 0, 0, 1),
(6, 'L''Ermite Mystérieux', 'The Mysterious Hermit', 106, 106, 'Active', 'Neutral', 40, 40, 10, 12, 10, 'hermit_riddle.json', 0, 'L''écho s''éveille… Si vous avez le temps, j''ai une devinette.', 'The echo awakens… If you have time, I have a riddle.', 0, 0, 0),
(7, 'Le Marchand Ambulant', 'The Traveling Merchant', 101, 101, 'Active', 'Neutral', 35, 35, 8, 10, 15, 'merchant.json', 1, 'Bienvenue au village ! Voulez-vous commercer ?', 'Welcome to the village! Do you want to trade?', 0, 0, 0);

INSERT INTO ItemInstances (instanceId, itemId, ownerType, ownerId) VALUES
(1, 2, 'Player', 1),
(2, 4, 'Player', 1),
(3, 3, 'Player', 2),
(4, 5, 'Player', 2),
(5, 6, 'NPC', 3),
(6, 1, 'NPC', 3),
(7, 3, 'NPC', 2),
(8, 7, 'NPC', 1),
(9, 8, 'Player', 1),
(10, 9, 'Player', 1),
(11, 10, 'Room', 102);

INSERT INTO WorldTemplates (templateId, itemId, ownerType, ownerId) VALUES
(1, 8, 'Room', 101),
(2, 9, 'Room', 105),
(3, 1, 'NPC', 3),
(4, 6, 'NPC', 3),
(5, 3, 'NPC', 2),
(6, 7, 'NPC', 1),
(7, 2, 'Player', 1),
(8, 4, 'Player', 1),
(9, 10, 'Room', 102);

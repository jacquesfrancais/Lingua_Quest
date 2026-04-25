# Lingua_Quest
RPG Adventure - learn French - text based - voice commands (STT)

## Project Architecture: Lingua Quest (French-Learning Web RPG)
------------------------------
## 1. Tech Stack & Data Layer

* Database (MySQL): Relational storage using InnoDB.
* Stateless Library: ItemLibrary stores static item data (names, weights, JSON attributes).
   * Stateful Instances: ItemInstances tracks the specific owner (Player, NPC, or Room) of every object.
   * World Persistence: Locations (Room data/coordinates) and Npcs (Status/Dialogue links).
   * Reset Engine: WorldTemplates stores the "default" state to repopulate the world via reset_game.php.
* Storage Formats: TSV for initial data seeding; JSON for complex item attributes and branching dialogue trees.

------------------------------
## 2. Backend: PHP Service Layer
Acts as a secure bridge between the frontend and MySQL:

* Session Management: Primarily hardcoded to playerId = 1 (Bob) for the current development phase.
* Logic Workers:
* move_player.php: Updates the currentLocationID in the character table.
   * process_item.php: Validates encumbrance (Strength * 5) before transferring item ownership.
   * process_command.php: Updates Gold and Success counts; triggers Charisma boosts every 10 milestones.
   * get_room.php: A master fetcher that aggregates room text, present NPCs, and ground items into a single JSON object.

------------------------------
## 3. Frontend: Modular JavaScript Engine

* engine.js (The Brain): Manages AJAX requests (fetch) and orchestrates game state changes. It triggers the "Greeting Logic" when NPCs are present.
* speech.js (Linguistic Interface):
* Synthesis: Uses Web Speech API (fr-FR) for the "Read Aloud" feature and NPC dialogue.
   * Recognition: Processes vocal commands.
   * Scoring Logic: Uses a Levenshtein distance algorithm (getSimilarity) to provide tiered rewards (Gold) based on pronunciation accuracy (75% for "Good," 95% for "Perfect").
* ui.js (The Controller): Manages the Bilingual Toggle, tab switching (Basics/Stats/Inv), and dynamic DOM updates for the Room description and Compass buttons.

------------------------------
## 4. Core Gameplay Mechanics

* Navigation: A numerical Node ID system (e.g., 101, 102) using an 8-point compass. Target IDs of 0 disable buttons/paths.
* Reward Economy: A "Speak-to-Earn" system where successful vocalizations in French grant Gold, incentivizing verbal practice over keyboard usage.
* Dialogue System: A node-based JSON overlay that forces French vocalization to progress through conversation branches.

------------------------------
## 5. Design Hierarchy

* The Diamond Flow: Story nodes are structured to branch into encounters and converge at regional "Large Diamonds" to maintain narrative control.
* Dual-Command: Speech-first interface with a hidden "Keyboard Fallback" that appears only after repeated speech recognition failures.

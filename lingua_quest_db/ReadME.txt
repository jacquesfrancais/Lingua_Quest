Run lingua_quest_db_schema.sql from a terminal. Pick ONE style that matches your shell.

-------------------------------------------------------------------
A) Command Prompt (cmd.exe) or Git Bash — from this folder
    (The folder that contains lingua_quest_db_schema.sql)

  mysql -u username -p < lingua_quest_db_schema.sql

  username = your MySQL user (match db_config.php).

-------------------------------------------------------------------
B) Windows PowerShell — "<" is not valid for this; use one of these:

  From the project folder Lingua_Quest\ (one level up from this file):

  cmd /c "mysql -u username -p < lingua_quest_db\lingua_quest_db_schema.sql"

  Or pipe the file:

  Get-Content ".\lingua_quest_db\lingua_quest_db_schema.sql" -Raw | mysql -u username -p

-------------------------------------------------------------------
Note: "mysql -u user -p something.sql" with NO "<" is wrong — MySQL
treats the last word as a DATABASE name, not a file.

BTW: db_config.php (credentials) is kept local; align user/password
with what you create in MySQL.

-------------------------------------------------------------------
After the schema, load world data (rooms, items, characters, etc.):

  cmd /c "mysql -u username -p < lingua_quest_db\seed_data.sql"
  (from the Lingua_Quest folder; same user as db_config.php)

  The app expects data such as room nodeId 101 in table Locations; without
  this step you will see: "Room 101 not found".
-------------------------------------------------------------------
TSV files vs. seed_data.sql:

  The .tsv files in this folder (ItemLibrary, Locations, Characters,
  Npcs, ItemInstances, WorldTemplates) are the same data as
  seed_data.sql — not a second copy of the world. The TSVs are easy
  to edit in a spreadsheet; seed_data.sql is a one-step way to load
  that same content into MySQL. Edit the TSVs first, then either
  update seed_data.sql to match, or import the TSVs yourself if you prefer.

===================================================================
After running the script, you can verify:

  USE lingua_quest_db;
  SHOW TABLES;

  (OR mysql -u Arcbound -p -e "USE lingua_quest_db; SHOW TABLES;" in Powershell)
<?php
// 1. Pull in your database connection ($pdo)
require_once 'db_config.php';

try {
    // 2. Start the game at Node 101 (The Village)
    $currentNode = 101;

    // 3. Prepare the SQL query (PDO style)
    $stmt = $pdo->prepare("SELECT * FROM Locations WHERE nodeId = ?");
    $stmt->execute([$currentNode]);
    $room = $stmt->fetch();

    if (!$room) {
        die("Erreur: Room 101 not found in lingua_quest_db.");
    }

} catch (PDOException $e) {
    die("Database Error: " . $e->getMessage());
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Lingua Quest - <?php echo htmlspecialchars($room['title']); ?></title>

<link rel="stylesheet" href="style.css">

</head>
<body>
<div id="game-container">
<!-- Dashboard Container -->
<div id="dashboard" style="border: 2px solid #444; padding: 15px; width: 300px; background: #f9f9f9;">
    
        <h2 id="textPlayerName" style="margin-top: 0; color: #8b0000;">Chargement...</h2>

        <div id="dashboard" ...>
    <!-- Add this toggle button at the top of the dashboard -->
    <button id="btnTranslate" onclick="toggleTranslation()" style="width:100%; margin-bottom:10px; background:#2e7d32;">
        Traduction: OFF (FR)
    </button>
    ...
</div>


    <!-- Navigation for Dashboard -->
    <div style="margin-bottom: 10px;">
        <button onclick="showTab('tabBasics')">Basics</button>
        <button onclick="showTab('tabStats')">Stats</button>
        <button onclick="showTab('tabInv')">Inventory</button>
    </div>

    <!-- Tab 1: Basics -->
    <div id="tabBasics">
        <strong>Or:</strong> <span id="textGold">50.00</span><br>
        <strong>Succès:</strong> <span id="textSpeechTotal">0</span><br>
        <strong>HP:</strong> <span id="textHP">0</span> / <span id="textMaxHP">0</span>

    </div>

    <!-- Tab 2: Deep Stats -->
    <div id="tabStats" style="display:none;">
        <strong>Force:</strong> <span id="textStr">10</span><br>
        <strong>Agilité:</strong> <span id="textAgi">10</span><br>
        <strong>Charisme:</strong> <span id="textCha">10</span>
        <strong>Charge:</strong> <span id="textCurrentWeight">0</span> / <span id="textMaxWeight">50</span> kg
    </div>

    <!-- Tab 3: Inventory -->
    <div id="tabInv" style="display:none;">
        <strong>Sac à dos:</strong>
        <ul id="listInventory">
            <!-- Items will be loaded here by PHP -->
            <li>Vide</li>
        </ul>
    </div>

    <button onclick="confirmReset()" style="margin-top: 20px; background: #333; font-size: 0.7em;">
    Réinitialiser le jeu
    </button>
</div>

    <h1 id="roomTitle"><?php echo htmlspecialchars($room['title']); ?></h1>
    <div id="description">
        <!-- This displays the French text from your MySQL table -->
        <p><?php echo nl2br(htmlspecialchars($room['textFrench'])); ?></p>
    </div>

    <!-- We'll add the Compass and Mic buttons here next -->

    <!-- The Compass Grid -->
<div id="compass" style="display: grid; grid-template-columns: repeat(3, 100px); gap: 10px; margin-top: 30px;">
    <div></div> <!-- Empty top-left -->
    <button id="btnNorth" disabled>North</button>
    <div></div> <!-- Empty top-right -->
    
    <button id="btnWest" disabled>West</button>
    <div style="text-align: center; line-height: 40px;">🧭</div>
    <button id="btnEast" disabled>East</button>
    
    <div></div> <!-- Empty bottom-left -->
    <button id="btnSouth" disabled>South</button>
    <div></div> <!-- Empty bottom-right -->
</div>

<!-- Special Movement Buttons -->
<div id="alt-moves" style="margin-top: 15px;">
    <button id="btnUp" disabled>Up</button>
    <button id="btnDown" disabled>Down</button>
    <button id="btnIn" disabled>In</button>
    <button id="btnOut" disabled>Out</button>
</div>

     <!-- Main Game Display -->

<!-- Interaction Area -->
<div id="controls" style="margin-top: 20px;">
    <button id="btnRead" onclick="speakFrench()">🔊 Read Aloud</button>
    <button id="btnMic" onclick="startListening()">🎤 Parler (Speak)</button>
</div>

<!-- Manual Input Area (Hidden by default) -->
<div id="manualInputArea" style="display: none; margin-top: 20px;">
    <p style="color: orange;"><i>Le micro a du mal ? Tapez votre commande :</i></p>
    <input type="text" id="keyboardInput" placeholder="Ex: Aller au nord">
    <button onclick="handleManualSubmit()">Envoyer</button>
</div>

<!-- The Dialogue Overlay (This is what the error is looking for) -->
<div id="dialogueOverlay" style="display:none; background: #fff8dc; border: 3px double #5d4037; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
    
    <!-- This ID must match exactly: npcTalkingName -->
    <h3 id="npcTalkingName" style="margin-top:0; color: #5d4037;">NPC Name</h3>
    
    <p id="npcSpeechText" style="font-size: 1.1em; font-style: italic; color: #333;"></p>
    
    <div id="playerResponseOptions">
        <!-- Buttons will be generated here by JavaScript -->
    </div>

    <!-- A Close button just in case -->
    <button onclick="document.getElementById('dialogueOverlay').style.display='none'" style="margin-top:15px; font-size: 0.8em; background: #5d4037;">Quitter la conversation</button>
</div>


<div id="log" style="margin-top: 20px; color: blue; font-style: italic;">
    <!-- Speech results will appear here -->
</div>
</div>

<!-- Order is important: Helpers first, Startup last -->
<script src="ui.js"></script>
<script src="speech.js"></script>
<script src="engine.js"></script>


</body>
</html>

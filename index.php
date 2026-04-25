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
    <h2 id="textPlayerName" data-pristine="1" style="margin-top: 0; color: #8b0000;">Chargement…</h2>
    <button type="button" id="btnTranslate" onclick="toggleTranslation()" style="width:100%; margin-bottom:10px; background:#2e7d32;">
        Traduction : OFF (FR)
    </button>
    <div style="margin-bottom: 10px;">
        <button type="button" id="tabBtnBasics" onclick="showTab('tabBasics')">Bases</button>
        <button type="button" id="tabBtnStats" onclick="showTab('tabStats')">Stats</button>
        <button type="button" id="tabBtnInv" onclick="showTab('tabInv')">Inventaire</button>
    </div>
    <div id="tabBasics">
        <span id="lblGold">Or :</span> <span id="textGold">50.00</span><br>
        <span id="lblSuccess">Succès :</span> <span id="textSpeechTotal">0</span><br>
        <span id="lblHP">PV :</span> <span id="textHP">0</span> / <span id="textMaxHP">0</span>
    </div>
    <div id="tabStats" style="display:none;">
        <span id="lblStr">Force :</span> <span id="textStr">10</span><br>
        <span id="lblAgi">Agilité :</span> <span id="textAgi">10</span><br>
        <span id="lblCha">Charisme :</span> <span id="textCha">10</span><br>
        <span id="lblWeight">Charge :</span> <span id="textCurrentWeight">0</span> / <span id="textMaxWeight">50</span> kg
    </div>
    <div id="tabInv" style="display:none;">
        <span id="lblInv">Sac à dos :</span>
        <ul id="listInventory">
            <li id="invEmptyHint">Vide</li>
        </ul>
    </div>
    <button type="button" id="btnReset" onclick="confirmReset()" style="margin-top: 20px; background: #333; font-size: 0.7em;">
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
<div id="liveSpeechBox" style="margin-top: 10px; max-width: 640px;">
    <label for="speechLiveTranscript" style="display:block; font-size:0.85em; color:#555; margin-bottom:4px;">Reconnaissance (texte en direct) :</label>
    <textarea id="speechLiveTranscript" readonly rows="2" style="width:100%; font-family:Consolas,monospace; font-size:0.95em; box-sizing:border-box; padding:8px; background:#f5f5f5; border:1px solid #ccc; border-radius:4px; resize:vertical;" placeholder=""></textarea>
</div>

<!-- Manual Input Area (Hidden by default) -->
<div id="manualInputArea" style="display: none; margin-top: 20px;">
    <p id="manualInputHint" style="color: orange;"><i>Le micro a du mal ? Saisissez votre commande :</i></p>
    <input type="text" id="keyboardInput" placeholder="ex. : aller au nord" />
    <button type="button" id="btnManualSend" onclick="handleManualSubmit()">Envoyer</button>
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
    <button type="button" id="btnDialogueClose" onclick="document.getElementById('dialogueOverlay').style.display='none'" style="margin-top:15px; font-size: 0.8em; background: #5d4037;">Quitter la conversation</button>
</div>


<div id="log" style="margin-top: 20px; color: blue; font-style: italic;">
    <!-- Speech results will appear here -->
</div>
</div>

<script src="i18n.js"></script>
<script src="ui.js"></script>
<script src="speech.js"></script>
<script src="engine.js"></script>


</body>
</html>

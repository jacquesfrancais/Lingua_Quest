<?php
require_once 'db_config.php';

$nodeId = isset($_GET['id']) ? (int)$_GET['id'] : 101;

try {
    // 1. Fetch Room Details
    $stmt = $pdo->prepare("SELECT * FROM Locations WHERE nodeId = ?");
    $stmt->execute([$nodeId]);
    $room = $stmt->fetch();

// --- 2. Fetch NPCs in this room (Modified) ---
// Fetch npcId along with names
$stmtNpc = $pdo->prepare("SELECT npcId, npcNameFrench, npcNameEnglish, greetingFrench, greetingEnglish FROM Npcs WHERE currentLocationId = ?");

$stmtNpc->execute([$nodeId]);
$npcs = $stmtNpc->fetchAll(PDO::FETCH_ASSOC); // Fetch as objects with both names

// --- 3. Fetch Items in this room (Modified) ---
$stmtItems = $pdo->prepare("SELECT IL.nameFrench, IL.nameEnglish 
                            FROM ItemInstances II 
                            JOIN ItemLibrary IL ON II.itemId = IL.itemId 
                            WHERE II.ownerType = 'Room' AND II.ownerId = ?");
$stmtItems->execute([$nodeId]);
$items = $stmtItems->fetchAll(PDO::FETCH_ASSOC); // Fetch as objects with both names


    echo json_encode([
        'room' => $room,
        'npcs' => $npcs,
        'items' => $items
    ]);

} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}

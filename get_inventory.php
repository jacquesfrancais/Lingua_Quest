<?php
require_once 'db_config.php';

$playerId = (int)$_GET['playerId'];

try {
// Update your SELECT line to include nameEnglish
$sql = "SELECT IL.nameFrench, IL.nameEnglish, IL.itemType 
        FROM ItemInstances II 
        JOIN ItemLibrary IL ON II.itemId = IL.itemId 
        WHERE II.ownerType = 'Player' AND II.ownerId = ?";

            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$playerId]);
    $items = $stmt->fetchAll();

    echo json_encode(['items' => $items]);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}

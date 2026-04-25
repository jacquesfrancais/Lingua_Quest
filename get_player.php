<?php
require_once 'db_config.php';

$playerId = isset($_GET['id']) ? (int)$_GET['id'] : 1;

try {
    // 1. Fetch character basics
    $stmt = $pdo->prepare("SELECT * FROM Characters WHERE id = ?");
    $stmt->execute([$playerId]);
    $player = $stmt->fetch();

    // 2. Fetch current total inventory weight
    $weightStmt = $pdo->prepare("SELECT SUM(IL.weight) as total_weight 
                                 FROM ItemInstances II 
                                 JOIN ItemLibrary IL ON II.itemId = IL.itemId 
                                 WHERE II.ownerType = 'Player' AND II.ownerId = ?");
    $weightStmt->execute([$playerId]);
    $weightData = $weightStmt->fetch();
    
    $currentWeight = (float)($weightData['total_weight'] ?? 0);
    $maxWeight = (int)$player['strength'] * 5;

    // 3. Send everything back
    echo json_encode([
        'player' => $player,
        'currentWeight' => $currentWeight,
        'maxWeight' => $maxWeight
    ]);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}

<?php
require_once 'db_config.php';

// Get the data from the JavaScript call
$data = json_decode(file_get_contents('php://input'), true);
$targetNodeId = (int)$data['targetId'];
$playerId = 1; // Start with Bob

try {
    // 1. Update the player's location in the database
    $stmt = $pdo->prepare("UPDATE Characters SET currentLocationID = ? WHERE id = ?");
    $stmt->execute([$targetNodeId, $playerId]);

    echo json_encode(['status' => 'success']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

<?php
require_once 'db_config.php';

$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action']; 
$itemName = strtolower(trim($data['itemName']));
$playerId = 1; 
$currentRoomId = (int)$data['roomId'];

try {
    if ($action === 'TAKE') {
        // 1. Find the item in the room
        $stmt = $pdo->prepare("SELECT II.instanceId, IL.weight FROM ItemInstances II 
                                JOIN ItemLibrary IL ON II.itemId = IL.itemId 
                                WHERE (LOWER(IL.nameFrench) = ? OR LOWER(IL.nameEnglish) = ?) 
                                AND II.ownerType = 'Room' AND II.ownerId = ? LIMIT 1");
        $stmt->execute([$itemName, $itemName, $currentRoomId]);
        $item = $stmt->fetch();

        if ($item) {
            // 2. Get Player Strength (Separate from Sum)
            $charStmt = $pdo->prepare("SELECT strength FROM Characters WHERE id = ?");
            $charStmt->execute([$playerId]);
            $char = $charStmt->fetch();
            $maxWeight = (int)($char['strength'] ?? 0) * 5; 

            // 3. Get Current Total Weight
            $weightStmt = $pdo->prepare("SELECT SUM(IL.weight) as total_weight 
                                         FROM ItemInstances II 
                                         JOIN ItemLibrary IL ON II.itemId = IL.itemId 
                                         WHERE II.ownerType = 'Player' AND II.ownerId = ?");
            $weightStmt->execute([$playerId]);
            $weightData = $weightStmt->fetch();
            $currentWeight = (float)($weightData['total_weight'] ?? 0);

            // 4. Encumbrance Check
            if (($currentWeight + (float)$item['weight']) > $maxWeight) {
                echo json_encode(['status' => 'error', 'message' => "C'est trop lourd ! (Max: $maxWeight kg)"]);
                exit;
            }

            // 5. Success: Update the owner
            $update = $pdo->prepare("UPDATE ItemInstances SET ownerType = 'Player', ownerId = ? WHERE instanceId = ?");
            $update->execute([$playerId, $item['instanceId']]);
            echo json_encode(['status' => 'success', 'message' => "Vous avez pris l'objet."]);
        } else {
            echo json_encode(['status' => 'error', 'message' => "L'objet n'est pas ici."]);
        }
    }
     
    elseif ($action === 'DROP') {
        // ... (Your DROP logic here is perfect) ...
        $stmt = $pdo->prepare("SELECT II.instanceId FROM ItemInstances II 
                                JOIN ItemLibrary IL ON II.itemId = IL.itemId 
                                WHERE (LOWER(IL.nameFrench) = ? OR LOWER(IL.nameEnglish) = ?) 
                                AND II.ownerType = 'Player' AND II.ownerId = ? LIMIT 1");
        $stmt->execute([$itemName, $itemName, $playerId]);
        $item = $stmt->fetch();

        if ($item) {
            $update = $pdo->prepare("UPDATE ItemInstances SET ownerType = 'Room', ownerId = ? WHERE instanceId = ?");
            $update->execute([$currentRoomId, $item['instanceId']]);
            echo json_encode(['status' => 'success', 'message' => "Vous avez posé l'objet."]);
        } else {
            echo json_encode(['status' => 'error', 'message' => "Vous n'avez pas cet objet."]);
        }
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

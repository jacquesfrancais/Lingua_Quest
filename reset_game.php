<?php
require_once 'db_config.php';

try {
    $pdo->beginTransaction();

    // 1. Reset Player Stats (Bob)
    $stmt = $pdo->prepare("UPDATE Characters SET 
        hitPoints = maxHitPoints, 
        currentLocationID = 101, 
        gold = 50.00, 
        speechSuccessCount = 0 
        WHERE id = 1");
    $stmt->execute();

    // 2. Clear all current item instances
    $pdo->exec("DELETE FROM ItemInstances");

    // 3. Restore items from Templates
    $pdo->exec("INSERT INTO ItemInstances (itemId, ownerType, ownerId) 
                SELECT itemId, ownerType, ownerId FROM WorldTemplates");

    $pdo->commit();
    echo json_encode(['status' => 'success', 'message' => 'Monde réinitialisé !']);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

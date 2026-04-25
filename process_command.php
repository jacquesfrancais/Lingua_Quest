<?php
require_once 'db_config.php';

// 1. Get data from the JavaScript call
$data = json_decode(file_get_contents('php://input'), true);
$heardText = strtolower(trim($data['command'] ?? ''));
$goldToAdd = isset($data['goldToAdd']) ? (float)$data['goldToAdd'] : 0.10;
$playerId = 1; 

try {
    // 2. Fetch current player stats
    $stmt = $pdo->prepare("SELECT * FROM Characters WHERE id = ?");
    $stmt->execute([$playerId]);
    $player = $stmt->fetch();

    // 3. Calculate new values
    $newGold = $player['gold'] + $goldToAdd;
    $newSuccessCount = $player['speechSuccessCount'] + 1;
    $statBoostMessage = "";

    // 4. Milestone Check (Every 10 successes)
    if ($newSuccessCount > 0 && $newSuccessCount % 10 === 0) {
        $newCharisma = $player['charisma'] + 1;
        $updateStats = $pdo->prepare("UPDATE Characters SET charisma = ? WHERE id = ?");
        $updateStats->execute([$newCharisma, $playerId]);
        $statBoostMessage = "NIVEAU SUPÉRIEUR ! +1 Charisme pour votre éloquence !";
    }

    // 5. Update Database (Gold and Success Count)
    $update = $pdo->prepare("UPDATE Characters SET gold = ?, speechSuccessCount = ? WHERE id = ?");
    $update->execute([$newGold, $newSuccessCount, $playerId]);

    // 6. Return ONE clean JSON package
    echo json_encode([
        'status' => 'success',
        'newGold' => number_format($newGold, 2),
        'newCount' => (int)$newSuccessCount,
        'message' => "Félicitations ! +$goldToAdd Or",
        'milestone' => $statBoostMessage
    ]);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>

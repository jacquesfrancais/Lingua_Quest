<?php
require_once 'db_config.php';

$npcId = (int)$_GET['npcId'];

try {
    // 1. Get the filename from the database
    $stmt = $pdo->prepare("SELECT dialogueTreeId FROM Npcs WHERE npcId = ?");
    $stmt->execute([$npcId]);
    $npc = $stmt->fetch();

    if ($npc && $npc['dialogueTreeId']) {
        $path = __DIR__ . "/dialogues/" . $npc['dialogueTreeId'];
        if (file_exists($path)) {
            echo file_get_contents($path);
        } else {
            echo json_encode(["error" => "File not found", "path" => $path]);
        }
    } else {
        echo json_encode([
            "error" => $npc ? "No dialogue file assigned to this NPC" : "NPC not found",
        ]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

// Engine Functions for Game Logic
// This is the central hub that talks to your PHP/Database and starts the game.
// engine.js:

let currentRoomData;
let currentRoom;
let currentInventory = [];

// --- 4. BACKEND WORKERS (AJAX) ---
function loadRoomData(nodeId) {
    fetch(`get_room.php?id=${nodeId}`)
        .then(res => res.json())
        .then(data => {
            if (data.room) {
                currentRoomData = data;
                currentRoom = data.room;
                document.getElementById("roomTitle").innerText = getLocalizedRoomTitle(data.room);
                updateRoomDisplay(data);
                updateCompass(data.room);
                speakRoomTitle(data.room);

                // --- NEW GREETING LOGIC STARTS HERE ---
    // data.npcs is now a list [ {}, {}, {} ]
// ... inside loadRoomData after updateRoomDisplay(data) ...

console.log("NPCs found in room:", data.npcs); // Safety Log 1

if (data.npcs && data.npcs.length > 0) {
    const primaryNpc = data.npcs[0]; // Target the first person in the list
    
    console.log("Primary NPC Data:", primaryNpc); // Safety Log 2

    // We use !! to force a true/false check on the greeting
    if (!!primaryNpc.greetingFrench) {
        setTimeout(() => {
            const isEn = isEnglishMode;
            const greeting = isEn ? primaryNpc.greetingEnglish : primaryNpc.greetingFrench;
            const npcName = isEn ? primaryNpc.npcNameEnglish : primaryNpc.npcNameFrench;

            const log = document.getElementById('log');
            log.innerHTML += `<br><span style="color: #4e342e;"><b>${npcName}:</b> "${greeting}"</span>`;
            log.scrollTop = log.scrollHeight;

            speakGreeting(
                isEnglishMode ? primaryNpc.greetingEnglish || primaryNpc.greetingFrench : primaryNpc.greetingFrench
            );

// --- ADD THIS TO TRIGGER THE FLASH ---
// We find the button we just added to the description
const talkButtons = document.getElementsByClassName('btnTalk');
if (talkButtons.length > 0) {
    // We add the class to the first talk button found
    talkButtons[0].classList.add('flash-button');
    
    // Optional: Remove the class after 3 seconds so it stops flashing
    setTimeout(() => {
        talkButtons[0].classList.remove('flash-button');
    }, 3000);
}
        }, 1500); 
    } else {
        console.warn("NPC found, but greetingFrench is empty or null.");
    }
}

                // --- NEW GREETING LOGIC ENDS HERE ---
            }
        });
}


function changeRoom(targetId) {
    fetch('move_player.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId: targetId })
    }).then(() => loadRoomData(targetId));
}

// Replace your awardSpeechGold function in <script>
function awardSpeechGold(cmd, amount) {
    fetch('process_command.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd, goldToAdd: amount })
    })
    .then(res => res.json())
    .then(data => {
        if(data.status === 'success') {
            // 1. Update the visible Dashboard numbers
            document.getElementById('textGold').innerText = data.newGold;
            document.getElementById('textSpeechTotal').innerText = data.newCount;
        
            // 2. Check for Milestone (using a "truthy" check)
            if (data.milestone && data.milestone !== "") {
                const log = document.getElementById('log');
                
                // Print the Golden Box
                log.innerHTML += `<br><div style="background: gold; color: black; font-weight: bold; padding: 8px; border-radius: 5px; text-align: center; border: 1px solid #000;">🌟 ${data.milestone} 🌟</div>`;
                log.scrollTop = log.scrollHeight; // Force scroll to see the praise
                
                // 3. Auto-read the achievement
                speakText(data.milestone, isEnglishMode ? "en-GB" : "fr-FR");

                // 4. Refresh the Stats tab after a tiny pause to ensure DB is ready
                setTimeout(() => {
                    loadPlayerStats(1); 
                }, 200); 
            }   
        }
    })
    .catch(err => console.error("Award Error:", err));
}

function loadPlayerStats(playerId) {
    const cacheBuster = new Date().getTime();
    fetch(`get_player.php?id=${playerId}&t=${cacheBuster}`)
        .then(res => res.json())
        .then(data => {
            if (data.player) {
                const nameEl = document.getElementById("textPlayerName");
                nameEl.innerText = data.player.characterName;
                nameEl.dataset.pristine = "0";
                document.getElementById('textGold').innerText = data.player.gold;
                document.getElementById('textSpeechTotal').innerText = data.player.speechSuccessCount;

                // Hitpoints - Now using the dynamic Max HP
                document.getElementById('textHP').innerText = data.player.hitPoints;
                document.getElementById('textMaxHP').innerText = data.player.maxHitPoints;

                // Stats
                document.getElementById('textStr').innerText = data.player.strength;
                document.getElementById('textAgi').innerText = data.player.agility;
                document.getElementById('textCha').innerText = data.player.charisma;

                // Weight/Charge
                document.getElementById('textCurrentWeight').innerText = data.currentWeight;
                document.getElementById('textMaxWeight').innerText = data.maxWeight;
            }
        });
}


function loadInventory() {
    fetch('get_inventory.php?playerId=1')
        .then(res => res.json())
        .then(data => {
            currentInventory = data.items; // Store this for the speech parser
            
            const list = document.getElementById('listInventory');
            const emptyMsg = t("emptyBag");
            list.innerHTML = data.items.length ? "" : `<li>${emptyMsg}</li>`;
            
            data.items.forEach(item => {
                let li = document.createElement('li');
                const itemName = isEnglishMode ? item.nameEnglish : item.nameFrench;
                li.innerText = `${itemName} (${item.itemType})`;
                list.appendChild(li);
            });
        });
}

// --- DIALOGUE SYSTEM ---
let currentDialogueTree = null;

function startDialogue(npcId, npcName) {
    fetch(`get_dialogue.php?npcId=${encodeURIComponent(npcId)}`)
        .then((res) => res.text())
        .then((text) => {
            if (!text || !text.trim()) {
                throw new Error("Réponse vide de get_dialogue.php");
            }
            return JSON.parse(text);
        })
        .then((data) => {
            if (data.error) {
                const log = document.getElementById("log");
                if (log) log.innerHTML += `<br><span style="color:red;">Dialogue: ${data.error}</span>`;
                return;
            }
            if (!data.nodes || !data.startNode) {
                const log = document.getElementById("log");
                if (log) log.innerHTML += `<br><span style="color:red;">Dialogue: JSON invalide (pas de nodes/startNode)</span>`;
                return;
            }
            currentDialogueTree = data;
            document.getElementById("npcTalkingName").innerText = npcName;
            document.getElementById("dialogueOverlay").style.display = "block";
            loadDialogueNode(data.startNode);
        })
        .catch((err) => {
            console.error("startDialogue", err);
            const log = document.getElementById("log");
            if (log) log.innerHTML += `<br><span style="color:red;">Impossible de charger le dialogue: ${err.message}</span>`;
        });
}

function loadDialogueNode(nodeId, opts) {
    if (nodeId === "END") {
        document.getElementById("dialogueOverlay").style.display = "none";
        currentDialogueTree = null;
        return;
    }
    currentNodeId = nodeId;
    const silent = opts && opts.silent;

    const node = currentDialogueTree.nodes[nodeId];
    const isEn = isEnglishMode;

    // 1. Set the NPC text (respecting translation toggle)
    const speech = isEn ? node.en : node.fr;
    document.getElementById("npcSpeechText").innerText = speech;
    if (!silent) {
        const toSpeak = isEn ? node.en : node.fr;
        speakText(toSpeak, isEn ? "en-GB" : "fr-FR");
    }

    // 2. Generate the practice options
    const optionsDiv = document.getElementById("playerResponseOptions");
    optionsDiv.innerHTML = "";

    node.options.forEach((opt) => {
        const row = document.createElement("div");
        row.style.margin = "10px 0";

        const btnListen = document.createElement("button");
        btnListen.textContent = "🔊 " + t("btnListen");
        const lineFr = opt.fr || opt.textToSay || "";
        const lineEn = opt.en || lineFr;
        btnListen.onclick = () => speakText(isEnglishMode ? lineEn : lineFr, isEnglishMode ? "en-GB" : "fr-FR");
        
        const label = document.createElement('span');
        label.style.marginLeft = "10px";
        label.innerText = isEn ? (opt.en || opt.fr || lineFr) : (lineFr || opt.en);

        row.appendChild(btnListen);
        row.appendChild(label);
        optionsDiv.appendChild(row);
    });
}

// --- MOVEMENT & ITEM INTERACTIONS --- // Action commands (TAKE/DROP/etc.)
function handleItemAction(action, itemName, goldReward) {
    fetch('process_item.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: action,
            itemName: itemName,
            roomId: currentRoom.nodeId
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            loadRoomData(currentRoom.nodeId);
            loadInventory();
            awardSpeechGold(itemName, goldReward);
            loadPlayerStats(1); 
        } else {
            document.getElementById('log').innerHTML += `<br><span style="color: red;">${data.message}</span>`;
        }
    });
}



function speakRoomTitle(room) {
    const text = getLocalizedRoomTitle(room);
    speakText(text, isEnglishMode ? "en-GB" : "fr-FR");
}

function speakGreeting(text) {
    if (!text) return;
    speakText(text, isEnglishMode ? "en-GB" : "fr-FR");
}

// --- 5. INITIALIZATION ---
window.onload = () => {
    applyUILanguage();
    loadRoomData(101);
    loadPlayerStats(1);
};
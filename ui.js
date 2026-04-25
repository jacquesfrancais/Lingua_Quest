function showTab(tabId) {
    const tabs = ['tabBasics', 'tabStats', 'tabInv'];
    tabs.forEach(id => document.getElementById(id).style.display = 'none');
    document.getElementById(tabId).style.display = 'block';
    if (tabId === 'tabInv') loadInventory();
}

function toggleTranslation() {
    isEnglishMode = !isEnglishMode;
    const btn = document.getElementById('btnTranslate');
    btn.innerText = isEnglishMode ? "Traduction: ON (EN)" : "Traduction: OFF (FR)";
    btn.style.background = isEnglishMode ? "#1565c0" : "#2e7d32";
    if (currentRoomData) updateRoomDisplay(currentRoomData);
}

function updateRoomDisplay(data) {
    const room = data.room;
    const isEn = isEnglishMode;
    
    // 1. Room Description
    const description = isEn ? room.textEnglish : room.textFrench;
    let descHtml = `<p>${description.replace(/\n/g, '<br>')}</p>`;
    
    // 2. NPCs (Turn names into clickable buttons)
    if (data.npcs && data.npcs.length > 0) {
        descHtml += `<p style="color: #4e342e;"><b>👥 Personnages ici:</b> `;
        
        data.npcs.forEach(npc => {
            const displayName = isEn ? npc.npcNameEnglish : npc.npcNameFrench;
            // We create a button that calls startDialogue with the NPC's ID
            descHtml += `<button class="btnTalk" onclick="startDialogue(${npc.npcId}, '${displayName}')">💬 Parler à ${displayName}</button> `;
        });
        
        descHtml += `</p>`;
    }

    // 3. Items
    if (data.items && data.items.length > 0) {
        const itemNames = data.items.map(item => isEn ? item.nameEnglish : item.nameFrench);
        descHtml += `<p style="color: #2e7d32;"><b>📦 Objets au sol:</b> ${itemNames.join(', ')}</p>`;
    }

    document.getElementById('description').innerHTML = descHtml;
}

function updateCompass(room) {
    const directions = [
        { id: 'btnNorth', val: room.northTarget }, { id: 'btnSouth', val: room.southTarget },
        { id: 'btnEast',  val: room.eastTarget },  { id: 'btnWest',  val: room.westTarget },
        { id: 'btnUp',    val: room.upTarget },    { id: 'btnDown',  val: room.downTarget },
        { id: 'btnIn',    val: room.inTarget },    { id: 'btnOut',   val: room.outTarget }
    ];
    directions.forEach(dir => {
        const btn = document.getElementById(dir.id);
        if (btn) {
            btn.disabled = !(dir.val && dir.val != 0);
            btn.style.opacity = btn.disabled ? "0.2" : "1";
            btn.onclick = btn.disabled ? null : () => changeRoom(dir.val);
        }
    });
}

function handleManualSubmit() {
    const typed = document.getElementById('keyboardInput').value.toLowerCase().trim();
    let target = 0;
    if (typed.includes("nord")) target = currentRoom.northTarget;
    else if (typed.includes("sud")) target = currentRoom.southTarget;
    else if (typed.includes("est")) target = currentRoom.eastTarget;
    else if (typed.includes("ouest")) target = currentRoom.westTarget;

    if (target && target !== 0) {
        document.getElementById('keyboardInput').value = "";
        failCount = 0;
        document.getElementById('manualInputArea').style.display = 'none';
        changeRoom(target);
    } else {
        alert("Inconnu.");
    }
}
// --- Game Reset Function ---
function confirmReset() {
    if (confirm("Voulez-vous vraiment réinitialiser tout le jeu ?")) {
        fetch('reset_game.php')
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                // Hard reload the page to show starting state
                location.reload();
            });
    }
}


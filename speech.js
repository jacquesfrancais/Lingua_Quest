// Speech
let failCount = 0;
let currentNodeId = "";

function speakText(phrase) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
}

function speakFrench() {
    const text = document.getElementById('description').innerText;
    speakText(text);
}

// --- SPEECH RECOGNITION ---
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'fr-FR';

function startListening() {
    document.getElementById('btnMic').innerText = "Écoute...";
    recognition.start();
}

recognition.onresult = (event) => {
    const rawText = event.results[0][0].transcript;
    const heardText = rawText.toLowerCase().trim();
    document.getElementById('btnMic').innerText = "🎤 Parler";
    
    const log = document.getElementById('log');
    log.innerHTML += `<br><span style="color: blue;">> "${rawText}"</span>`;

    const dialogueBox = document.getElementById('dialogueOverlay');

    // 1. Are we talking?
    if (dialogueBox.style.display === 'block') {
        processDialogueSpeech(heardText);
    } 
    // 2. Are we trying to pick up or drop something?
    else if (heardText.includes("ramasser") || heardText.includes("prendre") || 
             heardText.includes("lâcher") || heardText.includes("poser")) {
        processActionSpeech(heardText);
    }
    // 3. If none of the above, are we moving?
    else {
        processMovementSpeech(heardText);
    }
};


// Function A: Handles Dialogue Rewards (Perfect/Loose)
function processDialogueSpeech(heardText) {
    let bestMatch = null;
    let maxScore = 0;

    // 'currentNodeId' must be set when you load a dialogue node
    const options = currentDialogueTree.nodes[currentNodeId].options;

    options.forEach(opt => {
        let score = getSimilarity(heardText, opt.fr.toLowerCase().trim());
        if (score > maxScore) {
            maxScore = score;
            bestMatch = opt;
        }
    });

    if (maxScore >= 0.95) {
        log.innerHTML += `<br><span style="color: gold;">Parfait ! +0.20 Or</span>`;
        awardSpeechGold(heardText, 0.20);
        loadDialogueNode(bestMatch.next);
    } else if (maxScore >= 0.75) {
        log.innerHTML += `<br><span style="color: green;">Bien ! +0.10 Or</span>`;
        awardSpeechGold(heardText, 0.10);
        loadDialogueNode(bestMatch.next);
    } else {
        log.innerHTML += `<br><span style="color: red;">Pas compris. Réessayez !</span>`;
    }
}

// Function B: Handles Movement Rewards (Standard 0.1)
function processMovementSpeech(heardText) {
    const directions = {
        "aller au nord": "north",
        "aller au sud": "south",
        "aller à l'est": "east",
        "aller à l'ouest": "west",
        "monter": "up",
        "descendre": "down",
        "entrer dans": "in",
        "sortir": "out"
    };

    let bestDir = null;
    let highestScore = 0;
    let matchedPhrase = "";

    // 1. Find the closest matching direction
    for (let key in directions) {
        let score = getSimilarity(heardText, key);
        if (score > highestScore) {
            highestScore = score;
            bestDir = directions[key];
            matchedPhrase = key;
        }
    }

    // 2. Determine Reward and Action
    const log = document.getElementById('log');

    if (highestScore >= 0.95) {
        let targetId = currentRoom[bestDir + 'Target'];
        if (targetId && targetId !== 0) {
            log.innerHTML += `<br><span style="color: gold;">Parfait ! (100%) +0.20 Or</span>`;
            changeRoom(targetId);
            awardSpeechGold(heardText, 0.20); // Perfect Award
        }
    } 
    else if (highestScore >= 0.75) {
        let targetId = currentRoom[bestDir + 'Target'];
        if (targetId && targetId !== 0) {
            log.innerHTML += `<br><span style="color: green;">Bien ! (${Math.round(highestScore*100)}%) +0.10 Or</span>`;
            changeRoom(targetId);
            awardSpeechGold(heardText, 0.10); // Loose Award
        }
    } 
    else {
        log.innerHTML += `<br><span style="color: red;">Désolé, je n'ai pas compris la direction.</span>`;
    }
}


// Action commands (TAKE/DROP/etc.)
function processActionSpeech(heardText) {
    const log = document.getElementById('log');
    const takeVerbs = ["ramasser", "prendre"];
    const dropVerbs = ["lâcher", "poser"];
    
    let bestAction = null;
    let targetPhrase = "";
    let highestScore = 0;
    let detectedItem = "";

    // Identify if the player is trying to TAKE or DROP
    const isTake = takeVerbs.some(v => heardText.includes(v));
    const isDrop = dropVerbs.some(v => heardText.includes(v));

    if (!isTake && !isDrop) {
        log.innerHTML += `<br><span style="color: red;">Je n'ai pas compris l'action.</span>`;
        return;
    }

    // Determine the list of items to compare against
    // (Note: currentRoomData.items was updated in our get_room.php to be an array of objects)
    const itemsToCheck = isTake ? currentRoomData.items : currentInventory; 
    const verbsToTry = isTake ? takeVerbs : dropVerbs;

    // Loop through all possible combinations to find the best "Full Phrase" match
    verbsToTry.forEach(verb => {
        itemsToCheck.forEach(item => {
            const itemName = isEnglishMode ? item.nameEnglish : item.nameFrench;
            
            // Build the target phrases the game expects
            const possiblePhrases = [
                `${verb} ${itemName}`,
                `${verb} le ${itemName}`,
                `${verb} la ${itemName}`,
                `${verb} les ${itemName}`
            ];

            possiblePhrases.forEach(target => {
                let score = getSimilarity(heardText, target.toLowerCase());
                if (score > highestScore) {
                    highestScore = score;
                    bestAction = isTake ? 'TAKE' : 'DROP';
                    detectedItem = itemName;
                }
            });
        });
    });

    // Final Decision based on the Entire Phrase Score
    if (highestScore >= 0.95) {
        log.innerHTML += `<br><span style="color: gold;">Parfait ! (100%) +0.20 Or</span>`;
        handleItemAction(bestAction, detectedItem, 0.20);
    } else if (highestScore >= 0.75) {
        log.innerHTML += `<br><span style="color: green;">Bien ! (${Math.round(highestScore*100)}%) +0.10 Or</span>`;
        handleItemAction(bestAction, detectedItem, 0.10);
    } else {
        log.innerHTML += `<br><span style="color: red;">Pas compris (${Math.round(highestScore*100)}%). Réessayez la phrase complète.</span>`;
    }
}



// This function is used to compare player input with expected commands for more flexible matching
function getSimilarity(s1, s2) {
    let longer = s1.length > s2.length ? s1 : s2;
    let shorter = s1.length > s2.length ? s2 : s1;
    if (longer.length === 0) return 1.0;
    
    const editDistance = (s1, s2) => {
        let costs = [];
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i === 0) costs[j] = j;
                else if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) !== s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
            if (i > 0) costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    };
    
    return (longer.length - editDistance(longer, shorter)) / parseFloat(longer.length);
}


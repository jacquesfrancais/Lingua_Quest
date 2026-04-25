// Speech
let failCount = 0;
let currentNodeId = "";

function speakText(phrase, lang) {
    if (!phrase) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = lang || (isEnglishMode ? "en-GB" : "fr-FR");
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
}

function speakFrench() {
    const text = document.getElementById("description").innerText;
    speakText(text, isEnglishMode ? "en-GB" : "fr-FR");
}

// --- SPEECH RECOGNITION ---
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRec ? new SpeechRec() : null;
if (recognition) {
    recognition.lang = "fr-FR";
    recognition.continuous = false;
    // Interim + single hypothesis = more frequent onresult and earlier partial text
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
}

function resetMicButton() {
    const btn = document.getElementById("btnMic");
    if (btn) btn.textContent = "🎤 " + t("btnMic");
}

let liveTranscriptEl = null;
function getLiveTranscriptEl() {
    if (!liveTranscriptEl) {
        liveTranscriptEl = document.getElementById("speechLiveTranscript");
    }
    return liveTranscriptEl;
}

function setLiveTranscriptText(text) {
    const el = getLiveTranscriptEl();
    if (!el) return;
    if (el.value === text) return;
    el.value = text;
    el.scrollTop = el.scrollHeight;
}

function startListening() {
    if (!recognition) {
        alert(t("speechNotSupported"));
        return;
    }
    try {
        document.getElementById("btnMic").textContent = t("btnMicListen");
        setLiveTranscriptText("");
        recognition.start();
    } catch (e) {
        console.error("recognition.start:", e);
        resetMicButton();
    }
}

if (recognition) {
    recognition.onend = () => resetMicButton();
    recognition.onerror = (ev) => {
        console.error("recognition error:", ev.error);
        resetMicButton();
    };
    // Placeholder as soon as actual audio or speech is detected (often a bit before first words)
    if ("onaudiostart" in recognition) {
        recognition.onaudiostart = () => {
            if (getLiveTranscriptEl() && getLiveTranscriptEl().value === "") {
                setLiveTranscriptText("…");
            }
        };
    }
    if ("onspeechstart" in recognition) {
        recognition.onspeechstart = () => {
            if (getLiveTranscriptEl() && getLiveTranscriptEl().value === "") {
                setLiveTranscriptText("…");
            }
        };
    }
}

if (recognition) {
    recognition.onresult = (event) => {
        let line = "";
        for (let i = 0; i < event.results.length; i++) {
            const alt = event.results[i][0];
            line += alt.transcript;
        }
        setLiveTranscriptText(line);

        const last = event.results[event.results.length - 1];
        if (!last || !last.isFinal) {
            return;
        }

        const rawText = line.trim();
        const heardText = rawText.toLowerCase().trim();
        resetMicButton();

        const log = document.getElementById("log");
        if (log) log.innerHTML += `<br><span style="color: blue;">> "${rawText}"</span>`;

        const dialogueBox = document.getElementById("dialogueOverlay");

        const inDialogue =
            dialogueBox &&
            (dialogueBox.style.display === "block" || window.getComputedStyle(dialogueBox).display === "block");
        if (inDialogue) {
            processDialogueSpeech(heardText);
        } else if (
            heardText.includes("ramasser") ||
            heardText.includes("prendre") ||
            heardText.includes("lâcher") ||
            heardText.includes("poser")
        ) {
            processActionSpeech(heardText);
        } else {
            processMovementSpeech(heardText);
        }
    };
}

// Function A: Handles Dialogue Rewards (Perfect/Loose)
function processDialogueSpeech(heardText) {
    const log = document.getElementById("log");
    if (!currentDialogueTree || !currentNodeId || !currentDialogueTree.nodes) {
        if (log) log.innerHTML += `<br><span style="color:red;">${t("noDialogue")}</span>`;
        return;
    }
    const node = currentDialogueTree.nodes[currentNodeId];
    if (!node || !Array.isArray(node.options)) {
        if (log) log.innerHTML += `<br><span style="color:red;">${t("invalidNode")}</span>`;
        return;
    }
    let bestMatch = null;
    let maxScore = 0;

    const options = node.options;
    options.forEach((opt) => {
        const phrase = (opt.fr || opt.textToSay || "").toLowerCase().trim();
        if (!phrase) return;
        const score = getSimilarity(heardText, phrase);
        if (score > maxScore) {
            maxScore = score;
            bestMatch = opt;
        }
    });

    if (maxScore >= 0.95 && bestMatch && bestMatch.next !== undefined) {
        if (log) log.innerHTML += `<br><span style="color: gold;">${t("perfect")}</span>`;
        awardSpeechGold(heardText, 0.20);
        loadDialogueNode(bestMatch.next);
    } else if (maxScore >= 0.75 && bestMatch && bestMatch.next !== undefined) {
        if (log) log.innerHTML += `<br><span style="color: green;">${t("good")}</span>`;
        awardSpeechGold(heardText, 0.10);
        loadDialogueNode(bestMatch.next);
    } else {
        if (log) log.innerHTML += `<br><span style="color: red;">${t("notUnderstood")}</span>`;
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
        let targetId = currentRoom[bestDir + "Target"];
        if (targetId && targetId !== 0) {
            if (log) log.innerHTML += `<br><span style="color: gold;">${t("movePerfect")}</span>`;
            changeRoom(targetId);
            awardSpeechGold(heardText, 0.2);
        }
    } else if (highestScore >= 0.75) {
        let targetId = currentRoom[bestDir + "Target"];
        if (targetId && targetId !== 0) {
            const good =
                typeof t("moveGood") === "function"
                    ? t("moveGood")(Math.round(highestScore * 100))
                    : t("moveGood");
            if (log) log.innerHTML += `<br><span style="color: green;">${good}</span>`;
            changeRoom(targetId);
            awardSpeechGold(heardText, 0.1);
        }
    } else {
        if (log) log.innerHTML += `<br><span style="color: red;">${t("noDirection")}</span>`;
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
        if (log) log.innerHTML += `<br><span style="color: red;">${t("noAction")}</span>`;
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
        if (log) log.innerHTML += `<br><span style="color: gold;">${t("actPerfect")}</span>`;
        handleItemAction(bestAction, detectedItem, 0.2);
    } else if (highestScore >= 0.75) {
        const g =
            typeof t("actGood") === "function"
                ? t("actGood")(Math.round(highestScore * 100))
                : t("actGood");
        if (log) log.innerHTML += `<br><span style="color: green;">${g}</span>`;
        handleItemAction(bestAction, detectedItem, 0.1);
    } else {
        const nu =
            typeof t("notUnderstoodItem") === "function"
                ? t("notUnderstoodItem")(Math.round(highestScore * 100))
                : t("notUnderstoodItem");
        if (log) log.innerHTML += `<br><span style="color: red;">${nu}</span>`;
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


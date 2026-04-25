/**
 * UI language: French (learning default) and English. Toggle with btnTranslate.
 */
let isEnglishMode = false;

const ROOM_TITLE_EN = {
    101: "Village",
    102: "Path",
    103: "Forge",
    104: "Garden",
    105: "Tavern",
    106: "Cave",
    107: "Cellar"
};

const UI = {
    fr: {
        translateOn: "Traduction : ON (EN)",
        translateOff: "Traduction : OFF (FR)",
        tabBasics: "Bases",
        tabStats: "Stats",
        tabInv: "Inventaire",
        lblGold: "Or :",
        lblSuccess: "Succès :",
        lblHP: "PV :",
        lblStr: "Force :",
        lblAgi: "Agilité :",
        lblCha: "Charisme :",
        lblWeight: "Charge :",
        lblInv: "Sac à dos :",
        btnReset: "Réinitialiser le jeu",
        resetConfirm: "Voulez-vous vraiment réinitialiser tout le jeu ?",
        compassN: "Nord",
        compassS: "Sud",
        compassE: "Est",
        compassW: "Ouest",
        compassUp: "Monter",
        compassDown: "Descendre",
        compassIn: "Entrer",
        compassOut: "Sortir",
        btnRead: "Lire à voix haute",
        btnMic: "Parler (micro)",
        btnMicListen: "Écoute…",
        liveLabel: "Reconnaissance (texte en direct) :",
        livePlaceholder:
            "En appuyant sur Parler, le texte reconnu apparaîtra ici (provisoire, puis final).",
        manualHint: "Le micro a du mal ? Saisissez votre commande :",
        manualPlaceholder: "ex. : aller au nord",
        manualSend: "Envoyer",
        dialogueClose: "Quitter la conversation",
        peopleHere: "Personnages ici :",
        itemsHere: "Objets au sol :",
        talkTo: "Parler à",
        emptyBag: "Votre sac est vide.",
        btnListen: "Écouter",
        speechNotSupported: "La reconnaissance vocale n'est pas prise en charge. Utilisez Chrome ou Edge.",
        htmlTitle: "Lingua Quest",
        loading: "Chargement…",
        noDialogue: "(Pas de dialogue actif. Utilisez « Parler à … » dans la description.)",
        invalidNode: "Nœud de dialogue invalide.",
        perfect: "Parfait ! +0,20 d'or",
        good: "Bien ! +0,10 d'or",
        notUnderstood: "Pas compris. Réessayez !",
        noDirection: "Désolé, je n'ai pas compris la direction.",
        noAction: "Je n'ai pas compris l'action.",
        notUnderstoodItem: (n) => `Pas compris (${n} %). Réessayez la phrase complète.`,
        unknownCmd: "Inconnu.",
        bagEmpty: "Vide",
        movePerfect: "Parfait ! (100 %) +0,20 d'or",
        moveGood: (n) => `Bien ! (${n} %) +0,10 d'or`,
        actPerfect: "Parfait ! (100 %) +0,20 d'or",
        actGood: (n) => `Bien ! (${n} %) +0,10 d'or`
    },
    en: {
        translateOn: "Translation: ON (EN)",
        translateOff: "Translation: OFF (FR)",
        tabBasics: "Basics",
        tabStats: "Stats",
        tabInv: "Inventory",
        lblGold: "Gold:",
        lblSuccess: "Successes:",
        lblHP: "HP:",
        lblStr: "Strength:",
        lblAgi: "Agility:",
        lblCha: "Charisma:",
        lblWeight: "Load:",
        lblInv: "Backpack:",
        btnReset: "Reset game",
        resetConfirm: "Do you really want to reset the whole game?",
        compassN: "North",
        compassS: "South",
        compassE: "East",
        compassW: "West",
        compassUp: "Up",
        compassDown: "Down",
        compassIn: "In",
        compassOut: "Out",
        btnRead: "Read aloud",
        btnMic: "Speak (mic)",
        btnMicListen: "Listening…",
        liveLabel: "Speech (live text):",
        livePlaceholder: "When you press Speak, recognized text appears here (provisional, then final).",
        manualHint: "Mic trouble? Type your command:",
        manualPlaceholder: "e.g. go north",
        manualSend: "Send",
        dialogueClose: "Leave conversation",
        peopleHere: "People here:",
        itemsHere: "Items on the ground:",
        talkTo: "Talk to",
        emptyBag: "Your bag is empty.",
        btnListen: "Listen",
        speechNotSupported: "Speech recognition is not supported. Use Chrome or Edge.",
        htmlTitle: "Lingua Quest",
        loading: "Loading…",
        noDialogue: "(No active dialogue. Use “Talk to …” in the description.)",
        invalidNode: "Invalid dialogue node.",
        perfect: "Perfect! +0.20 gold",
        good: "Good! +0.10 gold",
        notUnderstood: "Not understood. Try again!",
        noDirection: "Sorry, I didn't understand the direction.",
        noAction: "I didn't understand the action.",
        notUnderstoodItem: (n) => `Not understood (${n} %). Try the full phrase again.`,
        unknownCmd: "Unknown.",
        bagEmpty: "Empty",
        movePerfect: "Perfect! (100%) +0.20 gold",
        moveGood: (n) => `Good! (${n}%) +0.10 gold`,
        actPerfect: "Perfect! (100%) +0.20 gold",
        actGood: (n) => `Good! (${n}%) +0.10 gold`
    }
};

function t(key) {
    const v = (isEnglishMode ? UI.en : UI.fr)[key];
    return v !== undefined ? v : key;
}

function getLocalizedRoomTitle(room) {
    if (!room) return t("htmlTitle");
    if (isEnglishMode && room.nodeId != null && ROOM_TITLE_EN[room.nodeId]) {
        return ROOM_TITLE_EN[room.nodeId];
    }
    return room.title || t("htmlTitle");
}

function applyUILanguage() {
    const el = (id, text) => {
        const n = document.getElementById(id);
        if (n) n.textContent = text;
    };
    const tr = document.getElementById("btnTranslate");
    if (tr) {
        tr.textContent = isEnglishMode ? t("translateOn") : t("translateOff");
    }
    el("tabBtnBasics", t("tabBasics"));
    el("tabBtnStats", t("tabStats"));
    el("tabBtnInv", t("tabInv"));
    el("lblGold", t("lblGold"));
    el("lblSuccess", t("lblSuccess"));
    el("lblHP", t("lblHP"));
    el("lblStr", t("lblStr"));
    el("lblAgi", t("lblAgi"));
    el("lblCha", t("lblCha"));
    el("lblWeight", t("lblWeight"));
    el("lblInv", t("lblInv"));
    const br = document.getElementById("btnReset");
    if (br) br.textContent = t("btnReset");
    const dirs = [
        ["btnNorth", t("compassN")],
        ["btnSouth", t("compassS")],
        ["btnEast", t("compassE")],
        ["btnWest", t("compassW")],
        ["btnUp", t("compassUp")],
        ["btnDown", t("compassDown")],
        ["btnIn", t("compassIn")],
        ["btnOut", t("compassOut")]
    ];
    dirs.forEach(([id, text]) => el(id, text));
    const bRead = document.getElementById("btnRead");
    if (bRead) bRead.textContent = t("btnRead");
    if (resetMicButton) resetMicButton();
    const liveL = document.querySelector('label[for="speechLiveTranscript"]');
    if (liveL) liveL.textContent = t("liveLabel");
    const st = document.getElementById("speechLiveTranscript");
    if (st) st.placeholder = t("livePlaceholder");
    const mh = document.getElementById("manualInputHint");
    if (mh) {
        mh.style.color = "orange";
        mh.innerHTML = "<i>" + t("manualHint") + "</i>";
    }
    const kbd = document.getElementById("keyboardInput");
    if (kbd) kbd.placeholder = t("manualPlaceholder");
    const mSend = document.getElementById("btnManualSend");
    if (mSend) mSend.textContent = t("manualSend");
    const dClose = document.getElementById("btnDialogueClose");
    if (dClose) dClose.textContent = t("dialogueClose");
    const pn = document.getElementById("textPlayerName");
    if (pn && pn.dataset.pristine === "1") {
        pn.textContent = t("loading");
    }
    if (typeof currentRoom !== "undefined" && currentRoom) {
        const title = getLocalizedRoomTitle(currentRoom);
        const ht = document.getElementById("roomTitle");
        if (ht) ht.textContent = title;
        document.title = `${t("htmlTitle")} - ${title}`;
    } else {
        document.title = t("htmlTitle");
    }
    document.documentElement.lang = isEnglishMode ? "en" : "fr";
    if (typeof currentRoomData !== "undefined" && currentRoomData && currentRoomData.room) {
        updateRoomDisplay(currentRoomData);
    }
    if (
        typeof currentDialogueTree !== "undefined" &&
        currentDialogueTree &&
        typeof currentNodeId !== "undefined" &&
        currentNodeId &&
        currentNodeId !== "END" &&
        typeof loadDialogueNode === "function"
    ) {
        loadDialogueNode(currentNodeId, { silent: true });
    }
    const invTab = document.getElementById("tabInv");
    if (invTab && invTab.style.display === "block" && typeof loadInventory === "function") {
        loadInventory();
    }
}

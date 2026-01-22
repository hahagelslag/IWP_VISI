// Dit is de "hersenen" van je chatbot
// Het laadt de data en beantwoordt vragen

let allData = []; // Alle datasets
let visiData = null; // De geselecteerde dataset
let activeTab = 'individual'; // Welk tabblad is actief

// === 1. DATA LADEN ===
// Als de pagina laadt, haal de data op
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('./data.json');
        allData = await response.json();
        
        // Vul de dropdown met datasets
        populateDatasetSelector();
        
        // Vul het overzicht
        displayOverview();
        
    } catch (error) {
        console.error('Kan data niet laden:', error);
    }
    
    // Zet alle knoppen en input aan
    setupChat();
    
    // Zet tabs aan
    setupTabs();
    
    // Zet lightbox aan
    setupLightbox();
});

// === 1b. DATASET SELECTOR VULLEN ===
function populateDatasetSelector() {
    const selector = document.getElementById('datasetSelector');
    
    if (!selector) {
        console.error('Dataset selector niet gevonden in HTML');
        return;
    }
    
    // Verwijder de "Laden..." optie
    selector.innerHTML = '';
    
    allData.forEach((dataset, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${dataset.deelnemer} (${dataset.id})`;
        selector.appendChild(option);
    });
    
    // Selecteer automatisch de eerste dataset
    if (allData.length > 0) {
        selector.value = 0;
        visiData = allData[0];
        displayData();
    }
    
    // Luister naar veranderingen
    selector.addEventListener('change', (e) => {
        const index = e.target.value;
        if (index !== '') {
            visiData = allData[index];
            displayData();
            
            // Reset chat voor nieuwe dataset
            resetChat();
        }
    });
}

// === 2. DATA TONEN ===
function displayData() {
    const display = document.getElementById('dataDisplay');
    if (!visiData) {
        display.innerHTML = '<p>Selecteer eerst een deelnemer hierboven</p>';
        return;
    }
    
    display.innerHTML = `
        <div class="deelnemer-card-single">
            <h3>${visiData.deelnemer} <span class="deelnemer-id">(${visiData.id})</span></h3>
            
            <div class="opdracht-section">
                <h4>Opdracht 1: Prettige plek</h4>
                <div class="opdracht-content">
                    <p><strong>Foto:</strong> ${visiData.opdracht1.image}</p>
                    <p><strong>Waarom prettig:</strong> "${visiData.opdracht1.waarom_prettig}"</p>
                    <p><strong>Rustigheidsscore:</strong> ${visiData.opdracht1.rustigheidScore}/10</p>
                </div>
            </div>
            
            <div class="opdracht-section">
                <h4>Opdracht 2: Onprettige plek</h4>
                <div class="opdracht-content">
                    <p><strong>Foto:</strong> ${visiData.opdracht2.image}</p>
                    <p><strong>Reden:</strong> ${visiData.opdracht2.reden}</p>
                </div>
            </div>
            
            <div class="opdracht-section">
                <h4>Opdracht 3: Verbetering</h4>
                <div class="opdracht-content">
                    <p><strong>Verbetering:</strong> "${visiData.opdracht3.verbetering}"</p>
                    <p><strong>Belangrijkheidsscore:</strong> ${visiData.opdracht3.belangrijkheidScore}/5</p>
                </div>
            </div>
            
            <div class="labels-section">
                <strong>Labels:</strong> 
                ${visiData.labels_handmatig.map(label => `<span class="label-tag">${label}</span>`).join(' ')}
            </div>
        </div>
    `;
}

// === 2b. CHAT RESETTEN ===
function resetChat() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = '<div class="bot-message">Ik heb de nieuwe dataset geladen. Waar kan ik je mee helpen?</div>';
}

// === 3. CHAT SETUP ===
function setupChat() {
    const chatButton = document.getElementById('chatButton');
    const chatWindow = document.getElementById('chatWindow');
    const closeButton = document.getElementById('closeButton');
    const sendButton = document.getElementById('sendButton');
    const chatInput = document.getElementById('chatInput');
    
    // Open chat
    chatButton.addEventListener('click', () => {
        chatWindow.classList.add('open');
        chatButton.style.display = 'none';
    });
    
    // Sluit chat
    closeButton.addEventListener('click', () => {
        chatWindow.classList.remove('open');
        chatButton.style.display = 'flex';
    });
    
    // Verstuur bericht
    sendButton.addEventListener('click', () => sendMessage());
    
    // Enter-toets om te versturen
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// === 4. BERICHT VERSTUREN ===
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return; // Lege berichten negeren
    
    // Toon gebruikersbericht
    addMessage(message, 'user');
    
    // Leeg het invoerveld
    input.value = '';
    
    // Laat bot nadenken (kleine vertraging voor natuurlijkheid)
    setTimeout(() => {
        const response = generateResponse(message);
        
        // Check of de response een object is met tekst en afbeelding
        if (typeof response === 'object' && response.text) {
            addMessage(response.text, 'bot', response.image);
        } else {
            addMessage(response, 'bot');
        }
    }, 500);
}

// === 5. BERICHT TOEVOEGEN AAN CHAT ===
function addMessage(text, sender, imageUrl = null) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'user' ? 'user-message' : 'bot-message';
    
    // Als er een afbeelding is, voeg die toe
    if (imageUrl) {
        const textNode = document.createElement('p');
        textNode.textContent = text;
        messageDiv.appendChild(textNode);
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Rustigheidsscore visualisatie';
        img.style.maxWidth = '100%';
        img.style.marginTop = '10px';
        img.style.borderRadius = '8px';
        img.style.cursor = 'pointer';
        img.title = 'Klik om te vergroten';
        
        // Voeg click event toe om lightbox te openen
        img.addEventListener('click', () => openLightbox(imageUrl));
        
        messageDiv.appendChild(img);
    } else {
        messageDiv.textContent = text;
    }
    
    messagesContainer.appendChild(messageDiv);
    
    // Scroll naar beneden
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// === 6. ANTWOORD GENEREREN (DE INTELLIGENTIE) ===
function generateResponse(vraag) {
    const vraagLower = vraag.toLowerCase();
    
    // === GEAGGREGEERD NIVEAU (alle deelnemers samen) ===
    
    // VRAAG: VISUALISATIE VAN RUSTIGHEIDSSCORE
    if ((vraagLower.includes('visualisatie') || vraagLower.includes('grafiek') || vraagLower.includes('chart') || vraagLower.includes('diagram') || vraagLower.includes('afbeelding') || vraagLower.includes('plaatje')) && 
        (vraagLower.includes('rustig') || vraagLower.includes('rust'))) {
        return {
            text: 'Hier is een visualisatie van de rustigheidsscore voor alle deelnemers:',
            image: '/images/Rustigheidsscore%20staafdiagram.png'
        };
    }
    
    // VRAAG: VISUALISATIE VAN ONPRETTIGE REDENEN
    if ((vraagLower.includes('visualisatie') || vraagLower.includes('grafiek') || vraagLower.includes('chart') || vraagLower.includes('diagram') || vraagLower.includes('afbeelding') || vraagLower.includes('plaatje')) && 
        (vraagLower.includes('onprettig') || vraagLower.includes('reden'))) {
        return {
            text: 'Hier is een visualisatie van de onprettige redenen van alle deelnemers:',
            image: '/images/Onprettige redenen cirkeldiagram.png'
        };
    }
    
    // VRAAG: VISUALISATIE VAN VERBETERCATEGORIEËN
    if ((vraagLower.includes('visualisatie') || vraagLower.includes('grafiek') || vraagLower.includes('chart') || vraagLower.includes('diagram') || vraagLower.includes('afbeelding') || vraagLower.includes('plaatje')) && 
        (vraagLower.includes('verbetering') || vraagLower.includes('verbeter'))) {
        return {
            text: 'Hier is een visualisatie van de verbetercategorieën van alle deelnemers:',
            image: '/images/Verbetercategorieen cirkeldiagram.png'
        };
    }
    
    // VRAAG: GEMIDDELDE RUSTIGHEIDSSCORE
    if (vraagLower.includes('gemiddeld') && (vraagLower.includes('rustig') || vraagLower.includes('rust'))) {
        return berekenGemiddeldeRustigheidsscore();
    }
    
    // VRAAG: GEMIDDELDE BELANGRIJKHEIDSSCORE
    if (vraagLower.includes('gemiddeld') && vraagLower.includes('belangrijk')) {
        return berekenGemiddeldeBelangrijkheidsscore();
    }
    
    // VRAAG: MEEST VOORKOMENDE REDENEN (onprettige plekken)
    if ((vraagLower.includes('vaak') || vraagLower.includes('meest')) && (vraagLower.includes('reden') || vraagLower.includes('onprettig'))) {
        return analyseerRedenen();
    }
    
    // VRAAG: PATRONEN IN VERBETERINGEN
    if ((vraagLower.includes('patroon') || vraagLower.includes('vaak') || vraagLower.includes('meest')) && vraagLower.includes('verbetering')) {
        return analyseerVerbeteringen();
    }
    
    // VRAAG: MEEST VOORKOMENDE LABELS
    if ((vraagLower.includes('meest') || vraagLower.includes('vaak')) && vraagLower.includes('label')) {
        return analyseLabels();
    }
    
    // VRAAG: HOEVEEL DEELNEMERS
    if (vraagLower.includes('hoeveel') && (vraagLower.includes('deelnemer') || vraagLower.includes('mensen') || vraagLower.includes('data'))) {
        return `Er zijn ${allData.length} deelnemers in deze dataset.`;
    }
    
    // VRAAG: OVERZICHT ALLE DATA
    if ((vraagLower.includes('overzicht') || vraagLower.includes('alle')) && vraagLower.includes('deelnemer')) {
        return geefOverzicht();
    }
    
    // VRAAG: HOOGSTE/LAAGSTE SCORES (geaggregeerd)
    if (vraagLower.includes('hoogste') || vraagLower.includes('hoogst') || vraagLower.includes('laagste') || vraagLower.includes('laagst')) {
        return analyseExtremeScores(vraagLower);
    }
    
    // === INDIVIDUEEL NIVEAU (per deelnemer) ===
    
    // Check of we op het individuele tabblad zijn
    if (activeTab === 'overview') {
        // Als we op het overzicht zijn, alleen geaggregeerde vragen toestaan
        return 'Je bent nu op het "Alle deelnemers overzicht" tabblad. Hier kan ik alleen vragen beantwoorden over alle deelnemers samen. Voorbeelden:\n\n• "Wat is de gemiddelde rustigheidsscore?"\n• "Welke redenen komen het vaakst voor?"\n• "Welke verbeteringen worden genoemd?"\n\nWil je vragen stellen over een specifieke deelnemer? Ga dan naar het "Individuele deelnemer" tabblad.';
    }
    
    if (!visiData) {
        return 'Selecteer eerst een deelnemer hierboven om vragen te stellen over een specifieke persoon. Of ga naar het "Alle deelnemers overzicht" tabblad en vraag me iets over alle deelnemers samen.';
    }
    
    // VRAAG: WAT MAAKT DEZE PLEK PRETTIG?
    if ((vraagLower.includes('waarom') || vraagLower.includes('wat')) && (vraagLower.includes('prettig') || vraagLower.includes('fijn'))) {
        return `${visiData.deelnemer} geeft aan: "${visiData.opdracht1.waarom_prettig}"\n\nDit is de reden waarom deze deelnemer deze plek als prettig ervaart.`;
    }
    
    // VRAAG: HOE RUSTIG VINDT DEZE DEELNEMER DEZE PLEK?
    if (vraagLower.includes('rustig') && (vraagLower.includes('hoe') || vraagLower.includes('score'))) {
        const score = visiData.opdracht1.rustigheidScore;
        let interpretatie = '';
        if (score >= 8) interpretatie = 'zeer rustig';
        else if (score >= 6) interpretatie = 'overwegend rustig';
        else if (score >= 4) interpretatie = 'gemiddeld qua rust';
        else interpretatie = 'weinig rustig';
        
        return `${visiData.deelnemer} beoordeelt de rustigheidservaring met een ${score}/10, wat wijst op een ${interpretatie}e ervaring.`;
    }
    
    // VRAAG: WAT MAAKT DEZE PLEK ONPRETTIG?
    if ((vraagLower.includes('waarom') || vraagLower.includes('wat')) && vraagLower.includes('onprettig')) {
        return `${visiData.deelnemer} noemt als reden: "${visiData.opdracht2.reden}"\n\nDit is wat volgens deze deelnemer de plek minder prettig maakt.`;
    }
    
    // VRAAG: WELKE VERBETERING NOEMT DEZE DEELNEMER?
    if (vraagLower.includes('verbetering') && (vraagLower.includes('welk') || vraagLower.includes('wat') || vraagLower.includes('noemt'))) {
        return `${visiData.deelnemer} stelt voor: "${visiData.opdracht3.verbetering}"\n\nDit is de verbetering die deze deelnemer het liefst zou willen zien.`;
    }
    
    // VRAAG: HOE BELANGRIJK VINDT DEZE DEELNEMER DIE VERBETERING?
    if (vraagLower.includes('belangrijk') && (vraagLower.includes('hoe') || vraagLower.includes('score'))) {
        const score = visiData.opdracht3.belangrijkheidScore;
        let interpretatie = '';
        if (score === 5) interpretatie = 'heel belangrijk';
        else if (score === 4) interpretatie = 'belangrijk';
        else if (score === 3) interpretatie = 'redelijk belangrijk';
        else if (score === 2) interpretatie = 'enigszins belangrijk';
        else interpretatie = 'niet zo belangrijk';
        
        return `${visiData.deelnemer} beoordeelt deze verbetering met een ${score}/5, wat aangeeft dat het ${interpretatie} wordt gevonden.`;
    }
    
    // VRAAG: LABELS VAN DEZE DEELNEMER
    if (vraagLower.includes('label') || vraagLower.includes('tag')) {
        const labels = visiData.labels_handmatig.join(', ');
        return `De labels voor ${visiData.deelnemer}: ${labels}.\n\nDeze labels zijn handmatig toegevoegd op basis van de antwoorden.`;
    }
    
    // VRAAG: FOTO'S
    if (vraagLower.includes('foto')) {
        return `${visiData.deelnemer} heeft twee foto's ingediend:\n• Prettige plek: ${visiData.opdracht1.image}\n• Onprettige plek: ${visiData.opdracht2.image}\n\nLet op: ik kan foto's alleen beschrijven via de gekoppelde data (labels en beschrijvingen), niet visueel interpreteren.`;
    }
    
    // VRAAG: HELP / WAT KAN DE BOT
    if (vraagLower.includes('help') || vraagLower.includes('wat kun je') || vraagLower.includes('wat kan je')) {
        return getHelpText();
    }
    
    // FALLBACK
    return `Ik kan deze vraag niet beantwoorden met de beschikbare data.\n\nWat ik wel kan:\n• Individuele vragen over ${visiData.deelnemer} (bijv. "Waarom vindt deze deelnemer deze plek prettig?")\n• Geaggregeerde vragen over alle deelnemers (bijv. "Wat is de gemiddelde rustigheidsscore?")\n\nProbeer je vraag anders te formuleren!`;
}

// === 7. ANALYSE FUNCTIES (geaggregeerd niveau) ===

// GEMIDDELDE RUSTIGHEIDSSCORE
function berekenGemiddeldeRustigheidsscore() {
    if (allData.length === 0) {
        return 'Er zijn geen deelnemers beschikbaar om een gemiddelde te berekenen.';
    }
    
    const totaal = allData.reduce((sum, d) => sum + d.opdracht1.rustigheidScore, 0);
    const gemiddelde = (totaal / allData.length).toFixed(1);
    
    let interpretatie = '';
    if (gemiddelde >= 8) interpretatie = 'zeer rustige';
    else if (gemiddelde >= 6) interpretatie = 'overwegend rustige';
    else if (gemiddelde >= 4) interpretatie = 'gemiddeld rustige';
    else interpretatie = 'weinig rustige';
    
    return `Wat laat de data zien?\nDe gemiddelde rustigheidsscore van prettige plekken is ${gemiddelde}/10, gebaseerd op ${allData.length} deelnemers.\n\nWat betekent dit?\nEen score van ${gemiddelde} wijst op een ${interpretatie} ervaring bij de als prettig ervaren plekken.`;
}

// GEMIDDELDE BELANGRIJKHEIDSSCORE
function berekenGemiddeldeBelangrijkheidsscore() {
    if (allData.length === 0) {
        return 'Er zijn geen deelnemers beschikbaar om een gemiddelde te berekenen.';
    }
    
    const totaal = allData.reduce((sum, d) => sum + d.opdracht3.belangrijkheidScore, 0);
    const gemiddelde = (totaal / allData.length).toFixed(1);
    
    let interpretatie = '';
    if (gemiddelde >= 4.5) interpretatie = 'zeer belangrijk';
    else if (gemiddelde >= 3.5) interpretatie = 'belangrijk';
    else if (gemiddelde >= 2.5) interpretatie = 'redelijk belangrijk';
    else interpretatie = 'matig belangrijk';
    
    return `Wat laat de data zien?\nDe gemiddelde belangrijkheidsscore voor genoemde verbeteringen is ${gemiddelde}/5, gebaseerd op ${allData.length} deelnemers.\n\nWat betekent dit?\nEen score van ${gemiddelde} geeft aan dat deelnemers de voorgestelde verbeteringen gemiddeld als ${interpretatie} ervaren.`;
}

// ANALYSEER REDENEN (onprettige plekken)
function analyseerRedenen() {
    if (allData.length === 0) {
        return 'Er zijn geen deelnemers beschikbaar om te analyseren.';
    }
    
    const redenTelling = {};
    allData.forEach(d => {
        const reden = d.opdracht2.reden;
        redenTelling[reden] = (redenTelling[reden] || 0) + 1;
    });
    
    const gesorteerd = Object.entries(redenTelling)
        .sort((a, b) => b[1] - a[1]);
    
    const totaal = allData.length;
    let resultaat = `Wat laat de data zien?\nAnalyse van ${totaal} antwoorden over onprettige plekken:\n\n`;
    
    gesorteerd.forEach(([reden, aantal]) => {
        const percentage = ((aantal / totaal) * 100).toFixed(0);
        let frequentie = '';
        if (aantal === totaal) frequentie = 'Alle deelnemers noemen';
        else if (aantal > totaal / 2) frequentie = 'De meerderheid noemt';
        else if (aantal > 1) frequentie = `${aantal} deelnemers noemen`;
        else frequentie = 'Eén deelnemer noemt';
        
        resultaat += `• ${frequentie} "${reden}" (${percentage}%)\n`;
    });
    
    resultaat += `\nWat betekent dit?\nDe meest genoemde reden "${gesorteerd[0][0]}" springt eruit als belangrijkste factor die plekken onprettig maakt.`;
    
    return resultaat;
}

// ANALYSEER VERBETERINGEN
function analyseerVerbeteringen() {
    if (allData.length === 0) {
        return 'Er zijn geen deelnemers beschikbaar om te analyseren.';
    }
    
    // Groepeer verbeteringen met score 4 of 5 (belangrijk)
    const belangrijkeVerbeteringen = allData
        .filter(d => d.opdracht3.belangrijkheidScore >= 4)
        .map(d => ({ 
            tekst: d.opdracht3.verbetering, 
            score: d.opdracht3.belangrijkheidScore,
            deelnemer: d.deelnemer
        }));
    
    const totaal = allData.length;
    const aantalBelangrijk = belangrijkeVerbeteringen.length;
    const percentage = ((aantalBelangrijk / totaal) * 100).toFixed(0);
    
    let resultaat = `Wat laat de data zien?\n${aantalBelangrijk} van de ${totaal} deelnemers (${percentage}%) beoordeelt hun verbetering als belangrijk (score 4-5).\n\n`;
    
    if (belangrijkeVerbeteringen.length > 0) {
        resultaat += `Deze verbeteringen worden als (heel) belangrijk genoemd:\n`;
        belangrijkeVerbeteringen.forEach(v => {
            resultaat += `• "${v.tekst}" (${v.score}/5)\n`;
        });
    }
    
    resultaat += `\nWat betekent dit?\n`;
    if (aantalBelangrijk > totaal / 2) {
        resultaat += `De meerderheid vindt hun voorgestelde verbetering belangrijk, wat wijst op sterke wensen voor verandering.`;
    } else {
        resultaat += `Er is variatie in hoe belangrijk deelnemers hun voorgestelde verbeteringen vinden.`;
    }
    
    return resultaat;
}

// LABELS ANALYSEREN
function analyseLabels() {
    if (allData.length === 0) {
        return 'Er zijn geen deelnemers beschikbaar om te analyseren.';
    }
    
    const labelTelling = {};
    allData.forEach(d => {
        d.labels_handmatig.forEach(label => {
            labelTelling[label] = (labelTelling[label] || 0) + 1;
        });
    });
    
    const gesorteerd = Object.entries(labelTelling)
        .sort((a, b) => b[1] - a[1]);
    
    const totaal = allData.length;
    let resultaat = `Wat laat de data zien?\nMeest voorkomende labels (handmatig toegevoegd):\n\n`;
    
    gesorteerd.slice(0, 5).forEach(([label, aantal]) => {
        const percentage = ((aantal / totaal) * 100).toFixed(0);
        let frequentie = '';
        if (aantal > totaal / 2) frequentie = 'komt vaak terug';
        else if (aantal > 1) frequentie = `komt ${aantal}x voor`;
        else frequentie = 'komt 1x voor';
        
        resultaat += `• "${label}" - ${frequentie}\n`;
    });
    
    resultaat += `\nWat betekent dit?\nDeze labels geven thematische patronen weer in de antwoorden van deelnemers.`;
    
    return resultaat;
}

// EXTREME SCORES ANALYSEREN
function analyseExtremeScores(vraag) {
    if (allData.length === 0) {
        return 'Er zijn geen deelnemers beschikbaar om te analyseren.';
    }
    
    const zoektHoogste = vraag.includes('hoogste') || vraag.includes('hoogst');
    
    if (vraag.includes('rustig')) {
        const sorted = [...allData].sort((a, b) => 
            zoektHoogste ? b.opdracht1.rustigheidScore - a.opdracht1.rustigheidScore 
                        : a.opdracht1.rustigheidScore - b.opdracht1.rustigheidScore
        );
        const top = sorted[0];
        const label = zoektHoogste ? 'hoogste' : 'laagste';
        
        return `Wat laat de data zien?\nDe ${label} rustigheidsscore is ${top.opdracht1.rustigheidScore}/10 (${top.deelnemer}).\n\nReden: "${top.opdracht1.waarom_prettig}"\n\nWat betekent dit?\nDeze score springt eruit als de ${label} beoordeling van rust bij prettige plekken.`;
    }
    
    if (vraag.includes('belangrijk')) {
        const sorted = [...allData].sort((a, b) => 
            zoektHoogste ? b.opdracht3.belangrijkheidScore - a.opdracht3.belangrijkheidScore 
                        : a.opdracht3.belangrijkheidScore - b.opdracht3.belangrijkheidScore
        );
        const top = sorted[0];
        const label = zoektHoogste ? 'hoogste' : 'laagste';
        
        return `Wat laat de data zien?\nDe ${label} belangrijkheidsscore is ${top.opdracht3.belangrijkheidScore}/5 (${top.deelnemer}).\n\nVerbetering: "${top.opdracht3.verbetering}"\n\nWat betekent dit?\nDeze deelnemer hecht ${zoektHoogste ? 'zeer veel' : 'relatief weinig'} belang aan de voorgestelde verbetering.`;
    }
    
    return 'Specificeer of je de hoogste/laagste rustigheidsscore of belangrijkheidsscore wilt zien.';
}

// VOLLEDIG OVERZICHT
function geefOverzicht() {
    if (allData.length === 0) {
        return 'Er zijn geen deelnemers beschikbaar.';
    }
    
    const gemRustig = (allData.reduce((sum, d) => sum + d.opdracht1.rustigheidScore, 0) / allData.length).toFixed(1);
    
    let resultaat = `Overzicht van ${allData.length} deelnemers:\n\n`;
    
    allData.forEach(d => {
        resultaat += `${d.deelnemer}:\n`;
        resultaat += `• Rustigheidsscore: ${d.opdracht1.rustigheidScore}/10\n`;
        resultaat += `• Reden onprettig: ${d.opdracht2.reden}\n`;
        resultaat += `• Belangrijkheid verbetering: ${d.opdracht3.belangrijkheidScore}/5\n\n`;
    });
    
    resultaat += `Gemiddelde rustigheidsscore: ${gemRustig}/10`;
    
    return resultaat;
}

// HELP TEKST
function getHelpText() {
    const deelnemerInfo = visiData ? ` (Nu geselecteerd: ${visiData.deelnemer})` : '';
    
    return `Ik kan vragen beantwoorden op twee niveaus:\n\n1. INDIVIDUEEL NIVEAU${deelnemerInfo}\n• "Waarom vindt deze deelnemer deze plek prettig?"\n• "Hoe rustig vindt deze deelnemer deze plek?"\n• "Welke verbetering noemt deze deelnemer?"\n• "Hoe belangrijk vindt deze deelnemer die verbetering?"\n\n2. GEAGGREGEERD NIVEAU (alle ${allData.length} deelnemers)\n• "Wat is de gemiddelde rustigheidsscore?"\n• "Welke redenen komen het vaakst voor?"\n• "Welke verbeteringen worden vaak genoemd?"\n• "Wat is de hoogste/laagste score?"\n\nIk werk alleen met de beschikbare data — geen aannames!`;
}

// === 8. OUDE FUNCTIE VERWIJDEREN ===
// interpreteerScore niet meer nodig

// === 9. TABS SETUP ===
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // Update actieve tab
            activeTab = tabName;
            
            // Verwijder active class van alle buttons en contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Voeg active class toe aan geklikte button en bijbehorende content
            button.classList.add('active');
            document.getElementById(`tab-${tabName}`).classList.add('active');
        });
    });
}

// === 10. OVERZICHT DISPLAY ===
function displayOverview() {
    const display = document.getElementById('overviewDisplay');
    
    if (!allData || allData.length === 0) {
        display.innerHTML = '<p>Geen data beschikbaar.</p>';
        return;
    }
    
    let html = '';
    
    allData.forEach(deelnemer => {
        html += `
            <div class="deelnemer-card">
                <h3>${deelnemer.deelnemer} <span class="deelnemer-id">(${deelnemer.id})</span></h3>
                
                <div class="opdracht-section">
                    <h4>Opdracht 1: Prettige plek</h4>
                    <div class="opdracht-content">
                        <p><strong>Foto:</strong> ${deelnemer.opdracht1.image}</p>
                        <p><strong>Waarom prettig:</strong> "${deelnemer.opdracht1.waarom_prettig}"</p>
                        <p><strong>Rustigheidsscore:</strong> ${deelnemer.opdracht1.rustigheidScore}/10</p>
                    </div>
                </div>
                
                <div class="opdracht-section">
                    <h4>Opdracht 2: Onprettige plek</h4>
                    <div class="opdracht-content">
                        <p><strong>Foto:</strong> ${deelnemer.opdracht2.image}</p>
                        <p><strong>Reden:</strong> ${deelnemer.opdracht2.reden}</p>
                    </div>
                </div>
                
                <div class="opdracht-section">
                    <h4>Opdracht 3: Verbetering</h4>
                    <div class="opdracht-content">
                        <p><strong>Verbetering:</strong> "${deelnemer.opdracht3.verbetering}"</p>
                        <p><strong>Belangrijkheidsscore:</strong> ${deelnemer.opdracht3.belangrijkheidScore}/5</p>
                    </div>
                </div>
                
                <div class="labels-section">
                    <strong>Labels:</strong> 
                    ${deelnemer.labels_handmatig.map(label => `<span class="label-tag">${label}</span>`).join(' ')}
                </div>
            </div>
        `;
    });
    
    display.innerHTML = html;
}

// === LIGHTBOX FUNCTIES ===
function setupLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    const closeBtn = document.getElementById('lightboxClose');
    
    // Sluit lightbox bij klikken op close button
    closeBtn.addEventListener('click', closeLightbox);
    
    // Sluit lightbox bij klikken buiten de afbeelding
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Sluit lightbox met Escape toets
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
}

function openLightbox(imageUrl) {
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    
    lightboxImage.src = imageUrl;
    lightbox.classList.add('active');
    
    // Voorkom scrollen op de achtergrond
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    lightbox.classList.remove('active');
    
    // Herstel scrollen
    document.body.style.overflow = '';
}



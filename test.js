// /js/chatbot.js
// Malongui Consulting — Chatbot Préqualification
// v4 : input toujours visible + NLP libre à tout moment du flow

(function () {

    // ── WhatsApp SVG ───────────────────────────────────────────────
    const whatsappSVG = `<svg class="chat-opt-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="15" height="15" fill="currentColor" style="display:inline-block;vertical-align:middle;margin-right:2px;">
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
    </svg>`;

    function updateLucideIcons() {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    }


    // ── WELCOME FALLBACK ───────────────────────────────────────────
    const WELCOME_FALLBACK_FR = "Bonjour ! 👋 Je suis l'assistant de Malongui Consulting.\nComment puis-je vous aider aujourd'hui ?";
    const WELCOME_FALLBACK_EN = "Hello! 👋 I'm the Malongui Consulting assistant.\nHow can I help you today?";

    function getWelcomeMessage() {
        const translated = t('welcome', null);
        if (translated) return translated;
        const lang = document.documentElement.lang || 'fr';
        return lang.startsWith('en') ? WELCOME_FALLBACK_EN : WELCOME_FALLBACK_FR;
    }


    // ── NLP LIBRE ─────────────────────────────────────────────────
    // Interprète la saisie libre à N'IMPORTE QUEL moment du flow.
    // Retourne { action, nextStep } ou null si rien de reconnu.

    const NLP_RULES = [
        // Intention → impôts
        {
            pattern: /imp[oô]t|d[eé]clar|fiscal|tax|2[0-9]{3}/i,
            action: () => {
                userInputData.service = "Déclaration d'impôt";
                currentState = 'tax_who';
            },
            ack: ["Je vois, vous avez une question sur les impôts. Laissez-moi vous orienter.", "Bien, on s'occupe de votre déclaration d'impôts !"]
        },
        // Intention → comptabilité
        {
            pattern: /compta|comptab|bilan|tva|tvA|livres? de compte|bouclements?/i,
            action: () => {
                userInputData.service = 'Comptabilité';
                currentState = 'compta_status';
            },
            ack: ["Comptabilité, très bien — je vous guide.", "C'est notre cœur de métier, on va trouver la bonne formule."]
        },
        // Intention → création entreprise
        {
            pattern: /cr[eé]er?|cr[eé]ation|entreprise|sàrl|sarl|\bsa\b|statuts?|lancer/i,
            action: () => {
                userInputData.service = "Création d'entreprise";
                currentState = 'creation_step';
            },
            ack: ["Création d'entreprise — excellente démarche ! 🎉", "Super, la création c'est une belle étape !"]
        },
        // Intention → frontalier / bienvenue
        {
            pattern: /frontalier|frontal|permis\s*g|arriv[eé]|install|bienvenue|nouveau/i,
            action: () => {
                userInputData.service = 'Pack Bienvenue';
                currentState = 'welcome_step';
            },
            ack: ["Bienvenue ! On est là pour faciliter votre installation. 😊", "Pas de souci, on s'occupe de tout pour les nouveaux arrivants."]
        },
        // Intention → administratif
        {
            pattern: /courrier|lettre|formulaire|admin|d[eé]marche|contester?|litige|r[eé]clam/i,
            action: () => {
                userInputData.service = 'Accompagnement administratif';
                currentState = 'admin_type';
            },
            ack: ["On gère ce type de démarche régulièrement.", "Pas de problème, je vous oriente sur les démarches administratives."]
        },
        // Intention → urgence
        {
            pattern: /urgent|rapidement|vite|d[eè]s que possible|asap|délai/i,
            action: () => { currentState = 'whatsapp_direct'; },
            ack: ["Je comprends l'urgence — on va aller directement à l'essentiel.", "Pas de panique, on s'en occupe."]
        },
        // Intention → contact direct
        {
            pattern: /appel|t[eé]l[eé]phone|whatsapp|rappeler|parler|contact/i,
            action: () => { currentState = 'whatsapp_direct'; },
            ack: ["Bien sûr, je vous mets en contact direct avec l'équipe.", "Absolument, voici comment nous joindre rapidement."]
        },
        // Bonjour / salutation → on reste au welcome
        {
            pattern: /^(bonjour|salut|hello|coucou|bonsoir|hi\b|hey\b)/i,
            action: () => { currentState = 'welcome'; },
            ack: ["Bonjour ! 😊 Dites-moi, qu'est-ce qui vous amène ?", "Bonjour ! Comment puis-je vous aider ?"]
        },
    ];

    // Tente de reconnaître l'intention dans le texte libre
    // Retourne { ack, action } ou null
    function detectFreeIntent(text) {
        for (const rule of NLP_RULES) {
            if (rule.pattern.test(text)) {
                return { ack: pick(rule.ack), action: rule.action };
            }
        }
        return null;
    }

    // États où l'input libre EST déjà attendu structurellement
    // (nom, email, message) — on ne passe pas par le NLP dans ces états
    const STRUCTURED_INPUT_STATES = ['collect_name', 'collect_email', 'collect_message'];


    // ── RÉACTIONS CONTEXTUELLES ────────────────────────────────────
    const REACTIONS = {
        tax_who:         ["D'accord, on s'occupe de votre déclaration d'impôts.", "Parfait, c'est l'une de nos spécialités !"],
        compta_status:   ["Très bien, la comptabilité c'est notre cœur de métier.", "Noté — on va voir ça ensemble."],
        admin_type:      ["Pas de problème, on gère ce type de démarche régulièrement."],
        creation_step:   ["Super, la création d'entreprise c'est une belle étape ! 🎉"],
        welcome_step:    ["Bienvenue en Suisse ! On est là pour faciliter votre installation. 😊"],
        other_urgent:    ["Compris, dites-moi en un peu plus."],
        tax_kids:        ["Noté, je prends en compte votre situation."],
        tax_extra:       ["Très bien."],
        compta_need:     ["D'accord, je vois exactement ce qu'il vous faut."],
        collect_name:    ["Parfait, on y est presque !"],
        whatsapp_direct: ["Je comprends, on ne va pas perdre de temps."],
    };

    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function typingDelay(text) { return Math.min(400 + (text ? text.length * 18 : 0), 2000); }
    function isRefusal(val) {
        return /^(non|no|rien|skip|pass|nope|je ne veux pas|pas envie|anonyme|inconnu|-|\.+|x+|azerty|test)$/i.test(val.trim());
    }


    // ── FLOW ───────────────────────────────────────────────────────
    const CHAT_FLOW = {
        welcome: {
            messageKey: 'welcome',
            options: [
                { textKey: 'opt_tax',      nextStep: 'tax_who',        value: "Déclaration d'impôt",          icon: 'file-text'   },
                { textKey: 'opt_compta',   nextStep: 'compta_status',  value: 'Comptabilité',                 icon: 'bar-chart-2' },
                { textKey: 'opt_admin',    nextStep: 'admin_type',     value: 'Accompagnement administratif', icon: 'pen-tool'    },
                { textKey: 'opt_creation', nextStep: 'creation_step',  value: "Création d'entreprise",        icon: 'briefcase'   },
                { textKey: 'opt_welcome',  nextStep: 'welcome_step',   value: 'Pack Bienvenue',               icon: 'globe'       },
                { textKey: 'opt_other',    nextStep: 'other_urgent',   value: 'Autre demande',                icon: 'help-circle' },
            ]
        },
        tax_who: {
            messageKey: 'q_tax_who',
            options: [
                { textKey: 'opt_single', nextStep: 'tax_kids', value: 'Personne seule', icon: 'user'  },
                { textKey: 'opt_couple', nextStep: 'tax_kids', value: 'Couple marié',   icon: 'users' },
            ]
        },
        tax_kids: {
            messageKey: 'q_tax_kids',
            options: [
                { textKey: 'opt_yes', nextStep: 'tax_extra', value: 'Avec enfants mineurs', icon: 'check' },
                { textKey: 'opt_no',  nextStep: 'tax_extra', value: 'Sans enfant mineur',   icon: 'minus' },
            ]
        },
        tax_extra: {
            messageKey: 'q_tax_extra',
            options: [
                { textKey: 'opt_real_estate', nextStep: 'collect_name', value: 'Propriété immobilière', icon: 'home'        },
                { textKey: 'opt_securities',  nextStep: 'collect_name', value: 'Titres ou placements',  icon: 'trending-up' },
                { textKey: 'opt_none',        nextStep: 'collect_name', value: 'Rien de particulier',   icon: 'circle'      },
            ]
        },
        compta_status: {
            messageKey: 'q_compta_status',
            options: [
                { textKey: 'opt_independent', nextStep: 'compta_need', value: 'Indépendant',                icon: 'user'        },
                { textKey: 'opt_company',     nextStep: 'compta_need', value: 'Société Sàrl/SA',            icon: 'briefcase'   },
                { textKey: 'opt_creating',    nextStep: 'compta_need', value: 'En cours de création/Autre', icon: 'plus-circle' },
            ]
        },
        compta_need: {
            messageKey: 'q_compta_need',
            options: [
                { textKey: 'opt_full_bookkeeping', nextStep: 'collect_name', value: 'Tenue complète', icon: 'book-open'  },
                { textKey: 'opt_closings',         nextStep: 'collect_name', value: 'Bouclements',    icon: 'file-check' },
                { textKey: 'opt_vat_advice',       nextStep: 'collect_name', value: 'TVA / Conseils', icon: 'percent'    },
            ]
        },
        admin_type: {
            messageKey: 'q_admin_type',
            options: [
                { textKey: 'opt_letters',  nextStep: 'collect_name', value: 'Rédaction courriers',     icon: 'mail'           },
                { textKey: 'opt_forms',    nextStep: 'collect_name', value: 'Remplissage formulaires', icon: 'file-text'      },
                { textKey: 'opt_disputes', nextStep: 'collect_name', value: 'Litige / correspondance', icon: 'alert-triangle' },
            ]
        },
        creation_step: {
            messageKey: 'q_creation_step',
            options: [
                { textKey: 'opt_advice', nextStep: 'collect_name', value: 'Besoin de conseils',       icon: 'help-circle' },
                { textKey: 'opt_ready',  nextStep: 'collect_name', value: 'Prêt à rédiger statuts',  icon: 'edit'        },
            ]
        },
        welcome_step: {
            messageKey: 'q_welcome_step',
            options: [
                { textKey: 'opt_already_here', nextStep: 'collect_name', value: 'Récemment installé',  icon: 'map-pin'  },
                { textKey: 'opt_coming_soon',  nextStep: 'collect_name', value: 'Installation future', icon: 'calendar' },
            ]
        },
        other_urgent: {
            messageKey: 'q_other_urgent',
            options: [
                { textKey: 'opt_urgent',     nextStep: 'whatsapp_direct', value: 'Urgent',     icon: 'alert-circle' },
                { textKey: 'opt_not_urgent', nextStep: 'collect_name',    value: 'Non urgent', icon: 'clock'        },
            ]
        },
    };

    let currentState   = 'welcome';
    let userInputData  = { name: '', email: '', message: '', service: '', details: [] };
    let chatWindowOpen = false;
    let inputLocked    = false;


    // ── I18N ───────────────────────────────────────────────────────
    function t(key, fallback) {
        if (window.currentTranslations?.chatbot?.[key]) return window.currentTranslations.chatbot[key];
        return (fallback !== undefined) ? fallback : null;
    }
    function formatString(str, params) {
        let result = str;
        for (const key in params) result = result.replace(`{${key}}`, params[key]);
        return result;
    }


    // ── DOM INIT ───────────────────────────────────────────────────
    function initDOM() {
        if (document.getElementById('chatbot-root')) return;

        const root = document.createElement('div');
        root.id = 'chatbot-root';
        root.innerHTML = `
            <button class="chatbot-trigger" aria-label="Ouvrir l'assistant virtuel">
                <div class="chatbot-trigger-icon-wrap">
                    <i data-lucide="message-square" class="chatbot-icon"></i>
                    <i data-lucide="x" class="chatbot-close-icon hidden"></i>
                </div>
            </button>
            <div class="chatbot-window hidden">
                <div class="chatbot-header">
                    <div class="chatbot-avatar">M</div>
                    <div class="chatbot-header-info">
                        <span class="chatbot-header-name">Assistant Malongui</span>
                        <span class="chatbot-header-status">En ligne</span>
                    </div>
                    <button class="chatbot-close-btn" aria-label="Fermer">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="chatbot-messages">
                    <div class="chatbot-messages-inner"></div>
                </div>
                <!-- INPUT TOUJOURS VISIBLE -->
                <div class="chatbot-input-container">
                    <input type="text" class="chatbot-input-field" placeholder="Écrivez votre message…">
                    <button class="chatbot-send-btn" aria-label="Envoyer">
                        <i data-lucide="send"></i>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(root);
        updateLucideIcons();

        root.querySelector('.chatbot-trigger').addEventListener('click', toggleChatWindow);
        root.querySelector('.chatbot-close-btn').addEventListener('click', () => toggleChatWindow(false));
        root.querySelector('.chatbot-send-btn').addEventListener('click', handleTextInputSubmit);
        root.querySelector('.chatbot-input-field').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleTextInputSubmit();
        });

        window._updateChatbot = () => {
            const f = document.querySelector('.chatbot-input-field');
            if (f) f.placeholder = t('placeholder', 'Écrivez votre message…');
            restartConversation();
        };

        restartConversation();
    }

    function toggleChatWindow(forceState) {
        const win   = document.querySelector('.chatbot-window');
        const trig  = document.querySelector('.chatbot-trigger');
        const iconN = trig.querySelector('.chatbot-icon');
        const iconC = trig.querySelector('.chatbot-close-icon');

        chatWindowOpen = typeof forceState === 'boolean' ? forceState : !chatWindowOpen;

        if (chatWindowOpen) {
            win.classList.remove('hidden');
            trig.classList.add('active');
            iconN.classList.add('hidden');
            iconC.classList.remove('hidden');
            document.querySelector('.chatbot-input-field').focus();
        } else {
            win.classList.add('hidden');
            trig.classList.remove('active');
            iconN.classList.remove('hidden');
            iconC.classList.add('hidden');
        }
    }

    function restartConversation() {
        currentState  = 'welcome';
        inputLocked   = false;
        userInputData = { name: '', email: '', message: '', service: '', details: [] };
        const input   = document.querySelector('.chatbot-input-field');
        if (input) { input.disabled = false; input.value = ''; }
        const inner   = document.querySelector('.chatbot-messages-inner');
        if (inner) { inner.innerHTML = ''; runStep(); }
    }


    // ── AFFICHAGE ──────────────────────────────────────────────────
    function addMessage(text, isBot = true) {
        const inner = document.querySelector('.chatbot-messages-inner');
        if (!inner) return;
        const msg = document.createElement('div');
        msg.className = `chat-msg ${isBot ? 'msg-bot' : 'msg-user'}`;
        msg.innerHTML = `<div class="chat-msg-bubble">${text.replace(/\n/g, '<br>')}</div>`;
        inner.appendChild(msg);
        scrollBottom();
    }

    function scrollBottom() {
        const area = document.querySelector('.chatbot-messages');
        if (area) area.scrollTop = area.scrollHeight;
    }

    function showTypingIndicator() {
        const inner = document.querySelector('.chatbot-messages-inner');
        if (!inner) return null;
        const el = document.createElement('div');
        el.className = 'chat-msg msg-bot typing-indicator';
        el.innerHTML = `<div class="chat-msg-bubble">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>`;
        inner.appendChild(el);
        scrollBottom();
        return el;
    }

    function removeTypingIndicator(el) {
        if (el && el.parentNode) el.parentNode.removeChild(el);
    }

    function botSay(text, then, extraDelay = 0) {
        const ind   = showTypingIndicator();
        const delay = typingDelay(text) + extraDelay;
        setTimeout(() => {
            removeTypingIndicator(ind);
            addMessage(text);
            if (typeof then === 'function') then();
        }, delay);
    }

    function reactThen(reactionKey, then) {
        const variants = REACTIONS[reactionKey];
        if (variants?.length) botSay(pick(variants), then);
        else setTimeout(then, 300);
    }

    // Désactive le champ pendant le traitement (évite double envoi)
    function lockInput() {
        inputLocked = true;
        const input = document.querySelector('.chatbot-input-field');
        if (input) input.disabled = true;
    }

    function unlockInput() {
        inputLocked = false;
        const input = document.querySelector('.chatbot-input-field');
        if (input) { input.disabled = false; input.focus(); }
    }

    function showOptions(options) {
        const inner = document.querySelector('.chatbot-messages-inner');
        if (!inner) return;

        const wrap = document.createElement('div');
        wrap.className = 'chatbot-options';

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'chat-opt-btn';
            btn.innerHTML = `${opt.icon ? `<i data-lucide="${opt.icon}"></i>` : ''}<span>${t(opt.textKey, opt.value)}</span>`;
            btn.addEventListener('click', () => {
                wrap.remove();
                const label = t(opt.textKey, opt.value);
                addMessage(label, false);
                if (currentState === 'welcome') userInputData.service = opt.value;
                else if (opt.value) userInputData.details.push(opt.value);
                currentState = opt.nextStep;
                reactThen(opt.nextStep, () => setTimeout(runStep, 300));
            });
            wrap.appendChild(btn);
        });

        inner.appendChild(wrap);
        updateLucideIcons();
        scrollBottom();
    }


    // ── MOTEUR DE FLOW ─────────────────────────────────────────────
    function runStep() {
        const flow = CHAT_FLOW[currentState];

        // États de saisie structurée : input déjà actif, on pose juste la question
        if (!flow) {
            if      (currentState === 'collect_name')    askCollectName();
            else if (currentState === 'collect_email')   askCollectEmail();
            else if (currentState === 'collect_message') askCollectMessage();
            else if (currentState === 'whatsapp_direct') handleUrgentWhatsApp();
            else if (currentState === 'submit_data')     handleSubmitData();
            return;
        }

        const rawText = currentState === 'welcome' ? getWelcomeMessage() : t(flow.messageKey, '...');
        botSay(rawText, () => {
            if (flow.options?.length) showOptions(flow.options);
            unlockInput(); // input disponible même pendant les étapes boutons
        });
    }

    // Questions de collecte — posent juste la question, l'input est déjà visible
    function askCollectName() {
        botSay(t('q_collect_name', 'Pour vous recontacter, quel est votre nom ? (optionnel)'), unlockInput);
    }

    function askCollectEmail() {
        const hasName = userInputData.name?.trim().length > 0;
        const msg = hasName
            ? formatString(t('q_collect_email', 'Merci {name} ! À quelle adresse e-mail vous répondre ?'), { name: userInputData.name.split(' ')[0] })
            : t('q_collect_email_anon', 'À quelle adresse e-mail souhaitez-vous recevoir notre réponse ?');
        botSay(msg, unlockInput);
    }

    function askCollectMessage() {
        botSay(t('q_collect_message', 'Avez-vous des précisions à ajouter ?'), () => {
            unlockInput();
            // Bouton "Rien à ajouter" affiché EN PLUS de l'input (les deux coexistent)
            const inner = document.querySelector('.chatbot-messages-inner');
            const wrap  = document.createElement('div');
            wrap.className = 'chatbot-options';

            const skipBtn = document.createElement('button');
            skipBtn.className = 'chat-opt-btn';
            skipBtn.innerHTML = `<i data-lucide="corner-down-right"></i><span>${t('opt_nothing_to_add', 'Rien à ajouter')}</span>`;
            skipBtn.addEventListener('click', () => {
                if (inputLocked) return;
                wrap.remove();
                lockInput();
                addMessage(t('opt_nothing_to_add', 'Rien à ajouter'), false);
                userInputData.message = '';
                currentState = 'submit_data';
                setTimeout(runStep, 400);
            });

            wrap.appendChild(skipBtn);
            inner.appendChild(wrap);
            updateLucideIcons();
            scrollBottom();
        });
    }


    // ── GESTIONNAIRE UNIQUE DE SAISIE LIBRE ───────────────────────
    // Appelé à CHAQUE envoi, quel que soit l'état courant.
    // Distingue : états structurés (nom/email/message) vs états à boutons (NLP).

    function handleTextInputSubmit() {
        if (inputLocked) return;

        const input = document.querySelector('.chatbot-input-field');
        const val   = input.value.trim();
        if (!val) return;

        input.value = '';
        lockInput();
        addMessage(val, false);

        // ── États structurés : traitement direct ──────────────────
        if (currentState === 'collect_name') {
            if (isRefusal(val)) {
                userInputData.name = '';
                botSay("Pas de problème, on continue sans votre nom.", () => {
                    currentState = 'collect_email';
                    setTimeout(runStep, 300);
                });
            } else {
                userInputData.name = val;
                const prenom = val.split(' ')[0];
                botSay(`Enchanté, ${prenom} ! 😊`, () => {
                    currentState = 'collect_email';
                    setTimeout(runStep, 300);
                });
            }
            return;
        }

        if (currentState === 'collect_email') {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                botSay(t('invalid_email', 'Hmm, cette adresse e-mail ne semble pas valide. Pouvez-vous la vérifier ?'), unlockInput);
            } else {
                userInputData.email = val;
                currentState = 'collect_message';
                botSay(t('ack_email', 'Reçu !'), () => setTimeout(runStep, 300));
            }
            return;
        }

        if (currentState === 'collect_message') {
            userInputData.message = val;
            currentState = 'submit_data';
            setTimeout(runStep, 400);
            return;
        }

        // ── Tous les autres états : NLP libre ─────────────────────
        const intent = detectFreeIntent(val);

        if (intent) {
            // Reconnu → réaction + redirection dans le flow
            intent.action();
            botSay(intent.ack, () => setTimeout(runStep, 400));
        } else {
            // Non reconnu → réponse humaine + on repose les boutons du step actuel
            const fallbacks = [
                "Je ne suis pas sûr de bien comprendre — vous pouvez utiliser les boutons ou me reformuler votre besoin 😊",
                "Hmm, je ne saisis pas tout à fait. Pouvez-vous préciser ? Ou choisissez une option ci-dessus.",
                "Je préfère vous orienter correctement — dites-moi simplement ce qui vous amène ou cliquez sur une option.",
            ];
            botSay(pick(fallbacks), () => {
                unlockInput();
                // Réaffiche les boutons du step courant s'il y en a
                const flow = CHAT_FLOW[currentState];
                if (flow?.options?.length) showOptions(flow.options);
            });
        }
    }


    // ── CAS SPÉCIAUX ───────────────────────────────────────────────
    function handleUrgentWhatsApp() {
        const msg = t('urgent_wa_msg', "Puisque votre demande est urgente, contactez-nous directement sur WhatsApp — on vous répond dans les plus brefs délais :");
        botSay(msg, () => {
            const inner = document.querySelector('.chatbot-messages-inner');
            const wrap  = document.createElement('div');
            wrap.className = 'chatbot-options';
            const waBtn = document.createElement('a');
            waBtn.className = 'chat-opt-btn cta-whatsapp-link';
            waBtn.href      = "https://wa.me/41783535360?text=Bonjour%2C%20j'ai%20une%20demande%20urgente%20concernant%20vos%20services.";
            waBtn.target    = '_blank';
            waBtn.innerHTML = `${whatsappSVG}<span>${t('cta_whatsapp', 'Discuter sur WhatsApp')}</span>`;
            wrap.appendChild(waBtn);
            inner.appendChild(wrap);
            scrollBottom();
            unlockInput();
        });
    }

    function handleSubmitData() {
        const serviceName = userInputData.service;
        const subchoices  = userInputData.details.join(' / ');
        const customMsg   = userInputData.message || '(Aucun commentaire)';
        const subjectLine = `[Chat Malongui] ${serviceName}${subchoices ? ' — ' + subchoices : ''}`;
        const messageBody = `[Message venant du chat Malongui]\n\nProfil : ${serviceName} / ${subchoices || 'Général'}\nCommentaire : "${customMsg}"`;

        botSay(t('sending', "Parfait, j'envoie votre demande…"), () => {
            const contactForm = document.getElementById('contact-form');
            if (contactForm) {
                const nameInput     = document.getElementById('form-name');
                const emailInput    = document.getElementById('form-email');
                const subjectSelect = document.getElementById('form-subject');
                const msgTextarea   = document.getElementById('form-message');

                if (nameInput)   nameInput.value   = userInputData.name;
                if (emailInput)  emailInput.value  = userInputData.email;
                if (msgTextarea) msgTextarea.value = messageBody;

                if (subjectSelect) {
                    if      (serviceName.includes('impôt') || serviceName.includes('Tax'))        subjectSelect.value = 'impots';
                    else if (serviceName.includes('Compta') || serviceName.includes('Acc'))       subjectSelect.value = 'comptabilite';
                    else if (serviceName.includes('admin')  || serviceName.includes('Admin'))     subjectSelect.value = 'admin';
                    else                                                                           subjectSelect.value = 'autre';
                }

                const submitBtn = document.getElementById('form-submit-btn');
                if (submitBtn) submitBtn.click();
                else contactForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            } else {
                console.log('Chatbot lead:', {
                    name: userInputData.name,
                    email: userInputData.email,
                    subject: subjectLine,
                    message: messageBody
                });
            }

            setTimeout(showFinalSuccess, 1800);
        });
    }

    function showFinalSuccess() {
        const inner   = document.querySelector('.chatbot-messages-inner');
        const lastMsg = inner?.lastChild;
        if (lastMsg?.textContent?.includes('envoie')) lastMsg.remove();

        const hasName    = userInputData.name?.trim().length > 0;
        const prenom     = hasName ? userInputData.name.split(' ')[0] : '';
        const successMsg = hasName
            ? t('success', `Votre demande a bien été envoyée, ${prenom} ! 🎉 On revient vers vous très rapidement.`)
            : t('success_anon', "Votre demande a bien été envoyée ! 🎉 On revient vers vous très rapidement.");

        botSay(successMsg.replace('{name}', prenom), () => {
            botSay(
                t('success_follow', 'En attendant, vous pouvez réserver un créneau ou nous écrire sur WhatsApp :'),
                () => {
                    const wrap = document.createElement('div');
                    wrap.className = 'chatbot-options chatbot-final-ctas';

                    const bookBtn = document.createElement('a');
                    bookBtn.className = 'chat-opt-btn cta-booking-link';
                    bookBtn.href      = 'https://outlook.office.com/book/Rservationderendezvous@malongui.ch/';
                    bookBtn.target    = '_blank';
                    bookBtn.innerHTML = `<i data-lucide="calendar"></i><span>${t('cta_booking', 'Prendre rendez-vous')}</span>`;

                    const waBtn = document.createElement('a');
                    waBtn.className = 'chat-opt-btn cta-whatsapp-link';
                    waBtn.href      = "https://wa.me/41783535360?text=Bonjour%2C%20je%20viens%20d'envoyer%20un%20message%20via%20le%20chatbot.";
                    waBtn.target    = '_blank';
                    waBtn.innerHTML = `${whatsappSVG}<span>${t('cta_whatsapp', 'Discuter sur WhatsApp')}</span>`;

                    wrap.appendChild(bookBtn);
                    wrap.appendChild(waBtn);
                    inner.appendChild(wrap);
                    updateLucideIcons();
                    scrollBottom();
                    unlockInput();
                },
                400
            );
        });
    }


    // ── BOOT ───────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDOM);
    } else {
        initDOM();
    }
    setTimeout(initDOM, 500);
    window.resetChatbot = restartConversation;

})();

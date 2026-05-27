// /js/chatbot.js
// Malongui Consulting — Chatbot Préqualification
// Réécriture : réactions contextuelles, délais humains, ton conversationnel

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


    // ── RÉACTIONS CONTEXTUELLES ────────────────────────────────────
    // Déclenchées APRÈS le choix de l'utilisateur, AVANT la question suivante.
    // Clé = nextStep vers lequel on s'apprête à aller.
    // Plusieurs variantes → piochées au hasard pour éviter l'effet robot.

    const REACTIONS = {
        // Après avoir choisi le service principal
        tax_who:         ["D'accord, on s'occupe de votre déclaration d'impôts.", "Parfait, c'est l'une de nos spécialités !"],
        compta_status:   ["Très bien, la comptabilité c'est notre cœur de métier.", "Noté — on va voir ça ensemble."],
        admin_type:      ["Pas de problème, on gère ce type de démarche régulièrement."],
        creation_step:   ["Super, la création d'entreprise c'est une belle étape ! 🎉"],
        welcome_step:    ["Bienvenue en Suisse ! On est là pour faciliter votre installation. 😊"],
        other_urgent:    ["Compris, dites-moi en un peu plus."],

        // Après profil familial
        tax_kids:        ["Noté, je prends en compte votre situation."],
        tax_extra:       ["Très bien."],

        // Après détails comptabilité
        compta_need:     ["D'accord, je vois exactement ce qu'il vous faut."],

        // Après détails administratif
        collect_name:    ["Parfait, on y est presque !"],

        // Après type de création
        collect_name_creation: ["Excellent, on va pouvoir vous orienter précisément."],

        // Après timing pack bienvenue
        collect_name_welcome:  ["On va s'assurer que votre installation se passe bien."],

        // Après urgence autre demande
        whatsapp_direct: ["Je comprends, on ne va pas perdre de temps."],
    };

    function pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // Délai proportionnel à la longueur du message — effet frappe humain
    function typingDelay(text) {
        return Math.min(400 + (text ? text.length * 18 : 0), 2000);
    }


    // ── FLOW ───────────────────────────────────────────────────────

    const CHAT_FLOW = {
        welcome: {
            messageKey: 'welcome',
            options: [
                { textKey: 'opt_tax',      nextStep: 'tax_who',        value: 'Déclaration d\'impôt',          icon: 'file-text'   },
                { textKey: 'opt_compta',   nextStep: 'compta_status',  value: 'Comptabilité',                  icon: 'bar-chart-2' },
                { textKey: 'opt_admin',    nextStep: 'admin_type',     value: 'Accompagnement administratif',  icon: 'pen-tool'    },
                { textKey: 'opt_creation', nextStep: 'creation_step',  value: 'Création d\'entreprise',        icon: 'briefcase'   },
                { textKey: 'opt_welcome',  nextStep: 'welcome_step',   value: 'Pack Bienvenue',                icon: 'globe'       },
                { textKey: 'opt_other',    nextStep: 'other_urgent',   value: 'Autre demande',                 icon: 'help-circle' },
            ]
        },

        // Impôts
        tax_who: {
            messageKey: 'q_tax_who',
            options: [
                { textKey: 'opt_single', nextStep: 'tax_kids', value: 'Personne seule',  icon: 'user'  },
                { textKey: 'opt_couple', nextStep: 'tax_kids', value: 'Couple marié',    icon: 'users' },
            ]
        },
        tax_kids: {
            messageKey: 'q_tax_kids',
            options: [
                { textKey: 'opt_yes', nextStep: 'tax_extra', value: 'Avec enfants mineurs',  icon: 'check' },
                { textKey: 'opt_no',  nextStep: 'tax_extra', value: 'Sans enfant mineur',    icon: 'minus' },
            ]
        },
        tax_extra: {
            messageKey: 'q_tax_extra',
            options: [
                { textKey: 'opt_real_estate', nextStep: 'collect_name', value: 'Propriété immobilière', icon: 'home'       },
                { textKey: 'opt_securities',  nextStep: 'collect_name', value: 'Titres ou placements',  icon: 'trending-up'},
                { textKey: 'opt_none',        nextStep: 'collect_name', value: 'Rien de particulier',   icon: 'circle'     },
            ]
        },

        // Comptabilité
        compta_status: {
            messageKey: 'q_compta_status',
            options: [
                { textKey: 'opt_independent', nextStep: 'compta_need', value: 'Indépendant',               icon: 'user'        },
                { textKey: 'opt_company',     nextStep: 'compta_need', value: 'Société Sàrl/SA',           icon: 'briefcase'   },
                { textKey: 'opt_creating',    nextStep: 'compta_need', value: 'En cours de création/Autre',icon: 'plus-circle' },
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

        // Administratif
        admin_type: {
            messageKey: 'q_admin_type',
            options: [
                { textKey: 'opt_letters',  nextStep: 'collect_name', value: 'Rédaction courriers',     icon: 'mail'           },
                { textKey: 'opt_forms',    nextStep: 'collect_name', value: 'Remplissage formulaires', icon: 'file-text'      },
                { textKey: 'opt_disputes', nextStep: 'collect_name', value: 'Litige / correspondance', icon: 'alert-triangle' },
            ]
        },

        // Création entreprise
        creation_step: {
            messageKey: 'q_creation_step',
            options: [
                { textKey: 'opt_advice', nextStep: 'collect_name', value: 'Besoin de conseils',      icon: 'help-circle' },
                { textKey: 'opt_ready',  nextStep: 'collect_name', value: 'Prêt à rédiger statuts', icon: 'edit'        },
            ]
        },

        // Pack bienvenue
        welcome_step: {
            messageKey: 'q_welcome_step',
            options: [
                { textKey: 'opt_already_here',  nextStep: 'collect_name', value: 'Récemment installé', icon: 'map-pin'  },
                { textKey: 'opt_coming_soon',   nextStep: 'collect_name', value: 'Installation future',icon: 'calendar' },
            ]
        },

        // Autre demande
        other_urgent: {
            messageKey: 'q_other_urgent',
            options: [
                { textKey: 'opt_urgent',     nextStep: 'whatsapp_direct', value: 'Urgent',     icon: 'alert-circle' },
                { textKey: 'opt_not_urgent', nextStep: 'collect_name',    value: 'Non urgent', icon: 'clock'        },
            ]
        },
    };

    let currentState = 'welcome';
    let userInputData = { name: '', email: '', message: '', service: '', details: [] };
    let chatWindowOpen = false;


    // ── I18N ───────────────────────────────────────────────────────

    function t(key, fallback) {
        if (window.currentTranslations?.chatbot?.[key]) {
            return window.currentTranslations.chatbot[key];
        }
        return fallback || key;
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
                <div class="chatbot-input-container hidden">
                    <input type="text" class="chatbot-input-field" placeholder="Écrivez ici...">
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
            if (f) f.placeholder = t('placeholder', 'Écrivez ici...');
            restartConversation();
        };

        restartConversation();
    }

    function toggleChatWindow(forceState) {
        const win     = document.querySelector('.chatbot-window');
        const trigger = document.querySelector('.chatbot-trigger');
        const iconN   = trigger.querySelector('.chatbot-icon');
        const iconC   = trigger.querySelector('.chatbot-close-icon');

        chatWindowOpen = typeof forceState === 'boolean' ? forceState : !chatWindowOpen;

        if (chatWindowOpen) {
            win.classList.remove('hidden');
            trigger.classList.add('active');
            iconN.classList.add('hidden');
            iconC.classList.remove('hidden');
            const ic = document.querySelector('.chatbot-input-container');
            if (!ic.classList.contains('hidden')) document.querySelector('.chatbot-input-field').focus();
        } else {
            win.classList.add('hidden');
            trigger.classList.remove('active');
            iconN.classList.remove('hidden');
            iconC.classList.add('hidden');
        }
    }

    function restartConversation() {
        currentState  = 'welcome';
        userInputData = { name: '', email: '', message: '', service: '', details: [] };
        const inner   = document.querySelector('.chatbot-messages-inner');
        if (inner) { inner.innerHTML = ''; runStep(); }
    }


    // ── AFFICHAGE ──────────────────────────────────────────────────

    function addMessage(text, isBot = true) {
        const inner = document.querySelector('.chatbot-messages-inner');
        if (!inner) return;
        const msg = document.createElement('div');
        msg.className = `chat-msg ${isBot ? 'msg-bot' : 'msg-user'}`;
        msg.innerHTML = `<div class="chat-msg-bubble">${text}</div>`;
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

    // Affiche un message bot avec délai de frappe proportionnel
    function botSay(text, then, extraDelay = 0) {
        const ind   = showTypingIndicator();
        const delay = typingDelay(text) + extraDelay;
        setTimeout(() => {
            removeTypingIndicator(ind);
            addMessage(text);
            if (typeof then === 'function') then();
        }, delay);
    }

    // Affiche une réaction puis enchaîne (optionnel)
    function reactThen(reactionKey, then) {
        const variants = REACTIONS[reactionKey];
        if (variants && variants.length) {
            botSay(pick(variants), then);
        } else {
            // Pas de réaction définie → on enchaîne directement après un léger délai
            setTimeout(then, 300);
        }
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

                // Sauvegarde des données
                if (currentState === 'welcome') userInputData.service = opt.value;
                else if (opt.value) userInputData.details.push(opt.value);

                // Réaction contextuelle → puis étape suivante
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
        const ic   = document.querySelector('.chatbot-input-container');
        ic.classList.add('hidden');

        if (!flow) {
            // États spéciaux (saisie libre / actions)
            if      (currentState === 'collect_name')    showTextInput('q_collect_name');
            else if (currentState === 'collect_email')   showTextInput('q_collect_email', { name: userInputData.name });
            else if (currentState === 'collect_message') showTextInput('q_collect_message', null, true);
            else if (currentState === 'whatsapp_direct') handleUrgentWhatsApp();
            else if (currentState === 'submit_data')     handleSubmitData();
            return;
        }

        const msgText = t(flow.messageKey, '...');
        botSay(msgText, () => {
            if (flow.options?.length) showOptions(flow.options);
        });
    }

    function showTextInput(messageKey, params = null, withSkip = false) {
        const ic    = document.querySelector('.chatbot-input-container');
        const input = document.querySelector('.chatbot-input-field');

        let msgText = t(messageKey, '...');
        if (params) msgText = formatString(msgText, params);

        botSay(msgText, () => {
            ic.classList.remove('hidden');
            input.value       = '';
            input.placeholder = t('placeholder', 'Écrivez ici...');
            input.focus();

            if (withSkip) {
                const inner = document.querySelector('.chatbot-messages-inner');
                const wrap  = document.createElement('div');
                wrap.className = 'chatbot-options';

                const skipBtn = document.createElement('button');
                skipBtn.className = 'chat-opt-btn';
                skipBtn.innerHTML = `<i data-lucide="corner-down-right"></i><span>${t('opt_nothing_to_add', 'Rien à ajouter')}</span>`;
                skipBtn.addEventListener('click', () => {
                    wrap.remove();
                    addMessage(t('opt_nothing_to_add', 'Rien à ajouter'), false);
                    userInputData.message = '';
                    currentState = 'submit_data';
                    ic.classList.add('hidden');
                    setTimeout(runStep, 400);
                });

                wrap.appendChild(skipBtn);
                inner.appendChild(wrap);
                updateLucideIcons();
                scrollBottom();
            }
        });
    }

    function handleTextInputSubmit() {
        const ic    = document.querySelector('.chatbot-input-container');
        const input = document.querySelector('.chatbot-input-field');
        const val   = input.value.trim();
        if (!val) return;

        ic.classList.add('hidden');
        addMessage(val, false);

        if (currentState === 'collect_name') {
            userInputData.name = val;
            // Réaction personnalisée avec le prénom
            const reaction = `Enchanté, ${val} ! 😊`;
            currentState = 'collect_email';
            botSay(reaction, () => setTimeout(runStep, 300));

        } else if (currentState === 'collect_email') {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                botSay(t('invalid_email', 'Hmm, cette adresse email ne semble pas valide. Pouvez-vous la vérifier ?'), () => {
                    ic.classList.remove('hidden');
                    input.focus();
                });
            } else {
                userInputData.email = val;
                currentState = 'collect_message';
                // Réaction à l'email
                botSay(t('ack_email', 'Noté !'), () => setTimeout(runStep, 300));
            }

        } else if (currentState === 'collect_message') {
            userInputData.message = val;
            currentState = 'submit_data';
            setTimeout(runStep, 400);
        }
    }


    // ── CAS SPÉCIAUX ───────────────────────────────────────────────

    function handleUrgentWhatsApp() {
        const msg = t('urgent_wa_msg', 'Puisque votre demande est urgente, contactez-nous directement sur WhatsApp — on vous répond dans les plus brefs délais :');
        botSay(msg, () => {
            const inner = document.querySelector('.chatbot-messages-inner');
            const wrap  = document.createElement('div');
            wrap.className = 'chatbot-options';

            const waBtn = document.createElement('a');
            waBtn.className = 'chat-opt-btn cta-whatsapp-link';
            waBtn.href      = 'https://wa.me/41783535360?text=Bonjour%2C%20j\'ai%20une%20demande%20urgente%20concernant%20vos%20services.';
            waBtn.target    = '_blank';
            waBtn.innerHTML = `${whatsappSVG}<span>${t('cta_whatsapp', 'Discuter sur WhatsApp')}</span>`;
            wrap.appendChild(waBtn);

            inner.appendChild(wrap);
            scrollBottom();
        });
    }

    function handleSubmitData() {
        const serviceName  = userInputData.service;
        const subchoices   = userInputData.details.join(' / ');
        const customMsg    = userInputData.message || '(Aucun commentaire)';
        const subjectLine  = `[Chat Malongui] ${serviceName}${subchoices ? ' — ' + subchoices : ''}`;
        const messageBody  = `[Message venant du chat Malongui]\n\nProfil : ${serviceName} / ${subchoices || 'Général'}\nCommentaire : "${customMsg}"`;

        botSay(t('sending', 'Parfait, j\'envoie votre demande…'), () => {
            const contactForm = document.getElementById('contact-form');
            if (contactForm) {
                const nameInput      = document.getElementById('form-name');
                const emailInput     = document.getElementById('form-email');
                const subjectSelect  = document.getElementById('form-subject');
                const msgTextarea    = document.getElementById('form-message');

                if (nameInput)    nameInput.value    = userInputData.name;
                if (emailInput)   emailInput.value   = userInputData.email;
                if (msgTextarea)  msgTextarea.value  = messageBody;

                if (subjectSelect) {
                    if (serviceName.includes('impôt') || serviceName.includes('Tax'))         subjectSelect.value = 'impots';
                    else if (serviceName.includes('Compta') || serviceName.includes('Acc'))   subjectSelect.value = 'comptabilite';
                    else if (serviceName.includes('admin') || serviceName.includes('Admin'))  subjectSelect.value = 'admin';
                    else                                                                       subjectSelect.value = 'autre';
                }

                const submitBtn = document.getElementById('form-submit-btn');
                if (submitBtn) submitBtn.click();
                else contactForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            } else {
                // Mode simulation (pages sans formulaire)
                console.log('Chatbot lead:', { name: userInputData.name, email: userInputData.email, subject: subjectLine, message: messageBody });
            }

            setTimeout(showFinalSuccess, 1800);
        });
    }

    function showFinalSuccess() {
        // Retire le "j'envoie..."
        const inner   = document.querySelector('.chatbot-messages-inner');
        const lastMsg = inner?.lastChild;
        if (lastMsg?.textContent?.includes('envoie')) lastMsg.remove();

        // Message de confirmation chaleureux
        const successMsg = t('success', `Votre demande a bien été envoyée, ${userInputData.name || ''} ! 🎉 On revient vers vous très rapidement.`);
        botSay(successMsg.replace('{name}', userInputData.name || ''), () => {
            // Message de suivi
            botSay(t('success_follow', 'En attendant, vous pouvez aussi réserver directement un créneau ou nous écrire sur WhatsApp :'), () => {
                const wrap = document.createElement('div');
                wrap.className = 'chatbot-options chatbot-final-ctas';

                const bookBtn = document.createElement('a');
                bookBtn.className = 'chat-opt-btn cta-booking-link';
                bookBtn.href      = 'https://outlook.office.com/book/Rservationderendezvous@malongui.ch/';
                bookBtn.target    = '_blank';
                bookBtn.innerHTML = `<i data-lucide="calendar"></i><span>${t('cta_booking', 'Prendre rendez-vous')}</span>`;

                const waBtn = document.createElement('a');
                waBtn.className = 'chat-opt-btn cta-whatsapp-link';
                waBtn.href      = 'https://wa.me/41783535360?text=Bonjour%2C%20je%20viens%20d\'envoyer%20un%20message%20via%20le%20chatbot.';
                waBtn.target    = '_blank';
                waBtn.innerHTML = `${whatsappSVG}<span>${t('cta_whatsapp', 'Discuter sur WhatsApp')}</span>`;

                wrap.appendChild(bookBtn);
                wrap.appendChild(waBtn);
                inner.appendChild(wrap);
                updateLucideIcons();
                scrollBottom();
            }, 400);
        });
    }


    // ── BOOT ───────────────────────────────────────────────────────

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDOM);
    } else {
        initDOM();
    }

    setTimeout(initDOM, 500); // fallback i18n tardif

    window.resetChatbot = restartConversation;

})();

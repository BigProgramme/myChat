// /js/chatbot.js
// Custom Prequalification Chatbot for Malongui Consulting
https://lskbqk34-5500.uks1.devtunnels.ms/
(function () {
    // Brand WhatsApp SVG path
    const whatsappSVG = `<svg class="chat-opt-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="15" height="15" fill="currentColor" style="display:inline-block;vertical-align:middle;margin-right:2px;">
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
    </svg>`;

    function updateLucideIcons() {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    }

    // Dynamic CSS variables and basic configuration
    const CHAT_FLOW = {
        welcome: {
            messageKey: 'welcome',
            options: [
                { textKey: 'opt_tax', nextStep: 'tax_who', value: 'Déclaration d\'impôt', icon: 'file-text' },
                { textKey: 'opt_compta', nextStep: 'compta_status', value: 'Comptabilité', icon: 'bar-chart-2' },
                { textKey: 'opt_admin', nextStep: 'admin_type', value: 'Accompagnement administratif', icon: 'pen-tool' },
                { textKey: 'opt_creation', nextStep: 'creation_step', value: 'Création d\'entreprise', icon: 'briefcase' },
                { textKey: 'opt_welcome', nextStep: 'welcome_step', value: 'Pack Bienvenue', icon: 'globe' },
                { textKey: 'opt_other', nextStep: 'other_urgent', value: 'Autre demande', icon: 'help-circle' }
            ]
        },
        // Tax branch
        tax_who: {
            messageKey: 'q_tax_who',
            options: [
                { textKey: 'opt_single', nextStep: 'tax_kids', value: 'Personne seule', icon: 'user' },
                { textKey: 'opt_couple', nextStep: 'tax_kids', value: 'Couple marié', icon: 'users' }
            ]
        },
        tax_kids: {
            messageKey: 'q_tax_kids',
            options: [
                { textKey: 'opt_yes', nextStep: 'tax_extra', value: 'Avec enfants mineurs', icon: 'check' },
                { textKey: 'opt_no', nextStep: 'tax_extra', value: 'Sans enfant mineur', icon: 'minus' }
            ]
        },
        tax_extra: {
            messageKey: 'q_tax_extra',
            options: [
                { textKey: 'opt_real_estate', nextStep: 'collect_name', value: 'Propriété immobilière', icon: 'home' },
                { textKey: 'opt_securities', nextStep: 'collect_name', value: 'Titres ou placements', icon: 'trending-up' },
                { textKey: 'opt_none', nextStep: 'collect_name', value: 'Rien de particulier', icon: 'circle' }
            ]
        },
        // Accounting branch
        compta_status: {
            messageKey: 'q_compta_status',
            options: [
                { textKey: 'opt_independent', nextStep: 'compta_need', value: 'Indépendant', icon: 'user' },
                { textKey: 'opt_company', nextStep: 'compta_need', value: 'Société Sàrl/SA', icon: 'briefcase' },
                { textKey: 'opt_creating', nextStep: 'compta_need', value: 'En cours de création/Autre', icon: 'plus-circle' }
            ]
        },
        compta_need: {
            messageKey: 'q_compta_need',
            options: [
                { textKey: 'opt_full_bookkeeping', nextStep: 'collect_name', value: 'Tenue complète', icon: 'book-open' },
                { textKey: 'opt_closings', nextStep: 'collect_name', value: 'Bouclements', icon: 'file-check' },
                { textKey: 'opt_vat_advice', nextStep: 'collect_name', value: 'TVA / Conseils', icon: 'percent' }
            ]
        },
        // Administrative branch
        admin_type: {
            messageKey: 'q_admin_type',
            options: [
                { textKey: 'opt_letters', nextStep: 'collect_name', value: 'Rédaction courriers', icon: 'mail' },
                { textKey: 'opt_forms', nextStep: 'collect_name', value: 'Remplissage formulaires', icon: 'file-text' },
                { textKey: 'opt_disputes', nextStep: 'collect_name', value: 'Litige / correspondance', icon: 'alert-triangle' }
            ]
        },
        // Company creation branch
        creation_step: {
            messageKey: 'q_creation_step',
            options: [
                { textKey: 'opt_advice', nextStep: 'collect_name', value: 'Besoin de conseils', icon: 'help-circle' },
                { textKey: 'opt_ready', nextStep: 'collect_name', value: 'Prêt à rédiger statuts', icon: 'edit' }
            ]
        },
        // Welcome Pack branch
        welcome_step: {
            messageKey: 'q_welcome_step',
            options: [
                { textKey: 'opt_already_here', nextStep: 'collect_name', value: 'Récemment installé', icon: 'map-pin' },
                { textKey: 'opt_coming_soon', nextStep: 'collect_name', value: 'Installation future', icon: 'calendar' }
            ]
        },
        // Other request branch
        other_urgent: {
            messageKey: 'q_other_urgent',
            options: [
                { textKey: 'opt_urgent', nextStep: 'whatsapp_direct', value: 'Urgent', icon: 'alert-circle' },
                { textKey: 'opt_not_urgent', nextStep: 'collect_name', value: 'Non urgent', icon: 'clock' }
            ]
        }
    };

    let currentState = 'welcome';
    let userInputData = {
        name: '',
        email: '',
        message: '',
        service: '',
        details: []
    };

    let chatWindowOpen = false;

    // Helper functions for translation
    function getTranslation(key, defaultValue) {
        if (window.currentTranslations && window.currentTranslations.chatbot && window.currentTranslations.chatbot[key]) {
            return window.currentTranslations.chatbot[key];
        }
        return defaultValue;
    }

    function formatString(str, params) {
        let result = str;
        for (const key in params) {
            result = result.replace(`{${key}}`, params[key]);
        }
        return result;
    }

    // Build the chatbot HTML elements dynamically
    function initDOM() {
        if (document.getElementById('chatbot-root')) return;

        const root = document.createElement('div');
        root.id = 'chatbot-root';
        root.innerHTML = `
            <!-- Floating Bubble -->
            <button class="chatbot-trigger" aria-label="Ouvrir l'assistant virtuel">
                <div class="chatbot-trigger-icon-wrap">
                    <i data-lucide="message-square" class="chatbot-icon"></i>
                    <i data-lucide="x" class="chatbot-close-icon hidden"></i>
                </div>
            </button>
            
            <!-- Chat Window -->
            <div class="chatbot-window hidden">
                <!-- Header -->
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
                
                <!-- Messages Area -->
                <div class="chatbot-messages">
                    <div class="chatbot-messages-inner"></div>
                </div>
                
                <!-- Input Container -->
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

        // Bind events
        const trigger = root.querySelector('.chatbot-trigger');
        const closeBtn = root.querySelector('.chatbot-close-btn');
        const inputField = root.querySelector('.chatbot-input-field');
        const sendBtn = root.querySelector('.chatbot-send-btn');

        trigger.addEventListener('click', toggleChatWindow);
        closeBtn.addEventListener('click', () => toggleChatWindow(false));

        sendBtn.addEventListener('click', handleTextInputSubmit);
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleTextInputSubmit();
        });

        // Expose update handler for language switches
        window._updateChatbot = () => {
            // Re-translate current view
            const inputField = document.querySelector('.chatbot-input-field');
            if (inputField) {
                inputField.placeholder = getTranslation('placeholder', 'Écrivez ici...');
            }
            restartConversation();
        };

        // Run initial step
        restartConversation();
    }

    function toggleChatWindow(forceState) {
        const win = document.querySelector('.chatbot-window');
        const trigger = document.querySelector('.chatbot-trigger');
        const iconNormal = trigger.querySelector('.chatbot-icon');
        const iconClose = trigger.querySelector('.chatbot-close-icon');
        
        chatWindowOpen = (typeof forceState === 'boolean') ? forceState : !chatWindowOpen;

        if (chatWindowOpen) {
            win.classList.remove('hidden');
            trigger.classList.add('active');
            iconNormal.classList.add('hidden');
            iconClose.classList.remove('hidden');
            // Focus on input field if visible
            const inputContainer = document.querySelector('.chatbot-input-container');
            if (!inputContainer.classList.contains('hidden')) {
                document.querySelector('.chatbot-input-field').focus();
            }
        } else {
            win.classList.add('hidden');
            trigger.classList.remove('active');
            iconNormal.classList.remove('hidden');
            iconClose.classList.add('hidden');
        }
    }

    function restartConversation() {
        currentState = 'welcome';
        userInputData = { name: '', email: '', message: '', service: '', details: [] };
        
        const inner = document.querySelector('.chatbot-messages-inner');
        if (inner) {
            inner.innerHTML = '';
            runStep();
        }
    }

    function addMessage(text, isBot = true) {
        const inner = document.querySelector('.chatbot-messages-inner');
        if (!inner) return;

        const msg = document.createElement('div');
        msg.className = `chat-msg ${isBot ? 'msg-bot' : 'msg-user'}`;
        msg.innerHTML = `<div class="chat-msg-bubble">${text}</div>`;
        inner.appendChild(msg);

        // Scroll to bottom
        const messagesArea = document.querySelector('.chatbot-messages');
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    function showTypingIndicator() {
        const inner = document.querySelector('.chatbot-messages-inner');
        if (!inner) return;

        const indicator = document.createElement('div');
        indicator.className = 'chat-msg msg-bot typing-indicator';
        indicator.innerHTML = `
            <div class="chat-msg-bubble">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        `;
        inner.appendChild(indicator);
        
        const messagesArea = document.querySelector('.chatbot-messages');
        messagesArea.scrollTop = messagesArea.scrollHeight;
        return indicator;
    }

    function removeTypingIndicator(indicator) {
        if (indicator && indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    }

    function showOptions(options) {
        const inner = document.querySelector('.chatbot-messages-inner');
        if (!inner) return;

        const optsWrap = document.createElement('div');
        optsWrap.className = 'chatbot-options';
        
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'chat-opt-btn';
            
            let btnInner = '';
            if (opt.icon) {
                btnInner += `<i data-lucide="${opt.icon}"></i>`;
            }
            btnInner += `<span>${getTranslation(opt.textKey, opt.value)}</span>`;
            btn.innerHTML = btnInner;

            btn.addEventListener('click', () => {
                // Remove the option buttons completely
                optsWrap.remove();
                
                // Show user answer in bubbles
                addMessage(getTranslation(opt.textKey, opt.value), false);
                
                // Set data
                if (currentState === 'welcome') {
                    userInputData.service = opt.value;
                } else if (opt.value) {
                    userInputData.details.push(opt.value);
                }
                
                // Advance
                currentState = opt.nextStep;
                setTimeout(runStep, 400);
            });
            optsWrap.appendChild(btn);
        });

        inner.appendChild(optsWrap);
        updateLucideIcons();
        
        const messagesArea = document.querySelector('.chatbot-messages');
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    function runStep() {
        const flow = CHAT_FLOW[currentState];
        const inputContainer = document.querySelector('.chatbot-input-container');

        // Hide text input by default
        inputContainer.classList.add('hidden');

        if (!flow) {
            // Special input-driven states
            if (currentState === 'collect_name') {
                showTextInput('q_collect_name');
            } else if (currentState === 'collect_email') {
                showTextInput('q_collect_email', { name: userInputData.name });
            } else if (currentState === 'collect_message') {
                showTextInput('q_collect_message', null, true); // show nothing to add option
            } else if (currentState === 'whatsapp_direct') {
                handleUrgentWhatsApp();
            } else if (currentState === 'submit_data') {
                handleSubmitData();
            }
            return;
        }

        // Show typing indicator for a human-like delay
        const indicator = showTypingIndicator();
        setTimeout(() => {
            removeTypingIndicator(indicator);
            addMessage(getTranslation(flow.messageKey, '...'));
            if (flow.options && flow.options.length > 0) {
                showOptions(flow.options);
            }
        }, 600);
    }

    function showTextInput(messageKey, params = null, withSkip = false) {
        const inputContainer = document.querySelector('.chatbot-input-container');
        const inputField = document.querySelector('.chatbot-input-field');
        
        const indicator = showTypingIndicator();
        
        setTimeout(() => {
            removeTypingIndicator(indicator);
            
            let messageText = getTranslation(messageKey, '...');
            if (params) {
                messageText = formatString(messageText, params);
            }
            addMessage(messageText);
            
            // Show input container
            inputContainer.classList.remove('hidden');
            inputField.value = '';
            inputField.placeholder = getTranslation('placeholder', 'Écrivez ici...');
            inputField.focus();
            
            if (withSkip) {
                // Offer quick option "Rien à ajouter"
                const optsWrap = document.createElement('div');
                optsWrap.className = 'chatbot-options';
                const skipBtn = document.createElement('button');
                skipBtn.className = 'chat-opt-btn';
                skipBtn.innerHTML = `<i data-lucide="corner-down-right"></i><span>${getTranslation('opt_nothing_to_add', 'Rien à ajouter')}</span>`;
                skipBtn.addEventListener('click', () => {
                    // Remove the option buttons completely
                    optsWrap.remove();
                    
                    addMessage(getTranslation('opt_nothing_to_add', 'Rien à ajouter'), false);
                    userInputData.message = '';
                    currentState = 'submit_data';
                    inputContainer.classList.add('hidden');
                    setTimeout(runStep, 400);
                });
                optsWrap.appendChild(skipBtn);
                document.querySelector('.chatbot-messages-inner').appendChild(optsWrap);
                updateLucideIcons();
                
                const messagesArea = document.querySelector('.chatbot-messages');
                messagesArea.scrollTop = messagesArea.scrollHeight;
            }
        }, 600);
    }

    function handleTextInputSubmit() {
        const inputField = document.querySelector('.chatbot-input-field');
        const inputContainer = document.querySelector('.chatbot-input-container');
        const val = inputField.value.trim();
        
        if (!val) return;
        
        // Hide input temporarily during transitions
        inputContainer.classList.add('hidden');
        addMessage(val, false);

        if (currentState === 'collect_name') {
            userInputData.name = val;
            currentState = 'collect_email';
            setTimeout(runStep, 400);
        } else if (currentState === 'collect_email') {
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(val)) {
                addMessage(getTranslation('opt_yes') === 'Yes' ? 'Please enter a valid email address.' : 'Veuillez saisir une adresse e-mail valide.');
                setTimeout(() => {
                    inputContainer.classList.remove('hidden');
                    inputField.focus();
                }, 400);
            } else {
                userInputData.email = val;
                currentState = 'collect_message';
                setTimeout(runStep, 400);
            }
        } else if (currentState === 'collect_message') {
            userInputData.message = val;
            currentState = 'submit_data';
            setTimeout(runStep, 400);
        }
    }

    function handleUrgentWhatsApp() {
        const indicator = showTypingIndicator();
        setTimeout(() => {
            removeTypingIndicator(indicator);
            
            const message = getTranslation('opt_yes') === 'Yes' 
                ? 'Your request is urgent. We invite you to contact us directly on WhatsApp:' 
                : 'Puisque votre demande est urgente, nous vous invitons à nous contacter directement sur WhatsApp :';
            addMessage(message);
            
            const optsWrap = document.createElement('div');
            optsWrap.className = 'chatbot-options';
            
            const waBtn = document.createElement('a');
            waBtn.className = 'chat-opt-btn cta-whatsapp-link';
            waBtn.href = 'https://wa.me/41783535360?text=Bonjour%2C%20j\'ai%20une%20demande%20urgente%20concernant%20vos%20services.';
            waBtn.target = '_blank';
            waBtn.innerHTML = `${whatsappSVG}<span>${getTranslation('cta_whatsapp', 'Discuter sur WhatsApp')}</span>`;
            optsWrap.appendChild(waBtn);
            
            document.querySelector('.chatbot-messages-inner').appendChild(optsWrap);
        }, 600);
    }

    function handleSubmitData() {
        const indicator = showTypingIndicator();
        setTimeout(() => {
            removeTypingIndicator(indicator);
            addMessage(getTranslation('sending', 'Envoi en cours...'));
            
            // Format the message body
            const serviceName = userInputData.service;
            const subchoices = userInputData.details.join(' / ');
            const customMessage = userInputData.message ? userInputData.message : '(Aucun commentaire)';
            
            const subjectLine = `[Chat Malongui] ${serviceName}${subchoices ? ' — ' + subchoices : ''}`;
            const messageBody = `[Message venant du chat Malongui]\n\nProfil : ${serviceName} / ${subchoices || 'Général'}\nCommentaire du client : "${customMessage}"`;

            // Try to submit via index.html form
            const contactForm = document.getElementById('contact-form');
            if (contactForm) {
                // Populate existing form fields
                const nameInput = document.getElementById('form-name');
                const emailInput = document.getElementById('form-email');
                const subjectSelect = document.getElementById('form-subject');
                const messageTextarea = document.getElementById('form-message');

                if (nameInput) nameInput.value = userInputData.name;
                if (emailInput) emailInput.value = userInputData.email;
                if (messageTextarea) messageTextarea.value = messageBody;

                // Map select option
                if (subjectSelect) {
                    if (serviceName.includes('impôt') || serviceName.includes('Tax')) {
                        subjectSelect.value = 'impots';
                    } else if (serviceName.includes('Compta') || serviceName.includes('Acc')) {
                        subjectSelect.value = 'comptabilite';
                    } else if (serviceName.includes('admin') || serviceName.includes('Admin')) {
                        subjectSelect.value = 'admin';
                    } else {
                        subjectSelect.value = 'autre';
                    }
                }

                // Dispatch submit event (which triggers our main.js submit logic)
                const submitBtn = document.getElementById('form-submit-btn');
                if (submitBtn) {
                    submitBtn.click();
                } else {
                    contactForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }
                
                // Show final success screen in chatbot after simulated delay
                setTimeout(showFinalSuccess, 1800);
            } else {
                // Simulated submission (for service pages where form is not present)
                console.log('Chatbot Simulated Form Submission:', {
                    name: userInputData.name,
                    email: userInputData.email,
                    subject: subjectLine,
                    message: messageBody
                });
                setTimeout(showFinalSuccess, 1800);
            }
        }, 600);
    }

    function showFinalSuccess() {
        const inner = document.querySelector('.chatbot-messages-inner');
        if (!inner) return;

        // Clear loading message
        const lastMsg = inner.lastChild;
        if (lastMsg && lastMsg.textContent.includes('Envoi')) {
            lastMsg.remove();
        }

        addMessage(getTranslation('success', 'Votre message a bien été envoyé !'));
        
        // Show follow-up CTAs (Booking & WhatsApp)
        const optsWrap = document.createElement('div');
        optsWrap.className = 'chatbot-options chatbot-final-ctas';
        
        const bookingBtn = document.createElement('a');
        bookingBtn.className = 'chat-opt-btn cta-booking-link';
        bookingBtn.href = 'https://outlook.office.com/book/Rservationderendezvous@malongui.ch/';
        bookingBtn.target = '_blank';
        bookingBtn.innerHTML = `<i data-lucide="calendar"></i><span>${getTranslation('cta_booking', 'Prendre rendez-vous')}</span>`;
        optsWrap.appendChild(bookingBtn);

        const waBtn = document.createElement('a');
        waBtn.className = 'chat-opt-btn cta-whatsapp-link';
        waBtn.href = 'https://wa.me/41783535360?text=Bonjour%2C%20je%20viens%20d\'envoyer%20un%20message%20via%20le%20chatbot.';
        waBtn.target = '_blank';
        waBtn.innerHTML = `${whatsappSVG}<span>${getTranslation('cta_whatsapp', 'Discuter sur WhatsApp')}</span>`;
        optsWrap.appendChild(waBtn);
        
        inner.appendChild(optsWrap);
        updateLucideIcons();
        
        const messagesArea = document.querySelector('.chatbot-messages');
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    // Initialize once page is loaded and translations exist
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDOM);
    } else {
        initDOM();
    }

    // Fallback trigger if i18n is not loaded yet
    setTimeout(initDOM, 500);

    // Setup global access to reset
    window.resetChatbot = restartConversation;

})();

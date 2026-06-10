// ==========================================================================
// PREDICAFRICA APP ENGINE
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. DATA INITIALIZATION & STATE MANAGEMENT
    // ----------------------------------------------------------------------
    const defaultPredictions = [
        {
            id: 'pred-1',
            category: 'politics',
            title: "Présidentielle au Sénégal : Qui succédera à Bassirou Diomaye Faye ?",
            description: "Le scrutin présidentiel déterminera le prochain chef de l'État du Sénégal. Le marché sera résolu selon les résultats officiels proclamés par le Conseil Constitutionnel.",
            options: ["Candidat Coalition Clé", "Autre Candidat"],
            odds: [1.85, 2.10],
            totalPool: 4500000,
            expiry: "2026-06-30",
            status: "active"
        },
        {
            id: 'pred-2',
            category: 'music',
            title: "Grammy Awards 2027 : Burna Boy va-t-il remporter un trophée majeur ?",
            description: "Concerne les catégories majeures (Album de l'année, Chanson de l'année, ou Meilleure performance de musique globale). Résolu selon l'annonce officielle des Grammy Awards en février 2027.",
            options: ["Oui, un Grammy", "Non, aucun prix"],
            odds: 1.65, // Let's keep it uniform as array: [1.65, 2.30]
            odds: [1.65, 2.30],
            totalPool: 1200000,
            expiry: "2027-02-15",
            status: "active"
        },
        {
            id: 'pred-3',
            category: 'economy',
            title: "Zone CEDEAO : La monnaie unique 'ECO' sera-t-elle lancée en 2027 ?",
            description: "Tranché Oui si au moins trois pays membres de la CEDEAO adoptent officiellement l'ECO comme monnaie fiduciaire d'ici fin 2027. Tranché Non sinon.",
            options: ["Oui, adoption effective", "Non, projet repoussé"],
            odds: [2.80, 1.45],
            totalPool: 6200000,
            expiry: "2027-12-31",
            status: "active"
        },
        {
            id: 'pred-4',
            category: 'cinema',
            title: "FESPACO 2027 : Alain Gomis remportera-t-il l'Étalon d'Or de Yennenga ?",
            description: "Résolution basée sur le palmarès officiel de la 30ème édition du FESPACO à Ouagadougou. Si le film du réalisateur sénégalais remporte le grand prix de fiction, l'option Oui gagne.",
            options: ["Oui, Étalon d'Or", "Non, un autre film"],
            odds: [2.25, 1.60],
            totalPool: 850000,
            expiry: "2027-03-05",
            status: "active"
        },
        {
            id: 'pred-5',
            category: 'economy',
            title: "Nigeria : Le PIB va-t-il enregistrer une croissance supérieure à 4.2% en 2026 ?",
            description: "Le marché se base sur le rapport officiel consolidé de la Banque Mondiale ou du Bureau National des Statistiques (NBS) du Nigeria pour l'exercice 2026.",
            options: ["Oui, > 4.2%", "Non, <= 4.2%"],
            odds: [1.90, 1.90],
            totalPool: 2400000,
            expiry: "2026-12-31",
            status: "active"
        },
        {
            id: 'pred-6',
            category: 'music',
            title: "Wizkid et Tems sortiront-ils un projet collaboratif (EP ou Album) en 2026 ?",
            description: "Un projet d'au moins 5 titres crédité conjointement aux deux artistes sur les plateformes de streaming d'ici le 31 décembre 2026.",
            options: ["Oui, projet commun", "Non, singles uniquement"],
            odds: [2.40, 1.50],
            totalPool: 1100000,
            expiry: "2026-12-25",
            status: "active"
        }
    ];

    // Countries config with currencies and operators mapping
    const countriesConfig = {
        SEN: { name: "Sénégal", currency: "XOF", operators: ["orange", "wave"] },
        CIV: { name: "Côte d'Ivoire", currency: "XOF", operators: ["orange", "mtn", "moov", "wave"] },
        CMR: { name: "Cameroun", currency: "XAF", operators: ["orange", "mtn"] },
        COD: { name: "RDC", currency: "CDF", operators: ["orange", "airtel", "mtn"] }, // MTN mapped to M-Pesa
        COG: { name: "Congo Brazzaville", currency: "XAF", operators: ["mtn", "airtel"] },
        GAB: { name: "Gabon", currency: "XAF", operators: ["airtel", "moov"] },
        BEN: { name: "Bénin", currency: "XOF", operators: ["mtn", "moov"] },
        TGO: { name: "Togo", currency: "XOF", operators: ["moov", "mtn"] } // MTN mapped to T-Money
    };

    // State Variables loaded from localStorage
    let selectedCountry = localStorage.getItem('pa_country') || 'SEN';
    let balance = parseFloat(localStorage.getItem('pa_balance')) || 15000;
    let username = localStorage.getItem('pa_username') || 'Ablaye Diop';
    let predictions = JSON.parse(localStorage.getItem('pa_predictions')) || defaultPredictions;
    let userBets = JSON.parse(localStorage.getItem('pa_user_bets')) || [];
    let transactions = JSON.parse(localStorage.getItem('pa_transactions')) || [
        {
            id: 'PA-TX-0000001',
            date: new Date(Date.now() - 3600000 * 24).toLocaleString('fr-FR'),
            type: 'Dépôt',
            operator: 'Système',
            amount: 15000,
            currency: 'XOF',
            balanceAfter: 15000,
            status: 'Succès'
        }
    ];

    // Persist changes helper
    function saveState() {
        localStorage.setItem('pa_country', selectedCountry);
        localStorage.setItem('pa_balance', balance);
        localStorage.setItem('pa_username', username);
        localStorage.setItem('pa_predictions', JSON.stringify(predictions));
        localStorage.setItem('pa_user_bets', JSON.stringify(userBets));
        localStorage.setItem('pa_transactions', JSON.stringify(transactions));
    }

    function getCurrencySymbol() {
        return countriesConfig[selectedCountry] ? countriesConfig[selectedCountry].currency : 'FCFA';
    }

    // ----------------------------------------------------------------------
    // 2. SPA NAVIGATION SYSTEM
    // ----------------------------------------------------------------------
    const navItems = document.querySelectorAll('.nav-menu__item');
    const sections = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetView = item.getAttribute('data-view');
            switchView(targetView);
        });
    });

    function switchView(viewId) {
        // Update navigation active state
        navItems.forEach(nav => {
            if (nav.getAttribute('data-view') === viewId) {
                nav.classList.add('active');
            } else {
                nav.classList.remove('active');
            }
        });

        // Switch visible section
        sections.forEach(sec => {
            if (sec.getAttribute('id') === `view-${viewId}`) {
                sec.classList.add('active');
            } else {
                sec.classList.remove('active');
            }
        });

        // Refresh views on active switch
        if (viewId === 'dashboard') {
            renderPredictions('all', '');
        } else if (viewId === 'my-bets') {
            renderMyBets('all');
        } else if (viewId === 'transactions') {
            renderTransactions();
        } else if (viewId === 'backoffice') {
            updateAdminStats();
            renderAdminMarkets();
            renderAdminTraders();
        }

        // Scroll to top
        window.scrollTo(0, 0);
    }

    // ----------------------------------------------------------------------
    // 3. UI RENDERING ENGINE & WALLET UTILITIES
    // ----------------------------------------------------------------------
    const userBalanceEl = document.getElementById('user-balance');
    const activeBetsCountEl = document.getElementById('active-bets-count');

    // Format currency Helper
    function formatCurrency(amount) {
        return new Intl.NumberFormat('fr-FR').format(amount);
    }

    // Update global wallet balance indicator
    function updateWalletUI() {
        const currency = getCurrencySymbol();
        userBalanceEl.textContent = formatCurrency(balance);
        
        // Sync profile name
        const profileNameEl = document.getElementById('user-profile-name');
        if (profileNameEl) profileNameEl.textContent = username;
        
        // Update currency code label inside sidebar balance widget
        const balanceCurrencyEl = document.querySelector('.wallet-widget__balance .balance-currency');
        if (balanceCurrencyEl) balanceCurrencyEl.textContent = currency;
        
        // Count active bets
        const pendingCount = userBets.filter(b => b.status === 'pending' || b.status === 'won').length;
        if (pendingCount > 0) {
            activeBetsCountEl.textContent = pendingCount;
            activeBetsCountEl.style.display = 'inline';
        } else {
            activeBetsCountEl.style.display = 'none';
        }

        // Dashboard Stats elements
        const totalVolumeEl = document.getElementById('stat-total-volume');
        const activeBetsEl = document.getElementById('stat-active-bets');
        const paidWinnersEl = document.getElementById('stat-paid-winners');

        if (totalVolumeEl) {
            // Sum predictions pools
            const sumPools = predictions.reduce((sum, p) => sum + p.totalPool, 0);
            totalVolumeEl.textContent = `${formatCurrency(sumPools)} ${currency}`;
        }
        if (activeBetsEl) {
            // Count total bets registered
            activeBetsEl.textContent = userBets.length + 384; // adding mock baseline
        }
        if (paidWinnersEl) {
            // Sum claims
            const claims = transactions.filter(t => t.type === 'Gain').reduce((sum, t) => sum + t.amount, 0);
            paidWinnersEl.textContent = `${formatCurrency(claims + 8920000)} ${currency}`; // adding mock baseline
        }
    }

    // Render Catalogue
    const predictionsCatalog = document.getElementById('predictions-catalog');
    
    function renderPredictions(categoryFilter = 'all', searchQ = '') {
        if (!predictionsCatalog) return;
        predictionsCatalog.innerHTML = '';

        const query = searchQ.toLowerCase().trim();
        const currency = getCurrencySymbol();
        
        const filtered = predictions.filter(item => {
            const matchesCat = (categoryFilter === 'all' || item.category === categoryFilter);
            const matchesSearch = !query || 
                item.title.toLowerCase().includes(query) || 
                item.description.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query);
            return matchesCat && matchesSearch;
        });

        if (filtered.length === 0) {
            predictionsCatalog.innerHTML = `
                <div class="empty-state">
                    Aucun marché de prédiction ne correspond à votre recherche.
                </div>
            `;
            return;
        }

        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = `predict-card`;
            card.setAttribute('data-id', item.id);

            const statusClass = item.status === 'active' ? 'status-badge--active' : 'status-badge--resolved';
            const statusLabel = item.status === 'active' ? 'Actif' : 'Résolu';
            
            let categoryLabel = item.category;
            if (item.category === 'politics') categoryLabel = 'Politique';
            if (item.category === 'economy') categoryLabel = 'Économie';
            if (item.category === 'music') categoryLabel = 'Musique';
            if (item.category === 'cinema') categoryLabel = 'Cinéma';

            card.innerHTML = `
                <div class="predict-card__header">
                    <span class="category-tag category-tag--${item.category}">${categoryLabel}</span>
                    <span class="status-badge ${statusClass}">${statusLabel}</span>
                </div>
                <h4 class="predict-card__question">${item.title}</h4>
                <div class="predict-card__odds">
                    <button class="btn btn--odds" data-choice="0">
                        <span class="odds-label">${item.options[0]}</span>
                        <span class="odds-val">${item.odds[0].toFixed(2)}</span>
                    </button>
                    <button class="btn btn--odds" data-choice="1">
                        <span class="odds-label">${item.options[1]}</span>
                        <span class="odds-val">${item.odds[1].toFixed(2)}</span>
                    </button>
                </div>
                <div class="predict-card__meta">
                    <span>Volume : <strong>${formatCurrency(item.totalPool)} ${currency}</strong></span>
                    <span>Fin : <strong>${formatDateString(item.expiry)}</strong></span>
                </div>
            `;

            // Bind click to place bet buttons
            const oddsButtons = card.querySelectorAll('.btn--odds');
            oddsButtons.forEach(btn => {
                if (item.status !== 'active') {
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                    btn.style.cursor = 'not-allowed';
                    return;
                }
                
                btn.addEventListener('click', () => {
                    const choiceIndex = parseInt(btn.getAttribute('data-choice'));
                    openBetModal(item, choiceIndex);
                });
            });

            predictionsCatalog.appendChild(card);
        });
    }

    // Helper Date Formatter
    function formatDateString(str) {
        const parts = str.split('-');
        if (parts.length !== 3) return str;
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    // ----------------------------------------------------------------------
    // 4. CATEGORIES & SEARCH FILTER HANDLERS
    // ----------------------------------------------------------------------
    const categoryPills = document.querySelectorAll('.category-pill');
    const searchInput = document.getElementById('search-predictions');

    let activeCategory = 'all';
    let activeSearch = '';

    categoryPills.forEach(pill => {
        pill.addEventListener('click', () => {
            categoryPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activeCategory = pill.getAttribute('data-category');
            renderPredictions(activeCategory, activeSearch);
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            activeSearch = e.target.value;
            renderPredictions(activeCategory, activeSearch);
        });
    }

    // ----------------------------------------------------------------------
    // 5. MOBILE MONEY RECHARGE SYSTEM (SIMULATION)
    // ----------------------------------------------------------------------
    const btnRechargeTrigger = document.getElementById('btn-recharge-trigger');
    const modalRecharge = document.getElementById('modal-recharge');
    const rechargeClose = document.getElementById('recharge-close');
    const rechargeModalCard = document.getElementById('recharge-modal-card');
    
    const rechargeSteps = document.querySelectorAll('.recharge-step');
    const operatorCardBtns = document.querySelectorAll('.operator-card-btn');
    
    const rechargeSubmitForm = document.getElementById('recharge-submit-form');
    const selectedOperatorVal = document.getElementById('selected-operator-val');
    const rechargeFormTitle = document.getElementById('recharge-form-title');
    const phonePrefixLabel = document.getElementById('phone-prefix-label');
    const rechargePhoneInput = document.getElementById('recharge-phone');
    const rechargeAmountInput = document.getElementById('recharge-amount');
    
    let activeOperatorConfig = {}; // Active operator context

    // Preset deposit values
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            rechargeAmountInput.value = btn.getAttribute('data-value');
        });
    });

    // Close Modals Helper
    function closeAllModals() {
        modalRecharge.classList.remove('active');
        modalPlaceBet.classList.remove('active');
    }

    // Filter operator buttons based on selected country
    function updateOperatorGrid() {
        const countryData = countriesConfig[selectedCountry];
        const operatorGrid = document.querySelector('.operator-grid');
        if (!operatorGrid) return;
        
        const opButtons = operatorGrid.querySelectorAll('.operator-card-btn');
        opButtons.forEach(btn => {
            const opKey = btn.getAttribute('data-operator');
            
            if (countryData.operators.includes(opKey)) {
                btn.style.display = 'flex';
                
                const nameEl = btn.querySelector('.operator-name');
                const logoEl = btn.querySelector('.operator-logo');
                
                if (selectedCountry === 'TGO' && opKey === 'mtn') {
                    if (nameEl) nameEl.textContent = 'T-Money';
                    if (logoEl) logoEl.textContent = 'TM';
                } else if (selectedCountry === 'COD' && opKey === 'mtn') {
                    if (nameEl) nameEl.textContent = 'M-Pesa';
                    if (logoEl) logoEl.textContent = 'MP';
                } else {
                    const defaults = {
                        orange: { name: 'Orange Money', logo: 'OM' },
                        mtn: { name: 'MTN MoMo', logo: 'MTN' },
                        airtel: { name: 'Airtel Money', logo: 'airtel' },
                        wave: { name: 'Wave', logo: 'wave' },
                        moov: { name: 'Moov Africa', logo: 'moov' }
                    };
                    if (nameEl) nameEl.textContent = defaults[opKey].name;
                    if (logoEl) logoEl.textContent = defaults[opKey].logo;
                }
            } else {
                btn.style.display = 'none';
            }
        });
    }

    btnRechargeTrigger.addEventListener('click', () => {
        updateOperatorGrid();
        goToRechargeStep(1);
        modalRecharge.classList.add('active');
    });

    rechargeClose.addEventListener('click', closeAllModals);

    // Click backdrop to close
    window.addEventListener('click', (e) => {
        if (e.target === modalRecharge || e.target === modalPlaceBet) {
            closeAllModals();
        }
    });

    function goToRechargeStep(stepNumber) {
        rechargeSteps.forEach(step => {
            if (step.getAttribute('id') === `recharge-step-${stepNumber}`) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    // Selecting Operator Card (Step 1)
    operatorCardBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const operator = btn.getAttribute('data-operator');
            const countryData = countriesConfig[selectedCountry];
            const currency = countryData.currency;
            
            let confName = '';
            let confLogo = '';
            let confPrefix = '';
            let confPlaceholder = '';
            let confPinInstruction = '';
            
            const prefixes = {
                SEN: '+221', CIV: '+225', CMR: '+237', COD: '+243',
                COG: '+242', GAB: '+241', BEN: '+229', TGO: '+228'
            };
            confPrefix = prefixes[selectedCountry] || '+221';

            if (selectedCountry === 'TGO' && operator === 'mtn') {
                confName = 'T-Money';
                confLogo = 'TM';
                confPlaceholder = '96 12 34 56';
                confPinInstruction = "Saisissez votre code PIN secret T-Money à 4 chiffres pour valider la transaction.";
            } else if (selectedCountry === 'COD' && operator === 'mtn') {
                confName = 'M-Pesa';
                confLogo = 'MP';
                confPlaceholder = '82 123 45 67';
                confPinInstruction = "Saisissez votre code PIN secret M-Pesa à 4 chiffres pour valider le transfert.";
            } else {
                const defaults = {
                    orange: { name: 'Orange Money', logo: 'OM', placeholder: '77 123 45 67', pin: 'Orange Money' },
                    mtn: { name: 'MTN MoMo', logo: 'MTN', placeholder: '61 23 45 67', pin: 'MTN MoMo' },
                    airtel: { name: 'Airtel Money', logo: 'airtel', placeholder: '74 12 34 56', pin: 'Airtel Money' },
                    wave: { name: 'Wave', logo: 'wave', placeholder: '70 123 45 67', pin: 'Wave' },
                    moov: { name: 'Moov Africa', logo: 'moov', placeholder: '90 12 34 56', pin: 'Moov Money' }
                };
                const def = defaults[operator];
                confName = def.name;
                confLogo = def.logo;
                confPlaceholder = def.placeholder;
                confPinInstruction = `Validez la demande en saisissant votre code secret ${def.pin} à 4 chiffres.`;
            }

            activeOperatorConfig = {
                key: operator,
                name: confName,
                logo: confLogo,
                prefix: confPrefix,
                placeholder: confPlaceholder,
                pinInstruction: confPinInstruction
            };

            // Apply visual operator class
            rechargeModalCard.className = `modal-card ussd-theme--${operator}`;
            
            // Set values
            selectedOperatorVal.value = operator;
            rechargeFormTitle.innerHTML = `<span class="text--emerald">${confName}</span> - Dépôt`;
            phonePrefixLabel.textContent = confPrefix;
            rechargePhoneInput.placeholder = confPlaceholder;
            rechargePhoneInput.value = '';
            rechargeAmountInput.value = '';

            const rechargeAmountLabel = document.querySelector('label[for="recharge-amount"]');
            if (rechargeAmountLabel) rechargeAmountLabel.textContent = `Montant du Dépôt (${currency})`;

            goToRechargeStep(2);
        });
    });

    // Back to Step 1
    document.getElementById('recharge-back-to-1').addEventListener('click', () => {
        rechargeModalCard.className = `modal-card`;
        goToRechargeStep(1);
    });

    // Submitting Phone & Amount Form (Step 2)
    rechargeSubmitForm.addEventListener('click', (e) => {
        // Check HTML5 validity
        if (!rechargeSubmitForm.checkValidity()) return;
        e.preventDefault();

        const amount = parseFloat(rechargeAmountInput.value);
        const currency = getCurrencySymbol();

        // Feeds the USSD step values
        document.getElementById('ussd-op-badge').textContent = activeOperatorConfig.name;
        document.getElementById('ussd-instruction-text').textContent = activeOperatorConfig.pinInstruction;
        document.getElementById('ussd-charge-amount').textContent = `${formatCurrency(amount)} ${currency}`;
        document.getElementById('ussd-pin-code').value = '';

        goToRechargeStep(3);
    });

    // Step 3 Confirmation (PIN Validation Simulation)
    const btnUssdConfirm = document.getElementById('btn-ussd-confirm');
    const btnUssdCancel = document.getElementById('btn-ussd-cancel');
    const ussdLoader = document.getElementById('ussd-loader');
    const ussdLoaderText = document.getElementById('ussd-loader-text');
    const ussdPinCodeInput = document.getElementById('ussd-pin-code');

    btnUssdCancel.addEventListener('click', () => {
        goToRechargeStep(2);
    });

    btnUssdConfirm.addEventListener('click', () => {
        const pin = ussdPinCodeInput.value;
        const amount = parseFloat(rechargeAmountInput.value);
        const currency = getCurrencySymbol();

        if (pin.length !== 4) {
            alert("Veuillez saisir un code PIN de sécurité à 4 chiffres.");
            return;
        }

        // Show GSM Spinner Simulation
        ussdLoader.classList.add('active');
        ussdLoaderText.textContent = "Validation réseau en cours...";

        setTimeout(() => {
            ussdLoaderText.textContent = `Retrait de ${formatCurrency(amount)} ${currency}...`;
            
            setTimeout(() => {
                // Perform balance increase
                balance += amount;
                
                // Add transaction history
                const txId = 'PA-TX-' + Math.floor(1000000 + Math.random() * 9000000);
                const txDate = new Date().toLocaleString('fr-FR');
                transactions.unshift({
                    id: txId,
                    date: txDate,
                    type: 'Dépôt',
                    operator: activeOperatorConfig.name,
                    amount: amount,
                    currency: currency,
                    balanceAfter: balance,
                    status: 'Succès'
                });
                
                // Save and update UI
                saveState();
                updateWalletUI();

                // Setup success step UI
                document.getElementById('success-deposited-amount').textContent = `${formatCurrency(amount)} ${currency}`;
                document.getElementById('success-op-name').textContent = activeOperatorConfig.name;
                document.getElementById('success-tx-id').textContent = txId;
                document.getElementById('success-new-balance').textContent = `${formatCurrency(balance)} ${currency}`;

                ussdLoader.classList.remove('active');
                goToRechargeStep(4);
            }, 1200);
        }, 1200);
    });

    // Done Success Flow
    document.getElementById('btn-recharge-done').addEventListener('click', () => {
        closeAllModals();
        rechargeModalCard.className = `modal-card`;
        // Navigate to transactions to check
        switchView('transactions');
    });

    // ----------------------------------------------------------------------
    // 6. BET PLACEMENT ENGINE
    // ----------------------------------------------------------------------
    const modalPlaceBet = document.getElementById('modal-place-bet');
    const betClose = document.getElementById('bet-close');
    
    const betModalCategory = document.getElementById('bet-modal-category');
    const betModalQuestion = document.getElementById('bet-modal-question');
    const betModalChoice = document.getElementById('bet-modal-choice');
    const betModalOdds = document.getElementById('bet-modal-odds');
    const betModalUserBalance = document.getElementById('bet-modal-user-balance');
    
    const betAmountInput = document.getElementById('bet-amount');
    const betPayoutVal = document.getElementById('bet-payout-val');
    const betPayoutOddsDesc = document.getElementById('bet-payout-odds-desc');
    const betErrorMsg = document.getElementById('bet-error-msg');
    
    const placeBetSubmitForm = document.getElementById('place-bet-submit-form');
    const betPredictionId = document.getElementById('bet-prediction-id');
    const betChoiceIndex = document.getElementById('bet-choice-index');

    betClose.addEventListener('click', closeAllModals);
    document.getElementById('btn-bet-cancel').addEventListener('click', closeAllModals);

    function openBetModal(prediction, choiceIndex) {
        betPredictionId.value = prediction.id;
        betChoiceIndex.value = choiceIndex;

        let categoryLabel = prediction.category;
        if (prediction.category === 'politics') categoryLabel = 'Politique';
        if (prediction.category === 'economy') categoryLabel = 'Économie';
        if (prediction.category === 'music') categoryLabel = 'Musique';
        if (prediction.category === 'cinema') categoryLabel = 'Cinéma';

        betModalCategory.textContent = categoryLabel;
        betModalCategory.className = `bet-category-badge category-tag--${prediction.category}`;
        betModalQuestion.textContent = prediction.title;
        
        const choiceText = prediction.options[choiceIndex];
        const oddsVal = prediction.odds[choiceIndex];
        const currency = getCurrencySymbol();
        
        betModalChoice.textContent = choiceText;
        betModalOdds.textContent = oddsVal.toFixed(2);
        betModalUserBalance.textContent = `${formatCurrency(balance)} ${currency}`;
        
        const betAmountLabel = document.getElementById('bet-amount-label');
        if (betAmountLabel) betAmountLabel.textContent = `Montant à investir (${currency})`;
        
        betAmountInput.placeholder = `Entrez le montant à investir en ${currency}`;
        betAmountInput.value = '';
        betPayoutVal.textContent = `0 ${currency}`;
        betPayoutOddsDesc.textContent = `@ ${oddsVal.toFixed(2)}`;
        betErrorMsg.style.display = 'none';

        modalPlaceBet.classList.add('active');
        setTimeout(() => betAmountInput.focus(), 150);
    }

    // Dynamic Bet Payout Estimator & Validation
    betAmountInput.addEventListener('input', () => {
        const amount = parseFloat(betAmountInput.value) || 0;
        const odds = parseFloat(betModalOdds.textContent);
        const currency = getCurrencySymbol();
        
        if (amount > balance) {
            betErrorMsg.textContent = `Solde du portefeuille insuffisant (${formatCurrency(balance)} ${currency} disponible).`;
            betErrorMsg.style.display = 'block';
        } else if (amount > 0 && amount < 200) {
            betErrorMsg.textContent = `L'investissement minimal est de 200 ${currency}.`;
            betErrorMsg.style.display = 'block';
        } else {
            betErrorMsg.style.display = 'none';
        }

        const payout = amount * odds;
        betPayoutVal.textContent = `${formatCurrency(Math.floor(payout))} ${currency}`;
    });

    // Betting All In (Max) Trigger
    document.getElementById('bet-btn-max').addEventListener('click', () => {
        betAmountInput.value = Math.floor(balance);
        // Trigger input event to update calculations
        betAmountInput.dispatchEvent(new Event('input'));
    });

    // Submitting Bet (Deduction & Registration)
    placeBetSubmitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const predId = betPredictionId.value;
        const choiceIdx = parseInt(betChoiceIndex.value);
        const amount = parseFloat(betAmountInput.value);
        const currency = getCurrencySymbol();
        
        if (amount > balance) {
            betErrorMsg.textContent = "Dépassement de votre solde disponible.";
            betErrorMsg.style.display = 'block';
            return;
        }

        if (amount < 200) {
            betErrorMsg.textContent = `Investissement minimum requis : 200 ${currency}.`;
            betErrorMsg.style.display = 'block';
            return;
        }

        // Deduct
        balance -= amount;
        
        // Find prediction
        const prediction = predictions.find(p => p.id === predId);
        // Increment prediction pool size
        prediction.totalPool += amount;

        // Record bet
        const betId = 'PA-POS-' + Math.floor(100000 + Math.random() * 90000);
        const odds = prediction.odds[choiceIdx];
        const possiblePayout = Math.floor(amount * odds);
        
        userBets.unshift({
            id: betId,
            predictionId: predId,
            question: prediction.title,
            choiceText: prediction.options[choiceIdx],
            odds: odds,
            amount: amount,
            payout: possiblePayout,
            currency: currency,
            status: 'pending',
            date: new Date().toLocaleString('fr-FR')
        });

        // Record transaction
        transactions.unshift({
            id: 'PA-TX-' + Math.floor(1000000 + Math.random() * 9000000),
            date: new Date().toLocaleString('fr-FR'),
            type: 'Achat',
            operator: 'Portefeuille',
            amount: -amount,
            currency: currency,
            balanceAfter: balance,
            status: 'Succès'
        });

        saveState();
        updateWalletUI();
        closeAllModals();

        alert("Votre position de marché a été validée avec succès !");
        
        // Update views
        renderPredictions(activeCategory, activeSearch);
        switchView('my-bets');
    });

    // ----------------------------------------------------------------------
    // 7. USER BETS RENDERING & CLAIM / SIMULATION LAWS
    // ----------------------------------------------------------------------
    const betsContainer = document.getElementById('bets-container');
    const betFilterTabs = document.querySelectorAll('.tab-btn');

    let activeBetFilter = 'all';

    betFilterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            betFilterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeBetFilter = tab.getAttribute('data-bet-filter');
            renderMyBets(activeBetFilter);
        });
    });

    function renderMyBets(filterStatus = 'all') {
        if (!betsContainer) return;
        betsContainer.innerHTML = '';

        const filtered = userBets.filter(b => {
            if (filterStatus === 'all') return true;
            if (filterStatus === 'active') return b.status === 'pending';
            if (filterStatus === 'resolved') return b.status === 'won' || b.status === 'lost' || b.status === 'claimed';
        });

        if (filtered.length === 0) {
            betsContainer.innerHTML = `
                <div class="empty-state">
                    Aucune position ouverte ou clôturée trouvée.
                </div>
            `;
            return;
        }

        filtered.forEach(bet => {
            const card = document.createElement('div');
            card.className = 'bet-card';

            let statusRibbonClass = '';
            let statusLabel = '';
            const cur = bet.currency || 'XOF';

            if (bet.status === 'pending') {
                statusRibbonClass = 'bet-status--pending';
                statusLabel = 'Active';
            } else if (bet.status === 'won') {
                statusRibbonClass = 'bet-status--won';
                statusLabel = 'Résolue positive (Non liquidée)';
            } else if (bet.status === 'claimed') {
                statusRibbonClass = 'bet-status--won';
                statusLabel = 'Clôturée - Liquidée';
            } else if (bet.status === 'lost') {
                statusRibbonClass = 'bet-status--lost';
                statusLabel = 'Expirée (Sans valeur)';
            }

            card.innerHTML = `
                <div class="bet-card__status-ribbon ${statusRibbonClass}">${statusLabel}</div>
                <div class="bet-card__top">
                    <h4 class="bet-card__title">${bet.question}</h4>
                </div>
                <div class="bet-card__details">
                    <div class="bet-detail-item">
                        <span>Option Sélectionnée</span>
                        <strong>${bet.choiceText}</strong>
                    </div>
                    <div class="bet-detail-item">
                        <span>Multiplicateur</span>
                        <strong class="text--gold">@ ${bet.odds.toFixed(2)}</strong>
                    </div>
                    <div class="bet-detail-item">
                        <span>Investissement</span>
                        <strong>${formatCurrency(bet.amount)} ${cur}</strong>
                    </div>
                    <div class="bet-detail-item">
                        <span>Rendement potentiel</span>
                        <strong class="text--emerald">${formatCurrency(bet.payout)} ${cur}</strong>
                    </div>
                </div>
                <div class="bet-card__meta font-sm text--muted" style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
                    <span>Date : ${bet.date}</span>
                    <span>Ref : ${bet.id}</span>
                </div>
                
                <div class="bet-card__action" style="display: flex; gap: var(--space-sm); margin-top: 8px; justify-content: flex-end;">
                    <!-- Simulation buttons visible only for active testing -->
                    ${bet.status === 'pending' ? `
                        <button class="btn btn--outline btn--block font-sm btn-simulate-win" style="padding: 4px var(--space-sm); width: auto;" data-id="${bet.id}">Simuler Résolution A</button>
                        <button class="btn btn--outline btn--block font-sm btn-simulate-loss" style="padding: 4px var(--space-sm); border-color: var(--accent-red-trans); color: var(--accent-red); width: auto;" data-id="${bet.id}">Simuler Résolution B</button>
                    ` : ''}
                    
                    ${bet.status === 'won' ? `
                        <button class="btn btn--primary btn--block font-sm btn-claim-payout" style="padding: var(--space-sm) var(--space-md); width: auto;" data-id="${bet.id}">
                            Liquider la position (+${formatCurrency(bet.payout)} ${cur})
                        </button>
                    ` : ''}
                </div>
            `;

            // Bind Actions
            const winBtn = card.querySelector('.btn-simulate-win');
            const lossBtn = card.querySelector('.btn-simulate-loss');
            const claimBtn = card.querySelector('.btn-claim-payout');

            if (winBtn) {
                winBtn.addEventListener('click', () => {
                    resolveBet(bet.id, true);
                });
            }

            if (lossBtn) {
                lossBtn.addEventListener('click', () => {
                    resolveBet(bet.id, false);
                });
            }

            if (claimBtn) {
                claimBtn.addEventListener('click', () => {
                    claimPayout(bet.id);
                });
            }

            betsContainer.appendChild(card);
        });
    }

    // Simulated bet resolution tool
    function resolveBet(betId, didWin) {
        const bet = userBets.find(b => b.id === betId);
        if (!bet) return;

        bet.status = didWin ? 'won' : 'lost';
        
        // Mark the base prediction as resolved too
        const pred = predictions.find(p => p.id === bet.predictionId);
        if (pred) {
            pred.status = 'resolved';
        }

        saveState();
        updateWalletUI();
        renderMyBets(activeBetFilter);
        
        alert(didWin ? 
            "Félicitations ! Le marché s'est résolu sur l'Option A. Vous pouvez maintenant liquider votre position !" : 
            "Le marché s'est résolu sur l'Option B. Votre investissement a expiré sans valeur."
        );
    }

    // Claim payout
    function claimPayout(betId) {
        const bet = userBets.find(b => b.id === betId);
        if (!bet || bet.status !== 'won') return;

        const cur = bet.currency || 'XOF';

        // Credit wallet
        balance += bet.payout;
        bet.status = 'claimed';

        // Log transaction
        transactions.unshift({
            id: 'PA-TX-' + Math.floor(1000000 + Math.random() * 9000000),
            date: new Date().toLocaleString('fr-FR'),
            type: 'Liquidation',
            operator: 'Portefeuille',
            amount: bet.payout,
            currency: cur,
            balanceAfter: balance,
            status: 'Succès'
        });

        saveState();
        updateWalletUI();
        renderMyBets(activeBetFilter);

        alert(`Liquidités de ${formatCurrency(bet.payout)} ${cur} créditées sur votre portefeuille !`);
    }

    // ----------------------------------------------------------------------
    // 8. RENDER TRANSACTIONS HISTORIQUE
    // ----------------------------------------------------------------------
    const transactionsTbody = document.getElementById('transactions-log-tbody');
    const transactionsEmptyState = document.getElementById('transactions-empty-state');

    function renderTransactions() {
        if (!transactionsTbody) return;
        transactionsTbody.innerHTML = '';

        if (transactions.length === 0) {
            transactionsEmptyState.style.display = 'block';
            return;
        }

        transactionsEmptyState.style.display = 'none';

        transactions.forEach(tx => {
            const tr = document.createElement('tr');
            
            let amountClass = 'text--emerald';
            let amountPrefix = '+';
            if (tx.amount < 0) {
                amountClass = 'text--red';
                amountPrefix = '';
            }

            tr.innerHTML = `
                <td><strong>${tx.id}</strong></td>
                <td>${tx.date}</td>
                <td><span class="badge">${tx.type}</span></td>
                <td>${tx.operator}</td>
                <td><strong class="${amountClass}">${amountPrefix}${formatCurrency(tx.amount)} ${tx.currency || 'FCFA'}</strong></td>
                <td><span class="status-txt-badge status-txt-badge--success">${tx.status}</span></td>
            `;

            transactionsTbody.appendChild(tr);
        });
    }

    // ----------------------------------------------------------------------
    // 9. DYNAMIC REAL-TIME ODDS VARIATOR (LIVE SIMULATION)
    // ----------------------------------------------------------------------
    setInterval(() => {
        // Check if simulation is enabled in backoffice admin
        const adminToggleSimOdds = document.getElementById('admin-toggle-sim-odds');
        const simOddsEnabled = adminToggleSimOdds ? adminToggleSimOdds.checked : true;
        if (!simOddsEnabled) return;

        // Pick a random prediction
        if (predictions.length === 0) return;
        const randIdx = Math.floor(Math.random() * predictions.length);
        const pred = predictions[randIdx];
        
        // Only vary active items
        if (pred.status !== 'active') return;

        // Shift odds slightly (+0.05 or -0.05)
        const shiftA = (Math.random() > 0.5 ? 0.05 : -0.05);
        
        // Recalculate A
        let newOddsA = parseFloat((pred.odds[0] + shiftA).toFixed(2));
        if (newOddsA < 1.05) newOddsA = 1.05;
        if (newOddsA > 8.00) newOddsA = 8.00;
        
        // Sum of reciprocal odds roughly constant
        // 1/Oa + 1/Ob = 1.10 (with house edge)
        // Ob = 1 / (1.10 - 1/Oa)
        let newOddsB = parseFloat((1 / (1.10 - (1 / newOddsA))).toFixed(2));
        if (newOddsB < 1.05 || isNaN(newOddsB)) newOddsB = 1.05;
        if (newOddsB > 8.00) newOddsB = 8.00;

        pred.odds = [newOddsA, newOddsB];
        
        // Slightly increase pool size
        pred.totalPool += Math.floor(1000 + Math.random() * 5000) * 10;

        saveState();
        
        // Re-render only if current view is dashboard
        const dashboardActive = document.getElementById('view-dashboard').classList.contains('active');
        if (dashboardActive) {
            renderPredictions(activeCategory, activeSearch);
            // Flash update on featured if matches
            if (pred.id === 'pred-1') {
                const yesOddsEl = document.getElementById('featured-odds-yes');
                const noOddsEl = document.getElementById('featured-odds-no');
                if (yesOddsEl) yesOddsEl.textContent = newOddsA.toFixed(2);
                if (noOddsEl) noOddsEl.textContent = newOddsB.toFixed(2);
            }
        }
    }, 15000); // Trigger every 15 seconds

    // Quick bind for featured banner buttons on dashboard
    const featuredBtnYes = document.getElementById('featured-btn-yes');
    const featuredBtnNo = document.getElementById('featured-btn-no');

    if (featuredBtnYes && featuredBtnNo) {
        featuredBtnYes.addEventListener('click', () => {
            const pred = predictions.find(p => p.id === 'pred-1');
            if (pred) openBetModal(pred, 0);
        });
        featuredBtnNo.addEventListener('click', () => {
            const pred = predictions.find(p => p.id === 'pred-1');
            if (pred) openBetModal(pred, 1);
        });
    }

    // ----------------------------------------------------------------------
    // 10. ADMIN/CREATOR SUBMISSION LOGIC
    // ----------------------------------------------------------------------
    const createPredictionForm = document.getElementById('create-prediction-form');

    if (createPredictionForm) {
        createPredictionForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = document.getElementById('create-title').value;
            const category = document.getElementById('create-category').value;
            const desc = document.getElementById('create-desc').value;
            const date = document.getElementById('create-date').value;
            const pool = parseFloat(document.getElementById('create-initial-pool').value) || 500000;
            
            const optYes = document.getElementById('create-opt-yes').value;
            const oddsYes = parseFloat(document.getElementById('create-odds-yes').value) || 1.85;
            const optNo = document.getElementById('create-opt-no').value;
            const oddsNo = parseFloat(document.getElementById('create-odds-no').value) || 1.95;

            const newId = 'pred-custom-' + Math.floor(10000 + Math.random() * 90000);
            
            // Insert
            predictions.unshift({
                id: newId,
                category: category,
                title: title,
                description: desc,
                options: [optYes, optNo],
                odds: [oddsYes, oddsNo],
                totalPool: pool,
                expiry: date,
                status: 'active'
            });

            saveState();
            
            // Reset and redirect
            createPredictionForm.reset();
            alert("Votre nouveau marché de prédiction a été publié avec succès !");
            
            switchView('dashboard');
        });
    }

    // ----------------------------------------------------------------------
    // 11. ROUTING SWITCHER & FAQ ACCORDION LOGIC
    // ----------------------------------------------------------------------
    const appLanding = document.getElementById('app-landing');
    const appWorkspace = document.getElementById('app-workspace');
    
    const btnEnterBourse = document.getElementById('btn-enter-bourse');
    const btnHeroStart = document.getElementById('btn-hero-start');
    const btnEnterAdminDirect = document.getElementById('btn-enter-admin-direct');
    const btnHeroAdmin = document.getElementById('btn-hero-admin');
    const btnLogoutTrigger = document.getElementById('btn-logout-trigger');

    function enterApp(initialView = 'dashboard') {
        if (appLanding) appLanding.style.display = 'none';
        if (appWorkspace) appWorkspace.style.display = 'block';
        switchView(initialView);
    }
    
    function leaveApp() {
        if (appWorkspace) appWorkspace.style.display = 'none';
        if (appLanding) appLanding.style.display = 'block';
        window.scrollTo(0, 0);
    }

    if (btnEnterBourse) btnEnterBourse.addEventListener('click', () => enterApp('dashboard'));
    if (btnHeroStart) btnHeroStart.addEventListener('click', () => enterApp('dashboard'));
    if (btnEnterAdminDirect) btnEnterAdminDirect.addEventListener('click', () => enterApp('backoffice'));
    if (btnHeroAdmin) btnHeroAdmin.addEventListener('click', () => enterApp('backoffice'));
    if (btnLogoutTrigger) btnLogoutTrigger.addEventListener('click', leaveApp);

    // FAQ Accordion Toggles
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const isActive = item.classList.contains('active');
            
            // Close other items
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // ----------------------------------------------------------------------
    // 12. WHATSAPP CHAT WIDGET LOGIC
    // ----------------------------------------------------------------------
    const whatsappToggle = document.getElementById('whatsapp-toggle');
    const whatsappChatWindow = document.getElementById('whatsapp-chat-window');
    const whatsappChatClose = document.getElementById('whatsapp-chat-close');
    const whatsappUserInput = document.getElementById('whatsapp-user-input');
    const whatsappSendBtn = document.getElementById('whatsapp-send-btn');
    const whatsappMessagesContainer = document.getElementById('whatsapp-messages-container');
    const whatsappBadge = document.querySelector('.whatsapp-badge');

    if (whatsappToggle) {
        whatsappToggle.addEventListener('click', () => {
            if (whatsappChatWindow) whatsappChatWindow.classList.add('active');
            if (whatsappBadge) whatsappBadge.style.display = 'none';
        });
    }

    if (whatsappChatClose) {
        whatsappChatClose.addEventListener('click', (e) => {
            e.stopPropagation();
            if (whatsappChatWindow) whatsappChatWindow.classList.remove('active');
        });
    }

    function appendWhatsAppMsg(text, type = 'received') {
        if (!whatsappMessagesContainer) return;
        const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg chat-msg--${type}`;
        msgDiv.innerHTML = `${text} <span class="msg-time">${time}</span>`;
        whatsappMessagesContainer.appendChild(msgDiv);
        whatsappMessagesContainer.scrollTop = whatsappMessagesContainer.scrollHeight;
    }

    function handleWhatsAppSend() {
        if (!whatsappUserInput) return;
        const query = whatsappUserInput.value.trim();
        if (!query) return;

        appendWhatsAppMsg(query, 'sent');
        whatsappUserInput.value = '';

        setTimeout(() => {
            let response = "Désolé, je n'ai pas bien compris. Tapez 'recharge', 'retrait' ou 'marché' pour obtenir des explications.";
            const q = query.toLowerCase();

            if (q.includes('recharge') || q.includes('depot') || q.includes('dépôt') || q.includes('payer')) {
                response = "Pour recharger : allez sur le Portefeuille (dans la bourse), cliquez sur 'Recharger', choisissez votre opérateur, tapez votre numéro et validez la notification push fictive avec un code secret à 4 chiffres (ex: 1234).";
            } else if (q.includes('retrait') || q.includes('retirer') || q.includes('argent') || q.includes('liquider')) {
                response = "Pour retirer vos fonds : liquidez vos positions gagnantes dans 'Mes Positions', puis cliquez sur 'Retirer' dans votre portefeuille. Choisissez votre opérateur Mobile Money local pour simuler le transfert vers votre mobile.";
            } else if (q.includes('cote') || q.includes('cotes') || q.includes('marché') || q.includes('prediction')) {
                response = "PredicAfrica est une bourse d'opinions. Les cotes varient en direct toutes les 15 secondes selon les tendances. Vous achetez des parts (Oui/Non) et revendez vos cotes à la clôture officielle.";
            } else if (q.includes('vrai') || q.includes('reel') || q.includes('réel') || q.includes('perdre')) {
                response = "Il s'agit d'un simulateur MVP de démonstration. Aucun argent réel n'est en jeu, vos transactions et gains sont 100% fictifs.";
            } else if (q.includes('bonjour') || q.includes('salut') || q.includes('hello')) {
                response = "Bonjour ! Je suis Ablaye de PredicAfrica. Que souhaitez-vous tester aujourd'hui ? (recharge, retrait, ou prise de position)";
            }

            appendWhatsAppMsg(response, 'received');
        }, 1000);
    }

    if (whatsappSendBtn) {
        whatsappSendBtn.addEventListener('click', handleWhatsAppSend);
    }
    if (whatsappUserInput) {
        whatsappUserInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleWhatsAppSend();
        });
    }

    // ----------------------------------------------------------------------
    // 13. COUNTRY REGION SELECTOR LISTENERS
    // ----------------------------------------------------------------------
    const userCountrySelect = document.getElementById('user-country');
    
    if (userCountrySelect) {
        userCountrySelect.value = selectedCountry;
        
        userCountrySelect.addEventListener('change', (e) => {
            selectedCountry = e.target.value;
            
            const profileLocationEl = document.querySelector('.profile-location');
            const cityMap = {
                SEN: "Dakar, Sénégal",
                CIV: "Abidjan, Côte d'Ivoire",
                CMR: "Douala, Cameroun",
                COD: "Kinshasa, RDC",
                COG: "Brazzaville, Congo",
                GAB: "Libreville, Gabon",
                BEN: "Cotonou, Bénin",
                TGO: "Lomé, Togo"
            };
            if (profileLocationEl && cityMap[selectedCountry]) {
                profileLocationEl.textContent = cityMap[selectedCountry];
            }
            
            saveState();
            updateWalletUI();
            
            renderPredictions(activeCategory, activeSearch);
            renderTransactions();
            populateWithdrawOperators();
            if (typeof updateProfitCalculator === 'function') {
                updateProfitCalculator();
            }
        });
        
        // Initial setup for profile location
        const profileLocationEl = document.querySelector('.profile-location');
        const cityMap = {
            SEN: "Dakar, Sénégal",
            CIV: "Abidjan, Côte d'Ivoire",
            CMR: "Douala, Cameroun",
            COD: "Kinshasa, RDC",
            COG: "Brazzaville, Congo",
            GAB: "Libreville, Gabon",
            BEN: "Cotonou, Bénin",
            TGO: "Lomé, Togo"
        };
        if (profileLocationEl && cityMap[selectedCountry]) {
            profileLocationEl.textContent = cityMap[selectedCountry];
        }
    }

    // ----------------------------------------------------------------------
    // 14. WITHDRAWAL SIMULATION MODULE
    // ----------------------------------------------------------------------
    const btnWithdrawTrigger = document.getElementById('btn-withdraw-trigger');
    const modalWithdraw = document.getElementById('modal-withdraw');
    const withdrawClose = document.getElementById('withdraw-close');
    const btnWithdrawCancel = document.getElementById('btn-withdraw-cancel');
    const btnWithdrawDone = document.getElementById('btn-withdraw-done');
    const withdrawForm = document.getElementById('withdraw-submit-form');
    const withdrawAmount = document.getElementById('withdraw-amount');
    const withdrawPhone = document.getElementById('withdraw-phone');
    const withdrawPhonePrefixLabel = document.getElementById('withdraw-phone-prefix-label');
    const withdrawModalUserBalance = document.getElementById('withdraw-modal-user-balance');
    const withdrawBtnMax = document.getElementById('withdraw-btn-max');
    const withdrawErrorMsg = document.getElementById('withdraw-error-msg');
    
    const withdrawSteps = document.querySelectorAll('.withdraw-step');
    
    function populateWithdrawOperators() {
        const select = document.getElementById('withdraw-operator');
        if (!select) return;
        select.innerHTML = '';

        const countryData = countriesConfig[selectedCountry];
        const operatorNames = {
            orange: "Orange Money",
            mtn: selectedCountry === 'TGO' ? "T-Money" : (selectedCountry === 'COD' ? "M-Pesa" : "MTN MoMo"),
            airtel: "Airtel Money",
            wave: "Wave",
            moov: "Moov Africa"
        };

        countryData.operators.forEach(opKey => {
            const opt = document.createElement('option');
            opt.value = opKey;
            opt.textContent = operatorNames[opKey] || opKey;
            select.appendChild(opt);
        });
    }

    function goToWithdrawStep(stepNumber) {
        withdrawSteps.forEach(step => {
            if (step.getAttribute('id') === `withdraw-step-${stepNumber}`) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    function closeWithdrawModal() {
        if (modalWithdraw) modalWithdraw.classList.remove('active');
    }

    if (btnWithdrawTrigger) {
        btnWithdrawTrigger.addEventListener('click', () => {
            populateWithdrawOperators();
            const currency = getCurrencySymbol();
            
            const prefixes = {
                SEN: '+221', CIV: '+225', CMR: '+237', COD: '+243',
                COG: '+242', GAB: '+241', BEN: '+229', TGO: '+228'
            };
            if (withdrawPhonePrefixLabel) withdrawPhonePrefixLabel.textContent = prefixes[selectedCountry] || '+221';
            if (withdrawModalUserBalance) withdrawModalUserBalance.textContent = `${formatCurrency(balance)} ${currency}`;
            
            const amountLabel = document.getElementById('withdraw-amount-label');
            if (amountLabel) amountLabel.textContent = `Montant du retrait (${currency})`;
            
            if (withdrawAmount) {
                withdrawAmount.placeholder = `Entrez le montant en ${currency}`;
                withdrawAmount.value = '';
            }
            if (withdrawPhone) withdrawPhone.value = '';
            if (withdrawErrorMsg) withdrawErrorMsg.style.display = 'none';
            
            goToWithdrawStep(1);
            if (modalWithdraw) modalWithdraw.classList.add('active');
        });
    }

    if (withdrawClose) withdrawClose.addEventListener('click', closeWithdrawModal);
    if (btnWithdrawCancel) btnWithdrawCancel.addEventListener('click', closeWithdrawModal);

    if (withdrawBtnMax) {
        withdrawBtnMax.addEventListener('click', () => {
            if (withdrawAmount) {
                withdrawAmount.value = Math.floor(balance);
                withdrawAmount.dispatchEvent(new Event('input'));
            }
        });
    }

    if (withdrawAmount) {
        withdrawAmount.addEventListener('input', () => {
            const amount = parseFloat(withdrawAmount.value) || 0;
            const currency = getCurrencySymbol();
            
            if (amount > balance) {
                withdrawErrorMsg.textContent = `Solde du portefeuille insuffisant (${formatCurrency(balance)} ${currency} disponible).`;
                withdrawErrorMsg.style.display = 'block';
            } else if (amount > 0 && amount < 500) {
                withdrawErrorMsg.textContent = `Le retrait minimal est de 500 ${currency}.`;
                withdrawErrorMsg.style.display = 'block';
            } else {
                withdrawErrorMsg.style.display = 'none';
            }
        });
    }

    if (withdrawForm) {
        withdrawForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const amount = parseFloat(withdrawAmount.value);
            const opKey = document.getElementById('withdraw-operator').value;
            const currency = getCurrencySymbol();
            
            if (amount > balance) {
                withdrawErrorMsg.textContent = "Solde insuffisant.";
                withdrawErrorMsg.style.display = 'block';
                return;
            }
            if (amount < 500) {
                withdrawErrorMsg.textContent = `Retrait minimal : 500 ${currency}.`;
                withdrawErrorMsg.style.display = 'block';
                return;
            }

            const operatorNames = {
                orange: "Orange Money",
                mtn: selectedCountry === 'TGO' ? "T-Money" : (selectedCountry === 'COD' ? "M-Pesa" : "MTN MoMo"),
                airtel: "Airtel Money",
                wave: "Wave",
                moov: "Moov Africa"
            };
            const activeOpName = operatorNames[opKey];

            const withdrawModalCard = document.getElementById('withdraw-modal-card');
            if (withdrawModalCard) {
                withdrawModalCard.className = `modal-card ussd-theme--${opKey}`;
            }

            document.getElementById('withdraw-ussd-op-badge').textContent = activeOpName;
            document.getElementById('withdraw-ussd-charge-amount').textContent = `${formatCurrency(amount)} ${currency}`;
            
            const pinInstructions = {
                orange: "Orange Money",
                mtn: opKey === 'mtn' && selectedCountry === 'TGO' ? 'T-Money' : (opKey === 'mtn' && selectedCountry === 'COD' ? 'M-Pesa' : 'MTN MoMo'),
                airtel: "Airtel Money",
                wave: "Wave",
                moov: "Moov Money"
            };
            document.getElementById('withdraw-ussd-instruction-text').textContent = 
                `Confirmez la réception de votre virement en saisissant votre code secret ${pinInstructions[opKey] || 'Mobile Money'} à 4 chiffres.`;

            document.getElementById('withdraw-ussd-pin-code').value = '';
            goToWithdrawStep(2);
        });
    }

    const btnWithdrawUssdConfirm = document.getElementById('btn-withdraw-ussd-confirm');
    const btnWithdrawUssdCancel = document.getElementById('btn-withdraw-ussd-cancel');
    const withdrawUssdLoader = document.getElementById('withdraw-ussd-loader');
    const withdrawUssdLoaderText = document.getElementById('withdraw-ussd-loader-text');
    const withdrawUssdPinInput = document.getElementById('withdraw-ussd-pin-code');

    if (btnWithdrawUssdCancel) {
        btnWithdrawUssdCancel.addEventListener('click', () => {
            goToWithdrawStep(1);
        });
    }

    if (btnWithdrawUssdConfirm) {
        btnWithdrawUssdConfirm.addEventListener('click', () => {
            if (!withdrawUssdPinInput) return;
            const pin = withdrawUssdPinInput.value;
            const amount = parseFloat(withdrawAmount.value);
            const opKey = document.getElementById('withdraw-operator').value;
            const currency = getCurrencySymbol();

            if (pin.length !== 4) {
                alert("Veuillez saisir un code PIN à 4 chiffres.");
                return;
            }

            if (withdrawUssdLoader) withdrawUssdLoader.classList.add('active');
            if (withdrawUssdLoaderText) withdrawUssdLoaderText.textContent = "Traitement du virement...";

            setTimeout(() => {
                if (withdrawUssdLoaderText) withdrawUssdLoaderText.textContent = "Crédit en cours sur votre compte mobile...";

                setTimeout(() => {
                    balance -= amount;

                    const txId = 'PA-WD-' + Math.floor(1000000 + Math.random() * 9000000);
                    const txDate = new Date().toLocaleString('fr-FR');
                    
                    const operatorNames = {
                        orange: "Orange Money",
                        mtn: selectedCountry === 'TGO' ? "T-Money" : (selectedCountry === 'COD' ? "M-Pesa" : "MTN MoMo"),
                        airtel: "Airtel Money",
                        wave: "Wave",
                        moov: "Moov Africa"
                    };
                    const activeOpName = operatorNames[opKey];

                    transactions.unshift({
                        id: txId,
                        date: txDate,
                        type: 'Retrait',
                        operator: activeOpName,
                        amount: -amount,
                        currency: currency,
                        balanceAfter: balance,
                        status: 'Succès'
                    });

                    saveState();
                    updateWalletUI();

                    document.getElementById('success-withdraw-amount').textContent = `${formatCurrency(amount)} ${currency}`;
                    document.getElementById('success-withdraw-op-name').textContent = activeOpName;
                    document.getElementById('success-withdraw-tx-id').textContent = txId;
                    document.getElementById('success-withdraw-new-balance').textContent = `${formatCurrency(balance)} ${currency}`;

                    if (withdrawUssdLoader) withdrawUssdLoader.classList.remove('active');
                    goToWithdrawStep(3);
                }, 1200);
            }, 1200);
        });
    }

    if (btnWithdrawDone) {
        btnWithdrawDone.addEventListener('click', () => {
            closeWithdrawModal();
            const withdrawModalCard = document.getElementById('withdraw-modal-card');
            if (withdrawModalCard) withdrawModalCard.className = `modal-card`;
            switchView('transactions');
        });
    }

    // ----------------------------------------------------------------------
    // 15. ADMIN BACKOFFICE PANEL LOGIC
    // ----------------------------------------------------------------------
    const adminTotalVolumeEl = document.getElementById('admin-total-volume');
    const adminPlatformFeesEl = document.getElementById('admin-platform-fees');
    const adminTotalWithdrawalsEl = document.getElementById('admin-total-withdrawals');
    const adminMarketsTbody = document.getElementById('admin-markets-tbody');
    const adminUsersTbody = document.getElementById('admin-users-tbody');

    function updateAdminStats() {
        const currency = getCurrencySymbol();
        
        const sumPools = predictions.reduce((sum, p) => sum + p.totalPool, 0);
        if (adminTotalVolumeEl) adminTotalVolumeEl.textContent = `${formatCurrency(sumPools)} ${currency}`;
        
        const fees = Math.floor(sumPools * 0.05);
        if (adminPlatformFeesEl) adminPlatformFeesEl.textContent = `${formatCurrency(fees)} ${currency}`;
        
        const sumWD = transactions.filter(t => t.type === 'Retrait').reduce((sum, t) => sum + Math.abs(t.amount), 0);
        if (adminTotalWithdrawalsEl) adminTotalWithdrawalsEl.textContent = `${formatCurrency(sumWD)} ${currency}`;
    }

    function renderAdminMarkets() {
        if (!adminMarketsTbody) return;
        adminMarketsTbody.innerHTML = '';

        predictions.forEach(pred => {
            const tr = document.createElement('tr');
            
            let statusBadge = `<span class="status-badge status-badge--active">Actif</span>`;
            let actions = '';

            if (pred.status === 'active') {
                actions = `
                    <div style="display: flex; gap: 6px;">
                        <button class="btn btn--primary font-sm btn-admin-resolve" data-id="${pred.id}" data-outcome="0" style="padding: 4px 8px; font-size: 0.75rem;">
                            Trancher Option A
                        </button>
                        <button class="btn btn--outline font-sm btn-admin-resolve" data-id="${pred.id}" data-outcome="1" style="padding: 4px 8px; font-size: 0.75rem; border-color: var(--accent-orange); color: var(--accent-orange);">
                            Trancher Option B
                        </button>
                    </div>
                `;
            } else {
                statusBadge = `<span class="status-badge status-badge--resolved">Résolu</span>`;
                actions = `<span class="text--muted font-sm">Marché clôturé</span>`;
            }

            const regionNames = {
                SEN: "Sénégal", CIV: "Côte d'Ivoire", CMR: "Cameroun",
                COD: "RDC", COG: "Congo", GAB: "Gabon", BEN: "Bénin", TGO: "Togo"
            };
            const region = regionNames[pred.id.includes('custom') ? selectedCountry : 'SEN'] || 'Sénégal';

            tr.innerHTML = `
                <td><strong class="font-sm" style="white-space: normal; display: block; max-width: 250px;">${pred.title}</strong></td>
                <td><span class="badge">${region}</span></td>
                <td><strong>${formatCurrency(pred.totalPool)} ${getCurrencySymbol()}</strong></td>
                <td>${statusBadge}</td>
                <td>${actions}</td>
            `;

            tr.querySelectorAll('.btn-admin-resolve').forEach(btn => {
                btn.addEventListener('click', () => {
                    const predId = btn.getAttribute('data-id');
                    const outcomeIndex = parseInt(btn.getAttribute('data-outcome'));
                    resolveMarketFromAdmin(predId, outcomeIndex);
                });
            });

            adminMarketsTbody.appendChild(tr);
        });
    }

    function resolveMarketFromAdmin(predId, outcomeIndex) {
        const pred = predictions.find(p => p.id === predId);
        if (!pred || pred.status !== 'active') return;

        pred.status = 'resolved';
        
        userBets.forEach(bet => {
            if (bet.predictionId === predId && bet.status === 'pending') {
                const choiceName = pred.options[outcomeIndex];
                if (bet.choiceText === choiceName) {
                    bet.status = 'won';
                } else {
                    bet.status = 'lost';
                }
            }
        });

        saveState();
        updateWalletUI();
        updateAdminStats();
        renderAdminMarkets();
        
        alert(`Le marché "${pred.title}" a été résolu officiellement en faveur de l'Option : "${pred.options[outcomeIndex]}".`);
    }

    const mockTraders = [
        { name: "Ablaye Diop (Vous)", country: "SEN", balance: 0, volume: 0, isReal: true },
        { name: "Cheikh Tidiane", country: "SEN", balance: 145000, volume: 620000, isReal: false },
        { name: "Fatoumata Diallo", country: "CIV", balance: 85000, volume: 340000, isReal: false },
        { name: "Marc M'Benga", country: "CMR", balance: 210000, volume: 1050000, isReal: false },
        { name: "Ngalula Kabongo", country: "COD", balance: 650000, volume: 2400000, isReal: false }
    ];

    function renderAdminTraders() {
        if (!adminUsersTbody) return;
        adminUsersTbody.innerHTML = '';

        mockTraders[0].balance = balance;
        mockTraders[0].country = selectedCountry;
        
        const userVolume = userBets.reduce((sum, b) => sum + b.amount, 0);
        mockTraders[0].volume = userVolume;

        const regionNames = {
            SEN: "🇸🇳 Sénégal", CIV: "🇨🇮 Côte d'Ivoire", CMR: "🇨🇲 Cameroun",
            COD: "🇨🇩 RDC", COG: "🇨🇬 Congo", GAB: "🇬🇦 Gabon", BEN: "🇧🇯 Bénin", TGO: "🇹🇬 Togo"
        };

        mockTraders.forEach((trader) => {
            const tr = document.createElement('tr');
            
            const curMap = {
                SEN: "XOF", CIV: "XOF", CMR: "XAF", COD: "CDF",
                COG: "XAF", GAB: "XAF", BEN: "XOF", TGO: "XOF"
            };
            const currency = curMap[trader.country] || "XOF";

            tr.innerHTML = `
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div class="profile-avatar" style="width: 28px; height: 28px; font-size: 0.75rem; background: linear-gradient(135deg, var(--accent-emerald), var(--accent-gold)); color: var(--bg-primary);">
                            ${trader.name.split(' ').map(n=>n[0]).join('')}
                        </div>
                        <span class="font-sm">${trader.name}</span>
                    </div>
                </td>
                <td><span class="badge">${regionNames[trader.country] || trader.country}</span></td>
                <td><strong>${formatCurrency(trader.balance)} ${currency}</strong></td>
                <td>${formatCurrency(trader.volume)} ${currency}</td>
                <td>
                    ${trader.isReal ? `
                        <button class="btn btn--outline font-sm btn-adjust-user-balance" style="padding: 2px 6px; font-size: 0.75rem;">Créditer +10 000</button>
                    ` : `
                        <span class="text--muted font-sm">Simulé</span>
                    `}
                </td>
            `;

            const adjustBtn = tr.querySelector('.btn-adjust-user-balance');
            if (adjustBtn) {
                adjustBtn.addEventListener('click', () => {
                    balance += 10000;
                    
                    transactions.unshift({
                        id: 'PA-TX-ADMIN-' + Math.floor(1000000 + Math.random() * 9000000),
                        date: new Date().toLocaleString('fr-FR'),
                        type: 'Dépôt',
                        operator: 'Console Admin',
                        amount: 10000,
                        currency: getCurrencySymbol(),
                        balanceAfter: balance,
                        status: 'Succès'
                    });

                    saveState();
                    updateWalletUI();
                    updateAdminStats();
                    renderAdminTraders();
                });
            }

            adminUsersTbody.appendChild(tr);
        });
    }

    // ----------------------------------------------------------------------
    // 16. USSD SIMULATOR STATE MACHINE
    // ----------------------------------------------------------------------
    let ussdState = 'DIALER'; 
    let ussdCategory = '';
    let ussdPrediction = null;
    let ussdChoiceIndex = -1;
    let ussdAmount = 0;
    let ussdPhoneNum = '';

    const dialerNumEl = document.getElementById('dialer-num');
    const phoneDialerView = document.getElementById('phone-dialer-view');
    const phoneUssdView = document.getElementById('phone-ussd-view');
    const ussdDialogMessage = document.getElementById('ussd-dialog-message');
    const ussdDialogInputVal = document.getElementById('ussd-dialog-input-val');
    
    const btnDialerCall = document.getElementById('btn-dialer-call');
    const btnDialerClear = document.getElementById('btn-dialer-clear');
    const btnUssdDialogCancel = document.getElementById('btn-ussd-dialog-cancel');
    const btnUssdDialogSend = document.getElementById('btn-ussd-dialog-send');
    const phoneHomeBtnTrigger = document.getElementById('phone-home-btn-trigger');

    // Keypad event listeners
    document.querySelectorAll('.key-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (ussdState !== 'DIALER') return;
            const key = btn.getAttribute('data-key');
            if (dialerNumEl) {
                if (dialerNumEl.textContent === '0' || dialerNumEl.textContent === '') {
                    dialerNumEl.textContent = key;
                } else {
                    dialerNumEl.textContent += key;
                }
            }
        });
    });

    if (btnDialerClear) {
        btnDialerClear.addEventListener('click', () => {
            if (ussdState !== 'DIALER') return;
            const current = dialerNumEl ? dialerNumEl.textContent : '';
            if (current.length > 0 && dialerNumEl) {
                dialerNumEl.textContent = current.slice(0, -1);
            }
        });
    }

    if (phoneHomeBtnTrigger) {
        phoneHomeBtnTrigger.addEventListener('click', () => {
            exitUSSD();
        });
    }

    function exitUSSD() {
        ussdState = 'DIALER';
        if (dialerNumEl) dialerNumEl.textContent = '*855#';
        if (phoneDialerView) phoneDialerView.style.display = 'flex';
        if (phoneUssdView) phoneUssdView.style.display = 'none';
        if (ussdDialogInputVal) ussdDialogInputVal.value = '';
    }

    if (btnDialerCall) {
        btnDialerCall.addEventListener('click', () => {
            const code = dialerNumEl ? dialerNumEl.textContent.trim() : '';
            if (!code) return;
            
            if (code === '*855#') {
                if (phoneDialerView) phoneDialerView.style.display = 'none';
                if (phoneUssdView) phoneUssdView.style.display = 'flex';
                
                const isRegistered = localStorage.getItem('pa_registered') === 'true';
                if (isRegistered) {
                    showUSSDMainMenu();
                } else {
                    showUSSDRegistration();
                }
            } else {
                const lang = localStorage.getItem('pa_lang') || 'fr';
                if (lang === 'en') {
                    alert("Unknown MMI code or network not simulated. Dial *855# to launch the PredicAfrica app.");
                } else {
                    alert("Code MMI inconnu ou réseau non simulé. Composez le *855# pour lancer l'application PredicAfrica.");
                }
            }
        });
    }

    if (btnUssdDialogCancel) {
        btnUssdDialogCancel.addEventListener('click', () => {
            exitUSSD();
        });
    }

    if (btnUssdDialogSend) {
        btnUssdDialogSend.addEventListener('click', () => {
            if (ussdDialogInputVal) {
                const val = ussdDialogInputVal.value.trim();
                processUSSDInput(val);
            }
        });
    }

    function getUSSDTranslation(key, currency, params = {}) {
        const lang = localStorage.getItem('pa_lang') || 'fr';
        const texts = {
            fr: {
                main_menu: `Menu Principal PredicAfrica (${currency})
1. Investir (Marchés)
2. Mon Portefeuille
3. Retirer des fonds
4. Quitter`,
                main_menu_placeholder: "Saisissez 1, 2, 3 ou 4...",
                welcome_reg: `Bienvenue sur PredicAfrica !
Votre numéro n'est pas lié à un compte boursier.
1. S'inscrire (Bonus +10 000 ${currency})
2. Quitter`,
                welcome_reg_placeholder: "Saisissez 1 ou 2...",
                reg_name_title: `S'inscrire à PredicAfrica
Entrez votre Nom et Prénom :`,
                reg_name_placeholder: "Nom complet...",
                reg_name_empty: "Le nom complet ne peut pas être vide.",
                reg_pin_title: `S'inscrire à PredicAfrica
Nom : {name}
Créez un code PIN secret à 4 chiffres :`,
                reg_pin_placeholder: "PIN secret...",
                reg_pin_error: "Le PIN doit comporter 4 chiffres.",
                reg_success: `✓ Inscription réussie !
Bonus de 10 000 ${currency} crédité.
Compte : {name}
PIN : ****

Appuyez sur Envoyer pour continuer.`,
                reg_success_placeholder: "Appuyez sur Envoyer...",
                cat_menu_title: `Sélectionnez une catégorie :
1. Politique
2. Économie
3. Musique
4. Cinéma
5. Retour`,
                cat_menu_placeholder: "Chiffre de 1 à 5...",
                portfolio_title: `Solde : {balance} ${currency}
1. Recharger (+10 000)
2. Retour`,
                portfolio_placeholder: "Saisissez 1 ou 2...",
                withdraw_title: `Retrait Mobile Money
Solde : {balance} ${currency}
Entrez le montant à retirer (min: 500) :`,
                withdraw_placeholder: "Montant...",
                invalid_option: "Option invalide.",
                invalid_market_option: "Option de marché invalide.",
                withdraw_min_error: `Montant invalide. Le minimum est de 500 {currency}.`,
                withdraw_balance_error: `Solde insuffisant ({balance} {currency} disponible).`,
                withdraw_phone_title: `Retrait : {amount} ${currency}
Entrez le numéro de téléphone récepteur :`,
                withdraw_phone_placeholder: "Téléphone...",
                withdraw_phone_error: "Veuillez saisir un numéro de téléphone valide.",
                withdraw_pin_title: `Virement de {amount} ${currency} vers {phone}.
Entrez votre PIN secret à 4 chiffres :`,
                withdraw_pin_placeholder: "PIN secret...",
                withdraw_success: `✓ Virement validé !
{amount} ${currency} envoyés vers le {phone}.
Nouveau solde : {balance} ${currency}

Cliquez sur Envoyer pour quitter.`,
                withdraw_success_placeholder: "Appuyez sur Envoyer...",
                predict_no_active: `Aucun marché actif.
1. Retour`,
                predict_return_opt: `{index}. Retour`,
                predict_choice_placeholder: "Saisissez un chiffre...",
                choice_menu_title: `{title}...
1. {opt0} (@{odds0})
2. {opt1} (@{odds1})
3. Retour`,
                choice_menu_placeholder: "Saisissez 1, 2 ou 3...",
                amount_menu_title: `Option : {choice} (@{odds})
Solde : {balance} ${currency}
Entrez le montant à investir (min: 200) :`,
                amount_menu_placeholder: "Montant...",
                amount_min_error: `Montant invalide. Le minimum est de 200 {currency}.`,
                amount_balance_error: `Solde insuffisant ({balance} {currency} disponible).`,
                pin_menu_title: `Investir : {amount} ${currency}
Option : {choice}
Entrez votre PIN secret à 4 chiffres (ex: 1234) :`,
                pin_menu_placeholder: "PIN secret...",
                bet_success_title: `✓ Succès ! Position ouverte :
Parts : {choice}
Cote : @{odds}
Solde : {balance} ${currency}

Cliquez sur Envoyer pour quitter.`,
                bet_success_placeholder: "Appuyez sur Envoyer...",
                recharge_success_title: `✓ Portefeuille crédité de +10 000 ${currency}.
Nouveau solde : {balance} ${currency}

Cliquez sur Envoyer pour quitter.`
            },
            en: {
                main_menu: `PredicAfrica Main Menu (${currency})
1. Invest (Markets)
2. My Wallet
3. Withdraw funds
4. Exit`,
                main_menu_placeholder: "Enter 1, 2, 3 or 4...",
                welcome_reg: `Welcome to PredicAfrica!
Your number is not linked to a trading account.
1. Register (Bonus +10,000 ${currency})
2. Exit`,
                welcome_reg_placeholder: "Enter 1 or 2...",
                reg_name_title: `Register to PredicAfrica
Enter your Full Name:`,
                reg_name_placeholder: "Full name...",
                reg_name_empty: "Full name cannot be empty.",
                reg_pin_title: `Register to PredicAfrica
Name: {name}
Create a secret 4-digit PIN:`,
                reg_pin_placeholder: "Secret PIN...",
                reg_pin_error: "PIN must be exactly 4 digits.",
                reg_success: `✓ Registration successful!
10,000 ${currency} bonus credited.
Account: {name}
PIN: ****

Press Send to continue.`,
                reg_success_placeholder: "Press Send...",
                cat_menu_title: `Select a category:
1. Politics
2. Economy
3. Music
4. Cinema
5. Back`,
                cat_menu_placeholder: "Number from 1 to 5...",
                portfolio_title: `Balance: {balance} ${currency}
1. Recharge (+10,000)
2. Back`,
                portfolio_placeholder: "Enter 1 or 2...",
                withdraw_title: `Mobile Money Withdrawal
Balance: {balance} ${currency}
Enter amount to withdraw (min: 500):`,
                withdraw_placeholder: "Amount...",
                invalid_option: "Invalid option.",
                invalid_market_option: "Invalid market option.",
                withdraw_min_error: `Invalid amount. Minimum is 500 {currency}.`,
                withdraw_balance_error: `Insufficient balance ({balance} {currency} available).`,
                withdraw_phone_title: `Withdrawal: {amount} ${currency}
Enter receiving phone number:`,
                withdraw_phone_placeholder: "Phone number...",
                withdraw_phone_error: "Please enter a valid phone number.",
                withdraw_pin_title: `Transfer of {amount} ${currency} to {phone}.
Enter your secret 4-digit PIN:`,
                withdraw_pin_placeholder: "Secret PIN...",
                withdraw_success: `✓ Transfer validated!
{amount} ${currency} sent to {phone}.
New balance: {balance} ${currency}

Click Send to exit.`,
                withdraw_success_placeholder: "Press Send...",
                predict_no_active: `No active markets.
1. Back`,
                predict_return_opt: `{index}. Back`,
                predict_choice_placeholder: "Enter a number...",
                choice_menu_title: `{title}...
1. {opt0} (@{odds0})
2. {opt1} (@{odds1})
3. Back`,
                choice_menu_placeholder: "Enter 1, 2 or 3...",
                amount_menu_title: `Option: {choice} (@{odds})
Balance: {balance} ${currency}
Enter amount to invest (min: 200):`,
                amount_menu_placeholder: "Amount...",
                amount_min_error: `Invalid amount. Minimum is 200 {currency}.`,
                amount_balance_error: `Insufficient balance ({balance} {currency} available).`,
                pin_menu_title: `Invest: {amount} ${currency}
Option: {choice}
Enter your secret 4-digit PIN (ex: 1234):`,
                pin_menu_placeholder: "Secret PIN...",
                bet_success_title: `✓ Success! Position opened:
Shares: {choice}
Odds: @{odds}
Balance: {balance} ${currency}

Click Send to exit.`,
                bet_success_placeholder: "Press Send...",
                recharge_success_title: `✓ Wallet credited with +10,000 ${currency}.
New balance: {balance} ${currency}

Click Send to exit.`
            }
        };
        
        let text = texts[lang][key] || "";
        for (const [k, v] of Object.entries(params)) {
            text = text.replace(`{${k}}`, v);
        }
        return text;
    }

    if (ussdDialogInputVal) {
        ussdDialogInputVal.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const val = ussdDialogInputVal.value.trim();
                processUSSDInput(val);
            }
        });
    }

    function showUSSDMainMenu() {
        ussdState = 'MAIN_MENU';
        const currency = getCurrencySymbol();
        if (ussdDialogMessage) {
            ussdDialogMessage.innerHTML = getUSSDTranslation('main_menu', currency);
        }
        if (ussdDialogInputVal) {
            ussdDialogInputVal.value = '';
            ussdDialogInputVal.placeholder = getUSSDTranslation('main_menu_placeholder', currency);
            ussdDialogInputVal.style.display = 'block';
        }
    }

    let ussdTempName = '';

    function showUSSDRegistration() {
        ussdState = 'REG_START';
        const currency = getCurrencySymbol();
        if (ussdDialogMessage) {
            ussdDialogMessage.innerHTML = getUSSDTranslation('welcome_reg', currency);
        }
        if (ussdDialogInputVal) {
            ussdDialogInputVal.value = '';
            ussdDialogInputVal.placeholder = getUSSDTranslation('welcome_reg_placeholder', currency);
            ussdDialogInputVal.style.display = 'block';
        }
    }

    function processUSSDInput(input) {
        const currency = getCurrencySymbol();
        
        switch (ussdState) {
            case 'REG_START':
                if (input === '1') {
                    ussdState = 'REG_NAME';
                    if (ussdDialogMessage) {
                        ussdDialogMessage.innerHTML = getUSSDTranslation('reg_name_title', currency);
                    }
                    if (ussdDialogInputVal) {
                        ussdDialogInputVal.value = '';
                        ussdDialogInputVal.placeholder = getUSSDTranslation('reg_name_placeholder', currency);
                    }
                } else if (input === '2') {
                    exitUSSD();
                } else {
                    alert(getUSSDTranslation('invalid_option', currency));
                }
                break;

            case 'REG_NAME':
                if (!input) {
                    alert(getUSSDTranslation('reg_name_empty', currency));
                } else {
                    ussdTempName = input;
                    ussdState = 'REG_PIN';
                    if (ussdDialogMessage) {
                        ussdDialogMessage.innerHTML = getUSSDTranslation('reg_pin_title', currency, { name: ussdTempName });
                    }
                    if (ussdDialogInputVal) {
                        ussdDialogInputVal.value = '';
                        ussdDialogInputVal.placeholder = getUSSDTranslation('reg_pin_placeholder', currency);
                    }
                }
                break;

            case 'REG_PIN':
                if (input.length !== 4 || isNaN(parseInt(input))) {
                    alert(getUSSDTranslation('reg_pin_error', currency));
                } else {
                    username = ussdTempName;
                    balance = 10000;
                    
                    localStorage.setItem('pa_registered', 'true');
                    localStorage.setItem('pa_username', username);
                    localStorage.setItem('pa_balance', balance);

                    transactions.unshift({
                        id: 'PA-TX-USSD-REG-' + Math.floor(1000000 + Math.random() * 9000000),
                        date: new Date().toLocaleString('fr-FR'),
                        type: 'Dépôt',
                        operator: 'USSD Inscription',
                        amount: 10000,
                        currency: currency,
                        balanceAfter: balance,
                        status: 'Succès'
                    });

                    saveState();
                    updateWalletUI();
                    renderTransactions();

                    ussdState = 'REG_SUCCESS';
                    if (ussdDialogMessage) {
                        ussdDialogMessage.innerHTML = getUSSDTranslation('reg_success', currency, { name: username });
                    }
                    if (ussdDialogInputVal) {
                        ussdDialogInputVal.value = '';
                        ussdDialogInputVal.placeholder = getUSSDTranslation('reg_success_placeholder', currency);
                    }
                }
                break;

            case 'REG_SUCCESS':
                showUSSDMainMenu();
                break;

            case 'MAIN_MENU':
                if (input === '1') {
                    ussdState = 'CATEGORIES_MENU';
                    if (ussdDialogMessage) {
                        ussdDialogMessage.innerHTML = getUSSDTranslation('cat_menu_title', currency);
                    }
                    if (ussdDialogInputVal) {
                        ussdDialogInputVal.value = '';
                        ussdDialogInputVal.placeholder = getUSSDTranslation('cat_menu_placeholder', currency);
                    }
                } else if (input === '2') {
                    ussdState = 'PORTFOLIO_MENU';
                    if (ussdDialogMessage) {
                        ussdDialogMessage.innerHTML = getUSSDTranslation('portfolio_title', currency, { balance: formatCurrency(balance) });
                    }
                    if (ussdDialogInputVal) {
                        ussdDialogInputVal.value = '';
                        ussdDialogInputVal.placeholder = getUSSDTranslation('portfolio_placeholder', currency);
                    }
                } else if (input === '3') {
                    ussdState = 'WITHDRAW_AMOUNT';
                    if (ussdDialogMessage) {
                        ussdDialogMessage.innerHTML = getUSSDTranslation('withdraw_title', currency, { balance: formatCurrency(balance) });
                    }
                    if (ussdDialogInputVal) {
                        ussdDialogInputVal.value = '';
                        ussdDialogInputVal.placeholder = getUSSDTranslation('withdraw_placeholder', currency);
                    }
                } else if (input === '4') {
                    exitUSSD();
                } else {
                    alert(getUSSDTranslation('invalid_option', currency));
                }
                break;

            case 'CATEGORIES_MENU':
                if (input === '5') {
                    showUSSDMainMenu();
                } else if (['1', '2', '3', '4'].includes(input)) {
                    const catMap = { '1': 'politics', '2': 'economy', '3': 'music', '4': 'cinema' };
                    ussdCategory = catMap[input];
                    showUSSDPredictions();
                } else {
                    alert(getUSSDTranslation('invalid_option', currency));
                }
                break;

            case 'PREDICTIONS_MENU':
                const activePreds = predictions.filter(p => p.category === ussdCategory && p.status === 'active');
                const selectedIdx = parseInt(input) - 1;
                
                if (input === String(activePreds.length + 1)) {
                    ussdState = 'CATEGORIES_MENU';
                    if (ussdDialogMessage) {
                        ussdDialogMessage.innerHTML = getUSSDTranslation('cat_menu_title', currency);
                    }
                    if (ussdDialogInputVal) {
                        ussdDialogInputVal.value = '';
                        ussdDialogInputVal.placeholder = getUSSDTranslation('cat_menu_placeholder', currency);
                    }
                } else if (selectedIdx >= 0 && selectedIdx < activePreds.length) {
                    ussdPrediction = activePreds[selectedIdx];
                    ussdState = 'CHOICE_MENU';
                    
                    let title = ussdPrediction.title;
                    let opt0 = ussdPrediction.options[0];
                    let opt1 = ussdPrediction.options[1];
                    const lang = localStorage.getItem('pa_lang') || 'fr';
                    if (lang === 'en') {
                        if (title.includes("Présidentielle Sénégal")) {
                            title = "Senegal Presidential: Who will succeed Diomaye Faye?";
                            opt0 = "Coalition Key Candidate";
                            opt1 = "Opposition Candidate";
                        } else if (title.includes("Grammy Award")) {
                            title = "Grammy Award 2027: Burna Boy nominated?";
                            opt0 = "Yes";
                            opt1 = "No";
                        } else if (title.includes("Monnaie ECO")) {
                            title = "ECO Currency Adoption by ECOWAS in 2027?";
                            opt0 = "Yes";
                            opt1 = "No";
                        } else if (title.includes("FESPACO")) {
                            title = "FESPACO: Alain Gomis wins Golden Yennenga?";
                            opt0 = "Yes";
                            opt1 = "No";
                        }
                    }

                    if (ussdDialogMessage) {
                        ussdDialogMessage.innerHTML = getUSSDTranslation('choice_menu_title', currency, {
                            title: title.substring(0, 50),
                            opt0: opt0,
                            odds0: ussdPrediction.odds[0].toFixed(2),
                            opt1: opt1,
                            odds1: ussdPrediction.odds[1].toFixed(2)
                        });
                    }
                    if (ussdDialogInputVal) {
                        ussdDialogInputVal.value = '';
                        ussdDialogInputVal.placeholder = getUSSDTranslation('choice_menu_placeholder', currency);
                    }
                } else {
                    alert(getUSSDTranslation('invalid_market_option', currency));
                }
                break;

            case 'CHOICE_MENU':
                if (input === '3') {
                    showUSSDPredictions();
                } else if (input === '1' || input === '2') {
                    ussdChoiceIndex = parseInt(input) - 1;
                    ussdState = 'AMOUNT_MENU';
                    let optText = ussdPrediction.options[ussdChoiceIndex];
                    const lang = localStorage.getItem('pa_lang') || 'fr';
                    if (lang === 'en') {
                        if (optText === 'Oui') optText = 'Yes';
                        if (optText === 'Non') optText = 'No';
                        if (optText === 'Candidat Coalition Clé') optText = 'Coalition Key Candidate';
                        if (optText === 'Candidat Opposition') optText = 'Opposition Candidate';
                    }
                    if (ussdDialogMessage) {
                        ussdDialogMessage.innerHTML = getUSSDTranslation('amount_menu_title', currency, {
                            choice: optText,
                            odds: ussdPrediction.odds[ussdChoiceIndex].toFixed(2),
                            balance: formatCurrency(balance)
                        });
                    }
                    if (ussdDialogInputVal) {
                        ussdDialogInputVal.value = '';
                        ussdDialogInputVal.placeholder = getUSSDTranslation('amount_menu_placeholder', currency);
                    }
                } else {
                    alert(getUSSDTranslation('invalid_option', currency));
                }
                break;

            case 'AMOUNT_MENU':
                const amt = parseFloat(input);
                if (isNaN(amt) || amt < 200) {
                    alert(getUSSDTranslation('amount_min_error', currency));
                } else if (amt > balance) {
                    alert(getUSSDTranslation('amount_balance_error', currency, { balance: formatCurrency(balance) }));
                } else {
                    ussdAmount = amt;
                    ussdState = 'PIN_MENU';
                    let optText = ussdPrediction.options[ussdChoiceIndex];
                    const lang = localStorage.getItem('pa_lang') || 'fr';
                    if (lang === 'en') {
                        if (optText === 'Oui') optText = 'Yes';
                        if (optText === 'Non') optText = 'No';
                        if (optText === 'Candidat Coalition Clé') optText = 'Coalition Key Candidate';
                        if (optText === 'Candidat Opposition') optText = 'Opposition Candidate';
                    }
                    if (ussdDialogMessage) {
                        ussdDialogMessage.innerHTML = getUSSDTranslation('pin_menu_title', currency, {
                            amount: formatCurrency(ussdAmount),
                            choice: optText
                        });
                    }
                    if (ussdDialogInputVal) {
                        ussdDialogInputVal.value = '';
                        ussdDialogInputVal.placeholder = getUSSDTranslation('pin_menu_placeholder', currency);
                    }
                }
                break;

            case 'PIN_MENU':
                if (input.length !== 4) {
                    alert(getUSSDTranslation('reg_pin_error', currency));
                } else {
                    balance -= ussdAmount;
                    ussdPrediction.totalPool += ussdAmount;

                    const betId = 'PA-USSD-' + Math.floor(100000 + Math.random() * 90000);
                    const odds = ussdPrediction.odds[ussdChoiceIndex];
                    const payout = Math.floor(ussdAmount * odds);
                    
                    userBets.unshift({
                        id: betId,
                        predictionId: ussdPrediction.id,
                        question: ussdPrediction.title,
                        choiceText: ussdPrediction.options[ussdChoiceIndex],
                        odds: odds,
                        amount: ussdAmount,
                        payout: payout,
                        currency: currency,
                        status: 'pending',
                        date: new Date().toLocaleString('fr-FR')
                    });

                    transactions.unshift({
                        id: 'PA-TX-' + Math.floor(1000000 + Math.random() * 9000000),
                        date: new Date().toLocaleString('fr-FR'),
                        type: 'Achat',
                        operator: 'USSD Bourse',
                        amount: -ussdAmount,
                        currency: currency,
                        balanceAfter: balance,
                        status: 'Succès'
                    });

                    saveState();
                    updateWalletUI();
                    
                    renderPredictions(activeCategory, activeSearch);
                    renderTransactions();

                    ussdState = 'SUCCESS_MENU';
                    let optText = ussdPrediction.options[ussdChoiceIndex];
                    const lang = localStorage.getItem('pa_lang') || 'fr';
                    if (lang === 'en') {
                        if (optText === 'Oui') optText = 'Yes';
                        if (optText === 'Non') optText = 'No';
                        if (optText === 'Candidat Coalition Clé') optText = 'Coalition Key Candidate';
                        if (optText === 'Candidat Opposition') optText = 'Opposition Candidate';
                    }
                    if (ussdDialogMessage) {
                        ussdDialogMessage.innerHTML = getUSSDTranslation('bet_success_title', currency, {
                            choice: optText,
                            odds: odds.toFixed(2),
                            balance: formatCurrency(balance)
                        });
                    }
                    if (ussdDialogInputVal) {
                        ussdDialogInputVal.value = '';
                        ussdDialogInputVal.placeholder = getUSSDTranslation('bet_success_placeholder', currency);
                    }
                }
                break;

            case 'PORTFOLIO_MENU':
                if (input === '1') {
                    ussdState = 'RECHARGE_SUCCESS';
                    balance += 10000;
                    
                    transactions.unshift({
                        id: 'PA-TX-USSD-' + Math.floor(1000000 + Math.random() * 9000000),
                        date: new Date().toLocaleString('fr-FR'),
                        type: 'Dépôt',
                        operator: 'USSD Recharge',
                        amount: 10000,
                        currency: currency,
                        balanceAfter: balance,
                        status: 'Succès'
                    });

                    saveState();
                    updateWalletUI();
                    renderTransactions();

                    if (ussdDialogMessage) {
                        ussdDialogMessage.innerHTML = getUSSDTranslation('recharge_success_title', currency, { balance: formatCurrency(balance) });
                    }
                    if (ussdDialogInputVal) {
                        ussdDialogInputVal.value = '';
                        ussdDialogInputVal.placeholder = getUSSDTranslation('bet_success_placeholder', currency);
                    }
                } else if (input === '2') {
                    showUSSDMainMenu();
                } else {
                    alert(getUSSDTranslation('invalid_option', currency));
                }
                break;

            case 'WITHDRAW_AMOUNT':
                const wdAmt = parseFloat(input);
                if (isNaN(wdAmt) || wdAmt < 500) {
                    alert(getUSSDTranslation('withdraw_min_error', currency));
                } else if (wdAmt > balance) {
                    alert(getUSSDTranslation('withdraw_balance_error', currency, { balance: formatCurrency(balance) }));
                } else {
                    ussdAmount = wdAmt;
                    ussdState = 'WITHDRAW_PHONE';
                    if (ussdDialogMessage) {
                        ussdDialogMessage.innerHTML = getUSSDTranslation('withdraw_phone_title', currency, { amount: formatCurrency(ussdAmount) });
                    }
                    if (ussdDialogInputVal) {
                        ussdDialogInputVal.value = '';
                        ussdDialogInputVal.placeholder = getUSSDTranslation('withdraw_phone_placeholder', currency);
                    }
                }
                break;

            case 'WITHDRAW_PHONE':
                if (input.length < 8) {
                    alert(getUSSDTranslation('withdraw_phone_error', currency));
                } else {
                    ussdPhoneNum = input;
                    ussdState = 'WITHDRAW_PIN';
                    if (ussdDialogMessage) {
                        ussdDialogMessage.innerHTML = getUSSDTranslation('withdraw_pin_title', currency, {
                            amount: formatCurrency(ussdAmount),
                            phone: ussdPhoneNum
                        });
                    }
                    if (ussdDialogInputVal) {
                        ussdDialogInputVal.value = '';
                        ussdDialogInputVal.placeholder = getUSSDTranslation('withdraw_pin_placeholder', currency);
                    }
                }
                break;

            case 'WITHDRAW_PIN':
                if (input.length !== 4) {
                    alert(getUSSDTranslation('reg_pin_error', currency));
                } else {
                    balance -= ussdAmount;

                    const txId = 'PA-WD-' + Math.floor(1000000 + Math.random() * 9000000);
                    transactions.unshift({
                        id: txId,
                        date: new Date().toLocaleString('fr-FR'),
                        type: 'Retrait',
                        operator: 'USSD Mobile',
                        amount: -ussdAmount,
                        currency: currency,
                        balanceAfter: balance,
                        status: 'Succès'
                    });

                    saveState();
                    updateWalletUI();
                    renderTransactions();

                    ussdState = 'SUCCESS_MENU';
                    if (ussdDialogMessage) {
                        ussdDialogMessage.innerHTML = getUSSDTranslation('withdraw_success', currency, {
                            amount: formatCurrency(ussdAmount),
                            phone: ussdPhoneNum,
                            balance: formatCurrency(balance)
                        });
                    }
                    if (ussdDialogInputVal) {
                        ussdDialogInputVal.value = '';
                        ussdDialogInputVal.placeholder = getUSSDTranslation('withdraw_success_placeholder', currency);
                    }
                }
                break;

            case 'RECHARGE_SUCCESS':
            case 'SUCCESS_MENU':
                exitUSSD();
                break;

            default:
                exitUSSD();
                break;
        }
    }

    function showUSSDPredictions() {
        ussdState = 'PREDICTIONS_MENU';
        const activePreds = predictions.filter(p => p.category === ussdCategory && p.status === 'active');
        const currency = getCurrencySymbol();
        
        if (activePreds.length === 0) {
            if (ussdDialogMessage) {
                ussdDialogMessage.innerHTML = getUSSDTranslation('predict_no_active', currency);
            }
            if (ussdDialogInputVal) {
                ussdDialogInputVal.value = '';
                ussdDialogInputVal.placeholder = "1...";
            }
        } else {
            const lang = localStorage.getItem('pa_lang') || 'fr';
            let catName = ussdCategory.toUpperCase();
            if (lang === 'en') {
                const names = { POLITICS: "POLITICS", ECONOMY: "ECONOMY", MUSIC: "MUSIC", CINEMA: "CINEMA" };
                catName = names[catName] || catName;
            }
            let msg = lang === 'en' ? `Markets ${catName}:\n` : `Marchés ${catName}:\n`;
            activePreds.forEach((p, index) => {
                let title = p.title;
                if (lang === 'en') {
                    if (title.includes("Présidentielle Sénégal")) title = "Senegal Presidential";
                    if (title.includes("Grammy Award")) title = "Grammy Award 2027";
                    if (title.includes("Monnaie ECO")) title = "ECO Currency Adoption";
                    if (title.includes("FESPACO")) title = "FESPACO Alain Gomis";
                }
                msg += `${index + 1}. ${title.substring(0, 25)}...\n`;
            });
            msg += getUSSDTranslation('predict_return_opt', currency, { index: activePreds.length + 1 });
            
            if (ussdDialogMessage) ussdDialogMessage.innerHTML = msg;
            if (ussdDialogInputVal) {
                ussdDialogInputVal.value = '';
                ussdDialogInputVal.placeholder = getUSSDTranslation('predict_choice_placeholder', currency);
            }
        }
    }

    // ----------------------------------------------------------------------
    // 17. SUPPORT CONTACT FORM LOGIC
    // ----------------------------------------------------------------------
    const landingContactForm = document.getElementById('landing-contact-form');
    const contactSuccessMsg = document.getElementById('contact-success-msg');

    if (landingContactForm) {
        landingContactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const lastname = document.getElementById('contact-lastname').value;
            const firstname = document.getElementById('contact-firstname').value;
            const email = document.getElementById('contact-email').value;

            landingContactForm.style.display = 'none';
            const lang = localStorage.getItem('pa_lang') || 'fr';
            if (contactSuccessMsg) {
                if (lang === 'en') {
                    contactSuccessMsg.textContent = `✓ Thank you ${firstname} ${lastname}! Your message has been sent to PredicAfrica support. We will reply shortly to: ${email}.`;
                } else {
                    contactSuccessMsg.textContent = `✓ Merci ${firstname} ${lastname} ! Votre message a été transmis au support PredicAfrica. Nous vous répondrons sous peu à l'adresse : ${email}.`;
                }
                contactSuccessMsg.style.display = 'flex';
            }
        });
    }

    // ----------------------------------------------------------------------
    // 18. LEGAL MODALS CONTROLLERS
    // ----------------------------------------------------------------------
    const linkCgu = document.getElementById('link-cgu');
    const linkPrivacy = document.getElementById('link-privacy');
    const linkData = document.getElementById('link-data');

    const modalCgu = document.getElementById('modal-cgu');
    const modalPrivacy = document.getElementById('modal-privacy');
    const modalData = document.getElementById('modal-data');

    const cguClose = document.getElementById('cgu-close');
    const privacyClose = document.getElementById('privacy-close');
    const dataClose = document.getElementById('data-close');

    if (linkCgu && modalCgu) {
        linkCgu.addEventListener('click', (e) => {
            e.preventDefault();
            modalCgu.classList.add('active');
        });
    }
    if (linkPrivacy && modalPrivacy) {
        linkPrivacy.addEventListener('click', (e) => {
            e.preventDefault();
            modalPrivacy.classList.add('active');
        });
    }
    if (linkData && modalData) {
        linkData.addEventListener('click', (e) => {
            e.preventDefault();
            modalData.classList.add('active');
        });
    }

    if (cguClose) cguClose.addEventListener('click', () => modalCgu.classList.remove('active'));
    if (privacyClose) privacyClose.addEventListener('click', () => modalPrivacy.classList.remove('active'));
    if (dataClose) dataClose.addEventListener('click', () => modalData.classList.remove('active'));

    window.addEventListener('click', (e) => {
        if (e.target === modalCgu) modalCgu.classList.remove('active');
        if (e.target === modalPrivacy) modalPrivacy.classList.remove('active');
        if (e.target === modalData) modalData.classList.remove('active');
    });

    // ----------------------------------------------------------------------
    // 18.5 BILINGUAL TRANSLATION ENGINE & DICTIONARY
    // ----------------------------------------------------------------------
    const translations = {
        fr: {
            nav_how_it_works: "Comment négocier",
            nav_faq: "FAQ",
            nav_support: "Support",
            nav_backoffice: "Backoffice",
            nav_enter_bourse: "Accéder à la Bourse",
            hero_badge: "Bourse d'Opinions P2P",
            hero_title: "La première Bourse de Prédictions en Afrique",
            hero_desc: "Prenez position sur la politique, la musique, le cinéma et l'économie locale. Investissez sur vos convictions, suivez les cotes et liquidez vos gains par Orange Money, MTN MoMo, Airtel Money, Wave ou Moov.",
            hero_start_btn: "Commencer à négocier",
            hero_admin_btn: "Backoffice Admin",
            hero_metric_volume: "Volume Échangé",
            hero_metric_countries: "Régions Couvertes",
            hero_metric_live: "Mise à jour Live",
            cat_politics: "Politique",
            cat_music: "Musique",
            mock_title_senegal: "Présidentielle Sénégal : Qui succédera à Diomaye Faye ?",
            mock_odds_senegal_yes: "Oui @ 1.85",
            mock_odds_senegal_no: "Non @ 2.10",
            mock_title_burna: "Grammy Award 2027 pour Burna Boy ?",
            mock_odds_burna_yes: "Oui @ 1.65",
            mock_odds_burna_no: "Non @ 2.30",
            steps_title: "Comment ça marche ?",
            steps_desc: "Négociez sur la bourse d'opinions en 4 étapes simples.",
            step_1_title: "Sélectionnez votre Région",
            step_1_desc: "Choisissez votre pays dans le sélecteur pour adapter automatiquement la devise et les réseaux mobiles disponibles.",
            step_2_title: "Créditez votre Portefeuille",
            step_2_desc: "Déposez instantanément des fonds de manière sécurisée en utilisant votre compte Orange, MTN, Wave, Airtel ou Moov.",
            step_3_title: "Prenez Position",
            step_3_desc: "Achetez des parts sur le Oui ou le Non pour les questions d'actualité. Suivez les cotes et optimisez vos rendements.",
            step_4_title: "Retirez vos liquidités",
            step_4_desc: "Une fois le marché clôturé, liquidez votre position et effectuez un retrait mobile money instantané vers votre téléphone.",
            ussd_badge: "Exclusivité MVP",
            ussd_title: "Négociez par USSD sans Internet",
            ussd_desc: `PredicAfrica innove en simulant un protocole USSD complet. Composez le <strong class="text--emerald">*855#</strong> sur notre téléphone interactif pour consulter votre solde, acheter des parts ou retirer vos gains directement depuis les réseaux télécoms locaux simulés.`,
            ussd_step_1: `Composez <strong>*855#</strong> et cliquez sur le bouton d'appel vert.`,
            ussd_step_2: "Parcourez les menus popups GSM pour acheter des parts.",
            ussd_step_3: `Confirmez avec le PIN <code>1234</code> et observez la mise à jour de vos positions.`,
            ussd_phone_carrier: "Afrique Telecom",
            ussd_input_placeholder: "Saisissez un chiffre...",
            ussd_btn_cancel: "Annuler",
            ussd_btn_send: "Envoyer",
            faq_title: "Foire Aux Questions (FAQ)",
            faq_desc: "Tout ce qu'il faut savoir sur PredicAfrica.",
            faq_q1: "Qu'est-ce qu'une bourse de prédictions ?",
            faq_a1: "Une bourse de prédictions est une plateforme financière sur laquelle vous pouvez acheter des contrats (parts) liés à la réalisation d'événements futurs. Si l'événement se réalise, le contrat prend de la valeur et vous encaissez un rendement basé sur le multiplicateur de cotes garanti lors de votre achat.",
            faq_q2: "Comment fonctionne la simulation de Mobile Money ?",
            faq_a2: "Il s'agit d'un simulateur GSM interactif. Vous pouvez simuler des recharges et des retraits d'argent en entrant un numéro et en saisissant un code secret fictif à 4 chiffres (comme 1234). Cela vous permet de valider le comportement fonctionnel de la plateforme.",
            faq_q3: "Les retraits de fonds sont-ils instantanés ?",
            faq_a3: "Oui. En cliquant sur le bouton Retirer de votre portefeuille, le simulateur traite la transaction en 2 secondes et met à jour instantanément votre compte virtuel, comme un retrait Mobile Money en production.",
            faq_q4: "Est-ce légal et sécurisé ?",
            faq_a4: "Il s'agit ici d'une simulation MVP destinée à présenter le design technique et l'expérience utilisateur. Aucune transaction financière réelle n'est effectuée. Les soldes et les dépôts sont purement virtuels et stockés localement.",
            calc_title: "Simulateur de Gains & Rendements",
            calc_desc: "Estimez vos profits potentiels en fonction de vos investissements et des cotes de marché.",
            calc_label_market: "Sélectionnez un Marché",
            calc_opt_1: "Présidentielle Sénégal (Oui @ 1.85)",
            calc_opt_2: "Grammy Award Burna Boy (Non @ 2.30)",
            calc_opt_3: "Monnaie ECO CEDEAO (Oui @ 2.80)",
            calc_opt_4: "FESPACO Alain Gomis (Non @ 1.60)",
            calc_opt_custom: "Autre Cote (Personnalisée)",
            calc_label_odds: "Cote / Multiplicateur",
            calc_label_amount: `Montant à investir (<span class="calc-currency-lbl">XOF</span>)`,
            calc_label_outcome: "Résultat Simulé",
            calc_opt_win: "Position gagnante (Correcte)",
            calc_opt_loss: "Position perdante (Incorrecte)",
            calc_result_gross_lbl: "Rendement Brut Potentiel :",
            calc_result_net_lbl: "Bénéfice Net :",
            calc_result_status_lbl: "Statut Estimé :",
            contact_title: "Contact & Support",
            contact_desc: "Notre équipe de support est disponible pour vous assister. Envoyez-nous un message.",
            contact_card_email_title: "✉️ E-mail",
            contact_card_offices_title: "📍 Bureaux",
            contact_card_offices_desc: "Dakar Design Hub, Avenue Cheikh Anta Diop, Dakar, Sénégal",
            contact_card_phone_title: "📞 Téléphone",
            contact_label_lastname: "Nom",
            contact_placeholder_lastname: "Votre nom",
            contact_label_firstname: "Prénom",
            contact_placeholder_firstname: "Votre prénom",
            contact_label_email: "Adresse e-mail",
            contact_placeholder_email: "nom@exemple.com",
            contact_label_message: "Votre message",
            contact_placeholder_message: "Décrivez votre demande en détail...",
            contact_btn_send: "Envoyer le message",
            contact_success_msg: "✓ Message envoyé avec succès ! Notre équipe vous répondra sous 24h.",
            wa_chat_name: "Support PredicAfrica",
            wa_chat_status: "En ligne",
            wa_welcome: `Bonjour ! Je suis Ablaye du support PredicAfrica. Comment puis-je vous aider aujourd'hui ? 🌍<span class="msg-time">17:00</span>`,
            wa_input_placeholder: "Écrivez votre message...",
            footer_copyright: "© 2026 PredicAfrica. Tous droits réservés. (Simulation de démonstration MVP)",
            footer_link_cgu: "Conditions Générales",
            footer_link_privacy: "Confidentialité",
            footer_link_data: "Gestion des Données",
            cgu_title: "Conditions Générales d'Utilisation (CGU)",
            cgu_subtitle: "Dernière mise à jour : Juin 2026",
            cgu_content: `
                <h4 style="color: var(--text-primary); margin-top: var(--space-sm); font-size: 0.95rem;">1. Objet de la plateforme</h4>
                <p style="margin-bottom: var(--space-sm);">PredicAfrica est une plateforme de simulation pédagogique représentant une bourse d'opinions et de prédictions sur l'actualité africaine. L'ensemble des transactions, soldes de portefeuilles, cotes et gains sont fictifs et n'ont aucune valeur monétaire ou juridique réelle.</p>
                <h4 style="color: var(--text-primary); margin-top: var(--space-sm); font-size: 0.95rem;">2. Utilisation du service</h4>
                <p style="margin-bottom: var(--space-sm);">L'utilisation de la plateforme est réservée à des fins de divertissement et de démonstration technique. Tout abus ou tentative de manipulation des scripts locaux (localStorage) à des fins de fraude n'affecte que l'instance locale de l'utilisateur.</p>
                <h4 style="color: var(--text-primary); margin-top: var(--space-sm); font-size: 0.95rem;">3. Limitation de responsabilité</h4>
                <p style="margin-bottom: var(--space-sm);">Les concepteurs de PredicAfrica ne sauraient être tenus responsables de toute mauvaise interprétation du caractère financier de cette application, celle-ci étant strictement un prototype (MVP).</p>
            `,
            privacy_title: "Politique de Confidentialité",
            privacy_subtitle: "Respect de votre vie privée",
            privacy_content: `
                <h4 style="color: var(--text-primary); margin-top: var(--space-sm); font-size: 0.95rem;">1. Collecte des données</h4>
                <p style="margin-bottom: var(--space-sm);">PredicAfrica ne collecte aucune donnée personnelle sur ses serveurs. L'ensemble des données d'utilisation (solde de portefeuille, positions achetées, historique des recharges et retraits) est stocké localement et exclusivement dans le navigateur de l'utilisateur via le mécanisme de <code>localStorage</code>.</p>
                <h4 style="color: var(--text-primary); margin-top: var(--space-sm); font-size: 0.95rem;">2. Transmission des données</h4>
                <p style="margin-bottom: var(--space-sm);">Aucune donnée n'est transmise à des tiers ou hébergée à l'extérieur de votre appareil. En vidant le cache de votre navigateur ou en effaçant les données de site, l'ensemble de votre historique sera définitivement supprimé.</p>
            `,
            data_title: "Gestion des Données Personnelles",
            data_subtitle: "Contrôle de vos informations locales",
            data_content: `
                <h4 style="color: var(--text-primary); margin-top: var(--space-sm); font-size: 0.95rem;">1. Droit d'accès et de rectification</h4>
                <p style="margin-bottom: var(--space-sm);">Conformément aux réglementations sur la protection des données (RGPD / lois africaines sur la protection de la vie privée), vous disposez du contrôle total sur vos données. Comme celles-ci sont stockées localement, vous pouvez les modifier directement en effectuant des recharges, retraits ou en réinitialisant le simulateur depuis le panneau d'administration (Backoffice).</p>
                <h4 style="color: var(--text-primary); margin-top: var(--space-sm); font-size: 0.95rem;">2. Cookies et traceurs</h4>
                <p style="margin-bottom: var(--space-sm);">Cette application n'utilise aucun cookie tiers ou traceur publicitaire. Seul le stockage local technique est exploité pour mémoriser l'état de votre portefeuille d'une session à l'autre.</p>
            `,
            calc_status_win: "Gagné",
            calc_status_loss: "Perdu"
        },
        en: {
            nav_how_it_works: "How it works",
            nav_faq: "FAQ",
            nav_support: "Support",
            nav_backoffice: "Backoffice",
            nav_enter_bourse: "Access Bourse",
            hero_badge: "P2P Opinions Exchange",
            hero_title: "The First Prediction Market in Africa",
            hero_desc: "Take positions on politics, music, cinema, and local economy. Invest in your convictions, track odds, and liquidate your earnings via Orange Money, MTN MoMo, Airtel Money, Wave, or Moov.",
            hero_start_btn: "Start Trading",
            hero_admin_btn: "Admin Backoffice",
            hero_metric_volume: "Volume Traded",
            hero_metric_countries: "Regions Covered",
            hero_metric_live: "Live Updates",
            cat_politics: "Politics",
            cat_music: "Music",
            mock_title_senegal: "Senegal Presidential: Who will succeed Diomaye Faye?",
            mock_odds_senegal_yes: "Yes @ 1.85",
            mock_odds_senegal_no: "No @ 2.10",
            mock_title_burna: "Grammy Award 2027 for Burna Boy?",
            mock_odds_burna_yes: "Yes @ 1.65",
            mock_odds_burna_no: "No @ 2.30",
            steps_title: "How it works?",
            steps_desc: "Trade on the opinions market in 4 simple steps.",
            step_1_title: "Select your Region",
            step_1_desc: "Choose your country in the selector to automatically adapt the currency and available mobile networks.",
            step_2_title: "Fund your Wallet",
            step_2_desc: "Deposit funds instantly and securely using your Orange, MTN, Wave, Airtel, or Moov account.",
            step_3_title: "Take a Position",
            step_3_desc: "Buy shares on Yes or No for current event questions. Follow the odds and optimize your returns.",
            step_4_title: "Withdraw Liquidity",
            step_4_desc: "Once the market is closed, liquidate your position and make an instant mobile money withdrawal to your phone.",
            ussd_badge: "MVP Exclusive",
            ussd_title: "Trade via USSD without Internet",
            ussd_desc: `PredicAfrica innovates by simulating a full USSD protocol. Dial <strong class="text--emerald">*855#</strong> on our interactive phone mockup to check your balance, buy shares, or withdraw your gains directly from simulated local telecom networks.`,
            ussd_step_1: `Dial <strong>*855#</strong> and click the green call button.`,
            ussd_step_2: "Browse through the GSM popup menus to buy shares.",
            ussd_step_3: `Confirm with PIN <code>1234</code> and watch your positions update.`,
            ussd_phone_carrier: "Africa Telecom",
            ussd_input_placeholder: "Enter a number...",
            ussd_btn_cancel: "Cancel",
            ussd_btn_send: "Send",
            faq_title: "Frequently Asked Questions (FAQ)",
            faq_desc: "Everything you need to know about PredicAfrica.",
            faq_q1: "What is a prediction market?",
            faq_a1: "A prediction market is a financial platform where you can buy contracts (shares) tied to the outcome of future events. If the event happens, the contract increases in value and you collect a return based on the odds multiplier guaranteed at purchase.",
            faq_q2: "How does the Mobile Money simulation work?",
            faq_a2: "It is an interactive GSM simulator. You can simulate deposits and withdrawals by entering a phone number and typing a dummy 4-digit secret code (such as 1234). This allows you to validate the platform's functional behavior.",
            faq_q3: "Are fund withdrawals instant?",
            faq_a3: "Yes. By clicking the Withdraw button in your wallet, the simulator processes the transaction in 2 seconds and instantly updates your virtual account, just like a production Mobile Money withdrawal.",
            faq_q4: "Is it legal and secure?",
            faq_a4: "This is an MVP simulation designed to present the technical design and user experience. No real financial transactions are made. Balances and deposits are purely virtual and stored locally.",
            calc_title: "Yield & Return Simulator",
            calc_desc: "Estimate your potential profits based on your investments and market odds.",
            calc_label_market: "Select a Market",
            calc_opt_1: "Senegal Presidential (Yes @ 1.85)",
            calc_opt_2: "Grammy Award Burna Boy (No @ 2.30)",
            calc_opt_3: "ECO Currency ECOWAS (Yes @ 2.80)",
            calc_opt_4: "FESPACO Alain Gomis (No @ 1.60)",
            calc_opt_custom: "Other Odds (Custom)",
            calc_label_odds: "Odds / Multiplier",
            calc_label_amount: `Amount to invest (<span class="calc-currency-lbl">XOF</span>)`,
            calc_label_outcome: "Simulated Outcome",
            calc_opt_win: "Winning Position (Correct)",
            calc_opt_loss: "Losing Position (Incorrect)",
            calc_result_gross_lbl: "Potential Gross Return:",
            calc_result_net_lbl: "Net Profit:",
            calc_result_status_lbl: "Estimated Status:",
            contact_title: "Contact & Support",
            contact_desc: "Our support team is available to assist you. Send us a message.",
            contact_card_email_title: "✉️ Email",
            contact_card_offices_title: "📍 Offices",
            contact_card_offices_desc: "Dakar Design Hub, Avenue Cheikh Anta Diop, Dakar, Senegal",
            contact_card_phone_title: "📞 Phone",
            contact_label_lastname: "Last Name",
            contact_placeholder_lastname: "Your last name",
            contact_label_firstname: "First Name",
            contact_placeholder_firstname: "Your first name",
            contact_label_email: "Email Address",
            contact_placeholder_email: "name@example.com",
            contact_label_message: "Your message",
            contact_placeholder_message: "Describe your request in detail...",
            contact_btn_send: "Send message",
            contact_success_msg: "✓ Message sent successfully! Our team will reply within 24 hours.",
            wa_chat_name: "PredicAfrica Support",
            wa_chat_status: "Online",
            wa_welcome: `Hello! I am Ablaye from PredicAfrica support. How can I help you today? 🌍<span class="msg-time">17:00</span>`,
            wa_input_placeholder: "Type your message...",
            footer_copyright: "© 2026 PredicAfrica. All rights reserved. (MVP Demonstration Simulation)",
            footer_link_cgu: "Terms & Conditions",
            footer_link_privacy: "Privacy Policy",
            footer_link_data: "Data Management",
            cgu_title: "General Terms of Use (TOU)",
            cgu_subtitle: "Last updated: June 2026",
            cgu_content: `
                <h4 style="color: var(--text-primary); margin-top: var(--space-sm); font-size: 0.95rem;">1. Object of the platform</h4>
                <p style="margin-bottom: var(--space-sm);">PredicAfrica is an educational simulation platform representing an opinion and prediction exchange on African current events. All transactions, wallet balances, odds and gains are fictitious and have no real monetary or legal value.</p>
                <h4 style="color: var(--text-primary); margin-top: var(--space-sm); font-size: 0.95rem;">2. Use of service</h4>
                <p style="margin-bottom: var(--space-sm);">The use of the platform is reserved for entertainment and technical demonstration purposes. Any abuse or attempt to manipulate local scripts (localStorage) for fraud only affects the user's local instance.</p>
                <h4 style="color: var(--text-primary); margin-top: var(--space-sm); font-size: 0.95rem;">3. Limitation of liability</h4>
                <p style="margin-bottom: var(--space-sm);">The designers of PredicAfrica cannot be held responsible for any misinterpretation of the financial nature of this application, as it is strictly a prototype (MVP).</p>
            `,
            privacy_title: "Privacy Policy",
            privacy_subtitle: "Respecting your privacy",
            privacy_content: `
                <h4 style="color: var(--text-primary); margin-top: var(--space-sm); font-size: 0.95rem;">1. Data collection</h4>
                <p style="margin-bottom: var(--space-sm);">PredicAfrica does not collect any personal data on its servers. All usage data (wallet balance, positions bought, history of deposits and withdrawals) is stored locally and exclusively in the user's browser via the <code>localStorage</code> mechanism.</p>
                <h4 style="color: var(--text-primary); margin-top: var(--space-sm); font-size: 0.95rem;">2. Data transmission</h4>
                <p style="margin-bottom: var(--space-sm);">No data is transmitted to third parties or hosted outside your device. Clearing your browser cache or deleting site data will permanently delete all your history.</p>
            `,
            data_title: "Personal Data Management",
            data_subtitle: "Control of your local information",
            data_content: `
                <h4 style="color: var(--text-primary); margin-top: var(--space-sm); font-size: 0.95rem;">1. Right of access and rectification</h4>
                <p style="margin-bottom: var(--space-sm);">In accordance with data protection regulations (GDPR / African privacy laws), you have full control over your data. As these are stored locally, you can modify them directly by making deposits, withdrawals or by resetting the simulator from the admin panel (Backoffice).</p>
                <h4 style="color: var(--text-primary); margin-top: var(--space-sm); font-size: 0.95rem;">2. Cookies and trackers</h4>
                <p style="margin-bottom: var(--space-sm);">This application does not use any third-party cookies or advertising trackers. Only technical local storage is used to remember your wallet state from one session to another.</p>
            `,
            calc_status_win: "Won",
            calc_status_loss: "Lost"
        }
    };

    function setLanguage(lang) {
        localStorage.setItem('pa_lang', lang);
        
        document.querySelectorAll('.lang-btn').forEach(btn => {
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });
        
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            if (translations[lang] && translations[lang][key]) {
                el.innerHTML = translations[lang][key];
            }
        });
        
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (translations[lang] && translations[lang][key]) {
                el.placeholder = translations[lang][key];
            }
        });
        
        // Redraw active USSD simulator screen with updated language strings
        if (ussdState) {
            const currency = getCurrencySymbol();
            if (ussdState === 'MAIN_MENU') {
                showUSSDMainMenu();
            } else if (ussdState === 'REG_START') {
                showUSSDRegistration();
            } else if (ussdState === 'CATEGORIES_MENU') {
                if (ussdDialogMessage) {
                    ussdDialogMessage.innerHTML = getUSSDTranslation('cat_menu_title', currency);
                }
                if (ussdDialogInputVal) {
                    ussdDialogInputVal.placeholder = getUSSDTranslation('cat_menu_placeholder', currency);
                }
            } else if (ussdState === 'PORTFOLIO_MENU') {
                if (ussdDialogMessage) {
                    ussdDialogMessage.innerHTML = getUSSDTranslation('portfolio_title', currency, { balance: formatCurrency(balance) });
                }
                if (ussdDialogInputVal) {
                    ussdDialogInputVal.placeholder = getUSSDTranslation('portfolio_placeholder', currency);
                }
            } else if (ussdState === 'WITHDRAW_AMOUNT') {
                if (ussdDialogMessage) {
                    ussdDialogMessage.innerHTML = getUSSDTranslation('withdraw_title', currency, { balance: formatCurrency(balance) });
                }
                if (ussdDialogInputVal) {
                    ussdDialogInputVal.placeholder = getUSSDTranslation('withdraw_placeholder', currency);
                }
            } else if (ussdState === 'PREDICTIONS_MENU') {
                showUSSDPredictions();
            }
        }
        
        // Refresh profit calculator output labels
        if (typeof updateProfitCalculator === 'function') {
            updateProfitCalculator();
        }
    }

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            setLanguage(lang);
        });
    });

    // ----------------------------------------------------------------------
    // 19. YIELD & STAKE PROFIT CALCULATOR
    // ----------------------------------------------------------------------
    const calcMarketSelect = document.getElementById('calc-market');
    const calcCustomOddsGroup = document.getElementById('calc-custom-odds-group');
    const calcOddsInput = document.getElementById('calc-odds');
    const calcAmountInput = document.getElementById('calc-amount');
    const calcOutcomeSelect = document.getElementById('calc-outcome');
    
    const calcResultGross = document.getElementById('calc-result-gross');
    const calcResultNet = document.getElementById('calc-result-net');
    const calcResultStatus = document.getElementById('calc-result-status');
    const calcCurrencyLbls = document.querySelectorAll('.calc-currency-lbl');

    function updateProfitCalculator() {
        const currency = getCurrencySymbol();
        
        calcCurrencyLbls.forEach(el => el.textContent = currency);

        let odds = 1.0;
        if (calcMarketSelect && calcMarketSelect.value === 'custom') {
            if (calcCustomOddsGroup) calcCustomOddsGroup.style.display = 'block';
            odds = parseFloat(calcOddsInput ? calcOddsInput.value : '2.00') || 1.0;
        } else {
            if (calcCustomOddsGroup) calcCustomOddsGroup.style.display = 'none';
            odds = parseFloat(calcMarketSelect ? calcMarketSelect.value : '1.85') || 1.0;
        }

        const amount = parseFloat(calcAmountInput ? calcAmountInput.value : '5000') || 0;
        const outcome = calcOutcomeSelect ? calcOutcomeSelect.value : 'win';

        let gross = 0;
        let net = 0;

        if (outcome === 'win') {
            gross = Math.floor(amount * odds);
            net = gross - amount;
            
            if (calcResultGross) {
                calcResultGross.textContent = `${formatCurrency(gross)} ${currency}`;
                calcResultGross.className = 'text--emerald';
            }
            if (calcResultNet) {
                calcResultNet.textContent = `+${formatCurrency(net)} ${currency}`;
                calcResultNet.className = 'text--gold';
            }
            if (calcResultStatus) {
                const lang = localStorage.getItem('pa_lang') || 'fr';
                calcResultStatus.textContent = translations[lang] && translations[lang].calc_status_win ? translations[lang].calc_status_win : 'Gagné';
                calcResultStatus.style.backgroundColor = 'var(--accent-emerald-trans)';
                calcResultStatus.style.color = 'var(--accent-emerald)';
            }
        } else {
            gross = 0;
            net = -amount;
            
            if (calcResultGross) {
                calcResultGross.textContent = `0 ${currency}`;
                calcResultGross.className = 'text--muted';
            }
            if (calcResultNet) {
                calcResultNet.textContent = `${formatCurrency(net)} ${currency}`;
                calcResultNet.className = 'text--red';
            }
            if (calcResultStatus) {
                const lang = localStorage.getItem('pa_lang') || 'fr';
                calcResultStatus.textContent = translations[lang] && translations[lang].calc_status_loss ? translations[lang].calc_status_loss : 'Perdu';
                calcResultStatus.style.backgroundColor = 'var(--accent-red-trans)';
                calcResultStatus.style.color = 'var(--accent-red)';
            }
        }
    }

    if (calcMarketSelect) calcMarketSelect.addEventListener('change', updateProfitCalculator);
    if (calcOddsInput) calcOddsInput.addEventListener('input', updateProfitCalculator);
    if (calcAmountInput) calcAmountInput.addEventListener('input', updateProfitCalculator);
    if (calcOutcomeSelect) calcOutcomeSelect.addEventListener('change', updateProfitCalculator);

    // ----------------------------------------------------------------------
    // INITIAL BOOTSTRAPPING & SETUP
    // ----------------------------------------------------------------------
    if (appLanding) appLanding.style.display = 'block';
    if (appWorkspace) appWorkspace.style.display = 'none';

    updateWalletUI();
    renderPredictions('all', '');
    populateWithdrawOperators();
    updateProfitCalculator();
    setLanguage(localStorage.getItem('pa_lang') || 'fr');

});

/**
 * Module de gestion de l'interface utilisateur pour l'application d'évaluation des concepteurs
 */

const UIManager = (function() {
    // Éléments de navigation
    const navLinks = {
        bareme: document.getElementById('nav-bareme'),
        concepteurs: document.getElementById('nav-concepteurs'),
        evaluation: document.getElementById('nav-evaluation'),
        resultats: document.getElementById('nav-resultats')
    };
    
    // Sections
    const sections = {
        bareme: document.getElementById('section-bareme'),
        concepteurs: document.getElementById('section-concepteurs'),
        evaluation: document.getElementById('section-evaluation'),
        resultats: document.getElementById('section-resultats')
    };
    
    // Éléments du barème
    const baremeElements = {
        questionsList: document.getElementById('questions-list'),
        addQuestionBtn: document.getElementById('add-question'),
        saveBaremeBtn: document.getElementById('save-bareme')
    };
    
    // Éléments des concepteurs
    const concepteursElements = {
        form: document.getElementById('form-concepteur'),
        nomInput: document.getElementById('nom-concepteur'),
        specialiteInput: document.getElementById('specialite-concepteur'),
        list: document.getElementById('concepteurs-list')
    };
    
    // Éléments d'évaluation
    const evaluationElements = {
        header: document.getElementById('evaluation-header'),
        selectConcepteur: document.getElementById('select-concepteur'),
        form: document.getElementById('evaluation-form'),
        saveBtn: document.getElementById('save-evaluation')
    };
    
    // Éléments des résultats
    const resultatsElements = {
        list: document.getElementById('resultats-list'),
        details: document.getElementById('details-evaluation'),
        detailsContent: document.getElementById('details-content'),
        closeDetailsBtn: document.getElementById('close-details')
    };
    
    // Templates
    const templates = {
        question: document.getElementById('template-question'),
        reponse: document.getElementById('template-reponse'),
        concepteurItem: document.getElementById('template-concepteur-item'),
        evaluationQuestion: document.getElementById('template-evaluation-question'),
        evaluationReponse: document.getElementById('template-evaluation-reponse'),
        resultatItem: document.getElementById('template-resultat-item'),
        detailItem: document.getElementById('template-detail-item')
    };
    
    /**
     * Initialise les gestionnaires d'événements
     */
    function init() {
        // Navigation
        for (const key in navLinks) {
            navLinks[key].addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo(key);
            });
        }
        
        // Barème
        baremeElements.addQuestionBtn.addEventListener('click', addQuestion);
        baremeElements.saveBaremeBtn.addEventListener('click', saveBareme);
        
        // Concepteurs
        concepteursElements.form.addEventListener('submit', handleConcepteurSubmit);
        
        // Évaluation
        evaluationElements.selectConcepteur.addEventListener('change', handleConcepteurSelect);
        evaluationElements.saveBtn.addEventListener('click', saveEvaluation);
        
        // Résultats
        resultatsElements.closeDetailsBtn.addEventListener('click', () => {
            resultatsElements.details.classList.add('hidden');
        });
    }
    
    /**
     * Change la section active
     * @param {string} section - Nom de la section à afficher
     */
    function navigateTo(section) {
        // Mettre à jour les liens de navigation
        for (const key in navLinks) {
            navLinks[key].classList.toggle('active', key === section);
        }
        
        // Mettre à jour les sections
        for (const key in sections) {
            sections[key].classList.toggle('active', key === section);
        }
        
        // Actions spécifiques selon la section
        if (section === 'bareme') {
            renderBareme();
        } else if (section === 'concepteurs') {
            renderConcepteurs();
        } else if (section === 'evaluation') {
            renderEvaluationSelect();
        } else if (section === 'resultats') {
            renderResultats();
        }
    }
    
    /**
     * Affiche le barème
     */
    function renderBareme() {
        const bareme = DataManager.getBareme();
        baremeElements.questionsList.innerHTML = '';
        
        bareme.questions.forEach((question, index) => {
            const questionElement = createQuestionElement(question, index + 1);
            baremeElements.questionsList.appendChild(questionElement);
        });
    }
    
    /**
     * Crée un élément de question à partir du template
     * @param {Object} question - Données de la question
     * @param {number} number - Numéro de la question
     * @returns {HTMLElement} Élément DOM de la question
     */
    function createQuestionElement(question, number) {
        const template = templates.question.content.cloneNode(true);
        const questionElement = template.querySelector('.question-item');
        
        questionElement.dataset.id = question.id;
        questionElement.querySelector('.question-number').textContent = number;
        questionElement.querySelector('.question-text').value = question.text;
        
        // Événements
        questionElement.querySelector('.edit-question').addEventListener('click', () => {
            // Focus sur le champ de texte
            questionElement.querySelector('.question-text').focus();
        });
        
        questionElement.querySelector('.delete-question').addEventListener('click', () => {
            if (confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
                DataManager.deleteQuestion(parseInt(question.id, 10));
                renderBareme();
            }
        });
        
        questionElement.querySelector('.question-text').addEventListener('change', (e) => {
            DataManager.updateQuestion(parseInt(question.id, 10), e.target.value);
        });
        
        questionElement.querySelector('.add-reponse').addEventListener('click', () => {
            addReponse(parseInt(question.id, 10));
        });
        
        // Ajouter les réponses existantes
        const reponsesList = questionElement.querySelector('.reponses-list');
        question.reponses.forEach(reponse => {
            const reponseElement = createReponseElement(question.id, reponse);
            reponsesList.appendChild(reponseElement);
        });
        
        return questionElement;
    }
    
    /**
     * Crée un élément de réponse à partir du template
     * @param {number} questionId - ID de la question
     * @param {Object} reponse - Données de la réponse
     * @returns {HTMLElement} Élément DOM de la réponse
     */
    function createReponseElement(questionId, reponse) {
        const template = templates.reponse.content.cloneNode(true);
        const reponseElement = template.querySelector('.reponse-item');
        
        reponseElement.dataset.id = reponse.id;
        reponseElement.querySelector('.reponse-text').value = reponse.text;
        reponseElement.querySelector('.reponse-score').value = reponse.score;
        
        // Événements
        reponseElement.querySelector('.reponse-text').addEventListener('change', (e) => {
            DataManager.updateReponse(
                parseInt(questionId, 10),
                parseInt(reponse.id, 10),
                e.target.value,
                reponseElement.querySelector('.reponse-score').value
            );
        });
        
        reponseElement.querySelector('.reponse-score').addEventListener('change', (e) => {
            DataManager.updateReponse(
                parseInt(questionId, 10),
                parseInt(reponse.id, 10),
                reponseElement.querySelector('.reponse-text').value,
                e.target.value
            );
        });
        
        reponseElement.querySelector('.delete-reponse').addEventListener('click', () => {
            if (confirm('Êtes-vous sûr de vouloir supprimer cette réponse ?')) {
                DataManager.deleteReponse(parseInt(questionId, 10), parseInt(reponse.id, 10));
                renderBareme();
            }
        });
        
        return reponseElement;
    }
    
    /**
     * Ajoute une nouvelle question au barème
     */
    function addQuestion() {
        const newQuestion = DataManager.addQuestion();
        const questionElement = createQuestionElement(newQuestion, DataManager.getBareme().questions.length);
        baremeElements.questionsList.appendChild(questionElement);
        
        // Focus sur le champ de texte
        questionElement.querySelector('.question-text').focus();
    }
    
    /**
     * Ajoute une nouvelle réponse à une question
     * @param {number} questionId - ID de la question
     */
    function addReponse(questionId) {
        const newReponse = DataManager.addReponse(questionId);
        if (!newReponse) return;
        
        const questionElement = document.querySelector(`.question-item[data-id="${questionId}"]`);
        if (!questionElement) return;
        
        const reponsesList = questionElement.querySelector('.reponses-list');
        const reponseElement = createReponseElement(questionId, newReponse);
        reponsesList.appendChild(reponseElement);
        
        // Focus sur le champ de texte
        reponseElement.querySelector('.reponse-text').focus();
    }
    
    /**
     * Sauvegarde le barème
     */
    function saveBareme() {
        DataManager.saveBareme();
        alert('Barème enregistré avec succès !');
    }
    
    /**
     * Affiche la liste des concepteurs
     */
    function renderConcepteurs() {
        const concepteurs = DataManager.getConcepteurs();
        concepteursElements.list.innerHTML = '';
        
        concepteurs.forEach(concepteur => {
            const concepteurElement = createConcepteurElement(concepteur);
            concepteursElements.list.appendChild(concepteurElement);
        });
    }
    
    /**
     * Crée un élément de concepteur à partir du template
     * @param {Object} concepteur - Données du concepteur
     * @returns {HTMLElement} Élément DOM du concepteur
     */
    function createConcepteurElement(concepteur) {
        const template = templates.concepteurItem.content.cloneNode(true);
        const concepteurElement = template.querySelector('.concepteur-item');
        
        concepteurElement.dataset.id = concepteur.id;
        concepteurElement.querySelector('h4').textContent = concepteur.nom;
        concepteurElement.querySelector('p').textContent = concepteur.specialite;
        
        // Événements
        concepteurElement.querySelector('.edit-concepteur').addEventListener('click', () => {
            // Remplir le formulaire pour édition
            concepteursElements.nomInput.value = concepteur.nom;
            concepteursElements.specialiteInput.value = concepteur.specialite;
            concepteursElements.form.dataset.editId = concepteur.id;
            concepteursElements.form.querySelector('button[type="submit"]').textContent = 'Modifier';
        });
        
        concepteurElement.querySelector('.delete-concepteur').addEventListener('click', () => {
            if (confirm('Êtes-vous sûr de vouloir supprimer ce concepteur ?')) {
                DataManager.deleteConcepteur(parseInt(concepteur.id, 10));
                renderConcepteurs();
                renderEvaluationSelect();
                renderResultats();
            }
        });
        
        return concepteurElement;
    }
    
    /**
     * Gère la soumission du formulaire de concepteur
     * @param {Event} e - Événement de soumission
     */
    function handleConcepteurSubmit(e) {
        e.preventDefault();
        
        const nom = concepteursElements.nomInput.value.trim();
        const specialite = concepteursElements.specialiteInput.value.trim();
        
        if (!nom || !specialite) {
            alert('Veuillez remplir tous les champs.');
            return;
        }
        
        const editId = concepteursElements.form.dataset.editId;
        
        if (editId) {
            // Mode édition
            DataManager.updateConcepteur(parseInt(editId, 10), nom, specialite);
            delete concepteursElements.form.dataset.editId;
            concepteursElements.form.querySelector('button[type="submit"]').textContent = 'Ajouter';
        } else {
            // Mode ajout
            DataManager.addConcepteur(nom, specialite);
        }
        
        // Réinitialiser le formulaire
        concepteursElements.form.reset();
        
        // Mettre à jour les listes
        renderConcepteurs();
        renderEvaluationSelect();
    }
    
    /**
     * Affiche le sélecteur de concepteur pour l'évaluation
     */
    function renderEvaluationSelect() {
        const concepteurs = DataManager.getConcepteurs();
        evaluationElements.selectConcepteur.innerHTML = '<option value="">-- Choisir un concepteur --</option>';
        
        concepteurs.forEach(concepteur => {
            const option = document.createElement('option');
            option.value = concepteur.id;
            option.textContent = `${concepteur.nom} (${concepteur.specialite})${concepteur.evaluation ? ' - Évalué' : ''}`;
            evaluationElements.selectConcepteur.appendChild(option);
        });
        
        // Cacher le formulaire d'évaluation
        evaluationElements.form.classList.add('hidden');
        evaluationElements.saveBtn.classList.add('hidden');
    }
    
    /**
     * Gère la sélection d'un concepteur pour l'évaluation
     */
    function handleConcepteurSelect() {
        const concepteurId = parseInt(evaluationElements.selectConcepteur.value, 10);
        
        if (!concepteurId) {
            evaluationElements.form.classList.add('hidden');
            evaluationElements.saveBtn.classList.add('hidden');
            return;
        }
        
        // Afficher le formulaire d'évaluation
        renderEvaluationForm(concepteurId);
        evaluationElements.form.classList.remove('hidden');
        evaluationElements.saveBtn.classList.remove('hidden');
    }
    
    /**
     * Affiche le formulaire d'évaluation pour un concepteur
     * @param {number} concepteurId - ID du concepteur
     */
    function renderEvaluationForm(concepteurId) {
        const bareme = DataManager.getBareme();
        const concepteurs = DataManager.getConcepteurs();
        const concepteur = concepteurs.find(c => c.id === concepteurId);
        
        evaluationElements.form.innerHTML = '';
        evaluationElements.form.dataset.concepteurId = concepteurId;
        
        // Ajouter les informations du concepteur en cours d'évaluation
        if (concepteur) {
            const concepteurInfo = document.createElement('div');
            concepteurInfo.className = 'concepteur-en-evaluation';
            concepteurInfo.innerHTML = `
                <h4>Évaluation de : ${concepteur.nom}</h4>
                <p>Spécialité : ${concepteur.specialite}</p>
            `;
            evaluationElements.form.appendChild(concepteurInfo);
        }
        
        bareme.questions.forEach((question, index) => {
            const questionElement = createEvaluationQuestionElement(question, index + 1);
            evaluationElements.form.appendChild(questionElement);
        });
    }
    
    /**
     * Crée un élément de question d'évaluation à partir du template
     * @param {Object} question - Données de la question
     * @param {number} number - Numéro de la question
     * @returns {HTMLElement} Élément DOM de la question d'évaluation
     */
    function createEvaluationQuestionElement(question, number) {
        const template = templates.evaluationQuestion.content.cloneNode(true);
        const questionElement = template.querySelector('.evaluation-question');
        
        questionElement.dataset.id = question.id;
        questionElement.querySelector('h4').innerHTML = `${number}. ${question.text}`;
        
        const reponsesContainer = questionElement.querySelector('.evaluation-reponses');
        
        question.reponses.forEach(reponse => {
            const reponseElement = createEvaluationReponseElement(question.id, reponse);
            reponsesContainer.appendChild(reponseElement);
        });
        
        return questionElement;
    }
    
    /**
     * Crée un élément de réponse d'évaluation à partir du template
     * @param {number} questionId - ID de la question
     * @param {Object} reponse - Données de la réponse
     * @returns {HTMLElement} Élément DOM de la réponse d'évaluation
     */
    function createEvaluationReponseElement(questionId, reponse) {
        const template = templates.evaluationReponse.content.cloneNode(true);
        const reponseElement = template.querySelector('.evaluation-reponse');
        
        const input = reponseElement.querySelector('input');
        const label = reponseElement.querySelector('label');
        
        input.id = `reponse-${reponse.id}`;
        input.name = `question-${questionId}`;
        input.value = reponse.id;
        input.dataset.score = reponse.score;
        
        label.setAttribute('for', `reponse-${reponse.id}`);
        label.textContent = `${reponse.text}`;
        
        // Ajouter le score à côté du texte
        const scoreSpan = document.createElement('span');
        scoreSpan.className = 'reponse-score';
        scoreSpan.textContent = ` (${reponse.score} points)`;
        label.appendChild(scoreSpan);
        
        return reponseElement;
    }
    
    /**
     * Sauvegarde l'évaluation d'un concepteur
     */
    function saveEvaluation() {
        const concepteurId = parseInt(evaluationElements.form.dataset.concepteurId, 10);
        if (!concepteurId) return;
        
        const evaluation = {};
        let isComplete = true;
        
        // Récupérer les réponses sélectionnées
        const questions = evaluationElements.form.querySelectorAll('.evaluation-question');
        questions.forEach(questionElement => {
            const questionId = parseInt(questionElement.dataset.id, 10);
            const selectedReponse = questionElement.querySelector('input[type="radio"]:checked');
            
            if (selectedReponse) {
                evaluation[questionId] = parseInt(selectedReponse.value, 10);
            } else {
                isComplete = false;
            }
        });
        
        if (!isComplete) {
            alert('Veuillez répondre à toutes les questions.');
            return;
        }
        
        // Enregistrer l'évaluation
        DataManager.saveEvaluation(concepteurId, evaluation);
        
        alert('Évaluation enregistrée avec succès !');
        
        // Réinitialiser le formulaire
        evaluationElements.selectConcepteur.value = '';
        evaluationElements.form.classList.add('hidden');
        evaluationElements.saveBtn.classList.add('hidden');
        
        // Naviguer vers la section des résultats et mettre à jour l'affichage
        navigateTo('resultats');
    }

    function showEvaluationDetails(concepteurId) {
        const details = DataManager.getEvaluationDetails(concepteurId);
        const concepteur = DataManager.getConcepteurs().find(c => c.id === concepteurId);
        
        if (!details.length || !concepteur) {
            alert('Aucun détail disponible pour cette évaluation.');
            return;
        }
        
        resultatsElements.detailsContent.innerHTML = `
            <div class="details-header">
                <h4>${concepteur.nom}</h4>
                <p>${concepteur.specialite} - Score total: ${concepteur.score} points</p>
            </div>
        `;
        
        details.forEach((detail, index) => {
            const detailElement = createDetailElement(detail, index + 1);
            resultatsElements.detailsContent.appendChild(detailElement);
        });
        
        resultatsElements.details.classList.remove('hidden');
    }
    
    /**
     * Crée un élément de détail à partir du template
     * @param {Object} detail - Données du détail
     * @param {number} number - Numéro de la question
     * @returns {HTMLElement} Élément DOM du détail
     */
    function createDetailElement(detail, number) {
        const template = templates.detailItem.content.cloneNode(true);
        const detailElement = template.querySelector('.detail-item');
        
        detailElement.querySelector('h4').textContent = `${number}. ${detail.questionText}`;
        detailElement.querySelector('p:nth-child(2)').innerHTML = `<strong>Réponse:</strong> ${detail.reponseText}`;
        detailElement.querySelector('p:nth-child(3)').innerHTML = `<strong>Score:</strong> ${detail.score} points`;
        
        return detailElement;
    }
    
    /**
     * Affiche les résultats des évaluations
     */
    function renderResultats() {
        const concepteurs = DataManager.getConcepteursParScore();
        resultatsElements.list.innerHTML = '';
        
        concepteurs.forEach((concepteur, index) => {
            if (concepteur.evaluation) { // N'afficher que les concepteurs évalués
                const resultatElement = createResultatElement(concepteur, index + 1);
                resultatsElements.list.appendChild(resultatElement);
            }
        });
    }
    
    /**
     * Crée un élément de résultat à partir du template
     * @param {Object} concepteur - Données du concepteur
     * @param {number} rank - Classement du concepteur
     * @returns {HTMLElement} Élément DOM du résultat
     */
    function createResultatElement(concepteur, rank) {
        const template = templates.resultatItem.content.cloneNode(true);
        const resultatElement = template.querySelector('.resultat-item');
        
        resultatElement.dataset.id = concepteur.id;
        resultatElement.querySelector('.resultat-rank').textContent = rank;
        resultatElement.querySelector('h4').textContent = concepteur.nom;
        resultatElement.querySelector('p').textContent = concepteur.specialite;
        resultatElement.querySelector('.resultat-score').textContent = `${concepteur.score} points`;
        
        // Événement pour afficher les détails
        resultatElement.querySelector('.view-details').addEventListener('click', () => {
            showEvaluationDetails(concepteur.id);
        });

        // Événement pour exporter les détails
        resultatElement.querySelector('.btn-export-details').addEventListener('click', () => {
            exportEvaluationDetails(concepteur.id);
        });
        
        return resultatElement;
    }

    /**
     * Exporte les détails d'une évaluation au format CSV
     * @param {number} concepteurId - ID du concepteur
     */
    function exportEvaluationDetails(concepteurId) {
        const details = DataManager.getEvaluationDetails(concepteurId);
        const concepteur = DataManager.getConcepteurs().find(c => c.id === concepteurId);
        
        if (!details.length || !concepteur) {
            alert('Aucun détail disponible pour cette évaluation.');
            return;
        }
        
        // Entêtes CSV
        let csvContent = 'Numéro;Question;Réponse;Score\n';
        
        // Informations du concepteur en commentaire
        csvContent = `# Évaluation de ${concepteur.nom}\n`;
        csvContent += `# Spécialité: ${concepteur.specialite}\n`;
        csvContent += `# Score total: ${concepteur.score} points\n`;
        csvContent += 'Numéro;Question;Réponse;Score\n';
        
        // Données des questions et réponses
        details.forEach((detail, index) => {
            // Échapper les guillemets et les points-virgules dans les textes
            const questionText = detail.questionText.replace(/"/g, '""').replace(/;/g, ',');
            const reponseText = detail.reponseText.replace(/"/g, '""').replace(/;/g, ',');
            
            csvContent += `${index + 1};"${questionText}";"${reponseText}";${detail.score}\n`;
        });
        
        // Créer un blob et déclencher le téléchargement
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `evaluation_${concepteur.nom.replace(/\s+/g, '_')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
    
    // API publique
    return {
        init,
        navigateTo,
        renderBareme,
        renderConcepteurs,
        renderEvaluationSelect,
        renderResultats
    };
})();
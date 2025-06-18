/**
 * Module de gestion des données pour l'application d'évaluation des concepteurs
 */

const DataManager = (function() {
    // Stockage local des données
    let bareme = {
        questions: []
    };
    
    let concepteurs = [];
    
    // Identifiants uniques
    let nextQuestionId = 1;
    let nextReponseId = 1;
    let nextConcepteurId = 1;
    
    /**
     * Initialise les données depuis le stockage local
     */
    function init() {
        loadBareme();
        loadConcepteurs();
        
        // Initialiser les compteurs d'ID
        if (bareme.questions.length > 0) {
            const maxQuestionId = Math.max(...bareme.questions.map(q => q.id));
            nextQuestionId = maxQuestionId + 1;
            
            const allReponses = bareme.questions.flatMap(q => q.reponses);
            if (allReponses.length > 0) {
                const maxReponseId = Math.max(...allReponses.map(r => r.id));
                nextReponseId = maxReponseId + 1;
            }
        }
        
        if (concepteurs.length > 0) {
            const maxConcepteurId = Math.max(...concepteurs.map(c => c.id));
            nextConcepteurId = maxConcepteurId + 1;
        }
    }
    
    /**
     * Charge le barème depuis le stockage local
     */
    function loadBareme() {
        const savedBareme = localStorage.getItem('bareme');
        if (savedBareme) {
            bareme = JSON.parse(savedBareme);
        }
    }
    
    /**
     * Charge les concepteurs depuis le stockage local
     */
    function loadConcepteurs() {
        const savedConcepteurs = localStorage.getItem('concepteurs');
        if (savedConcepteurs) {
            concepteurs = JSON.parse(savedConcepteurs);
        }
    }
    
    /**
     * Sauvegarde le barème dans le stockage local
     */
    function saveBareme() {
        localStorage.setItem('bareme', JSON.stringify(bareme));
    }
    
    /**
     * Sauvegarde les concepteurs dans le stockage local
     */
    function saveConcepteurs() {
        localStorage.setItem('concepteurs', JSON.stringify(concepteurs));
    }
    
    /**
     * Ajoute une nouvelle question au barème
     * @returns {Object} La nouvelle question créée
     */
    function addQuestion() {
        const newQuestion = {
            id: nextQuestionId++,
            text: '',
            reponses: []
        };
        
        bareme.questions.push(newQuestion);
        return newQuestion;
    }
    
    /**
     * Met à jour une question existante
     * @param {number} questionId - ID de la question à mettre à jour
     * @param {string} text - Nouveau texte de la question
     */
    function updateQuestion(questionId, text) {
        const question = bareme.questions.find(q => q.id === questionId);
        if (question) {
            question.text = text;
        }
    }
    
    /**
     * Supprime une question du barème
     * @param {number} questionId - ID de la question à supprimer
     */
    function deleteQuestion(questionId) {
        const index = bareme.questions.findIndex(q => q.id === questionId);
        if (index !== -1) {
            bareme.questions.splice(index, 1);
        }
    }
    
    /**
     * Ajoute une nouvelle réponse à une question
     * @param {number} questionId - ID de la question
     * @returns {Object} La nouvelle réponse créée
     */
    function addReponse(questionId) {
        const question = bareme.questions.find(q => q.id === questionId);
        if (!question) return null;
        
        const newReponse = {
            id: nextReponseId++,
            text: '',
            score: 0
        };
        
        question.reponses.push(newReponse);
        return newReponse;
    }
    
    /**
     * Met à jour une réponse existante
     * @param {number} questionId - ID de la question
     * @param {number} reponseId - ID de la réponse
     * @param {string} text - Nouveau texte de la réponse
     * @param {number} score - Nouveau score de la réponse
     */
    function updateReponse(questionId, reponseId, text, score) {
        const question = bareme.questions.find(q => q.id === questionId);
        if (!question) return;
        
        const reponse = question.reponses.find(r => r.id === reponseId);
        if (reponse) {
            reponse.text = text;
            reponse.score = parseInt(score, 10);
        }
    }
    
    /**
     * Supprime une réponse d'une question
     * @param {number} questionId - ID de la question
     * @param {number} reponseId - ID de la réponse à supprimer
     */
    function deleteReponse(questionId, reponseId) {
        const question = bareme.questions.find(q => q.id === questionId);
        if (!question) return;
        
        const index = question.reponses.findIndex(r => r.id === reponseId);
        if (index !== -1) {
            question.reponses.splice(index, 1);
        }
    }
    
    /**
     * Ajoute un nouveau concepteur
     * @param {string} nom - Nom du concepteur
     * @param {string} specialite - Spécialité du concepteur
     * @returns {Object} Le nouveau concepteur créé
     */
    function addConcepteur(nom, specialite) {
        const newConcepteur = {
            id: nextConcepteurId++,
            nom,
            specialite,
            evaluation: null,
            score: 0
        };
        
        concepteurs.push(newConcepteur);
        saveConcepteurs();
        return newConcepteur;
    }
    
    /**
     * Met à jour un concepteur existant
     * @param {number} concepteurId - ID du concepteur
     * @param {string} nom - Nouveau nom du concepteur
     * @param {string} specialite - Nouvelle spécialité du concepteur
     */
    function updateConcepteur(concepteurId, nom, specialite) {
        const concepteur = concepteurs.find(c => c.id === concepteurId);
        if (concepteur) {
            concepteur.nom = nom;
            concepteur.specialite = specialite;
            saveConcepteurs();
        }
    }
    
    /**
     * Supprime un concepteur
     * @param {number} concepteurId - ID du concepteur à supprimer
     */
    function deleteConcepteur(concepteurId) {
        const index = concepteurs.findIndex(c => c.id === concepteurId);
        if (index !== -1) {
            concepteurs.splice(index, 1);
            saveConcepteurs();
        }
    }
    
    /**
     * Enregistre l'évaluation d'un concepteur
     * @param {number} concepteurId - ID du concepteur
     * @param {Object} evaluation - Objet contenant les réponses de l'évaluation
     */
    function saveEvaluation(concepteurId, evaluation) {
        const concepteur = concepteurs.find(c => c.id === concepteurId);
        if (!concepteur) return;
        
        // Calculer le score total
        let scoreTotal = 0;
        const reponses = [];
        
        for (const questionId in evaluation) {
            const reponseId = evaluation[questionId];
            const question = bareme.questions.find(q => q.id === parseInt(questionId, 10));
            if (question) {
                const reponse = question.reponses.find(r => r.id === parseInt(reponseId, 10));
                if (reponse) {
                    scoreTotal += reponse.score;
                    reponses.push({
                        questionId: question.id,
                        reponseId: reponse.id,
                        score: reponse.score
                    });
                }
            }
        }
        
        concepteur.evaluation = {
            date: new Date().toISOString(),
            reponses: reponses
        };
        concepteur.score = scoreTotal;
        
        saveConcepteurs();
    }
    
    /**
     * Récupère les détails d'une évaluation
     * @param {number} concepteurId - ID du concepteur
     * @returns {Array} Tableau des détails de l'évaluation
     */
    function getEvaluationDetails(concepteurId) {
        const concepteur = concepteurs.find(c => c.id === concepteurId);
        if (!concepteur || !concepteur.evaluation) return [];
        
        return concepteur.evaluation.reponses.map(rep => {
            const question = bareme.questions.find(q => q.id === rep.questionId);
            const reponse = question ? question.reponses.find(r => r.id === rep.reponseId) : null;
            
            return {
                questionId: rep.questionId,
                questionText: question ? question.text : 'Question inconnue',
                reponseId: rep.reponseId,
                reponseText: reponse ? reponse.text : 'Réponse inconnue',
                score: rep.score
            };
        });
    }
    
    /**
     * Récupère les concepteurs triés par score
     * @returns {Array} Tableau des concepteurs triés
     */
    function getConcepteursParScore() {
        return [...concepteurs].sort((a, b) => b.score - a.score);
    }
    
    /**
     * Réinitialise toutes les données de l'application
     * @returns {boolean} Succès de l'opération
     */
    function resetAllData() {
        try {
            // Réinitialiser les données en mémoire
            bareme = [];
            concepteurs = [];
            
            // Réinitialiser les compteurs
            nextQuestionId = 1;
            nextReponseId = 1;
            nextConcepteurId = 1;
            
            // Supprimer les données du localStorage
            localStorage.removeItem('bareme');
            localStorage.removeItem('concepteurs');
            
            return true;
        } catch (error) {
            console.error('Erreur lors de la réinitialisation des données:', error);
            return false;
        }
    }
    
    /**
     * Prépare les données pour l'export Excel des résultats
     * @returns {Object} Données formatées pour l'export
     */
    function prepareResultsForExport() {
        const concepteursParScore = getConcepteursParScore();
        
        // Préparer les données pour l'export
        const headers = ['Rang', 'Nom', 'Spécialité', 'Score', 'Date d\'évaluation'];
        const rows = concepteursParScore.map((concepteur, index) => {
            const date = concepteur.evaluation ? new Date(concepteur.evaluation.date).toLocaleDateString('fr-FR') : 'Non évalué';
            return [
                index + 1,
                concepteur.nom,
                concepteur.specialite,
                concepteur.score,
                date
            ];
        });
        
        return { headers, rows };
    }
    
    /**
     * Prépare les données détaillées d'un concepteur pour l'export Excel
     * @param {number} concepteurId - ID du concepteur
     * @returns {Object} Données formatées pour l'export
     */
    function prepareDetailsForExport(concepteurId) {
        const concepteur = concepteurs.find(c => c.id === concepteurId);
        if (!concepteur || !concepteur.evaluation) return null;
        
        const details = getEvaluationDetails(concepteurId);
        
        // Préparer les données pour l'export
        const headers = ['Question', 'Réponse', 'Score'];
        const rows = details.map((detail, index) => {
            return [
                `${index + 1}. ${detail.questionText}`,
                detail.reponseText,
                detail.score
            ];
        });
        
        // Ajouter une ligne pour le score total
        rows.push(['', 'Score Total', concepteur.score]);
        
        return { 
            title: `Évaluation de ${concepteur.nom} (${concepteur.specialite})`,
            date: new Date(concepteur.evaluation.date).toLocaleDateString('fr-FR'),
            headers, 
            rows 
        };
    }
    
    // API publique
    return {
        init,
        getBareme: () => bareme,
        saveBareme,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        addReponse,
        updateReponse,
        deleteReponse,
        getConcepteurs: () => concepteurs,
        addConcepteur,
        updateConcepteur,
        deleteConcepteur,
        saveEvaluation,
        getEvaluationDetails,
        getConcepteursParScore,
        resetAllData,
        prepareResultsForExport,
        prepareDetailsForExport
    };
})();
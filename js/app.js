/**
 * Script principal de l'application d'évaluation des concepteurs
 */

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser le gestionnaire de données
    DataManager.init();
    
    // Initialiser le gestionnaire d'interface
    UIManager.init();
    
    // Afficher la section barème par défaut
    UIManager.navigateTo('bareme');
    
    // Créer les dossiers de données si nécessaire
    createDataFolders();
    
    console.log('Application initialisée avec succès');
});

/**
 * Crée les dossiers de données nécessaires
 */
function createDataFolders() {
    // Cette fonction est un placeholder pour une version serveur
    // Dans cette version client, les données sont stockées dans localStorage
    console.log('Utilisation du stockage local pour les données');
}

/**
 * Exporte les données vers un fichier JSON
 * @param {string} filename - Nom du fichier
 * @param {Object} data - Données à exporter
 */
function exportToJson(filename, data) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
}

/**
 * Importe des données depuis un fichier JSON
 * @param {File} file - Fichier à importer
 * @param {Function} callback - Fonction de rappel avec les données importées
 */
function importFromJson(file, callback) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            callback(data);
        } catch (error) {
            console.error('Erreur lors de l\'importation du fichier JSON:', error);
            alert('Le fichier sélectionné n\'est pas un fichier JSON valide.');
        }
    };
    
    reader.readAsText(file);
}

// Fonctions utilitaires globales

/**
 * Génère un identifiant unique
 * @returns {string} Identifiant unique
 */
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Formate une date en chaîne lisible
 * @param {string} dateString - Chaîne de date ISO
 * @returns {string} Date formatée
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Exporte les données vers un fichier Excel
 * @param {string} filename - Nom du fichier
 * @param {Object} data - Données à exporter (headers et rows)
 * @param {string} sheetName - Nom de la feuille Excel
 * @param {string} title - Titre optionnel pour le document
 * @param {string} date - Date optionnelle pour le document
 */
function exportToExcel(filename, data, sheetName = 'Feuille1', title = null, date = null) {
    // Créer un tableau pour stocker les lignes CSV
    let csvContent = [];
    
    // Ajouter le titre et la date si fournis
    if (title) {
        csvContent.push([title]);
    }
    if (date) {
        csvContent.push([`Date: ${date}`]);
    }
    if (title || date) {
        csvContent.push([]);
    }
    
    // Ajouter les en-têtes
    csvContent.push(data.headers);
    
    // Ajouter les lignes de données
    data.rows.forEach(row => {
        csvContent.push(row);
    });
    
    // Convertir en format CSV
    let csv = csvContent.map(row => {
        return row.map(cell => {
            // Échapper les guillemets et entourer de guillemets si nécessaire
            if (cell === null || cell === undefined) {
                return '';
            }
            const cellStr = String(cell);
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                return '"' + cellStr.replace(/"/g, '""') + '"';
            }
            return cellStr;
        }).join(',');
    }).join('\n');
    
    // Créer un objet Blob avec le contenu CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Créer un lien de téléchargement et cliquer dessus
    const a = document.createElement('a');
    a.href = url;
    a.download = filename + '.csv';
    a.click();
    
    // Libérer l'URL
    URL.revokeObjectURL(url);
}

/**
 * Exporte les résultats généraux en Excel
 */
function exportResults() {
    const data = DataManager.prepareResultsForExport();
    exportToExcel('resultats_concepteurs', data, 'Résultats', 'Classement des concepteurs', new Date().toLocaleDateString('fr-FR'));
}

/**
 * Exporte les détails d'un concepteur en Excel
 * @param {number} concepteurId - ID du concepteur
 */
function exportConcepteurDetails(concepteurId) {
    const data = DataManager.prepareDetailsForExport(concepteurId);
    if (!data) {
        alert('Aucune évaluation disponible pour ce concepteur.');
        return;
    }
    
    exportToExcel(`details_${concepteurId}`, data, 'Détails', data.title, data.date);
}

/**
 * Réinitialise toute l'application
 */
function resetApplication() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toute l\'application ? Toutes les données seront perdues.')) {
        if (DataManager.resetAllData()) {
            alert('L\'application a été réinitialisée avec succès.');
            window.location.reload();
        }
    }
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser le gestionnaire de données
    DataManager.init();
    
    // Initialiser l'interface utilisateur
    UIManager.init();
    
    // Ajouter les écouteurs d'événements pour les boutons d'action dans le footer
    document.getElementById('btn-reset').addEventListener('click', resetApplication);
    document.getElementById('btn-export-results').addEventListener('click', exportResults);
    
    // Ajouter un écouteur d'événements pour les boutons d'export de détails
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('btn-export-details')) {
            const concepteurId = e.target.getAttribute('data-id');
            if (concepteurId) {
                exportConcepteurDetails(parseInt(concepteurId));
            }
        }
    });
});
// Script pour corriger les problèmes ESLint
const fs = require('fs');
const path = require('path');

// Liste des fichiers à corriger
const filesToFix = [
  'src/app.ts',
  'src/controllers/eventController.ts',
  'src/data-source.ts',
  'src/index.ts',
  'src/tests/app.coverage.test.js',
  'src/tests/authorizationApi.test.js',
  'src/tests/coverage-boost.test.js',
  'src/tests/data-source.coverage.test.js',
  'src/tests/dateUtils.test.js',
  'src/tests/eventController.coverage.test.js',
  'src/tests/eventController.js.test.js',
  'src/tests/index.coverage.test.js'
];

// Fonction pour convertir les noms de propriétés en camelCase
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

// Fonction pour corriger les problèmes de camelCase dans un fichier
function fixCamelCaseInFile(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`Le fichier ${fullPath} n'existe pas.`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Correction des propriétés en majuscules comme EVEN_ID, EVEC_LIB
    content = content.replace(/EVEN_ID/g, 'evenId');
    content = content.replace(/EVEC_LIB/g, 'evecLib');
    
    // Ajout de virgules finales aux objets
    content = content.replace(/(\s+)}\)/g, '$1})');
    content = content.replace(/(\s+)}\s*,?\s*$/gm, '$1},');
    content = content.replace(/(\s+)}\s*,\s*\]/g, '$1}]');
    
    // Suppression des espaces blancs en fin de ligne
    content = content.replace(/[ \t]+$/gm, '');
    
    // Normalisation des espaces entre les blocs de code
    content = content.replace(/\n\n\n+/g, '\n\n');
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Fichier ${filePath} corrigé.`);
  } catch (error) {
    console.error(`Erreur lors de la correction du fichier ${filePath}:`, error);
  }
}

// Correction de tous les fichiers
filesToFix.forEach(fixCamelCaseInFile);

console.log('Correction terminée.');

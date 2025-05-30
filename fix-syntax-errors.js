// Script pour corriger les erreurs de syntaxe dans les fichiers
const fs = require('fs');
const path = require('path');

// Liste des fichiers à corriger avec leurs erreurs spécifiques
const filesToFix = [
  {
    path: 'src/app.ts',
    replacements: [
      {
        from: "// Swagger uniquement en développement\nif (process.env.NODE_ENV !== 'production') {\n  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));\n},",
        to: "// Swagger uniquement en développement\nif (process.env.NODE_ENV !== 'production') {\n  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));\n}"
      }
    ]
  },
  {
    path: 'src/controllers/eventController.ts',
    replacements: [
      {
        from: "  },\n};",
        to: "  }\n};"
      }
    ]
  },
  {
    path: 'src/data-source.ts',
    replacements: [
      {
        from: "      },\n    : {",
        to: "      }\n    : {"
      }
    ]
  },
  {
    path: 'src/tests/authorizationApi.test.js',
    replacements: [
      {
        from: "        },\n      }),",
        to: "        }\n      }),"
      }
    ]
  },
  {
    path: 'src/tests/index.coverage.test.js',
    replacements: [
      {
        from: "  it('should initialize the database successfully', async () => {\n    // Configurer le mock pour simuler une initialisation réussie\n    const { AppDataSource } = require('../data-source');\n    AppDataSource.initialize.mockResolvedValue({});\n\n    // Définir le port\n    process.env.PORT = '3000';\n\n    // Importer le module index\n    await jest.isolateModules(async () => {\n      await import('../index');\n    });",
        to: "  it('should initialize the database successfully', () => {\n    // Configurer le mock pour simuler une initialisation réussie\n    const { AppDataSource } = require('../data-source');\n    AppDataSource.initialize.mockResolvedValue({});\n\n    // Définir le port\n    process.env.PORT = '3000';\n\n    // Importer le module index en utilisant require au lieu de import\n    jest.isolateModules(() => {\n      require('../index');\n    });"
      },
      {
        from: "  it('should handle database initialization errors', async () => {\n    // Configurer le mock pour simuler une erreur d'initialisation\n    const { AppDataSource } = require('../data-source');\n    const error = new Error('Database connection error');\n    AppDataSource.initialize.mockRejectedValue(error);\n\n    // Importer le module index\n    await jest.isolateModules(async () => {\n      await import('../index');\n    });",
        to: "  it('should handle database initialization errors', () => {\n    // Configurer le mock pour simuler une erreur d'initialisation\n    const { AppDataSource } = require('../data-source');\n    const error = new Error('Database connection error');\n    AppDataSource.initialize.mockRejectedValue(error);\n\n    // Importer le module index en utilisant require au lieu de import\n    jest.isolateModules(() => {\n      require('../index');\n    });"
      }
    ]
  }
];

// Fonction pour corriger les erreurs de syntaxe dans un fichier
function fixSyntaxErrorsInFile(fileInfo) {
  try {
    const fullPath = path.join(__dirname, fileInfo.path);
    if (!fs.existsSync(fullPath)) {
      console.log(`Le fichier ${fullPath} n'existe pas.`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Appliquer toutes les remplacements pour ce fichier
    fileInfo.replacements.forEach(replacement => {
      content = content.replace(replacement.from, replacement.to);
    });
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Fichier ${fileInfo.path} corrigé.`);
  } catch (error) {
    console.error(`Erreur lors de la correction du fichier ${fileInfo.path}:`, error);
  }
}

// Correction de tous les fichiers
filesToFix.forEach(fixSyntaxErrorsInFile);

console.log('Correction des erreurs de syntaxe terminée.');

// Créer un nouveau fichier index.coverage.test.js sans import dynamique
const indexTestContent = `// Tests pour améliorer la couverture de code de index.js

// Mock des dépendances
jest.mock('../app', () => ({
  default: {
    listen: jest.fn((port, callback) => {
      if (callback) callback();
      return { on: jest.fn() };
    }),
  },
}));

jest.mock('../data-source', () => ({
  AppDataSource: {
    initialize: jest.fn(),
  },
}));

describe('Server Initialization', () => {
  const originalEnv = process.env;
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };

    // Mock des fonctions console
    console.log = jest.fn();
    console.error = jest.fn();

    // Réinitialiser les mocks
    const { AppDataSource } = require('../data-source');
    AppDataSource.initialize.mockReset();
  });

  afterAll(() => {
    process.env = originalEnv;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  it('should initialize the database successfully', () => {
    // Configurer le mock pour simuler une initialisation réussie
    const { AppDataSource } = require('../data-source');
    AppDataSource.initialize.mockResolvedValue({});

    // Définir le port
    process.env.PORT = '3000';

    // Importer le module index en utilisant require au lieu de import
    jest.isolateModules(() => {
      require('../index');
    });

    // Vérifier que la base de données a été initialisée
    expect(AppDataSource.initialize).toHaveBeenCalled();
  });

  it('should handle database initialization errors', () => {
    // Configurer le mock pour simuler une erreur d'initialisation
    const { AppDataSource } = require('../data-source');
    const error = new Error('Database connection error');
    AppDataSource.initialize.mockRejectedValue(error);

    // Importer le module index en utilisant require au lieu de import
    jest.isolateModules(() => {
      require('../index');
    });

    // Vérifier que l'erreur a été journalisée
    expect(console.error).toHaveBeenCalled();
  });
});`;

try {
  const indexTestPath = path.join(__dirname, 'src/tests/index.fixed.test.js');
  fs.writeFileSync(indexTestPath, indexTestContent, 'utf8');
  console.log(`Fichier src/tests/index.fixed.test.js créé.`);
  console.log(`Vous pouvez maintenant exécuter les commandes suivantes avec les permissions appropriées :`);
  console.log(`1. rm src/tests/index.coverage.test.js`);
  console.log(`2. mv src/tests/index.fixed.test.js src/tests/index.coverage.test.js`);
} catch (error) {
  console.error(`Erreur lors de la création du fichier index.fixed.test.js:`, error);
}

console.log('\nInstructions pour corriger les problèmes ESLint et SonarQube :');
console.log('1. Exécutez ce script : node fix-syntax-errors.js');
console.log('2. Supprimez l\'ancien fichier de test : rm src/tests/index.coverage.test.js');
console.log('3. Renommez le nouveau fichier de test : mv src/tests/index.fixed.test.js src/tests/index.coverage.test.js');
console.log('4. Exécutez ESLint : npm run lint');
console.log('5. Committez les modifications : git add . && git commit -m "Fix ESLint and SonarQube issues"');
console.log('6. Poussez les modifications : git push origin feature/AIC-34-calendarManagement');

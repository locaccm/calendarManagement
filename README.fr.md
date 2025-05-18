# 📅 API de Gestion de Calendrier – LocaTech

<!-- Options de langue -->

[English](./README.md) | [Français (actuel)](./README.fr.md)

Le microservice de gestion de calendrier fait partie du projet LocaTech.  
Il est responsable de la gestion des événements et des réservations, en fournissant des endpoints pour créer, lire, mettre à jour et supprimer des événements, ainsi que des vues calendrier spécialisées (jour, semaine, mois).

Ce service est construit en TypeScript avec Express, sécurisé par des droits d'accès provenant d'une API d'accès, et testé avec Jest/Supertest. Il est conteneurisé avec Docker et déployable sur Google Cloud Run.

## 🚀 Fonctionnalités

- 📆 **Gestion complète des événements**: Création, lecture, mise à jour et suppression
- 📊 **Vues calendrier**: Affichage par jour, semaine ou mois
- 🔄 **Support multi-événements**: Plusieurs événements peuvent être programmés sur le même créneau horaire
- 📱 **Format adapté au front-end**: Champs date/heure séparés pour faciliter l'intégration
- 🔍 **Filtrage avancé**: Recherche d'événements par utilisateur, logement, date, etc.
- 📚 **Documentation Swagger**: Documentation API disponible à `/api-docs`
- ✅ **Tests d'intégration**: Avec Jest et Supertest
- 🎯 **Linting & Formatting**: Via ESLint et Prettier
- 🐳 **Dockerisé**: Prêt pour le déploiement sur Google Cloud Run

## Table des matières

- [Installation](#-installation)
- [Configuration](#%EF%B8%8F-configuration)
- [Utilisation](#-utilisation)
- [Documentation API](#-documentation-api)
- [Vues calendrier](#-vues-calendrier)
- [Format des événements](#-format-des-événements)
- [Tests](#-tests)
- [Sécurisation](#-sécurisation)

## 🔧 Installation

### Prérequis

- Node.js (v20 recommandé)
- PostgreSQL
- Compte Google Cloud Platform (pour le déploiement)
- Docker (optionnel pour la conteneurisation)

### Étapes

```bash
git clone https://github.com/locaccm/calendarManagement.git
cd calendarManagement
# Installation des dépendances
npm install

# Génération du client Prisma
npx prisma generate

# Application des migrations DB
npx prisma migrate dev

# Démarrage du serveur de développement
npm run dev
```

## ⚙️ Configuration

L'application utilise différents fichiers d'environnement selon le mode d'exécution :

- `.env` - Environnement de production (utilisé avec `npm start`)
- `.env.development` - Environnement de développement (utilisé avec `npm run dev`)

Créez ces fichiers à la racine du projet et configurez les éléments suivants :

```env
# Configuration de la base de données
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# Configuration de l'environnement
NODE_ENV="production" # ou "development"
PORT=3000

# Configuration CORS
CORS_ORIGIN="*"
ACCESS_API_URL=https://url-api-acces.com/access/check

# Configuration Swagger (développement uniquement)
API_VERSION="1.0.0"
API_TITLE="API de Gestion de Calendrier"
```

### Variables d'environnement

| Variable       | Description                                               |
| -------------- | --------------------------------------------------------- |
| DATABASE_URL   | Votre chaîne de connexion PostgreSQL                     |
| NODE_ENV       | Mode d'environnement ("production" ou "development")      |
| PORT           | Port d'écoute du serveur (défaut: 3000)                |
| CORS_ORIGIN    | Configuration CORS pour les origines autorisées          |
| ACCESS_API_URL | URL de l'API d'accès pour la vérification des droits    |
| API_VERSION    | Version de l'API pour la documentation Swagger (dev uniquement) |
| API_TITLE      | Titre de l'API pour la documentation Swagger (dev uniquement)   |

## 📋 Utilisation

### Endpoints API

| Méthode | Endpoint                    | Description                                |
| ------- | --------------------------- | ------------------------------------------ |
| GET     | `/events`                   | Liste tous les événements                  |
| GET     | `/events/:id`               | Récupère un événement par ID               |
| POST    | `/events`                   | Crée un nouvel événement                   |
| PUT     | `/events/:id`               | Met à jour un événement                    |
| DELETE  | `/events/:id`               | Supprime un événement                      |
| GET     | `/events/filter`            | Filtre les événements selon des critères   |
| GET     | `/calendar/day`             | Vue calendrier par jour                    |
| GET     | `/calendar/week`            | Vue calendrier par semaine                 |
| GET     | `/calendar/month`           | Vue calendrier par mois                    |

L'authentification et l'autorisation sont gérées via une API d'accès.
Chaque route est protégée par des droits d'accès comme `getEvents`, `createEvent`, etc., qui sont vérifiés en appelant l'URL de l'API d'accès spécifiée dans les variables d'environnement.

## 📚 Documentation API

La documentation Swagger est disponible uniquement en mode développement. Une fois le serveur lancé avec `npm run dev`, accédez à Swagger à :

```text
http://localhost:3000/api-docs
```

Cela fournit une vue complète de tous les endpoints, paramètres et exemples de requêtes/réponses.

## 📅 Vues calendrier

L'API propose plusieurs vues pour faciliter l'affichage des événements :

### Vue par jour

```http
GET /calendar/day?date=YYYY-MM-DD
```

Retourne les événements pour une journée spécifique avec la structure suivante :

```json
{
  "date": "2025-05-15",
  "events": [...]
}
```

### Vue par semaine

```http
GET /calendar/week?week=20&year=2025
```

ou

```http
GET /calendar/week?date=2025-05-15
```

Retourne les événements pour une semaine spécifique avec des métadonnées utiles :

```json
{
  "week": 20,
  "year": 2025,
  "startDate": "2025-05-11",
  "endDate": "2025-05-17",
  "days": ["2025-05-11", "2025-05-12", ...],
  "events": [...]
}
```

### Vue par mois

```http
GET /calendar/month?month=5&year=2025
```

ou

```http
GET /calendar/month?date=2025-05-15
```

Retourne les événements pour un mois spécifique avec des métadonnées utiles :

```json
{
  "month": 5,
  "year": 2025,
  "startDate": "2025-05-01",
  "endDate": "2025-05-31",
  "daysInMonth": 31,
  "days": ["2025-05-01", "2025-05-02", ...],
  "events": [...]
}
```

## 📝 Format des événements

Les événements peuvent être créés avec différents formats de date/heure :

### Format ISO

```json
{
  "EVEC_LIB": "Réunion importante",
  "EVED_START": "2025-06-01T09:00:00Z",
  "EVED_END": "2025-06-01T11:00:00Z",
  "USEN_ID": 1,
  "ACCN_ID": 1
}
```

### Format séparé

```json
{
  "EVEC_LIB": "Réunion importante",
  "DATE_START": "2025-06-01",
  "START_TIME": "09:00",
  "DATE_END": "2025-06-01",
  "END_TIME": "11:00",
  "USEN_ID": 1,
  "ACCN_ID": 1
}
```

### Réponse enrichie

Les événements retournés incluent les champs suivants pour faciliter l'intégration avec le front-end :

```json
{
  "EVEN_ID": 1,
  "EVEC_LIB": "Réunion importante",
  "EVED_START": "2025-06-01T09:00:00Z",
  "EVED_END": "2025-06-01T11:00:00Z",
  "USEN_ID": 1,
  "ACCN_ID": 1,
  "startDate": "2025-06-01",
  "startTime": "09:00",
  "endDate": "2025-06-01",
  "endTime": "11:00"
}
```

## 🧪 Tests

```bash
# Exécuter tous les tests avec couverture
npm test

# Test ESLint
npm run lint

# Test Prettier
npm run prettier
```

## 🔒 Sécurisation

L'API utilise plusieurs mécanismes de sécurité :

- **Intégration API d'accès** : Authentification et autorisation via une API d'accès
- **CORS** : Configuration CORS de base comme spécifié dans les variables d'environnement
- **Validation des entrées** : Vérification stricte des données reçues
- **Gestion des erreurs** : Messages d'erreur sécurisés sans divulgation d'informations sensibles

### Intégration API d'accès

L'API de Gestion de Calendrier ne gère pas l'authentification directement. Elle s'appuie sur une API d'accès pour vérifier les droits des utilisateurs. Chaque requête à un endpoint protégé est validée en effectuant un appel à l'URL de l'API d'accès spécifiée dans la variable d'environnement `ACCESS_API_URL`.

## 👤 Auteur

Projet Master CCM LocaTech

# 📅 Calendar Management API – LocaTech

<!-- Language options -->

[English (current)](./README.md) | [Français](./README.fr.md)

The Calendar Management microservice is part of the LocaTech project.  
It is responsible for managing events and reservations by providing endpoints to create, read, update, and delete events, as well as specialized calendar views (day, week, month).

This service is built in TypeScript using Express, secured by access rights from an Access API, and tested with Jest/Supertest. It is containerized with Docker and deployable on Google Cloud Run.

## 🚀 Features

- 📆 **Complete Event Management**: Create, read, update, and delete
- 📊 **Calendar Views**: Display by day, week, or month
- 🔄 **Multi-event Support**: Multiple events can be scheduled in the same time slot
- 📱 **Frontend-friendly Format**: Separated date/time fields for easy integration
- 🔍 **Advanced Filtering**: Search for events by user, accommodation, date, etc.
- 📚 **Swagger Documentation**: API documentation available at `/api-docs`
- ✅ **Integration Tests**: With Jest and Supertest
- 🎯 **Linting & Formatting**: Via ESLint and Prettier
- 🐳 **Dockerized**: Ready for deployment on Google Cloud Run

## Table of Contents

- [Installation](#-installation)
- [Configuration](#%EF%B8%8F-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Calendar Views](#-calendar-views)
- [Event Format](#-event-format)
- [Testing](#-testing)
- [Security](#-security)

## 🔧 Installation

### Prerequisites

- Node.js (v20 recommended)
- PostgreSQL
- Google Cloud Platform account (for deployment)
- Docker (optional for containerization)

### Steps

```bash
git clone https://github.com/locaccm/calendarManagement.git
cd calendarManagement
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Apply DB migrations
npx prisma migrate dev

# Start the development server
npm run dev
```

## ⚙️ Configuration

The application uses different environment files depending on the execution mode:

- `.env` - Production environment (used with `npm start`)
- `.env.development` - Development environment (used with `npm run dev`)

Create these files at the root of the project and configure the following:

```env
# Database configuration
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# Environment configuration
NODE_ENV="production" # or "development"
PORT=3000

# CORS configuration
CORS_ORIGIN="*"
ACCESS_API_URL=https://access-api-url.com/access/check

# Swagger configuration (development only)
API_VERSION="1.0.0"
API_TITLE="Calendar Management API"
```

### Environment Variables

| Variable       | Description                                        |
| -------------- | -------------------------------------------------- |
| DATABASE_URL   | Your PostgreSQL connection string                  |
| NODE_ENV       | Environment mode ("production" or "development")   |
| PORT           | Port the server listens on (default: 3000)         |
| CORS_ORIGIN    | CORS configuration for allowed origins             |
| ACCESS_API_URL | URL of the Access API for rights verification      |
| API_VERSION    | API version for Swagger documentation (dev only)   |
| API_TITLE      | API title for Swagger documentation (dev only)     |

## 📋 Usage

### API Endpoints

| Method | Endpoint                    | Description                                |
| ------ | --------------------------- | ------------------------------------------ |
| GET    | `/events`                   | List all events                            |
| GET    | `/events/:id`               | Get an event by ID                         |
| POST   | `/events`                   | Create a new event                         |
| PUT    | `/events/:id`               | Update an event                            |
| DELETE | `/events/:id`               | Delete an event                            |
| GET    | `/events/filter`            | Filter events by criteria                  |
| GET    | `/calendar/day`             | Calendar view by day                       |
| GET    | `/calendar/week`            | Calendar view by week                      |
| GET    | `/calendar/month`           | Calendar view by month                     |

Authentication and authorization are managed through an Access API.
Each route is protected by access rights like `getEvents`, `createEvent`, etc., which are verified by calling the Access API URL specified in the environment variables.

## 📚 API Documentation

Swagger documentation is available only in development mode. Once the server is running with `npm run dev`, access Swagger at:

```text
http://localhost:3000/api-docs
```

This provides a complete overview of all endpoints, parameters, and request/response examples.

## 📅 Calendar Views

The API offers several views to facilitate displaying events:

### Day View

```http
GET /calendar/day?date=YYYY-MM-DD
```

Returns events for a specific day with the following structure:

```json
{
  "date": "2025-05-15",
  "events": [...]
}
```

### Week View

```http
GET /calendar/week?week=20&year=2025
```

or

```http
GET /calendar/week?date=2025-05-15
```

Returns events for a specific week with useful metadata:

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

### Month View

```http
GET /calendar/month?month=5&year=2025
```

or

```http
GET /calendar/month?date=2025-05-15
```

Returns events for a specific month with useful metadata:

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

## 📝 Event Format

Events can be created with different date/time formats:

### ISO Format

```json
{
  "EVEC_LIB": "Important Meeting",
  "EVED_START": "2025-06-01T09:00:00Z",
  "EVED_END": "2025-06-01T11:00:00Z",
  "USEN_ID": 1,
  "ACCN_ID": 1
}
```

### Split Format

```json
{
  "EVEC_LIB": "Important Meeting",
  "DATE_START": "2025-06-01",
  "START_TIME": "09:00",
  "DATE_END": "2025-06-01",
  "END_TIME": "11:00",
  "USEN_ID": 1,
  "ACCN_ID": 1
}
```

### Enriched Response

Returned events include the following fields to facilitate frontend integration:

```json
{
  "EVEN_ID": 1,
  "EVEC_LIB": "Important Meeting",
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

## 🧪 Testing

```bash
# Run all tests with coverage
npm test

# ESLint test
npm run lint

# Prettier test
npm run prettier
```

## 🔒 Security

The API uses several security mechanisms:

- **Access API Integration**: Authentication and authorization via an Access API
- **CORS**: Basic CORS configuration as specified in environment variables
- **Input Validation**: Strict verification of received data
- **Error Handling**: Secure error messages without disclosure of sensitive information

### Access API Integration

The Calendar Management API does not handle authentication directly. Instead, it relies on an Access API to verify user rights. Each request to a protected endpoint is validated by making a call to the Access API URL specified in the `ACCESS_API_URL` environment variable.

## 👤 Author

LocaTech CCM Master's Project

---

## Documentation Française

Le microservice de gestion de calendrier fait partie du projet LocaTech.  
Il est responsable de la gestion des événements et des réservations, en fournissant des endpoints pour créer, lire, mettre à jour et supprimer des événements, ainsi que des vues calendrier spécialisées (jour, semaine, mois).

Ce service est construit en TypeScript avec Express, sécurisé par des droits d'accès provenant du microservice Auth, et testé avec Jest/Supertest. Il est conteneurisé avec Docker et déployable sur Google Cloud Run.

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

- [Installation](#-installation-1)
- [Configuration](#%EF%B8%8F-configuration-1)
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

Créez un fichier .env à la racine du projet et configurez les éléments suivants :

```env
### Connexion PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/database

### Port (optionnel)
PORT=3000

### JWT Secret
JWT_SECRET=votre_secret_jwt
```

### Variables d'environnement

| Variable      | Description                                 |
| ------------- | ------------------------------------------- |
| DATABASE_URL  | Votre chaîne de connexion PostgreSQL        |
| PORT          | Port d'écoute du serveur (défaut: 3000)     |
| JWT_SECRET    | Clé secrète pour la validation des tokens   |

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

L'authentification est requise sur toutes les routes via un token Bearer.
Chaque route est protégée par des droits d'accès comme `getEvents`, `createEvent`, etc.

## 📚 Documentation API

Une fois le serveur lancé, accédez à Swagger à :

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

- **Helmet** : Protection contre les vulnérabilités web courantes
- **CORS** : Contrôle des domaines autorisés à accéder à l'API
- **JWT** : Authentification par JSON Web Tokens
- **Validation des entrées** : Vérification stricte des données reçues
- **Gestion des erreurs** : Messages d'erreur sécurisés sans divulgation d'informations sensibles

## 👤 Auteur

Dynastie AMOUSSOU - Projet Master CCM LocaTech

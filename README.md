# Calendar Management API

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-xx%25-blue)


API de gestion de calendrier basée sur Express, Prisma, PostgreSQL et documentée avec Swagger.

---

## Prérequis
- **Node.js** (v18+ recommandé)
- **npm** (ou yarn)
- **PostgreSQL** (instance locale ou distante)

---

## Installation
1. **Cloner le dépôt**
   ```bash
   git clone <repo_url>
   cd calendarManagement
   ```
2. **Installer les dépendances**
   ```bash
   npm install
   ```
3. **Configurer l'environnement**
   - Copier `.env.example` en `.env` et adapter les variables :
     - `DATABASE_URL` (voir plus bas)
     - `NODE_ENV` (`development` ou `production`)

---

## Configuration de la base de données
- Créer la base si besoin :
  ```bash
  createdb calendar_dev_db
  ```
- Adapter `DATABASE_URL` dans `.env` :
  ```env
  DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
  ```
- Appliquer les migrations Prisma (si utilisées)
  ```bash
  npx prisma migrate deploy
  # ou pour dev
  npx prisma migrate dev
  ```

---

## Lancement du serveur
- **Développement** (avec accès Swagger UI)
  ```bash
  npm run build && node dist/index.js
  # ou
  npm run dev
  ```
- **Production**
  ```bash
  NODE_ENV=production npm run build && node dist/index.js
  ```

---

## Accès à la documentation Swagger

Après démarrage :
```
http://localhost:3000/api-docs
```
Vous pouvez tester tous les endpoints depuis cette interface.

---

## Endpoints principaux
- `GET    /events`           : Liste des événements
- `GET    /events/{id}`      : Détail d'un événement
- `POST   /events`           : Créer un événement
- `PUT    /events/{id}`      : Modifier un événement
- `DELETE /events/{id}`      : Supprimer un événement
- `GET    /events/filter`    : Filtrer les événements (par date, utilisateur, etc.)
- `GET    /calendar/day`     : Événements d'un jour
- `GET    /calendar/week`    : Événements d'une semaine
- `GET    /calendar/month`   : Événements d'un mois

Pour les détails des schémas et exemples, consulter Swagger UI.

---

## Tests
- **Lancer tous les tests**
  ```bash
  npm test
  ```
- **Tests mockés** : couvrent la logique métier sans toucher à la vraie base.
- **Tests d'intégration** : à compléter selon besoin.

---

## Sécurité
- En dev, le CORS est ouvert à tous. **À restreindre en production !**
- Prévoir l’ajout d’une authentification (JWT, etc.) pour sécuriser l’API en production.

---

## Contribution
1. Fork, crée une branche, propose un PR.
2. Merci de respecter la structure du projet et d’ajouter des tests pour toute nouvelle fonctionnalité.

---

## Contact
Pour toute question : [Votre Nom ou email]

# Anonyme Pro (Rever)

Plateforme bienveillante d'expression anonyme : feed, messagerie coach, modération admin.

## Structure

- `client/` — React 18 + Vite + Tailwind
- `server/` — Express + PostgreSQL + JWT
- `shared/` — configuration partagée (référence)

## Démarrage local

### Prérequis

- Node.js 18+
- PostgreSQL 15+ (ou Docker)

### Backend

```bash
cd server
cp .env.example .env
# Éditer .env : DATABASE_URL, JWT_SECRET, GEMINI_API_KEY, ADMIN_INITIAL_PASSWORD
npm install
npm run dev
```

API : `http://localhost:5001` — Health : `GET /health`

### Frontend

```bash
cd client
npm install
npm run dev
```

App : `http://localhost:5173`

### Docker

```bash
export JWT_SECRET="votre-secret-long"
export ADMIN_INITIAL_PASSWORD="mot-de-passe-admin-fort"
export GEMINI_API_KEY="..."
docker compose up -d --build
```

## Notifications Web Push (téléphone)

Générer les clés VAPID une fois :

```bash
cd server && node scripts/generate-vapid-keys.js
```

Copier `VAPID_PUBLIC_KEY` et `VAPID_PRIVATE_KEY` dans `server/.env` et sur le VPS (`docker compose`).

- **App ouverte** : SSE + bannières navigateur (son, vibration)
- **App fermée** : Web Push via Service Worker (`/sw.js`)
- **iPhone** : ajouter annonyme.pro à l’écran d’accueil, puis activer les notifications

## Sécurité

- Mots de passe hachés (bcrypt)
- Authentification JWT sur les routes protégées
- Rôles : `user`, `coach`, `admin`
- Compte admin initial : contact `admin` — définir `ADMIN_INITIAL_PASSWORD` en production

## Tests & CI

```bash
cd server && npm test
```

GitHub Actions : build client + tests server.

## RGPD

- `GET /api/me/export` — export JSON des données utilisateur
- `DELETE /api/me` — suppression du compte

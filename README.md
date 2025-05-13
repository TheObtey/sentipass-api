# SentiPass API
Une API REST légère et sécurisée pour gérer des mots de passe centralisés.

## 🎯 Objectif
Permettre à une application mobile (ou tout client HTTP) d’enregistrer, récupérer, modifier et supprimer des mots de passe, tout en assurant :

- Une authentification stateless par JWT
- Le hachage sécurisé des mots de passe utilisateurs via bcrypt
- La séparation des responsabilités (Express, MariaDB, reverse proxy Apache)

## 🤔 Pourquoi ce projet ?
À l’origine, SentiPass stockait les données en local dans une application Android.
En prenant un VPS, l’idée était de passer à une base distante pour :

- Synchroniser les mots de passe entre plusieurs appareils
- Renforcer la sécurité et les bonnes pratiques (HTTPS, JWT, hachage, reverse-proxy)
- Se familiariser avec le déploiement d’une API sur un serveur Linux

## 🚀 Comment ça fonctionne ?
```plaintext
[ App Android ] 
      │ HTTPS
      ▼
[ sentipass.obtey.fr ]  ←─ Apache2 + SSL (reverse-proxy) ─────┐
      │ proxy /api →                                          │
      ▼                                                       ▼
[ Node.js (Express) ] ── JWT ──> middleware verifyToken ──> [ MariaDB ]
       • routes /register, /login                           • tables users, passwords
       • routes /passwords (add, list, update, delete)      • hachage bcrypt
```

### 1.Auth
- `POST /api/register` → création d’utilisateur
- `POST /api/login` → génération d’un token JWT

### 2.JWT
- Middleware `verifyToken` protège toutes les routes `/api/passwords/...`

### 3.CRUD Mots de passe

- `POST /api/passwords/add-password`
- `GET /api/passwords/get/:id`
- `GET /api/passwords/get-all`
- `PUT /api/passwords/update/:id`
- `DELETE /api/passwords/delete/:id`

## 🛠️ Mise en route rapide

### 1.Cloner & installer
```bash
git clone git@github.com:tonPseudo/sentipass-api.git
cd sentipass-api
npm install
```

### 2.Configurer les variables d’environnement
Crée un fichier .env :
```ini
PORT=3000
DB_HOST=localhost
DB_USER=sentipass_user
DB_PASSWORD=tonMotDePasseMariaDB
DB_NAME=sentipass_db
JWT_SECRET=uneCléTrèsSecrète
JWT_LIFETIME=30m
```

### 3.Démarrer le service
```bash
node index.js
```

### 4.Tester
- `POST http://localhost:3000/api/register`
- `POST http://localhost:3000/api/login`
- `POST http://localhost:3000/api/passwords/add-password` (avec header Authorization)

etc.

---
Contribuez librement ! Pull-requests et issues sont les bienvenues.

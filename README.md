# SentiPass API
Une API REST sécurisée pour la gestion centralisée de mots de passe.

## 🎯 Objectif
Permettre à une application mobile (ou tout client HTTP) d'enregistrer, récupérer, modifier et supprimer des mots de passe, tout en assurant :

- Une authentification stateless par JWT
- Chiffrement des mots de passe utilisateurs via AES-256-CBC
- La séparation des responsabilités (Express, MySQL, reverse proxy)
- Protection contre les attaques courantes

## 🤔 Pourquoi ce projet ?
À l'origine, SentiPass stockait les données en local dans une application Android.
En prenant un VPS, l'idée était de passer à une base distante pour :

- Synchroniser les mots de passe entre plusieurs appareils
- Renforcer la sécurité et les bonnes pratiques (HTTPS, JWT, hachage, chiffrement symétrique, reverse-proxy)
- Se familiariser avec le déploiement d'une API sur un serveur Linux

## 🚀 Architecture
```plaintext
[ Client (Mobile/Web) ] 
      │ HTTPS
      ▼
[ Reverse Proxy (Apache/Nginx) ]  ←─ SSL/TLS ─────┐
      │ proxy /api →                              │
      ▼                                           ▼
[ Node.js (Express) ] ── JWT ──> [ MySQL ]
       • Routes protégées                       • Tables users, passwords
       • Middleware de sécurité                 • Hachage bcrypt, chiffrement AES
```

## 🔒 Sécurité
- **Authentification** : JWT avec expiration configurable
- **Hachage** : bcrypt pour les mots de passe utilisateurs
- **Chiffrement** : AES-256-CBC pour les mots de passe stockés
- **Protection** : Middleware de vérification de token
- **Validation** : Vérification des entrées utilisateur

## 📡 Endpoints API

### Authentification
- `POST /register`
  - Crée un nouveau compte utilisateur
  - Body: `{ username, password }`
  - Retourne: `{ message, userId }`

- `POST /login`
  - Authentifie un utilisateur
  - Body: `{ username, password }`
  - Retourne: `{ message, token }`

- `PUT /update-master-password`
  - Met à jour le mot de passe principal
  - Body: `{ oldPassword, newPassword }`
  - Nécessite: Token JWT

- `DELETE /nuke`
  - Supprime le compte et toutes les données associées
  - Nécessite: Token JWT

### Gestion des Mots de Passe
- `GET /passwords/get-passwords`
  - Récupère tous les mots de passe de l'utilisateur
  - Nécessite: Token JWT
  - Retourne: Liste des mots de passe déchiffrés

- `POST /passwords/add-password`
  - Ajoute un nouveau mot de passe
  - Body: `{ service, url?, email?, username?, password, note? }`
  - Nécessite: Token JWT

- `PUT /passwords/update-password/:id`
  - Met à jour un mot de passe existant
  - Body: `{ service?, url?, email?, username?, password?, note? }`
  - Nécessite: Token JWT

- `DELETE /passwords/delete-password/:id`
  - Supprime un mot de passe
  - Nécessite: Token JWT

- `DELETE /passwords/delete-all-passwords`
  - Supprime tous les mots de passe de l'utilisateur
  - Nécessite: Token JWT

## 🛠️ Installation

### Prérequis
- Node.js (v14+)
- MySQL (v8+)
- npm ou yarn

### 1. Cloner & installer
```bash
git clone git@github.com:TheObtey/sentipass-api.git
cd sentipass-api
npm install
```

### 2. Configuration
Crée un fichier `.env` :
```ini
PORT=3000
DB_HOST=localhost
DB_USER=sentipass_user
DB_PASSWORD=tonMotDePasseMySQL
DB_NAME=sentipass_db
JWT_SECRET=uneCléTrèsSecrète
JWT_LIFETIME=30m
SECRET_KEY=taclésecrete
```

### 3. Base de données
```sql
CREATE DATABASE sentipass_db;
CREATE USER 'sentipass_user'@'localhost' IDENTIFIED BY 'tonMotDePasseMySQL';
GRANT ALL PRIVILEGES ON sentipass_db.* TO 'sentipass_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Démarrer le service
```bash
node index.js
```

## 🔍 Tests
Vous pouvez tester l'API avec des outils comme Postman ou curl :

```bash
# Créer un compte
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

# Se connecter
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

# Ajouter un mot de passe (avec le token reçu)
curl -X POST http://localhost:3000/passwords/add-password \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"service":"github","password":"secret123"}'
```

## 🤝 Contribution
Fait avec ❤️ par [TheObtey](https://github.com/TheObtey)

Les contributions sont les bienvenues ! N'hésitez pas à :
- Ouvrir une issue pour signaler un bug
- Proposer une amélioration via une pull request
- Améliorer la documentation

## 📝 Licence
ISC License - Voir le fichier [LICENSE](LICENSE) pour plus de détails.
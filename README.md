# LBC Monitoring

Système de surveillance d'annonces LeBonCoin développé en TypeScript avec Clean Architecture.

## 📋 Description

Ce projet surveille automatiquement les nouvelles annonces LeBonCoin selon vos critères de recherche. Il dispose d'une interface web pour gérer la configuration et peut être déployé sur un Synology via Docker.

## 🏗️ Architecture

Le projet suit les principes de Clean Architecture :

```
src/
├── domain/              # Couche métier (entities, ports)
│   ├── entities/        # Advertisement, SearchConfiguration
│   └── ports/           # Interfaces (ILogger, IAdvertisementRepository, etc.)
├── application/         # Cas d'usage
│   └── usecases/        # MonitorAdvertisements
├── infrastructure/      # Implémentations concrètes
│   └── adapters/        # LbcAdapter, ConsoleLogger, JsonRepo, FileStore
├── lbc/                 # Bibliothèque LBC
└── index.ts             # Point d'entrée
```

## 🚀 Installation

### En local - Interface Web

```bash
# Installer les dépendances
npm install

# Lancer l'interface web de développement
npm run web:dev
```

L'interface sera accessible sur **http://localhost:3000**

### En local - Ligne de commande

```bash
# Installer les dépendances
npm install

# Copier l'exemple de configuration
cp config/searches.example.json config/searches.json

# Éditer votre configuration
nano config/searches.json

# Compiler
npm run build

# Lancer
npm start
```

### Avec Docker

```bash
# Build l'image
docker build -t lbc-monitoring .

# Lancer le container
docker run -d -p 3000:3000 \
  -v $(pwd)/config:/app/config \
  -v $(pwd)/data:/app/data \
  -e BREVO_API_KEY="votre_clé_api" \
  -e EMAIL_TO="votre@email.com" \
  --name lbc-monitoring \
  lbc-monitoring
```

L'interface web sera accessible sur **http://localhost:3000**

## ⚙️ Configuration

### Créer votre fichier de recherche

1. Copiez `config/searches.example.json` vers `config/searches.json`
2. Modifiez le fichier selon vos besoins
3. Consultez `config/FIELDS_REFERENCE.md` pour la documentation complète des champs

### Exemple de configuration

```json
{
  "searches": [
    {
      "name": "MacBook à Paris",
      "keywords": "macbook pro",
      "category": "15",
      "locations": ["Paris"],
      "priceMin": 300,
      "priceMax": 800,
      "ownerType": "private"
    }
  ]
}
```

## 📦 Publication de l'image Docker

### Option 1 : GitHub Container Registry (recommandé)

L'image est automatiquement publiée sur GitHub Container Registry via GitHub Actions à chaque push sur `master` ou lors de la création d'un tag.

**Pull l'image depuis le registry :**
```bash
docker pull ghcr.io/VOTRE-USERNAME/lbc-monitoring:latest
```

**Publier manuellement :**
```bash
# 1. Se connecter à GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u VOTRE-USERNAME --password-stdin

# 2. Builder l'image avec le bon tag
docker build -t ghcr.io/VOTRE-USERNAME/lbc-monitoring:latest .

# 3. Pousser l'image
docker push ghcr.io/VOTRE-USERNAME/lbc-monitoring:latest
```

Pour obtenir un token GitHub :
1. GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Generate new token
3. Cocher `write:packages` et `read:packages`

### Option 2 : Build local et transfert manuel

```bash
# Sur votre machine locale
docker build -t lbc-monitoring .
docker save lbc-monitoring > lbc-monitoring.tar

# Transférer sur le Synology
scp lbc-monitoring.tar user@synology:/volume1/docker/
```

## 🐳 Déploiement sur Synology

### Méthode 1 : Depuis GitHub Container Registry (recommandé)

```bash
# Créer les dossiers de configuration
mkdir -p /volume1/docker/lbc-monitoring/config
mkdir -p /volume1/docker/lbc-monitoring/data

# Lancer le container directement depuis le registry
docker run -d \
  --name lbc-monitoring \
  -p 3000:3000 \
  -v /volume1/docker/lbc-monitoring/config:/app/config \
  -v /volume1/docker/lbc-monitoring/data:/app/data \
  -e BREVO_API_KEY="votre_clé_api_brevo" \
  -e EMAIL_TO="votre@email.com" \
  -e LBC_COOKIE="didomi_token=...; datadome=..." \
  --restart unless-stopped \
  ghcr.io/VOTRE-USERNAME/lbc-monitoring:latest
```

**Note:** La variable `LBC_COOKIE` est optionnelle. Si elle n'est pas définie, un cookie par défaut sera utilisé.

### Méthode 2 : Depuis une image locale

Via Docker UI ou SSH :

```bash
# Charger l'image (si transférée manuellement)
docker load < /volume1/docker/lbc-monitoring.tar

# Puis lancer le container
docker run -d \
  --name lbc-monitoring \
  -p 3000:3000 \
  -v /volume1/docker/lbc-monitoring/config:/app/config \
  -v /volume1/docker/lbc-monitoring/data:/app/data \
  -e BREVO_API_KEY="votre_clé_api_brevo" \
  -e EMAIL_TO="votre@email.com" \
  -e LBC_COOKIE="didomi_token=...; datadome=..." \
  --restart unless-stopped \
  lbc-monitoring
```

**Note:** La variable `LBC_COOKIE` est optionnelle.

L'interface web sera accessible sur **http://ip-du-synology:3000**

## ⚙️ Configuration des recherches

### Via l'interface web (recommandé)

1. Accédez à l'interface web : `http://ip-du-synology:3000`
2. Ajoutez vos recherches via l'interface graphique
3. Cliquez sur "💾 Sauvegarder"
4. Testez avec le bouton "🔍 Lancer la recherche"

### Via fichier JSON (alternative)

Éditez directement `/volume1/docker/lbc-monitoring/config/searches.json` - voir la section "Exemple de configuration" ci-dessus.

## ⏰ Automatisation avec tâche planifiée

Dans DSM > Panneau de configuration > Planificateur de tâches :

1. Créer > Tâche planifiée > Script shell défini par l'utilisateur
2. **Général** :
   - Nom : `LBC Monitoring - Vérification automatique`
   - Utilisateur : `root`
3. **Planification** :
   - Quotidien
   - Première exécution : 08:00
   - Dernière exécution : 20:00
   - Répéter toutes les : 2 heures (ou selon vos besoins)
4. **Paramètres de tâche** :

```bash
curl -X POST http://localhost:3000/api/monitor
```

**Avantages de cette approche :**
- ✅ Interface web toujours accessible pour modifier les recherches
- ✅ Pas besoin de redémarrer le container pour mettre à jour la config
- ✅ Logs consultables directement dans l'interface
- ✅ Tâche planifiée très simple (un simple appel HTTP)
- ✅ Notifications email automatiques via Brevo

## 📊 Logs et résultats

### Logs console

Les logs affichent :
- ✅ Titre de l'annonce
- 💰 Prix
- 📍 Localisation
- 📝 Description (tronquée à 200 caractères)
- 🔗 Lien vers l'annonce
- 🖼️ Lien vers l'image
- 📅 Date de publication

Exemple :

```
🔍 Démarrage de la surveillance des annonces LBC...

📋 Recherche: "MacBook à Paris"
=================================================================================

🆕 2 nouvelle(s) annonce(s) pour "MacBook à Paris":

📦 Annonce #1
   Titre: MacBook Pro 13" 2020
   Prix: 650€
   Localisation: Paris 15ème
   Catégorie: Ordinateurs
   Description: MacBook Pro en excellent état, peu utilisé...
   🔗 Lien: https://www.leboncoin.fr/...
   🖼️  Image: https://img.leboncoin.fr/...
   📅 Date de publication: 06/03/2026 10:30:00
--------------------------------------------------------------------------------
✅ Email envoyé pour "MacBook à Paris" (2 annonces)
```

### Emails (Brevo)

Si configuré, vous recevrez un email HTML avec :
- 🖼️ Images des annonces directement affichées
- 🎨 Mise en page professionnelle avec couleurs LeBonCoin
- 📝 Description complète (300 premiers caractères)
- 🔗 Bouton cliquable pour accéder à chaque annonce
- 📊 Résumé du nombre de nouvelles annonces

## 🔍 Fonctionnement

1. Le script lit les configurations dans `config/searches.json`
2. Pour chaque recherche, il interroge l'API LeBonCoin
3. Il compare les résultats avec les annonces déjà vues (stockées dans `data/seen-ads.json`)
4. Il affiche uniquement les nouvelles annonces dans les logs
5. Il marque les nouvelles annonces comme vues pour la prochaine exécution

## 📁 Structure des fichiers

```
lbc-monitoring/
├── config/
│   ├── searches.json           # Votre configuration (à créer)
│   ├── searches.example.json   # Exemple de configuration
│   └── FIELDS_REFERENCE.md     # Documentation des champs
├── data/
│   └── seen-ads.json           # Annonces déjà vues (auto-généré)
├── src/                        # Code source
├── Dockerfile
├── package.json
└── README.md
```

## 🔧 Variables d'environnement

### Configuration de base

- `CONFIG_PATH` : Chemin vers le fichier de configuration (défaut: `./config/searches.json`)
- `STORE_PATH` : Chemin vers le fichier des annonces vues (défaut: `./data/seen-ads.json`)
- `LBC_COOKIE` : Cookie LeBonCoin pour l'authentification (optionnel, une valeur par défaut est fournie)

### Notifications par email (Brevo)

Pour activer les notifications par email, définissez ces variables :

- `BREVO_API_KEY` : Votre clé API Brevo (obligatoire)
- `EMAIL_TO` : Email de destination pour recevoir les notifications (obligatoire)
- `EMAIL_FROM` : Email expéditeur (optionnel, défaut: `noreply@lbc-monitoring.com`)
- `EMAIL_FROM_NAME` : Nom de l'expéditeur (optionnel, défaut: `LBC Monitoring`)

**Obtenir une clé API Brevo :**

1. Créez un compte gratuit sur [Brevo](https://www.brevo.com/)
2. Allez dans Paramètres > Clés API SMTP & API
3. Créez une nouvelle clé API
4. Copiez la clé et utilisez-la pour `BREVO_API_KEY`

## 📝 Licence

MIT

# Guide de déploiement - LBC Monitoring

## 📦 Publication sur GitHub Container Registry

### Étape 1 : Créer un Personal Access Token GitHub

1. Allez sur GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Cliquez sur **Generate new token (classic)**
3. Donnez un nom au token : `lbc-monitoring-registry`
4. Sélectionnez les permissions suivantes :
   - ✅ `write:packages` (permet de publier)
   - ✅ `read:packages` (permet de lire)
   - ✅ `delete:packages` (optionnel, pour supprimer des images)
5. Cliquez sur **Generate token**
6. **Copiez le token immédiatement** (il ne sera plus visible après)

### Étape 2 : Se connecter au registry depuis votre machine

```bash
# Remplacez VOTRE-USERNAME et VOTRE-TOKEN
echo VOTRE-TOKEN | docker login ghcr.io -u VOTRE-USERNAME --password-stdin
```

Exemple :
```bash
echo ghp_xxxxxxxxxxxx | docker login ghcr.io -u mmaillot --password-stdin
```

### Étape 3 : Builder et pousser l'image

```bash
# 1. Builder l'image avec le bon tag
docker build -t ghcr.io/VOTRE-USERNAME/lbc-monitoring:latest .

# 2. Pousser l'image sur le registry
docker push ghcr.io/VOTRE-USERNAME/lbc-monitoring:latest

# 3. (Optionnel) Créer un tag versionné
docker tag ghcr.io/VOTRE-USERNAME/lbc-monitoring:latest ghcr.io/VOTRE-USERNAME/lbc-monitoring:v1.0.0
docker push ghcr.io/VOTRE-USERNAME/lbc-monitoring:v1.0.0
```

### Étape 4 : Rendre l'image publique (optionnel)

1. Allez sur GitHub → Votre profil → **Packages**
2. Cliquez sur votre package `lbc-monitoring`
3. **Package settings** (en bas à droite)
4. Section **Danger Zone** → **Change visibility** → **Public**

## 🤖 Automatisation avec GitHub Actions

Le fichier `.github/workflows/docker-publish.yml` est déjà configuré pour :
- ✅ Builder automatiquement l'image à chaque push sur `master`
- ✅ Créer des tags versionnés lors de la création d'un tag git
- ✅ Publier automatiquement sur ghcr.io

**Utilisation :**

```bash
# Push sur master = image avec tag "master"
git push origin master

# Créer un tag = image avec version
git tag v1.0.0
git push origin v1.0.0
# → Créera les images : latest, v1.0.0, v1.0, v1
```

## 🐳 Déployer sur votre Synology

### Depuis le registry GitHub (le plus simple)

```bash
# Sur votre Synology
docker pull ghcr.io/VOTRE-USERNAME/lbc-monitoring:latest

# Lancer le container
docker run -d \
  --name lbc-monitoring \
  -p 3000:3000 \
  -v /volume1/docker/lbc-monitoring/config:/app/config \
  -v /volume1/docker/lbc-monitoring/data:/app/data \
  -e BREVO_API_KEY="votre_clé_api" \
  -e EMAIL_TO="votre@email.com" \
  --restart unless-stopped \
  ghcr.io/VOTRE-USERNAME/lbc-monitoring:latest
```

### Mettre à jour l'image sur le Synology

```bash
# 1. Pull la nouvelle version
docker pull ghcr.io/VOTRE-USERNAME/lbc-monitoring:latest

# 2. Arrêter et supprimer l'ancien container
docker stop lbc-monitoring
docker rm lbc-monitoring

# 3. Relancer avec la nouvelle image
docker run -d \
  --name lbc-monitoring \
  -p 3000:3000 \
  -v /volume1/docker/lbc-monitoring/config:/app/config \
  -v /volume1/docker/lbc-monitoring/data:/app/data \
  -e BREVO_API_KEY="votre_clé_api" \
  -e EMAIL_TO="votre@email.com" \
  --restart unless-stopped \
  ghcr.io/VOTRE-USERNAME/lbc-monitoring:latest
```

Ou en une seule commande :
```bash
docker pull ghcr.io/VOTRE-USERNAME/lbc-monitoring:latest && \
docker stop lbc-monitoring && \
docker rm lbc-monitoring && \
docker run -d \
  --name lbc-monitoring \
  -p 3000:3000 \
  -v /volume1/docker/lbc-monitoring/config:/app/config \
  -v /volume1/docker/lbc-monitoring/data:/app/data \
  -e BREVO_API_KEY="$BREVO_API_KEY" \
  -e EMAIL_TO="$EMAIL_TO" \
  --restart unless-stopped \
  ghcr.io/VOTRE-USERNAME/lbc-monitoring:latest
```

## 🔍 Vérification

```bash
# Vérifier que l'image est bien publique
docker pull ghcr.io/VOTRE-USERNAME/lbc-monitoring:latest

# Vérifier les tags disponibles
# Allez sur : https://github.com/VOTRE-USERNAME/lbc-monitoring/pkgs/container/lbc-monitoring
```

## 💡 Bonnes pratiques

1. **Versioning** : Utilisez des tags git pour créer des versions stables
2. **Latest tag** : Toujours disponible avec la dernière version de master
3. **Rollback** : Gardez plusieurs versions pour pouvoir revenir en arrière
4. **CI/CD** : Laissez GitHub Actions gérer la publication automatique

## 🚀 Workflow recommandé

```bash
# 1. Développement local
npm run web:dev

# 2. Commit et push
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin master
# → GitHub Actions build et publie automatiquement

# 3. Sur le Synology
docker pull ghcr.io/VOTRE-USERNAME/lbc-monitoring:latest
# → Mettre à jour le container
```

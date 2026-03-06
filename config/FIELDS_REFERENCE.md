# Configuration de Recherche LBC

## Structure du fichier `searches.json`

Le fichier doit contenir un objet JSON avec un tableau `searches` :

```json
{
  "searches": [
    {
      "name": "Nom de votre recherche",
      "keywords": "mots clés",
      ...
    }
  ]
}
```

## Champs disponibles

### `name` (string, obligatoire)
Nom descriptif de la recherche pour identifier les résultats dans les logs.

**Exemple:** `"Ordinateurs portables Paris"`

---

### `keywords` (string, optionnel)
Mots-clés à rechercher dans les annonces.

**Exemple:** `"macbook pro"`, `"vélo électrique"`

---

### `onlyTitle` (boolean, optionnel)
Si `true`, recherche uniquement dans le titre des annonces. Si `false` ou absent, recherche dans tout le contenu.

**Valeurs:** `true` | `false`
**Défaut:** `false`

---

### `category` (string, optionnel)
ID de la catégorie LBC. Voir la liste complète ci-dessous.

**Exemples:**
- `"15"` - Ordinateurs
- `"2"` - Voitures
- `"10"` - Locations
- `"55"` - Vélos

---

### `locations` (array, optionnel)
Localisation(s) où chercher. Peut être :
- Nom de ville (string) : `["Paris", "Lyon"]`
- Code de département (number) : `[75, 69]`
- Code de région (number) : `[11]` (Île-de-France)

**Exemples:**
```json
"locations": ["Paris"]
"locations": [75]
"locations": [11]
"locations": ["Paris", "Lyon", "Marseille"]
```

---

### `priceMin` (number, optionnel)
Prix minimum en euros.

**Exemple:** `100`

---

### `priceMax` (number, optionnel)
Prix maximum en euros.

**Exemple:** `1000`

---

### `ownerType` (string, optionnel)
Type de vendeur.

**Valeurs:**
- `"all"` - Tous (défaut)
- `"private"` - Particuliers uniquement
- `"pro"` - Professionnels uniquement

---

### `shippable` (boolean, optionnel)
Si `true`, inclut uniquement les annonces avec livraison possible.

**Valeurs:** `true` | `false`

---

### `buyerLocation` (object, optionnel)
Position géographique de l'acheteur pour calculer la distance avec chaque annonce.

Si configuré, les annonces seront triées par distance croissante et la distance sera affichée dans les logs et emails.

**Structure:**
```json
"buyerLocation": {
  "lat": 48.8566,
  "lng": 2.3522
}
```

**Champs:**
- `lat` (number) : Latitude (entre -90 et 90)
- `lng` (number) : Longitude (entre -180 et 180)

**Comment obtenir les coordonnées ?**
1. Allez sur [Google Maps](https://maps.google.com)
2. Faites un clic droit sur votre adresse
3. Cliquez sur les coordonnées pour les copier
4. Format : `48.8566, 2.3522` → `lat: 48.8566`, `lng: 2.3522`

**Exemple:**
```json
"buyerLocation": {
  "lat": 48.8566,
  "lng": 2.3522
}
```

---

### `enums` (object, optionnel)
Filtres avancés spécifiques à la catégorie (marque, modèle, etc.).

**Exemple:**
```json
"enums": {
  "ad_type": ["offer"],
  "brand": ["apple", "samsung"]
}
```

---

### `ranges` (object, optionnel)
Filtres avancés par plage de valeurs.

**Exemple:**
```json
"ranges": {
  "mileage": {
    "min": 0,
    "max": 50000
  }
}
```

---

## Catégories principales

| ID | Nom |
|----|-----|
| `0` | Toutes catégories |
| `2` | Voitures |
| `3` | Motos |
| `5` | Utilitaires |
| `9` | Ventes immobilières |
| `10` | Locations |
| `15` | Ordinateurs |
| `16` | Photo, Audio, Vidéo |
| `17` | Téléphones, objets connectés |
| `19` | Ameublement |
| `20` | Électroménager |
| `21` | Bricolage |
| `22` | Vêtements |
| `23` | Équipement bébé |
| `27` | Livres |
| `28` | Animaux |
| `29` | Sport & Plein air |
| `30` | Instruments de musique |
| `33` | Offres d'emploi |
| `41` | Jeux & Jouets |
| `43` | Consoles |
| `55` | Vélos |
| `84` | Jeux vidéo |

---

## Codes régions

| Code | Région |
|------|--------|
| `1` | Alsace |
| `2` | Aquitaine |
| `3` | Auvergne |
| `4` | Basse-Normandie |
| `5` | Bourgogne |
| `6` | Bretagne |
| `7` | Centre-Val de Loire |
| `8` | Champagne-Ardenne |
| `9` | Corse |
| `10` | Franche-Comté |
| `11` | Île-de-France |
| `12` | Languedoc-Roussillon |
| `13` | Limousin |
| `14` | Lorraine |
| `15` | Midi-Pyrénées |
| `16` | Nord-Pas-de-Calais |
| `17` | Pays de la Loire |
| `18` | Picardie |
| `19` | Poitou-Charentes |
| `20` | Provence-Alpes-Côte d'Azur |
| `21` | Rhône-Alpes |

---

## Exemple complet

```json
{
  "searches": [
    {
      "name": "MacBook Pro pas cher à Paris",
      "keywords": "macbook pro",
      "onlyTitle": false,
      "category": "15",
      "locations": ["Paris"],
      "priceMin": 300,
      "priceMax": 800,
      "ownerType": "private",
      "shippable": false,
      "buyerLocation": {
        "lat": 48.8566,
        "lng": 2.3522
      }
    },
    {
      "name": "Vélos électriques Île-de-France",
      "keywords": "vélo électrique",
      "category": "55",
      "locations": [11],
      "priceMax": 1500,
      "ownerType": "all",
      "buyerLocation": {
        "lat": 48.8566,
        "lng": 2.3522
      }
    }
  ]
}
```

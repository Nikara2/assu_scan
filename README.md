# Gestion des Cartes d'Assurance - Prototype

Prototype fonctionnel pour la gestion des cartes d'assurance dans une clinique. Permet de scanner, extraire automatiquement les informations via OCR, et archiver les cartes d'assurance des patients.

## Fonctionnalités

- **Deux modes de capture:**
  - Scanner une carte via upload d'image depuis la galerie
  - Capturer directement avec la caméra de l'appareil
- **Extraction automatique améliorée** des informations avec OCR (Tesseract.js)
  - Parsing ligne par ligne pour une meilleure précision
  - Support de multiples formats de cartes
  - Logs détaillés pour le débogage
- Stockage de la photo de la carte pour archivage
- Affichage de la liste des cartes scannées avec leurs informations
- Modal détaillé pour chaque carte avec toutes les informations extraites
- Interface utilisateur moderne et responsive

## Technologies utilisées

### Backend
- Node.js avec Express
- Prisma ORM avec SQLite
- Tesseract.js pour l'OCR
- Multer pour l'upload de fichiers
- Sharp pour le traitement d'images

### Frontend
- React avec TypeScript
- Vite pour le build
- Tailwind CSS pour le design
- Axios pour les requêtes HTTP

## Installation

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn

### 1. Installation du Backend

```bash
cd backend
npm install
```

### 2. Configuration de la base de données

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### 3. Installation du Frontend

```bash
cd frontend
npm install
```

## Lancement du projet

### Option 1: Lancer manuellement (deux terminaux)

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
Le serveur backend démarre sur http://localhost:3001

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
L'interface frontend sera accessible sur http://localhost:3000

### Option 2: Lancer avec un seul script (optionnel)

Vous pouvez créer un script pour lancer les deux services en même temps.

## Utilisation

### Scanner une carte d'assurance

1. Ouvrez votre navigateur à l'adresse http://localhost:3000

2. **Option 1 - Capture avec la caméra:**
   - Cliquez sur "Prendre une photo"
   - Autorisez l'accès à la caméra si demandé
   - Positionnez la carte dans le cadre
   - Cliquez sur "Capturer la photo"

3. **Option 2 - Upload depuis la galerie:**
   - Cliquez sur "Choisir depuis la galerie"
   - Sélectionnez une photo de carte d'assurance

4. Vérifiez l'aperçu de l'image
5. Cliquez sur "Uploader et traiter la carte"
6. Attendez que l'OCR traite l'image (5-15 secondes selon la qualité)
7. Les informations extraites s'afficheront automatiquement dans le tableau

### Consulter les cartes scannées

1. Le tableau affiche toutes les cartes scannées avec:
   - Miniature de la carte
   - Nom de l'assuré
   - Numéros de police et d'assuré
   - Souscripteur
   - Date de scan

2. Cliquez sur "Voir détails" pour ouvrir le modal avec:
   - Image complète de la carte
   - Toutes les informations extraites
   - Texte brut OCR pour vérification

## Structure du projet

```
ii/
├── backend/
│   ├── src/
│   │   ├── index.ts                 # Point d'entrée du serveur
│   │   ├── routes/
│   │   │   └── insurance.routes.ts  # Routes API
│   │   └── services/
│   │       └── ocr.service.ts       # Service OCR
│   ├── prisma/
│   │   └── schema.prisma            # Schéma de base de données
│   ├── uploads/                     # Dossier pour les images uploadées
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── UploadCard.tsx       # Composant d'upload (caméra + galerie)
    │   │   ├── CameraCapture.tsx    # Composant de capture photo
    │   │   └── CardsList.tsx        # Liste des cartes avec modal
    │   ├── App.tsx                  # Composant principal
    │   └── main.tsx                 # Point d'entrée
    └── package.json
```

## API Endpoints

### POST /api/insurance/upload
Upload et traite une carte d'assurance

**Body:** FormData avec un champ 'image' (fichier)

**Response:**
```json
{
  "success": true,
  "message": "Carte d'assurance enregistrée avec succès",
  "data": {
    "id": "uuid",
    "imageUrl": "/uploads/card-123.jpg",
    "souscripteur": "Nom du souscripteur",
    "numPolice": "ABC123",
    ...
  }
}
```

### GET /api/insurance/cards
Récupère toutes les cartes scannées

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 10
}
```

### GET /api/insurance/cards/:id
Récupère une carte spécifique

### DELETE /api/insurance/cards/:id
Supprime une carte

## Configuration

### Variables d'environnement (backend/.env)
```
DATABASE_URL="file:./dev.db"
PORT=3001
```

## Architecture technique

### Backend : OCR et Stockage

1. **Service OCR amélioré** :
   - Prétraitement d'image avec Sharp (niveaux de gris, normalisation, netteté)
   - Extraction de texte avec Tesseract.js (langue française)
   - **Parsing intelligent ligne par ligne** pour meilleure précision
   - Support de multiples variantes de labels (souscripteur, subscriber, etc.)
   - Patterns de secours pour les cas difficiles
   - Logs détaillés dans la console backend pour le débogage

2. **Stockage des images** :
   - Images sauvegardées localement dans `/backend/uploads`
   - Chemin stocké en base de données
   - Format: `card-{timestamp}-{random}.jpg`
   - Limite de taille: 10MB

3. **Parsing des données** :
   - Analyse ligne par ligne du texte OCR
   - Extraction intelligente avec multiples labels par champ
   - Nettoyage et validation des données
   - Gestion des formats variés de cartes d'assurance

### Frontend : Capture et Affichage

1. **Composant CameraCapture** :
   - Accès à la caméra via `getUserMedia` API
   - Préférence automatique pour la caméra arrière sur mobile
   - Guide visuel pour le positionnement de la carte
   - Capture en haute résolution (1920x1080)
   - Conversion automatique en fichier JPEG

2. **Composant UploadCard** :
   - Deux modes: capture caméra ou upload galerie
   - Aperçu de l'image avant traitement
   - Indicateur de progression pendant l'OCR
   - Messages de succès/erreur clairs

3. **Composant CardsList** :
   - Tableau responsive avec toutes les cartes
   - Modal détaillé pour chaque carte
   - Rafraîchissement automatique après ajout

## Améliorations apportées (v1.1)

- ✅ **Parsing OCR amélioré** : Analyse ligne par ligne avec meilleure précision
- ✅ **Capture photo par caméra** : Possibilité de prendre une photo directement
- ✅ **Logs détaillés** : Console backend affiche le processus de parsing
- ✅ **Support multi-formats** : Gestion de différents formats de cartes
- ✅ **Interface améliorée** : Deux boutons distincts pour caméra et galerie

## Améliorations futures possibles

1. Ajouter l'édition manuelle des informations extraites
2. Ajouter l'authentification pour sécuriser l'accès
3. Implémenter un système de recherche et de filtrage des cartes
4. Intégrer un stockage cloud (AWS S3, Cloudinary) pour les images
5. Ajouter des statistiques et des rapports
6. Implémenter l'export des données en CSV/Excel
7. Ajouter la reconnaissance automatique du type de carte
8. Implémenter un système de vérification/validation des données

## Problèmes connus et solutions

### OCR
- **Problème**: L'OCR peut avoir des difficultés avec des cartes de mauvaise qualité
- **Solution**: Assurez-vous que la carte est bien éclairée et nette lors de la capture

### Temps de traitement
- **Problème**: Le traitement peut prendre 5-15 secondes
- **Solution**: C'est normal, l'OCR et le parsing sont des opérations complexes

### Précision du parsing
- **Problème**: Certains champs peuvent ne pas être extraits correctement
- **Solution**: Vérifiez les logs dans la console backend pour voir le texte OCR brut et ajuster les patterns si nécessaire. Le texte brut OCR est aussi disponible dans le modal de détails.

## Support

Pour toute question ou problème, veuillez créer une issue dans le repository.

## Licence

MIT

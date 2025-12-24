import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { processInsuranceCard } from '../services/ocr.service';

const router = express.Router();
const prisma = new PrismaClient();

// Configuration de Multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'card-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite de 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images JPEG et PNG sont autorisées'));
    }
  },
});

/**
 * POST /api/insurance/upload
 * Upload et traite une carte d'assurance
 */
router.post('/upload', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucune image fournie',
      });
    }

    const imagePath = req.file.path;
    const imageUrl = `/uploads/${req.file.filename}`;

    // Traiter l'image avec OCR
    console.log('Traitement de l\'image:', imagePath);
    const extractedData = await processInsuranceCard(imagePath);

    // Enregistrer dans la base de données
    const insuranceCard = await prisma.insuranceCard.create({
      data: {
        imageUrl: imageUrl,
        souscripteur: extractedData.souscripteur,
        numPolice: extractedData.numPolice,
        numAssure: extractedData.numAssure,
        assure: extractedData.assure,
        beneficiaire: extractedData.beneficiaire,
        age: extractedData.age,
        sexe: extractedData.sexe,
        rawText: extractedData.rawText,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Carte d\'assurance enregistrée avec succès',
      data: insuranceCard,
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du traitement de la carte',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
});

/**
 * GET /api/insurance/cards
 * Récupère la liste de toutes les cartes d'assurance
 */
router.get('/cards', async (req: Request, res: Response) => {
  try {
    const cards = await prisma.insuranceCard.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      data: cards,
      count: cards.length,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des cartes:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des cartes',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
});

/**
 * GET /api/insurance/cards/:id
 * Récupère une carte d'assurance spécifique
 */
router.get('/cards/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const card = await prisma.insuranceCard.findUnique({
      where: { id },
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Carte non trouvée',
      });
    }

    return res.status(200).json({
      success: true,
      data: card,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la carte:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la carte',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
});

/**
 * DELETE /api/insurance/cards/:id
 * Supprime une carte d'assurance
 */
router.delete('/cards/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.insuranceCard.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Carte supprimée avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la carte:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la carte',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
});

export default router;

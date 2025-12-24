import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

export interface InsuranceCardData {
  souscripteur?: string;
  numPolice?: string;
  numAssure?: string;
  assure?: string;
  beneficiaire?: string;
  age?: number;
  sexe?: string;
  rawText: string;
}

/**
 * Prétraite l'image pour améliorer la précision de l'OCR
 */
export async function preprocessImage(imagePath: string): Promise<string> {
  const processedPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '_processed.png');

  await sharp(imagePath)
    .grayscale() // Convertir en niveaux de gris
    .normalize() // Normaliser le contraste
    .sharpen() // Augmenter la netteté
    .toFile(processedPath);

  return processedPath;
}

/**
 * Extrait le texte d'une image en utilisant Tesseract.js
 */
export async function extractTextFromImage(imagePath: string): Promise<string> {
  try {
    // Prétraiter l'image
    const processedPath = await preprocessImage(imagePath);

    // Exécuter l'OCR
    const result = await Tesseract.recognize(processedPath, 'fra', {
      logger: (m) => console.log(m), // Log la progression
    });

    // Supprimer l'image prétraitée
    if (fs.existsSync(processedPath)) {
      fs.unlinkSync(processedPath);
    }

    return result.data.text;
  } catch (error) {
    console.error('Erreur lors de l\'extraction du texte:', error);
    throw new Error('Échec de l\'extraction du texte de l\'image');
  }
}

/**
 * Nettoie et normalise une ligne de texte
 */
function cleanLine(line: string): string {
  return line.replace(/\s+/g, ' ').replace(/[:\|]/g, ' ').trim();
}

/**
 * Extrait la valeur après un label dans une ligne
 */
function extractValueAfterLabel(line: string, labels: string[]): string | null {
  const cleanedLine = cleanLine(line);

  for (const label of labels) {
    const regex = new RegExp(label + '\\s*[:\\|]?\\s*(.+)', 'i');
    const match = cleanedLine.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

/**
 * Parse le texte OCR pour extraire les informations de la carte d'assurance
 */
export function parseInsuranceData(text: string): InsuranceCardData {
  const data: InsuranceCardData = {
    rawText: text
  };

  console.log('=== DÉBUT DU PARSING OCR ===');
  console.log('Texte brut:', text);

  // Diviser le texte en lignes pour un parsing plus précis
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  console.log('Lignes extraites:', lines);

  // Parser ligne par ligne
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cleanedLine = cleanLine(line);
    const lowerLine = cleanedLine.toLowerCase();

    console.log(`Ligne ${i}:`, cleanedLine);

    // Extraire le souscripteur
    if (!data.souscripteur && (lowerLine.includes('souscripteur') || lowerLine.includes('subscriber'))) {
      const value = extractValueAfterLabel(line, ['souscripteur', 'subscriber']);
      if (value && value.length > 2 && !/^\d+$/.test(value)) {
        data.souscripteur = value;
        console.log('✓ Souscripteur trouvé:', value);
      } else if (i + 1 < lines.length) {
        // Si pas de valeur sur la même ligne, regarder la ligne suivante
        const nextLine = cleanLine(lines[i + 1]);
        if (nextLine && nextLine.length > 2 && !/^\d+$/.test(nextLine)) {
          data.souscripteur = nextLine;
          console.log('✓ Souscripteur trouvé (ligne suivante):', nextLine);
        }
      }
    }

    // Extraire le numéro de police
    if (!data.numPolice && (lowerLine.includes('police') || lowerLine.includes('policy'))) {
      const value = extractValueAfterLabel(line, ['n°\\s*police', 'police', 'policy', 'n°\\s*de\\s*police', 'numero\\s*police']);
      if (value) {
        // Nettoyer pour garder uniquement les alphanumériques et tirets
        const cleaned = value.replace(/[^A-Z0-9\-]/gi, '');
        if (cleaned.length > 0) {
          data.numPolice = cleaned;
          console.log('✓ Numéro de police trouvé:', cleaned);
        }
      }
    }

    // Extraire le numéro d'assuré
    if (!data.numAssure && (lowerLine.includes('assuré') || lowerLine.includes('assure') || lowerLine.includes('member'))) {
      const value = extractValueAfterLabel(line, [
        'n°\\s*assuré',
        'numero\\s*assuré',
        'n°\\s*assure',
        'numero\\s*assure',
        'member\\s*number',
        'member\\s*id'
      ]);
      if (value) {
        const cleaned = value.replace(/[^A-Z0-9\-]/gi, '');
        if (cleaned.length > 0) {
          data.numAssure = cleaned;
          console.log('✓ Numéro assuré trouvé:', cleaned);
        }
      }
    }

    // Extraire le nom de l'assuré
    if (!data.assure && (lowerLine.includes('nom') || lowerLine.includes('assuré') || lowerLine.includes('name'))) {
      const value = extractValueAfterLabel(line, [
        'nom\\s*assuré',
        'nom\\s*de\\s*l\'assuré',
        'assuré',
        'assure',
        'nom',
        'name',
        'member\\s*name'
      ]);
      if (value && value.length > 2 && !/^\d+$/.test(value) && !value.toLowerCase().includes('police')) {
        data.assure = value;
        console.log('✓ Nom assuré trouvé:', value);
      }
    }

    // Extraire le bénéficiaire
    if (!data.beneficiaire && (lowerLine.includes('bénéficiaire') || lowerLine.includes('beneficiaire') || lowerLine.includes('beneficiary'))) {
      const value = extractValueAfterLabel(line, ['bénéficiaire', 'beneficiaire', 'beneficiary']);
      if (value && value.length > 2 && !/^\d+$/.test(value)) {
        data.beneficiaire = value;
        console.log('✓ Bénéficiaire trouvé:', value);
      }
    }

    // Extraire l'âge
    if (!data.age && (lowerLine.includes('âge') || lowerLine.includes('age'))) {
      const value = extractValueAfterLabel(line, ['âge', 'age']);
      if (value) {
        const ageMatch = value.match(/(\d+)/);
        if (ageMatch) {
          data.age = parseInt(ageMatch[1], 10);
          console.log('✓ Âge trouvé:', data.age);
        }
      }
    }

    // Extraire le sexe
    if (!data.sexe && (lowerLine.includes('sexe') || lowerLine.includes('gender') || lowerLine.includes('sex'))) {
      const value = extractValueAfterLabel(line, ['sexe', 'gender', 'sex']);
      if (value) {
        const sexeNormalized = value.toUpperCase();
        if (sexeNormalized.includes('M') || sexeNormalized.includes('H') || sexeNormalized.includes('MALE')) {
          data.sexe = 'M';
          console.log('✓ Sexe trouvé: M');
        } else if (sexeNormalized.includes('F') || sexeNormalized.includes('FEMALE')) {
          data.sexe = 'F';
          console.log('✓ Sexe trouvé: F');
        }
      }
    }
  }

  // Essayer aussi avec le texte complet pour les cas où les données sont sur une seule ligne
  const cleanText = text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();

  // Patterns de secours pour numéros si non trouvés
  if (!data.numPolice) {
    const policeMatch = cleanText.match(/(?:police|policy)[^\d]*([A-Z0-9\-]{4,})/i);
    if (policeMatch) {
      data.numPolice = policeMatch[1];
      console.log('✓ Numéro de police trouvé (secours):', policeMatch[1]);
    }
  }

  if (!data.numAssure) {
    const assureMatch = cleanText.match(/(?:assuré|assure|member)[^\d]*([A-Z0-9\-]{4,})/i);
    if (assureMatch) {
      data.numAssure = assureMatch[1];
      console.log('✓ Numéro assuré trouvé (secours):', assureMatch[1]);
    }
  }

  console.log('=== RÉSULTAT FINAL ===');
  console.log('Données extraites:', data);
  console.log('=== FIN DU PARSING ===\n');

  return data;
}

/**
 * Traite une image de carte d'assurance et retourne les données extraites
 */
export async function processInsuranceCard(imagePath: string): Promise<InsuranceCardData> {
  try {
    // Extraire le texte
    const extractedText = await extractTextFromImage(imagePath);

    // Parser les données
    const parsedData = parseInsuranceData(extractedText);

    return parsedData;
  } catch (error) {
    console.error('Erreur lors du traitement de la carte:', error);
    throw error;
  }
}

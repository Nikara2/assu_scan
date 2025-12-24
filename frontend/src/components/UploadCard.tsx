import React, { useState } from 'react';
import axios from 'axios';
import CameraCapture from './CameraCapture';

interface InsuranceCard {
  id: string;
  imageUrl: string;
  souscripteur?: string;
  numPolice?: string;
  numAssure?: string;
  assure?: string;
  beneficiaire?: string;
  age?: number;
  sexe?: string;
  rawText?: string;
  createdAt: string;
}

interface UploadCardProps {
  onCardAdded: (card: InsuranceCard) => void;
}

const UploadCard: React.FC<UploadCardProps> = ({ onCardAdded }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleFileSelection = (file: File) => {
    setSelectedFile(file);

    // Créer un aperçu de l'image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Réinitialiser le message
    setMessage(null);
  };

  const handleCameraCapture = (file: File) => {
    setShowCamera(false);
    handleFileSelection(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage({
        type: 'error',
        text: 'Veuillez sélectionner une image',
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post<{
        success: boolean;
        message: string;
        data: InsuranceCard;
      }>('/api/insurance/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setMessage({
          type: 'success',
          text: 'Carte d\'assurance enregistrée avec succès',
        });

        // Notifier le parent
        onCardAdded(response.data.data);

        // Réinitialiser le formulaire
        setSelectedFile(null);
        setPreviewUrl(null);

        // Réinitialiser l'input file
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        setMessage({
          type: 'error',
          text: response.data.message || 'Erreur lors de l\'enregistrement',
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      setMessage({
        type: 'error',
        text: 'Erreur réseau lors de l\'upload',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Scanner une carte d'assurance</h2>

        {/* Options de sélection */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Choisissez une option:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Bouton Caméra */}
            <button
              onClick={() => setShowCamera(true)}
              className="flex items-center justify-center px-4 py-3 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <svg
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Prendre une photo
            </button>

            {/* Bouton Upload */}
            <label
              htmlFor="file-input"
              className="flex items-center justify-center px-4 py-3 border-2 border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors cursor-pointer"
            >
              <svg
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Choisir depuis la galerie
            </label>
            <input
              id="file-input"
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

      {previewUrl && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Aperçu:</p>
          <img
            src={previewUrl}
            alt="Aperçu de la carte"
            className="max-w-full h-auto rounded-lg border border-gray-300"
            style={{ maxHeight: '400px' }}
          />
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!selectedFile || loading}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
          !selectedFile || loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Traitement en cours...
          </span>
        ) : (
          'Uploader et traiter la carte'
        )}
      </button>

      {message && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}
      </div>

      {/* Modal de capture de caméra */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </>
  );
};

export default UploadCard;

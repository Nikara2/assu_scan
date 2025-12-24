import React, { useState } from 'react';
import UploadCard from './components/UploadCard';
import CardsList from './components/CardsList';

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

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCardAdded = (card: InsuranceCard) => {
    // Rafraîchir la liste des cartes
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Gestion des Cartes d'Assurance
          </h1>
          <p className="text-gray-600">
            Scannez et gérez facilement les cartes d'assurance de vos patients
          </p>
        </header>

        <div className="max-w-7xl mx-auto space-y-6">
          <UploadCard onCardAdded={handleCardAdded} />
          <CardsList refreshTrigger={refreshTrigger} />
        </div>

        <footer className="mt-12 text-center text-gray-600 text-sm">
          <p>Prototype de gestion de cartes d'assurance - Clinique</p>
        </footer>
      </div>
    </div>
  );
}

export default App;

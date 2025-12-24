import React, { useEffect, useState } from 'react';
import axios from 'axios';

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

interface CardsListProps {
  refreshTrigger: number;
}

const CardsList: React.FC<CardsListProps> = ({ refreshTrigger }) => {
  const [cards, setCards] = useState<InsuranceCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<InsuranceCard | null>(null);

  const fetchCards = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<{
        success: boolean;
        data: InsuranceCard[];
        count: number;
      }>('/api/insurance/cards');

      if (response.data.success) {
        setCards(response.data.data);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des cartes:', err);
      setError('Erreur lors du chargement des cartes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [refreshTrigger]);

  const handleCardClick = (card: InsuranceCard) => {
    setSelectedCard(card);
  };

  const closeModal = () => {
    setSelectedCard(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-12">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
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
          <span className="ml-3 text-gray-600">Chargement des cartes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12 text-red-600">{error}</div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Cartes scannées</h2>
        <div className="text-center py-12 text-gray-500">
          Aucune carte n'a été scannée pour le moment.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Cartes scannées ({cards.length})
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assuré
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                N° Police
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                N° Assuré
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Souscripteur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cards.map((card) => (
              <tr key={card.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <img
                    src={card.imageUrl}
                    alt="Carte"
                    className="h-12 w-20 object-cover rounded cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => handleCardClick(card)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {card.assure || '-'}
                  </div>
                  {card.age && card.sexe && (
                    <div className="text-sm text-gray-500">
                      {card.age} ans - {card.sexe}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {card.numPolice || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {card.numAssure || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {card.souscripteur || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(card.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleCardClick(card)}
                    className="text-blue-600 hover:text-blue-900 font-medium"
                  >
                    Voir détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal pour afficher les détails de la carte */}
      {selectedCard && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Détails de la carte d'assurance
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">
                    Image de la carte:
                  </h4>
                  <img
                    src={selectedCard.imageUrl}
                    alt="Carte d'assurance"
                    className="w-full h-auto rounded-lg border border-gray-300"
                  />
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">
                    Informations extraites:
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Assuré:
                      </label>
                      <p className="text-gray-900">{selectedCard.assure || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Souscripteur:
                      </label>
                      <p className="text-gray-900">
                        {selectedCard.souscripteur || '-'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Bénéficiaire:
                      </label>
                      <p className="text-gray-900">
                        {selectedCard.beneficiaire || '-'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          N° Police:
                        </label>
                        <p className="text-gray-900">
                          {selectedCard.numPolice || '-'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          N° Assuré:
                        </label>
                        <p className="text-gray-900">
                          {selectedCard.numAssure || '-'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Âge:
                        </label>
                        <p className="text-gray-900">
                          {selectedCard.age ? `${selectedCard.age} ans` : '-'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Sexe:
                        </label>
                        <p className="text-gray-900">{selectedCard.sexe || '-'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Date de scan:
                      </label>
                      <p className="text-gray-900">
                        {formatDate(selectedCard.createdAt)}
                      </p>
                    </div>
                  </div>

                  {selectedCard.rawText && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-500">
                        Texte brut OCR:
                      </label>
                      <div className="mt-1 p-3 bg-gray-50 rounded border border-gray-200 text-xs text-gray-700 max-h-40 overflow-y-auto">
                        {selectedCard.rawText}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardsList;

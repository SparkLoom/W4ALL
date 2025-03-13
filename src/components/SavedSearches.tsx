import React from 'react';
import { motion } from 'framer-motion';
import { Bookmark, X, Bell } from 'lucide-react';
import useJobStore, { SavedSearch } from '../stores/jobStore';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const SavedSearches: React.FC = () => {
  const { user } = useAuth();
  const { savedSearches, deleteSavedSearch, setFilters } = useJobStore();
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [searchName, setSearchName] = React.useState('');

  const handleSaveCurrentSearch = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para salvar buscas');
      return;
    }

    try {
      const newSearch: SavedSearch = {
        id: '',
        userId: user.id,
        filters: useJobStore.getState().filters,
        name: searchName,
        createdAt: new Date().toISOString(),
      };

      await useJobStore.getState().saveSearch(newSearch);
      setShowSaveDialog(false);
      setSearchName('');
      toast.success('Busca salva com sucesso');
    } catch (error) {
      toast.error('Erro ao salvar busca');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSavedSearch(id);
      toast.success('Busca removida com sucesso');
    } catch (error) {
      toast.error('Erro ao remover busca');
    }
  };

  const handleApplySearch = (search: SavedSearch) => {
    setFilters(search.filters);
    toast.success('Filtros aplicados');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Buscas Salvas</h2>
        <button
          onClick={() => setShowSaveDialog(true)}
          className="flex items-center text-blue-700 hover:text-blue-900"
        >
          <Bookmark className="h-5 w-5 mr-2" />
          Salvar Busca Atual
        </button>
      </div>

      {showSaveDialog && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 border border-gray-200 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Nome para esta busca"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              onClick={handleSaveCurrentSearch}
              className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800"
            >
              Salvar
            </button>
            <button
              onClick={() => setShowSaveDialog(false)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {savedSearches.map((search) => (
          <motion.div
            key={search.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div>
              <h3 className="font-medium text-gray-900">{search.name}</h3>
              <p className="text-sm text-gray-500">
                {search.filters.searchTerm && `"${search.filters.searchTerm}"`}{' '}
                {search.filters.location && `em ${search.filters.location}`}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleApplySearch(search)}
                className="p-2 text-blue-700 hover:text-blue-900"
                title="Aplicar filtros"
              >
                <Bell className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDelete(search.id)}
                className="p-2 text-red-600 hover:text-red-800"
                title="Remover"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        ))}

        {savedSearches.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            Nenhuma busca salva ainda
          </p>
        )}
      </div>
    </div>
  );
};

export default SavedSearches;
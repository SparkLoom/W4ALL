import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Globe, ExternalLink, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { JobScraper, ScrapedJob } from '../../services/jobScraper';

const JobSearchAggregator = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [searchResults, setSearchResults] = useState<ScrapedJob[]>([]);
  const [isAISearch, setIsAISearch] = useState(false);

  const jobSites = {
    portugal: [
      { name: "Net Empregos", url: "https://www.net-empregos.com/" },
      { name: "SAPO Emprego", url: "https://emprego.sapo.pt/" },
      { name: "Emprego XL", url: "https://www.empregoxl.com/" },
      { name: "Turijobs", url: "https://www.turijobs.pt/" },
      { name: "IEFP", url: "https://www.iefp.pt/emprego" },
      { name: "CustoJusto", url: "https://www.custojusto.pt/emprego" }
    ],
    international: [
      { name: "LinkedIn", url: "https://www.linkedin.com/jobs/" },
      { name: "Indeed", url: "https://www.indeed.com/" },
      { name: "Glassdoor", url: "https://www.glassdoor.com/Job/index.htm" },
      { name: "Jooble", url: "https://jooble.org/" },
      { name: "Monster", url: "https://www.monster.com/" }
    ]
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      toast.error('Por favor, insira um termo de busca');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setSearchResults([]);

    try {
      const results = await JobScraper.searchAllSites(searchTerm, (progress) => {
        setProgress(progress);
      });

      setSearchResults(results);
      toast.success('Pesquisa concluída com sucesso!');
    } catch (error) {
      console.error('Error searching jobs:', error);
      toast.error('Erro ao realizar a pesquisa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAISearch = () => {
    setIsAISearch(true);
    handleSearch(new Event('submit') as React.FormEvent);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Agregador de Vagas</h2>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar vagas..."
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Pesquisar
            </button>
            <button
              type="button"
              onClick={handleAISearch}
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              Pesquisa por IA
            </button>
          </div>

          {isLoading && (
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-600"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <p className="text-sm text-gray-500 text-center">
                Pesquisando... {Math.round(progress)}%
              </p>
            </div>
          )}
        </form>

        <div className="mt-8">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Sites em Portugal
              </h3>
              <ul className="space-y-2">
                {jobSites.portugal.map((site) => (
                  <li key={site.name} className="flex items-center text-sm text-gray-600">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600"
                    >
                      {site.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Sites Internacionais
              </h3>
              <ul className="space-y-2">
                {jobSites.international.map((site) => (
                  <li key={site.name} className="flex items-center text-sm text-gray-600">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600"
                    >
                      {site.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Resultados da Pesquisa</h3>
            <div className="space-y-4">
              {searchResults.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{result.title}</h4>
                      {result.company && (
                        <p className="text-sm text-gray-600 mt-1">{result.company}</p>
                      )}
                      {result.location && (
                        <p className="text-sm text-gray-500 mt-1">{result.location}</p>
                      )}
                      <p className="text-sm text-blue-600 mt-1">{result.source}</p>
                    </div>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <span className="text-sm">Ver Vaga</span>
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {searchResults.length === 0 && !isLoading && searchTerm && (
          <div className="mt-8 text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum resultado encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Tente ajustar seus termos de busca ou tente novamente mais tarde.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSearchAggregator;
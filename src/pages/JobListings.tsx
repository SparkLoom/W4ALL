import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import JobSearchFilters from '../components/JobSearchFilters';
import SavedSearches from '../components/SavedSearches';
import useJobStore from '../stores/jobStore';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, MapPin, Calendar, Clock, DollarSign } from 'lucide-react';

const JobListings = () => {
  const { user } = useAuth();
  const { jobs, loading, fetchJobs } = useJobStore();

  React.useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Hoje';
    } else if (diffDays === 1) {
      return 'Ontem';
    } else if (diffDays < 7) {
      return `${diffDays} dias atrás`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'semana' : 'semanas'} atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900">Encontre sua próxima oportunidade</h1>
            <p className="mt-4 text-xl text-gray-600">
              Explore milhares de vagas em empresas inovadoras
            </p>
          </motion.div>

          <JobSearchFilters />
          
          {user && <SavedSearches />}

          {loading ? (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhuma vaga encontrada</h3>
              <p className="mt-1 text-gray-500">Tente ajustar seus filtros de busca</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {jobs.map((job) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        {job.image_url ? (
                          <img 
                            src={job.image_url} 
                            alt={job.company} 
                            className="h-16 w-16 object-cover rounded-lg mr-4"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                            }}
                          />
                        ) : (
                          <div className="h-16 w-16 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                            <Briefcase className="h-8 w-8 text-blue-700" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-gray-600 mt-1">{job.company}</p>
                          <div className="flex flex-wrap items-center mt-2 text-gray-500 text-sm">
                            <div className="flex items-center mr-4 mb-2">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center mr-4 mb-2">
                              <Briefcase className="h-4 w-4 mr-1" />
                              <span>
                                {job.type === 'full-time' && 'Tempo Integral'}
                                {job.type === 'part-time' && 'Meio Período'}
                                {job.type === 'contract' && 'Contrato'}
                                {job.type === 'temporary' && 'Temporário'}
                                {job.type === 'internship' && 'Estágio'}
                              </span>
                            </div>
                            {job.salary_range && (
                              <div className="flex items-center mr-4 mb-2">
                                <DollarSign className="h-4 w-4 mr-1" />
                                <span className="text-green-600 font-medium">
                                  {job.salary_range}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center mb-2">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{formatDate(job.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {job.external_url && (
                          <a
                            href={job.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition duration-300 text-center"
                          >
                            Ver Vaga
                          </a>
                        )}
                        {job.application_url && (
                          <a
                            href={job.application_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 transition duration-300 text-center"
                          >
                            Candidatar
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Descrição</h4>
                        <p className="text-gray-600 whitespace-pre-line">{job.description}</p>
                      </div>
                      
                      {job.requirements && (
                        <div className="border-t border-gray-200 mt-4 pt-4">
                          <h4 className="text-lg font-medium text-gray-900 mb-2">Requisitos</h4>
                          <p className="text-gray-600 whitespace-pre-line">{job.requirements}</p>
                        </div>
                      )}
                      
                      {job.benefits && (
                        <div className="border-t border-gray-200 mt-4 pt-4">
                          <h4 className="text-lg font-medium text-gray-900 mb-2">Benefícios</h4>
                          <p className="text-gray-600 whitespace-pre-line">{job.benefits}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JobListings;
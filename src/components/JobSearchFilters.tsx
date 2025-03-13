import React from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, DollarSign, Filter, Wifi } from 'lucide-react';
import useJobStore, { JobFilters } from '../stores/jobStore';

const JobSearchFilters: React.FC = () => {
  const { filters, setFilters } = useJobStore();
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const handleFilterChange = (key: keyof JobFilters, value: any) => {
    setFilters({ [key]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cargo ou palavra-chave"
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Localização"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Briefcase className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Tipo de Contrato</option>
              <option value="full-time">Tempo Integral</option>
              <option value="part-time">Meio Período</option>
              <option value="contract">Contrato</option>
              <option value="temporary">Temporário</option>
              <option value="internship">Estágio</option>
            </select>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-blue-700 hover:text-blue-900 transition duration-300"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showAdvanced ? 'Ocultar filtros avançados' : 'Mostrar filtros avançados'}
          </button>
        </div>

        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Faixa Salarial</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    placeholder="Mínimo"
                    value={filters.salaryMin || ''}
                    onChange={(e) => handleFilterChange('salaryMin', e.target.value ? parseInt(e.target.value) : null)}
                    className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    placeholder="Máximo"
                    value={filters.salaryMax || ''}
                    onChange={(e) => handleFilterChange('salaryMax', e.target.value ? parseInt(e.target.value) : null)}
                    className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Experiência</label>
              <select
                value={filters.experienceLevel}
                onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Todos os níveis</option>
                <option value="intern">Estágio</option>
                <option value="junior">Júnior</option>
                <option value="mid">Pleno</option>
                <option value="senior">Sênior</option>
                <option value="expert">Especialista</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Publicado</label>
              <select
                value={filters.postedWithin}
                onChange={(e) => handleFilterChange('postedWithin', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Qualquer data</option>
                <option value="1">Últimas 24 horas</option>
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.remote}
                  onChange={(e) => handleFilterChange('remote', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 flex items-center">
                  <Wifi className="h-4 w-4 mr-1" />
                  Apenas vagas remotas
                </span>
              </label>
            </div>
          </motion.div>
        )}
      </form>
    </div>
  );
};

export default JobSearchFilters;
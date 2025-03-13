import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Building, 
  Search, 
  MapPin, 
  Users, 
  Star, 
  Filter, 
  Globe, 
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

type Company = {
  id: string;
  name: string;
  description: string;
  logo_url: string | null;
  website: string | null;
  industry: string | null;
  size: string | null;
  founded_year: number | null;
  headquarters: string | null;
  created_at: string;
  avg_rating?: number;
  review_count?: number;
  job_count?: number;
};

const Companies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [industries, setIndustries] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [companies, searchTerm, industryFilter, sizeFilter, ratingFilter, locationFilter]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      
      // Fetch companies with aggregated data
      const { data, error } = await supabase
        .from('companies')
        .select('*');
      
      if (error) throw error;
      
      // For each company, fetch additional data
      const companiesWithData = await Promise.all((data || []).map(async (company) => {
        // Get average rating and review count
        const { data: reviewData, error: reviewError } = await supabase
          .from('company_reviews')
          .select('rating')
          .eq('company_id', company.id);
        
        if (reviewError) throw reviewError;
        
        const avgRating = reviewData && reviewData.length > 0
          ? reviewData.reduce((sum, review) => sum + review.rating, 0) / reviewData.length
          : 0;
        
        // Get job count
        const { data: jobData, error: jobError } = await supabase
          .from('job_posts')
          .select('id')
          .eq('company', company.name)
          .eq('status', 'active');
        
        if (jobError) throw jobError;
        
        return {
          ...company,
          avg_rating: parseFloat(avgRating.toFixed(1)),
          review_count: reviewData?.length || 0,
          job_count: jobData?.length || 0,
        };
      }));
      
      setCompanies(companiesWithData);
      setFilteredCompanies(companiesWithData);
      
      // Extract unique industries and locations for filters
      const uniqueIndustries = Array.from(new Set(companiesWithData.map(c => c.industry).filter(Boolean)));
      const uniqueLocations = Array.from(new Set(companiesWithData.map(c => c.headquarters).filter(Boolean)));
      
      setIndustries(uniqueIndustries as string[]);
      setLocations(uniqueLocations as string[]);
    } catch (error: any) {
      console.error('Error fetching companies:', error.message);
      toast.error('Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    let filtered = [...companies];
    
    if (searchTerm) {
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (industryFilter) {
      filtered = filtered.filter(company => company.industry === industryFilter);
    }
    
    if (sizeFilter) {
      filtered = filtered.filter(company => company.size === sizeFilter);
    }
    
    if (ratingFilter) {
      const minRating = parseInt(ratingFilter);
      filtered = filtered.filter(company => (company.avg_rating || 0) >= minRating);
    }
    
    if (locationFilter) {
      filtered = filtered.filter(company => 
        company.headquarters && company.headquarters.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }
    
    setFilteredCompanies(filtered);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterCompanies();
  };

  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-900">Empresas</h1>
            <p className="mt-4 text-xl text-gray-600">Conheça as empresas que estão contratando e veja avaliações de funcionários</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-6 mb-8"
          >
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar empresas por nome ou descrição"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <button 
                type="submit"
                className="bg-blue-700 text-white px-6 py-2 rounded-md hover:bg-blue-800 transition duration-300"
              >
                Pesquisar
              </button>
            </form>

            <div className="mt-4 flex justify-center">
              <button
                onClick={toggleAdvancedFilters}
                className="flex items-center text-blue-700 hover:text-blue-900 transition duration-300"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showAdvancedFilters ? 'Ocultar filtros avançados' : 'Mostrar filtros avançados'}
              </button>
            </div>

            {showAdvancedFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Indústria</label>
                  <select
                    value={industryFilter}
                    onChange={(e) => setIndustryFilter(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Todas</option>
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho</label>
                  <select
                    value={sizeFilter}
                    onChange={(e) => setSizeFilter(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Todos</option>
                    <option value="1-10">1-10 funcionários</option>
                    <option value="11-50">11-50 funcionários</option>
                    <option value="51-200">51-200 funcionários</option>
                    <option value="201-500">201-500 funcionários</option>
                    <option value="501-1000">501-1000 funcionários</option>
                    <option value="1001+">1001+ funcionários</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avaliação Mínima</label>
                  <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Todas</option>
                    <option value="4">4+ estrelas</option>
                    <option value="3">3+ estrelas</option>
                    <option value="2">2+ estrelas</option>
                    <option value="1">1+ estrelas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Todas</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </motion.div>

          {loading ? (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma empresa encontrada</h3>
              <p className="text-gray-600 mb-4">Tente ajustar seus filtros ou volte mais tarde.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setIndustryFilter('');
                  setSizeFilter('');
                  setRatingFilter('');
                  setLocationFilter('');
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company) => (
                <motion.div
                  key={company.id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-lg shadow-lg overflow-hidden"
                >
                  <Link to={`/companies/${company.id}`} className="block">
                    <div className="bg-gradient-to-r from-blue-700 to-blue-500 h-24"></div>
                    <div className="p-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-white p-2 rounded-lg shadow-md -mt-16 mr-4">
                          {company.logo_url ? (
                            <img 
                              src={company.logo_url} 
                              alt={company.name} 
                              className="h-16 w-16 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=' + company.name.charAt(0);
                              }}
                            />
                          ) : (
                            <div className="h-16 w-16 bg-blue-100 flex items-center justify-center rounded-lg">
                              <Building className="h-8 w-8 text-blue-700" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                          <div className="flex items-center mt-1">
                            {renderStars(Math.round(company.avg_rating || 0))}
                            <span className="ml-2 text-gray-500 text-sm">
                              {company.avg_rating || 0} ({company.review_count} avaliações)
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-gray-600 line-clamp-2">{company.description}</p>
                      </div>
                      
                      <div className="mt-4 flex flex-wrap text-sm text-gray-500">
                        {company.industry && (
                          <div className="flex items-center mr-4 mb-2">
                            <Building className="h-4 w-4 mr-1" />
                            <span>{company.industry}</span>
                          </div>
                        )}
                        {company.size && (
                          <div className="flex items-center mr-4 mb-2">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{company.size}</span>
                          </div>
                        )}
                        {company.headquarters && (
                          <div className="flex items-center mr-4 mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{company.headquarters}</span>
                          </div>
                        )}
                        {company.job_count > 0 && (
                          <div className="flex items-center mb-2">
                            <Briefcase className="h-4 w-4 mr-1" />
                            <span>{company.job_count} vagas abertas</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
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

export default Companies;
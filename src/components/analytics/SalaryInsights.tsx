import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, Filter, MapPin, Briefcase } from 'lucide-react';
import useAnalyticsStore, { SalaryInsightFilters } from '../../stores/analyticsStore';

const SalaryInsights: React.FC = () => {
  const { salaryInsights, loading, fetchSalaryInsights } = useAnalyticsStore();
  const [filters, setFilters] = useState<SalaryInsightFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchSalaryInsights(filters);
  }, [filters]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Salary Insights</h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </button>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Industry</label>
              <select
                value={filters.industry || ''}
                onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Industries</option>
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <select
                value={filters.location || ''}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Locations</option>
                <option value="lisbon">Lisbon</option>
                <option value="porto">Porto</option>
                <option value="braga">Braga</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Experience Level</label>
              <select
                value={filters.experienceLevel || ''}
                onChange={(e) => setFilters({ ...filters, experienceLevel: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Levels</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="expert">Expert Level</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {salaryInsights.map((insight) => (
            <motion.div
              key={`${insight.jobTitle}-${insight.location}`}
              whileHover={{ y: -5 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Briefcase className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">{insight.jobTitle}</h3>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  {insight.location}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Average Salary</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(insight.avgSalary)}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Range</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(insight.salaryRangeMin)} - {formatCurrency(insight.salaryRangeMax)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Sample Size</p>
                    <p className="text-sm font-medium text-gray-900">{insight.sampleSize} reports</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{insight.experienceLevel}</span>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-500">+5% vs last period</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SalaryInsights;
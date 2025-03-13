import create from 'zustand';
import { supabase } from '../lib/supabase';
import { JobPost } from '../lib/supabase';

interface JobStore {
  jobs: JobPost[];
  savedSearches: SavedSearch[];
  loading: boolean;
  filters: JobFilters;
  setFilters: (filters: Partial<JobFilters>) => void;
  fetchJobs: () => Promise<void>;
  saveSearch: (search: SavedSearch) => Promise<void>;
  deleteSavedSearch: (id: string) => Promise<void>;
}

export interface JobFilters {
  searchTerm: string;
  location: string;
  type: string;
  salaryMin: number | null;
  salaryMax: number | null;
  remote: boolean;
  experienceLevel: string;
  industry: string;
  postedWithin: string;
}

export interface SavedSearch {
  id: string;
  userId: string;
  filters: JobFilters;
  name: string;
  createdAt: string;
}

const useJobStore = create<JobStore>((set, get) => ({
  jobs: [],
  savedSearches: [],
  loading: false,
  filters: {
    searchTerm: '',
    location: '',
    type: '',
    salaryMin: null,
    salaryMax: null,
    remote: false,
    experienceLevel: '',
    industry: '',
    postedWithin: '',
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().fetchJobs();
  },

  fetchJobs: async () => {
    const { filters } = get();
    set({ loading: true });

    try {
      let query = supabase
        .from('job_posts')
        .select('*')
        .eq('status', 'active');

      // Apply filters
      if (filters.searchTerm) {
        query = query.or(`title.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.remote) {
        query = query.ilike('location', '%remote%');
      }

      if (filters.postedWithin) {
        const date = new Date();
        date.setDate(date.getDate() - parseInt(filters.postedWithin));
        query = query.gte('created_at', date.toISOString());
      }

      // Fetch results
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Post-process results for salary filtering
      let filteredJobs = data || [];
      
      if (filters.salaryMin || filters.salaryMax) {
        filteredJobs = filteredJobs.filter(job => {
          if (!job.salary_range) return false;
          
          const [min, max] = job.salary_range.split('-').map(s => 
            parseInt(s.replace(/[^0-9]/g, ''))
          );
          
          if (filters.salaryMin && min < filters.salaryMin) return false;
          if (filters.salaryMax && max > filters.salaryMax) return false;
          
          return true;
        });
      }

      set({ jobs: filteredJobs });
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      set({ loading: false });
    }
  },

  saveSearch: async (search: SavedSearch) => {
    try {
      const { data: savedSearchData, error } = await supabase
        .from('saved_searches')
        .insert([
          {
            user_id: search.userId,
            filters: search.filters,
            name: search.name,
          },
        ])
        .select();

      if (error) throw error;

      set((state) => ({
        savedSearches: [...state.savedSearches, ...(savedSearchData || [])],
      }));
    } catch (error) {
      console.error('Error saving search:', error);
      throw error;
    }
  },

  deleteSavedSearch: async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        savedSearches: state.savedSearches.filter((search) => search.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting saved search:', error);
      throw error;
    }
  },
}));

export default useJobStore;
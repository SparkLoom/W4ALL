import create from 'zustand';
import { supabase } from '../lib/supabase';

interface AnalyticsStore {
  profileViews: ProfileAnalytics | null;
  salaryInsights: SalaryInsight[];
  industryReports: IndustryReport[];
  loading: boolean;
  fetchProfileAnalytics: (profileId: string) => Promise<void>;
  fetchSalaryInsights: (filters: SalaryInsightFilters) => Promise<void>;
  fetchIndustryReport: (industry: string) => Promise<void>;
  trackEvent: (eventType: string, eventData: any) => Promise<void>;
}

export interface ProfileAnalytics {
  totalViews: number;
  uniqueViews: number;
  viewsLast30Days: number;
  topViewerLocations: string[];
}

export interface SalaryInsight {
  industry: string;
  jobTitle: string;
  location: string;
  experienceLevel: string;
  avgSalary: number;
  salaryRangeMin: number;
  salaryRangeMax: number;
  sampleSize: number;
  period: string;
}

export interface IndustryReport {
  id: string;
  title: string;
  industry: string;
  reportData: {
    totalCompanies: number;
    totalJobs: number;
    avgSalary: number;
    topSkills: string[];
    hiringTrends: Record<string, number>;
  };
  period: string;
}

export interface SalaryInsightFilters {
  industry?: string;
  jobTitle?: string;
  location?: string;
  experienceLevel?: string;
}

const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  profileViews: null,
  salaryInsights: [],
  industryReports: [],
  loading: false,

  fetchProfileAnalytics: async (profileId: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .rpc('get_profile_analytics', { profile_id_param: profileId });

      if (error) throw error;

      set({
        profileViews: {
          totalViews: data.total_views,
          uniqueViews: data.unique_views,
          viewsLast30Days: data.views_last_30_days,
          topViewerLocations: data.top_viewer_locations,
        },
      });
    } catch (error) {
      console.error('Error fetching profile analytics:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchSalaryInsights: async (filters: SalaryInsightFilters) => {
    set({ loading: true });
    try {
      let query = supabase
        .from('salary_insights')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.industry) {
        query = query.eq('industry', filters.industry);
      }
      if (filters.jobTitle) {
        query = query.eq('job_title', filters.jobTitle);
      }
      if (filters.location) {
        query = query.eq('location', filters.location);
      }
      if (filters.experienceLevel) {
        query = query.eq('experience_level', filters.experienceLevel);
      }

      const { data, error } = await query;

      if (error) throw error;

      set({ salaryInsights: data || [] });
    } catch (error) {
      console.error('Error fetching salary insights:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchIndustryReport: async (industry: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('industry_reports')
        .select('*')
        .eq('industry', industry)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      set({ industryReports: data ? [data] : [] });
    } catch (error) {
      console.error('Error fetching industry report:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  trackEvent: async (eventType: string, eventData: any) => {
    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert([{
          event_type: eventType,
          event_data: eventData,
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking event:', error);
      throw error;
    }
  },
}));

export default useAnalyticsStore;
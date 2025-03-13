import create from 'zustand';
import { supabase } from '../lib/supabase';

interface AdminStore {
  users: AdminUser[];
  reports: Report[];
  moderationQueue: ModerationItem[];
  analytics: AdminAnalytics;
  loading: boolean;
  fetchUsers: () => Promise<void>;
  updateUserStatus: (userId: string, status: string) => Promise<void>;
  fetchReports: () => Promise<void>;
  handleReport: (reportId: string, action: string) => Promise<void>;
  fetchModerationQueue: () => Promise<void>;
  moderateContent: (itemId: string, action: string) => Promise<void>;
  fetchAnalytics: (period: string) => Promise<void>;
  generateReport: (type: string, filters: any) => Promise<void>;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  status: string;
  role: string;
  lastSignIn: string;
  createdAt: string;
  profile: {
    title?: string;
    company?: string;
  };
}

export interface Report {
  id: string;
  type: string;
  contentId: string;
  reporterId: string;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
  reporter: {
    fullName: string;
    email: string;
  };
}

export interface ModerationItem {
  id: string;
  type: string;
  content: string;
  userId: string;
  status: string;
  flags: string[];
  createdAt: string;
  user: {
    fullName: string;
    email: string;
  };
}

export interface AdminAnalytics {
  userStats: {
    total: number;
    active: number;
    newThisMonth: number;
    growthRate: number;
  };
  contentStats: {
    totalPosts: number;
    totalJobs: number;
    totalApplications: number;
    moderationRate: number;
  };
  engagementStats: {
    dailyActiveUsers: number;
    averageSessionTime: number;
    bounceRate: number;
  };
  complianceStats: {
    reportedContent: number;
    resolvedReports: number;
    averageResolutionTime: number;
  };
}

const useAdminStore = create<AdminStore>((set, get) => ({
  users: [],
  reports: [],
  moderationQueue: [],
  analytics: {
    userStats: { total: 0, active: 0, newThisMonth: 0, growthRate: 0 },
    contentStats: { totalPosts: 0, totalJobs: 0, totalApplications: 0, moderationRate: 0 },
    engagementStats: { dailyActiveUsers: 0, averageSessionTime: 0, bounceRate: 0 },
    complianceStats: { reportedContent: 0, resolvedReports: 0, averageResolutionTime: 0 }
  },
  loading: false,

  fetchUsers: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user:auth.users (
            email,
            last_sign_in_at,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ users: data || [] });
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateUserStatus: async (userId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('user_id', userId);

      if (error) throw error;
      await get().fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  fetchReports: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('content_reports')
        .select(`
          *,
          reporter:profiles (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ reports: data || [] });
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  handleReport: async (reportId: string, action: string) => {
    try {
      const { error } = await supabase
        .from('content_reports')
        .update({ status: action, resolved_at: new Date().toISOString() })
        .eq('id', reportId);

      if (error) throw error;
      await get().fetchReports();
    } catch (error) {
      console.error('Error handling report:', error);
      throw error;
    }
  },

  fetchModerationQueue: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('moderation_queue')
        .select(`
          *,
          user:profiles (
            full_name,
            email
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      set({ moderationQueue: data || [] });
    } catch (error) {
      console.error('Error fetching moderation queue:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  moderateContent: async (itemId: string, action: string) => {
    try {
      const { error } = await supabase
        .from('moderation_queue')
        .update({ status: action, moderated_at: new Date().toISOString() })
        .eq('id', itemId);

      if (error) throw error;
      await get().fetchModerationQueue();
    } catch (error) {
      console.error('Error moderating content:', error);
      throw error;
    }
  },

  fetchAnalytics: async (period: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .rpc('get_admin_analytics', { period_param: period });

      if (error) throw error;
      set({ analytics: data });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  generateReport: async (type: string, filters: any) => {
    try {
      const { data, error } = await supabase
        .rpc('generate_admin_report', { 
          report_type: type,
          filters: filters
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }
}));

export default useAdminStore;
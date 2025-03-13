import create from 'zustand';
import { supabase } from '../lib/supabase';

interface ApplicationStore {
  applications: Application[];
  loading: boolean;
  fetchUserApplications: () => Promise<void>;
  submitApplication: (application: NewApplication) => Promise<void>;
  withdrawApplication: (id: string) => Promise<void>;
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  coverLetter: string;
  resumeUrl?: string;
  createdAt: string;
  job: {
    title: string;
    company: string;
  };
}

export interface NewApplication {
  jobId: string;
  coverLetter: string;
  resumeUrl?: string;
}

const useApplicationStore = create<ApplicationStore>((set, get) => ({
  applications: [],
  loading: false,

  fetchUserApplications: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          job:job_posts (
            title,
            company
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ applications: data || [] });
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  submitApplication: async (application: NewApplication) => {
    try {
      const { error } = await supabase
        .from('applications')
        .insert([{
          job_id: application.jobId,
          cover_letter: application.coverLetter,
          resume_url: application.resumeUrl,
          status: 'pending'
        }]);

      if (error) throw error;

      // Refresh applications list
      await get().fetchUserApplications();
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  },

  withdrawApplication: async (id: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        applications: state.applications.filter(app => app.id !== id)
      }));
    } catch (error) {
      console.error('Error withdrawing application:', error);
      throw error;
    }
  }
}));

export default useApplicationStore;
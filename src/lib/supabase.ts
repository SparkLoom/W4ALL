import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'work4all-auth-token',
  }
});

// Get public URL for Supabase Storage files
export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

export type Profile = {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  title: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export type JobPost = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string | null;
  benefits: string | null;
  salary_range: string | null;
  type: string;
  created_at: string;
  expires_at: string | null;
  created_by: string;
  status: 'active' | 'closed' | 'draft';
  contact_email?: string | null;
  contact_phone?: string | null;
  application_url?: string | null;
  external_url?: string | null;
  image_url?: string | null;
};

export type Application = {
  id: string;
  job_id: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  cover_letter: string | null;
  created_at: string;
};

export type Experience = {
  id: string;
  user_id: string;
  title: string;
  company: string;
  content: string;
  created_at: string;
  category: 'first_job' | 'interview_tips' | 'success_story' | 'general';
};
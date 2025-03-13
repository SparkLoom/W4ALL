import create from 'zustand';
import { supabase } from '../lib/supabase';

interface LearningStore {
  courses: Course[];
  enrollments: CourseEnrollment[];
  careerResources: CareerResource[];
  mentorshipPrograms: MentorshipProgram[];
  webinars: Webinar[];
  loading: boolean;
  fetchCourses: () => Promise<void>;
  fetchEnrollments: () => Promise<void>;
  fetchCareerResources: () => Promise<void>;
  fetchMentorshipPrograms: () => Promise<void>;
  fetchWebinars: () => Promise<void>;
  enrollInCourse: (courseId: string) => Promise<void>;
  updateCourseProgress: (enrollmentId: string, progress: number) => Promise<void>;
  applyForMentorship: (application: MentorshipApplication) => Promise<void>;
  registerForWebinar: (webinarId: string) => Promise<void>;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  durationHours: number;
  topics: string[];
  requirements?: string[];
  objectives?: string[];
  price?: number;
  imageUrl?: string;
  status: 'draft' | 'published' | 'archived';
}

export interface CourseEnrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'dropped';
  startedAt: string;
  completedAt?: string;
  lastActivityAt: string;
  notes?: string;
  course: Course;
}

export interface CareerResource {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  imageUrl?: string;
  externalUrl?: string;
  views: number;
  likes: number;
}

export interface MentorshipProgram {
  id: string;
  mentorId: string;
  title: string;
  description: string;
  expertiseAreas: string[];
  requirements?: string[];
  durationWeeks: number;
  maxMentees: number;
  currentMentees: number;
  status: 'active' | 'full' | 'completed' | 'cancelled';
  mentor: {
    fullName: string;
    title?: string;
  };
}

export interface MentorshipApplication {
  programId: string;
  motivation: string;
  goals: string[];
  background: string;
}

export interface Webinar {
  id: string;
  title: string;
  description: string;
  presenter: string;
  scheduledAt: string;
  durationMinutes: number;
  topics: string[];
  maxParticipants?: number;
  currentParticipants: number;
  registrationDeadline: string;
  meetingUrl?: string;
  recordingUrl?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

const useLearningStore = create<LearningStore>((set, get) => ({
  courses: [],
  enrollments: [],
  careerResources: [],
  mentorshipPrograms: [],
  webinars: [],
  loading: false,

  fetchCourses: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ courses: data || [] });
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchEnrollments: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          course:courses (*)
        `)
        .order('last_activity_at', { ascending: false });

      if (error) throw error;
      set({ enrollments: data || [] });
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchCareerResources: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('career_resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ careerResources: data || [] });
    } catch (error) {
      console.error('Error fetching career resources:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchMentorshipPrograms: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('mentorship_programs')
        .select(`
          *,
          mentor:profiles (
            full_name,
            title
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ mentorshipPrograms: data || [] });
    } catch (error) {
      console.error('Error fetching mentorship programs:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchWebinars: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('webinars')
        .select('*')
        .in('status', ['upcoming', 'ongoing'])
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      set({ webinars: data || [] });
    } catch (error) {
      console.error('Error fetching webinars:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  enrollInCourse: async (courseId: string) => {
    try {
      const { error } = await supabase
        .from('course_enrollments')
        .insert({
          course_id: courseId,
          status: 'not_started'
        });

      if (error) throw error;

      // Refresh enrollments
      await get().fetchEnrollments();
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  },

  updateCourseProgress: async (enrollmentId: string, progress: number) => {
    try {
      const { error } = await supabase
        .rpc('update_course_progress', {
          enrollment_id_param: enrollmentId,
          new_progress: progress
        });

      if (error) throw error;

      // Refresh enrollments
      await get().fetchEnrollments();
    } catch (error) {
      console.error('Error updating course progress:', error);
      throw error;
    }
  },

  applyForMentorship: async (application: MentorshipApplication) => {
    try {
      const { error } = await supabase
        .from('mentorship_applications')
        .insert(application);

      if (error) throw error;
    } catch (error) {
      console.error('Error applying for mentorship:', error);
      throw error;
    }
  },

  registerForWebinar: async (webinarId: string) => {
    try {
      const { error } = await supabase
        .from('webinar_registrations')
        .insert({
          webinar_id: webinarId
        });

      if (error) throw error;

      // Refresh webinars
      await get().fetchWebinars();
    } catch (error) {
      console.error('Error registering for webinar:', error);
      throw error;
    }
  },
}));

export default useLearningStore;
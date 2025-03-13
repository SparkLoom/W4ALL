import create from 'zustand';
import { supabase } from '../lib/supabase';

interface SocialStore {
  posts: UserPost[];
  groups: IndustryGroup[];
  events: Event[];
  forumTopics: ForumTopic[];
  loading: boolean;
  fetchPosts: (filters?: PostFilters) => Promise<void>;
  createPost: (post: NewPost) => Promise<void>;
  reactToPost: (postId: string, type: 'like' | 'comment' | 'share', content?: string) => Promise<void>;
  fetchGroups: (filters?: GroupFilters) => Promise<void>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  fetchEvents: (filters?: EventFilters) => Promise<void>;
  registerForEvent: (eventId: string) => Promise<void>;
  cancelEventRegistration: (eventId: string) => Promise<void>;
  fetchForumTopics: (filters?: ForumFilters) => Promise<void>;
  createForumTopic: (topic: NewForumTopic) => Promise<void>;
  createForumReply: (reply: NewForumReply) => Promise<void>;
}

export interface UserPost {
  id: string;
  userId: string;
  content: string;
  mediaUrls: string[];
  visibility: 'public' | 'connections' | 'group';
  groupId?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  user: {
    fullName: string;
    avatarUrl?: string;
  };
}

export interface NewPost {
  content: string;
  mediaUrls?: string[];
  visibility: 'public' | 'connections' | 'group';
  groupId?: string;
}

export interface PostFilters {
  visibility?: string;
  groupId?: string;
  userId?: string;
}

export interface IndustryGroup {
  id: string;
  name: string;
  description: string;
  industry: string;
  rules: string[];
  imageUrl?: string;
  isPrivate: boolean;
  membersCount: number;
}

export interface GroupFilters {
  industry?: string;
  isPrivate?: boolean;
  search?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'in-person' | 'online' | 'hybrid';
  startDate: string;
  endDate: string;
  location?: string;
  meetingUrl?: string;
  organizerId: string;
  groupId?: string;
  maxAttendees?: number;
  currentAttendees: number;
  registrationDeadline?: string;
  isFeatured: boolean;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface EventFilters {
  type?: string;
  status?: string;
  groupId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ForumTopic {
  id: string;
  title: string;
  content: string;
  userId: string;
  groupId?: string;
  category: string;
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
  viewsCount: number;
  repliesCount: number;
  lastReplyAt?: string;
  createdAt: string;
  user: {
    fullName: string;
    avatarUrl?: string;
  };
}

export interface NewForumTopic {
  title: string;
  content: string;
  groupId?: string;
  category: string;
  tags: string[];
}

export interface NewForumReply {
  topicId: string;
  content: string;
}

export interface ForumFilters {
  category?: string;
  groupId?: string;
  search?: string;
  tags?: string[];
}

const useSocialStore = create<SocialStore>((set, get) => ({
  posts: [],
  groups: [],
  events: [],
  forumTopics: [],
  loading: false,

  fetchPosts: async (filters?: PostFilters) => {
    set({ loading: true });
    try {
      let query = supabase
        .from('user_posts')
        .select(`
          *,
          user:profiles (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.visibility) {
        query = query.eq('visibility', filters.visibility);
      }
      if (filters?.groupId) {
        query = query.eq('group_id', filters.groupId);
      }
      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      set({ posts: data || [] });
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  createPost: async (post: NewPost) => {
    try {
      const { error } = await supabase
        .from('user_posts')
        .insert(post);

      if (error) throw error;

      // Refresh posts
      await get().fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  reactToPost: async (postId: string, type: 'like' | 'comment' | 'share', content?: string) => {
    try {
      const { error } = await supabase
        .from('post_reactions')
        .insert({
          post_id: postId,
          type,
          content
        });

      if (error) throw error;

      // Increment counter
      await supabase.rpc('increment_post_counter', {
        post_id_param: postId,
        counter_name: type + 's'
      });

      // Refresh posts
      await get().fetchPosts();
    } catch (error) {
      console.error('Error reacting to post:', error);
      throw error;
    }
  },

  fetchGroups: async (filters?: GroupFilters) => {
    set({ loading: true });
    try {
      let query = supabase
        .from('industry_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.industry) {
        query = query.eq('industry', filters.industry);
      }
      if (filters?.isPrivate !== undefined) {
        query = query.eq('is_private', filters.isPrivate);
      }
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      set({ groups: data || [] });
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  joinGroup: async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          role: 'member'
        });

      if (error) throw error;

      // Refresh groups
      await get().fetchGroups();
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  },

  leaveGroup: async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .match({ group_id: groupId });

      if (error) throw error;

      // Refresh groups
      await get().fetchGroups();
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  },

  fetchEvents: async (filters?: EventFilters) => {
    set({ loading: true });
    try {
      let query = supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.groupId) {
        query = query.eq('group_id', filters.groupId);
      }
      if (filters?.startDate) {
        query = query.gte('start_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('end_date', filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      set({ events: data || [] });
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  registerForEvent: async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('event_attendees')
        .insert({
          event_id: eventId
        });

      if (error) throw error;

      // Refresh events
      await get().fetchEvents();
    } catch (error) {
      console.error('Error registering for event:', error);
      throw error;
    }
  },

  cancelEventRegistration: async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('event_attendees')
        .update({ status: 'cancelled' })
        .match({ event_id: eventId });

      if (error) throw error;

      // Refresh events
      await get().fetchEvents();
    } catch (error) {
      console.error('Error cancelling event registration:', error);
      throw error;
    }
  },

  fetchForumTopics: async (filters?: ForumFilters) => {
    set({ loading: true });
    try {
      let query = supabase
        .from('forum_topics')
        .select(`
          *,
          user:profiles (
            full_name,
            avatar_url
          )
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.groupId) {
        query = query.eq('group_id', filters.groupId);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }
      if (filters?.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      const { data, error } = await query;

      if (error) throw error;
      set({ forumTopics: data || [] });
    } catch (error) {
      console.error('Error fetching forum topics:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  createForumTopic: async (topic: NewForumTopic) => {
    try {
      const { error } = await supabase
        .from('forum_topics')
        .insert(topic);

      if (error) throw error;

      // Refresh topics
      await get().fetchForumTopics();
    } catch (error) {
      console.error('Error creating forum topic:', error);
      throw error;
    }
  },

  createForumReply: async (reply: NewForumReply) => {
    try {
      const { error } = await supabase
        .from('forum_replies')
        .insert(reply);

      if (error) throw error;

      // Increment replies count
      await supabase.rpc('increment_topic_counter', {
        topic_id_param: reply.topicId,
        counter_name: 'replies'
      });

      // Refresh topics
      await get().fetchForumTopics();
    } catch (error) {
      console.error('Error creating forum reply:', error);
      throw error;
    }
  },
}));

export default useSocialStore;
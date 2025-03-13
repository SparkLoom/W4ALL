import create from 'zustand';
import { supabase } from '../lib/supabase';

interface NotificationStore {
  notificationPermission: NotificationPermission;
  subscription: PushSubscription | null;
  notifications: UserNotification[];
  loading: boolean;
  requestPermission: () => Promise<void>;
  subscribeToNotifications: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  sendTestNotification: () => Promise<void>;
}

export interface UserNotification {
  id: string;
  userId: string;
  type: 'message' | 'application' | 'interview' | 'system';
  title: string;
  content: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

const useNotificationStore = create<NotificationStore>((set, get) => ({
  notificationPermission: 'default',
  subscription: null,
  notifications: [],
  loading: false,

  requestPermission: async () => {
    try {
      const permission = await Notification.requestPermission();
      set({ notificationPermission: permission });

      if (permission === 'granted') {
        await get().subscribeToNotifications();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw error;
    }
  },

  subscribeToNotifications: async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
      });

      // Save subscription to database
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          subscription: subscription.toJSON(),
        });

      if (error) throw error;

      set({ subscription });
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      throw error;
    }
  },

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ notifications: data || [] });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      const { error } = await supabase
        .rpc('mark_notification_as_read', {
          notification_id_param: notificationId,
        });

      if (error) throw error;

      set(state => ({
        notifications: state.notifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        ),
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  sendTestNotification: async () => {
    try {
      const { error } = await supabase.functions.invoke('send-notification', {
        body: {
          title: 'Test Notification',
          body: 'This is a test notification from Work4All',
          url: '/',
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  },
}));

export default useNotificationStore;
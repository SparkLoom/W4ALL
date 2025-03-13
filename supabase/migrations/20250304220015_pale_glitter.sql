/*
  # Communication Features Update

  1. New Tables
    - `messages`
      - Direct messaging between users
    - `chat_rooms`
      - Group chat support
    - `notifications`
      - System notifications
    - `video_interviews`
      - Video interview scheduling and management

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('direct', 'group', 'interview')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_room_participants table
CREATE TABLE IF NOT EXISTS chat_room_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_room_id uuid REFERENCES chat_rooms ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'member')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(chat_room_id, user_id)
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_room_id uuid REFERENCES chat_rooms ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  type text NOT NULL CHECK (type IN ('text', 'file', 'system')),
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('message', 'application', 'interview', 'system')),
  title text NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

-- Create video_interviews table
CREATE TABLE IF NOT EXISTS video_interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications ON DELETE CASCADE NOT NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL,
  meeting_url text NOT NULL,
  status text NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  notes text,
  recording_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_interviews ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() IN (sender_id, receiver_id));

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Create policies for chat rooms
CREATE POLICY "Users can view their chat rooms"
  ON chat_rooms FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM chat_room_participants
    WHERE chat_room_id = chat_rooms.id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create chat rooms"
  ON chat_rooms FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policies for chat room participants
CREATE POLICY "Users can view chat room participants"
  ON chat_room_participants FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM chat_room_participants crp
    WHERE crp.chat_room_id = chat_room_participants.chat_room_id
    AND crp.user_id = auth.uid()
  ));

CREATE POLICY "Users can add participants"
  ON chat_room_participants FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM chat_room_participants
    WHERE chat_room_id = chat_room_participants.chat_room_id
    AND user_id = auth.uid()
    AND role = 'admin'
  ));

-- Create policies for chat messages
CREATE POLICY "Users can view chat messages"
  ON chat_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM chat_room_participants
    WHERE chat_room_id = chat_messages.chat_room_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can send chat messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM chat_room_participants
    WHERE chat_room_id = chat_messages.chat_room_id
    AND user_id = auth.uid()
  ));

-- Create policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for video interviews
CREATE POLICY "Users can view their video interviews"
  ON video_interviews FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM applications
    WHERE id = video_interviews.application_id
    AND (
      user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM employer_profiles
        WHERE user_id = auth.uid()
        AND company_id = (
          SELECT company_id FROM job_posts WHERE id = applications.job_id
        )
      )
    )
  ));

CREATE POLICY "Employers can manage video interviews"
  ON video_interviews FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM applications
    WHERE id = video_interviews.application_id
    AND EXISTS (
      SELECT 1 FROM employer_profiles
      WHERE user_id = auth.uid()
      AND company_id = (
        SELECT company_id FROM job_posts WHERE id = applications.job_id
      )
    )
  ));

-- Create function to mark message as read
CREATE OR REPLACE FUNCTION mark_message_as_read(message_id_param uuid)
RETURNS void AS $$
BEGIN
  UPDATE messages
  SET read = true
  WHERE id = message_id_param
  AND receiver_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_as_read(notification_id_param uuid)
RETURNS void AS $$
BEGIN
  UPDATE notifications
  SET read = true
  WHERE id = notification_id_param
  AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get unread counts
CREATE OR REPLACE FUNCTION get_unread_counts(user_id_param uuid)
RETURNS TABLE (
  unread_messages bigint,
  unread_notifications bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM messages WHERE receiver_id = user_id_param AND read = false),
    (SELECT COUNT(*) FROM notifications WHERE user_id = user_id_param AND read = false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create chat room
CREATE OR REPLACE FUNCTION create_chat_room(
  room_name text,
  room_type text,
  participant_ids uuid[]
)
RETURNS uuid AS $$
DECLARE
  new_room_id uuid;
BEGIN
  -- Create the chat room
  INSERT INTO chat_rooms (name, type)
  VALUES (room_name, room_type)
  RETURNING id INTO new_room_id;

  -- Add participants
  INSERT INTO chat_room_participants (chat_room_id, user_id, role)
  SELECT 
    new_room_id,
    participant_id,
    CASE WHEN participant_id = auth.uid() THEN 'admin' ELSE 'member' END
  FROM unnest(participant_ids) AS participant_id;

  RETURN new_room_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to schedule video interview
CREATE OR REPLACE FUNCTION schedule_video_interview(
  application_id_param uuid,
  scheduled_time timestamptz,
  duration integer,
  meeting_link text
)
RETURNS uuid AS $$
DECLARE
  new_interview_id uuid;
BEGIN
  -- Create the video interview
  INSERT INTO video_interviews (
    application_id,
    scheduled_at,
    duration_minutes,
    meeting_url,
    status
  )
  VALUES (
    application_id_param,
    scheduled_time,
    duration,
    meeting_link,
    'scheduled'
  )
  RETURNING id INTO new_interview_id;

  -- Create notification for the candidate
  INSERT INTO notifications (
    user_id,
    type,
    title,
    content,
    action_url
  )
  SELECT
    applications.user_id,
    'interview',
    'Entrevista Agendada',
    'Sua entrevista foi agendada para ' || scheduled_time::text,
    '/interviews/' || new_interview_id
  FROM applications
  WHERE id = application_id_param;

  RETURN new_interview_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
/*
  # Social Features Migration

  1. New Tables
    - industry_groups: Professional communities by industry
    - group_members: Group membership and roles
    - user_posts: For sharing professional content and updates
    - post_reactions: Likes, comments, and shares on posts
    - events: Professional events and meetups
    - event_attendees: Event registration and attendance
    - forum_topics: Discussion forum topics
    - forum_replies: Replies to forum topics

  2. Security
    - Enable RLS on all tables
    - Create policies for content access and management
    - Add functions for social interactions
*/

-- Create industry_groups table first since it's referenced by other tables
CREATE TABLE IF NOT EXISTS industry_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  industry text NOT NULL,
  rules text[],
  image_url text,
  is_private boolean DEFAULT false,
  members_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES industry_groups ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Now create user_posts table that references industry_groups
CREATE TABLE IF NOT EXISTS user_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  media_urls text[],
  visibility text NOT NULL CHECK (visibility IN ('public', 'connections', 'group')),
  group_id uuid REFERENCES industry_groups(id),
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create post_reactions table
CREATE TABLE IF NOT EXISTS post_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES user_posts ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('like', 'comment', 'share')),
  content text,
  created_at timestamptz DEFAULT now()
);

-- Add unique index for likes
CREATE UNIQUE INDEX post_reactions_like_unique_idx ON post_reactions (post_id, user_id) WHERE type = 'like';

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('in-person', 'online', 'hybrid')),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  location text,
  meeting_url text,
  organizer_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  group_id uuid REFERENCES industry_groups(id),
  max_attendees integer,
  current_attendees integer DEFAULT 0,
  registration_deadline timestamptz,
  is_featured boolean DEFAULT false,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create event_attendees table
CREATE TABLE IF NOT EXISTS event_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  registration_date timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Create forum_topics table
CREATE TABLE IF NOT EXISTS forum_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  group_id uuid REFERENCES industry_groups(id),
  category text NOT NULL,
  tags text[],
  is_pinned boolean DEFAULT false,
  is_locked boolean DEFAULT false,
  views_count integer DEFAULT 0,
  replies_count integer DEFAULT 0,
  last_reply_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create forum_replies table
CREATE TABLE IF NOT EXISTS forum_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES forum_topics ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  is_solution boolean DEFAULT false,
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE industry_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

-- Create policies for industry_groups
CREATE POLICY "Users can view public groups"
  ON industry_groups FOR SELECT
  USING (
    NOT is_private OR
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = industry_groups.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage groups"
  ON industry_groups FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT auth.uid() FROM auth.users WHERE email = 'admin@work4all.com'
  ));

-- Create policies for group_members
CREATE POLICY "Users can view group members"
  ON group_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = group_members.group_id
    AND gm.user_id = auth.uid()
  ));

CREATE POLICY "Users can join groups"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for user_posts
CREATE POLICY "Users can view public posts"
  ON user_posts FOR SELECT
  USING (
    visibility = 'public' OR
    user_id = auth.uid() OR
    (visibility = 'connections' AND EXISTS (
      SELECT 1 FROM user_connections
      WHERE (requester_id = auth.uid() AND receiver_id = user_posts.user_id OR
             receiver_id = auth.uid() AND requester_id = user_posts.user_id) AND
            status = 'accepted'
    )) OR
    (visibility = 'group' AND EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = user_posts.group_id AND user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can create posts"
  ON user_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON user_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON user_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for post_reactions
CREATE POLICY "Users can view reactions"
  ON post_reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can create reactions"
  ON post_reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions"
  ON post_reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for events
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Users can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = organizer_id OR
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = events.group_id
      AND user_id = auth.uid()
      AND role IN ('admin', 'moderator')
    )
  );

-- Create policies for event_attendees
CREATE POLICY "Users can view event attendees"
  ON event_attendees FOR SELECT
  USING (true);

CREATE POLICY "Users can register for events"
  ON event_attendees FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for forum_topics
CREATE POLICY "Users can view forum topics"
  ON forum_topics FOR SELECT
  USING (
    group_id IS NULL OR
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = forum_topics.group_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create forum topics"
  ON forum_topics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for forum_replies
CREATE POLICY "Users can view forum replies"
  ON forum_replies FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM forum_topics
    WHERE id = forum_replies.topic_id
    AND (
      group_id IS NULL OR
      EXISTS (
        SELECT 1 FROM group_members
        WHERE group_id = forum_topics.group_id
        AND user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Users can create forum replies"
  ON forum_replies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create function to increment post counters
CREATE OR REPLACE FUNCTION increment_post_counter(
  post_id_param uuid,
  counter_name text
)
RETURNS void AS $$
BEGIN
  UPDATE user_posts
  SET
    likes_count = CASE WHEN counter_name = 'likes' THEN likes_count + 1 ELSE likes_count END,
    comments_count = CASE WHEN counter_name = 'comments' THEN comments_count + 1 ELSE comments_count END,
    shares_count = CASE WHEN counter_name = 'shares' THEN shares_count + 1 ELSE shares_count END,
    updated_at = now()
  WHERE id = post_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment forum topic counters
CREATE OR REPLACE FUNCTION increment_topic_counter(
  topic_id_param uuid,
  counter_name text
)
RETURNS void AS $$
BEGIN
  UPDATE forum_topics
  SET
    views_count = CASE WHEN counter_name = 'views' THEN views_count + 1 ELSE views_count END,
    replies_count = CASE WHEN counter_name = 'replies' THEN replies_count + 1 ELSE replies_count END,
    last_reply_at = CASE WHEN counter_name = 'replies' THEN now() ELSE last_reply_at END,
    updated_at = now()
  WHERE id = topic_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update group members count
CREATE OR REPLACE FUNCTION update_group_members_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE industry_groups
    SET members_count = members_count + 1
    WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE industry_groups
    SET members_count = members_count - 1
    WHERE id = OLD.group_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for group members count
CREATE TRIGGER update_group_members_count_trigger
  AFTER INSERT OR DELETE ON group_members
  FOR EACH ROW
  EXECUTE FUNCTION update_group_members_count();

-- Create function to update event attendees count
CREATE OR REPLACE FUNCTION update_event_attendees_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'registered' THEN
    UPDATE events
    SET current_attendees = current_attendees + 1
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.status = 'cancelled') THEN
    UPDATE events
    SET current_attendees = current_attendees - 1
    WHERE id = COALESCE(OLD.event_id, NEW.event_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for event attendees count
CREATE TRIGGER update_event_attendees_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON event_attendees
  FOR EACH ROW
  EXECUTE FUNCTION update_event_attendees_count();
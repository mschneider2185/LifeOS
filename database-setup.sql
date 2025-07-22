-- DISC Questions Table Setup
-- Run this in your Supabase SQL editor

-- Create DISC questions table
CREATE TABLE IF NOT EXISTS disc_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  trait_a TEXT NOT NULL,
  trait_b TEXT NOT NULL,
  trait_c TEXT NOT NULL,
  trait_d TEXT NOT NULL,
  question_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create DISC results table
CREATE TABLE IF NOT EXISTS disc_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dominance DECIMAL(5,2) NOT NULL,
  influence DECIMAL(5,2) NOT NULL,
  steadiness DECIMAL(5,2) NOT NULL,
  compliance DECIMAL(5,2) NOT NULL,
  disc_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create MBTI questions table
CREATE TABLE IF NOT EXISTS mbti_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  trait_a TEXT NOT NULL,
  trait_b TEXT NOT NULL,
  question_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create MBTI results table
CREATE TABLE IF NOT EXISTS mbti_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  e INTEGER NOT NULL,
  i INTEGER NOT NULL,
  s INTEGER NOT NULL,
  n INTEGER NOT NULL,
  t INTEGER NOT NULL,
  f INTEGER NOT NULL,
  j INTEGER NOT NULL,
  p INTEGER NOT NULL,
  mbti_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create user responses table
CREATE TABLE IF NOT EXISTS user_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL,
  selected_trait TEXT NOT NULL,
  test_type TEXT NOT NULL DEFAULT 'mbti',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample DISC questions
INSERT INTO disc_questions (question, option_a, option_b, option_c, option_d, trait_a, trait_b, trait_c, trait_d, question_order) VALUES
('When working on a team project, I prefer to:', 'Take charge and lead the group', 'Encourage and motivate others', 'Support and help maintain harmony', 'Ensure accuracy and follow procedures', 'D', 'I', 'S', 'C', 1),
('When faced with a challenge, I typically:', 'Confront it directly and decisively', 'Look for creative solutions', 'Seek consensus and cooperation', 'Analyze all options carefully', 'D', 'I', 'S', 'C', 2),
('In social situations, I usually:', 'Take control of the conversation', 'Energize and entertain others', 'Listen and provide support', 'Observe and gather information', 'D', 'I', 'S', 'C', 3),
('When making decisions, I rely on:', 'Quick action and results', 'Intuition and possibilities', 'Team input and relationships', 'Data and logical analysis', 'D', 'I', 'S', 'C', 4),
('Under pressure, I tend to:', 'Push harder and faster', 'Stay optimistic and encouraging', 'Remain calm and supportive', 'Focus on details and accuracy', 'D', 'I', 'S', 'C', 5),
('My communication style is:', 'Direct and to the point', 'Enthusiastic and engaging', 'Patient and understanding', 'Precise and thorough', 'D', 'I', 'S', 'C', 6),
('I prefer work environments that are:', 'Fast-paced and challenging', 'Creative and collaborative', 'Stable and harmonious', 'Organized and systematic', 'D', 'I', 'S', 'C', 7),
('When solving problems, I:', 'Take immediate action', 'Brainstorm creative ideas', 'Consider everyone''s feelings', 'Research all options', 'D', 'I', 'S', 'C', 8),
('I am most motivated by:', 'Achieving results quickly', 'Recognition and appreciation', 'Helping others succeed', 'Doing things correctly', 'D', 'I', 'S', 'C', 9),
('In conflicts, I typically:', 'Address issues head-on', 'Find common ground', 'Avoid confrontation', 'Analyze the situation', 'D', 'I', 'S', 'C', 10),
('My leadership style is:', 'Directive and results-focused', 'Inspirational and motivating', 'Supportive and collaborative', 'Analytical and systematic', 'D', 'I', 'S', 'C', 11),
('I prefer to work:', 'Independently with clear goals', 'With others in a dynamic team', 'In a stable, supportive environment', 'With detailed plans and procedures', 'D', 'I', 'S', 'C', 12);

-- Insert sample MBTI questions
INSERT INTO mbti_questions (question, trait_a, trait_b, question_order) VALUES
('I prefer to:', 'Spend time with others', 'Spend time alone', 1),
('I focus on:', 'What is real and present', 'What is possible and future', 2),
('I make decisions based on:', 'Logic and analysis', 'Feelings and values', 3),
('I prefer to:', 'Have things planned and organized', 'Keep options open and flexible', 4),
('I get energy from:', 'Being around people', 'Being by myself', 5),
('I pay attention to:', 'Facts and details', 'Patterns and possibilities', 6),
('I value:', 'Fairness and consistency', 'Harmony and compassion', 7),
('I like to:', 'Finish tasks completely', 'Start new projects', 8),
('I prefer:', 'Concrete information', 'Abstract concepts', 9),
('I consider:', 'What is practical', 'What is innovative', 10),
('I base decisions on:', 'Objective criteria', 'Personal values', 11),
('I prefer:', 'Structure and schedules', 'Spontaneity and flexibility', 12);

-- Enable Row Level Security (RLS)
ALTER TABLE disc_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disc_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE mbti_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mbti_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for disc_questions (public read access)
CREATE POLICY "Allow public read access to disc_questions" ON disc_questions
  FOR SELECT USING (true);

-- Create policies for disc_results (user can only access their own results)
CREATE POLICY "Users can view their own disc results" ON disc_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own disc results" ON disc_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own disc results" ON disc_results
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for mbti_questions (public read access)
CREATE POLICY "Allow public read access to mbti_questions" ON mbti_questions
  FOR SELECT USING (true);

-- Create policies for mbti_results (user can only access their own results)
CREATE POLICY "Users can view their own mbti results" ON mbti_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mbti results" ON mbti_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mbti results" ON mbti_results
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for user_responses (user can only access their own responses)
CREATE POLICY "Users can view their own responses" ON user_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own responses" ON user_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id); 
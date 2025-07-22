import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Database helper functions
export const db = {
  // User functions
  async getUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateUser(userId: string, updates: Partial<Database['public']['Tables']['users']['Update']>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Personality profile functions
  async createPersonalityProfile(profile: Database['public']['Tables']['personality_profiles']['Insert']) {
    const { data, error } = await supabase
      .from('personality_profiles')
      .insert(profile)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getPersonalityProfile(userId: string) {
    const { data, error } = await supabase
      .from('personality_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Goals functions
  async createUserGoals(goals: Database['public']['Tables']['user_goals']['Insert']) {
    const { data, error } = await supabase
      .from('user_goals')
      .insert(goals)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserGoals(userId: string) {
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Report functions
  async createPersonalityReport(report: Database['public']['Tables']['personality_reports']['Insert']) {
    const { data, error } = await supabase
      .from('personality_reports')
      .insert(report)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getPersonalityReport(reportId: string) {
    const { data, error } = await supabase
      .from('personality_reports')
      .select(`
        *,
        personality_profiles (*),
        user_goals (*)
      `)
      .eq('id', reportId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserReports(userId: string) {
    const { data, error } = await supabase
      .from('personality_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Product functions
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getProduct(productId: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Order functions
  async createOrder(order: Database['public']['Tables']['orders']['Insert']) {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateOrder(orderId: string, updates: Partial<Database['public']['Tables']['orders']['Update']>) {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserOrders(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        products (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
};

// MBTI Questions
export async function getMBTIQuestions() {
  const { data, error } = await supabase
    .from('mbti_questions')
    .select('*')
    .order('question_order', { ascending: true });
  if (error) throw error;
  return data;
}

// Store user MBTI responses
export async function saveMBTIResponses({ userId, responses, testType = 'mbti' }: {
  userId: string,
  responses: { question_id: string, selected_trait: string }[],
  testType?: string
}) {
  const rows = responses.map(r => ({
    user_id: userId,
    question_id: r.question_id,
    selected_trait: r.selected_trait,
    test_type: testType,
    created_at: new Date().toISOString(),
  }));
  const { error } = await supabase.from('user_responses').insert(rows);
  if (error) throw error;
}

// Store MBTI result
export async function saveMBTIResult({ userId, result }: {
  userId: string,
  result: {
    e: number, i: number, s: number, n: number, t: number, f: number, j: number, p: number, mbti_type: string
  }
}) {
  const { error } = await supabase.from('mbti_results').upsert({
    user_id: userId,
    ...result
  }, { onConflict: 'user_id' });
  if (error) throw error;
}

// DISC Questions
export async function getDISCQuestions() {
  const { data, error } = await supabase
    .from('disc_questions')
    .select('*')
    .order('question_number', { ascending: true });
  if (error) throw error;
  return data;
}

// Store user DISC responses
export async function saveDISCResponses({ userId, responses, testType = 'disc' }: {
  userId: string,
  responses: { question_id: string, selected_trait: string }[],
  testType?: string
}) {
  const rows = responses.map(r => ({
    user_id: userId,
    question_id: r.question_id,
    selected_trait: r.selected_trait,
    test_type: testType,
    created_at: new Date().toISOString(),
  }));
  const { error } = await supabase.from('user_responses').insert(rows);
  if (error) throw error;
}

// Store DISC result
export async function saveDISCResult({ userId, result }: {
  userId: string,
  result: {
    dominance: number, influence: number, steadiness: number, compliance: number, disc_type: string
  }
}) {
  const { error } = await supabase.from('disc_results').upsert({
    user_id: userId,
    ...result
  }, { onConflict: 'user_id' });
  if (error) throw error;
} 
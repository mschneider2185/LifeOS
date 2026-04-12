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

async function getAuthedUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
}

// MBTI Questions
export async function getMBTIQuestions() {
  const { data, error } = await supabase
    .from('mbti_questions')
    .select('*')
    .order('id', { ascending: true });
  if (error) throw error;
  return data;
}

// Store user MBTI responses
export async function saveMBTIResponses({ responses }: {
  responses: { question_id: string, selected_trait: string }[],
}) {
  const userId = await getAuthedUserId();
  const rows = responses.map(r => ({
    user_id: userId,
    question_id: r.question_id,
    question_type: 'mbti',
    response: { selected_trait: r.selected_trait },
  }));
  const { error } = await supabase.from('user_responses').insert(rows);
  if (error) throw error;
}

// Store MBTI result
export async function saveMBTIResult({ result }: {
  result: {
    e: number, i: number, s: number, n: number,
    t: number, f: number, j: number, p: number,
    turbulent: number, assertive: number,
    mbti_type: string
  }
}) {
  const userId = await getAuthedUserId();
  const { error } = await supabase.from('mbti_results').insert({
    user_id: userId,
    personality_type: result.mbti_type,
    e_score: result.e,
    i_score: result.i,
    s_score: result.s,
    n_score: result.n,
    t_score: result.t,
    f_score: result.f,
    j_score: result.j,
    p_score: result.p,
    turbulent_score: result.turbulent,
    assertive_score: result.assertive,
  });
  if (error) throw error;
}

// DISC Questions
export async function getDISCQuestions() {
  const { data, error } = await supabase
    .from('disc_questions')
    .select('*')
    .order('question_order', { ascending: true });
  if (error) throw error;
  return data;
}

// Store user DISC responses
export async function saveDISCResponses({ responses }: {
  responses: { question_id: string, selected_trait: string }[],
}) {
  const userId = await getAuthedUserId();
  const rows = responses.map(r => ({
    user_id: userId,
    question_id: r.question_id,
    question_type: 'disc',
    response: { selected_trait: r.selected_trait },
  }));
  const { error } = await supabase.from('user_responses').insert(rows);
  if (error) throw error;
}

// Store DISC result
export async function saveDISCResult({ result }: {
  result: {
    dominance: number, influence: number, steadiness: number, compliance: number,
    primary_style: string, secondary_style: string
  }
}) {
  const userId = await getAuthedUserId();
  const { error } = await supabase.from('disc_results').insert({
    user_id: userId,
    d_score: result.dominance,
    i_score: result.influence,
    s_score: result.steadiness,
    c_score: result.compliance,
    primary_style: result.primary_style,
    secondary_style: result.secondary_style,
  });
  if (error) throw error;
}
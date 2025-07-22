export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          avatar: string | null
          subscription_tier: 'free' | 'premium' | 'enterprise'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          avatar?: string | null
          subscription_tier?: 'free' | 'premium' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          avatar?: string | null
          subscription_tier?: 'free' | 'premium' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
      }
      personality_profiles: {
        Row: {
          id: string
          user_id: string
          test_type: 'proprietary' | 'mbti' | 'disc' | 'big5' | 'manual'
          traits: Json
          mbti_type: string | null
          disc_profile: Json | null
          big5_profile: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          test_type: 'proprietary' | 'mbti' | 'disc' | 'big5' | 'manual'
          traits: Json
          mbti_type?: string | null
          disc_profile?: Json | null
          big5_profile?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          test_type?: 'proprietary' | 'mbti' | 'disc' | 'big5' | 'manual'
          traits?: Json
          mbti_type?: string | null
          disc_profile?: Json | null
          big5_profile?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      user_goals: {
        Row: {
          id: string
          user_id: string
          personal_goals: Json
          professional_goals: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          personal_goals: Json
          professional_goals: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          personal_goals?: Json
          professional_goals?: Json
          created_at?: string
          updated_at?: string
        }
      }
      personality_reports: {
        Row: {
          id: string
          user_id: string
          profile_id: string
          goals_id: string
          insights: Json
          recommendations: Json
          growth_tips: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          profile_id: string
          goals_id: string
          insights: Json
          recommendations: Json
          growth_tips: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          profile_id?: string
          goals_id?: string
          insights?: Json
          recommendations?: Json
          growth_tips?: Json
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          currency: string
          type: 'digital' | 'physical' | 'subscription'
          category: 'sprint' | 'planner' | 'workbook' | 'membership'
          features: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          currency?: string
          type: 'digital' | 'physical' | 'subscription'
          category: 'sprint' | 'planner' | 'workbook' | 'membership'
          features: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          currency?: string
          type?: 'digital' | 'physical' | 'subscription'
          category?: 'sprint' | 'planner' | 'workbook' | 'membership'
          features?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          product_id: string
          amount: number
          currency: string
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          stripe_payment_intent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          amount: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          stripe_payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          amount?: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          stripe_payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      disc_questions: {
        Row: {
          id: string
          question: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          trait_a: string
          trait_b: string
          trait_c: string
          trait_d: string
          question_order: number
          created_at: string
        }
        Insert: {
          id?: string
          question: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          trait_a: string
          trait_b: string
          trait_c: string
          trait_d: string
          question_order: number
          created_at?: string
        }
        Update: {
          id?: string
          question?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          trait_a?: string
          trait_b?: string
          trait_c?: string
          trait_d?: string
          question_order?: number
          created_at?: string
        }
      }
      disc_results: {
        Row: {
          id: string
          user_id: string
          dominance: number
          influence: number
          steadiness: number
          compliance: number
          disc_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          dominance: number
          influence: number
          steadiness: number
          compliance: number
          disc_type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          dominance?: number
          influence?: number
          steadiness?: number
          compliance?: number
          disc_type?: string
          created_at?: string
          updated_at?: string
        }
      }
      mbti_questions: {
        Row: {
          id: string
          question: string
          trait_a: string
          trait_b: string
          question_order: number
          created_at: string
        }
        Insert: {
          id?: string
          question: string
          trait_a: string
          trait_b: string
          question_order: number
          created_at?: string
        }
        Update: {
          id?: string
          question?: string
          trait_a?: string
          trait_b?: string
          question_order?: number
          created_at?: string
        }
      }
      mbti_results: {
        Row: {
          id: string
          user_id: string
          e: number
          i: number
          s: number
          n: number
          t: number
          f: number
          j: number
          p: number
          mbti_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          e: number
          i: number
          s: number
          n: number
          t: number
          f: number
          j: number
          p: number
          mbti_type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          e?: number
          i?: number
          s?: number
          n?: number
          t?: number
          f?: number
          j?: number
          p?: number
          mbti_type?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_responses: {
        Row: {
          id: string
          user_id: string
          question_id: string
          selected_trait: string
          test_type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          selected_trait: string
          test_type?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          selected_trait?: string
          test_type?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 
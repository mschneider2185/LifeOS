// Personality Types
export interface PersonalityTrait {
  id: string;
  name: string;
  value: number; // 0-100 percentage
  category: 'cognitive' | 'behavioral' | 'emotional' | 'social';
}

export interface PersonalityProfile {
  id: string;
  userId: string;
  testType: 'proprietary' | 'mbti' | 'disc' | 'big5' | 'manual';
  traits: PersonalityTrait[];
  mbtiType?: string;
  discProfile?: {
    dominance: number;
    influence: number;
    steadiness: number;
    compliance: number;
  };
  big5Profile?: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Goal Types
export interface Goal {
  id: string;
  userId: string;
  type: 'personal' | 'professional';
  question: string;
  answer: string;
  priority: number;
  createdAt: Date;
}

export interface UserGoals {
  id: string;
  userId: string;
  personalGoals: Goal[];
  professionalGoals: Goal[];
  createdAt: Date;
  updatedAt: Date;
}

// User Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  subscriptionTier: 'free' | 'premium' | 'enterprise';
  createdAt: Date;
  updatedAt: Date;
}

// Report Types
export interface PersonalityReport {
  id: string;
  userId: string;
  profile: PersonalityProfile;
  goals: UserGoals;
  insights: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  recommendations: {
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
  };
  growthTips: string[];
  createdAt: Date;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'USD';
  type: 'digital' | 'physical' | 'subscription';
  category: 'sprint' | 'planner' | 'workbook' | 'membership';
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  amount: number;
  currency: 'USD';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripePaymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// AI Integration Types
export interface AIAnalysisRequest {
  profile: PersonalityProfile;
  goals: UserGoals;
  analysisType: 'strengths' | 'weaknesses' | 'opportunities' | 'recommendations';
}

export interface AIAnalysisResponse {
  insights: string[];
  confidence: number;
  reasoning: string;
}

// Form Types
export interface PersonalityInputForm {
  testType: 'proprietary' | 'upload' | 'manual';
  uploadedFile?: File;
  mbtiType?: string;
  discProfile?: {
    dominance: number;
    influence: number;
    steadiness: number;
    compliance: number;
  };
  big5Profile?: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  manualTraits?: PersonalityTrait[];
}

export interface GoalInputForm {
  personalGoals: {
    question1: string;
    question2: string;
    question3: string;
  };
  professionalGoals: {
    question1: string;
    question2: string;
    question3: string;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Navigation Types
export interface NavigationItem {
  name: string;
  href: string;
  icon?: any; // React.ComponentType<{ className?: string }>;
  current?: boolean;
}

// Dashboard Types
export interface DashboardStats {
  totalReports: number;
  completedSprints: number;
  currentStreak: number;
  nextMilestone: string;
}

export interface SprintProgress {
  id: string;
  name: string;
  progress: number;
  startDate: Date;
  endDate: Date;
  status: 'not_started' | 'in_progress' | 'completed';
} 
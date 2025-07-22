import { PersonalityProfile, UserGoals, AIAnalysisRequest, AIAnalysisResponse } from '@/types';

// AI Service Configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'https://api.openai.com/v1/chat/completions';
const AI_API_KEY = process.env.AI_API_KEY;

// Personality trait mapping to universal framework
export const PERSONALITY_TRAITS = {
  cognitive: [
    'analytical_thinking',
    'creative_thinking',
    'strategic_planning',
    'detail_orientation',
    'big_picture_thinking'
  ],
  behavioral: [
    'assertiveness',
    'adaptability',
    'consistency',
    'initiative',
    'collaboration'
  ],
  emotional: [
    'emotional_stability',
    'empathy',
    'stress_tolerance',
    'optimism',
    'self_awareness'
  ],
  social: [
    'communication_style',
    'leadership_preference',
    'team_orientation',
    'conflict_resolution',
    'networking_ability'
  ]
};

// MBTI to universal framework mapping
export const MBTI_MAPPING = {
  'INTJ': { analytical_thinking: 90, strategic_planning: 85, big_picture_thinking: 80, detail_orientation: 70 },
  'INTP': { analytical_thinking: 95, creative_thinking: 85, detail_orientation: 75, strategic_planning: 70 },
  'ENTJ': { assertiveness: 90, strategic_planning: 85, leadership_preference: 80, analytical_thinking: 75 },
  'ENTP': { creative_thinking: 90, adaptability: 85, communication_style: 80, analytical_thinking: 75 },
  'INFJ': { empathy: 90, strategic_planning: 80, self_awareness: 85, communication_style: 75 },
  'INFP': { empathy: 95, creative_thinking: 85, self_awareness: 80, adaptability: 70 },
  'ENFJ': { empathy: 90, leadership_preference: 85, communication_style: 80, team_orientation: 85 },
  'ENFP': { creative_thinking: 90, empathy: 85, adaptability: 80, communication_style: 85 },
  'ISTJ': { detail_orientation: 90, consistency: 85, analytical_thinking: 75, reliability: 90 },
  'ISFJ': { detail_orientation: 85, empathy: 80, consistency: 85, team_orientation: 80 },
  'ESTJ': { assertiveness: 85, detail_orientation: 80, leadership_preference: 75, consistency: 85 },
  'ESFJ': { team_orientation: 85, empathy: 80, communication_style: 80, consistency: 80 },
  'ISTP': { analytical_thinking: 80, adaptability: 85, detail_orientation: 75, stress_tolerance: 80 },
  'ISFP': { empathy: 80, adaptability: 80, creative_thinking: 75, stress_tolerance: 85 },
  'ESTP': { adaptability: 90, assertiveness: 80, stress_tolerance: 85, communication_style: 80 },
  'ESFP': { empathy: 85, adaptability: 85, communication_style: 85, stress_tolerance: 80 }
};

// DISC to universal framework mapping
export const DISC_MAPPING = {
  dominance: { assertiveness: 85, leadership_preference: 80, initiative: 75, stress_tolerance: 70 },
  influence: { communication_style: 85, empathy: 80, networking_ability: 75, optimism: 80 },
  steadiness: { consistency: 85, team_orientation: 80, stress_tolerance: 75, empathy: 70 },
  compliance: { detail_orientation: 85, analytical_thinking: 80, consistency: 75, reliability: 80 }
};

// AI Analysis Functions
export async function analyzePersonalityStrengths(
  profile: PersonalityProfile,
  goals: UserGoals
): Promise<AIAnalysisResponse> {
  const prompt = generateStrengthsPrompt(profile, goals);
  return await callAIService(prompt, 'strengths');
}

export async function analyzePersonalityWeaknesses(
  profile: PersonalityProfile,
  goals: UserGoals
): Promise<AIAnalysisResponse> {
  const prompt = generateWeaknessesPrompt(profile, goals);
  return await callAIService(prompt, 'weaknesses');
}

export async function generateGrowthRecommendations(
  profile: PersonalityProfile,
  goals: UserGoals
): Promise<AIAnalysisResponse> {
  const prompt = generateRecommendationsPrompt(profile, goals);
  return await callAIService(prompt, 'recommendations');
}

export async function generateGrowthTips(
  profile: PersonalityProfile,
  goals: UserGoals
): Promise<AIAnalysisResponse> {
  const prompt = generateTipsPrompt(profile, goals);
  return await callAIService(prompt, 'tips');
}

// Prompt Generation Functions
function generateStrengthsPrompt(profile: PersonalityProfile, goals: UserGoals): string {
  const traits = profile.traits.map(t => `${t.name}: ${t.value}%`).join(', ');
  const personalGoals = goals.personalGoals.map(g => g.answer).join('; ');
  const professionalGoals = goals.professionalGoals.map(g => g.answer).join('; ');

  return `Based on the following personality profile and goals, identify 3-5 key strengths that will help achieve these objectives:

Personality Traits: ${traits}
Personal Goals: ${personalGoals}
Professional Goals: ${professionalGoals}

Please provide specific, actionable insights about how these personality strengths can be leveraged to achieve the stated goals. Focus on practical applications and real-world scenarios.`;
}

function generateWeaknessesPrompt(profile: PersonalityProfile, goals: UserGoals): string {
  const traits = profile.traits.map(t => `${t.name}: ${t.value}%`).join(', ');
  const personalGoals = goals.personalGoals.map(g => g.answer).join('; ');
  const professionalGoals = goals.professionalGoals.map(g => g.answer).join('; ');

  return `Based on the following personality profile and goals, identify 2-3 potential areas for improvement that might hinder goal achievement:

Personality Traits: ${traits}
Personal Goals: ${personalGoals}
Professional Goals: ${professionalGoals}

Please provide constructive feedback about potential blind spots or areas that could be developed to better support goal achievement. Frame this as opportunities for growth rather than limitations.`;
}

function generateRecommendationsPrompt(profile: PersonalityProfile, goals: UserGoals): string {
  const traits = profile.traits.map(t => `${t.name}: ${t.value}%`).join(', ');
  const personalGoals = goals.personalGoals.map(g => g.answer).join('; ');
  const professionalGoals = goals.professionalGoals.map(g => g.answer).join('; ');

  return `Based on the personality profile and goals below, provide specific, actionable recommendations organized by timeframe:

Personality Traits: ${traits}
Personal Goals: ${personalGoals}
Professional Goals: ${professionalGoals}

Please provide:
- 3 short-term actions (next 30 days)
- 3 medium-term strategies (next 90 days)
- 3 long-term development areas (next 6-12 months)

Each recommendation should be specific, measurable, and aligned with both the personality profile and stated goals.`;
}

function generateTipsPrompt(profile: PersonalityProfile, goals: UserGoals): string {
  const traits = profile.traits.map(t => `${t.name}: ${t.value}%`).join(', ');
  const personalGoals = goals.personalGoals.map(g => g.answer).join('; ');
  const professionalGoals = goals.professionalGoals.map(g => g.answer).join('; ');

  return `Based on the personality profile and goals below, provide 5 practical growth tips that can be implemented immediately:

Personality Traits: ${traits}
Personal Goals: ${personalGoals}
Professional Goals: ${professionalGoals}

Please provide actionable tips that:
1. Leverage existing strengths
2. Address potential blind spots
3. Support goal achievement
4. Can be implemented daily or weekly
5. Include specific examples or scenarios`;
}

// AI Service Call
async function callAIService(prompt: string, analysisType: string): Promise<AIAnalysisResponse> {
  if (!AI_API_KEY) {
    // Fallback to mock responses for development
    return generateMockResponse(analysisType);
  }

  try {
    const response = await fetch(AI_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert personality development coach with deep knowledge of psychology, goal achievement, and personal growth strategies.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    return {
      insights: parseAIResponse(content),
      confidence: 0.85,
      reasoning: 'AI-generated analysis based on personality profile and goals'
    };
  } catch (error) {
    console.error('AI service error:', error);
    return generateMockResponse(analysisType);
  }
}

function parseAIResponse(content: string): string[] {
  // Parse AI response into structured insights
  const lines = content.split('\n').filter(line => line.trim());
  return lines.map(line => line.replace(/^[-*•]\s*/, '').trim()).filter(line => line.length > 0);
}

function generateMockResponse(analysisType: string): AIAnalysisResponse {
  const mockResponses = {
    strengths: [
      'Strong analytical thinking supports data-driven decision making',
      'High empathy enables effective team collaboration',
      'Strategic planning skills align well with long-term goal achievement'
    ],
    weaknesses: [
      'May need to develop assertiveness for leadership roles',
      'Detail orientation could be enhanced for project management',
      'Stress tolerance could be improved for high-pressure situations'
    ],
    recommendations: [
      'Short-term: Practice daily goal-setting and tracking',
      'Medium-term: Enroll in leadership development program',
      'Long-term: Build expertise in strategic planning methodologies'
    ],
    tips: [
      'Use your analytical strengths to break down complex goals into manageable steps',
      'Leverage your empathy to build stronger professional relationships',
      'Schedule regular reflection time to track progress and adjust strategies'
    ]
  };

  return {
    insights: mockResponses[analysisType as keyof typeof mockResponses] || [],
    confidence: 0.75,
    reasoning: 'Mock response for development purposes'
  };
}

// Utility Functions
export function mapMBTItoTraits(mbtiType: string): PersonalityProfile['traits'] {
  const mapping = MBTI_MAPPING[mbtiType as keyof typeof MBTI_MAPPING];
  if (!mapping) return [];

  return Object.entries(mapping).map(([name, value]) => ({
    id: name,
    name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value,
    category: getTraitCategory(name)
  }));
}

export function mapDISCtoTraits(discProfile: any): PersonalityProfile['traits'] {
  const traits: PersonalityProfile['traits'] = [];
  
  Object.entries(discProfile).forEach(([dimension, value]) => {
    const mapping = DISC_MAPPING[dimension as keyof typeof DISC_MAPPING];
    if (mapping) {
      Object.entries(mapping).forEach(([traitName, baseValue]) => {
        traits.push({
          id: traitName,
          name: traitName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          value: Math.round((value as number) * baseValue / 100),
          category: getTraitCategory(traitName)
        });
      });
    }
  });

  return traits;
}

function getTraitCategory(traitName: string): PersonalityProfile['traits'][0]['category'] {
  if (PERSONALITY_TRAITS.cognitive.includes(traitName)) return 'cognitive';
  if (PERSONALITY_TRAITS.behavioral.includes(traitName)) return 'behavioral';
  if (PERSONALITY_TRAITS.emotional.includes(traitName)) return 'emotional';
  if (PERSONALITY_TRAITS.social.includes(traitName)) return 'social';
  return 'cognitive'; // default
} 
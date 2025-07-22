import { NextRequest, NextResponse } from 'next/server'
import { PersonalityInputForm, GoalInputForm, PersonalityReport, PersonalityTrait } from '@/types'

// Mock AI analysis function - in production, this would call your AI service
function analyzePersonality(personalityData: PersonalityInputForm, goalData: GoalInputForm) {
  // Generate mock personality traits based on input
  const traits: PersonalityTrait[] = [
    { id: '1', name: 'Extraversion', value: Math.floor(Math.random() * 40) + 30, category: 'social' },
    { id: '2', name: 'Openness', value: Math.floor(Math.random() * 40) + 30, category: 'cognitive' },
    { id: '3', name: 'Conscientiousness', value: Math.floor(Math.random() * 40) + 30, category: 'behavioral' },
    { id: '4', name: 'Agreeableness', value: Math.floor(Math.random() * 40) + 30, category: 'social' },
    { id: '5', name: 'Emotional Stability', value: Math.floor(Math.random() * 40) + 30, category: 'emotional' }
  ]

  // Generate insights based on traits and goals
  const insights = {
    strengths: [
      'High openness makes you adaptable to new situations',
      'Strong agreeableness helps you build positive relationships',
      'Good conscientiousness supports goal achievement'
    ],
    weaknesses: [
      'Moderate emotional stability may cause stress in high-pressure situations',
      'High extraversion might lead to over-commitment'
    ],
    opportunities: [
      'Your openness can help you explore new career paths',
      'Strong social skills can accelerate leadership development'
    ],
    threats: [
      'Stress management needs attention for career advancement',
      'Risk of burnout from over-commitment'
    ]
  }

  const recommendations = {
    shortTerm: [
      'Practice stress management techniques daily',
      'Set clear boundaries between work and personal time',
      'Prioritize tasks to avoid over-commitment'
    ],
    mediumTerm: [
      'Develop emotional regulation skills through mindfulness',
      'Build a support network for career advancement',
      'Create a structured daily routine'
    ],
    longTerm: [
      'Consider leadership training programs',
      'Establish work-life balance as a core value',
      'Develop resilience for long-term career success'
    ]
  }

  const growthTips = [
    'Use your natural curiosity to explore new opportunities',
    'Leverage your social skills to build professional networks',
    'Practice self-care to maintain emotional stability',
    'Set realistic goals that align with your personality'
  ]

  return {
    traits,
    insights,
    recommendations,
    growthTips
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { personalityData, goalData }: { personalityData: PersonalityInputForm, goalData: GoalInputForm } = body

    // Validate input
    if (!personalityData || !goalData) {
      return NextResponse.json(
        { success: false, error: 'Missing required data' },
        { status: 400 }
      )
    }

    // Analyze personality and generate insights
    const analysis = analyzePersonality(personalityData, goalData)

    // Create the report
    const report: PersonalityReport = {
      id: `report-${Date.now()}`,
      userId: 'user-1', // In production, get from auth
      profile: {
        id: `profile-${Date.now()}`,
        userId: 'user-1',
        testType: personalityData.testType === 'upload' ? 'proprietary' : personalityData.testType,
        traits: analysis.traits,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      goals: {
        id: `goals-${Date.now()}`,
        userId: 'user-1',
        personalGoals: [
          {
            id: '1',
            userId: 'user-1',
            type: 'personal',
            question: 'Personal Challenge',
            answer: goalData.personalGoals.question1,
            priority: 1,
            createdAt: new Date()
          },
          {
            id: '2',
            userId: 'user-1',
            type: 'personal',
            question: 'Personal Success',
            answer: goalData.personalGoals.question2,
            priority: 2,
            createdAt: new Date()
          },
          {
            id: '3',
            userId: 'user-1',
            type: 'personal',
            question: 'Personal Timeline',
            answer: goalData.personalGoals.question3,
            priority: 3,
            createdAt: new Date()
          }
        ],
        professionalGoals: [
          {
            id: '4',
            userId: 'user-1',
            type: 'professional',
            question: 'Professional Challenge',
            answer: goalData.professionalGoals.question1,
            priority: 1,
            createdAt: new Date()
          },
          {
            id: '5',
            userId: 'user-1',
            type: 'professional',
            question: 'Professional Success',
            answer: goalData.professionalGoals.question2,
            priority: 2,
            createdAt: new Date()
          },
          {
            id: '6',
            userId: 'user-1',
            type: 'professional',
            question: 'Professional Timeline',
            answer: goalData.professionalGoals.question3,
            priority: 3,
            createdAt: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      insights: analysis.insights,
      recommendations: analysis.recommendations,
      growthTips: analysis.growthTips,
      createdAt: new Date()
    }

    // In production, save to database here
    // await saveReportToDatabase(report)

    return NextResponse.json({
      success: true,
      data: report
    })

  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('id')

    if (!reportId) {
      return NextResponse.json(
        { success: false, error: 'Report ID required' },
        { status: 400 }
      )
    }

    // In production, fetch from database
    // const report = await getReportFromDatabase(reportId)

    // For now, return mock data
    const mockReport: PersonalityReport = {
      id: reportId,
      userId: 'user-1',
      profile: {
        id: 'profile-1',
        userId: 'user-1',
        testType: 'proprietary',
        traits: [
          { id: '1', name: 'Extraversion', value: 75, category: 'social' },
          { id: '2', name: 'Openness', value: 85, category: 'cognitive' },
          { id: '3', name: 'Conscientiousness', value: 70, category: 'behavioral' },
          { id: '4', name: 'Agreeableness', value: 80, category: 'social' },
          { id: '5', name: 'Emotional Stability', value: 65, category: 'emotional' }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      goals: {
        id: 'goals-1',
        userId: 'user-1',
        personalGoals: [
          { id: '1', userId: 'user-1', type: 'personal', question: 'Personal Goal', answer: 'Improve work-life balance', priority: 1, createdAt: new Date() }
        ],
        professionalGoals: [
          { id: '2', userId: 'user-1', type: 'professional', question: 'Professional Goal', answer: 'Advance in career', priority: 1, createdAt: new Date() }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      insights: {
        strengths: ['High openness', 'Strong agreeableness'],
        weaknesses: ['Moderate emotional stability'],
        opportunities: ['Career exploration', 'Leadership development'],
        threats: ['Stress management', 'Burnout risk']
      },
      recommendations: {
        shortTerm: ['Practice stress management', 'Set boundaries'],
        mediumTerm: ['Develop emotional regulation', 'Build support network'],
        longTerm: ['Leadership training', 'Work-life balance']
      },
      growthTips: [
        'Use curiosity for opportunities',
        'Leverage social skills',
        'Practice self-care'
      ],
      createdAt: new Date()
    }

    return NextResponse.json({
      success: true,
      data: mockReport
    })

  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch report' },
      { status: 500 }
    )
  }
} 
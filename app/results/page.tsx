'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Download, 
  Share2, 
  ArrowRight,
  CheckCircle,
  Star,
  Clock,
  Users,
  Zap,
  FileText,
  Calendar,
  Award
} from 'lucide-react'
import { PersonalityReport } from '@/types'

// Mock data for demonstration
const mockReport: PersonalityReport = {
  id: '1',
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
      { id: '1', userId: 'user-1', type: 'personal', question: 'Improve work-life balance', answer: 'I want to better manage my time between work and personal life', priority: 1, createdAt: new Date() }
    ],
    professionalGoals: [
      { id: '2', userId: 'user-1', type: 'professional', question: 'Advance in my career', answer: 'I want to move into a leadership role within the next year', priority: 1, createdAt: new Date() }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  insights: {
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
  },
  recommendations: {
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
  },
  growthTips: [
    'Use your natural curiosity to explore new opportunities',
    'Leverage your social skills to build professional networks',
    'Practice self-care to maintain emotional stability',
    'Set realistic goals that align with your personality'
  ],
  createdAt: new Date()
}

export default function ResultsPage() {
  const [report, setReport] = useState<PersonalityReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchReport = async () => {
      try {
        // Get report ID from localStorage or URL params
        const reportId = localStorage.getItem('currentReportId') || 'default'
        
        const response = await fetch(`/api/reports?id=${reportId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch report')
        }

        const result = await response.json()
        
        if (result.success) {
          setReport(result.data)
        } else {
          throw new Error(result.error || 'Failed to fetch report')
        }
      } catch (error) {
        console.error('Error fetching report:', error)
        // Fallback to mock data for demo
        setReport(mockReport)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReport()
  }, [])

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download
    console.log('Downloading PDF...')
  }

  const handleShare = () => {
    // TODO: Implement sharing functionality
    console.log('Sharing report...')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Your Report</h2>
          <p className="text-gray-600">Analyzing your personality and goals...</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h2>
          <p className="text-gray-600 mb-4">Unable to load your personality report.</p>
          <Link href="/onboarding" className="btn-primary">
            Start Over
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="px-6 py-4 border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold gradient-text">LifeOS</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="btn-secondary flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <button
              onClick={handleShare}
              className="btn-secondary flex items-center space-x-2"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="btn-primary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Your Report is Ready!</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We've analyzed your personality profile and goals to create a personalized 
              growth strategy just for you.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { id: 'overview', label: 'Overview', icon: Brain },
              { id: 'insights', label: 'Insights', icon: Target },
              { id: 'recommendations', label: 'Recommendations', icon: TrendingUp },
              { id: 'growth', label: 'Growth Tips', icon: Zap }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeTab === 'overview' && <OverviewTab report={report} />}
              {activeTab === 'insights' && <InsightsTab report={report} />}
              {activeTab === 'recommendations' && <RecommendationsTab report={report} />}
              {activeTab === 'growth' && <GrowthTab report={report} />}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <PersonalitySummary report={report} />
              <GoalsSummary report={report} />
              <NextSteps />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Overview Tab
function OverviewTab({ report }: { report: PersonalityReport }) {
  return (
    <div className="space-y-8">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Your Personality Profile</h2>
        <div className="space-y-6">
          {report.profile.traits.map((trait) => (
            <div key={trait.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{trait.name}</span>
                <span className="text-sm text-gray-500">{trait.value}%</span>
              </div>
              <div className="trait-bar">
                <div 
                  className="trait-fill" 
                  style={{ width: `${trait.value}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-600 capitalize">
                Category: {trait.category}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-primary-600" />
            Key Strengths
          </h3>
          <ul className="space-y-2">
            {report.insights.strengths.slice(0, 3).map((strength, index) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-secondary-600" />
            Growth Areas
          </h3>
          <ul className="space-y-2">
            {report.insights.weaknesses.slice(0, 3).map((weakness, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0">⚠</div>
                <span className="text-sm">{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// Insights Tab
function InsightsTab({ report }: { report: PersonalityReport }) {
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-semibold mb-4 text-green-600">Strengths</h3>
          <ul className="space-y-3">
            {report.insights.strengths.map((strength, index) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold mb-4 text-orange-600">Areas for Improvement</h3>
          <ul className="space-y-3">
            {report.insights.weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0">⚠</div>
                <span className="text-sm">{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-semibold mb-4 text-blue-600">Opportunities</h3>
          <ul className="space-y-3">
            {report.insights.opportunities.map((opportunity, index) => (
              <li key={index} className="flex items-start space-x-2">
                <Star className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{opportunity}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold mb-4 text-red-600">Potential Challenges</h3>
          <ul className="space-y-3">
            {report.insights.threats.map((threat, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0">⚠</div>
                <span className="text-sm">{threat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// Recommendations Tab
function RecommendationsTab({ report }: { report: PersonalityReport }) {
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center mb-4">
            <Clock className="h-5 w-5 text-primary-600 mr-2" />
            <h3 className="text-xl font-semibold">Short Term</h3>
          </div>
          <ul className="space-y-3">
            {report.recommendations.shortTerm.map((rec, index) => (
              <li key={index} className="text-sm flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="flex items-center mb-4">
            <Calendar className="h-5 w-5 text-secondary-600 mr-2" />
            <h3 className="text-xl font-semibold">Medium Term</h3>
          </div>
          <ul className="space-y-3">
            {report.recommendations.mediumTerm.map((rec, index) => (
              <li key={index} className="text-sm flex items-start space-x-2">
                <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="flex items-center mb-4">
            <Award className="h-5 w-5 text-accent-600 mr-2" />
            <h3 className="text-xl font-semibold">Long Term</h3>
          </div>
          <ul className="space-y-3">
            {report.recommendations.longTerm.map((rec, index) => (
              <li key={index} className="text-sm flex items-start space-x-2">
                <div className="w-2 h-2 bg-accent-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// Growth Tab
function GrowthTab({ report }: { report: PersonalityReport }) {
  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Personal Growth Tips</h2>
        <div className="grid gap-4">
          {report.growthTips.map((tip, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <Zap className="h-5 w-5 text-accent-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Sidebar Components
function PersonalitySummary({ report }: { report: PersonalityReport }) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Personality Summary</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Test Type:</span>
          <span className="text-sm font-medium capitalize">{report.profile.testType}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Traits Analyzed:</span>
          <span className="text-sm font-medium">{report.profile.traits.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Report Date:</span>
          <span className="text-sm font-medium">
            {report.createdAt.toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  )
}

function GoalsSummary({ report }: { report: PersonalityReport }) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Your Goals</h3>
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-primary-600 mb-2">Personal</h4>
          <ul className="space-y-2">
            {report.goals.personalGoals.map((goal) => (
              <li key={goal.id} className="text-sm text-gray-600">
                {goal.answer}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium text-secondary-600 mb-2">Professional</h4>
          <ul className="space-y-2">
            {report.goals.professionalGoals.map((goal) => (
              <li key={goal.id} className="text-sm text-gray-600">
                {goal.answer}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function NextSteps() {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
      <div className="space-y-4">
        <Link href="/products/sprint-guide" className="btn-primary w-full flex items-center justify-center space-x-2">
          <FileText className="h-4 w-4" />
          <span>Get Sprint Guide</span>
        </Link>
        <Link href="/products/strategic-planner" className="btn-secondary w-full flex items-center justify-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span>Strategic Planner</span>
        </Link>
        <Link href="/products/premium" className="btn-accent w-full flex items-center justify-center space-x-2">
          <Zap className="h-4 w-4" />
          <span>Start Free Trial</span>
        </Link>
      </div>
    </div>
  )
} 
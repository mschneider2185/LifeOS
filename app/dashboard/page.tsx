'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Brain, 
  Target, 
  TrendingUp, 
  FileText, 
  Calendar,
  CheckCircle,
  Clock,
  Star,
  Plus,
  ArrowRight,
  BarChart3,
  Users,
  Zap
} from 'lucide-react'
import { PersonalityReport, DashboardStats, SprintProgress } from '@/types'

// Mock data
const mockStats: DashboardStats = {
  totalReports: 1,
  completedSprints: 0,
  currentStreak: 0,
  nextMilestone: 'Complete your first sprint'
}

const mockSprints: SprintProgress[] = [
  {
    id: '1',
    name: 'Stress Management Sprint',
    progress: 0,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    status: 'not_started'
  },
  {
    id: '2',
    name: 'Leadership Development Sprint',
    progress: 0,
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    status: 'not_started'
  }
]

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(mockStats)
  const [sprints, setSprints] = useState<SprintProgress[]>(mockSprints)
  const [recentReport, setRecentReport] = useState<PersonalityReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Get recent report
        const reportId = localStorage.getItem('currentReportId')
        if (reportId) {
          const response = await fetch(`/api/reports?id=${reportId}`)
          if (response.ok) {
            const result = await response.json()
            if (result.success) {
              setRecentReport(result.data)
            }
          }
        }
      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Setting up your personalized experience...</p>
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
            <span className="text-2xl font-bold gradient-text">Mind Map Pro</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/onboarding" className="btn-secondary flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>New Report</span>
            </Link>
            <Link href="/products/premium" className="btn-primary flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Upgrade</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
            <p className="text-gray-600">
              Track your progress and continue your personal growth journey.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold text-primary-600">{stats.totalReports}</p>
                </div>
                <FileText className="h-8 w-8 text-primary-400" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed Sprints</p>
                  <p className="text-2xl font-bold text-secondary-600">{stats.completedSprints}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-secondary-400" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Streak</p>
                  <p className="text-2xl font-bold text-accent-600">{stats.currentStreak} days</p>
                </div>
                <TrendingUp className="h-8 w-8 text-accent-400" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Next Milestone</p>
                  <p className="text-sm font-medium text-gray-900">{stats.nextMilestone}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Report */}
            <div className="lg:col-span-2">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Recent Report</h2>
                  <Link href="/results" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View Full Report
                  </Link>
                </div>

                {recentReport ? (
                  <div className="space-y-6">
                    {/* Personality Summary */}
                    <div>
                      <h3 className="font-semibold mb-3">Your Personality Profile</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {recentReport.profile.traits.slice(0, 4).map((trait) => (
                          <div key={trait.id} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{trait.name}</span>
                              <span className="text-gray-500">{trait.value}%</span>
                            </div>
                            <div className="trait-bar">
                              <div 
                                className="trait-fill" 
                                style={{ width: `${trait.value}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Key Insights */}
                    <div>
                      <h3 className="font-semibold mb-3">Key Insights</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-green-600 mb-2">Strengths</h4>
                          <ul className="space-y-1">
                            {recentReport.insights.strengths.slice(0, 2).map((strength, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-orange-600 mb-2">Growth Areas</h4>
                          <ul className="space-y-1">
                            {recentReport.insights.weaknesses.slice(0, 2).map((weakness, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                                <div className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0">⚠</div>
                                <span>{weakness}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
                    <p className="text-gray-600 mb-4">Generate your first personality report to get started.</p>
                    <Link href="/onboarding" className="btn-primary">
                      Create Report
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/onboarding" className="btn-primary w-full flex items-center justify-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>New Report</span>
                  </Link>
                  <Link href="/products/sprint-guide" className="btn-secondary w-full flex items-center justify-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Start Sprint</span>
                  </Link>
                  <Link href="/products/strategic-planner" className="btn-accent w-full flex items-center justify-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Strategic Plan</span>
                  </Link>
                </div>
              </div>

              {/* Upcoming Sprints */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Upcoming Sprints</h3>
                <div className="space-y-4">
                  {sprints.map((sprint) => (
                    <div key={sprint.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{sprint.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          sprint.status === 'completed' 
                            ? 'bg-green-100 text-green-700'
                            : sprint.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {sprint.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Progress</span>
                          <span>{sprint.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${sprint.progress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Start: {sprint.startDate.toLocaleDateString()}</span>
                          <span>End: {sprint.endDate.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Community */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Community</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Users className="h-5 w-5 text-primary-600" />
                    <div>
                      <p className="text-sm font-medium">Join Community</p>
                      <p className="text-xs text-gray-600">Connect with like-minded people</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">Share Progress</p>
                      <p className="text-xs text-gray-600">Inspire others with your journey</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Brain, 
  Target, 
  TrendingUp, 
  ArrowLeft, 
  ArrowRight,
  Upload,
  FileText,
  CheckCircle,
  X
} from 'lucide-react'
import { PersonalityInputForm, GoalInputForm } from '@/types'

const steps = [
  { id: 1, title: 'Personality Assessment', icon: Brain },
  { id: 2, title: 'Goal Setting', icon: Target },
  { id: 3, title: 'Review & Generate', icon: TrendingUp }
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [personalityData, setPersonalityData] = useState<PersonalityInputForm>({
    testType: 'proprietary'
  })
  const [goalData, setGoalData] = useState<GoalInputForm>({
    personalGoals: { question1: '', question2: '', question3: '' },
    professionalGoals: { question1: '', question2: '', question3: '' }
  })
  const [isLoading, setIsLoading] = useState(false)

  // Check for test results when component mounts
  React.useEffect(() => {
    const mbtiResult = localStorage.getItem('mbtiResult')
    const discResult = localStorage.getItem('discResult')
    
    if (mbtiResult) {
      setPersonalityData(prev => ({
        ...prev,
        testType: 'manual',
        mbtiType: mbtiResult
      }))
      localStorage.removeItem('mbtiResult')
    }
    
    if (discResult) {
      try {
        const discProfile = JSON.parse(discResult)
        setPersonalityData(prev => ({
          ...prev,
          testType: 'manual',
          discProfile: discProfile
        }))
        localStorage.removeItem('discResult')
      } catch (error) {
        console.error('Error parsing DISC result:', error)
      }
    }
  }, [])

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePersonalityChange = (field: keyof PersonalityInputForm, value: any) => {
    setPersonalityData(prev => ({ ...prev, [field]: value }))
  }

  const handleGoalChange = (category: 'personalGoals' | 'professionalGoals', field: string, value: string) => {
    setGoalData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      // Call API to generate report
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalityData,
          goalData
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      const result = await response.json()
      
      if (result.success) {
        // Store report ID in localStorage for results page
        localStorage.setItem('currentReportId', result.data.id)
        router.push('/results')
      } else {
        throw new Error(result.error || 'Failed to generate report')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      // TODO: Show error message to user
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <PersonalityStep data={personalityData} onChange={handlePersonalityChange} />
      case 2:
        return <GoalStep data={goalData} onChange={handleGoalChange} />
      case 3:
        return <ReviewStep personalityData={personalityData} goalData={goalData} />
      default:
        return null
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return personalityData.testType && 
               (personalityData.testType === 'proprietary' || 
                personalityData.testType === 'upload' || 
                (personalityData.testType === 'manual' && (personalityData.mbtiType || personalityData.discProfile)))
      case 2:
        return goalData.personalGoals.question1 && goalData.professionalGoals.question1
      case 3:
        return true
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="px-6 py-4 border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold gradient-text">LifeOS</span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isActive 
                        ? 'bg-primary-600 border-primary-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <div className="ml-4">
                    <div className={`text-sm font-medium ${
                      isActive ? 'text-primary-600' : 'text-gray-500'
                    }`}>
                      Step {step.id}
                    </div>
                    <div className={`font-semibold ${
                      isActive ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="px-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="card">
            {renderStepContent()}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 py-8 bg-white border-t">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          
          <div className="text-sm text-gray-500">
            Step {currentStep} of {steps.length}
          </div>
          
          {currentStep === steps.length ? (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating Report...
                </>
              ) : (
                <>
                  Generate Report
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Personality Assessment Step
function PersonalityStep({ 
  data, 
  onChange 
}: { 
  data: PersonalityInputForm
  onChange: (field: keyof PersonalityInputForm, value: any) => void 
}) {
  const [testSelection, setTestSelection] = useState<'initial' | 'proprietary' | 'mbti' | 'disc' | 'manual' | 'upload'>('initial')
  const [manualType, setManualType] = useState<'mbti' | 'disc' | null>(null)
  const [mbtiType, setMbtiType] = useState('')
  const [discProfile, setDiscProfile] = useState({
    dominance: 50,
    influence: 50,
    steadiness: 50,
    compliance: 50
  })

  // MBTI Types
  const mbtiTypes = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ]

  const handleTestSelection = (selection: 'proprietary' | 'mbti' | 'disc' | 'manual' | 'upload') => {
    setTestSelection(selection)
    if (selection === 'proprietary') {
      onChange('testType', 'proprietary')
    } else if (selection === 'upload') {
      onChange('testType', 'upload')
    } else if (selection === 'manual') {
      onChange('testType', 'manual')
    }
  }

  const handleManualTypeSelection = (type: 'mbti' | 'disc') => {
    setManualType(type)
  }

  const handleMbtiSelection = (type: string) => {
    setMbtiType(type)
    onChange('mbtiType', type)
  }

  const handleDiscChange = (dimension: keyof typeof discProfile, value: number) => {
    const updated = { ...discProfile, [dimension]: value }
    setDiscProfile(updated)
    onChange('discProfile', updated)
  }

  // If proprietary test is selected, redirect to test page
  if (testSelection === 'proprietary') {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Choose Your Test</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select which personality assessment you'd like to take.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div 
            className="card cursor-pointer transition-all hover:shadow-md"
            onClick={() => handleTestSelection('mbti')}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">MBTI Assessment</h3>
              <p className="text-gray-600 text-sm mb-4">
                Myers-Briggs Type Indicator (15-20 minutes)
              </p>
              <div className="text-xs text-gray-500">
                Measures: Introversion/Extraversion, Sensing/Intuition, Thinking/Feeling, Judging/Perceiving
              </div>
            </div>
          </div>

          <div 
            className="card cursor-pointer transition-all hover:shadow-md"
            onClick={() => handleTestSelection('disc')}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">DISC Assessment</h3>
              <p className="text-gray-600 text-sm mb-4">
                DISC Personality Profile (10-15 minutes)
              </p>
              <div className="text-xs text-gray-500">
                Measures: Dominance, Influence, Steadiness, Compliance
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => setTestSelection('initial')}
            className="btn-secondary"
          >
            Back to Options
          </button>
        </div>
      </div>
    )
  }

  // If MBTI test is selected, show MBTI test
  if (testSelection === 'mbti') {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">MBTI Assessment</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We'll redirect you to our comprehensive MBTI assessment. This will take about 15-20 minutes.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="h-8 w-8 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold mb-4">Ready to Start?</h3>
          <p className="text-gray-600 mb-6">
            The MBTI assessment will help us understand your personality preferences and how you interact with the world.
          </p>
          <Link href="/mbti-test" className="btn-primary">
            Start MBTI Test
          </Link>
        </div>

        <div className="text-center">
          <button
            onClick={() => setTestSelection('proprietary')}
            className="btn-secondary"
          >
            Back to Test Selection
          </button>
        </div>
      </div>
    )
  }

  // If DISC test is selected, show DISC test
  if (testSelection === 'disc') {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">DISC Assessment</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We'll redirect you to our DISC personality assessment. This will take about 10-15 minutes.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Target className="h-8 w-8 text-secondary-600" />
          </div>
          <h3 className="text-xl font-semibold mb-4">Ready to Start?</h3>
          <p className="text-gray-600 mb-6">
            The DISC assessment will help us understand your behavioral style and communication preferences.
          </p>
          <Link href="/disc-test" className="btn-primary">
            Start DISC Test
          </Link>
        </div>

        <div className="text-center">
          <button
            onClick={() => setTestSelection('proprietary')}
            className="btn-secondary"
          >
            Back to Test Selection
          </button>
        </div>
      </div>
    )
  }

  // If manual input is selected, show simplified manual input
  if (testSelection === 'manual') {
    if (!manualType) {
      return (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Manual Input</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Do you already know your personality type? Great! Let's get that information from you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div 
              className="card cursor-pointer transition-all hover:shadow-md"
              onClick={() => handleManualTypeSelection('mbti')}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">MBTI Type</h3>
                <p className="text-gray-600 text-sm">
                  I know my Myers-Briggs Type Indicator
                </p>
              </div>
            </div>

            <div 
              className="card cursor-pointer transition-all hover:shadow-md"
              onClick={() => handleManualTypeSelection('disc')}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-secondary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">DISC Profile</h3>
                <p className="text-gray-600 text-sm">
                  I know my DISC personality profile
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setTestSelection('initial')}
              className="btn-secondary"
            >
              Back to Options
            </button>
          </div>
        </div>
      )
    }

    // MBTI Manual Input
    if (manualType === 'mbti') {
      return (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Your MBTI Type</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select your Myers-Briggs Type Indicator from the options below.
            </p>
          </div>

          <div className="card">
            <div className="grid grid-cols-4 gap-3">
              {mbtiTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleMbtiSelection(type)}
                  className={`p-3 rounded-lg border transition-colors ${
                    mbtiType === type
                      ? 'bg-primary-100 border-primary-500 text-primary-700'
                      : 'bg-white border-gray-300 hover:border-primary-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="text-center space-x-4">
            <button
              onClick={() => setManualType(null)}
              className="btn-secondary"
            >
              Back to Type Selection
            </button>
            {mbtiType && (
              <button
                onClick={() => setTestSelection('initial')}
                className="btn-primary"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      )
    }

    // DISC Manual Input
    if (manualType === 'disc') {
      return (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Your DISC Profile</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Rate yourself on each DISC dimension (0-100%).
            </p>
          </div>

          <div className="card space-y-6">
            {Object.entries(discProfile).map(([dimension, value]) => (
              <div key={dimension} className="space-y-2">
                <div className="flex justify-between">
                  <label className="font-medium capitalize">{dimension}</label>
                  <span className="text-sm text-gray-500">{value}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value}
                  onChange={(e) => handleDiscChange(dimension as keyof typeof discProfile, parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center space-x-4">
            <button
              onClick={() => setManualType(null)}
              className="btn-secondary"
            >
              Back to Type Selection
            </button>
            <button
              onClick={() => setTestSelection('initial')}
              className="btn-primary"
            >
              Continue
            </button>
          </div>
        </div>
      )
    }
  }

  // Initial selection screen
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Discover Your Personality Profile</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choose how you'd like to provide your personality data. You can take our assessments, 
          upload existing results, or manually input your known types.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Take Test */}
        <div 
          className={`card cursor-pointer transition-all ${
            data.testType === 'proprietary' ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:shadow-md'
          }`}
          onClick={() => handleTestSelection('proprietary')}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Take Our Test</h3>
            <p className="text-gray-600 text-sm">
              Complete MBTI or DISC assessment (10-20 minutes)
            </p>
          </div>
        </div>

        {/* Upload Results */}
        <div 
          className={`card cursor-pointer transition-all ${
            data.testType === 'upload' ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:shadow-md'
          }`}
          onClick={() => handleTestSelection('upload')}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-secondary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Upload Results</h3>
            <p className="text-gray-600 text-sm">
              Upload MBTI, DISC, Big 5, or other personality test results
            </p>
          </div>
        </div>

        {/* Manual Input */}
        <div 
          className={`card cursor-pointer transition-all ${
            data.testType === 'manual' ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:shadow-md'
          }`}
          onClick={() => handleTestSelection('manual')}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-accent-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">I Already Know</h3>
            <p className="text-gray-600 text-sm">
              I know my MBTI type or DISC profile
            </p>
          </div>
        </div>
      </div>

      {/* Upload File Input */}
      {testSelection === 'upload' && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Upload Your Results</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Drag and drop your personality test results file here, or click to browse
            </p>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => onChange('uploadedFile', e.target.files?.[0])}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="btn-secondary cursor-pointer">
              Choose File
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

// Goal Setting Step
function GoalStep({ 
  data, 
  onChange 
}: { 
  data: GoalInputForm
  onChange: (category: 'personalGoals' | 'professionalGoals', field: string, value: string) => void 
}) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Define Your Goals</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Share your personal and professional aspirations. This helps us create a 
          personalized growth strategy aligned with your objectives.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Personal Goals */}
        <div className="space-y-6">
          <div className="text-center">
            <Target className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Personal Goals</h3>
            <p className="text-gray-600">What do you want to achieve in your personal life?</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's your biggest personal challenge right now?
              </label>
              <textarea
                value={data.personalGoals.question1}
                onChange={(e) => onChange('personalGoals', 'question1', e.target.value)}
                placeholder="Describe the main obstacle you're facing..."
                className="input-field h-24"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What would success look like for you personally?
              </label>
              <textarea
                value={data.personalGoals.question2}
                onChange={(e) => onChange('personalGoals', 'question2', e.target.value)}
                placeholder="Describe your ideal personal outcome..."
                className="input-field h-24"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's your timeline for achieving this?
              </label>
              <textarea
                value={data.personalGoals.question3}
                onChange={(e) => onChange('personalGoals', 'question3', e.target.value)}
                placeholder="When do you want to achieve this by?"
                className="input-field h-24"
              />
            </div>
          </div>
        </div>

        {/* Professional Goals */}
        <div className="space-y-6">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-secondary-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Professional Goals</h3>
            <p className="text-gray-600">What do you want to achieve in your career?</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's your biggest professional challenge right now?
              </label>
              <textarea
                value={data.professionalGoals.question1}
                onChange={(e) => onChange('professionalGoals', 'question1', e.target.value)}
                placeholder="Describe the main obstacle in your career..."
                className="input-field h-24"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What would success look like for you professionally?
              </label>
              <textarea
                value={data.professionalGoals.question2}
                onChange={(e) => onChange('professionalGoals', 'question2', e.target.value)}
                placeholder="Describe your ideal professional outcome..."
                className="input-field h-24"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's your timeline for achieving this?
              </label>
              <textarea
                value={data.professionalGoals.question3}
                onChange={(e) => onChange('professionalGoals', 'question3', e.target.value)}
                placeholder="When do you want to achieve this by?"
                className="input-field h-24"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Review Step
function ReviewStep({ 
  personalityData, 
  goalData 
}: { 
  personalityData: PersonalityInputForm
  goalData: GoalInputForm 
}) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Review Your Information</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Please review your personality assessment method and goals before we generate your personalized report.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Personality Assessment Summary */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center">
            <Brain className="h-6 w-6 mr-2 text-primary-600" />
            Personality Assessment
          </h3>
          <div className="card">
            <div className="space-y-3">
              <div>
                <span className="font-medium">Method:</span>
                <span className="ml-2 capitalize">{personalityData.testType}</span>
              </div>
              {personalityData.testType === 'manual' && personalityData.manualTraits && (
                <div>
                  <span className="font-medium">Traits:</span>
                  <div className="mt-2 space-y-2">
                    {personalityData.manualTraits.map((trait, index) => (
                      <div key={index} className="text-sm">
                        {trait.name}: {trait.value}% ({trait.category})
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {personalityData.testType === 'upload' && personalityData.uploadedFile && (
                <div>
                  <span className="font-medium">File:</span>
                  <span className="ml-2">{personalityData.uploadedFile.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Goals Summary */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center">
            <Target className="h-6 w-6 mr-2 text-secondary-600" />
            Your Goals
          </h3>
          <div className="card">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-primary-600 mb-2">Personal Goals</h4>
                <div className="text-sm space-y-2">
                  <div><span className="font-medium">Challenge:</span> {goalData.personalGoals.question1}</div>
                  <div><span className="font-medium">Success:</span> {goalData.personalGoals.question2}</div>
                  <div><span className="font-medium">Timeline:</span> {goalData.personalGoals.question3}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-secondary-600 mb-2">Professional Goals</h4>
                <div className="text-sm space-y-2">
                  <div><span className="font-medium">Challenge:</span> {goalData.professionalGoals.question1}</div>
                  <div><span className="font-medium">Success:</span> {goalData.professionalGoals.question2}</div>
                  <div><span className="font-medium">Timeline:</span> {goalData.professionalGoals.question3}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-800 mb-2">What happens next?</h4>
        <ul className="text-blue-700 space-y-1 text-sm">
          <li>• We'll analyze your personality profile and goals</li>
          <li>• Generate personalized insights and recommendations</li>
          <li>• Create a downloadable PDF report with your action plan</li>
          <li>• Provide you with growth strategies tailored to your profile</li>
        </ul>
      </div>
    </div>
  )
} 
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Brain, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import { getDISCQuestions, saveDISCResponses, saveDISCResult } from '@/lib/supabase'

interface DISCQuestion {
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
}

export default function DiscTestPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<DISCQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [discResult, setDiscResult] = useState({
    dominance: 0,
    influence: 0,
    steadiness: 0,
    compliance: 0
  })

  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    try {
      const questionsData = await getDISCQuestions()
      console.log('Fetched DISC questions:', questionsData)
      const mappedQuestions = questionsData.map(q => ({
        id: q.id,
        question: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        trait_a: q.trait_a,
        trait_b: q.trait_b,
        trait_c: q.trait_c,
        trait_d: q.trait_d,
        question_order: q.question_number
      }))
      setQuestions(mappedQuestions)
    } catch (error) {
      console.error('Error loading DISC questions:', error)
      // Fallback to hardcoded questions if database fails
      setQuestions([
        {
          id: '1',
          question: 'When working on a team project, I prefer to:',
          option_a: 'Take charge and lead the group',
          option_b: 'Encourage and motivate others',
          option_c: 'Support and help maintain harmony',
          option_d: 'Ensure accuracy and follow procedures',
          trait_a: 'D',
          trait_b: 'I',
          trait_c: 'S',
          trait_d: 'C',
          question_order: 1
        },
        {
          id: '2',
          question: 'When faced with a challenge, I typically:',
          option_a: 'Confront it directly and decisively',
          option_b: 'Look for creative solutions',
          option_c: 'Seek consensus and cooperation',
          option_d: 'Analyze all options carefully',
          trait_a: 'D',
          trait_b: 'I',
          trait_c: 'S',
          trait_d: 'C',
          question_order: 2
        },
        {
          id: '3',
          question: 'In social situations, I usually:',
          option_a: 'Take control of the conversation',
          option_b: 'Energize and entertain others',
          option_c: 'Listen and provide support',
          option_d: 'Observe and gather information',
          trait_a: 'D',
          trait_b: 'I',
          trait_c: 'S',
          trait_d: 'C',
          question_order: 3
        },
        {
          id: '4',
          question: 'When making decisions, I rely on:',
          option_a: 'Quick action and results',
          option_b: 'Intuition and possibilities',
          option_c: 'Team input and relationships',
          option_d: 'Data and logical analysis',
          trait_a: 'D',
          trait_b: 'I',
          trait_c: 'S',
          trait_d: 'C',
          question_order: 4
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      calculateDiscProfile()
    }
  }

  const calculateDiscProfile = () => {
    const counts = { D: 0, I: 0, S: 0, C: 0 }
    Object.values(answers).forEach(answer => {
      if (answer in counts) counts[answer as keyof typeof counts]++
    })
    
    // Convert to percentages
    const result = {
      dominance: (counts.D / questions.length) * 100,
      influence: (counts.I / questions.length) * 100,
      steadiness: (counts.S / questions.length) * 100,
      compliance: (counts.C / questions.length) * 100
    }
    
    setDiscResult(result)
    setIsCompleted(true)
  }

  const handleComplete = async () => {
    try {
      // Get user ID from localStorage or context
      const userId = localStorage.getItem('userId') || 'temp-user'
      
      // Save responses to database
      const responses = Object.entries(answers).map(([questionId, selectedTrait]) => ({
        question_id: questionId,
        selected_trait: selectedTrait
      }))
      
      await saveDISCResponses({ userId, responses })
      
      // Determine DISC type based on highest score
      const scores = [
        { trait: 'D', score: discResult.dominance },
        { trait: 'I', score: discResult.influence },
        { trait: 'S', score: discResult.steadiness },
        { trait: 'C', score: discResult.compliance }
      ]
      const primaryTrait = scores.reduce((a, b) => a.score > b.score ? a : b).trait
      
      // Save result to database
      await saveDISCResult({
        userId,
        result: {
          ...discResult,
          disc_type: primaryTrait
        }
      })
      
      // Store in localStorage for onboarding flow
      localStorage.setItem('discResult', JSON.stringify(discResult))
      router.push('/onboarding?step=1&disc=' + JSON.stringify(discResult))
    } catch (error) {
      console.error('Error saving DISC results:', error)
      // Fallback to localStorage only
      localStorage.setItem('discResult', JSON.stringify(discResult))
      router.push('/onboarding?step=1&disc=' + JSON.stringify(discResult))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600">Loading DISC assessment...</p>
        </div>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <header className="px-6 py-4 border-b bg-white/80 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href="/onboarding" className="flex items-center space-x-2 text-gray-600 hover:text-primary-600">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Onboarding</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold gradient-text">Mind Map Pro</span>
            </div>
          </div>
        </header>

        <div className="px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="card text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Test Complete!</h1>
              <p className="text-xl text-gray-600 mb-6">Your DISC Profile:</p>
              
              <div className="space-y-4 mb-8">
                {Object.entries(discResult).map(([dimension, value]) => (
                  <div key={dimension} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium capitalize">{dimension}</span>
                      <span className="text-sm text-gray-500">{Math.round(value)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={handleComplete} className="btn-primary">
                Continue to Goals
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  const options = [
    { text: currentQ.option_a, value: currentQ.trait_a },
    { text: currentQ.option_b, value: currentQ.trait_b },
    { text: currentQ.option_c, value: currentQ.trait_c },
    { text: currentQ.option_d, value: currentQ.trait_d }
  ]

  console.log('currentQ.id:', currentQ.id, 'answers:', answers);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <header className="px-6 py-4 border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/onboarding" className="flex items-center space-x-2 text-gray-600 hover:text-primary-600">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Onboarding</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold gradient-text">Mind Map Pro</span>
          </div>
        </div>
      </header>

      <div className="px-6 py-4 bg-white border-b">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">{currentQ.question}</h2>
              <p className="text-gray-600">Select the option that best describes you:</p>
            </div>

            <div className="space-y-4 mb-8">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(currentQ.id, option.value)}
                  className={`w-full p-4 text-left rounded-lg border transition-all ${
                    answers[currentQ.id] === option.value
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'bg-white border-gray-300 hover:border-primary-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQ.id] === option.value
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300'
                    }`}>
                      {answers[currentQ.id] === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="font-medium">{option.text}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleNext}
                disabled={!answers[currentQ.id]}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentQuestion === questions.length - 1 ? 'Complete Test' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
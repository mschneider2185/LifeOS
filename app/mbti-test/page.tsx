"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Brain, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle,
  Clock
} from 'lucide-react';
import { getMBTIQuestions, saveMBTIResponses, saveMBTIResult } from '@/lib/supabase';

export default function MbtiTestPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [mbtiResult, setMbtiResult] = useState('');
  const [userId, setUserId] = useState<string>('demo-user'); // Replace with real user ID from auth

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      try {
        const data = await getMBTIQuestions();
        setQuestions(data);
      } catch (error) {
        alert('Failed to load questions.');
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateMbtiType();
    }
  };

  const calculateMbtiType = async () => {
    // Count answers for each trait
    const counts = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    Object.values(answers).forEach(answer => {
      if (answer in counts) counts[answer as keyof typeof counts]++;
    });
    const type = [
      counts.E > counts.I ? 'E' : 'I',
      counts.S > counts.N ? 'S' : 'N',
      counts.T > counts.F ? 'T' : 'F',
      counts.J > counts.P ? 'J' : 'P'
    ].join('');
    setMbtiResult(type);
    setIsCompleted(true);
    // Save responses to Supabase
    try {
      await saveMBTIResponses({
        userId,
        responses: questions.map(q => ({
          question_id: q.id,
          selected_trait: answers[q.id]
        }))
      });
      await saveMBTIResult({
        userId,
        result: {
          e: counts.E, i: counts.I, s: counts.S, n: counts.N, t: counts.T, f: counts.F, j: counts.J, p: counts.P, mbti_type: type
        }
      });
    } catch (error) {
      // Optionally show error
    }
  };

  const handleComplete = () => {
    localStorage.setItem('mbtiResult', mbtiResult);
    router.push('/onboarding?step=1&mbti=' + mbtiResult);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading MBTI Questions...</h2>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No questions found.</h2>
        </div>
      </div>
    );
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
              <span className="text-2xl font-bold gradient-text">LifeOS</span>
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
              <p className="text-xl text-gray-600 mb-8">
                Your MBTI Type: <span className="font-bold text-primary-600">{mbtiResult}</span>
              </p>
              <button onClick={handleComplete} className="btn-primary">
                Continue to Goals
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

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
            <span className="text-2xl font-bold gradient-text">LifeOS</span>
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
              <h2 className="text-2xl font-bold mb-4">{currentQ.question_text}</h2>
              <p className="text-gray-600">Select the option that best describes you:</p>
            </div>
            <div className="space-y-4 mb-8">
              <button
                onClick={() => handleAnswer(currentQ.id, currentQ.a_trait)}
                className={`w-full p-4 text-left rounded-lg border transition-all ${
                  answers[currentQ.id] === currentQ.a_trait
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'bg-white border-gray-300 hover:border-primary-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    answers[currentQ.id] === currentQ.a_trait
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQ.id] === currentQ.a_trait && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="font-medium">{currentQ.option_a}</span>
                </div>
              </button>
              <button
                onClick={() => handleAnswer(currentQ.id, currentQ.b_trait)}
                className={`w-full p-4 text-left rounded-lg border transition-all ${
                  answers[currentQ.id] === currentQ.b_trait
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'bg-white border-gray-300 hover:border-primary-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    answers[currentQ.id] === currentQ.b_trait
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQ.id] === currentQ.b_trait && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="font-medium">{currentQ.option_b}</span>
                </div>
              </button>
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
  );
} 
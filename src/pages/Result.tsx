import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

interface AttemptData {
  score: number
  total_questions: number
  correct_count: number
  wrong_count: number
  unanswered_count: number
  percentage: number
  time_taken: number
  quiz_id: string
  quiz: { title: string }
  user_answers: {
    question: { text: string; explanation: string }
    selected_option: { text: string; letter: string }
    is_correct: boolean
  }[]
}

export default function Result() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const [data, setData] = useState<AttemptData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResult = async () => {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select(`
          score,
          total_questions,
          correct_count,
          wrong_count,
          unanswered_count,
          percentage,
          time_taken,
          quiz_id,
          quiz:quizzes(title),
          user_answers (
            is_correct,
            question:questions(text, explanation),
            selected_option:options(text, letter)
          )
        `)
        .eq('id', attemptId)
        .single()

      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      // Fix nested array issues with safe fallbacks
      const fixedData = {
        ...data,
        quiz: data.quiz && data.quiz[0] ? data.quiz[0] : { title: 'Unknown Quiz' },
        user_answers: data.user_answers?.map((ua: any) => ({
          ...ua,
          question: ua.question && ua.question[0] ? ua.question[0] : { text: 'Unknown Question', explanation: '' },
          selected_option: ua.selected_option && ua.selected_option[0] ? ua.selected_option[0] : { text: 'Not answered', letter: '?' }
        }))
      }
      setData(fixedData)
      setLoading(false)
    }
    fetchResult()
  }, [attemptId])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading results...</div>
  }

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center">Result not found.</div>
  }

  const isPass = data.percentage >= 40
  const minutes = Math.floor(data.time_taken / 60)
  const seconds = data.time_taken % 60
  const timeDisplay = `${minutes}:${String(seconds).padStart(2, '0')}`

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Quiz Results</h1>
        <p className="text-gray-500 mb-6">{data.quiz.title}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">{data.score} / {data.total_questions}</p>
            <p className="text-sm text-gray-500">Score</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">{data.percentage}%</p>
            <p className="text-sm text-gray-500">Percentage</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-600">{data.correct_count}</p>
            <p className="text-sm text-gray-500">Correct</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-600">{data.wrong_count}</p>
            <p className="text-sm text-gray-500">Wrong</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-indigo-600">{timeDisplay}</p>
            <p className="text-sm text-gray-500">Time Taken</p>
          </div>
        </div>

        <div className={`p-4 rounded-lg mb-6 ${isPass ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {isPass ? '🎉 Good job! You passed this quiz.' : '📚 Keep practicing. Your next attempt can be better.'}
        </div>

        <h2 className="text-xl font-semibold mb-4">Review Answers</h2>
        <div className="space-y-4">
          {data.user_answers && data.user_answers.length > 0 ? (
            data.user_answers.map((ans, idx) => (
              <div key={idx} className={`border-l-4 p-4 rounded ${ans.is_correct ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                <p className="font-medium">{idx+1}. {ans.question.text}</p>
                <p className="text-sm">Your answer: {ans.selected_option?.letter || 'None'} - {ans.selected_option?.text || 'Not answered'}</p>
                {!ans.is_correct && ans.question.explanation && (
                  <p className="text-sm text-gray-600 mt-1">Explanation: {ans.question.explanation}</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No answers recorded.</p>
          )}
        </div>

        <div className="mt-6 flex gap-4">
          <Link to={`/quiz/${data.quiz_id}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Retry Quiz</Link>
          <Link to="/" className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
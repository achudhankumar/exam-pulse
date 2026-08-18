import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

interface Option {
  id: string
  text: string
  letter: string
  is_correct: boolean
}

interface Question {
  id: string
  text: string
  explanation?: string
  options: Option[]
}

export default function Quiz() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [quizTitle, setQuizTitle] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)
  const [startTime] = useState(Date.now())

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      // 1. Fetch quiz details
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('title, time_limit')
        .eq('id', id)
        .single()

      console.log('Quiz data:', quizData)
      console.log('Quiz error:', quizError)

      if (quizData) {
        setQuizTitle(quizData.title)
        const timeLimit = quizData.time_limit || 10
        setTimeLeft(timeLimit * 60)
      }

      // 2. Fetch questions (without nested options first)
      const { data: questionsData, error: qError } = await supabase
        .from('questions')
        .select('id, text, explanation')
        .eq('quiz_id', id)
        .order('order_index')

      console.log('Questions (simple):', questionsData)
      console.log('Questions error:', qError)

      if (qError) {
        console.error('Error fetching questions:', qError)
        setLoading(false)
        return
      }

      if (questionsData && questionsData.length > 0) {
        // 3. For each question, fetch its options separately
        const questionsWithOptions = await Promise.all(
          questionsData.map(async (q) => {
            const { data: optionsData, error: optError } = await supabase
              .from('options')
              .select('id, text, letter, is_correct')
              .eq('question_id', q.id)

            if (optError) {
              console.error('Error fetching options for question', q.id, optError)
            }
            return { ...q, options: optionsData || [] }
          })
        )
        console.log('Questions with options:', questionsWithOptions)
        setQuestions(questionsWithOptions)
      } else {
        console.log('No questions found for this quiz.')
      }
      setLoading(false)
    }

    fetchQuiz()
  }, [id])

  // Timer
  useEffect(() => {
    if (loading || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [loading, timeLeft])

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setSelectedOptions((prev) => ({ ...prev, [questionId]: optionId }))
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    // Calculate results
    let correct = 0,
      wrong = 0,
      unanswered = 0
    const userAnswers: { questionId: string; optionId: string | null; isCorrect: boolean }[] = []

    questions.forEach((q) => {
      const selected = selectedOptions[q.id]
      if (!selected) {
        unanswered++
        userAnswers.push({ questionId: q.id, optionId: null, isCorrect: false })
        return
      }
      const option = q.options.find((o) => o.id === selected)
      const isCorrect = option?.is_correct || false
      if (isCorrect) correct++
      else wrong++
      userAnswers.push({ questionId: q.id, optionId: selected, isCorrect })
    })

    const total = questions.length
    const percentage = Math.round((correct / total) * 100)
    const timeTaken = Math.floor((Date.now() - startTime) / 1000)

    // Save attempt to database
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('You must be logged in.')
      return
    }

    // Insert quiz attempt
    const { data: attempt, error } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: user.id,
        quiz_id: id,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date().toISOString(),
        score: correct,
        total_questions: total,
        correct_count: correct,
        wrong_count: wrong,
        unanswered_count: unanswered,
        percentage: percentage,
        time_taken: timeTaken,
        status: 'completed',
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error saving attempt:', error)
      alert('Failed to save quiz attempt.')
      return
    }

    // Save user answers
    const answersToInsert = userAnswers.map((ua) => ({
      attempt_id: attempt.id,
      question_id: ua.questionId,
      selected_option_id: ua.optionId,
      is_correct: ua.isCorrect,
    }))

    await supabase.from('user_answers').insert(answersToInsert)

    // Navigate to results page
    navigate(`/result/${attempt.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-600">No questions found for this quiz.</p>
          <p className="text-sm text-gray-400 mt-2">Please check the quiz ID or add questions.</p>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{quizTitle}</h1>
          <div className="text-lg font-semibold text-red-600">
            ⏱️ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        <div className="mb-4">
          <span className="text-sm text-gray-500">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>

        <div className="mb-6">
          <p className="text-lg font-medium text-gray-800">{currentQuestion.text}</p>
        </div>

        <div className="space-y-3">
          {currentQuestion.options.map((option) => (
            <label
              key={option.id}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                selectedOptions[currentQuestion.id] === option.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                value={option.id}
                checked={selectedOptions[currentQuestion.id] === option.id}
                onChange={() => handleOptionSelect(currentQuestion.id, option.id)}
                className="mr-3"
              />
              <span className="text-gray-700">
                {option.letter}. {option.text}
              </span>
            </label>
          ))}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
          >
            Previous
          </button>
          {currentIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
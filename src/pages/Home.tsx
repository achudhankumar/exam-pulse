import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Calendar, Users, BookOpen, Award, ArrowRight, Zap, TrendingUp, Clock } from 'lucide-react'

interface Quiz {
  id: string
  title: string
  description: string
  category_id: string
  difficulty: string
  time_limit: number
  questions_count: number
  status: string
  is_daily: boolean
  created_at: string
}

export default function Home() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalQuestions: '0',
    totalQuizzes: '0',
    totalUsers: '0',
    totalAttempts: '0'
  })

  // Fetch user session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
  }, [])

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch published quizzes
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false })

        if (quizError) console.error('Quiz fetch error:', quizError)
        if (quizData) {
          setQuizzes(quizData)
          setStats(prev => ({ ...prev, totalQuizzes: String(quizData.length) }))
        }

        // 2. Fetch total questions count
        const { count: qCount } = await supabase
          .from('questions')
          .select('*', { count: 'exact', head: true })
        if (qCount !== null) {
          setStats(prev => ({ ...prev, totalQuestions: String(qCount) }))
        }

        // 3. Fetch total users (profiles)
        const { count: uCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
        if (uCount !== null) {
          setStats(prev => ({ ...prev, totalUsers: String(uCount) }))
        }

        // 4. Fetch total attempts
        const { count: aCount } = await supabase
          .from('quiz_attempts')
          .select('*', { count: 'exact', head: true })
        if (aCount !== null) {
          setStats(prev => ({ ...prev, totalAttempts: String(aCount) }))
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const statCards = [
    { label: 'Total Questions', value: stats.totalQuestions, icon: BookOpen },
    { label: 'Total Quizzes', value: stats.totalQuizzes, icon: Calendar },
    { label: 'Registered Users', value: stats.totalUsers, icon: Users },
    { label: 'Questions Attempted', value: stats.totalAttempts, icon: Award },
  ]

  const todayQuiz = quizzes.length > 0 ? quizzes[0] : null
  const otherQuizzes = quizzes.length > 1 ? quizzes.slice(1, 4) : []

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Daily Updates Bar */}
      <section className="py-3 bg-blue-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">NEW</span>
            <span className="text-gray-700">
              📚 <strong>{quizzes.length}</strong> quizzes available
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-700">
              🏆 <strong>{stats.totalAttempts}</strong> attempts recorded
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-700">
              👥 <strong>{stats.totalUsers}</strong> users registered
            </span>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Test Your Knowledge.<br />
              <span className="text-blue-600">Track Your Progress.</span>
              <br />
              Prepare Smarter.
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Ace your competitive exams with daily quizzes, current affairs, mock tests, and more – all for free.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              {todayQuiz && (
                <Link
                  to={`/quiz/${todayQuiz.id}`}
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
                >
                  Start Today's Quiz
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              )}
              <Link
                to="/categories"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-gray-50 transition"
              >
                Explore Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {statCards.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
                  <Icon className="h-8 w-8 text-blue-500 mx-auto" />
                  <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* User Progress (only when logged in) */}
      {user && (
        <section className="py-8 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🏆 Your Progress</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl text-center">
                <p className="text-2xl font-bold text-yellow-600">🔥</p>
                <p className="text-sm font-medium">5 Day Streak</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center">
                <p className="text-2xl font-bold text-blue-600">🎯</p>
                <p className="text-sm font-medium">12 Quizzes</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center">
                <p className="text-2xl font-bold text-green-600">⭐</p>
                <p className="text-sm font-medium">78% Avg</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center">
                <p className="text-2xl font-bold text-purple-600">📚</p>
                <p className="text-sm font-medium">85 Questions</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Today's Quiz & Trending */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Today's Quiz Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
              <div className="flex items-center gap-2 text-blue-600">
                <Zap className="h-5 w-5" />
                <span className="font-semibold">Today's Quiz</span>
              </div>
              {todayQuiz ? (
                <>
                  <h3 className="text-xl font-bold mt-2">{todayQuiz.title}</h3>
                  <p className="text-gray-500 mt-1">{todayQuiz.questions_count || 0} questions • {todayQuiz.time_limit || 5} minutes</p>
                  <Link
                    to={`/quiz/${todayQuiz.id}`}
                    className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                  >
                    Take Quiz →
                  </Link>
                </>
              ) : (
                <p className="text-gray-500 mt-2">No quizzes available yet.</p>
              )}
            </div>

            {/* Trending Quizzes */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 text-orange-500">
                <TrendingUp className="h-5 w-5" />
                <span className="font-semibold">Trending Quizzes</span>
              </div>
              {otherQuizzes.length > 0 ? (
                <ul className="mt-2 space-y-3">
                  {otherQuizzes.map((quiz) => (
                    <li key={quiz.id} className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <div>
                        <p className="font-medium text-gray-800">{quiz.title}</p>
                        <p className="text-xs text-gray-400">{quiz.difficulty || 'Medium'} • {quiz.questions_count || 0} Qs • {quiz.time_limit || 5} min</p>
                      </div>
                      <Link
                        to={`/quiz/${quiz.id}`}
                        className="text-blue-600 text-sm font-medium hover:underline"
                      >
                        Start
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 mt-2">No other quizzes available.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Current Affairs (Placeholder) */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">📰 Latest Current Affairs</h2>
            <Link to="/current-affairs" className="text-blue-600 hover:underline text-sm">View all →</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Aug 19, 2026</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Science</span>
              </div>
              <h4 className="font-semibold text-gray-800 mt-2">India launches new space mission</h4>
              <Link to="/current-affairs/1" className="text-blue-600 text-sm hover:underline mt-2 inline-block">Read more →</Link>
            </div>
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Aug 18, 2026</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Tamil Nadu</span>
              </div>
              <h4 className="font-semibold text-gray-800 mt-2">Tamil Nadu budget highlights</h4>
              <Link to="/current-affairs/2" className="text-blue-600 text-sm hover:underline mt-2 inline-block">Read more →</Link>
            </div>
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Aug 17, 2026</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">International</span>
              </div>
              <h4 className="font-semibold text-gray-800 mt-2">International climate summit begins</h4>
              <Link to="/current-affairs/3" className="text-blue-600 text-sm hover:underline mt-2 inline-block">Read more →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Top Performers (Placeholder) */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">🏆 Top Performers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-xl font-bold text-yellow-500">⭐</p>
              <p className="font-semibold">User1</p>
              <p className="text-sm text-gray-500">92% avg</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-xl font-bold text-gray-400">⭐</p>
              <p className="font-semibold">User2</p>
              <p className="text-sm text-gray-500">88% avg</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-xl font-bold text-amber-700">⭐</p>
              <p className="font-semibold">User3</p>
              <p className="text-sm text-gray-500">85% avg</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-xl font-bold text-blue-400">⭐</p>
              <p className="font-semibold">User4</p>
              <p className="text-sm text-gray-500">82% avg</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
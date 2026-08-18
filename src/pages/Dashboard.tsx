import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { BookOpen, Award, Target, Flame, Clock, TrendingUp } from 'lucide-react'

interface UserStats {
  totalQuizzes: number
  avgScore: number
  accuracy: number
  streak: number
  rank: number
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<UserStats>({
    totalQuizzes: 0,
    avgScore: 0,
    accuracy: 0,
    streak: 0,
    rank: 0,
  })
  const navigate = useNavigate()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }
      setUser(user)
      
      // TODO: Fetch real stats from database
      // For now, using sample data
      setStats({
        totalQuizzes: 12,
        avgScore: 74,
        accuracy: 68,
        streak: 5,
        rank: 42,
      })
      setLoading(false)
    }
    getUser()
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    { label: 'Quizzes Completed', value: stats.totalQuizzes, icon: BookOpen, color: 'text-blue-600' },
    { label: 'Average Score', value: `${stats.avgScore}%`, icon: Target, color: 'text-green-600' },
    { label: 'Accuracy', value: `${stats.accuracy}%`, icon: Award, color: 'text-purple-600' },
    { label: 'Day Streak', value: stats.streak, icon: Flame, color: 'text-orange-500' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's your learning progress summary.</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Rank: #{stats.rank}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gray-50 ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Activity & Performance */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Quiz Attempts */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              Recent Attempts
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <div>
                  <p className="font-medium text-gray-700">Daily Current Affairs</p>
                  <p className="text-xs text-gray-400">Aug 18, 2026</p>
                </div>
                <span className="text-green-600 font-semibold text-sm">8/10</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <div>
                  <p className="font-medium text-gray-700">GK Mock Test</p>
                  <p className="text-xs text-gray-400">Aug 17, 2026</p>
                </div>
                <span className="text-green-600 font-semibold text-sm">18/25</span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-700">Indian Polity</p>
                  <p className="text-xs text-gray-400">Aug 16, 2026</p>
                </div>
                <span className="text-yellow-600 font-semibold text-sm">11/15</span>
              </div>
            </div>
          </div>

          {/* Performance by Category */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-500" />
              Category Performance
            </h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">General Knowledge</span>
                  <span className="font-medium">78%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Affairs</span>
                  <span className="font-medium">82%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Indian Polity</span>
                  <span className="font-medium">65%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition text-sm font-medium">
            Take Daily Quiz
          </button>
          <button className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
            Practice Questions
          </button>
          <button className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition text-sm font-medium">
            Mock Tests
          </button>
          <button className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition text-sm font-medium">
            View Leaderboard
          </button>
        </div>
      </div>
    </div>
  )
}
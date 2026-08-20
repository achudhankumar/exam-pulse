import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { Users, BookOpen, Award, Edit, PlusCircle, BarChart, FileText, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuizzes: 0,
    totalQuestions: 0,
    totalAttempts: 0,
    totalCategories: 0,
  })
  const navigate = useNavigate()

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }
      setUser(user)

      // Check if user has admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        navigate('/dashboard')
        return
      }
      setIsAdmin(true)

      // Fetch stats
      const [
        { count: usersCount },
        { count: quizzesCount },
        { count: questionsCount },
        { count: attemptsCount },
        { count: categoriesCount },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('quizzes').select('*', { count: 'exact', head: true }),
        supabase.from('questions').select('*', { count: 'exact', head: true }),
        supabase.from('quiz_attempts').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
      ])

      setStats({
        totalUsers: usersCount || 0,
        totalQuizzes: quizzesCount || 0,
        totalQuestions: questionsCount || 0,
        totalAttempts: attemptsCount || 0,
        totalCategories: categoriesCount || 0,
      })

      setLoading(false)
    }
    checkAdmin()
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAdmin) return null

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Total Quizzes', value: stats.totalQuizzes, icon: BookOpen, color: 'bg-green-100 text-green-600' },
    { label: 'Total Questions', value: stats.totalQuestions, icon: Award, color: 'bg-purple-100 text-purple-600' },
    { label: 'Total Attempts', value: stats.totalAttempts, icon: TrendingUp, color: 'bg-orange-100 text-orange-600' },
    { label: 'Categories', value: stats.totalCategories, icon: FileText, color: 'bg-indigo-100 text-indigo-600' },
  ]

  const actions = [
    { label: 'Manage Categories', path: '/admin/categories', icon: Edit, color: 'bg-blue-50 text-blue-600' },
    { label: 'Create Quiz', path: '/admin/quiz/new', icon: PlusCircle, color: 'bg-green-50 text-green-600' },
    { label: 'Manage Quizzes', path: '/admin/quizzes', icon: BookOpen, color: 'bg-purple-50 text-purple-600' },
    { label: 'Manage Questions', path: '/admin/quiz/:id/questions', icon: BarChart, color: 'bg-orange-50 text-orange-600' },
    { label: 'Current Affairs', path: '/admin/current-affairs', icon: FileText, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'View Analytics', path: '/admin/analytics', icon: TrendingUp, color: 'bg-red-50 text-red-600' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-500">Manage your quiz platform.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Welcome, {user?.email}</span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-sm text-red-600 hover:underline"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {actions.map((action, idx) => {
            const Icon = action.icon
            return (
              <Link
                key={idx}
                to={action.path}
                className={`bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition flex items-center gap-3 ${action.color}`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium text-gray-700">{action.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <div>
                <p className="text-sm text-gray-700">New user registered: <span className="font-medium">John Doe</span></p>
                <p className="text-xs text-gray-400">2 hours ago</p>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">New</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <div>
                <p className="text-sm text-gray-700">Quiz attempt: <span className="font-medium">English Quiz</span> by User2</p>
                <p className="text-xs text-gray-400">5 hours ago</p>
              </div>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Attempt</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-700">New quiz created: <span className="font-medium">GK Mock Test</span></p>
                <p className="text-xs text-gray-400">Yesterday</p>
              </div>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Quiz</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
import { Link } from 'react-router-dom'
import { Calendar, Users, BookOpen, Award, ArrowRight, Zap, TrendingUp, Clock } from 'lucide-react'

export default function Home() {
  // Sample stats
  const stats = [
    { label: 'Total Questions', value: '2,500+', icon: BookOpen },
    { label: 'Total Quizzes', value: '120+', icon: Calendar },
    { label: 'Registered Users', value: '4,800+', icon: Users },
    { label: 'Questions Attempted', value: '85,000+', icon: Award },
  ]

  // Sample featured quizzes
  const featuredQuizzes = [
    { id: 1, title: 'Daily Current Affairs', category: 'Current Affairs', questions: 10, time: '5 min' },
    { id: 2, title: 'General Knowledge Mock Test', category: 'General Knowledge', questions: 25, time: '15 min' },
    { id: 3, title: 'Indian Polity Quiz', category: 'Polity', questions: 15, time: '8 min' },
  ]

  // Sample current affairs
  const currentAffairs = [
    { id: 1, title: 'India launches new space mission', date: 'Aug 18, 2026', category: 'Science' },
    { id: 2, title: 'Tamil Nadu budget highlights', date: 'Aug 17, 2026', category: 'Tamil Nadu' },
    { id: 3, title: 'International climate summit begins', date: 'Aug 16, 2026', category: 'International' },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
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
              <Link
                to="/daily-quiz"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
              >
                Start Today's Quiz
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/current-affairs"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-gray-50 transition"
              >
                Explore Current Affairs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, index) => {
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
              <h3 className="text-xl font-bold mt-2">Daily Current Affairs – Aug 18</h3>
              <p className="text-gray-500 mt-1">10 questions • 5 minutes</p>
              <Link
                to="/quiz/1"
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Take Quiz →
              </Link>
            </div>

            {/* Trending Quizzes */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 text-orange-500">
                <TrendingUp className="h-5 w-5" />
                <span className="font-semibold">Trending Quizzes</span>
              </div>
              <ul className="mt-2 space-y-3">
                {featuredQuizzes.map((quiz) => (
                  <li key={quiz.id} className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <div>
                      <p className="font-medium text-gray-800">{quiz.title}</p>
                      <p className="text-xs text-gray-400">{quiz.category} • {quiz.questions} Qs • {quiz.time}</p>
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
            </div>
          </div>
        </div>
      </section>

      {/* Latest Current Affairs */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Latest Current Affairs</h2>
            <Link to="/current-affairs" className="text-blue-600 hover:underline text-sm">View all →</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {currentAffairs.map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-5 border border-gray-100 hover:shadow-md transition">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>{item.date}</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{item.category}</span>
                </div>
                <h4 className="font-semibold text-gray-800 mt-2">{item.title}</h4>
                <Link to={`/current-affairs/${item.id}`} className="text-blue-600 text-sm hover:underline mt-2 inline-block">
                  Read more →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Performers */}
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
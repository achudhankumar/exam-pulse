import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

interface LeaderboardEntry {
  username: string
  avg_score: number
  total_quizzes: number
  rank: number
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select(`
          user_id,
          profiles (username),
          percentage
        `)
        .eq('status', 'completed')

      if (error) {
        console.error('Error fetching attempts:', error)
        setLoading(false)
        return
      }

      const userScores: Record<string, { total: number, count: number, username: string }> = {}
      data.forEach((attempt: any) => {
        const uid = attempt.user_id
        if (!userScores[uid]) {
          userScores[uid] = {
            total: 0,
            count: 0,
            username: attempt.profiles?.username || 'Anonymous'
          }
        }
        userScores[uid].total += attempt.percentage
        userScores[uid].count += 1
      })

      const leaderboard = Object.entries(userScores).map(([userId, stats]) => ({
        username: stats.username,
        avg_score: Math.round(stats.total / stats.count),
        total_quizzes: stats.count,
      }))
      leaderboard.sort((a, b) => b.avg_score - a.avg_score)
      const ranked = leaderboard.map((entry, idx) => ({ ...entry, rank: idx + 1 }))

      setEntries(ranked)
      setLoading(false)
    }

    fetchLeaderboard()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">🏆 Leaderboard</h1>
        {entries.length === 0 ? (
          <p className="text-center text-gray-500">No quiz attempts yet. Be the first!</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Rank</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">User</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">Avg Score</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">Quizzes</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.rank} className="border-t border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">
                      {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">{entry.username}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600">{entry.avg_score}%</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-500">{entry.total_quizzes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
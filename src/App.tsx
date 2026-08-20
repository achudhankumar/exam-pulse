import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import Quiz from './pages/Quiz'
import Result from './pages/Result'
import Leaderboard from './pages/Leaderboard'
import Categories from './pages/Categories'
import CategoryDetail from './pages/CategoryDetail'
import ManageQuizzes from './pages/admin/ManageQuizzes'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageQuizzes from './pages/admin/ManageQuizzes'
import ManageCategories from './pages/admin/ManageCategories'
import ManageQuestions from './pages/admin/ManageQuestions'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/quiz/:id" element={<Quiz />} />
            <Route path="/result/:attemptId" element={<Result />} />
	    <Route path="/leaderboard" element={<Leaderboard />} />
	    <Route path="/categories" element={<Categories />} />
	    <Route path="/category/:slug" element={<CategoryDetail />} />
	    <Route path="/admin/quizzes" element={<ManageQuizzes />} />
	    <Route path="/admin" element={<AdminDashboard />} />
	    <Route path="/admin" element={<AdminDashboard />} />
	    <Route path="/admin/quizzes" element={<ManageQuizzes />} />
	    <Route path="/admin/categories" element={<ManageCategories />} />
	    <Route path="/admin/quiz/:quizId/questions" element={<ManageQuestions />} />

          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App


<Route path="/categories" element={<Categories />} />
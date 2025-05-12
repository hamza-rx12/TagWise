import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
// import Test from './test'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Verification from './pages/Verification'
import AnnotatorHome from './pages/AnnotatorHome'
import AdminHome from './pages/AdminHome'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import Unauthorized from './pages/Unauthorized'

function App() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify" element={<Verification />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/annotator" element={
              <ProtectedRoute allowedRoles={["ROLE_USER"]}>
                <AnnotatorHome />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
                <AdminHome />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  )
}

export default App

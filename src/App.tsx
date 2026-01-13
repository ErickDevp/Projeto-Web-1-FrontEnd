import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Register from './pages/Register'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Home from './pages/Home'
import ProtectedRoute from './routes/ProtectedRoute'

function App() {
  return (
    <>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>

      <ToastContainer autoClose={3000} />
    </>
  );
}

export default App;
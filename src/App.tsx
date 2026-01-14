import { Routes, Route, Navigate, useLocation, useNavigate, type Location } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Register from './pages/Register'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Home from './pages/Home'
import Modal from './components/ui/Modal'
import Terms from './pages/Legal/Terms'
import Privacy from './pages/Legal/Privacy'

type LocationState = {
  backgroundLocation?: Location
}

type LegalModalState = {
  backgroundLocation?: Location
  returnTo?: string
  draft?: unknown
  acceptedTerms?: boolean
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState | null
  const backgroundLocation = state?.backgroundLocation

  const closeModalToHome = () => {
    if (backgroundLocation) {
      const to = `${backgroundLocation.pathname}${backgroundLocation.search}${backgroundLocation.hash}`
      navigate(to, { replace: true })
      return
    }
    navigate('/', { replace: true })
  }

  const closeLegalModal = () => {
    const legalState = (location.state as LegalModalState | null) ?? null

    if (legalState?.returnTo) {
      const keepBackground =
        !!legalState.backgroundLocation && legalState.backgroundLocation.pathname !== legalState.returnTo

      navigate(legalState.returnTo, {
        replace: true,
        state: {
          ...(keepBackground ? { backgroundLocation: legalState.backgroundLocation } : {}),
          draft: legalState.draft,
          acceptedTerms: legalState.acceptedTerms,
        },
      })
      return
    }

    closeModalToHome()
  }

  return (
    <>
      <Routes location={backgroundLocation ?? location}>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {backgroundLocation && (
        <Routes>
          <Route
            path="/terms"
            element={
              <Modal onClose={closeLegalModal}>
                <Terms embedded />
              </Modal>
            }
          />
          <Route
            path="/privacy"
            element={
              <Modal onClose={closeLegalModal}>
                <Privacy embedded />
              </Modal>
            }
          />
          <Route
            path="/login"
            element={
              <Modal onClose={closeModalToHome}>
                <Login embedded />
              </Modal>
            }
          />
          <Route
            path="/register"
            element={
              <Modal onClose={closeModalToHome}>
                <Register embedded />
              </Modal>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <Modal onClose={closeModalToHome}>
                <ForgotPassword embedded />
              </Modal>
            }
          />
          <Route
            path="/reset-password"
            element={
              <Modal onClose={closeModalToHome}>
                <ResetPassword embedded />
              </Modal>
            }
          />
        </Routes>
      )}

      <ToastContainer
        position="top-right"
        theme="colored"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />
    </>
  )
}

export default App
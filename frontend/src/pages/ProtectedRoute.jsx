import { Navigate } from 'react-router-dom'

function ProtectedRoute({ isChecking, isAuthenticated, children }) {
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="glass-panel rounded-[2rem] px-8 py-6 text-center">
          <p className="font-display text-2xl font-semibold">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth?mode=login" replace />
  }

  return children
}


export default ProtectedRoute

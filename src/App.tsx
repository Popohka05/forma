import React, { useState } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  const [screen, setScreen] = useState<'login' | 'register'>('login')

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      {screen === 'login' ? (
        <Login onSignUp={() => setScreen('register')} />
      ) : (
        <Register onBack={() => setScreen('login')} />
      )}
    </div>
  )
}

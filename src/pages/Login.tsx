import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { login } from '../api/auth'
import TwoFactor from '../components/TwoFactor'

type ApiError = {
  status: number
  message?: string
  details?: any
}

type Props = {
  onSignUp?: () => void
}

export default function Login({ onSignUp }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [need2FA, setNeed2FA] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLocalError(null)
    if (!email.trim() || !password) {
      setLocalError('Please enter email and password')
      return
    }

    mutation.mutate(
      { email, password },
      {
        onSuccess(data) {
          if (data?.require2fa && data.sessionId) {
            setSessionId(data.sessionId)
            setNeed2FA(true)
            return
          }
          alert('Login success — token: ' + data.token)
        },
        onError(err: any) {
          if (err?.request?.message) {
            setLocalError('Network error — please check your connection')
            return
          }
          const apiErr = err as ApiError
          if (apiErr?.status === 400 && apiErr.details) {
            setLocalError('Validation: ' + JSON.stringify(apiErr.details))
            return
          }
          if (apiErr?.status === 401) {
            setLocalError('Invalid credentials')
            return
          }
          if (apiErr?.status >= 500) {
            setLocalError('Server error — please try later')
            return
          }
          setLocalError(apiErr?.message ?? 'Unexpected error')
        },
      }
    )
  }

  if (need2FA && sessionId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <TwoFactor
          sessionId={sessionId}
          onBack={() => setNeed2FA(false)}
          onVerified={(token) => alert('Verified! token: ' + token)}
        />
      </div>
    )
  }

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-card">
      <div className="flex items-center justify-center mb-4">
        <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center mr-2">●</div>
        <div className="text-sm text-slate-600">Company</div>
      </div>

      <h1 className="text-lg font-semibold text-center mb-2">Sign in to your account to continue</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="sr-only">Email</label>
          <div className="relative">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded border border-slate-200 px-3 py-2 pl-10 placeholder:text-slate-400"
              placeholder="Email"
              aria-label="email"
            />
            <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
          </div>
        </div>

        <div>
          <label className="sr-only">Password</label>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded border border-slate-200 px-3 py-2 pl-10 placeholder:text-slate-400"
              placeholder="Password"
              aria-label="password"
            />
            <span className="absolute left-3 top-2.5 text-slate-400">🔒</span>
          </div>
        </div>

        {localError && <div className="text-sm text-red-600">{localError}</div>}

        <div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? 'Signing in...' : 'Log in'}
          </button>
        </div>

        <div className="text-center text-sm text-slate-400">or</div>
        <div className="flex gap-2">
          <button type="button" className="flex-1 px-3 py-2 border rounded">Continue with Google</button>
          <button type="button" className="flex-1 px-3 py-2 border rounded">Continue with Apple</button>
        </div>

        <div className="text-center text-sm text-slate-500 mt-2">
          New user? <button type="button" onClick={onSignUp} className="text-primary">Create an account</button>
        </div>
      </form>
    </div>
  )
}

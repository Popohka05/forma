import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

type ApiError = {
  status: number
  message?: string
}

type Props = {
  onBack: () => void
}

export default function Register({ onBack }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await axios.post('/register', data)
      return res.data
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    mutation.mutate(
      { email, password },
      {
        onSuccess() {
          alert('Account created successfully! Please log in.')
          onBack()
        },
        onError(err: any) {
          const apiErr = err as ApiError
          if (apiErr?.status === 400) {
            setError('Email already exists')
            return
          }
          setError(apiErr?.message || 'Registration failed')
        },
      }
    )
  }

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-card">
      <button onClick={onBack} className="text-sm text-slate-500 mb-4">← Back</button>
      
      <div className="flex items-center justify-center mb-4">
        <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center mr-2">●</div>
        <div className="text-sm text-slate-600">Company</div>
      </div>

      <h1 className="text-lg font-semibold text-center mb-2">Create an account</h1>
      <p className="text-sm text-slate-500 text-center mb-4">Sign up to get started</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="sr-only">Email</label>
          <div className="relative">
            <input
              type="email"
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

        <div>
          <label className="sr-only">Confirm Password</label>
          <div className="relative">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded border border-slate-200 px-3 py-2 pl-10 placeholder:text-slate-400"
              placeholder="Confirm Password"
              aria-label="confirm-password"
            />
            <span className="absolute left-3 top-2.5 text-slate-400">🔒</span>
          </div>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </div>

        <div className="text-center text-sm text-slate-500">Already have an account? <button type="button" onClick={onBack} className="text-primary">Sign in</button></div>
      </form>
    </div>
  )
}

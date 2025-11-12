import React, { useEffect, useMemo, useRef, useState } from 'react'

type Props = {
  sessionId: string
  onBack?: () => void
  onVerified: (token: string) => void
}

export default function TwoFactor({ sessionId, onBack, onVerified }: Props) {
  const [values, setValues] = useState(Array(6).fill(''))
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const [timeLeft, setTimeLeft] = useState(150) // 2:30
  const [resendAllowed, setResendAllowed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const code = useMemo(() => values.join(''), [values])

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(t)
          setResendAllowed(true)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])

  function onChange(idx: number, val: string) {
    if (!/^[0-9]*$/.test(val)) return
    const next = [...values]
    next[idx] = val.slice(-1)
    setValues(next)
    setError(null)
    if (val && idx < 5) inputsRef.current[idx + 1]?.focus()
  }

  function onKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !values[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus()
    }
  }

  async function submit() {
    if (code.length < 6) return
    try {
      const res = await fetch('/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, code }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.message || 'Invalid code')
        return
      }
      const data = await res.json()
      onVerified(data.token)
    } catch (err) {
      setError('Network error')
    }
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-card">
      <button onClick={onBack} className="text-sm text-slate-500 mb-4">←</button>
      <div className="flex items-center justify-center mb-4">
        <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center mr-2">●</div>
        <div className="text-sm text-slate-600">Company</div>
      </div>

      <h2 className="text-lg font-semibold text-center mb-1">Two-Factor Authentication</h2>
      <p className="text-xs text-slate-500 text-center mb-4">Enter the 6-digit code from the Google Authenticator app</p>

      <div className="flex gap-3 justify-center mb-2">
        {values.map((v, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            value={v}
            onChange={(e) => onChange(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            className={`w-12 h-12 text-center border rounded ${error ? 'border-red-400' : 'border-slate-200'}`}
            inputMode="numeric"
            maxLength={1}
          />
        ))}
      </div>

      {error && <div className="text-xs text-red-500 mb-2 text-center">{error}</div>}

      <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
        <div>Get a new code in {formatTime(timeLeft)}</div>
        <button
          onClick={() => {
            if (!resendAllowed) return
            setTimeLeft(150)
            setResendAllowed(false)
            alert('Code resent')
          }}
          className={`text-sm ${resendAllowed ? 'text-blue-600' : 'opacity-50'}`}
        >
          Resend
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={code.length < 6}
          className={`flex-1 px-4 py-2 ${code.length < 6 ? 'bg-slate-100 text-slate-400' : 'bg-primary text-white'} rounded`}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

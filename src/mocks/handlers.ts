import { rest } from 'msw'

export const handlers = [
  rest.post('/login', async (req, res, ctx) => {
    const body = await req.json()
    const { username, password } = body || {}

    if (username === 'network') {
      return res.networkError('Failed to connect')
    }

    if (username === 'bad') {
      return res(
        ctx.status(400),
        ctx.json({ message: 'Validation failed', errors: { username: 'Invalid username format' } })
      )
    }

    if (username === 'wrong') {
      return res(ctx.status(401), ctx.json({ message: 'Invalid credentials' }))
    }

    if (username === 'server') {
      return res(ctx.status(500), ctx.json({ message: 'Internal server error' }))
    }

    if (username === '2fa' && password === 'password123') {
      return res(ctx.status(200), ctx.json({ require2fa: true, sessionId: 'sess-1' }))
    }

    if (username === 'slow') {
      return res(ctx.delay(3000), ctx.status(200), ctx.json({ token: 'slow-token', user: { id: '1', name: 'Slow User' } }))
    }

    if (password === 'password123') {
      return res(ctx.status(200), ctx.json({ token: 'demo-token', user: { id: '1', name: username || 'Demo' } }))
    }

    return res(ctx.status(401), ctx.json({ message: 'Invalid credentials' }))
  }),

  rest.post('/register', async (req, res, ctx) => {
    const body = await req.json()
    const { email, password } = body || {}

    if (!email || !password) {
      return res(ctx.status(400), ctx.json({ message: 'Email and password required' }))
    }

    if (email === 'exists@example.com') {
      return res(ctx.status(400), ctx.json({ message: 'Email already exists' }))
    }

    return res(ctx.status(200), ctx.json({ token: 'new-token', user: { id: '2', name: email } }))
  }),

  rest.post('/verify', async (req, res, ctx) => {
    const body = await req.json()
    const { sessionId, code } = body || {}

    if (!sessionId || !code) {
      return res(ctx.status(400), ctx.json({ message: 'Missing parameters' }))
    }

    if (code === '131311') {
      return res(ctx.status(200), ctx.json({ token: 'token-2fa-123', user: { id: '1', name: 'TwoFA User' } }))
    }

    return res(ctx.status(400), ctx.json({ message: 'Invalid code' }))
  }),
]

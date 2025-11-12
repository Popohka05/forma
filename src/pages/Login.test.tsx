import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Login from '../pages/Login'
import { worker } from '../mocks/browser'

beforeAll(async () => {
  await worker.start({ onUnhandledRequest: 'bypass' })
})

afterEach(() => {
  worker.resetHandlers()
})

afterAll(() => {
  worker.stop()
})

function renderWithQuery(component: React.ReactNode) {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  )
}

describe('Login', () => {
  it('renders login form', () => {
    renderWithQuery(<Login />)
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('shows validation error when fields are empty', async () => {
    const user = userEvent.setup()
    renderWithQuery(<Login />)
    
    const button = screen.getByRole('button', { name: /log in/i })
    await user.click(button)
    
    expect(screen.getByText(/please enter email and password/i)).toBeInTheDocument()
  })

  it('submits valid credentials and shows success', async () => {
    const user = userEvent.setup()
    renderWithQuery(<Login />)
    
    const emailInput = screen.getByPlaceholderText('Email')
    const passwordInput = screen.getByPlaceholderText('Password')
    const button = screen.getByRole('button', { name: /log in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(button)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalled()
    })
  })

  it('shows error message on 401 unauthorized', async () => {
    const user = userEvent.setup()
    renderWithQuery(<Login />)
    
    const emailInput = screen.getByPlaceholderText('Email')
    const passwordInput = screen.getByPlaceholderText('Password')
    const button = screen.getByRole('button', { name: /log in/i })

    await user.type(emailInput, 'wrong')
    await user.type(passwordInput, 'incorrect')
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('shows validation error on 400 response', async () => {
    const user = userEvent.setup()
    renderWithQuery(<Login />)
    
    const emailInput = screen.getByPlaceholderText('Email')
    const passwordInput = screen.getByPlaceholderText('Password')
    const button = screen.getByRole('button', { name: /log in/i })

    await user.type(emailInput, 'bad')
    await user.type(passwordInput, 'password')
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText(/validation/i)).toBeInTheDocument()
    })
  })

  it('shows server error on 500 response', async () => {
    const user = userEvent.setup()
    renderWithQuery(<Login />)
    
    const emailInput = screen.getByPlaceholderText('Email')
    const passwordInput = screen.getByPlaceholderText('Password')
    const button = screen.getByRole('button', { name: /log in/i })

    await user.type(emailInput, 'server')
    await user.type(passwordInput, 'password')
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument()
    })
  })
})

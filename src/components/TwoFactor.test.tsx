import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TwoFactor from '../components/TwoFactor'
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

describe('TwoFactor', () => {
  it('renders 6 digit input fields', () => {
    render(
      <TwoFactor
        sessionId="test-session"
        onVerified={() => {}}
        onBack={() => {}}
      />
    )
    
    const inputs = screen.getAllByDisplayValue('')
    expect(inputs.length).toBeGreaterThanOrEqual(6)
  })

  it('allows entering digits only', async () => {
    const user = userEvent.setup()
    render(
      <TwoFactor
        sessionId="test-session"
        onVerified={() => {}}
        onBack={() => {}}
      />
    )
    
    const inputs = screen.getAllByDisplayValue('')
    await user.type(inputs[0], 'a')
    expect(inputs[0]).toHaveValue('')
  })

  it('moves focus to next input on digit entry', async () => {
    const user = userEvent.setup()
    render(
      <TwoFactor
        sessionId="test-session"
        onVerified={() => {}}
        onBack={() => {}}
      />
    )
    
    const inputs = screen.getAllByDisplayValue('') as HTMLInputElement[]
    await user.type(inputs[0], '1')
    expect(inputs[1]).toHaveFocus()
  })

  it('submits valid 2FA code', async () => {
    const user = userEvent.setup()
    const onVerified = vi.fn()
    render(
      <TwoFactor
        sessionId="test-session"
        onVerified={onVerified}
        onBack={() => {}}
      />
    )
    
    const inputs = screen.getAllByDisplayValue('') as HTMLInputElement[]
    const code = '131311'
    
    for (let i = 0; i < 6; i++) {
      await user.type(inputs[i], code[i])
    }

    const button = screen.getByRole('button', { name: /continue/i })
    await user.click(button)

    await waitFor(() => {
      expect(onVerified).toHaveBeenCalled()
    })
  })

  it('shows error on invalid code', async () => {
    const user = userEvent.setup()
    render(
      <TwoFactor
        sessionId="test-session"
        onVerified={() => {}}
        onBack={() => {}}
      />
    )
    
    const inputs = screen.getAllByDisplayValue('') as HTMLInputElement[]
    const invalidCode = '999999'
    
    for (let i = 0; i < 6; i++) {
      await user.type(inputs[i], invalidCode[i])
    }

    const button = screen.getByRole('button', { name: /continue/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText(/invalid code/i)).toBeInTheDocument()
    })
  })

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    render(
      <TwoFactor
        sessionId="test-session"
        onVerified={() => {}}
        onBack={onBack}
      />
    )
    
    const backButton = screen.getByRole('button', { name: '←' })
    await user.click(backButton)
    expect(onBack).toHaveBeenCalled()
  })
})

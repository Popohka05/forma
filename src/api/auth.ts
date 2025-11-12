import axios from 'axios'

export type LoginResponse = {
  token: string
  user: { id: string; name: string }
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  try {
    const res = await axios.post('/login', { username, password })
    return res.data
  } catch (err: any) {
    // Normalize to a simple error shape used by the UI
    if (err?.message && err.message.includes('Network Error')) {
      throw { request: { message: 'Network Error' } }
    }
    if (err?.response) {
      const { status, data } = err.response
      throw { status, message: data?.message, details: data?.errors }
    }
    throw { message: 'Unknown error' }
  }
}

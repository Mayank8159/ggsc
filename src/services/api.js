const BASE = 'https://0eg8pswhbg.execute-api.ap-south-1.amazonaws.com/dev'

export async function register(email, password, displayName) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, displayName }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'registration failed')
  return data
}

export async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'login failed')
  return data
}

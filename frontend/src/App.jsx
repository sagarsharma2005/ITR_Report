import { useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import './index.css'

export default function App() {
  const [user, setUser] = useState(null)

  if (!user) return <Login onLogin={setUser} />
  return <Dashboard user={user} onLogout={() => setUser(null)} />
}
import { useState } from 'react'

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('demo@datalens.in')
  const [pass, setPass] = useState('demo123')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setErr('')
    setLoading(true)
    try {
      let res, data

      if (isRegister) {
        // Register
        res = await fetch('http://127.0.0.1:8000/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password: pass })
        })
        data = await res.json()
        if (!res.ok) throw new Error(data.detail || 'Registration failed')

      } else {
        // Login
        const form = new URLSearchParams()
        form.append('username', email)
        form.append('password', pass)
        res = await fetch('http://127.0.0.1:8000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form
        })
        data = await res.json()
        if (!res.ok) throw new Error(data.detail || 'Login failed')
      }

      localStorage.setItem('token', data.access_token)
      onLogin({ email, name: data.name })

    } catch (e) {
      setErr(e.message)
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)'
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '400px'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
          <div style={{
            width: '42px', height: '42px', background: 'var(--primary)',
            borderRadius: '10px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '20px'
          }}>📊</div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '700' }}>DataLens</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sales Analytics Platform</div>
          </div>
        </div>

        {/* Toggle */}
        <div style={{
          display: 'flex', background: 'var(--bg)', borderRadius: '10px',
          padding: '4px', marginBottom: '1.5rem'
        }}>
          {['Login', 'Register'].map((t, i) => (
            <button key={t} onClick={() => { setIsRegister(i === 1); setErr('') }}
              style={{
                flex: 1, padding: '8px', border: 'none', borderRadius: '8px', fontSize: '13px',
                fontWeight: '600', cursor: 'pointer',
                background: isRegister === (i === 1) ? 'var(--primary)' : 'transparent',
                color: isRegister === (i === 1) ? '#fff' : 'var(--text-muted)'
              }}>{t}</button>
          ))}
        </div>

        {/* Name field — only on register */}
        {isRegister && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Password</label>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder="••••••••" />
        </div>

        {err && (
          <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '1rem', padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>
            ⚠️ {err}
          </div>
        )}

        <button className="btn-primary" style={{ width: '100%', padding: '11px' }}
          onClick={handleSubmit} disabled={loading}>
          {loading ? '⏳ Please wait...' : isRegister ? 'Create account →' : 'Sign in →'}
        </button>

        {!isRegister && (
          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '12px', color: 'var(--text-muted)' }}>
            Demo: demo@datalens.in / demo123
          </div>
        )}
      </div>
    </div>
  )
}
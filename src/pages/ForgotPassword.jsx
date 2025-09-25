import { useState } from 'react'
import './Login.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const onSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">忘記密碼</h2>
        {!sent ? (
          <form onSubmit={onSubmit} className="login-form">
            <label className="field">
              <span>電子郵件</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <button type="submit" className="btn-outline login-btn">寄送重設連結</button>
          </form>
        ) : (
          <p style={{ textAlign: 'center' }}>重設密碼連結已寄至 {email}</p>
        )}
      </div>
    </div>
  )
}



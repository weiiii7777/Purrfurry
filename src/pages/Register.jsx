import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import './Login.css'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [code, setCode] = useState('')
  const [verified, setVerified] = useState(false)
  const [birthday, setBirthday] = useState('')
  const [address, setAddress] = useState('')

  const onSubmit = (e) => {
    e.preventDefault()
    // 模擬註冊成功：保存不可變更欄位
    localStorage.setItem('pf_profile_name', fullName)
    localStorage.setItem('pf_profile_phone', phone)
    login(email)
    navigate('/member')
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">會員註冊</h2>
        <form onSubmit={onSubmit} className="login-form">
          <label className="field">
            <span>姓名 <small style={{color:'#c43'}}>（註冊後無法更動）</small></span>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </label>
          <label className="field">
            <span>手機號碼 <small style={{color:'#c43'}}>（註冊後無法更動）</small></span>
            <div style={{display:'flex', gap:'0.5rem'}}>
              <input type="tel" value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="09xxxxxxxx" required style={{flex:1}} />
              {!verified ? (
                <button type="button" className="btn-outline" onClick={()=>setCodeSent(true)}>發送驗證碼</button>
              ) : (
                <span style={{alignSelf:'center', color:'#2a7'}}>已驗證</span>
              )}
            </div>
            {!verified && phone && (
              <small style={{color:'#c43'}}>需先完成手機驗證後才能註冊</small>
            )}
          </label>
          {codeSent && !verified && (
            <label className="field">
              <span>輸入驗證碼</span>
              <div style={{display:'flex', gap:'0.5rem'}}>
                <input value={code} onChange={(e)=>setCode(e.target.value)} placeholder="六位數" />
                <button type="button" className="btn-outline" onClick={()=> setVerified(true)}>驗證</button>
              </div>
              <small style={{color:'#666'}}>（此為示意，輸入任意內容皆可通過）</small>
            </label>
          )}
          <label className="field">
            <span>信箱</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="field">
            <span>密碼</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <label className="field">
            <span>生日</span>
            <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} required />
          </label>
          <label className="field">
            <span>住址</span>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required />
          </label>
          <button type="submit" className="btn-outline login-btn" disabled={!verified}>註冊</button>
        </form>
      </div>
    </div>
  )
}



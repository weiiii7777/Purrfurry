import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import './Login.css'

const asset = (p) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, user, updateUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)

  // 處理登入後的追蹤邏輯
  const handleTrackAfterLogin = (redirectUrl) => {
    // 從 redirectUrl 中提取動物 ID
    const pathParts = redirectUrl.split('/')
    const animalId = pathParts[pathParts.length - 1]
    
    // 根據動物 ID 決定圖片和出養人資訊
    const isDog = animalId === 'a8' || animalId === 'a9' || animalId === 'a10' || animalId === 'a11' || animalId === 'a12' || animalId === 'a13' || animalId === 'a14' || animalId === 'a15'
    const isWawa = animalId === 'a16'
    
    let animalData
    if (isDog) {
      animalData = {
        id: 'wulong', // 統一的寵物識別符
        name: '烏龍',
        title: '小小年紀就一把年紀的烏龍',
        image: 'adopt15.png',
        breed: '公,3歲',
        location: '高雄市'
      }
    } else if (isWawa) {
      animalData = {
        id: 'wawa', // 統一的寵物識別符
        name: '襪襪',
        title: '眼睛很大一直穿著襪子的襪襪',
        image: 'adopt16-1.JPG',
        breed: '母,0歲',
        location: '高雄市'
      }
    } else {
      animalData = {
        id: 'pupu', // 統一的寵物識別符
        name: '噗噗',
        title: '拍照都像沒睡飽的噗噗',
        image: 'adopt4.png',
        breed: '母,1歲',
        location: '台北市'
      }
    }
    
    // 從 localStorage 讀取最新的用戶數據，確保數據同步
    const savedUser = localStorage.getItem('pf_auth_user')
    let currentUser = user
    if (savedUser) {
      currentUser = JSON.parse(savedUser)
    }
    
    // 檢查是否已經追蹤過
    const currentTrackedPets = currentUser?.trackedPets || []
    const isAlreadyTracked = currentTrackedPets.some(pet => pet.id === animalId)
    
    if (!isAlreadyTracked) {
      // 添加到追蹤列表
      const updatedTrackedPets = [...currentTrackedPets, animalData]
      updateUser({ trackedPets: updatedTrackedPets })
      alert('已加入追蹤列表！')
    } else {
      alert('已經在追蹤列表中了！')
    }
    
    // 跳轉回原來的領養內頁
    navigate(redirectUrl)
  }

  const onSubmit = (e) => {
    e.preventDefault()
    login(email)
    
    // 檢查是否有重定向參數
    const redirectUrl = searchParams.get('redirect')
    const action = searchParams.get('action')
    
    if (redirectUrl) {
      // 如果有重定向URL，回到原頁面
      if (action === 'contact') {
        // 如果是聯繫出養人，回到原頁面並自動打開對話框
        const separator = redirectUrl.includes('?') ? '&' : '?'
        navigate(redirectUrl + separator + 'openDialog=true')
      } else if (action === 'track') {
        // 如果是追蹤毛孩，先處理追蹤邏輯
        handleTrackAfterLogin(redirectUrl)
      } else if (action === 'adopt') {
        // 如果是領養，跳轉到會員頁面
        navigate('/member')
      } else if (action === 'course') {
        // 如果是課程，回到原來的課程頁面
        navigate(redirectUrl)
      } else {
        navigate(redirectUrl)
      }
    } else {
      // 沒有重定向，正常跳轉到會員頁面
      navigate('/member')
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">會員登入</h2>
        <form onSubmit={onSubmit} className="login-form">
          <label className="field">
            <span>電子郵件</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>
          <label className="field">
            <span>密碼</span>
            <div className="pwd-wrap">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="請輸入密碼"
                required
              />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd(v => !v)} aria-label="切換顯示密碼">
                <i className={`bx ${showPwd ? 'bx-show' : 'bx-hide'}`}></i>
              </button>
            </div>
          </label>

          <button type="submit" className="btn-outline login-btn">登入</button>
        </form>

        <div className="login-links">
          <Link to="/forgot">忘記密碼？</Link>
          <span>・</span>
          <Link to="/register">註冊新帳號</Link>
        </div>
      </div>
    </div>
  )
}



import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import { useEffect, useState, useRef } from 'react'

const asset = (p) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`

export default function OverlayMenu({ open, onClose }) {
  const { isAuthenticated, logout, user } = useAuth()
  const [openMenu, setOpenMenu] = useState(false)
  const [avatar, setAvatar] = useState('')
  const [displayName, setDisplayName] = useState('')
  const userMenuRef = useRef(null)

  useEffect(() => {
    const keyA = user?.email ? `pf_profile_avatar:${user.email}` : 'pf_profile_avatar'
    const keyN = user?.email ? `pf_profile_nickname:${user.email}` : 'pf_profile_nickname'
    setAvatar(user?.avatar || localStorage.getItem(keyA) || '')
    setDisplayName(user?.nickname || localStorage.getItem(keyN) || (user?.email || '').split('@')[0] || '會員')
  }, [open, user?.email, user?.nickname, user?.avatar])

  // 點擊外部區域關閉用戶菜單
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setOpenMenu(false)
      }
    }

    if (openMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openMenu])
  return (
    <div className={`overlay ${open ? 'open' : ''}`}>
      <div className="overlay-toolbar">
        <Link to="/" className="overlay-logo" onClick={onClose} aria-label="回首頁">
          <img src={asset('b_logo.png')} alt="home" />
        </Link>
        <div className="overlay-right">
          {isAuthenticated ? (
            <div className="overlay-user" ref={userMenuRef}>
              <button className="user-trigger" onClick={() => setOpenMenu(v => !v)}>
                <span className="avatar" aria-hidden="true">{avatar && avatar !== '' ? <img src={avatar} alt="avatar" /> : <img src={asset('profile.svg')} alt="default avatar" />}</span>
                <span className="uname">{displayName}</span>
                <i className={`bx bx-chevron-down ${openMenu ? 'rot' : ''}`}></i>
              </button>
              {openMenu && (
                <div className="user-menu" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={(e) => { 
                      e.preventDefault()
                      e.stopPropagation()
                      logout()
                      setOpenMenu(false)
                      onClose()
                    }}
                  >
                    登出
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link className="overlay-auth-btn" to="/login" onClick={onClose}>登入</Link>
          )}
          <button className="overlay-close" onClick={onClose} aria-label="Close menu">
            <img src={asset('navOn.png')} alt="close" />
          </button>
        </div>
      </div>
      <div className="overlay-inner">
        <nav className="menu-list">

          <div className="menu-heading">我要領養</div>
          <Link to="/courses" onClick={onClose}>教育頁面</Link>
          <Link to="/adopt" onClick={onClose}>找毛孩</Link>

          <div className="menu-heading">關於我們</div>
          <Link to="/report" onClick={onClose}>常見問題</Link>

          {isAuthenticated ? (
            <>
              <div className="menu-heading">會員專區</div>
              <Link to="/member" onClick={onClose}>會員設定</Link>
              <Link to="/member" onClick={onClose}>我要回報</Link>
              <Link to="/member" onClick={onClose}>我要發布領養訊息</Link>
            </>
          ) : (
            <>
              <div className="menu-heading">會員設定</div>
              <Link to="/login" onClick={onClose}>登入</Link>
              <Link to="/register" onClick={onClose}>註冊</Link>
            </>
          )}
        </nav>
      </div>
    </div>
  )
}



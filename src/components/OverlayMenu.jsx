import { Link } from 'react-router-dom'

const asset = (p) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`

export default function OverlayMenu({ open, onClose }) {
  return (
    <div className={`overlay ${open ? 'open' : ''}`}>
      <button className="overlay-close" onClick={onClose} aria-label="Close menu">
        <img src={asset('navOn.png')} alt="close" />
      </button>
      <div className="overlay-inner">
        <nav className="menu-list">
          <Link to="/" onClick={onClose}>回首頁</Link>

          <Link className="menu-heading" to="/adopt" onClick={onClose}>我要領養</Link>
          <Link to="/guide" onClick={onClose}>教育頁面</Link>
          <Link to="/adopt" onClick={onClose}>找毛孩</Link>

          <Link className="menu-heading" to="/about" onClick={onClose}>關於我們</Link>
          <Link to="/report" onClick={onClose}>常見問題</Link>

          <Link className="menu-heading" to="/member" onClick={onClose}>會員專區</Link>
          <Link to="/member" onClick={onClose}>會員設定</Link>
          <Link to="/member" onClick={onClose}>我要回報</Link>
          <Link to="/member" onClick={onClose}>我要發布領養訊息</Link>
        </nav>
      </div>
    </div>
  )
}



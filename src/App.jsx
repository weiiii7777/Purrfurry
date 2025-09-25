import { useState, useEffect, useMemo, useRef } from 'react'
import { Routes, Route, useNavigate, Link, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import Adopt from './pages/Adopt.jsx'
import AdoptDetail from './pages/AdoptDetail.jsx'
import Login from './pages/Login.jsx'
import Guide from './pages/Guide.jsx'
import Report from './pages/Report.jsx'
import About from './pages/About.jsx'
import Courses from './pages/Courses.jsx'
import CourseDetail from './pages/CourseDetail.jsx'
import PostAdoption from './pages/PostAdoption.jsx'
import Member from './pages/Member.jsx'
import OverlayMenu from './components/OverlayMenu.jsx'
import { AuthProvider, useAuth } from './AuthContext.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import EventDetail from './pages/EventDetail.jsx'
import Questionnaire from './pages/Questionnaire.jsx'

// Helper to resolve assets under Vite base
const asset = (p) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`

function Landing({ menuOpen }) {
  const navigate = useNavigate()
  const cards = [
    { id: 'adopt-brief', image: 'adopt1.png', title: '領養說明會', date: '09.27', year: '2025', weekday: 'Sat.', place: '台北市信義區動物之家' },
    { id: 'meet-cats', image: 'adopt2.png', title: '貓咪見面會', date: '10.12', year: '2025', weekday: 'Sun.', place: '新北市板橋動物之家' },
    { id: 'volunteer-brief', image: 'adopt3.png', title: '收容志工說明', date: '11.02', year: '2025', weekday: 'Sun.', place: '台中市動物之家' },
  ]

  // Scroll-driven logo movement toward header-left
  const logoRef = useRef(null)
  const [logoStyle, setLogoStyle] = useState({})
  const [pinned, setPinned] = useState(false)
  const [showTop, setShowTop] = useState(false)
  useEffect(() => {
    // IntersectionObserver: reveal features on scroll
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('slide-in')
          io.unobserve(entry.target)
        }
      })
    }, { threshold: 0.15 })

    document.querySelectorAll('.slide-from-left, .slide-from-right').forEach((el) => io.observe(el))

    const headerEl = document.querySelector('#header-bar')
    const imgEl = logoRef.current
    if (!headerEl || !imgEl) return

    const computeVectors = () => {
      const headerRect = headerEl.getBoundingClientRect()
      const startRect = imgEl.getBoundingClientRect()

      const targetHeight = headerRect.height * 0.7 // align with header logo slot visual size
      const startH = startRect.height
      const targetScale = targetHeight / startH

      const targetX = headerRect.left + 16 + targetHeight / 2
      const targetY = headerRect.top + headerRect.height / 2

      const startX = startRect.left + startRect.width / 2
      const startY = startRect.top + startRect.height / 2

      return { dx: targetX - startX, dy: targetY - startY, targetScale, targetHeight, headerRect }
    }

    let vectors = computeVectors()

    const apply = () => {
      const maxDist = Math.max(1, window.innerHeight * 0.6)
      const progress = Math.min(1, Math.max(0, window.scrollY / maxDist))
      const scale = 1 + (vectors.targetScale - 1) * progress
      const tx = vectors.dx * progress
      const ty = vectors.dy * progress
      if (progress < 1) {
        // Ensure logo stays in original container while animating
        const slot = document.getElementById('header-logo-slot')
        if (slot && imgEl.parentElement === slot) {
          const orig = document.querySelector('.center-logo .logo-wrap')
          if (orig) orig.appendChild(imgEl)
        }
        setPinned(false)
        setLogoStyle({ position: 'static', width: '', height: '', transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale})` })
      } else {
        // Move logo into header bar slot
        const slot = document.getElementById('header-logo-slot')
        if (slot && imgEl.parentElement !== slot) {
          slot.appendChild(imgEl)
        }
        setPinned(true)
        setLogoStyle({ position: 'static', width: 'auto', height: `${Math.round(vectors.targetHeight)}px`, transform: 'none' })
      }
    }

    const onScroll = () => apply()
    const onResize = () => { vectors = computeVectors(); apply() }
    apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      io.disconnect()
    }
  }, [])

  // control back-to-top visibility
  useEffect(() => {
    const handler = () => setShowTop(window.scrollY > 10)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
  // Build infinite slides by cloning head/tail
  const slides = useMemo(() => [cards[cards.length - 1], ...cards, cards[0]], [cards.length])
  const [pos, setPos] = useState(1) // position in slides
  const [enableAnim, setEnableAnim] = useState(true)
  const [isMoving, setIsMoving] = useState(false)
  const queuedDelta = useRef(0)
  const realIndex = (pos - 1 + cards.length) % cards.length
  const trackRef = useRef(null)

  // autoplay every 5s; pause when menu open
  useEffect(() => {
    if (menuOpen || cards.length <= 1) return
    const id = setInterval(() => {
      if (isMoving) return
      setEnableAnim(true)
      setIsMoving(true)
      setPos((v) => v + 1)
    }, 5000)
    return () => clearInterval(id)
  }, [menuOpen, cards.length, pos, isMoving])

  // preload images once
  useEffect(() => {
    cards.forEach(card => { const img = new Image(); img.src = card.image })
  }, [])

  return (
    <>
    <div className="landing">
      <div className="left-title">
        <img src={asset('index_title.png')} alt="index title vertical" />
      </div>
      <div className="center-logo">
        <div className="logo-wrap">
          <img ref={logoRef} style={logoStyle} className="noise_animation" src={asset('b_logo.png')} alt="main logo" />
        </div>
      </div>
      <div className="right-card">
        <div className="event-card">
          <button className="card-nav left" aria-label="Previous" onClick={() => {
            if (isMoving) { queuedDelta.current -= 1; return }
            setEnableAnim(true); setIsMoving(true); setPos((v) => v - 1)
          }}>
            <i className='bx bx-chevron-left'></i>
          </button>
          <button className="card-nav right" aria-label="Next" onClick={() => {
            if (isMoving) { queuedDelta.current += 1; return }
            setEnableAnim(true); setIsMoving(true); setPos((v) => v + 1)
          }}>
            <i className='bx bx-chevron-right'></i>
        </button>
          <div className="event-viewport">
            <div
              className={`event-track${!enableAnim ? ' no-anim' : ''}`}
              ref={trackRef}
              style={{ transform: `translateX(-${pos * 100}%)` }}
              onTransitionEnd={() => {
                // Seamless loop jumps
                if (pos === slides.length - 1) {
                  setEnableAnim(false)
                  requestAnimationFrame(() => {
                    setPos(1)
                    requestAnimationFrame(() => {
                      setEnableAnim(true)
                      setIsMoving(false)
                      const q = queuedDelta.current
                      queuedDelta.current = 0
                      if (q !== 0) {
                        setEnableAnim(true)
                        setIsMoving(true)
                        setPos((v) => v + Math.sign(q))
                      }
                    })
                  })
                } else if (pos === 0) {
                  setEnableAnim(false)
                  requestAnimationFrame(() => {
                    setPos(slides.length - 2)
                    requestAnimationFrame(() => {
                      setEnableAnim(true)
                      setIsMoving(false)
                      const q = queuedDelta.current
                      queuedDelta.current = 0
                      if (q !== 0) {
                        setEnableAnim(true)
                        setIsMoving(true)
                        setPos((v) => v + Math.sign(q))
                      }
                    })
                  })
                }
                else {
                  setIsMoving(false)
                  const q = queuedDelta.current
                  queuedDelta.current = 0
                  if (q !== 0) {
                    setEnableAnim(true)
                    setIsMoving(true)
                    setPos((v) => v + Math.sign(q))
                  }
                }
              }}
            >
              {slides.map((item, i) => (
                <div className="event-slide" key={i} aria-hidden={i !== pos}>
                  <div className="event-inner">
                    <div className="event-image-wrap clickable" onClick={() => navigate(`/event/${item.id}`)}>
                      <img className="event-image" src={asset(item.image)} alt="adopt event" draggable="false" />
                    </div>
                    <div className="event-content clickable" onClick={() => navigate(`/event/${item.id}`)}>
                      <h3>{item.title}</h3>
                      <div className="event-date">
                        <div className="big">{item.date}</div>
                        <div className="meta">
                          <div>{item.year}</div>
                          <div>{item.weekday}</div>
                        </div>
                      </div>
                      <div className="event-place">{item.place}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card-dots" role="tablist" aria-label="carousel pagination">
            {cards.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === realIndex ? 'active' : ''}`}
                aria-label={`Go to slide ${i + 1}`}
                aria-selected={i === realIndex}
                role="tab"
                onClick={() => { setEnableAnim(true); setPos(i + 1) }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
    <section className="intro-section">
      <div className="intro-inner">
        <div className="intro-copy">
          <p>如果領養能更透明，你會不會更容易踏出第一步？</p>
          <p>在透明毛襪，你能安心地了解每一份紀錄，慢慢找到屬於你們的緣分。</p>
          <p>完成問答，看看我們推薦你的領養關鍵字。</p>
          <button 
            className="btn-outline"
            onClick={() => navigate('/questionnaire')}
          >
            開始填寫問卷
          </button>
          <img className="intro-illus illus-person" src={asset('index_adopt.svg')} alt="插畫" />
        </div>
      </div>
    </section>
    <section className="feature feature-edu" id="section-edu">
      <div className="feature-container">
        <div className="feature-media slide-from-left">
          <img className="feature-bg" src={asset('index_1_b.png')} alt="" aria-hidden="true" />
          <img className="feature-img" src={asset('index_1.png')} alt="教育功能插圖" />
        </div>
        <div className="feature-copy slide-from-left">
          <div className="feature-titleline">
            <span className="feature-no">01</span>
            <h2 className="feature-title">教育功能</h2>
          </div>
          <h3 className="feature-sub">課程認證，養成責任感</h3>
          <p className="feature-desc">在領養之前，需先完成基礎課程與活動認證。我們希望每位領養人都能具備正確的知識與態度，確保這段陪伴從一開始就是穩固而安心的。</p>
          <Link to="/courses" className="btn-outline">進入此頁</Link>
        </div>
      </div>
    </section>

    <section className="feature feature-adopt" id="section-adopt">
      <div className="feature-container">
        <div className="feature-copy slide-from-right">
          <div className="feature-titleline">
            <span className="feature-no">02</span>
            <h2 className="feature-title">領養介面</h2>
          </div>
          <h3 className="feature-sub">透明資訊，簡單搜尋</h3>
          <p className="feature-desc">我們的介面公開所有醫療紀錄與生活紀要，並提供直覺的搜尋與篩選功能，讓你能快速找到最契合的毛小孩，並了解牠的真實狀況。</p>
          <Link to="/adopt" className="btn-outline">進入此頁</Link>
        </div>
        <div className="feature-media slide-from-right">
          <img className="feature-bg" src={asset('index_2_b.png')} alt="" aria-hidden="true" />
          <img className="feature-img" src={asset('index_2.png')} alt="領養介面插圖" />
        </div>
      </div>
    </section>

    <section className="feature feature-report" id="section-report">
      <div className="feature-container">
        <div className="feature-media slide-from-left">
          <img className="feature-bg" src={asset('index_3_b.png')} alt="" aria-hidden="true" />
          <img className="feature-img" src={asset('index_3.png')} alt="回報系統插圖" />
        </div>
        <div className="feature-copy slide-from-left">
          <div className="feature-titleline">
            <span className="feature-no">03</span>
            <h2 className="feature-title">回報系統</h2>
          </div>
          <h3 className="feature-sub">分享近況，延續信任</h3>
          <p className="feature-desc">領養後，你可以透過平台回報毛孩的生活日常。這不僅讓愛爸愛媽更安心，也建立起持續的互動，讓整個社群共同見證牠的成長與幸福。</p>
          <button className="btn-outline">進入此頁</button>
        </div>
      </div>
    </section>
    <button
      className={`back-to-top ${showTop ? 'show' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
    >
      <i className='bx bx-chevron-up'></i>
    </button>
    </>
  )
}

function MemberGate({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const scrollLockY = useRef(0)
  const location = useLocation()
  const closingDueToNav = useRef(false)

  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    if (menuOpen) {
      scrollLockY.current = window.scrollY || window.pageYOffset || 0
      const offset = -scrollLockY.current
      html.style.scrollBehavior = 'auto' // prevent smooth scroll jump
      body.style.position = 'fixed'
      body.style.top = `${offset}px`
      body.style.left = '0'
      body.style.right = '0'
      body.style.width = '100%'
    } else {
      const y = scrollLockY.current
      body.style.position = ''
      body.style.top = ''
      body.style.left = ''
      body.style.right = ''
      body.style.width = ''
      requestAnimationFrame(() => {
        if (closingDueToNav.current) {
          window.scrollTo(0, 0)
        } else {
          window.scrollTo(0, y)
        }
      })
      setTimeout(() => { html.style.scrollBehavior = '' }, 0)
    }
  }, [menuOpen])

  // Ensure header slot has only one logo on non-home pages
  useEffect(() => {
    const slot = document.getElementById('header-logo-slot')
    if (!slot) return
    if (location.pathname !== '/') {
      Array.from(slot.querySelectorAll('img')).forEach((img) => {
        if (!img.closest('.header-home-link')) img.remove()
      })
    }
  }, [location.pathname])

  // Scroll to top on route changes (e.g., entering Adopt from home)
  useEffect(() => {
    // Close overlay if navigating while open; mark to skip restoring old scroll
    if (menuOpen) {
      closingDueToNav.current = true
      setMenuOpen(false)
    }
    const html = document.documentElement
    const prev = html.style.scrollBehavior
    html.style.scrollBehavior = 'auto'
    window.scrollTo(0, 0)
    setTimeout(() => { html.style.scrollBehavior = prev }, 0)
    closingDueToNav.current = false
  }, [location.pathname])

  return (
    <AuthProvider>
    <div className={`app-root ${menuOpen ? 'menu-open' : ''}`}>
      <Routes>
        <Route path="/" element={<Landing menuOpen={menuOpen} />} />
        <Route path="/adopt" element={<Adopt />} />
        <Route path="/adopt/:id" element={<AdoptDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/post-adoption" element={<MemberGate><PostAdoption /></MemberGate>} />
        <Route path="/report" element={<Report />} />
        <Route path="/about" element={<About />} />
        <Route path="/member" element={<MemberGate><Member /></MemberGate>} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
      </Routes>
      {!menuOpen && (
        <div id="header-bar" className="fixed-top-right">
          <div id="header-logo-slot" style={{ pointerEvents: 'auto' }}>
            {location.pathname !== '/' && (
              <Link to="/" className="header-home-link">
                <img src={asset('b_logo.png')} alt="home" />
              </Link>
            )}
          </div>
          <button className="hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <img src={asset('navOff.png')} alt="menu" />
          </button>
        </div>
      )}
      <OverlayMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
    </AuthProvider>
  )
}

export default App

import { useState, useEffect, useMemo, useRef } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import Adopt from './pages/Adopt.jsx'
import Guide from './pages/Guide.jsx'
import Report from './pages/Report.jsx'
import About from './pages/About.jsx'
import Member from './pages/Member.jsx'
import OverlayMenu from './components/OverlayMenu.jsx'
import EventDetail from './pages/EventDetail.jsx'

// Helper to resolve assets under Vite base
const asset = (p) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`

function Landing({ menuOpen }) {
  const navigate = useNavigate()
  const cards = [
    { id: 'adopt-brief', image: 'adopt1.webp', title: '領養說明會', date: '09.27', year: '2025', weekday: 'Sat.', place: '台北市信義區動物之家' },
    { id: 'meet-cats', image: 'adopt1.webp', title: '貓咪見面會', date: '10.12', year: '2025', weekday: 'Sun.', place: '新北市板橋動物之家' },
    { id: 'volunteer-brief', image: 'adopt1.webp', title: '收容志工說明', date: '11.02', year: '2025', weekday: 'Sun.', place: '台中市動物之家' },
  ]

  // Scroll-driven logo movement toward header-left
  const logoRef = useRef(null)
  const [logoStyle, setLogoStyle] = useState({})
  const [pinned, setPinned] = useState(false)
  const [showTop, setShowTop] = useState(false)
  useEffect(() => {
    const headerEl = document.querySelector('#header-bar')
    const imgEl = logoRef.current
    if (!headerEl || !imgEl) return

    const computeVectors = () => {
      const headerRect = headerEl.getBoundingClientRect()
      const startRect = imgEl.getBoundingClientRect()

      const targetSize = Math.min(headerRect.height * 0.72, 100) // close to hamburger視覺大小
      const startW = startRect.width
      const targetScale = targetSize / startW

      const targetX = headerRect.left + 16 + targetSize / 2
      const targetY = headerRect.top + headerRect.height / 2

      const startX = startRect.left + startRect.width / 2
      const startY = startRect.top + startRect.height / 2

      return { dx: targetX - startX, dy: targetY - startY, targetScale, targetSize, headerRect }
    }

    let vectors = computeVectors()

    const apply = () => {
      const maxDist = Math.max(1, window.innerHeight * 0.6)
      const progress = Math.min(1, Math.max(0, window.scrollY / maxDist))
      const scale = 1 + (vectors.targetScale - 1) * progress
      const tx = vectors.dx * progress
      const ty = vectors.dy * progress
      if (progress < 1) {
        setPinned(false)
        setLogoStyle({ transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale})` })
      } else {
        setPinned(true)
        const left = 16
        const top = vectors.headerRect.top + (vectors.headerRect.height - vectors.targetSize) / 2
        setLogoStyle({ position: 'fixed', left: `${left}px`, top: `${top}px`, width: `${vectors.targetSize}px`, height: 'auto', transform: 'none', zIndex: 1001 })
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
          <button className="btn-outline">開始填寫問卷</button>
          <img className="intro-illus illus-person" src={asset('index_adopt.svg')} alt="插畫" />
        </div>
      </div>
    </section>
    <section className="feature feature-edu">
      <div className="feature-container">
        <div className="feature-media">
          <img className="feature-bg" src={asset('index_1_b.png')} alt="" aria-hidden="true" />
          <img className="feature-img" src={asset('index_1.png')} alt="教育功能插圖" />
        </div>
        <div className="feature-copy">
          <div className="feature-titleline">
            <span className="feature-no">01</span>
            <h2 className="feature-title">教育功能</h2>
          </div>
          <h3 className="feature-sub">課程認證，養成責任感</h3>
          <p className="feature-desc">在領養之前，需先完成基礎課程與活動認證。我們希望每位領養人都能具備正確的知識與態度，確保這段陪伴從一開始就是穩固而安心的。</p>
          <button className="btn-outline">進入此頁</button>
        </div>
      </div>
    </section>

    <section className="feature feature-adopt">
      <div className="feature-container">
        <div className="feature-copy">
          <div className="feature-titleline">
            <span className="feature-no">02</span>
            <h2 className="feature-title">領養介面</h2>
          </div>
          <h3 className="feature-sub">透明資訊，簡單搜尋</h3>
          <p className="feature-desc">我們的介面公開所有醫療紀錄與生活紀要，並提供直覺的搜尋與篩選功能，讓你能快速找到最契合的毛小孩，並了解牠的真實狀況。</p>
          <button className="btn-outline">進入此頁</button>
        </div>
        <div className="feature-media">
          <img className="feature-bg" src={asset('index_2_b.png')} alt="" aria-hidden="true" />
          <img className="feature-img" src={asset('index_2.png')} alt="領養介面插圖" />
        </div>
      </div>
    </section>

    <section className="feature feature-report">
      <div className="feature-container">
        <div className="feature-media">
          <img className="feature-bg" src={asset('index_3_b.png')} alt="" aria-hidden="true" />
          <img className="feature-img" src={asset('index_3.png')} alt="回報系統插圖" />
        </div>
        <div className="feature-copy">
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

function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className={`app-root ${menuOpen ? 'menu-open' : ''}`}>
      <Routes>
        <Route path="/" element={<Landing menuOpen={menuOpen} />} />
        <Route path="/adopt" element={<Adopt />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/report" element={<Report />} />
        <Route path="/about" element={<About />} />
        <Route path="/member" element={<Member />} />
        <Route path="/event/:id" element={<EventDetail />} />
      </Routes>
      {!menuOpen && (
        <div id="header-bar" className="fixed-top-right">
          <button className="hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <img src={asset('navOff.png')} alt="menu" />
          </button>
        </div>
      )}
      <OverlayMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  )
}

export default App

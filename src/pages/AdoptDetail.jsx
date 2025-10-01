import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '../AuthContext.jsx'
import ContactDialog from '../components/ContactDialog.jsx'
import './AdoptDetail.css'

const asset = (p) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`

export default function AdoptDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user, updateUser } = useAuth()
  const [searchParams] = useSearchParams()
  
  // 根據動物 ID 決定圖片和出養人資訊
  const animalData = useMemo(() => {
    const isDog = id === 'a8' || id === 'a9' || id === 'a10' || id === 'a11' || id === 'a12' || id === 'a13' || id === 'a14' || id === 'a15'
    const isWawa = id === 'a16'
    
    if (isDog) {
      return {
        images: ['adopt15.png', 'adopt15-2.png', 'adopt15-3.png', 'adopt15-4.png'],
        fosterName: '狗狗星人',
        petName: '烏龍',
        title: '小小年紀就一把年紀的烏龍',
        description: '公,3歲',
        location: '高雄市',
        bio: '我是狗狗星人，專門照顧可愛的狗狗們！',
        fosterAvatar: 'juju.JPG',
        isAdopted: false,
        uniqueId: 'wulong' // 統一的寵物識別符
      }
    } else if (isWawa) {
      return {
        images: ['adopt16-1.JPG', 'adopt16-2.JPG', 'adopt16-3.JPG', 'adopt16-4.JPG'],
        fosterName: '伊娃',
        petName: '襪襪',
        title: '眼睛很大一直穿著襪子的襪襪',
        description: '母,0歲',
        location: '高雄市',
        bio: '我想幫助可憐的浪浪都可以找到自己的家',
        fosterAvatar: 'wawa.jpg',
        isAdopted: true,
        uniqueId: 'wawa' // 統一的寵物識別符
      }
    } else {
      return {
        images: ['adopt4.png', 'adopt4-2.png', 'adopt4-3.png', 'adopt4-4.png'],
        fosterName: '貓貓獵人',
        petName: '噗噗',
        title: '拍照都像沒睡飽的噗噗',
        description: '母,1歲',
        location: '台北市',
        bio: '無自介',
        fosterAvatar: 'wawa.jpg',
        isAdopted: false,
        uniqueId: 'pupu' // 統一的寵物識別符
      }
    }
  }, [id])
  
  const [current, setCurrent] = useState(0)
  const [basicOpen, setBasicOpen] = useState(true)
  const [vaxOpen, setVaxOpen] = useState(true)
  const [showContactDialog, setShowContactDialog] = useState(false)

  // 檢查 URL 參數是否要自動打開對話框
  useEffect(() => {
    if (searchParams.get('openDialog') === 'true' && isAuthenticated) {
      setShowContactDialog(true)
    }
  }, [searchParams, isAuthenticated])

  // 處理追蹤毛孩
  const handleTrack = () => {
    if (isAuthenticated) {
      // 已登入，添加毛孩到追蹤列表
      const petData = {
        id: animalData.uniqueId, // 使用統一的寵物識別符
        name: animalData.petName,
        title: animalData.title,
        image: animalData.images[0], // 使用第一張圖片作為卡片圖片
        breed: animalData.description,
        location: animalData.location
      }
      
      // 從 localStorage 讀取最新的用戶數據，確保數據同步
      const savedUser = localStorage.getItem('pf_auth_user')
      let currentUser = user
      if (savedUser) {
        currentUser = JSON.parse(savedUser)
      }
      
      // 檢查是否已經追蹤過
      const currentTrackedPets = currentUser?.trackedPets || []
      const isAlreadyTracked = currentTrackedPets.some(pet => pet.id === animalData.uniqueId)
      
      // 調試信息
      console.log('Current tracked pets:', currentTrackedPets)
      console.log('Pet unique ID to track:', animalData.uniqueId)
      console.log('Is already tracked:', isAlreadyTracked)
      
      if (!isAlreadyTracked) {
        // 添加到追蹤列表
        const updatedTrackedPets = [...currentTrackedPets, petData]
        updateUser({ trackedPets: updatedTrackedPets })
        alert('已加入追蹤列表！')
        // 停留在當前頁面
      } else {
        alert('已經在追蹤列表中了！')
        // 停留在當前頁面
      }
    } else {
      // 未登入，跳轉到登入頁面
      navigate('/login?redirect=' + encodeURIComponent(window.location.hash) + '&action=track')
    }
  }

  // 處理我要領養
  const handleAdopt = () => {
    if (animalData.isAdopted) {
      alert('此毛孩已被認養')
      return
    }
    
    if (isAuthenticated) {
      // 根據動物類型決定需要完成的課程
      let courseId = ''
      let courseTitle = ''
      
      if (animalData.uniqueId === 'pupu') {
        // 噗噗是貓，需要完成貓咪課程
        courseId = 'cat-basics'
        courseTitle = '從零開始養貓的第一天'
      } else if (animalData.uniqueId === 'wulong') {
        // 烏龍是狗，需要完成狗狗課程
        courseId = 'dog-basics'
        courseTitle = '從零開始養狗的第一天'
      }
      
      // 檢查是否已完成所有課程影片
      const isCourseCompleted = checkCourseCompletion(courseId)
      
      if (isCourseCompleted) {
        // 已完成課程，添加卡片到我的認養中
        const petData = {
          id: animalData.uniqueId,
          name: animalData.petName,
          title: animalData.title,
          image: animalData.images[0],
          breed: animalData.description,
          location: animalData.location,
          status: 'pending' // 審核中
        }
        
        // 從 localStorage 讀取最新的用戶數據
        const savedUser = localStorage.getItem('pf_auth_user')
        let currentUser = user
        if (savedUser) {
          currentUser = JSON.parse(savedUser)
        }
        
        // 檢查是否已經在認養列表中
        const currentAdoptedPets = currentUser?.adoptedPets || []
        const isAlreadyAdopted = currentAdoptedPets.some(pet => pet.id === animalData.uniqueId)
        
        if (!isAlreadyAdopted) {
          // 添加到認養列表
          const updatedAdoptedPets = [...currentAdoptedPets, petData]
          updateUser({ adoptedPets: updatedAdoptedPets })
          alert('您的領養申請已提交，正在審核中！')
          // 停留在當前頁面
        } else {
          alert('您已經申請過這隻毛孩的認養了！')
          // 停留在當前頁面
        }
      } else {
        // 未完成課程，直接跳轉到對應課程內頁
        alert(`請先完成「${courseTitle}」課程後再申請領養！`)
        navigate(`/course/${courseId}`)
      }
    } else {
      // 未登入，跳轉到登入頁面
      navigate('/login?redirect=' + encodeURIComponent(window.location.hash) + '&action=adopt')
    }
  }

  // 檢查課程完成狀態
  const checkCourseCompletion = (courseId) => {
    // 從 localStorage 讀取該課程的完成狀態
    const savedCompleted = localStorage.getItem(`course-${courseId}-completed`)
    if (!savedCompleted) {
      return false
    }
    
    try {
      const completedLessons = JSON.parse(savedCompleted)
      
      // 根據課程 ID 決定需要完成的課程影片
      const requiredLessonIds = [
        '1-1', '1-2', '1-3', // 第一章
        '2-1', '2-2', '2-3', // 第二章
        '3-1', '3-2', '3-3', // 第三章
        '4-1', '4-2', '4-3', // 第四章
        '5-1', '5-2', '5-3'  // 第五章
      ]
      
      // 檢查是否所有必需的課程都已完成
      return requiredLessonIds.every(lessonId => completedLessons.includes(lessonId))
    } catch (error) {
      console.error('Error parsing completed lessons:', error)
      return false
    }
  }

  return (
    <>
      {/* 回上一頁按鈕 */}
      <div className="adopt-back-container">
        <button 
          className="back-button"
          onClick={() => navigate('/adopt')}
          aria-label="回到領養總覽"
        >
          <i className="bx bx-arrow-back"></i>
          回到領養總覽
        </button>
      </div>
      
      <div className="adopt-detail">
      <div className="detail-grid">
        <div className="title-row">
          <h2 className="title">{animalData.title}</h2>
          <span className={`status-tag ${animalData.isAdopted ? 'adopted' : 'available'}`}>
            {animalData.isAdopted ? '已被認養' : '尚未認養'}
          </span>
        </div>
        <section className="media-col">
          <div className="main-photo">
            <img src={asset(animalData.images[current])} alt="adopt pet" />
          </div>
          <div className="thumbs">
            {animalData.images.map((src, i) => (
              <button
                key={i}
                className={`thumb ${i === current ? 'selected' : ''}`}
                aria-label={`第 ${i + 1} 張`}
                onClick={() => setCurrent(i)}
              >
                <img src={asset(src)} alt="thumb" />
              </button>
            ))}
          </div>

          <div className="foster-card">
            <div className="avatar" aria-hidden="true">
              <img src={asset(animalData.fosterAvatar)} alt={animalData.fosterName} />
            </div>
            <div className="foster-meta">
              <div className="foster-name">{animalData.fosterName}</div>
            </div>
            <button className="btn-outline small" onClick={() => {
              if (isAuthenticated) {
                setShowContactDialog(true)
              } else {
                // 記住用戶想要做的事情，登入後回到這個頁面並打開對話框
                // 對於 HashRouter，實際的路由資訊在 window.location.hash 中
                const currentHash = window.location.hash
                const currentPathForRedirect = currentHash.startsWith('#') ? currentHash.substring(1) : currentHash
                navigate(`/login?redirect=${encodeURIComponent(currentPathForRedirect)}&action=contact`)
              }
            }}>聯繫出養人</button>
            <div className="foster-bio-sep"></div>
            <div className="foster-bio">{animalData.bio}</div>
          </div>
        </section>

        <section className="right-panels">
          <div className={`panel ${basicOpen ? '' : 'collapsed'}`}>
            <button className="panel-title" onClick={() => setBasicOpen(v => !v)} aria-expanded={basicOpen}>
              <i className={`bx bx-chevron-down chev ${basicOpen ? 'open' : ''}`}></i>
              基本資料
            </button>
            <div className="rows">
              <div className="row">
                <div className="cell">
                  <div className="label">可能出生日期</div>
                  <div className="value">2024年3月</div>
                </div>
                <div className="cell">
                  <div className="label">性別</div>
                  <div className="value">{animalData.description.split(',')[0]}</div>
                </div>
                <div className="cell">
                  <div className="label">介紹</div>
                  <div className="value">活潑可愛，喜歡與人互動</div>
                </div>
              </div>
            </div>
          </div>

          <div className={`panel ${vaxOpen ? '' : 'collapsed'}`}>
            <button className="panel-title" onClick={() => setVaxOpen(v => !v)} aria-expanded={vaxOpen}>
              <i className={`bx bx-chevron-down chev ${vaxOpen ? 'open' : ''}`}></i>
              檢疫資料
            </button>
            <div className="rows">
              <div className="row">
                <div className="cell">
                  <div className="label">是否結紮</div>
                  <div className="value">是</div>
                </div>
                <div className="cell">
                  <div className="label">有無愛滋白血</div>
                  <div className="value">無</div>
                </div>
                <div className="cell">
                  <div className="label">預防針</div>
                  <div className="value">已完成</div>
                </div>
              </div>
              <div className="row">
                <div className="cell">
                  <div className="label">狂犬疫苗</div>
                  <div className="value">已完成</div>
                </div>
                <div className="cell">
                  <div className="label">基本血檢</div>
                  <div className="value">正常</div>
                </div>
                <div className="cell">
                  <div className="label">驅蟲</div>
                  <div className="value">已完成</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 操作按鈕區域 */}
          <div className="action-buttons">
            <button className="btn-favorite" onClick={handleTrack}>
              <i className="bx bx-heart"></i>
              追蹤毛孩
            </button>
            <button className="btn-adopt" onClick={handleAdopt}>
              <i className="bx bx-check"></i>
              我要領養
            </button>
          </div>
        </section>
      </div>
      <section className="bio-section">
        <h3 className="bio-title">自我介紹</h3>
        <p className="bio-content">{animalData.bio}</p>
      </section>
      
      <ContactDialog 
        isOpen={showContactDialog}
        onClose={() => setShowContactDialog(false)}
        fosterName={animalData.fosterName}
        petName={animalData.petName}
        fosterAvatar={animalData.fosterAvatar}
      />
      </div>
    </>
  )
}



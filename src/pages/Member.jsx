import { useRef, useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import ContactDialog from '../components/ContactDialog.jsx'
import './Member.css'

const asset = (p) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`

export default function Member() {
  const { user, logout, login, updateUser } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState('settings')
  const [editing, setEditing] = useState(false)
  const [adoptionFilter, setAdoptionFilter] = useState('all')
  const [selectedPet, setSelectedPet] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [reportPhotos, setReportPhotos] = useState({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [photoToDelete, setPhotoToDelete] = useState(null)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [photoComments, setPhotoComments] = useState({})
  const [newComment, setNewComment] = useState('')
  const nicknameKey = user?.email ? `pf_profile_nickname:${user.email}` : 'pf_profile_nickname'
  const [form, setForm] = useState({
    fullName: user?.name || localStorage.getItem('pf_profile_name') || '',
    phone: user?.phone || localStorage.getItem('pf_profile_phone') || '',
    nickname: user?.nickname || localStorage.getItem(nicknameKey) || (user?.email || '').split('@')[0] || '',
    email: user?.email || '',
    birthday: user?.birthday || '',
    address: user?.address || '',
    avatar: localStorage.getItem(user?.email ? `pf_profile_avatar:${user.email}` : 'pf_profile_avatar') || '',
    bio: user?.bio || '',
  })
  const [originalForm, setOriginalForm] = useState({ ...form })
  const [avatarError, setAvatarError] = useState('')
  const [emailError, setEmailError] = useState('')

  // 處理 URL 參數，自動切換到指定頁面
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    const petParam = searchParams.get('pet')
    if (tabParam && ['settings', 'mylistings', 'tracking', 'myadoptions', 'mymessages', 'myreports'].includes(tabParam)) {
      setTab(tabParam)
    }
    if (petParam && tabParam === 'myreports') {
      // 處理特定寵物的回報紀錄
      setSelectedPet(petParam)
    }
  }, [searchParams])

  // 當 user 變化時更新表單
  useEffect(() => {
    if (user) {
      const newForm = {
        fullName: user.name || localStorage.getItem('pf_profile_name') || '',
        phone: user.phone || localStorage.getItem('pf_profile_phone') || '',
        nickname: user.nickname || localStorage.getItem(nicknameKey) || (user.email || '').split('@')[0] || '',
        email: user.email || '',
        birthday: user.birthday || '',
        address: user.address || '',
        avatar: user.avatar || localStorage.getItem(user.email ? `pf_profile_avatar:${user.email}` : 'pf_profile_avatar') || '',
        bio: user.bio || '',
      }
      setForm(newForm)
      setOriginalForm(newForm)
    }
  }, [user, nicknameKey])

  // 載入已保存的回報照片（只載入已成功認養的毛孩）
  useEffect(() => {
    console.log('useEffect triggered, user:', user)
    if (user && user.adoptedPets) {
      console.log('User adoptedPets:', user.adoptedPets)
      const savedPhotos = {}
      const adoptedPets = []
      
      // 使用傳統for循環替代filter
      for (let i = 0; i < user.adoptedPets.length; i++) {
        const pet = user.adoptedPets[i]
        if (pet.status === 'adopted') {
          adoptedPets.push(pet)
        }
      }
      
      console.log('Adopted pets found:', adoptedPets)
      
      // 使用傳統for循環替代forEach
      for (let i = 0; i < adoptedPets.length; i++) {
        const pet = adoptedPets[i]
        const saved = localStorage.getItem('report-photos-' + pet.id)
        console.log('Checking pet:', pet.id, 'saved:', saved)
        
        if (saved) {
          try {
            savedPhotos[pet.id] = JSON.parse(saved)
            console.log('Loaded saved photos for', pet.id, ':', savedPhotos[pet.id])
          } catch (e) {
            console.error('Error parsing saved photos:', e)
            // 如果解析失敗，載入預設數據
            if (pet.id === 'wawa') {
              console.log('Loading demo photos for wawa (fallback)')
              const currentYear = new Date().getFullYear()
              const demoPhotos = {
                [currentYear + '-09-01']: [
                  {
                    id: Date.now() - 1000000,
                    data: '/Purrfurry/adopt16-1.JPG',
                    timestamp: currentYear + '-09-01T10:00:00.000Z'
                  }
                ],
                [currentYear + '-09-10']: [
                  {
                    id: Date.now() - 500000,
                    data: '/Purrfurry/adopt16-2.JPG',
                    timestamp: currentYear + '-09-10T15:30:00.000Z'
                  }
                ]
              }
              savedPhotos[pet.id] = demoPhotos
              // 保存到localStorage
              localStorage.setItem(`report-photos-${pet.id}`, JSON.stringify(demoPhotos))
            }
          }
        } else {
          // 預設一些演示數據
          if (pet.id === 'wawa') {
            console.log('Loading demo photos for wawa')
            const currentYear = new Date().getFullYear()
            const demoPhotos = {
              [currentYear + '-09-01']: [
                {
                  id: Date.now() - 1000000,
                  data: '/Purrfurry/adopt16-1.JPG',
                  timestamp: currentYear + '-09-01T10:00:00.000Z'
                }
              ],
              [currentYear + '-09-10']: [
                {
                  id: Date.now() - 500000,
                  data: '/Purrfurry/adopt16-2.JPG',
                  timestamp: currentYear + '-09-10T15:30:00.000Z'
                }
              ]
            }
            console.log('Creating demo photos for year:', currentYear, 'with keys:', Object.keys(demoPhotos))
            savedPhotos[pet.id] = demoPhotos
            console.log('Demo photos created:', demoPhotos)
            // 保存到localStorage
            localStorage.setItem(`report-photos-${pet.id}`, JSON.stringify(demoPhotos))
          }
        }
      }
      
      // 強制創建2025年的預設數據
      if (savedPhotos.wawa) {
        console.log('Current wawa data:', savedPhotos.wawa)
        const currentYear = new Date().getFullYear()
        
        // 檢查是否已經有2025年的數據
        if (!savedPhotos.wawa[currentYear + '-09-01'] || !savedPhotos.wawa[currentYear + '-09-10']) {
          console.log('Creating missing 2025 demo data')
          
          // 創建2025年的數據
          savedPhotos.wawa[currentYear + '-09-01'] = [
            {
              id: Date.now() - 1000000,
              data: '/Purrfurry/adopt16-1.JPG',
              timestamp: currentYear + '-09-01T10:00:00.000Z'
            }
          ]
          savedPhotos.wawa[currentYear + '-09-10'] = [
            {
              id: Date.now() - 500000,
              data: '/Purrfurry/adopt16-2.JPG',
              timestamp: currentYear + '-09-10T15:30:00.000Z'
            }
          ]
          
          // 重新保存到localStorage
          localStorage.setItem('report-photos-wawa', JSON.stringify(savedPhotos.wawa))
          console.log('Created 2025 data:', savedPhotos.wawa)
        } else {
          console.log('2025 data already exists')
        }
      }
      
      console.log('Final savedPhotos:', savedPhotos)
      console.log('Setting reportPhotos state with:', savedPhotos)
      setReportPhotos(savedPhotos)
      
      // Safari 兼容性：多次強制重新渲染
      setTimeout(function() {
        console.log('Safari timeout - forcing re-render')
        const newPhotos = Object.assign({}, savedPhotos)
        setReportPhotos(newPhotos)
      }, 100)
      
      setTimeout(function() {
        console.log('Safari timeout 2 - forcing re-render again')
        const newPhotos = Object.assign({}, savedPhotos)
        setReportPhotos(newPhotos)
      }, 500)
      
      // 額外的Safari修復
      setTimeout(function() {
        console.log('Safari timeout 3 - final re-render')
        const newPhotos = Object.assign({}, savedPhotos)
        setReportPhotos(newPhotos)
      }, 1000)
    }
  }, [user])

  // 刪除照片
  const handleDeletePhoto = (petId, date, photoId) => {
    setPhotoToDelete({ petId, date, photoId })
    setShowDeleteConfirm(true)
  }

  // 確認刪除照片
  const confirmDeletePhoto = () => {
    if (photoToDelete) {
      const { petId, date, photoId } = photoToDelete
      const newPhotos = { ...reportPhotos }
      
      if (newPhotos[petId] && newPhotos[petId][date]) {
        // 如果是數組格式（多張照片）
        if (Array.isArray(newPhotos[petId][date])) {
          newPhotos[petId][date] = newPhotos[petId][date].filter(photo => photo.id !== photoId)
          // 如果該日期沒有照片了，刪除該日期
          if (newPhotos[petId][date].length === 0) {
            delete newPhotos[petId][date]
          }
        } else {
          // 如果是單張照片格式，直接刪除該日期
          delete newPhotos[petId][date]
        }
        
        // 如果該寵物沒有照片了，刪除該寵物
        if (Object.keys(newPhotos[petId]).length === 0) {
          delete newPhotos[petId]
        }
      }
      
      setReportPhotos(newPhotos)
      localStorage.setItem(`report-photos-${petId}`, JSON.stringify(newPhotos[petId] || {}))
    }
    
    setShowDeleteConfirm(false)
    setPhotoToDelete(null)
  }

  // 取消刪除
  const cancelDeletePhoto = () => {
    setShowDeleteConfirm(false)
    setPhotoToDelete(null)
  }

  // 載入照片評論
  useEffect(() => {
    if (user && user.adoptedPets) {
      // 強制清除舊數據並重新創建
      localStorage.removeItem('photo-comments-wawa')
      
      const savedComments = {}
      const adoptedPets = user.adoptedPets.filter(pet => pet.status === 'adopted')
      
      for (const pet of adoptedPets) {
        // 為wawa創建演示留言數據
        if (pet.id === 'wawa') {
          const demoComments = {}
          const currentYear = new Date().getFullYear()
          
          // 創建9/1的留言 - 使用多個可能的照片ID
          demoComments[currentYear + '-09-01'] = {}
          
          // 為9/1創建多個照片ID的留言，確保能匹配到
          const photoIds1 = [
            Date.now() - 1000000,
            Date.now() - 900000,
            Date.now() - 800000,
            1759213272983 // 實際的照片ID
          ]
          
          photoIds1.forEach(photoId => {
            demoComments[currentYear + '-09-01'][photoId] = [
              {
                id: Date.now() - 2000000,
                text: '襪襪來我家的第一天！',
                author: user?.nickname || user?.name || '毛毛',
                authorType: 'adopter',
                timestamp: currentYear + '-09-01T10:30:00.000Z',
                photoId: photoId
              },
              {
                id: Date.now() - 1500000,
                text: '太好了！她看起來狀態不錯。',
                author: '伊娃',
                authorType: 'foster',
                timestamp: currentYear + '-09-01T11:00:00.000Z',
                photoId: photoId
              }
            ]
          })
          
          // 創建9/10的留言 - 使用多個可能的照片ID
          demoComments[currentYear + '-09-10'] = {}
          
          // 為9/10創建多個照片ID的留言，確保能匹配到
          const photoIds = [
            Date.now() - 500000,
            Date.now() - 400000,
            Date.now() - 300000,
            1759213772983, // 實際的9/10照片ID
            1759283054321, // 控制台顯示的ID
            1759283154321, // 控制台顯示的ID
            1759283254321  // 控制台顯示的ID
          ]
          
          photoIds.forEach(photoId => {
            demoComments[currentYear + '-09-10'][photoId] = [
              {
                id: Date.now() - 800000,
                text: '襪襪的黑眼睛好漂亮！',
                author: user?.nickname || user?.name || '毛毛',
                authorType: 'adopter',
                timestamp: currentYear + '-09-10T16:00:00.000Z',
                photoId: photoId
              },
              {
                id: Date.now() - 700000,
                text: '她適應得很好呢！',
                author: '伊娃',
                authorType: 'foster',
                timestamp: currentYear + '-09-10T16:30:00.000Z',
                photoId: photoId
              }
            ]
          })
          
          savedComments[pet.id] = demoComments
          localStorage.setItem(`photo-comments-${pet.id}`, JSON.stringify(demoComments))
        }
      }
      
      setPhotoComments(savedComments)
    }
  }, [user])


  // 點擊照片打開模態框
  const handlePhotoClick = (photo, date) => {
    setSelectedPhoto({ ...photo, date })
    setShowPhotoModal(true)
  }

  // 關閉照片模態框
  const closePhotoModal = () => {
    setShowPhotoModal(false)
    setSelectedPhoto(null)
    setNewComment('')
  }

  // 提交評論
  const handleSubmitComment = () => {
    if (!newComment.trim() || !selectedPhoto) return

    const comment = {
      id: Date.now(),
      text: newComment.trim(),
      author: user?.nickname || user?.name || '毛毛',
      authorType: 'adopter', // 領養人
      timestamp: new Date().toISOString(),
      photoId: selectedPhoto.id
    }

    const newComments = { ...photoComments }
    if (!newComments[selectedPet]) newComments[selectedPet] = {}
    if (!newComments[selectedPet][selectedPhoto.date]) newComments[selectedPet][selectedPhoto.date] = {}
    if (!newComments[selectedPet][selectedPhoto.date][selectedPhoto.id]) {
      newComments[selectedPet][selectedPhoto.date][selectedPhoto.id] = []
    }
    
    newComments[selectedPet][selectedPhoto.date][selectedPhoto.id].push(comment)
    
    setPhotoComments(newComments)
    localStorage.setItem(`photo-comments-${selectedPet}`, JSON.stringify(newComments[selectedPet]))
    setNewComment('')
  }

  // 獲取照片的評論
  const getPhotoComments = () => {
    if (!selectedPhoto || !photoComments[selectedPet]) return []
    
    console.log('=== GET PHOTO COMMENTS DEBUG ===')
    console.log('selectedPhoto:', selectedPhoto)
    console.log('selectedPet:', selectedPet)
    console.log('Looking for date:', selectedPhoto.date)
    console.log('Looking for photoId:', selectedPhoto.id)
    console.log('Available dates:', Object.keys(photoComments[selectedPet] || {}))
    console.log('Available photoIds for this date:', Object.keys(photoComments[selectedPet]?.[selectedPhoto.date] || {}))
    
    const comments = photoComments[selectedPet][selectedPhoto.date]?.[selectedPhoto.id] || []
    console.log('Found comments:', comments)
    console.log('=== END GET PHOTO COMMENTS DEBUG ===')
    
    return comments
  }

  const [cropOpen, setCropOpen] = useState(false)
  const [cropSrc, setCropSrc] = useState('')
  const [imgMeta, setImgMeta] = useState({ w: 0, h: 0 })
  const cropBox = { size: 300 }
  const [zoom, setZoom] = useState(1)
  const [baseScale, setBaseScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragRef = useRef({ dragging: false, x: 0, y: 0 })
  const imgRef = useRef(null)
  
  // 對話框狀態
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState(null)
  
  
  // 頭像刪除功能
  const handleAvatarDelete = () => {
    if (window.confirm('確定要刪除目前的頭像嗎？')) {
      if (editing) {
        // 編輯狀態下，只刪除表單中的頭像
        setForm(prev => ({ ...prev, avatar: '' }))
      } else {
        // 非編輯狀態下，直接設置為空字符串
        updateUser({ avatar: '' })
        // 清除相關的 localStorage
        const avatarKey = user?.email ? `pf_profile_avatar:${user.email}` : 'pf_profile_avatar'
        localStorage.removeItem(avatarKey)
      }
    }
  }

  // 從追蹤列表中移除毛孩
  const removeFromTracking = (petId) => {
    if (window.confirm('確定要取消追蹤這隻毛孩嗎？')) {
      const updatedTrackedPets = user?.trackedPets?.filter(pet => pet.id !== petId) || []
      updateUser({ trackedPets: updatedTrackedPets })
    }
  }

  // 從認養列表中移除毛孩
  const removeFromAdoptions = (petId) => {
    if (window.confirm('確定要移除這隻毛孩的認養記錄嗎？')) {
      const updatedAdoptedPets = user?.adoptedPets?.filter(pet => pet.id !== petId) || []
      updateUser({ adoptedPets: updatedAdoptedPets })
    }
  }

  // 從出養列表中移除毛孩
  const removeFromListings = (listingId) => {
    if (window.confirm('確定要刪除這筆出養資訊嗎？')) {
      const updatedListings = user?.listings?.filter(listing => listing.id !== listingId) || []
      updateUser({ listings: updatedListings })
    }
  }

  // 篩選認養列表
  const filteredAdoptedPets = useMemo(() => {
    if (!user?.adoptedPets) return []
    
    if (adoptionFilter === 'all') {
      return user.adoptedPets
    } else if (adoptionFilter === 'adopted') {
      return user.adoptedPets.filter(pet => pet.status === 'adopted')
    } else if (adoptionFilter === 'pending') {
      return user.adoptedPets.filter(pet => pet.status === 'pending')
    }
    return []
  }, [user?.adoptedPets, adoptionFilter])

  const onAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (!allowed.includes(file.type)) {
      setAvatarError('請選擇 JPG/PNG/WebP 格式的圖片')
      return
    }
    if (file.size > maxSize) {
      setAvatarError('檔案過大，請小於 2MB')
      return
    }
    setAvatarError('')
    const url = URL.createObjectURL(file)
    setCropSrc(url)
    setCropOpen(true)
  }

  useEffect(() => {
    if (!cropOpen || !cropSrc) return
    const img = new Image()
    img.onload = () => {
      setImgMeta({ w: img.width, h: img.height })
      const s0 = Math.max(cropBox.size / img.width, cropBox.size / img.height)
      setBaseScale(s0)
      setZoom(1)
      setOffset({ x: (cropBox.size - img.width * s0) / 2, y: (cropBox.size - img.height * s0) / 2 })
    }
    img.src = cropSrc
  }, [cropOpen, cropSrc])

  const onDragStart = (e) => {
    e.preventDefault()
    const p = e.touches ? e.touches[0] : e
    dragRef.current = { dragging: true, x: p.clientX, y: p.clientY }
  }
  const onDragMove = (e) => {
    if (!dragRef.current.dragging) return
    const p = e.touches ? e.touches[0] : e
    const dx = p.clientX - dragRef.current.x
    const dy = p.clientY - dragRef.current.y
    dragRef.current.x = p.clientX
    dragRef.current.y = p.clientY
    setOffset((o) => ({ x: o.x + dx, y: o.y + dy }))
  }
  const onDragEnd = () => { dragRef.current.dragging = false }

  const applyCrop = () => {
    const canvas = document.createElement('canvas')
    const S = 512
    canvas.width = S
    canvas.height = S
    const ctx = canvas.getContext('2d')
    // clip to circle
    ctx.save()
    ctx.beginPath()
    ctx.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    const scale = baseScale * zoom
    const drawW = imgMeta.w * scale * (S / cropBox.size)
    const drawH = imgMeta.h * scale * (S / cropBox.size)
    const drawX = offset.x * (S / cropBox.size)
    const drawY = offset.y * (S / cropBox.size)
    const img = imgRef.current
    if (img) {
      ctx.drawImage(img, drawX, drawY, drawW, drawH)
    }
    ctx.restore()
    const url = canvas.toDataURL('image/png')
    setForm({ ...form, avatar: url })
    setCropOpen(false)
  }

  return (
    <div className="member-page">
      <aside className="member-sidebar">
        <div className="profile">
          <div className="avatar" aria-hidden="true">
            {user?.avatar && user.avatar !== ''
              ? <img src={user.avatar.startsWith('data:') ? user.avatar : asset(user.avatar)} alt="avatar" />
              : <img src={asset('profile.svg')} alt="default avatar" />}
          </div>
          <div className="name">{originalForm.nickname || (user?.email || '').split('@')[0] || '會員'}</div>
          <div className="email">{user?.email}</div>
          <button className="btn-outline small w-full" onClick={logout}>登出</button>
        </div>
        <nav className="member-nav">
          <button className={tab==='settings'?'active':''} onClick={() => setTab('settings')}>會員設定</button>
          <button className={tab==='mylistings'?'active':''} onClick={() => setTab('mylistings')}>我的出養</button>
          <button className={tab==='tracking'?'active':''} onClick={() => setTab('tracking')}>我的追蹤</button>
          <button className={tab==='myadoptions'?'active':''} onClick={() => setTab('myadoptions')}>我的認養</button>
          <button className={tab==='mymessages'?'active':''} onClick={() => setTab('mymessages')}>我的留言板</button>
          <button className={tab==='myreports'?'active':''} onClick={() => setTab('myreports')}>我的回報紀錄</button>
        </nav>
      </aside>

      <main className="member-content">
        {tab === 'settings' && (
          <section className="panel">
            <h2>會員設定</h2>
            {!editing && (
              <div className="form-grid read">
                <div><strong>姓名</strong><div>{form.fullName || '—'}</div></div>
                <div><strong>手機號碼</strong><div>{form.phone || '—'}</div></div>
                <div className="wide"><strong>信箱</strong><div>{form.email || '—'}</div></div>
                <div><strong>暱稱</strong><div>{form.nickname || '—'}</div></div>
                <div><strong>生日</strong><div>{form.birthday || '—'}</div></div>
                <div className="wide"><strong>住址</strong><div>{form.address || '—'}</div></div>
                <div><strong>頭像</strong>
                  <div className="avatar-preview read">
                    {user?.avatar && user.avatar !== ''
                      ? <img src={user.avatar.startsWith('data:') ? user.avatar : asset(user.avatar)} alt="avatar" />
                      : <img src={asset('profile.svg')} alt="default avatar" />}
                  </div>
                </div>
                <div className="wide"><strong>簡介</strong><div>{form.bio || '—'}</div></div>
                <div className="actions wide">
                  <button type="button" className="btn-outline" onClick={() => setEditing(true)}>修改</button>
                </div>
              </div>
            )}
            {editing && (
              <form className="form-grid" onSubmit={(e)=>e.preventDefault()}>
                <label>姓名<input type="text" value={form.fullName} disabled /><small style={{color:'#c43'}}>需修改請洽客服信箱 support@purrfurry.app</small></label>
                <label>手機號碼<input type="tel" value={form.phone} disabled /><small style={{color:'#c43'}}>需修改請洽客服信箱 support@purrfurry.app</small></label>
                <label>暱稱<input type="text" value={form.nickname} onChange={(e)=>setForm({ ...form, nickname: e.target.value })} /></label>
                <label className="wide">信箱
                  <input type="email" value={form.email} onChange={(e)=>{
                    const v = e.target.value
                    setForm({ ...form, email: v })
                    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
                    setEmailError(ok ? '' : '請輸入有效的電子郵件')
                  }} />
                  {emailError && <small style={{color:'#c43'}}>{emailError}</small>}
                </label>
                <label>生日<input type="date" value={form.birthday} onChange={(e)=>setForm({ ...form, birthday: e.target.value })} /></label>
                <label className="wide">住址<input type="text" value={form.address} onChange={(e)=>setForm({ ...form, address: e.target.value })} /></label>
                <div className="wide avatar-field">
                  <strong>頭像</strong>
                  <div className="avatar-edit">
                    <div className="avatar-preview-container">
                      <div className="avatar-preview">
                        {editing 
                          ? (form.avatar ? <img src={form.avatar} alt="avatar" /> : <img src={asset('profile.svg')} alt="default avatar" />)
                          : (user?.avatar && user.avatar !== ''
                            ? <img src={user.avatar.startsWith('data:') ? user.avatar : asset(user.avatar)} alt="avatar" />
                            : <img src={asset('profile.svg')} alt="default avatar" />)
                        }
                      </div>
                      {editing 
                        ? (form.avatar && form.avatar !== '' && (
                        <button 
                          className="avatar-delete-btn"
                          onClick={handleAvatarDelete}
                          title="刪除頭像"
                        >
                          <i className="bx bx-trash"></i>
                        </button>
                        ))
                        : (user?.avatar && user.avatar !== '' && (
                        <button 
                          className="avatar-delete-btn"
                          onClick={handleAvatarDelete}
                          title="刪除頭像"
                        >
                          <i className="bx bx-trash"></i>
                        </button>
                        ))
                      }
                    </div>
                    <label className="btn-outline small upload-btn">
                      更換頭像
                      <input type="file" accept="image/*" onChange={onAvatarChange} hidden />
                    </label>
                  </div>
                  <div className={`hint ${avatarError ? 'error' : ''}`}>
                    {avatarError || '支援 JPG/PNG/WebP，最大 2MB。建議 1:1，預覽將以圓形自動裁切顯示。'}
                  </div>
                </div>
                <label className="wide">簡介<textarea rows="4" value={form.bio} onChange={(e)=>setForm({ ...form, bio: e.target.value })} /></label>
                <div className="actions wide">
                  <button type="button" className="btn-outline" disabled={!!emailError || !form.email} onClick={()=>{ /* pretend save */
                    // persist nickname/avatar for current (or new) email
                    const currentEmail = user?.email || ''
                    const newEmail = form.email || currentEmail
                    const oldAKey = currentEmail ? `pf_profile_avatar:${currentEmail}` : 'pf_profile_avatar'
                    const newAKey = newEmail ? `pf_profile_avatar:${newEmail}` : oldAKey
                    const oldNKey = nicknameKey
                    const newNKey = newEmail ? `pf_profile_nickname:${newEmail}` : oldNKey
                    if (form.avatar) {
                      localStorage.setItem(newAKey, form.avatar)
                    } else {
                      localStorage.removeItem(newAKey)
                    }
                    if (oldAKey !== newAKey) localStorage.removeItem(oldAKey)
                    localStorage.setItem(newNKey, form.nickname || '')
                    if (oldNKey !== newNKey) localStorage.removeItem(oldNKey)
                    
                    // 更新 user 物件中的資料
                    updateUser({
                      email: newEmail,
                      nickname: form.nickname,
                      avatar: form.avatar || '', // 確保空字串時使用預設頭像
                      bio: form.bio,
                      address: form.address,
                      birthday: form.birthday
                    })
                    
                    setOriginalForm({ ...form })
                    if (newEmail && newEmail !== currentEmail) {
                      login(newEmail)
                    }
                    setEditing(false)
                  }}>儲存</button>
                  <button type="button" className="btn-outline" onClick={()=>{ 
                    setForm(originalForm); 
                    setEditing(false) 
                  }}>清除變更</button>
                </div>
              </form>
            )}
          </section>
        )}
        {tab === 'mylistings' && (
          <section className="panel">
            <div className="listings-header">
              <h2>我的出養</h2>
              <button 
                className="btn-post-adoption"
                onClick={() => navigate('/post-adoption')}
              >
                <i className="bx bx-plus"></i>
                刊登出養毛孩
              </button>
            </div>
            <div className="listings-content">
              {user?.listings?.length > 0 ? (
                <div className="adopted-pets-grid">
                  {user.listings.map((listing, index) => (
                    <div key={listing.id} className="adopted-pet-card">
                      <img 
                        src={listing.images && listing.images.length > 0 ? listing.images[0].data : '/placeholder-cat.jpg'} 
                        alt={listing.petName}
                        onError={(e) => {
                          e.target.src = '/placeholder-cat.jpg'
                        }}
                      />
                      <div className="pet-info">
                        <h3>{listing.petName}</h3>
                        <p>{listing.gender} • {listing.age}</p>
                        <p>{listing.location}</p>
                        <p className="listing-description">
                          {listing.description.length > 80 
                            ? `${listing.description.substring(0, 80)}...` 
                            : listing.description
                          }
                        </p>
                        <div className="listing-stats">
                          <span><i className="bx bx-show"></i> {listing.views}</span>
                          <span><i className="bx bx-message"></i> {listing.inquiries}</span>
                        </div>
                        <span className={`status-badge ${listing.status}`}>
                          {listing.status === 'pending' ? '審核中' : 
                           listing.status === 'approved' ? '已通過' : '已下架'}
                        </span>
                      </div>
                      <button 
                        className="btn-remove" 
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFromListings(listing.id)
                        }}
                      >
                        <i className="bx bx-x"></i>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <i className="bx bx-pet"></i>
                  <p>目前沒有刊登的出養資訊</p>
                  <p className="empty-hint">點擊上方按鈕開始刊登您的毛孩</p>
                </div>
              )}
            </div>
          </section>
        )}
        {tab === 'tracking' && (
          <section className="panel">
            <h2>我的追蹤</h2>
            <div className="tracking-list">
              {user?.trackedPets?.length > 0 ? (
                <div className="tracked-pets-grid">
                  {user.trackedPets.map((pet, index) => (
                    <div 
                      key={index} 
                      className="tracked-pet-card"
                      onClick={() => {
                        // 根據寵物 ID 決定正確的路由參數
                        let routeId = pet.id
                        if (pet.id === 'wawa') {
                          routeId = 'a16'
                        } else if (pet.id === 'pupu') {
                          routeId = 'a4' // 使用 a4 作為噗噗的代表
                        } else if (pet.id === 'wulong') {
                          routeId = 'a15' // 使用 a15 作為烏龍的代表
                        }
                        navigate(`/adopt/${routeId}`)
                      }}
                    >
                      <img src={asset(pet.image)} alt={pet.name} />
                      <div className="pet-info">
                        <h3>{pet.title}</h3>
                        <p>{pet.name}</p>
                        <p>{pet.breed}</p>
                        <p>{pet.location}</p>
                      </div>
                      <button 
                        className="btn-remove" 
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFromTracking(pet.id)
                        }}
                      >
                        <i className="bx bx-x"></i>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p>目前沒有追蹤的毛孩</p>
              )}
            </div>
          </section>
        )}
        {tab === 'myadoptions' && (
          <section className="panel">
            <h2>我的認養</h2>
            <div className="adoption-filters">
              <button 
                className={`filter-btn ${adoptionFilter === 'all' ? 'active' : ''}`}
                onClick={() => setAdoptionFilter('all')}
              >
                全部
              </button>
              <button 
                className={`filter-btn ${adoptionFilter === 'adopted' ? 'active' : ''}`}
                onClick={() => setAdoptionFilter('adopted')}
              >
                已認養
              </button>
              <button 
                className={`filter-btn ${adoptionFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setAdoptionFilter('pending')}
              >
                審核中
              </button>
            </div>
            <div className="adoption-list">
              {filteredAdoptedPets?.length > 0 ? (
                <div className="adopted-pets-grid">
                  {filteredAdoptedPets.map((pet, index) => (
                    <div 
                      key={index} 
                      className="adopted-pet-card"
                      onClick={() => {
                        // 根據寵物 ID 決定正確的路由參數
                        let routeId = pet.id
                        if (pet.id === 'wawa') {
                          routeId = 'a16'
                        } else if (pet.id === 'pupu') {
                          routeId = 'a4' // 使用 a4 作為噗噗的代表
                        } else if (pet.id === 'wulong') {
                          routeId = 'a15' // 使用 a15 作為烏龍的代表
                        }
                        navigate(`/adopt/${routeId}`)
                      }}
                    >
                      <img src={asset(pet.image)} alt={pet.name} />
                      <div className="pet-info">
                        <h3>{pet.title}</h3>
                        <p>{pet.name}</p>
                        <p>{pet.breed}</p>
                        <p>{pet.location}</p>
                        <span className={`status-badge ${pet.status}`}>
                          {pet.status === 'adopted' ? '已認養' : '審核中'}
                        </span>
                      </div>
                      <button 
                        className="btn-remove" 
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFromAdoptions(pet.id)
                        }}
                      >
                        <i className="bx bx-x"></i>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p>
                  {adoptionFilter === 'all' && '目前沒有認養的毛孩'}
                  {adoptionFilter === 'adopted' && '目前沒有已認養的毛孩'}
                  {adoptionFilter === 'pending' && '目前沒有審核中的毛孩'}
                </p>
              )}
            </div>
          </section>
        )}
        {tab === 'mymessages' && (
          <section className="panel">
            <h2>我的留言板</h2>
            <div className="messages-list">
              {user?.messageHistory?.length > 0 ? (
                user.messageHistory
                  .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime))
                  .map((conversation, index) => (
                  <div key={index} className="conversation-item">
                    <div className="conversation-header">
                      <img 
                        src={(() => {
                          // 根據 fosterName 決定使用哪個頭像
                          let avatarFile = 'wawa.jpg'; // 默認頭像
                          if (conversation.fosterName === '貓貓獵人') {
                            avatarFile = 'wawa.jpg';
                          } else if (conversation.fosterName === '狗狗星人') {
                            avatarFile = 'juju.JPG';
                          }
                          return asset(avatarFile);
                        })()} 
                        alt={conversation.fosterName} 
                        className="conversation-avatar" 
                      />
                      <div className="conversation-info">
                        <h3>{conversation.fosterName}</h3>
                        <p className="conversation-pet">關於：{conversation.petName}</p>
                        <p className="conversation-time">{conversation.lastMessageTime}</p>
                      </div>
                    </div>
                    <div className="conversation-preview">
                      <p>{conversation.lastMessage}</p>
                    </div>
                    <button 
                      className="btn-outline small"
                      onClick={() => {
                        // 在會員頁面直接打開對話框
                        setSelectedConversation(conversation)
                        setShowContactDialog(true)
                      }}
                    >
                      繼續對話
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>您還沒有任何留言記錄</p>
                  <p>去領養頁面找找心儀的毛孩吧！</p>
                </div>
              )}
            </div>
          </section>
        )}
        {tab === 'myreports' && (
          <section className="panel">
            <h2>我的回報紀錄</h2>
            <div className="reports-content">
              {!selectedPet ? (
                // 顯示已成功認養的毛孩列表（只顯示 status 為 'adopted' 的）
                user?.adoptedPets && user.adoptedPets.filter(pet => pet.status === 'adopted').length > 0 ? (
                  <div className="adopted-pets-list">
                    {user.adoptedPets.filter(pet => pet.status === 'adopted').map((pet, index) => (
                      <div 
                        key={index} 
                        className="pet-report-card"
                        onClick={() => setSelectedPet(pet.id)}
                      >
                        <img src={asset(pet.image)} alt={pet.name} />
                        <div className="pet-info">
                          <h3>{pet.title}</h3>
                          <p>{pet.name}</p>
                          <p>{pet.breed}</p>
                          <p>{pet.location}</p>
                        </div>
                        <div className="report-status">
                          <i className="bx bx-calendar"></i>
                          <span>查看回報紀錄</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <i className="bx bx-heart"></i>
                    <p>您還沒有成功認養的毛孩</p>
                    <p>去領養頁面找找心儀的毛孩吧！</p>
                  </div>
                )
              ) : (
                // 顯示特定寵物的行事曆
                <div className="pet-calendar">
                  <div className="calendar-header">
                    <button 
                      className="back-button"
                      onClick={() => setSelectedPet(null)}
                    >
                      <i className="bx bx-arrow-back"></i>
                      回到毛孩列表
                    </button>
                    <h3>{user.adoptedPets.find(pet => pet.id === selectedPet)?.title}</h3>
                  </div>
                  
                  <div className="calendar-container">
                    <div className="calendar-nav">
                      <button 
                        onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                      >
                        <i className="bx bx-chevron-left"></i>
                      </button>
                      <h4>{selectedDate.getFullYear()}年 {selectedDate.getMonth() + 1}月</h4>
                      <button 
                        onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                      >
                        <i className="bx bx-chevron-right"></i>
                      </button>
                    </div>
                    
                    <div className="calendar-grid">
                      {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                        <div key={day} className="calendar-day-header">{day}</div>
                      ))}
                      {/* 添加空白格子來對齊月份第一天 */}
                      {(() => {
                        const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay()
                        const emptyDays = []
                        for (let i = 0; i < firstDay; i++) {
                          emptyDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
                        }
                        return emptyDays
                      })()}
                      {Array.from({ length: new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate() }, (_, i) => {
                        const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i + 1)
                        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                        const hasPhoto = reportPhotos[selectedPet] && reportPhotos[selectedPet][dateStr] && reportPhotos[selectedPet][dateStr].length > 0
                        
                        // 額外調試：檢查整個reportPhotos結構
                        if (dateStr.includes('09-01') || dateStr.includes('09-10')) {
                          console.log('Full reportPhotos object:', reportPhotos)
                          console.log('selectedPet value:', selectedPet)
                          console.log('reportPhotos[selectedPet]:', reportPhotos[selectedPet])
                          if (reportPhotos[selectedPet]) {
                            console.log('Available dates for this pet:', Object.keys(reportPhotos[selectedPet]))
                          }
                        }
                        
                        // 調試信息
                        if (dateStr.includes('09-01') || dateStr.includes('09-10')) {
                          console.log('Checking date:', dateStr)
                          console.log('dateStr type:', typeof dateStr)
                          console.log('dateStr length:', dateStr.length)
                          console.log('dateStr characters:', dateStr.split('').map(c => c.charCodeAt(0)))
                          console.log('selectedPet:', selectedPet)
                          console.log('reportPhotos:', reportPhotos)
                          console.log('reportPhotos[selectedPet]:', reportPhotos[selectedPet])
                          console.log('Object.keys(reportPhotos[selectedPet]):', Object.keys(reportPhotos[selectedPet] || {}))
                          console.log('reportPhotos[selectedPet][dateStr]:', reportPhotos[selectedPet]?.[dateStr])
                          console.log('reportPhotos[selectedPet][dateStr]?.length:', reportPhotos[selectedPet]?.[dateStr]?.length)
                          console.log('hasPhoto:', hasPhoto)
                        }
                        const isToday = date.toDateString() === new Date().toDateString()
                        
                        return (
                          <div 
                            key={i + 1}
                            className={`calendar-day ${isToday ? 'today' : ''} ${hasPhoto ? 'has-photo' : ''}`}
                            onClick={() => {
                              if (isToday) {
                                // 今天可以提交照片（支援多張）
                                const input = document.createElement('input')
                                input.type = 'file'
                                input.accept = 'image/*'
                                input.multiple = true
                                input.onchange = (e) => {
                                  const files = Array.from(e.target.files)
                                  if (files.length > 0) {
                                    const newPhotos = { ...reportPhotos }
                                    if (!newPhotos[selectedPet]) newPhotos[selectedPet] = {}
                                    if (!newPhotos[selectedPet][dateStr]) newPhotos[selectedPet][dateStr] = []
                                    
                                    // 處理多個文件
                                    let processedCount = 0
                                    files.forEach((file, index) => {
                                      const reader = new FileReader()
                                      reader.onload = (e) => {
                                        newPhotos[selectedPet][dateStr].push({
                                          id: Date.now() + index,
                                          data: e.target.result,
                                          timestamp: new Date().toISOString()
                                        })
                                        processedCount++
                                        
                                        // 當所有文件都處理完成後保存
                                        if (processedCount === files.length) {
                                          console.log('All photos processed, saving:', newPhotos[selectedPet][dateStr])
                                          setReportPhotos(newPhotos)
                                          localStorage.setItem(`report-photos-${selectedPet}`, JSON.stringify(newPhotos[selectedPet]))
                                        }
                                      }
                                      reader.readAsDataURL(file)
                                    })
                                  }
                                }
                                input.click()
                              }
                            }}
                          >
                            <span className="day-number">{i + 1}</span>
                            {hasPhoto && <i className="bx bx-check"></i>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  
                  <div className="photo-gallery">
                    <h4>已提交的照片</h4>
                    <div className="photo-list">
                      {reportPhotos[selectedPet] && Object.entries(reportPhotos[selectedPet]).map(([date, photos]) => {
                        console.log('Rendering photos for date:', date, 'photos:', photos)
                        return Array.isArray(photos) ? 
                          photos.map((photo, index) => (
                            <div key={`${date}-${photo.id || index}`} className="photo-item">
                              <img 
                                src={photo.data} 
                                alt={`回報照片 ${date}`} 
                                onClick={() => handlePhotoClick(photo, date)}
                                className="photo-clickable"
                              />
                              <span className="photo-date">{new Date(date).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                              <span className="photo-count">{index + 1}/{photos.length}</span>
                              <button 
                                className="photo-delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeletePhoto(selectedPet, date, photo.id)
                                }}
                                title="刪除照片"
                              >
                                <i className="bx bx-trash"></i>
                              </button>
                            </div>
                          )) :
                          // 兼容舊格式（單張照片）
                          <div key={date} className="photo-item">
                            <img 
                              src={photos} 
                              alt={`回報照片 ${date}`} 
                              onClick={() => handlePhotoClick({ id: 'single', data: photos }, date)}
                              className="photo-clickable"
                            />
                            <span className="photo-date">{new Date(date).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                            <button 
                              className="photo-delete-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeletePhoto(selectedPet, date, 'single')
                              }}
                              title="刪除照片"
                            >
                              <i className="bx bx-trash"></i>
                            </button>
                          </div>
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
      {cropOpen && (
        <div className="cropper-overlay" onMouseMove={onDragMove} onMouseUp={onDragEnd} onMouseLeave={onDragEnd}
          onTouchMove={onDragMove} onTouchEnd={onDragEnd}>
          <div className="cropper-modal">
            <div className="cropper-box" style={{ width: cropBox.size, height: cropBox.size }}
              onMouseDown={onDragStart} onTouchStart={onDragStart}>
              {cropSrc && (
                <img ref={imgRef} src={cropSrc} alt="crop" style={{
                  position: 'absolute', transformOrigin: 'top left',
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${baseScale * zoom})`
                }} />
              )}
              <div className="cropper-mask" />
            </div>
            <div className="cropper-controls">
              <input type="range" min="1" max="3" step="0.01" value={zoom}
                onChange={(e)=>setZoom(parseFloat(e.target.value))} />
              <div className="cropper-actions">
                <button className="btn-outline" onClick={()=>setCropOpen(false)}>取消</button>
                <button className="btn-outline" onClick={applyCrop}>套用</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 對話框 */}
      {showContactDialog && (
        <ContactDialog 
          isOpen={showContactDialog}
          onClose={() => {
            setShowContactDialog(false)
            setSelectedConversation(null)
          }}
          fosterName={selectedConversation?.fosterName || '貓貓獵人'}
          petName={selectedConversation?.petName || '噗噗'}
          fosterAvatar={(() => {
            if (selectedConversation?.fosterName === '貓貓獵人') {
              return 'wawa.jpg';
            } else if (selectedConversation?.fosterName === '狗狗星人') {
              return 'juju.JPG';
            }
            return 'wawa.jpg'; // 默認頭像
          })()}
        />
      )}

      {/* 照片模態框 */}
      {showPhotoModal && selectedPhoto && (
        <div className="photo-modal-overlay" onClick={closePhotoModal}>
          <div className="photo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="photo-modal-header">
              <h3>照片回報 - {selectedPhoto.date}</h3>
              <button className="photo-modal-close" onClick={closePhotoModal}>
                <i className="bx bx-x"></i>
              </button>
            </div>
            
            <div className="photo-modal-content">
              <div className="photo-display">
                <img src={selectedPhoto.data} alt="回報照片" />
              </div>
              
              <div className="photo-comments">
                <h4>互動留言</h4>
                <div className="comments-list">
                  {(() => {
                    const comments = getPhotoComments()
                    console.log('Rendering comments in JSX:', comments)
                    console.log('Comments length:', comments.length)
                    if (comments.length === 0) {
                      console.log('Showing no comments message')
                      return <div className="no-comments">還沒有留言，快來分享你的想法吧！</div>
                    }
                    console.log('Rendering comment items')
                    return comments.map((comment) => (
                      <div key={comment.id} className={`comment-item ${comment.authorType}`}>
                        <img 
                          src={comment.authorType === 'adopter' ? 
                            (user?.avatar ? asset(user.avatar) : asset('maomao.JPG')) : 
                            asset('wawa.jpg')
                          } 
                          alt={comment.author}
                          className="comment-avatar"
                        />
                        <div className="comment-content">
                          <div className="comment-author">
                            {comment.authorType === 'adopter' ? 
                              (user?.nickname || user?.name || '毛毛') : 
                              comment.author
                            }
                          </div>
                          <div className="comment-bubble">
                            <div className="comment-text">{comment.text}</div>
                          </div>
                          <div className="comment-time">
                            {new Date(comment.timestamp).toLocaleString('zh-TW', { 
                              month: '2-digit', 
                              day: '2-digit', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    ))
                  })()}
                </div>
                
                <div className="comment-input">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="分享你對這張照片的想法..."
                    rows="3"
                  />
                  <button 
                    className="comment-submit-btn"
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim()}
                  >
                    發送留言
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 刪除確認對話框 */}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-dialog">
            <h3>確認刪除</h3>
            <p>您確定要刪除這張照片嗎？此操作無法復原。</p>
            <div className="delete-confirm-buttons">
              <button 
                className="btn-cancel"
                onClick={cancelDeletePhoto}
              >
                取消
              </button>
              <button 
                className="btn-confirm"
                onClick={confirmDeletePhoto}
              >
                確定刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


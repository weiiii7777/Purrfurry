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
    if (tabParam && ['settings', 'mylistings', 'tracking', 'myadoptions', 'mymessages', 'myreports'].includes(tabParam)) {
      setTab(tabParam)
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
                刊登出養貓咪
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
                <p>目前沒有認養的毛孩</p>
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
        {tab === 'myreports' && (<section className="panel"><h2>我的回報紀錄</h2><p>（之後顯示我提交的回報）</p></section>)}
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
    </div>
  )
}


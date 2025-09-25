import { createContext, useContext, useEffect, useState, useMemo } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // 移除自動登入，用戶需要手動登入
    // const raw = localStorage.getItem('pf_auth_user')
    // if (raw) setUser(JSON.parse(raw))
  }, [])

  useEffect(() => {
    if (user) localStorage.setItem('pf_auth_user', JSON.stringify(user))
    else localStorage.removeItem('pf_auth_user')
  }, [user])

  const login = (email) => {
    try {
      // 檢查 localStorage 中是否有保存的用戶資料
      const savedUser = localStorage.getItem('pf_auth_user')
      if (savedUser) {
        // 如果有保存的資料，使用保存的資料
        const parsedUser = JSON.parse(savedUser)
        // 確保頭像路徑正確
        if (parsedUser.avatar && !parsedUser.avatar.startsWith('http') && !parsedUser.avatar.startsWith('data:')) {
          // 如果頭像路徑不包含 BASE_URL，則添加它
          if (!parsedUser.avatar.startsWith(import.meta.env.BASE_URL)) {
            parsedUser.avatar = `${import.meta.env.BASE_URL}${parsedUser.avatar.replace(/^\//, '')}`
          }
        }
        setUser(parsedUser)
      } else {
      // 如果沒有保存的資料，使用預設帳號設定
      const defaultUser = {
        email: 'maomao@purrfurry.com',
        name: '黃大毛',
        phone: '0912345678',
        nickname: '毛毛',
        birthday: '2023-04-09',
        address: '毛毛國襪襪市貓草區凍乾街23號',
        bio: '這是測試帳號的自我介紹',
        avatar: 'maomao.JPG',
        adoptedPets: [
          {
            id: 'wawa', // 統一的寵物識別符
            name: '襪襪',
            title: '眼睛很大一直穿著襪子的襪襪',
            image: 'adopt16-1.JPG',
            breed: '母,0歲',
            location: '高雄市',
            status: 'adopted' // 已認養
          }
        ],
        messageHistory: [
          {
            fosterName: '貓貓獵人',
            fosterAvatar: 'wawa.jpg',
            petName: '噗噗',
            petId: 'a4',
            lastMessage: '感謝您的訊息！我會盡快回覆您。',
            lastMessageTime: '2024-01-15 14:30',
            messages: [
              {
                id: 1,
                sender: 'foster',
                content: '您好！我是出養人，很高興您對我的毛孩感興趣！',
                timestamp: '14:25'
              },
              {
                id: 2,
                sender: 'user',
                content: '您好！我想了解更多關於噗噗的資訊',
                timestamp: '14:28'
              },
              {
                id: 3,
                sender: 'foster',
                content: '感謝您的訊息！我會盡快回覆您。',
                timestamp: '14:30'
              }
            ]
          }
        ]
      }
      setUser(defaultUser)
      
      // 設定預設帳號的貓咪課程觀看記錄
      const catCourseCompleted = [
        '1-1', '1-2', '1-3', // 第一章
        '2-1', '2-2', '2-3', // 第二章
        '3-1', '3-2', '3-3', // 第三章
        '4-1', '4-2', '4-3', // 第四章
        '5-1', '5-2', '5-3'  // 第五章
      ]
      localStorage.setItem('course-cat-basics-completed', JSON.stringify(catCourseCompleted))
    }
    } catch (error) {
      console.error('Login error:', error)
      // 如果發生錯誤，使用預設用戶
      const defaultUser = {
        email: email || 'maomao@purrfurry.com',
        name: '黃大毛',
        phone: '0912345678',
        nickname: '毛毛',
        birthday: '2023-04-09',
        address: '毛毛國襪襪市貓草區凍乾街23號',
        bio: '這是測試帳號的自我介紹',
        avatar: 'maomao.JPG',
        adoptedPets: [],
        messageHistory: []
      }
      setUser(defaultUser)
    }
  }
  const updateUser = (updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : null)
  }
  const logout = () => {
    setUser(null)
    localStorage.removeItem('pf_auth_user')
    // 清除課程觀看紀錄
    localStorage.removeItem('course-cat-basics-completed')
    localStorage.removeItem('course-dog-basics-completed')
  }

  const value = useMemo(() => ({ user, login, logout, updateUser, isAuthenticated: !!user }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() { 
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return null
  return children
}



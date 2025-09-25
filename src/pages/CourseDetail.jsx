import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import './CourseDetail.css'

const asset = (p) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`

// 課程數據
const courseData = {
  'cat-basics': {
    id: 'cat-basics',
    title: '從零開始養貓的第一天',
    description: '學習如何照顧新來的小貓咪，從基礎護理到建立信任關係',
    instructor: '貓咪專家',
    duration: '2小時',
    level: '初學者',
    thumbnail: asset('course-cat.jpg'),
    progress: 0,
    chapters: [
      {
        id: 'ch1',
        title: '第一章：迎接小主子',
        lessons: [
          { id: '1-1', title: '飼養責任與心理準備', duration: '15:30', completed: false },
          { id: '1-2', title: '如何挑選適合的貓咪（來源、品種、性格差異）', duration: '22:45', completed: false },
          { id: '1-3', title: '新家準備：貓砂盆、貓抓板、貓窩、玩具', duration: '18:20', completed: false }
        ]
      },
      {
        id: 'ch2',
        title: '第二章：飲食與健康',
        lessons: [
          { id: '2-1', title: '正確餵養觀念：乾糧、濕糧、生食的差異', duration: '25:15', completed: false },
          { id: '2-2', title: '禁忌食物與常見迷思', duration: '16:40', completed: false },
          { id: '2-3', title: '健康守護：疫苗、驅蟲與基礎醫療', duration: '20:30', completed: false }
        ]
      },
      {
        id: 'ch3',
        title: '第三章：日常照護',
        lessons: [
          { id: '3-1', title: '貓砂管理與如廁習慣', duration: '14:25', completed: false },
          { id: '3-2', title: '清潔與美容：梳毛、洗澡、指甲修剪', duration: '19:10', completed: false },
          { id: '3-3', title: '打造安全又豐富的居家環境', duration: '17:35', completed: false }
        ]
      },
      {
        id: 'ch4',
        title: '第四章：行為與互動',
        lessons: [
          { id: '4-1', title: '認識貓咪的肢體語言（呼嚕、哈氣、踩奶）', duration: '21:50', completed: false },
          { id: '4-2', title: '問題行為處理：抓沙發、半夜暴衝、挑食', duration: '23:15', completed: false },
          { id: '4-3', title: '與貓咪建立信任的互動方式', duration: '18:45', completed: false }
        ]
      },
      {
        id: 'ch5',
        title: '第五章：進階主題',
        lessons: [
          { id: '5-1', title: '多貓共養的技巧與衝突調解', duration: '26:20', completed: false },
          { id: '5-2', title: '老年貓照護與特殊需求', duration: '24:10', completed: false },
          { id: '5-3', title: '緊急狀況急救（中毒、外傷、誤食）', duration: '22:30', completed: false }
        ]
      }
    ]
  },
  'dog-basics': {
    id: 'dog-basics',
    title: '從零開始養狗的第一天',
    description: '掌握狗狗的基本需求，建立良好的生活習慣',
    instructor: '狗狗專家',
    duration: '2.5小時',
    level: '初學者',
    thumbnail: asset('course-dog.jpg'),
    progress: 0,
    chapters: [
      {
        id: 'ch1',
        title: '第一章：迎接毛小孩',
        lessons: [
          { id: '1-1', title: '飼養責任與心理準備', duration: '16:20', completed: false },
          { id: '1-2', title: '如何挑選適合的狗狗（品種、體型、性格）', duration: '24:15', completed: false },
          { id: '1-3', title: '新家準備：籠子、牽繩、狗窩、玩具', duration: '19:30', completed: false }
        ]
      },
      {
        id: 'ch2',
        title: '第二章：飲食與健康',
        lessons: [
          { id: '2-1', title: '飼料與鮮食的選擇', duration: '22:45', completed: false },
          { id: '2-2', title: '狗狗不能吃的食物', duration: '18:25', completed: false },
          { id: '2-3', title: '健康守護：疫苗、驅蟲、心絲蟲防治', duration: '21:40', completed: false }
        ]
      },
      {
        id: 'ch3',
        title: '第三章：日常照護',
        lessons: [
          { id: '3-1', title: '洗澡、梳毛與指甲修剪', duration: '20:15', completed: false },
          { id: '3-2', title: '如廁訓練與生活規範建立', duration: '25:30', completed: false },
          { id: '3-3', title: '居家安全與外出準備', duration: '17:20', completed: false }
        ]
      },
      {
        id: 'ch4',
        title: '第四章：行為與訓練',
        lessons: [
          { id: '4-1', title: '認識狗狗的肢體語言（搖尾巴、低吼、耳朵位置）', duration: '19:45', completed: false },
          { id: '4-2', title: '基礎服從訓練（坐下、等候、回來）', duration: '28:10', completed: false },
          { id: '4-3', title: '問題行為處理：吠叫、分離焦慮、咬東西', duration: '26:35', completed: false }
        ]
      },
      {
        id: 'ch5',
        title: '第五章：進階主題',
        lessons: [
          { id: '5-1', title: '社交化與外出散步技巧', duration: '23:50', completed: false },
          { id: '5-2', title: '老年犬照護與特殊需求', duration: '25:25', completed: false },
          { id: '5-3', title: '緊急狀況急救（中毒、外傷、中暑）', duration: '24:15', completed: false }
        ]
      }
    ]
  }
}

export default function CourseDetail() {
  const params = useParams()
  const { id } = params || {}
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [currentLesson, setCurrentLesson] = useState(null)
  const [expandedChapters, setExpandedChapters] = useState(new Set(['ch1']))
  const [course, setCourse] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [completedLessons, setCompletedLessons] = useState(new Set())

  // 移除自動跳轉邏輯，允許未登入用戶瀏覽課程頁面

  // 從 localStorage 載入已完成的課程
  useEffect(() => {
    const savedCompleted = localStorage.getItem(`course-${id}-completed`)
    if (savedCompleted) {
      try {
        const completedArray = JSON.parse(savedCompleted)
        setCompletedLessons(new Set(completedArray))
      } catch (error) {
        console.error('Error loading completed lessons:', error)
      }
    }
  }, [id])
  const videoRef = useRef(null)

  useEffect(() => {
    if (id && courseData[id]) {
      setCourse(courseData[id])
      // 預設選擇第一個章節的第一個課程
      if (courseData[id].chapters.length > 0 && courseData[id].chapters[0].lessons.length > 0) {
        setCurrentLesson(courseData[id].chapters[0].lessons[0])
      }
    }
  }, [id])

  const toggleChapter = (chapterId) => {
    const newExpanded = new Set(expandedChapters)
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId)
    } else {
      newExpanded.add(chapterId)
    }
    setExpandedChapters(newExpanded)
  }

  const selectLesson = (lesson) => {
    setCurrentLesson(lesson)
    // 切換課程時停止播放，重新顯示播放按鈕
    setIsPlaying(false)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  const handlePlay = () => {
    if (!isAuthenticated) {
      // 未登入，跳轉到登入頁面，保存當前頁面作為重定向目標
      // 使用當前路由的相對路徑，不包含 BASE_URL
      const currentPath = `/course/${id}`
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}&action=course`)
      return
    }
    
    setIsPlaying(true)
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error('Error playing video:', error)
      })
    }
  }

  // 監聽影片播放完成
  const handleVideoEnded = () => {
    if (currentLesson) {
      const newCompleted = new Set([...completedLessons, currentLesson.id])
      setCompletedLessons(newCompleted)
      
      // 保存到 localStorage
      try {
        localStorage.setItem(`course-${id}-completed`, JSON.stringify([...newCompleted]))
      } catch (error) {
        console.error('Error saving completed lessons:', error)
      }
    }
  }

  if (!course) {
    return <div className="course-detail-loading">載入中...</div>
  }

  return (
    <>
      {/* 回上一頁按鈕 */}
      <div className="course-back-container">
        <button 
          className="back-button"
          onClick={() => navigate('/courses')}
          aria-label="回到課程總覽"
        >
          <i className="bx bx-arrow-back"></i>
          回到課程總覽
        </button>
      </div>
      
      <div className="course-detail">
        {/* 課程標題欄 */}
        <div className="course-header">
          <div className="course-title-section">
            <h1 className="course-title">{course.title}</h1>
            <div className="course-meta">
              <span className="instructor">講師：{course.instructor}</span>
              <span className="duration">時長：{course.duration}</span>
              <span className="level">難度：{course.level}</span>
            </div>
          </div>
        </div>

      <div className="course-detail-content">
        {/* 視頻播放區域 */}
        <div className="video-section">
          <div className="video-player">
            <video 
              ref={videoRef}
              className="video-element"
              poster={asset('wawa.jpg')}
              controls
              style={{ display: isPlaying ? 'block' : 'none' }}
              preload="metadata"
              onEnded={handleVideoEnded}
            >
              <source src={asset('wawa.mp4')} type="video/mp4" />
              您的瀏覽器不支援影片播放。
            </video>
            
            {!isPlaying && (
              <div className="video-placeholder">
                <div className="video-title-card">
                  <div className="lesson-number">{currentLesson?.id || '1-1'}</div>
                  <div className="lesson-title">{currentLesson?.title || '課程準備中'}</div>
                  <div className="play-button" onClick={handlePlay} style={{ cursor: 'pointer' }}>
                    <i className="bx bx-play"></i>
                  </div>
                </div>
              </div>
            )}
            
            <div className="video-controls">
              <div className="progress-info">
                <span>上課進度 {course.progress}%</span>
              </div>
            </div>
          </div>
          
        </div>

        {/* 章節列表 */}
        <div className="course-sidebar">
          <div className="chapter-list">
            {course.chapters.map((chapter) => (
              <div key={chapter.id} className="chapter-section">
                <div 
                  className="chapter-header"
                  onClick={() => toggleChapter(chapter.id)}
                >
                  <div className="chapter-info">
                    <span className="chapter-title">{chapter.title}</span>
                    <span className="chapter-duration">
                      {Math.round(chapter.lessons.reduce((total, lesson) => {
                        const [min, sec] = lesson.duration.split(':').map(Number)
                        return total + min * 60 + sec
                      }, 0) / 60)} 分鐘
                    </span>
                  </div>
                  <i className={`bx ${expandedChapters.has(chapter.id) ? 'bx-chevron-up' : 'bx-chevron-down'}`}></i>
                </div>
                
                {expandedChapters.has(chapter.id) && (
                  <div className="lesson-list">
                    {chapter.lessons.map((lesson) => (
                      <div 
                        key={lesson.id}
                        className={`lesson-item ${currentLesson?.id === lesson.id ? 'active' : ''}`}
                        onClick={() => selectLesson(lesson)}
                      >
                        <div className="lesson-info">
                          <div className="lesson-title">{lesson.title}</div>
                          <div className="lesson-duration">{lesson.duration}</div>
                        </div>
                        <div className="lesson-controls">
                          {completedLessons.has(lesson.id) ? (
                            <i className="bx bx-check-circle" style={{ color: '#28a745' }}></i>
                          ) : (
                            <i className="bx bx-play-circle"></i>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </>
  )
}

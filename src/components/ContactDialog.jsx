import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../AuthContext.jsx'
import './ContactDialog.css'

const asset = (p) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`

export default function ContactDialog({ isOpen, onClose, fosterName = '貓貓獵人', petName = '噗噗', fosterAvatar = 'wawa.jpg' }) {
  const { user, updateUser } = useAuth()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const messagesEndRef = useRef(null)

  // 載入現有對話記錄
  useEffect(() => {
    if (isOpen && user?.messageHistory) {
      const existingConversation = user.messageHistory.find(conv => 
        conv.fosterName === fosterName && conv.petName === petName
      )
      
      if (existingConversation && existingConversation.messages) {
        setMessages(existingConversation.messages)
      } else {
        // 如果沒有現有對話，使用預設歡迎訊息
        setMessages([
          {
            id: 1,
            sender: 'foster',
            content: '您好！我是出養人，很高興您對我的毛孩感興趣！',
            timestamp: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
          }
        ])
      }
    }
  }, [isOpen, user?.messageHistory, fosterName, petName])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!message.trim()) return
    
    const newMessage = {
      id: messages.length + 1,
      sender: 'user',
      content: message.trim(),
      timestamp: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
    }
    
    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    setMessage('')
    
    // 保存到用戶的訊息歷史
    const conversationKey = `${fosterName}-${petName}`
    const existingHistory = user?.messageHistory || []
    const existingConversationIndex = existingHistory.findIndex(conv => 
      conv.fosterName === fosterName && conv.petName === petName
    )
    
    const conversationData = {
      fosterName,
      fosterAvatar: fosterAvatar.startsWith('http') || fosterAvatar.startsWith('data:') ? fosterAvatar : asset(fosterAvatar),
      petName,
      petId: 'a4', // 可以根據實際寵物 ID 動態設定
      lastMessage: newMessage.content,
      lastMessageTime: new Date().toLocaleDateString('zh-TW') + ' ' + newMessage.timestamp,
      messages: updatedMessages
    }
    
    let updatedHistory
    if (existingConversationIndex >= 0) {
      // 更新現有對話
      updatedHistory = [...existingHistory]
      updatedHistory[existingConversationIndex] = conversationData
    } else {
      // 添加新對話
      updatedHistory = [...existingHistory, conversationData]
    }
    
    updateUser({ messageHistory: updatedHistory })
    
    // 模擬出養人回覆
    setTimeout(() => {
      const replyContent = fosterName === '狗狗星人' 
        ? '汪汪！我是狗狗星人，很高興收到您的訊息！我會盡快回覆您關於狗狗的資訊。'
        : '感謝您的訊息！我會盡快回覆您。'
      
      const replyMessage = {
        id: messages.length + 2,
        sender: 'foster',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
      }
      const finalMessages = [...updatedMessages, replyMessage]
      setMessages(finalMessages)
      
      // 更新訊息歷史
      const finalConversationData = {
        ...conversationData,
        fosterAvatar: fosterAvatar.startsWith('http') || fosterAvatar.startsWith('data:') ? fosterAvatar : asset(fosterAvatar),
        lastMessage: replyMessage.content,
        lastMessageTime: new Date().toLocaleDateString('zh-TW') + ' ' + replyMessage.timestamp,
        messages: finalMessages
      }
      
      const finalHistory = [...(user?.messageHistory || [])]
      if (existingConversationIndex >= 0) {
        finalHistory[existingConversationIndex] = finalConversationData
      } else {
        finalHistory.push(finalConversationData)
      }
      
      updateUser({ messageHistory: finalHistory })
    }, 1000)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) return null

  return (
    <div className="contact-dialog-overlay" onClick={onClose}>
      <div className="contact-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
        <div className="foster-info">
          <img src={fosterAvatar.startsWith('http') || fosterAvatar.startsWith('data:') ? fosterAvatar : asset(fosterAvatar)} alt="foster avatar" className="foster-avatar" />
          <div className="foster-details">
            <h3>{fosterName}</h3>
            <p>出養人</p>
          </div>
        </div>
          <button className="close-btn" onClick={onClose}>
            <i className="bx bx-x"></i>
          </button>
        </div>
        
        <div className="dialog-content">
          <div className="messages-container">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                <div className="message-bubble">
                  <p>{msg.content}</p>
                  <span className="timestamp">{msg.timestamp}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="message-input">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="輸入您的訊息..."
              rows="2"
            />
            <button 
              className="send-btn" 
              onClick={handleSend}
              disabled={!message.trim()}
            >
              <i className="bx bx-send"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

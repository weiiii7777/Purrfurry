import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import './PostAdoption.css'

export default function PostAdoption() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    petName: '',
    petType: '貓咪',
    gender: '',
    age: '',
    breed: '',
    location: '',
    description: '',
    healthStatus: '',
    vaccination: '',
    neutered: '',
    personality: '',
    specialNeeds: '',
    contactInfo: '',
    images: []
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    console.log('Input changed:', name, value) // 調試信息
    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setForm(prev => ({
        ...prev,
        images: [...prev.images, ...files]
      }))
    }
  }

  const removeImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!form.petName.trim()) newErrors.petName = '請輸入毛孩姓名'
    if (!form.gender) newErrors.gender = '請選擇性別'
    if (!form.age) newErrors.age = '請輸入年齡'
    if (!form.location.trim()) newErrors.location = '請輸入所在地區'
    if (!form.description.trim()) newErrors.description = '請輸入毛孩描述'
    if (!form.contactInfo.trim()) newErrors.contactInfo = '請輸入聯絡方式'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', form) // 調試信息
    
    if (!validateForm()) {
      console.log('Validation failed:', errors) // 調試信息
      return
    }
    
    setIsSubmitting(true)
    
    // 處理圖片轉換為 base64
    const processImages = async () => {
      const imagePromises = form.images.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            resolve({
              name: file.name,
              data: e.target.result // base64 數據
            })
          }
          reader.readAsDataURL(file)
        })
      })
      
      const processedImages = await Promise.all(imagePromises)
      
      // 創建出養記錄
      const listingData = {
        id: `listing_${Date.now()}`, // 生成唯一 ID
        petName: form.petName,
        petType: form.petType,
        gender: form.gender,
        age: form.age,
        breed: form.breed,
        location: form.location,
        description: form.description,
        personality: form.personality,
        specialNeeds: form.specialNeeds,
        healthStatus: form.healthStatus,
        vaccination: form.vaccination,
        neutered: form.neutered,
        contactInfo: form.contactInfo,
        images: processedImages, // 保存 base64 圖片數據
        status: 'pending', // 審核中
        createdAt: new Date().toISOString(),
        views: 0,
        inquiries: 0
      }
      
      // 添加到用戶的出養列表
      const currentListings = user?.listings || []
      const updatedListings = [...currentListings, listingData]
      updateUser({ listings: updatedListings })
      
      alert('您的出養資訊已提交，正在審核中！')
      navigate('/member?tab=mylistings')
      setIsSubmitting(false)
    }
    
    // 執行圖片處理
    processImages()
  }

  return (
    <div className="post-adoption">
      <div className="container">
        <div className="header">
          <button 
            className="back-btn"
            onClick={() => navigate('/member?tab=mylistings')}
          >
            <i className="bx bx-arrow-back"></i>
            返回
          </button>
          <h1>刊登出養貓咪</h1>
        </div>

        <form onSubmit={handleSubmit} className="adoption-form">
          <div className="form-section">
            <h2>基本資訊</h2>
            
            <div className="form-group">
              <label htmlFor="petName">毛孩姓名 *</label>
              <input
                type="text"
                id="petName"
                name="petName"
                value={form.petName}
                onChange={handleInputChange}
                placeholder="請輸入毛孩的姓名"
                className={errors.petName ? 'error' : ''}
                autoComplete="off"
              />
              {errors.petName && <span className="error-text">{errors.petName}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="petType">動物種類</label>
                <select
                  id="petType"
                  name="petType"
                  value={form.petType}
                  onChange={handleInputChange}
                >
                  <option value="貓咪">貓咪</option>
                  <option value="狗狗">狗狗</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="gender">性別 *</label>
                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleInputChange}
                  className={errors.gender ? 'error' : ''}
                >
                  <option value="">請選擇</option>
                  <option value="公">公</option>
                  <option value="母">母</option>
                </select>
                {errors.gender && <span className="error-text">{errors.gender}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="age">年齡 *</label>
                <input
                  type="text"
                  id="age"
                  name="age"
                  value={form.age}
                  onChange={handleInputChange}
                  placeholder="例如：2歲"
                  className={errors.age ? 'error' : ''}
                />
                {errors.age && <span className="error-text">{errors.age}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="breed">品種</label>
                <input
                  type="text"
                  id="breed"
                  name="breed"
                  value={form.breed}
                  onChange={handleInputChange}
                  placeholder="例如：米克斯"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">所在地區 *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={form.location}
                onChange={handleInputChange}
                placeholder="例如：台北市"
                className={errors.location ? 'error' : ''}
              />
              {errors.location && <span className="error-text">{errors.location}</span>}
            </div>
          </div>

          <div className="form-section">
            <h2>詳細描述</h2>
            
            <div className="form-group">
              <label htmlFor="description">毛孩描述 *</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleInputChange}
                placeholder="請詳細描述毛孩的個性、習慣、喜好等..."
                rows="4"
                className={errors.description ? 'error' : ''}
              />
              {errors.description && <span className="error-text">{errors.description}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="personality">個性特點</label>
              <textarea
                id="personality"
                name="personality"
                value={form.personality}
                onChange={handleInputChange}
                placeholder="例如：活潑好動、溫和親人、喜歡玩球..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="specialNeeds">特殊需求</label>
              <textarea
                id="specialNeeds"
                name="specialNeeds"
                value={form.specialNeeds}
                onChange={handleInputChange}
                placeholder="例如：需要特殊飲食、醫療需求等..."
                rows="3"
              />
            </div>
          </div>

          <div className="form-section">
            <h2>健康狀況</h2>
            
            <div className="form-group">
              <label htmlFor="healthStatus">健康狀況</label>
              <textarea
                id="healthStatus"
                name="healthStatus"
                value={form.healthStatus}
                onChange={handleInputChange}
                placeholder="請描述毛孩目前的健康狀況..."
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="vaccination">疫苗接種</label>
                <select
                  id="vaccination"
                  name="vaccination"
                  value={form.vaccination}
                  onChange={handleInputChange}
                >
                  <option value="">請選擇</option>
                  <option value="已完成">已完成</option>
                  <option value="部分完成">部分完成</option>
                  <option value="未接種">未接種</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="neutered">結紮狀況</label>
                <select
                  id="neutered"
                  name="neutered"
                  value={form.neutered}
                  onChange={handleInputChange}
                >
                  <option value="">請選擇</option>
                  <option value="已結紮">已結紮</option>
                  <option value="未結紮">未結紮</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>照片上傳</h2>
            
            <div className="form-group">
              <label>上傳照片</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="file-input"
              />
              <p className="help-text">可上傳多張照片，建議至少3張</p>
            </div>

            {form.images.length > 0 && (
              <div className="image-preview">
                <h3>已上傳的照片</h3>
                <div className="image-grid">
                  {form.images.map((file, index) => (
                    <div key={index} className="image-item">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`預覽 ${index + 1}`}
                        onLoad={(e) => URL.revokeObjectURL(e.target.src)} // 釋放內存
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="remove-image"
                      >
                        <i className="bx bx-x"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-section">
            <h2>聯絡資訊</h2>
            
            <div className="form-group">
              <label htmlFor="contactInfo">聯絡方式 *</label>
              <input
                type="text"
                id="contactInfo"
                name="contactInfo"
                value={form.contactInfo}
                onChange={handleInputChange}
                placeholder="請輸入您的聯絡方式（電話、Line ID等）"
                className={errors.contactInfo ? 'error' : ''}
              />
              {errors.contactInfo && <span className="error-text">{errors.contactInfo}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/member?tab=mylistings')}
              className="btn-cancel"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-submit"
            >
              {isSubmitting ? '刊登中...' : '刊登出養資訊'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Questionnaire.css'

const asset = (p) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`

export default function Questionnaire() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [answers, setAnswers] = useState({})
  
  const questions = [
    {
      id: 'animal',
      title: '請問您想領養哪種動物？',
      options: [
        { value: 'cat', label: '貓' },
        { value: 'dog', label: '狗' }
      ]
    },
    {
      id: 'age',
      title: '請問您比較想領養哪個年齡階段？',
      options: [
        { value: 'young', label: '幼年（小於 1 歲）' },
        { value: 'adult', label: '成年（1–7 歲）' },
        { value: 'senior', label: '熟齡（7 歲以上）' }
      ]
    },
    {
      id: 'pets',
      title: '請問您的家庭環境有其他寵物嗎？',
      options: [
        { value: 'none', label: '沒有其他寵物' },
        { value: 'cats', label: '有其他貓' },
        { value: 'dogs', label: '有其他狗' },
        { value: 'both', label: '有貓也有狗' }
      ]
    },
    {
      id: 'experience',
      title: '請問您有飼養貓或狗的經驗嗎？',
      options: [
        { value: 'yes', label: '有' },
        { value: 'no', label: '沒有' }
      ]
    },
    {
      id: 'space',
      title: '請問您的居住空間狀況？',
      options: [
        { value: 'small', label: '套房／小坪數' },
        { value: 'medium', label: '公寓／一般家庭' },
        { value: 'large', label: '透天／大坪數' }
      ]
    },
    {
      id: 'schedule',
      title: '請問您平常的作息與在家時間？',
      options: [
        { value: 'home', label: '長時間在家（遠距／彈性工作）' },
        { value: 'away', label: '不常在家（上班上課時間長）' }
      ]
    },
    {
      id: 'interaction',
      title: '請問您希望和寵物的互動方式是？',
      options: [
        { value: 'active', label: '活潑好動，喜歡陪玩' },
        { value: 'calm', label: '安靜溫和，陪伴為主' }
      ]
    }
  ]

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleNext = () => {
    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1)
    } else {
      // 完成問卷，跳轉到領養總覽頁面並傳遞篩選條件
      const animal = answers.animal
      const age = answers.age
      
      // 跳轉到領養總覽頁面，並傳遞篩選條件
      navigate('/adopt', { 
        state: { 
          fromQuestionnaire: true,
          questionnaireAnswers: answers,
          filterCriteria: {
            animal: animal,
            age: age
          }
        } 
      })
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const currentQuestion = questions[currentStep - 1]
  const isAnswered = answers[currentQuestion.id]
  const isLastStep = currentStep === questions.length

  return (
    <div className="questionnaire-page">
      <div className="questionnaire-container">
        {/* 進度條 */}
        <div className="progress-section">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentStep / questions.length) * 100}%` }}
            ></div>
          </div>
          <div className="progress-text">
            第 {currentStep} 題，共 {questions.length} 題
          </div>
        </div>

        {/* 問題內容 */}
        <div className="question-section">
          <h2 className="question-title">{currentQuestion.title}</h2>
          
          <div className="options-container">
            {currentQuestion.options.map((option, index) => (
              <label 
                key={option.value}
                className={`option-item ${answers[currentQuestion.id] === option.value ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={option.value}
                  checked={answers[currentQuestion.id] === option.value}
                  onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                />
                <span className="option-label">
                  <span className="option-number">{index + 1}.</span>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 導航按鈕 */}
        <div className="navigation-section">
          {currentStep > 1 && (
            <button 
              className="btn-previous"
              onClick={handlePrevious}
            >
              <i className="bx bx-chevron-left"></i>
              上一題
            </button>
          )}
          
          <button 
            className={`btn-next ${!isAnswered ? 'disabled' : ''}`}
            onClick={handleNext}
            disabled={!isAnswered}
          >
            {isLastStep ? '完成問卷' : '下一題'}
            {!isLastStep && <i className="bx bx-chevron-right"></i>}
          </button>
        </div>
      </div>
    </div>
  )
}

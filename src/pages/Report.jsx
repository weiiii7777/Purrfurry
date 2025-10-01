import { useState } from 'react'
import './Report.css'

export default function Report() {
  const [expandedItems, setExpandedItems] = useState(new Set())

  const faqData = [
    {
      id: 1,
      question: "我需要什麼資格才能領養？",
      answer: "在透明毛襪，領養並不僅僅是填寫申請表。我們希望每位領養人都能真正理解「領養是一輩子的責任」。因此，你需要先完成平台的基礎課程或參與相關活動，獲得認證後才具備領養資格。這些課程會介紹基本的飼養知識、醫療照護常識，以及領養後可能遇到的挑戰。透過這個機制，我們確保每一段領養關係，都是在理解與承諾之上開始的。"
    },
    {
      id: 2,
      question: "平台上的資訊可信嗎？",
      answer: "是的，透明毛襪的最大特色就是「資訊透明」。我們會公開毛孩的完整醫療紀錄（如疫苗接種、結紮、健康檢查）、日常生活紀要（飲食習慣、個性描述），以及愛爸愛媽的照護心得。這些資訊經過平台審核與彙整，避免誤導或隱匿。這樣做的目的，是希望領養人能根據「真實完整的資訊」做出選擇，而不是帶著不確定或幻想去領養。"
    },
    {
      id: 3,
      question: "領養流程會很複雜嗎？",
      answer: "不會。我們特別設計了一個清晰的三步驟流程，簡化了傳統領養的繁瑣：\n\n教育與認證：先完成課程或活動，了解基本飼養責任。\n透明介面瀏覽：填寫問卷後，系統會推薦合適的毛孩，你也可以自由搜尋、篩選，並查看完整資訊。\n交流與回報：與愛爸愛媽溝通，雙方確認合適後即可完成領養。之後，你還能透過平台回報毛孩的近況。\n\n整體設計的理念，就是「讓流程簡單，但資訊不簡化」，確保過程高效率又安心。"
    },
    {
      id: 4,
      question: "領養後還需要做什麼嗎？",
      answer: "領養不是結束，而是新的開始。在透明毛襪，我們鼓勵領養人使用「回報系統」，定期分享毛孩的生活近況。這樣做的目的有三個：\n\n讓愛爸愛媽安心：中途付出心力照顧的愛爸愛媽，能持續看到毛孩過得幸福。\n建立公開紀錄：其他潛在領養人可以參考這些回報，了解平台的真實案例。\n形成社群力量：領養人彼此之間也能互相支持、交流心得。\n\n這是一種雙向的陪伴機制，讓每段領養關係都有持續的溫度。"
    },
    {
      id: 5,
      question: "如果我是第一次養寵物，還能領養嗎？",
      answer: "可以。透明毛襪特別設計了「新手友善」的問卷與課程系統。如果你沒有經驗，問卷會幫助你釐清生活習慣與期待，並自動過濾掉需要高度專業照顧的毛孩。同時，我們也提供豐富的教育資源，讓新手可以循序漸進地學習，從基本的飲食、貓砂盆/散步訓練，到健康檢查的注意事項。換句話說，沒有經驗並不會成為阻礙，而是學習與成長的起點。"
    },
    {
      id: 6,
      question: "平台可以同時找貓跟狗嗎？",
      answer: "當然可以。透明毛襪的搜尋與篩選功能，支援貓狗分開或一起查看。你可以按照「種類、年齡、性格、健康狀況」等條件篩選，也能直接輸入標籤（例如：幼貓、新手適合、安靜型），快速找到理想的毛孩。我們的目標是讓領養人「先了解自己，再認識毛孩」，透過精準的配對，避免錯誤期待，幫助你找到真正適合的陪伴。"
    }
  ]

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  return (
    <div className="faq-page">
      <div className="faq-header">
        <h1>常見問題</h1>
        <p>關於領養流程、平台使用等常見問題的解答</p>
      </div>
      
      <div className="faq-container">
        {faqData.map((item) => (
          <div key={item.id} className="faq-item">
            <button 
              className="faq-question"
              onClick={() => toggleExpanded(item.id)}
              aria-expanded={expandedItems.has(item.id)}
            >
              <span className="faq-question-text">{item.question}</span>
              <i className={`bx ${expandedItems.has(item.id) ? 'bx-chevron-up' : 'bx-chevron-down'}`}></i>
            </button>
            
                     <div className={`faq-answer ${expandedItems.has(item.id) ? 'show' : ''}`}>
                       <p style={{ whiteSpace: 'pre-line' }}>{item.answer}</p>
                     </div>
          </div>
        ))}
      </div>
    </div>
  )
}




import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import LazyImage from '../components/LazyImage'
import './Adopt.css'

const asset = (p) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`

const ALL_ANIMALS = [
  {
    id: 'a1',
    title: '天天都要蹭人的',
    name: '小瑪',
    sex: '母',
    age: '1歲',
    area: '新北市',
    kind: '貓咪',
    foster: '貓貓獵人',
    image: 'adopt1.png',
  },
  { id: 'a2', title: '拍照都像沒睡飽的', name: '布魯', sex: '公', age: '2歲', area: '台北市', kind: '貓咪', foster: '貓貓獵人', image: 'adopt2.png' },
  { id: 'a3', title: '很喜歡偷笑的', name: '奶油', sex: '公', age: '3歲', area: '新北市', kind: '貓咪', foster: '貓貓獵人', image: 'adopt3.png' },
  { id: 'a4', title: '拍照都像沒睡飽的', name: '噗噗', sex: '母', age: '1歲', area: '台北市', kind: '貓咪', foster: '貓貓獵人', image: 'adopt4.png' },
  { id: 'a5', title: '像在cos蝙蝠俠的', name: '黑糖', sex: '母', age: '0歲', area: '台北市', kind: '貓咪', foster: '貓貓獵人', image: 'adopt5.png' },
  { id: 'a6', title: '一些小介紹', name: '米香', sex: '公', age: '5歲', area: '桃園市', kind: '貓咪', foster: '貓貓獵人', image: 'adopt6.png' },
  { id: 'a7', title: '一些小介紹', name: '豆花', sex: '母', age: '8歲', area: '新北市', kind: '貓咪', foster: '貓貓獵人', image: 'adopt7.png' },
  { id: 'a8', title: '一些小介紹', name: '布丁', sex: '公', age: '2歲', area: '新竹市', kind: '狗狗', foster: '狗狗星人', image: 'adopt8.png' },
  { id: 'a9', title: '一些小介紹', name: '奶茶', sex: '母', age: '9歲', area: '台北市', kind: '狗狗', foster: '狗狗星人', image: 'adopt9.png' },
  { id: 'a10', title: '一些小介紹', name: '咖啡', sex: '公', age: '0歲', area: '新北市', kind: '狗狗', foster: '狗狗星人', image: 'adopt10.png' },
  { id: 'a11', title: '一些小介紹', name: '可可', sex: '母', age: '3歲', area: '台北市', kind: '狗狗', foster: '狗狗星人', image: 'adopt11.png' },
  { id: 'a12', title: '一些小介紹', name: '抹茶', sex: '公', age: '6歲', area: '桃園市', kind: '狗狗', foster: '狗狗星人', image: 'adopt12.png' },
  { id: 'a13', title: '一些小介紹', name: '紅茶', sex: '母', age: '10歲', area: '新竹市', kind: '狗狗', foster: '狗狗星人', image: 'adopt13.png' },
  { id: 'a14', title: '一些小介紹', name: '綠茶', sex: '公', age: '7歲', area: '台北市', kind: '狗狗', foster: '狗狗星人', image: 'adopt14.png' },
  { id: 'a15', title: '小小年紀就一把年紀的', name: '烏龍', sex: '公', age: '4歲', area: '高雄市', kind: '狗狗', foster: '狗狗星人', image: 'adopt15.png' },
]

const KINDS = ['全部', '貓咪', '狗狗']
const AREAS = ['全部', '台北市', '新北市', '桃園市', '新竹市', '高雄市']
const AGES = ['全部', '0-1', '1-3', '3-5', '5-8', '8以上']

export default function Adopt() {
  const navigate = useNavigate()
  const location = useLocation()
  const [kind, setKind] = useState('全部')
  const [area, setArea] = useState('全部')
  const [age, setAge] = useState('全部')
  const [keyword, setKeyword] = useState('')
  const [fromQuestionnaire, setFromQuestionnaire] = useState(false)

  // 處理問卷結果
  useEffect(() => {
    if (location.state?.fromQuestionnaire && location.state?.filterCriteria) {
      const { animal, age: questionnaireAge } = location.state.filterCriteria
      
      // 根據問卷結果設置篩選條件
      if (animal === 'cat') {
        setKind('貓咪')
      } else if (animal === 'dog') {
        setKind('狗狗')
      }
      
      // 根據年齡設置篩選條件
      if (questionnaireAge === 'young') {
        setAge('0-1')
      } else if (questionnaireAge === 'adult') {
        setAge('1-3')
      } else if (questionnaireAge === 'senior') {
        setAge('8以上')
      }
      
      setFromQuestionnaire(true)
    }
  }, [location.state])

  const filtered = useMemo(() => {
    return ALL_ANIMALS.filter((a) => {
      if (kind !== '全部' && a.kind !== kind) return false
      if (area !== '全部' && a.area !== area) return false
      if (age !== '全部') {
        const animalAge = parseInt(a.age.replace('歲', ''))
        if (age === '0-1' && animalAge !== 0) return false
        if (age === '1-3' && (animalAge < 1 || animalAge > 3)) return false
        if (age === '3-5' && (animalAge < 3 || animalAge > 5)) return false
        if (age === '5-8' && (animalAge < 5 || animalAge > 8)) return false
        if (age === '8以上' && animalAge < 8) return false
      }
      const kw = keyword.trim()
      if (kw && !(a.name.includes(kw) || (a.foster && a.foster.includes(kw)))) return false
      return true
    })
  }, [kind, area, age, keyword])

  return (
    <div className="adopt-page">
      <div className="adopt-filters">
        <label>
          動物種類：
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            {KINDS.map((k) => (
              <option key={k} value={k}>{k === '全部' ? '動物種類' : k}</option>
            ))}
          </select>
        </label>
        <label>
          地區：
          <select value={area} onChange={(e) => setArea(e.target.value)}>
            {AREAS.map((k) => (
              <option key={k} value={k}>{k === '全部' ? '地區' : k}</option>
            ))}
          </select>
        </label>
        <label>
          年齡：
          <select value={age} onChange={(e) => setAge(e.target.value)}>
            {AGES.map((k) => (
              <option key={k} value={k}>{k === '全部' ? '年齡' : k}</option>
            ))}
          </select>
        </label>
        <label className="keyword">
          關鍵字：
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="請輸入出養人姓名或毛孩姓名" />
        </label>
      </div>

      <div className="adopt-grid">
        {filtered.map((a) => (
          <article key={a.id} className="adopt-card" role="button" onClick={() => navigate(`/adopt/${a.id}`)}>
            <div className="card-inner">
              <div className="media">
                <LazyImage src={a.image} alt={a.name} />
              </div>
              <div className="body">
                <h4 className="name">{a.title}</h4>
                <ul className="meta">
                  <li>{a.name}</li>
                  <li>{a.sex},{a.age}</li>
                  <li>{a.area}</li>
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}





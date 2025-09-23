import { useParams, Link } from 'react-router-dom'

const asset = (p) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`

const MOCK = {
  'adopt-brief': {
    title: '領養說明會',
    image: 'adopt1.webp',
    date: '09.27', year: '2025', weekday: 'Sat.', place: '台北市信義區動物之家'
  },
  'meet-cats': {
    title: '貓咪見面會',
    image: 'adopt1.webp',
    date: '10.12', year: '2025', weekday: 'Sun.', place: '新北市板橋動物之家'
  },
  'volunteer-brief': {
    title: '收容志工說明',
    image: 'adopt1.webp',
    date: '11.02', year: '2025', weekday: 'Sun.', place: '台中市動物之家'
  }
}

export default function EventDetail() {
  const { id } = useParams()
  const data = MOCK[id] || {}
  return (
    <div className="page">
      <div style={{ maxWidth: 960, padding: '2rem' }}>
        <Link to="/">← 回首頁</Link>
        <h2 style={{ marginTop: '1rem' }}>{data.title || '活動詳情'}</h2>
        {data.image && (
          <img src={asset(data.image)} alt={data.title} style={{ width: '100%', borderRadius: 16, marginTop: 16 }} />
        )}
        <p style={{ marginTop: 16 }}>{data.year} {data.date} {data.weekday}</p>
        <p>{data.place}</p>
      </div>
    </div>
  )
}



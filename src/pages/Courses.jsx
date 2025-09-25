import { Link } from 'react-router-dom'
import './Courses.css'

const asset = (p) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`

const courses = [
  {
    id: 'cat-basics',
    title: '從零開始養貓的第一天',
    description: '學習如何照顧新來的小貓咪，從基礎護理到建立信任關係',
    instructor: '貓咪專家',
    duration: '2小時',
    level: '初學者',
    thumbnail: asset('course-cat.jpg'),
    progress: 0
  },
  {
    id: 'dog-basics', 
    title: '從零開始養狗的第一天',
    description: '掌握狗狗的基本需求，建立良好的生活習慣',
    instructor: '狗狗專家',
    duration: '2.5小時',
    level: '初學者',
    thumbnail: asset('course-dog.jpg'),
    progress: 0
  }
]

export default function Courses() {
  return (
    <div className="courses-page">
      <div className="courses-header">
        <h1>教育課程</h1>
        <p>透過專業課程學習正確的寵物照護知識</p>
      </div>
      
      <div className="courses-grid">
        {courses.map(course => (
          <Link key={course.id} to={`/course/${course.id}`} className="course-card">
            <div className="course-thumbnail">
              <img 
                src={course.thumbnail} 
                alt={course.title}
                onError={(e) => {
                  console.log('Image failed to load:', course.thumbnail);
                  e.target.src = asset('course-cat.jpg'); // fallback
                }}
              />
            </div>
            
            <div className="course-content">
              <h3 className="course-title">{course.title}</h3>
              <p className="course-description">{course.description}</p>
              
              <ul className="course-meta">
                <li>
                  <i className="bx bx-user"></i>
                  {course.instructor}
                </li>
                <li>
                  <i className="bx bx-time"></i>
                  {course.duration}
                </li>
                <li>
                  <i className="bx bx-star"></i>
                  {course.level}
                </li>
              </ul>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

import './index.css'
import Userpanel from './Userpanel/index.jsx'
import AdminPanel from './AdminPanel/index.jsx'
import { Navigate, Route, Routes } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Userpanel />} />
      <Route path="/admin/*" element={<AdminPanel />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

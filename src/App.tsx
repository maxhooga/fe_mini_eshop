import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { OrderPage } from './pages/OrderPage'
import { ThankYouPage } from './pages/ThankYouPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OrderPage />} />
        <Route path="/thank-you/:orderId" element={<ThankYouPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

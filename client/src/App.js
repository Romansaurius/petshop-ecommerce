import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import Home from './pages/Home/Home'
import Menu from './pages/Menu/Menu'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import Checkout from './pages/Checkout/Checkout'
import Admin from './pages/Admin/Admin'
import PaymentResult from './pages/PaymentResult/PaymentResult'
import Profile from './pages/Profile/Profile'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-secondary-50">
            <ScrollToTop />
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/perfil" element={<Profile />} />
                <Route path="/pago/exitoso" element={<PaymentResult status="success" />} />
                <Route path="/pago/fallido" element={<PaymentResult status="failure" />} />
                <Route path="/pago/pendiente" element={<PaymentResult status="pending" />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App

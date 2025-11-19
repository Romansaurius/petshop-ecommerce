import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-white mt-2">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary-100 rounded-full opacity-60 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-16 h-16 bg-secondary-100 rounded-full opacity-40 animate-bounce"></div>
      <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-primary-200 rounded-full opacity-30"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
              <span className="mr-2">🎉</span>
              Envío gratis en compras +$100.000
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-secondary-900 mb-6 leading-tight">
              <span className="text-primary-600">MauLu</span>
              <br />
              <span className="text-3xl lg:text-4xl font-medium text-secondary-600">PetShop</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-secondary-600 mb-4 font-light">
              Amor perruno y actitud felina
            </p>
            <p className="text-lg text-secondary-500 mb-8">
              en un solo lugar.
            </p>
            
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 rounded-2xl mb-8 shadow-lg">
              <p className="text-lg font-medium">
                ✨ Los mejores precios en productos premium para tu mascota
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/menu" 
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                🛍️ Ver Productos
              </Link>
              <Link 
                to="/register" 
                className="border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300"
              >
                Crear Cuenta
              </Link>
            </div>
          </div>
          
          {/* Image/Visual - Placeholder for future logo */}
          <div className="relative hidden lg:block">
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-3xl p-12 text-center">
              <div className="text-8xl mb-4 opacity-20">🐾</div>
              <p className="text-secondary-500 text-lg">Espacio reservado para logo</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
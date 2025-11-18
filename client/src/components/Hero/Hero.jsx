import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <section className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            🐾 E-commerce para Mascotas
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Comederos automáticos Wi-Fi y todo lo que tu mascota necesita
          </p>
          <p className="text-lg mb-8 opacity-80">
            Productos de calidad premium con envío gratis en compras superiores a $50.000
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/menu" className="btn bg-white text-primary-600 hover:bg-secondary-100 px-8 py-4 text-lg font-semibold">
              Ver Productos
            </Link>
            <Link to="/register" className="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 text-lg font-semibold">
              Crear Cuenta
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
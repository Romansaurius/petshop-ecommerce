import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          <div className="text-center lg:text-left">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full mb-6">
              Envío gratis +$75.000 · CABA y GBA
            </span>

            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight tracking-tight">
              <span className="text-primary-600">MauLu</span>
              <br />
              <span className="text-3xl lg:text-4xl font-medium text-gray-500">PetShop</span>
            </h1>

            <p className="text-lg text-gray-500 mb-10 max-w-md mx-auto lg:mx-0">
              Todo lo que tu mascota necesita, en un solo lugar.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                to="/menu"
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Ver productos
              </Link>
              <Link
                to="/register"
                className="border border-gray-200 text-gray-700 hover:border-gray-400 hover:text-gray-900 px-8 py-3.5 rounded-xl font-semibold text-base transition-all duration-200"
              >
                Crear cuenta
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="bg-gray-50 border border-gray-100 rounded-3xl p-10 text-center">
              <div className="text-7xl mb-5">🐕🐱</div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">+1000 productos</h3>
              <p className="text-gray-400 text-sm mb-6">Para perros y gatos</p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: '🍽️', label: 'Comederos' },
                  { icon: '🎾', label: 'Juguetes' },
                  { icon: '🛏️', label: 'Camas' },
                ].map(item => (
                  <div key={item.label} className="bg-white rounded-xl p-3 border border-gray-100">
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <span className="text-xs text-gray-500 font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default Hero

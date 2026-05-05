import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          <div className="text-center flex flex-col items-center lg:items-start">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full mb-8">
              Envio gratis +$35.000 · Malvinas Argentinas, Pilar, San Isidro y alrededores
            </span>

            {/* Logo placeholder */}
            <div className="w-20 h-20 mb-6 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center">
              <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="20" cy="14" rx="6" ry="8" fill="#ff6b35" opacity="0.85"/>
                <ellipse cx="44" cy="14" rx="6" ry="8" fill="#ff6b35" opacity="0.85"/>
                <ellipse cx="10" cy="30" rx="5" ry="7" fill="#ff6b35" opacity="0.85"/>
                <ellipse cx="54" cy="30" rx="5" ry="7" fill="#ff6b35" opacity="0.85"/>
                <ellipse cx="32" cy="42" rx="16" ry="14" fill="#ff6b35"/>
                <ellipse cx="26" cy="40" rx="3" ry="3.5" fill="white" opacity="0.6"/>
                <ellipse cx="38" cy="40" rx="3" ry="3.5" fill="white" opacity="0.6"/>
              </svg>
            </div>

            <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 mb-3 leading-none tracking-tight">
              <span className="text-primary-600">MauLu</span>
            </h1>
            <p className="text-xl lg:text-2xl font-medium text-gray-400 mb-4 tracking-wide">PetShop</p>

            <p className="text-base text-gray-500 max-w-sm text-center lg:text-left">
              Todo lo que tu mascota necesita, en un solo lugar.
            </p>
          </div>

          {/* Cuadro derecho */}
          <div className="relative hidden lg:block">
            <div className="bg-gray-50 border border-gray-100 rounded-3xl p-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-500 mb-3">¿Por qué ser parte de MauLu?</p>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 leading-snug">
                Somos un petshop diferente a los demás.
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Recompensamos a quienes son fieles a nuestra tienda y peluquería. Ofertas exclusivas, programas de fidelización y beneficios reales para vos y tu mascota.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  '🎁 Acumulá puntos con cada compra',
                  '✂️ Descuentos en peluquería para clientes frecuentes',
                  '🔥 Acceso anticipado a ofertas exclusivas',
                  '🚚 Envio gratis desde $35.000 en zonas seleccionadas',
                ].map(item => (
                  <div key={item} className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/register"
                className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
              >
                Crear cuenta para acceder a los beneficios
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default Hero

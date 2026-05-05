import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          <div className="text-center flex flex-col items-center">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full mb-6">
              Envio gratis +$35.000 · Malvinas Argentinas, Pilar, San Isidro y alrededores
            </span>

            <div className="flex items-center gap-4 mb-3">
              {/* Logo placeholder */}
              <div className="w-16 h-16 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 64 64" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="20" cy="14" rx="6" ry="8" fill="#ff6b35" opacity="0.85"/>
                  <ellipse cx="44" cy="14" rx="6" ry="8" fill="#ff6b35" opacity="0.85"/>
                  <ellipse cx="10" cy="30" rx="5" ry="7" fill="#ff6b35" opacity="0.85"/>
                  <ellipse cx="54" cy="30" rx="5" ry="7" fill="#ff6b35" opacity="0.85"/>
                  <ellipse cx="32" cy="42" rx="16" ry="14" fill="#ff6b35"/>
                  <ellipse cx="26" cy="40" rx="3" ry="3.5" fill="white" opacity="0.6"/>
                  <ellipse cx="38" cy="40" rx="3" ry="3.5" fill="white" opacity="0.6"/>
                </svg>
              </div>
              <div className="text-left">
                <h1 className="text-5xl lg:text-6xl font-bold leading-none tracking-tight">
                  <span className="text-primary-600">MauLu</span>
                </h1>
                <p className="text-base font-medium text-gray-400 tracking-widest uppercase">PetShop</p>
              </div>
            </div>

            <p className="text-base text-gray-500 max-w-xs text-center">
              Todo lo que tu mascota necesita, en un solo lugar.
            </p>
          </div>

          {/* Cuadro derecho */}
          <div className="relative">
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

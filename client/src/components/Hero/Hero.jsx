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

            <img
              src="/logo 2.png"
              alt="MauLu PetShop"
              className="w-64 sm:w-72 object-contain"
            />
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

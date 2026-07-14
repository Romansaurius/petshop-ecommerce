import { Link } from 'react-router-dom'

const Hero = () => (
  <section className="bg-secondary-50 border-b border-secondary-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="grid lg:grid-cols-2 gap-16 items-center">

        {/* Logo */}
        <div className="flex flex-col items-center justify-center">
          <img
            src="/logo2 (1).png"
            alt="MauLu PetShop"
            className="w-64 sm:w-80 lg:w-[380px] object-contain"
          />
        </div>

        {/* Card derecha */}
        <div className="bg-white border border-secondary-200 rounded-3xl p-10 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-500 mb-3">
            ¿Por qué ser parte de MauLu?
          </p>
          <h3 className="text-2xl font-semibold text-secondary-800 mb-3 leading-snug">
            Somos un petshop diferente a los demás.
          </h3>
          <p className="text-secondary-500 text-sm leading-relaxed mb-8">
            Recompensamos a quienes son fieles a nuestra tienda y peluquería. Ofertas exclusivas, programas de fidelización y beneficios reales para vos y tu mascota.
          </p>

          <div className="space-y-3 mb-8">
            {[
              'Puntos acumulables y canjeables',
              'Premios increíbles',
              'Acceso anticipado a ofertas',
              'Envío gratis desde $35.000',
            ].map(item => (
              <div key={item} className="flex items-center gap-3 text-sm text-secondary-600">
                <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <Link
            to="/register"
            className="block w-full text-center bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium text-sm transition-all"
          >
            Crear cuenta para acceder a los beneficios
          </Link>
        </div>

      </div>
    </div>
  </section>
)

export default Hero

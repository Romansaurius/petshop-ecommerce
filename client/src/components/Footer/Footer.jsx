

const Footer = () => {
  return (
    <footer className="bg-secondary-800 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">🐾</span>
              </div>
              <h3 className="text-xl font-bold">PetShop</h3>
            </div>
            <p className="text-secondary-300">Todo lo que tu mascota necesita para ser feliz y saludable</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Enlaces</h4>
            <ul className="space-y-2">
              <li><a href="#about" className="text-secondary-300 hover:text-primary-400 transition-colors">Sobre nosotros</a></li>
              <li><a href="#contact" className="text-secondary-300 hover:text-primary-400 transition-colors">Contacto</a></li>
              <li><a href="#privacy" className="text-secondary-300 hover:text-primary-400 transition-colors">Política de privacidad</a></li>
              <li><a href="#terms" className="text-secondary-300 hover:text-primary-400 transition-colors">Términos y condiciones</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Síguenos</h4>
            <div className="flex space-x-4">
              <button className="w-10 h-10 bg-secondary-700 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors">
                <span className="text-sm">📱</span>
              </button>
              <button className="w-10 h-10 bg-secondary-700 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors">
                <span className="text-sm">📷</span>
              </button>
              <button className="w-10 h-10 bg-secondary-700 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors">
                <span className="text-sm">🐦</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contacto</h4>
            <div className="space-y-2 text-secondary-300">
              <p className="flex items-center space-x-2">
                <span>📞</span>
                <span>(123) 456-7890</span>
              </p>
              <p className="flex items-center space-x-2">
                <span>✉️</span>
                <span>info@petshop.com</span>
              </p>
              <p className="flex items-center space-x-2">
                <span>📍</span>
                <span>Calle Principal 123</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-secondary-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-secondary-400 text-sm">
              &copy; 2024 PetShop. Todos los derechos reservados.
            </p>
            <div className="flex items-center space-x-4 text-sm text-secondary-400">
              <span>Hecho con ❤️ para nuestras mascotas</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
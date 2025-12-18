import { useState, useEffect } from 'react'
import { Gift, Star, Award } from 'lucide-react'

const LoyaltyCard = ({ userPurchases = 0, onClose }) => {
  const [scratchedCircles, setScratchedCircles] = useState([])
  const [showReward, setShowReward] = useState(false)
  
  const loyaltyPrograms = [
    {
      id: 1,
      name: 'Baño y Corte Gratis',
      requiredPurchases: 5,
      reward: 'Servicio de peluquería completo',
      icon: '✂️',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 2,
      name: 'Cupón $40.000',
      requiredPurchases: 10,
      reward: '$40.000 en compras',
      icon: '💰',
      color: 'from-green-500 to-green-600'
    }
  ]

  const handleScratch = (circleIndex) => {
    if (!scratchedCircles.includes(circleIndex)) {
      setScratchedCircles([...scratchedCircles, circleIndex])
      
      // Simular que encontró un premio
      if (Math.random() > 0.7) {
        setTimeout(() => setShowReward(true), 500)
      }
    }
  }

  const renderLoyaltyProgram = (program) => {
    const progress = Math.min(userPurchases, program.requiredPurchases)
    const remaining = Math.max(0, program.requiredPurchases - userPurchases)
    const isCompleted = userPurchases >= program.requiredPurchases

    return (
      <div key={program.id} className={`bg-gradient-to-r ${program.color} rounded-xl p-6 text-white mb-4`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{program.icon}</div>
            <div>
              <h3 className="text-lg font-bold">{program.name}</h3>
              <p className="text-sm opacity-90">{program.reward}</p>
            </div>
          </div>
          {isCompleted && <Award className="w-8 h-8 text-yellow-300" />}
        </div>
        
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span>Progreso</span>
            <span>{progress}/{program.requiredPurchases} compras</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${(progress / program.requiredPurchases) * 100}%` }}
            />
          </div>
        </div>
        
        {!isCompleted && (
          <p className="text-sm opacity-90">
            Te faltan {remaining} compras para obtener tu recompensa
          </p>
        )}
        
        {isCompleted && (
          <div className="bg-white/20 rounded-lg p-3 mt-3">
            <p className="text-sm font-medium">¡Felicitaciones! Has desbloqueado esta recompensa</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Gift className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold">Tarjeta de Fidelidad</h2>
                <p className="text-sm opacity-90">¡Rasca y gana premios!</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Cartón de lotería */}
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 mb-6 text-center">
            <h3 className="text-white font-bold text-lg mb-4">¡Rasca los círculos!</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {Array.from({ length: 9 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handleScratch(i)}
                  className={`w-16 h-16 rounded-full border-4 border-white transition-all duration-300 ${
                    scratchedCircles.includes(i)
                      ? 'bg-white text-2xl'
                      : 'bg-gray-300 hover:bg-gray-200 cursor-pointer'
                  }`}
                >
                  {scratchedCircles.includes(i) ? (
                    i === 4 ? '🎁' : i === 7 ? '⭐' : '💎'
                  ) : (
                    '?'
                  )}
                </button>
              ))}
            </div>
            
            {showReward && (
              <div className="bg-white/90 rounded-lg p-4 animate-pulse">
                <div className="text-2xl mb-2">🎉</div>
                <p className="text-gray-800 font-bold">¡Ganaste un descuento del 15%!</p>
                <p className="text-sm text-gray-600">Válido en tu próxima compra</p>
              </div>
            )}
          </div>

          {/* Programas de fidelidad */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              Tus Programas de Fidelidad
            </h3>
            
            {loyaltyPrograms.map(renderLoyaltyProgram)}
          </div>

          {/* Estadísticas */}
          <div className="bg-gray-50 rounded-xl p-4 mt-4">
            <h4 className="font-semibold text-gray-800 mb-2">Tus Estadísticas</h4>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary-600">{userPurchases}</div>
                <div className="text-sm text-gray-600">Compras Realizadas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {loyaltyPrograms.filter(p => userPurchases >= p.requiredPurchases).length}
                </div>
                <div className="text-sm text-gray-600">Recompensas Desbloqueadas</div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button 
              onClick={onClose}
              className="btn btn-primary w-full"
            >
              Continuar Comprando
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoyaltyCard
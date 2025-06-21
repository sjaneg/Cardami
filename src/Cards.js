import React, { useState, useEffect } from 'react'
import { useSprings, animated, to as interpolate } from 'react-spring'
import { useDrag } from 'react-use-gesture'
import { useLocation } from 'react-router-dom'

const cards = [
  'https://upload.wikimedia.org/wikipedia/commons/f/f5/RWS_Tarot_08_Strength.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/5/53/RWS_Tarot_16_Tower.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/9/9b/RWS_Tarot_07_Chariot.jpg',
]

// Color del reverso de la carta
const cardBackColor = '#ffffff'

// Estados de la animación
const ANIMATION_STATES = {
  HIDDEN: 'hidden',
  SLIDING: 'sliding', 
  EXPANDED: 'expanded',
  INTERACTIVE: 'interactive'
}

// Posiciones iniciales (REALMENTE ocultas, fuera de la pantalla)
const from = (i) => ({ 
  x: -600, // MÁS lejos a la izquierda
  y: i * -2, 
  scale: 0.9, 
  rot: 0,
  rotateY: 0
})

// Posiciones durante el deslizamiento (mazo compacto en el centro)
const sliding = (i) => ({
  x: 0, // Todas las cartas en el mismo lugar (mazo)
  y: i * -2, // Solo un poquito de separación vertical
  scale: 0.9,
  rot: 0, // Sin rotación, todas iguales
  rotateY: 0,
  delay: 0 // Todas se mueven juntas
})

// Posiciones expandidas (abanico)
const expanded = (i) => ({
  x: (i - 1) * 140, // Se separan horizontalmente desde el centro
  y: i * -4,
  scale: 1,
  rot: (i - 1) * 15, // Rotación para efecto abanico
  rotateY: 0,
  delay: i * 100 // Se abren una por una
})

const trans = (r, s, rotY) =>
  `perspective(1500px) rotateX(30deg) rotateY(${rotY}deg) rotateZ(${r}deg) scale(${s})`

function Deck() {
  const location = useLocation()
  const [animationState, setAnimationState] = useState(ANIMATION_STATES.HIDDEN)
  const [flippedCards, setFlippedCards] = useState(new Set())
  const [gone] = useState(() => new Set())

  const [props, api] = useSprings(cards.length, i => ({
    ...from(i),
  }))

  // Función para iniciar la animación
  const startAnimation = () => {
    // Paso 1: Deslizar como mazo hasta el centro
    setAnimationState(ANIMATION_STATES.SLIDING)
    api.start(i => sliding(i))

    // Paso 2: Expandir como abanico
    const timer1 = setTimeout(() => {
      setAnimationState(ANIMATION_STATES.EXPANDED)
      api.start(i => expanded(i))
    }, 1200) // Más tiempo para ver el mazo

    // Paso 3: Permitir interacción
    const timer2 = setTimeout(() => {
      setAnimationState(ANIMATION_STATES.INTERACTIVE)
    }, 2000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }

  // Detectar cuando navegamos a HOME y SIEMPRE activar animación
  useEffect(() => {
    if (location.pathname === '/') {
      // Reiniciar todo primero
      setAnimationState(ANIMATION_STATES.HIDDEN)
      setFlippedCards(new Set())
      api.start(i => from(i)) // Resetear a posición inicial

      // Luego iniciar la animación
      const timer = setTimeout(() => {
        startAnimation()
      }, 100) // Pequeño delay para que se vea el reset

      return () => clearTimeout(timer)
    }
  }, [location.pathname, api])

  // Ocultar cartas cuando salimos de home
  useEffect(() => {
    if (location.pathname !== '/') {
      setAnimationState(ANIMATION_STATES.HIDDEN)
      setFlippedCards(new Set())
      api.start(i => from(i))
    }
  }, [location.pathname, api])

  // Manejar SOLO el volteo de cartas (sin moverlas)
  const handleCardClick = (index) => {
    if (animationState !== ANIMATION_STATES.INTERACTIVE) return
    
    setFlippedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })

    // SOLO animar el volteo, mantener posición
    api.start(i => {
      if (i !== index) return
      const isFlipped = !flippedCards.has(index)
      return {
        rotateY: isFlipped ? 180 : 0,
        // NO cambiar x, y, rot, scale - mantener posición del abanico
        config: { tension: 300, friction: 30 }
      }
    })
  }

  // Eliminar completamente la funcionalidad de arrastrar
  // Las cartas solo se voltean, no se mueven
  const bind = () => ({}) // Gesture vacío

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#000000',
      overflow: 'hidden'
    }}>
      {props.map(({ x, y, rot, scale, rotateY }, i) => (
        <animated.div
          key={i}
          style={{
            position: 'absolute',
            x,
            y,
            cursor: animationState === ANIMATION_STATES.INTERACTIVE ? 'pointer' : 'default'
          }}
        >
          <animated.div
            onClick={() => handleCardClick(i)}
            style={{
              width: '140px',
              height: '210px',
              borderRadius: '10px',
              position: 'relative',
              transformStyle: 'preserve-3d',
              transform: interpolate([rot, scale, rotateY], trans),
              willChange: 'transform',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            }}
          >
            {/* Cara frontal (reverso de la carta) */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                borderRadius: '10px',
                backgroundColor: cardBackColor,
                border: '2px solid #333333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000000',
                fontSize: '24px',
                fontWeight: 'bold'
              }}
            >
              ♠
            </div>
            
            {/* Cara trasera (imagen de la carta) */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                borderRadius: '10px',
                backgroundImage: `url(${cards[i]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '2px solid #333333'
              }}
            />
          </animated.div>
        </animated.div>
      ))}
      
      {/* Sin indicadores molestos */}
    </div>
  )
}

export default function Cards() {
  return (
    <div>
      <Deck />
    </div>
  )
}
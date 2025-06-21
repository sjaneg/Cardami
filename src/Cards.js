import React, { useState, useEffect } from 'react'
import { useSprings, animated, to as interpolate } from '@react-spring/web'
import { useDrag } from 'react-use-gesture'

const cards = [
  'https://upload.wikimedia.org/wikipedia/commons/f/f5/RWS_Tarot_08_Strength.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/5/53/RWS_Tarot_16_Tower.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/9/9b/RWS_Tarot_07_Chariot.jpg',
]

// Imagen del reverso de la carta
const cardBackColor = '#1a1a1a'

// Estados de la animación
const ANIMATION_STATES = {
  HIDDEN: 'hidden',
  SLIDING: 'sliding', 
  EXPANDED: 'expanded',
  INTERACTIVE: 'interactive'
}

// Posiciones iniciales (fuera de la pantalla a la izquierda)
const from = (i) => ({ 
  x: -400, 
  y: i * -4, 
  scale: 0.8, 
  rot: 0,
  rotateY: 0
})

// Posiciones durante el deslizamiento
const sliding = (i) => ({
  x: i * 20 - 20, // Las cartas se agrupan en el centro
  y: i * -4,
  scale: 0.8,
  rot: -5 + i * 5,
  rotateY: 0,
  delay: i * 100
})

// Posiciones expandidas (mostrando el reverso)
const expanded = (i) => ({
  x: i * 120 - 120, // Se separan horizontalmente
  y: i * -4,
  scale: 1,
  rot: -5 + i * 5,
  rotateY: 0, // Reverso visible
  delay: i * 150
})

const trans = (r, s, rotY) =>
  `perspective(1500px) rotateX(30deg) rotateY(${rotY}deg) rotateZ(${r}deg) scale(${s})`

function Deck() {
  const [animationState, setAnimationState] = useState(ANIMATION_STATES.HIDDEN)
  const [flippedCards, setFlippedCards] = useState(new Set())
  const [gone] = useState(() => new Set())

  const [props, api] = useSprings(cards.length, i => ({
    ...from(i),
  }))

  // Iniciar la secuencia de animación al montar el componente
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setAnimationState(ANIMATION_STATES.SLIDING)
      api.start(i => sliding(i))
    }, 500)

    const timer2 = setTimeout(() => {
      setAnimationState(ANIMATION_STATES.EXPANDED)
      api.start(i => expanded(i))
    }, 1500)

    const timer3 = setTimeout(() => {
      setAnimationState(ANIMATION_STATES.INTERACTIVE)
    }, 2500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [api])

  // Manejar el click para voltear cartas
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

    // Animar el volteo
    api.start(i => {
      if (i !== index) return
      const isFlipped = !flippedCards.has(index)
      return {
        rotateY: isFlipped ? 180 : 0,
        config: { tension: 300, friction: 30 }
      }
    })
  }

  // Gesture para arrastrar (funcionalidad original)
  const bind = useDrag(({ args: [index], down, movement: [mx], direction: [xDir], velocity }) => {
    if (animationState !== ANIMATION_STATES.INTERACTIVE) return
    
    const trigger = velocity > 0.2
    const dir = xDir < 0 ? -1 : 1
    if (!down && trigger) gone.add(index)
    
    api.start(i => {
      if (index !== i) return
      const isGone = gone.has(index)
      const x = isGone ? (200 + window.innerWidth) * dir : down ? mx + (i * 120 - 120) : (i * 120 - 120)
      const rot = mx / 100 + (isGone ? dir * 10 * velocity : 0) + (-5 + i * 5)
      const scale = down ? 1.1 : 1
      return {
        x,
        rot,
        scale,
        delay: undefined,
        config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 },
      }
    })

    if (!down && gone.size === cards.length) {
      setTimeout(() => {
        gone.clear()
        setFlippedCards(new Set())
        api.start(i => expanded(i))
      }, 600)
    }
  })

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            {...(animationState === ANIMATION_STATES.INTERACTIVE ? bind(i) : {})}
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
                backgroundImage: `url(${cardBack})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '2px solid #f59e0b'
              }}
            />
            
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
                border: '2px solid #f59e0b'
              }}
            />
          </animated.div>
        </animated.div>
      ))}
      
      {/* Indicador de estado */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        fontSize: '18px',
        fontWeight: 'bold',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
      }}>
        {animationState === ANIMATION_STATES.HIDDEN && 'Preparando cartas...'}
        {animationState === ANIMATION_STATES.SLIDING && 'Deslizando cartas...'}
        {animationState === ANIMATION_STATES.EXPANDED && 'Expandiendo cartas...'}
        {animationState === ANIMATION_STATES.INTERACTIVE && 'Haz click para voltear las cartas'}
      </div>
    </div>
  )
}

export default function App() {
  return <Deck />
}
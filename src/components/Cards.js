import React, { useState, useEffect } from 'react'
import { useSpring, animated } from 'react-spring'
import { useLocation } from 'react-router-dom'

const cards = [
  'https://upload.wikimedia.org/wikipedia/commons/f/f5/RWS_Tarot_08_Strength.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/5/53/RWS_Tarot_16_Tower.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/9/9b/RWS_Tarot_07_Chariot.jpg',
]

function Card({ index, image }) {
  const location = useLocation()
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)

  // Animación de entrada desde la izquierda
  const slideIn = useSpring({
    transform: isVisible ? 'translateX(0px)' : 'translateX(-900px)',
    config: { tension: 200, friction: 25 }
  })

  // Animación de expansión como abanico - TODAS giran!
  const expand = useSpring({
    transform: isExpanded 
      ? `translateX(${(index - 1) * 120}px) rotate(${index * 15 - 15 + 5}deg)` 
      : 'translateX(0px) rotate(0deg)',
    config: { tension: 250, friction: 30 }
  })

  // Animación de volteo
  const flip = useSpring({
    transform: `rotateY(${isFlipped ? 180 : 0}deg)`,
    config: { tension: 300, friction: 30 }
  })

  useEffect(() => {
    if (location.pathname === '/home') {
      console.log(`🃏 Carta ${index} iniciando secuencia...`)
      
      // Paso 1: Aparecer desde la izquierda
      setIsVisible(true)
      
      // Paso 2: Expandir como abanico después de un delay
      const timer = setTimeout(() => {
        setIsExpanded(true)
        console.log(`🎯 Carta ${index} expandida`)
      }, 800 + index * 200) // Cada carta se expande un poco después

      return () => clearTimeout(timer)
    } else {
      // Reset cuando salimos de home
      setIsVisible(false)
      setIsExpanded(false)
      setIsFlipped(false)
    }
  }, [location.pathname, index])

  const handleClick = () => {
    if (isExpanded) {
      setIsFlipped(!isFlipped)
    }
  }

  return (
    <animated.div
      style={{
        position: 'absolute',
        left: '45%',
        top: '45%',
        ...slideIn
      }}
    >
      <animated.div
        style={{
          ...expand
        }}
      >
        <animated.div
          onClick={handleClick}
          style={{
            width: '140px',
            height: '210px',
            borderRadius: '12px',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transform: 'translateX(-50%) translateY(-50%)',
            cursor: isExpanded ? 'pointer' : 'default',
            boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
            ...flip
          }}
        >
          {/* Cara frontal (reverso de la carta) */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              borderRadius: '12px',
              background: 'linear-gradient(45deg, #ffffff 0%, #f8f9fa 100%)',
              border: '3px solid #2c3e50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2c3e50',
              fontSize: '32px',
              fontWeight: 'bold',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
              borderRadius: '12px',
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: '3px solid #2c3e50',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)'
            }}
          />
        </animated.div>
      </animated.div>
    </animated.div>
  )
}

function Deck() {
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
      {cards.map((card, index) => (
        <Card key={index} index={index} image={card} />
      ))}
    </div>
  )
}

export default function Cards() {
  return <Deck />
}
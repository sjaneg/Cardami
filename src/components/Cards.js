import React, { useState, useEffect } from 'react'
import { useSpring, animated } from 'react-spring'
import { useLocation } from 'react-router-dom'

// const cards = [
//   'https://upload.wikimedia.org/wikipedia/commons/f/f5/RWS_Tarot_08_Strength.jpg',
//   'https://upload.wikimedia.org/wikipedia/commons/9/9b/RWS_Tarot_07_Chariot.jpg',
//   'https://upload.wikimedia.org/wikipedia/commons/5/53/RWS_Tarot_16_Tower.jpg',
// ]
const cards = [
  '/card_images/Glass_Roar_1.svg',
  '/card_images/Glass_Roar_1.png',
  '/card_images/Glass_Roar_1.png',
];

function Card({ index, image, selectedCardIndices, setSelectedCardIndices }) {
  const location = useLocation()

  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)

  const isSelected = selectedCardIndices.has(index)


  // Entry animation
  const slideIn = useSpring({
    transform: isVisible ? 'translateX(0px)' : 'translateX(-900px)',
    config: { tension: 200, friction: 25 }
  })

  // Fan spread animation
  const expand = useSpring({
    transform: isExpanded && !isSelected
      ? `translateX(${(index - 1) * 120}px) rotate(${(index - 1) * 15 + (Math.random() * 6 - 3)}deg)`
      : 'translateX(0px) rotate(0deg)',
    config: { tension: 250, friction: 30 }
  })

  // Flip animation
  const flip = useSpring({
    transform: `rotateY(${isFlipped ? 180 : 0}deg)`,
    config: { tension: 300, friction: 30 }
  })

  // Animate to different positions based on which card is selected
  const positionSpring = useSpring({
  /*left: isSelected ? index === 0 ? '20%' : index === 1 ? '50%' : '80%' : '45%',
  top: isSelected ? '65%' : '25%',
  transform: `translate(-50%, -50%) scale(${isSelected ? 2 : 1})`,
  config: { tension: 300, friction: 30 },
  zIndex: isSelected ? 999 : index === 1 ? 5: 1*/
  left: isSelected
    ? index === 0
      ? '25%'   // left card goes center-left
      : index === 1
      ? '50%'   // middle card goes center
      : '75%'   // right card goes center-right
    : '45%',     // default deck position
  top: isSelected ? '50%' : '25%',  // vertically center selected cards
  transform: `translate(-50%, -50%) scale(${isSelected ? 2 : 1})`,
  config: { tension: 300, friction: 30 },
  zIndex: isSelected
    ? 999
    : index === 1
    ? 5
    : 1
})


  useEffect(() => {
    if (location.pathname === '/home') {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsExpanded(true)
      }, 800 + index * 200)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
      setIsExpanded(false)
      setIsFlipped(false)
    }
  }, [location.pathname, index])

 const handleClick = () => {
  if (!isExpanded) return
  setIsFlipped(true)

  setSelectedCardIndices(prev => {
    const updated = new Set(prev)
    updated.add(index)
    return updated
  })
}

  return (
    <animated.div style={{
      position: 'absolute',
      ...slideIn,
      ...positionSpring
    }}>
      <animated.div style={expand}>
        <animated.div
          onClick={handleClick}
          style={{
            width: '140px',
            height: '210px',
            borderRadius: '12px',
            position: 'relative',
            transformStyle: 'preserve-3d',
            cursor: isExpanded ? 'pointer' : 'default',
            boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
            ...flip
          }}
        >
          {/* Card front */}
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

          {/* Card back */}
          <animated.div
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

  const [selectedCardIndices, setSelectedCardIndices] = useState(new Set())

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
        <Card
          key={index}
          index={index}
          image={card}
          selectedCardIndices={selectedCardIndices}
          setSelectedCardIndices={setSelectedCardIndices}
        />
      ))}
    </div>
  )
}

export default function Cards() {
  return <Deck />
}

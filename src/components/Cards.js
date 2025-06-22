import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import { useLocation } from 'react-router-dom';
import { MantineProvider, Button } from '@mantine/core';
// Firebase imports
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase'; // initialized Firestore as db

// Define card objects with id and image path
const initialCards = [
  { id: 'Glass_Roar_1', image: '/card_images/Glass_Roar_1.png' },
  { id: 'Glass_Roar_2', image: '/card_images/Glass_Roar_2.png' },
  { id: 'Glass_Roar_3', image: '/card_images/Glass_Roar_3.png' },
];

function Card({ index, card, selectedCardIndices, setSelectedCardIndices, flippedCards, setFlippedCards, onClaim }) {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isSelected = selectedCardIndices.has(index);
  const isFlippedLocal = flippedCards.has(index);

  useEffect(() => { if (isFlippedLocal) setIsFlipped(true); }, [isFlippedLocal]);

  const slideIn = useSpring({ transform: isVisible ? 'translateX(0)' : 'translateX(-900px)', config: { tension: 200, friction: 25 } });
  const expand = useSpring({ transform: isExpanded && !isSelected ? `translateX(${(index - 1) * 120}px) rotate(${(index - 1) * 15 + (Math.random() * 6 - 3)}deg)` : 'translateX(0) rotate(0deg)', config: { tension: 250, friction: 30 } });
  const flip = useSpring({ transform: `rotateY(${isFlipped ? 180 : 0}deg)`, config: { tension: 300, friction: 30 } });
  const positionSpring = useSpring({ 
    left: isSelected ? (index === 0 ? '25%' : index === 1 ? '50%' : '75%') : '45%', 
    top: isSelected ? '50%' : '25%', 
    transform: `translate(-50%, -50%) scale(${isSelected ? 2 : 1})`, 
    config: { tension: 300, friction: 30 }, 
    zIndex: isSelected ? 999 : index === 1 ? 5 : 1,
    opacity: 1 // Force opacity to always be 1
  });

  useEffect(() => {
    if (location.pathname === '/home') {
      setIsVisible(true);
      const timer = setTimeout(() => setIsExpanded(true), 800 + index * 200);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setIsExpanded(false);
      setIsFlipped(false);
    }
  }, [location.pathname, index]);

  // Click on card = card flips and becomes large (original functionality)
  const handleClick = () => {
    if (!isExpanded) return;
    setIsFlipped(true);
    setFlippedCards(prev => new Set(prev).add(index));
    setSelectedCardIndices(prev => new Set(prev).add(index));
  };

  // Click on Claim = open Figma modal
  const handleClaim = (e) => {
    e.stopPropagation(); // Prevents card click from triggering
    onClaim(card, index);
  };

  return (
    <animated.div style={{ position: 'absolute', ...slideIn, ...positionSpring }}>
      <animated.div style={expand}>
        <animated.div
          onClick={handleClick}
          style={{ width: 140, height: 210, borderRadius: 12, position: 'relative', transformStyle: 'preserve-3d', cursor: isExpanded ? 'pointer' : 'default', boxShadow: '0 15px 35px rgba(0,0,0,0.4)', ...flip }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', borderRadius: 12, background: 'linear-gradient(45deg, #ffffff 0%, #f8f9fa 100%)', border: '3px solid #2c3e50', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 'bold', color: '#2c3e50' }}>♠</div>
          <animated.div
            style={{ 
              position: 'absolute', 
              width: '100%', 
              height: '100%', 
              backfaceVisibility: 'hidden', 
              transform: 'rotateY(180deg)', 
              borderRadius: 12, 
              backgroundImage: `url(${card.image})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center', 
              border: '3px solid #2c3e50', 
              filter: isHovered ? 'grayscale(80%)' : 'none' 
            }}
          >
            {/* Overlay when card is selected */}
            {isSelected && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: '20px'
              }}>
                <Button
                  style={{ 
                    padding: '6px 16px', 
                    fontSize: 12, 
                    background: 'rgba(255, 255, 255, 0.2)', 
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '6px', 
                    fontWeight: '500', 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(8px)'
                  }}
                  size="xs"
                  onClick={handleClaim}
                >
                  Claim
                </Button>
              </div>
            )}
          </animated.div>
        </animated.div>
      </animated.div>
    </animated.div>
  );
}

function TaskDetailView({ selectedCard, onBack, onAddToDeck }) {
  const [taskDescription, setTaskDescription] = useState('');

  const handleAdd = () => {
    onAddToDeck(selectedCard.id, taskDescription.trim());
    setTaskDescription('');
    onBack();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: '#000000',
      display: 'flex',
      zIndex: 10000
    }}>
      {/* Left side - Card */}
      <div style={{
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}>
        <div style={{
          width: '300px',
          height: '450px',
          borderRadius: '16px',
          backgroundImage: `url(${selectedCard.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '3px solid #2c3e50',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
        }} />
      </div>

      {/* Right side - Input panel */}
      <div style={{
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '500px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
          position: 'relative'
        }}>
          {/* Close button */}
          <button
            onClick={onBack}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: '#ffffff',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            ×
          </button>

          {/* Text input area */}
          <div style={{ marginBottom: '32px' }}>
            <textarea
              placeholder="Capture the memory and connection in writing..."
              value={taskDescription}
              onChange={e => setTaskDescription(e.target.value)}
              rows={8}
              style={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '16px',
                padding: '20px',
                fontSize: '16px',
                resize: 'none',
                outline: 'none',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                lineHeight: '1.6',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              }}
            />
          </div>

          {/* Snapshot section */}
          <div style={{
            textAlign: 'center',
            marginBottom: '32px',
            padding: '20px 0'
          }}>
            <div style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '14px',
              marginBottom: '12px'
            }}>
              or in a snapshot
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              margin: '0 auto',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.15)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              e.target.style.transform = 'translateY(0)';
            }}
            >
              <svg width="24" height="24" fill="rgba(255, 255, 255, 0.7)" viewBox="0 0 24 24">
                <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3Z"/>
                <path d="M12 6.5A2.5 2.5 0 0 1 9.5 4h5A2.5 2.5 0 0 1 12 6.5ZM9 2a1 1 0 0 0-1 1v1H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-3V3a1 1 0 0 0-1-1H9Z"/>
              </svg>
            </div>
          </div>

          {/* Add to Deck button */}
          <button
            onClick={handleAdd}
            disabled={!taskDescription.trim()}
            style={{
              width: '100%',
              padding: '16px 24px',
              background: taskDescription.trim() 
                ? 'rgba(255, 255, 255, 0.9)' 
                : 'rgba(255, 255, 255, 0.2)',
              color: taskDescription.trim() ? '#000000' : 'rgba(255, 255, 255, 0.5)',
              border: 'none',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: taskDescription.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
            onMouseEnter={(e) => {
              if (taskDescription.trim()) {
                e.target.style.background = 'rgba(255, 255, 255, 1)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(255, 255, 255, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (taskDescription.trim()) {
                e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            Add to Deck
          </button>
        </div>
      </div>
    </div>
  );
}

function Deck() {
  const [cards, setCards] = useState(initialCards);
  const [selectedCardIndices, setSelectedCardIndices] = useState(new Set());
  const [flippedCards, setFlippedCards] = useState(new Set());
  const [shuffling, setShuffling] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const isAllFlipped = cards.length === flippedCards.size;
  
  const shuffleCards = () => { 
    setShuffling(true); 
    setFlippedCards(new Set()); 
    setSelectedCardIndices(new Set()); 
    setShowTaskDetail(false);
    setSelectedCard(null);
    setTimeout(() => setShuffling(false), 500); 
  };

  // Function called when Claim button is clicked
  const handleClaim = (card, index) => {
    setSelectedCard(card);
    setShowTaskDetail(true);
  };

  const handleBack = () => {
    setShowTaskDetail(false);
    setSelectedCard(null);
    // Don't reset positions, just clear selection to fix visibility bug
    // Cards should stay where they are if they're still flipped
  };

  // Add card entry to Firestore
  const handleAddToDeck = async (cardId, description) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      const userRef = doc(db, 'users', user.uid);
      const cardRef = doc(db, 'cards', cardId);
      await updateDoc(userRef, {
        cards: arrayUnion({ cardRef, description }),
        updatedAt: serverTimestamp(),
      });
      console.log(`Added card ${cardId} with description: ${description}`);
    } catch (err) {
      console.error('Error adding to deck:', err);
    }
  };

  // If we're showing the Figma modal, render it as overlay instead of replacing everything
  return (
    <MantineProvider theme={{ colorScheme: 'dark' }} withGlobalStyles withNormalizeCSS>
      <div style={{ position: 'relative', width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', overflow: 'hidden' }}>
        {cards.map((card, index) => (
          <Card 
            key={card.id}
            index={index} 
            card={card} 
            selectedCardIndices={selectedCardIndices} 
            setSelectedCardIndices={setSelectedCardIndices} 
            flippedCards={flippedCards} 
            setFlippedCards={setFlippedCards} 
            onClaim={handleClaim}
          />
        ))}
        {isAllFlipped && !shuffling && (
          <Button variant="outline" style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', padding: '15px 30px', fontSize: 18 }} onClick={shuffleCards}>
            Shuffle
          </Button>
        )}
        
        {/* Show modal as overlay instead of replacing everything */}
        {showTaskDetail && selectedCard && (
          <TaskDetailView 
            selectedCard={selectedCard}
            onBack={handleBack}
            onAddToDeck={handleAddToDeck}
          />
        )}
      </div>
    </MantineProvider>
  );
}

export default function Cards() { return <Deck />; }
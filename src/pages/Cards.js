import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import { useLocation } from 'react-router-dom';
import { MantineProvider, Button, Loader, Center } from '@mantine/core';
// Firebase imports
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase'; // initialized Firestore as db

// Full master list of cards
const masterCards = [
  { id: 'Bottle_of_Joy_1', image: '/card_images/Bottle_of_Joy_1.png' },
  { id: 'Brave_Battle_Horn_1', image: '/card_images/Brave_Battle_Horn_1.png' },
  { id: 'Dewbloom_1', image: '/card_images/Dewbloom_1.png' },
  { id: 'Echo_Drum_1', image: '/card_images/Echo_Drum_1.png' },
  { id: 'Everlasting_Seedpouch_1', image: '/card_images/Everlasting_Seedpouch_1.png' },
  { id: 'Feather_of_First_Flight_1', image: '/card_images/Feather_of_First_Flight_1.png' },
  { id: 'Glass_Roar_1', image: '/card_images/Glass_Roar_1.png' },
  { id: 'Heritage_Patch_1', image: '/card_images/Heritage_Patch_1.png' },
  { id: 'Kindkey_1', image: '/card_images/Kindkey_1.png' },
  { id: 'Merchant_Crest_1', image: '/card_images/Merchant_Crest_1.png' },
  { id: 'Mirrorleaf_Locket_1', image: '/card_images/Mirrorleaf_Locket_1.png' },
  { id: 'Resonant_Bell_1', image: '/card_images/Resonant_Bell_1.png' },
  { id: 'Smoothstone_1', image: '/card_images/Smoothstone_1.png' },
  { id: 'Stranger_Thread_1', image: '/card_images/Stranger_Thread_1.png' },
  { id: 'Torch_Pin_1', image: '/card_images/Torch_Pin_1.png' },
  { id: 'Unicorn_Figurine_1', image: '/card_images/Unicorn_Figurine_1.png' },
  { id: 'Veritable_Camera_1', image: '/card_images/Veritable_Camera_1.png' },
  { id: 'Whisper_Coin_1', image: '/card_images/Whisper_Coin_1.png' },
];

function Card({ index, card, selectedCardIndices, setSelectedCardIndices, flippedCards, setFlippedCards, onClaim, shuffling, allCardsFlipped }) {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 200, height: 300 }); // Default size

  const isSelected = selectedCardIndices.has(index);
  const isFlippedLocal = flippedCards.has(index);

  // Load image and get dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      const maxHeight = 300; // Max height we want
      const newHeight = Math.min(maxHeight, img.height);
      const newWidth = newHeight * aspectRatio;
      
      setImageDimensions({ width: newWidth, height: newHeight });
    };
    img.src = card.image;
  }, [card.image]);

  // Sync flip state - but not during shuffle
  useEffect(() => { 
    if (isFlippedLocal && !shuffling) setIsFlipped(true); 
  }, [isFlippedLocal, shuffling]);

  // Smooth card entrance - like solitaire games
  const cardEntrance = useSpring({ 
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0px)' : 'translateY(30px)',
    config: { tension: 120, friction: 14 } // Very smooth, slow ease
  });
  
  // Fan expansion with solitaire-like smoothness + reshuffle behavior
  const fanExpansion = useSpring({ 
    transform: shuffling 
      ? 'translateX(0px) rotate(0deg)' // Stack back to center when shuffling
      : isExpanded && !isSelected 
        ? `translateX(${(index - 1) * 110}px) rotate(${(index - 1) * 10}deg)` 
        : 'translateX(0px) rotate(0deg)',
    config: { 
      tension: shuffling ? 120 : 80,   // Faster when shuffling
      friction: shuffling ? 20 : 26,   // Less friction when shuffling
      mass: 1.2,
      clamp: false
    }
  });

  // Flip animation with shuffle behavior
  const flip = useSpring({ 
    transform: `rotateY(${isFlipped && !shuffling ? 180 : 0}deg)`, 
    config: { tension: 300, friction: 30 } 
  });
  const positionSpring = useSpring({ 
    left: isSelected ? (index === 0 ? '25%' : index === 1 ? '50%' : '75%') : '50%', // Start from center
    top: isSelected ? '50%' : '40%', // Moved up from 50% to 40%
    transform: `translate(-50%, -50%) scale(${isSelected ? 1.6 : 1})`, // Smaller scale when selected
    config: { tension: 170, friction: 26 }, // Smooth position changes
    zIndex: isSelected ? 999 : index === 1 ? 10 : index + 1, // Middle card always on top
    opacity: 1
  });

  // Handle route changes + shuffle reset
  useEffect(() => {
    if (location.pathname === '/home' && !shuffling) {
      setIsVisible(true);
      setIsFlipped(false);
      
      // Gentle staggered expansion like dealing cards
      const expandDelay = index * 120; // 120ms between each card
      const timer = setTimeout(() => {
        setIsExpanded(true);
      }, expandDelay + 200); // Small base delay
      
      return () => clearTimeout(timer);
    } else if (shuffling) {
      // During shuffle, reset expanded state so cards stack back
      setIsExpanded(false);
      setIsFlipped(false);
    } else {
      setIsVisible(false);
      setIsExpanded(false);
      setIsFlipped(false);
    }
  }, [location.pathname, index, shuffling]);

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
    <animated.div style={{ position: 'absolute', ...cardEntrance, ...positionSpring }}>
      <animated.div style={fanExpansion}>
        <animated.div
          onClick={handleClick}
          style={{ 
            width: imageDimensions.width, 
            height: imageDimensions.height, 
            borderRadius: 12, 
            position: 'relative', 
            transformStyle: 'preserve-3d', 
            cursor: isExpanded ? 'pointer' : 'default', 
            boxShadow: '0 15px 35px rgba(0,0,0,0.4)', 
            border: isSelected ? 'none' : 'none', // Remove all borders
            ...flip 
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', borderRadius: 12, background: 'linear-gradient(45deg, #ffffff 0%, #f8f9fa 100%)', border: '3px solid #2c3e50', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontFamily: 'audiowide', fontWeight: 'bold', color: '#2c3e50' }}>Cardami</div>
          <animated.div
            style={{ 
              position: 'absolute', 
              width: '100%', 
              height: '100%', 
              backfaceVisibility: 'hidden', 
              transform: 'rotateY(180deg)', 
              borderRadius: 6
            }}
          >
            {/* Imagen de fondo separada que se puede difuminar */}
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: 6,
                backgroundImage: `url(${card.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: isHovered && allCardsFlipped ? 'blur(1px)' : 'none'
              }}
            />
            
            {/* Overlay when card is selected AND all cards are flipped AND being hovered */}
            {isSelected && allCardsFlipped && isHovered && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1
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
const [showSparkle, setShowSparkle] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSparkle(false), 5000);
    return () => clearTimeout(timer);
  }, []);

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
        {showSparkle && (
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-20">
          {[...Array(10)].map((_, i) => {
            const hue = Math.floor(Math.random() * 360); // Hue between 0–359
            return (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-sparkle"
                style={{
                  top: `${Math.random() * 90}%`,
                  left: `${Math.random() * 90}%`,
                  backgroundColor: `hsl(${hue}, 100%, 70%)`,
                  animationDelay: `${i * 0.1}s`,
                  boxShadow: `0 0 6px 2px hsl(${hue}, 100%, 70%)`,
                }}
              />
            );
          })}
        </div>
        )}
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
            Add to Memories
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Cards() {
  const [cards, setCards] = useState([]);
  const [claimedIds, setClaimedIds] = useState(new Set());
  const [selectedCardIndices, setSelectedCardIndices] = useState(new Set());
  const [flippedCards, setFlippedCards] = useState(new Set());
  const [shuffling, setShuffling] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const isAllFlipped = cards.length === flippedCards.size;
  
  const shuffleCards = () => { 
    setShuffling(true); 
    setShowTaskDetail(false);
    setSelectedCard(null);
    
    // Step 1: Flip all cards back to show "Cardami" side
    setFlippedCards(new Set()); 
    setSelectedCardIndices(new Set());
    
    // Step 2: After flip animation, generate new cards and restart the fan animation
    setTimeout(() => {
      selectThree(); // Pick 3 new random unclaimed cards
      setShuffling(false);
    }, 1200); // Give time for flip + restack + expand
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
  const [loading, setLoading] = useState(true);

  // Fetch claimed on mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;
      const userSnap = await getDoc(doc(db, 'users', user.uid));
      const data = userSnap.data();
      const claimed = new Set((data?.cards || []).map(e => e.cardId));
      setClaimedIds(claimed);
      setLoading(false);
    }
    load();
  }, []);

  // Pick three unclaimed
  const selectThree = () => {
    const avail = masterCards.filter(c => !claimedIds.has(c.id));
    const pick = avail.sort(() => 0.5 - Math.random()).slice(0, 3);
    setCards(pick);
    // Reset all animation states when new cards are selected
    setSelectedCardIndices(new Set());
    setFlippedCards(new Set());
    
    // Force all cards to show "Cardami" side initially
    setTimeout(() => {
      setFlippedCards(new Set()); // Ensure no cards are flipped initially
    }, 100);
  };

  useEffect(() => { if (!loading) selectThree(); }, [loading, claimedIds]);

  // Add to deck & refresh
  const handleAddToDeck = async (cardId, description) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('Not signed in');
      const userRef = doc(db, 'users', user.uid);
      const cardRef = doc(db, 'cards', cardId);
      await updateDoc(userRef, {
        cards: arrayUnion({ cardId, description }),
        updatedAt: serverTimestamp(),
      });
      setClaimedIds(prev => new Set(prev).add(cardId));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <Center style={{ height: '100vh' }}><Loader /></Center>;

  // If we're showing the Figma modal, render it as overlay instead of replacing everything
  return (
    <MantineProvider theme={{ colorScheme: 'dark' }} withGlobalStyles withNormalizeCSS>
      <div style={{ position: 'relative', width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {cards.map((card, index) => (
          <Card 
            key={`${card.id}-${cards.length}`} // Force re-mount when cards change
            index={index} 
            card={card} 
            selectedCardIndices={selectedCardIndices} 
            setSelectedCardIndices={setSelectedCardIndices} 
            flippedCards={flippedCards} 
            setFlippedCards={setFlippedCards} 
            onClaim={handleClaim}
            shuffling={shuffling} // Pass shuffling state to Card
            allCardsFlipped={isAllFlipped} // Pass if all cards are flipped
          />
        ))}
        {isAllFlipped && !shuffling && (
          <Button 
            style={{ 
              borderRadius: '9999px',
              position: 'absolute', 
              bottom: 30, 
              left: '50%', 
              transform: 'translateX(-50%)', 
              padding: '16px 32px', 
              fontSize: 18,
              minWidth: '120px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              whiteSpace: 'nowrap'
            }} 
            onClick={shuffleCards}
          >
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
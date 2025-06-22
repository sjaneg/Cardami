import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import { useLocation } from 'react-router-dom';
import { MantineProvider, Modal, TextInput, Button } from '@mantine/core';
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

function Card({ index, card, selectedCardIndices, setSelectedCardIndices, flippedCards, setFlippedCards, onAddToDeck }) {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [taskDescription, setTaskDescription] = useState('');

  const isSelected = selectedCardIndices.has(index);
  const isFlippedLocal = flippedCards.has(index);

  useEffect(() => { if (isFlippedLocal) setIsFlipped(true); }, [isFlippedLocal]);

  const slideIn = useSpring({ transform: isVisible ? 'translateX(0)' : 'translateX(-900px)', config: { tension: 200, friction: 25 } });
  const expand = useSpring({ transform: isExpanded && !isSelected ? `translateX(${(index - 1) * 120}px) rotate(${(index - 1) * 15 + (Math.random() * 6 - 3)}deg)` : 'translateX(0) rotate(0deg)', config: { tension: 250, friction: 30 } });
  const flip = useSpring({ transform: `rotateY(${isFlipped ? 180 : 0}deg)`, config: { tension: 300, friction: 30 } });
  const positionSpring = useSpring({ left: isSelected ? (index === 0 ? '25%' : index === 1 ? '50%' : '75%') : '45%', top: isSelected ? '50%' : '25%', transform: `translate(-50%, -50%) scale(${isSelected ? 2 : 1})`, config: { tension: 300, friction: 30 }, zIndex: isSelected ? 999 : index === 1 ? 5 : 1 });

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

  const handleClick = () => {
    if (!isExpanded) return;
    setIsFlipped(true);
    setFlippedCards(prev => new Set(prev).add(index));
    setSelectedCardIndices(prev => new Set(prev).add(index));
  };

  const handleClaim = () => setModalOpened(true);

  const handleAdd = () => {
    onAddToDeck(card.id, taskDescription.trim());
    setTaskDescription('');
    setModalOpened(false);
  };

  return (
    <>
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
              style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: 12, backgroundImage: `url(${card.image})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '3px solid #2c3e50', filter: isHovered ? 'grayscale(80%)' : 'none' }}
            />
          </animated.div>
          {isFlipped && (
            <Button
              style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', padding: '6px 12px', fontSize: 10 }}
              size="xs"
              onClick={handleClaim}
            >
              Claim
            </Button>
          )}
        </animated.div>
      </animated.div>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Task Details"
        centered
        overlayColor="black"
        overlayOpacity={0.75}
        overlayBlur={3}
        styles={{ content: { backgroundColor: '#1A1B1E', color: '#FFFFFF' }, header: { borderBottom: '1px solid #2C2E33' }, close: { color: '#BBBBBB' } }}
      >
        <TextInput
          placeholder="Describe the task completed"
          value={taskDescription}
          onChange={e => setTaskDescription(e.currentTarget.value)}
          mb="md"
          styles={{ input: { backgroundColor: '#2C2E33', color: '#FFFFFF', border: '1px solid #3A3D44' } }}
          placeholderColor="#888"
        />
        <Button fullWidth onClick={handleAdd} disabled={!taskDescription.trim()}>
          Add to Deck
        </Button>
      </Modal>
    </>
  );
}

function Deck() {
  const [cards, setCards] = useState(initialCards);
  const [selectedCardIndices, setSelectedCardIndices] = useState(new Set());
  const [flippedCards, setFlippedCards] = useState(new Set());
  const [shuffling, setShuffling] = useState(false);

  const isAllFlipped = cards.length === flippedCards.size;
  const shuffleCards = () => { setShuffling(true); setFlippedCards(new Set()); setSelectedCardIndices(new Set()); setTimeout(() => setShuffling(false), 500); };

  // Add card entry to Firestore
  const handleAddToDeck = async (cardId, description) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      const userRef = doc(db, 'users', user.uid);
      const cardRef = doc(db, 'cards', cardId);
      // update document: add to 'cards' array and set updatedAt server timestamp
      await updateDoc(userRef, {
        cards: arrayUnion({ cardRef, description }),
        updatedAt: serverTimestamp(),
      });
      console.log(`Added card ${cardId} with description: ${description}`);
    } catch (err) {
      console.error('Error adding to deck:', err);
    }
  };

  return (
    <MantineProvider theme={{ colorScheme: 'dark' }} withGlobalStyles withNormalizeCSS>
      <div style={{ position: 'relative', width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', overflow: 'hidden' }}>
        {cards.map((card, index) => (
          <Card key={card.id} index={index} card={card} selectedCardIndices={selectedCardIndices} setSelectedCardIndices={setSelectedCardIndices} flippedCards={flippedCards} setFlippedCards={setFlippedCards} onAddToDeck={handleAddToDeck} />
        ))}
        {isAllFlipped && !shuffling && (
          <Button variant="outline" style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', padding: '15px 30px', fontSize: 18 }} onClick={shuffleCards}>
            Shuffle
          </Button>
        )}
      </div>
    </MantineProvider>
  );
}

export default function Cards() { return <Deck />; }

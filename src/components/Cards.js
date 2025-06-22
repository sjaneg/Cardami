import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import { useLocation } from 'react-router-dom';
import { MantineProvider, Modal, TextInput, Button, Loader, Center } from '@mantine/core';
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

  // Sync flip state
  useEffect(() => { if (isFlippedLocal) setIsFlipped(true); }, [isFlippedLocal]);

  // Entry animation
  const slideIn = useSpring({ transform: isVisible ? 'translateX(0)' : 'translateX(-900px)', config: { tension: 200, friction: 25 } });
  // Fan expand animation
  const expand = useSpring({ transform: isExpanded && !isSelected ? `translateX(${(index - 1) * 120}px) rotate(${(index - 1) * 15 + (Math.random() * 6 - 3)}deg)` : 'translateX(0) rotate(0deg)', config: { tension: 250, friction: 30 } });
  // Flip animation
  const flip = useSpring({ transform: `rotateY(${isFlipped ? 180 : 0}deg)`, config: { tension: 300, friction: 30 } });
  // Position when selected
  const position = useSpring({ left: isSelected ? (index === 0 ? '25%' : index === 1 ? '50%' : '75%') : '45%', top: isSelected ? '50%' : '25%', transform: `translate(-50%, -50%) scale(${isSelected ? 2 : 1})`, config: { tension: 300, friction: 30 }, zIndex: isSelected ? 999 : index === 1 ? 5 : 1 });

  // Handle route changes
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

  // Click to flip
  const handleClick = () => {
    if (!isExpanded) return;
    setIsFlipped(true);
    setFlippedCards(prev => new Set(prev).add(index));
    setSelectedCardIndices(prev => new Set(prev).add(index));
  };

  // Claim opens modal
  const handleClaim = () => setModalOpened(true);

  // Add to deck
  const handleAdd = () => {
    onAddToDeck(card.id, taskDescription.trim());
    setTaskDescription('');
    setModalOpened(false);
  };

  return (
    <>
      <animated.div style={{ position: 'absolute', ...slideIn, ...position }}>
        <animated.div style={expand}>
          <animated.div onClick={handleClick} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
            style={{ width: 140, height: 210, borderRadius: 12, position: 'relative', transformStyle: 'preserve-3d', cursor: isExpanded ? 'pointer' : 'default', boxShadow: '0 15px 35px rgba(0,0,0,0.4)', ...flip }}>

            {/* Front */}
            <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', borderRadius: 12, background: 'linear-gradient(45deg, #fff 0%, #f8f9fa 100%)', border: '3px solid #2c3e50', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 'bold', color: '#2c3e50' }}>
              ♠
            </div>

            {/* Back */}
            <animated.div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: 12, backgroundImage: `url(${card.image})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '3px solid #2c3e50', filter: isHovered ? 'grayscale(80%)' : 'none' }} />
          </animated.div>

          {isFlipped && (
            <Button size="xs" onClick={handleClaim} style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', fontSize: 10 }}>
              Claim
            </Button>
          )}
        </animated.div>
      </animated.div>

      {/* Modal for task entry */}
      <Modal opened={modalOpened} onClose={() => setModalOpened(false)} title="Task Details" centered overlayColor="black" overlayOpacity={0.75} overlayBlur={3}
        styles={{ content: { backgroundColor: '#1A1B1E', color: '#FFF' }, header: { borderBottom: '1px solid #2C2E33' }, close: { color: '#BBB' } }}>
        <TextInput placeholder="Describe the task completed" value={taskDescription} onChange={e => setTaskDescription(e.currentTarget.value)} mb="md"
          styles={{ input: { backgroundColor: '#2C2E33', color: '#FFF', border: '1px solid #3A3D44' } }} placeholderColor="#888" />
        <Button fullWidth onClick={handleAdd} disabled={!taskDescription.trim()}>
          Add to Deck
        </Button>
      </Modal>
    </>
  );
}

export default function Cards() {
  const [cards, setCards] = useState([]);
  const [claimedIds, setClaimedIds] = useState(new Set());
  const [selectedCardIndices, setSelectedCardIndices] = useState(new Set());
  const [flippedCards, setFlippedCards] = useState(new Set());
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
    setSelectedCardIndices(new Set());
    setFlippedCards(new Set());
  };

  useEffect(() => { if (!loading) selectThree(); }, [loading, claimedIds]);

  // Add to deck & refresh
  const handleAddToDeck = async (cardId, description) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('Not signed in');
      const userRef = doc(db, 'users', user.uid);
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

  return (
    <MantineProvider theme={{ colorScheme: 'dark' }} withGlobalStyles withNormalizeCSS>
      <div style={{ position: 'relative', width: '100%', height: '100vh', background: '#000', overflow: 'hidden' }}>
        {cards.map((c, i) => (
          <Card
            key={c.id}
            index={i}
            card={c}
            selectedCardIndices={selectedCardIndices}
            setSelectedCardIndices={setSelectedCardIndices}
            flippedCards={flippedCards}
            setFlippedCards={setFlippedCards}
            onAddToDeck={handleAddToDeck}
          />
        ))}
        <Button variant="outline" style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)' }} onClick={selectThree}>
          Shuffle
        </Button>
      </div>
    </MantineProvider>
  );
}

import React, { useState, useEffect } from 'react';
import { useSpring, useSprings, animated, config } from 'react-spring';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Loader, Center } from '@mantine/core';
import './Memories.css';

const masterCards = [
  { id: 'Bottle_of_Joy_1', image: '/card_images/Bottle_of_Joy_1.png', num: 8 },
  { id: 'Brave_Battle_Horn_1', image: '/card_images/Brave_Battle_Horn_1.png', num: 3 },
  { id: 'Dewbloom_1', image: '/card_images/Dewbloom_1.png', num: 20 },
  { id: 'Echo_Drum_1', image: '/card_images/Echo_Drum_1.png', num: 6 },
  { id: 'Everlasting_Seedpouch_1', image: '/card_images/Everlasting_Seedpouch_1.png', num: 18 },
  { id: 'Feather_of_First_Flight_1', image: '/card_images/Feather_of_First_Flight_1.png', num: 2 },
  { id: 'Glass_Roar_1', image: '/card_images/Glass_Roar_1.png', num: 5 },
  { id: 'Heritage_Patch_1', image: '/card_images/Heritage_Patch_1.png', num: 16 },
  { id: 'Kindkey_1', image: '/card_images/Kindkey_1.png', num: 7 },
  { id: 'Merchant_Crest_1', image: '/card_images/Merchant_Crest_1.png', num: 13 },
  { id: 'Mirrorleaf_Locket_1', image: '/card_images/Mirrorleaf_Locket_1.png', num: 10 },
  { id: 'Resonant_Bell_1', image: '/card_images/Resonant_Bell_1.png', num: 19 },
  { id: 'Smoothstone_1', image: '/card_images/Smoothstone_1.png', num: 17 },
  { id: 'Stranger_Thread_1', image: '/card_images/Stranger_Thread_1.png', num: 15 },
  { id: 'Torch_Pin_1', image: '/card_images/Torch_Pin_1.png', num: 4 },
  { id: 'Unicorn_Figurine_1', image: '/card_images/Unicorn_Figurine_1.png', num: 9 },
  { id: 'Veritable_Camera_1', image: '/card_images/Veritable_Camera_1.png', num: 12 },
  { id: 'Whisper_Coin_1', image: '/card_images/Whisper_Coin_1.png', num: 1 },
  { id: 'Spiral_Shell_1', image: '/card_images/Spiral_Shell_1.png', num: 11 },
  { id: 'Wuthering_Compass_1', image: '/card_images/Wuthering_Compass_1.png', num: 14 },
];

function MemoryCard({ image, description, isClaimed, flipped, onFlip }) {
  const { transform, opacity } = useSpring({
    transform: `perspective(600px) rotateY(${flipped ? 180 : 0}deg)`,
    opacity: flipped ? 1 : 0,
    config: config.stiff,
  });

  return (
    <div
      className={`card-item ${!isClaimed ? 'disabled' : ''}`}
      onClick={isClaimed ? onFlip : undefined}
    >
      {/* Front */}
      <animated.div
        className="card-face"
        style={{
          opacity: opacity.to(o => 1 - o),
          transform,
          zIndex: flipped ? 1 : 2,
        }}
      >
        <img
          src={image}
          alt="memory front"
          style={{
            filter: isClaimed ? 'none' : 'grayscale(100%) opacity(0.3)',
          }}
        />
      </animated.div>

      {/* Back */}
      <animated.div
        className="card-face card-back"
        style={{
          opacity,
          transform: transform.to(t => `${t} rotateY(180deg)`),
          zIndex: flipped ? 2 : 1,
        }}
      >
        <div className="card-back-content">{description}</div>
      </animated.div>
    </div>
  );
}

export default function Memories() {
  const [claimed, setClaimed] = useState(null);
  const [flippedStates, setFlippedStates] = useState({});

  const sortedCards = [...masterCards].sort((a, b) => a.num - b.num);

  const entranceSpring = useSpring({
    from: { transform: 'translateY(300px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
    delay: 300,
    config: { tension: 100, friction: 25 }, // slower entry
  });
  
  const [cardSprings, api] = useSprings(sortedCards.length, index => ({
    from: { transform: 'scale(0) rotateZ(-30deg)', opacity: 0 },
    to: { transform: 'scale(1) rotateZ(0deg)', opacity: 1 },
    delay: 600 + index * 150, // increase delay spacing
    config: { tension: 120, friction: 20 }, // slower toss
  }));

  useEffect(() => {
    async function fetchData() {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return setClaimed([]);
      const snap = await getDoc(doc(db, 'users', user.uid));
      setClaimed(snap.data()?.cards || []);
    }
    fetchData();
  }, []);

  const claimedMap = Object.fromEntries(
    (claimed || []).map(({ cardId, description }) => [cardId, description])
  );

  const handleFlip = (id) => {
    setFlippedStates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="memories-container">
      {claimed === null ? (
        <Center style={{ height: '100vh' }}>
          <Loader />
        </Center>
      ) : (
        <animated.div style={entranceSpring}>
          <div className="card-grid">
            {cardSprings.map((style, i) => {
              const card = sortedCards[i];
              const isClaimed = claimedMap.hasOwnProperty(card.id);
              return (
                <animated.div key={card.id} style={style}>
                  <MemoryCard
                    image={card.image}
                    description={claimedMap[card.id] || ''}
                    isClaimed={isClaimed}
                    flipped={!!flippedStates[card.id]}
                    onFlip={() => handleFlip(card.id)}
                  />
                </animated.div>
              );
            })}
          </div>
        </animated.div>
      )}
    </div>
  );
}

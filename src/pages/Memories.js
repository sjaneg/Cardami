import React, { useState, useEffect } from 'react';
import { useSpring, animated, config } from 'react-spring';
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

function MemoryCard({ image, description, isClaimed }) {
  const [flipped, setFlipped] = useState(false);

  const { transform, opacity } = useSpring({
    transform: `perspective(600px) rotateY(${flipped ? 180 : 0}deg)`,
    opacity: flipped ? 1 : 0,
    config: config.stiff,
  });

  return (
    <div
      className={`card-item ${!isClaimed ? 'disabled' : ''}`}
      onClick={isClaimed ? () => setFlipped(f => !f) : undefined}
    >
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
          style={{ filter: isClaimed ? 'none' : 'grayscale(100%) opacity(0.3)' }}
        />
      </animated.div>

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

  if (claimed === null) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader />
      </Center>
    );
  }

  const claimedMap = Object.fromEntries(
    claimed.map(({ cardId, description }) => [cardId, description])
  );

  const sortedCards = [...masterCards].sort((a, b) => a.num - b.num);

  return (
    <div className="memories-container">
      {sortedCards.length === 0 ? (
        <p className="no-memories">
          No whispers yet in your hall of memories — claim a card and let its story unfold.
        </p>
      ) : (
        <div className="card-grid">
          {sortedCards.map(card => (
            <MemoryCard
              key={card.id}
              image={card.image}
              description={claimedMap[card.id] || ''}
              isClaimed={claimedMap.hasOwnProperty(card.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

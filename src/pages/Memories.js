import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Loader, Center } from '@mantine/core';
import './Memories.css'; // we'll add CSS there

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

export default function Memories() {
  const [claimed, setClaimed] = useState(null);

  useEffect(() => {
    async function load() {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return setClaimed([]);
      const snap = await getDoc(doc(db, 'users', user.uid));
      setClaimed((snap.data()?.cards || []).map(c => c.cardId));
    }
    load();
  }, []);

  if (claimed === null) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader />
      </Center>
    );
  }

  return (
    <div className="memories-container">
      {claimed.length === 0 ? (
        <p className="no-memories">You haven’t claimed any cards yet!</p>
      ) : (
        <div className="card-grid">
          {claimed.map(cardId => {
            const meta = masterCards.find(c => c.id === cardId);
            return meta ? (
              <div key={cardId} className="card-item">
                <img src={meta.image} alt={cardId} />
              </div>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}

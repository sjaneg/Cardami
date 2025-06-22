import { useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

function LogClaimedCards() {
  useEffect(() => {
    async function fetchAndLog() {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.log('No user signed in');
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      const data = snap.data() || {};

      // This is the raw array you pushed with arrayUnion:
      // [{ cardId: 'Bottle_of_Joy_1', description: '…' }, …]
      console.log('Claimed cards:', data.cards);
    }

    fetchAndLog();
  }, []);

  return null; // nothing to render
}

export default LogClaimedCards;
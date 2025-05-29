import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

// Re-export the existing Firebase instances from api.ts
export { db, auth } from '../helpers/api'; 
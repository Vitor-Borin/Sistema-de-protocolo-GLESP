// Firebase Configuration for GLESP
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuração do Firebase - GLESP
const firebaseConfig = {
  apiKey: "AIzaSyCvfXjnsfAzjteqXUosZL8pHAvW-F5ZpHo",
  authDomain: "sistema-de-protocolo-glesp.firebaseapp.com",
  projectId: "sistema-de-protocolo-glesp",
  storageBucket: "sistema-de-protocolo-glesp.firebasestorage.app",
  messagingSenderId: "1055636360295",
  appId: "1:1055636360295:web:ad0e6d8fa181a19e2958c2",
  measurementId: "G-5J8ZLP1JV3"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Serviços do Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "gen-lang-client-0601422826",
  appId: "1:863444751479:web:28b9d961c626de7414e272",
  apiKey: "AIzaSyAeKcJUSK0duVKBg_Aw2bDkgntxlGN-9h4",
  authDomain: "gen-lang-client-0601422826.firebaseapp.com",
  storageBucket: "gen-lang-client-0601422826.firebasestorage.app",
  messagingSenderId: "863444751479",
  measurementId: ""
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

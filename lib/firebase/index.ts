// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBZqhlEk13_PeiPGAyKfFAfHyj-MATUGZ4',
  authDomain: 'portfolio-35dfd.firebaseapp.com',
  databaseURL: 'https://portfolio-35dfd.firebaseio.com',
  projectId: 'portfolio-35dfd',
  storageBucket: 'portfolio-35dfd.appspot.com',
  messagingSenderId: '632417181065',
  appId: '1:632417181065:web:6d18b76dc4e23443ed9558',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firebaseStorage = getStorage(app);

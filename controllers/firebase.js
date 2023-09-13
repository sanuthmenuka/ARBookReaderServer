// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCtCisgfV4fvPWWjThEp4hXYpKXzQVZWX8",
  authDomain: "arbookreader-50534.firebaseapp.com",
  projectId: "arbookreader-50534",
  storageBucket: "arbookreader-50534.appspot.com",
  messagingSenderId: "622341281801",
  appId: "1:622341281801:web:e660683804068fa9f080d8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

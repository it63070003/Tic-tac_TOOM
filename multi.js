// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-analytics.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC0KXbQP2TRfHS544PCO0Lyuykyy8smk3s",
    authDomain: "tictactoom-420xd.firebaseapp.com",
    databaseURL: "https://tictactoom-420xd-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "tictactoom-420xd",
    storageBucket: "tictactoom-420xd.appspot.com",
    messagingSenderId: "713753276707",
    appId: "1:713753276707:web:7b21e628d8380a680ddc96",
    measurementId: "G-QTPBT2T1H2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);
const auth = getAuth();

// Import the functions you need from the SDKs you need
import {initializeApp} from "firebase/app";
import {getFirestore} from "firebase/firestore";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDPsZ3P2cEuVRKtso3z4h3EF0G0ninM-yY",
    authDomain: "mr-usatu.firebaseapp.com",
    projectId: "mr-usatu",
    storageBucket: "mr-usatu.appspot.com",
    messagingSenderId: "729460079370",
    appId: "1:729460079370:web:787d2ed427f96bcd22d8f3",
    measurementId: "G-PHWBER8R7V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const fireStore = getFirestore(app)


export default fireStore;

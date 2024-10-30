import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore,Timestamp  } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBImtv8iM5zUX371FwIBEBJXL74AvPIbcQ",
    authDomain: "oka-beach.firebaseapp.com",
    databaseURL: "https://oka-beach-default-rtdb.firebaseio.com",
    projectId: "oka-beach",
    storageBucket: "oka-beach.appspot.com",
    messagingSenderId: "651929269653",
    appId: "1:651929269653:web:47e80929eed75acb7a329c",
    measurementId: "G-73HM9NXC2E"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db,Timestamp };

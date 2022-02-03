// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import {doc, getDoc,getFirestore, collection, query, where,getDocs} from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

const firebaseConfig = {

  apiKey: "AIzaSyCx_9Kyfjn03jNXGM9dj7b8Omfd6CP0awU",

  authDomain: "actamproject-598ad.firebaseapp.com",

  projectId: "actamproject-598ad",

  storageBucket: "actamproject-598ad.appspot.com",

  messagingSenderId: "868627486863",

  appId: "1:868627486863:web:ee55ebd557f3abd6d5b8fa"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);
const db = getFirestore();




//------------------storage handling-------------------------------------- 

const storage = getStorage(app)

export async function getAsset(imageName) {
    let assetPos = 'assets/' + imageName
    let reference = ref(storage, assetPos) 
    console.log(reference)
    let url = await getDownloadURL(reference)
    try {
        return new URL(url)
    } catch(error) {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case 'storage/object-not-found':
            // File doesn't exist
            break;
          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;
          case 'storage/canceled':
            // User canceled the upload
            break;
    
          // ...
    
          case 'storage/unknown':
            // Unknown error occurred, inspect the server response
            break;
        }
    }
}


//-------------------------------database handling--------------------------//
export async function getMenuTypes() {
  const docRef = doc(db, "menu", "menuTypes");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    // doc.data() will be undefined in this case
    console.log("No such document!");
  }
}

export async function getElementsByType(type) {
  const q = query(collection(db, "elements"), where("elementType", "==", type));

  const querySnapshot = await getDocs(q);
  elementsToRet = []
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    elementsToRet.push(doc.data());
  });
  return elementsToRet
}

export async function getDocumentElement(docId) {
  const docRef = doc(db, "elements", docId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    // doc.data() will be undefined in this case
    console.log("No such document!");
  }
}
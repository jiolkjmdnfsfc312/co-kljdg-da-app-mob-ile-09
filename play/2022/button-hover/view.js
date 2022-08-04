const firebaseConfig = {
    apiKey: "AIzaSyA4-5AZJGJaKDU4rcdeKP0YsWhQNAOIYaw",
  authDomain: "codaxo-app-view.firebaseapp.com",
  databaseURL: "https://codaxo-app-view-default-rtdb.firebaseio.com",
  projectId: "codaxo-app-view",
  storageBucket: "codaxo-app-view.appspot.com",
  messagingSenderId: "464084150670",
  appId: "1:464084150670:web:42850b5656cbc170b15cdf",
  measurementId: "G-JJ58D1JC2H"
  };
  firebase.initializeApp(firebaseConfig);
  
  const hitCounter = document.getElementById("hit-counter");
  hitCounter.style.display = "none";
  
  const db = firebase.database().ref("View Button Hover Effects Animation | HTML CSS");
  db.on("value", (snapshot) => {
   hitCounter.textContent = snapshot.val().toLocaleString().replaceAll(',', '.');
  });
  
  db.transaction(
   (totalHits) => totalHits + 1,
   (error) => {
     if (error) {
       console.log(error);
     } else {
       hitCounter.style.display = "inline-block";
     }
   }
  );
  
  const userCookieName = "returningVisitor";
  checkUserCookie(userCookieName);
  
  function checkUserCookie(userCookieName) {
   const regEx = new RegExp(userCookieName, "g");
   const cookieExists = document.cookie.match(regEx);
   if (cookieExists != null) {
     hitCounter.style.display = "inline-block";
   } else {
     createUserCookie(userCookieName);
     db.transaction(
       (totalHits) => totalHits + 1,
       (error) => {
         if (error) {
           console.log(error);
         } else {
           hitCounter.style.display = "inline-block";
         }
       }
     );
   }
  }
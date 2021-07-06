// firebase.auth().onAuthStateChanged(function(user) {
//     if (user) {
//       // User is signed in.
//       window.alert("Welcome "+user)
//       var myWindow = window.open("/welcome", "_self");
//     } else {
//       // No user is signed in.
//     }
//   });

// function loginBtn(){
//     var emailField = document.getElementById("userid");
//     var passwordField = document.getElementById("password");

//     firebase.auth().signInWithEmailAndPassword(emailField, passwordField).catch(function(error) {
//         // Handle Errors here.
//         var errorCode = error.code;
//         var errorMessage = error.message;
//         window.alert("Error : "+errorMessage)
//         // ...
//       });
// }
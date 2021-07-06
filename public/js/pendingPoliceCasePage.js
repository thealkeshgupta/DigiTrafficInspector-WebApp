
var firebaseConfig = {
    apiKey: "AIzaSyDaYCziA4kqgGMNhgTWChoIGcxNv8O3xBg",
    authDomain: "digi-traffic-inspector-v0.firebaseapp.com",
    databaseURL: "https://digi-traffic-inspector-v0.firebaseio.com",
    projectId: "digi-traffic-inspector-v0",
    storageBucket: "digi-traffic-inspector-v0.appspot.com",
    messagingSenderId: "150159815877",
    appId: "1:150159815877:web:c164ed356e9be8da1dacac",
    measurementId: "G-36YTHX945L"
  };
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
const list_div = document.querySelector("#list-div")
var storage = firebase.storage();
var currentCase="";
// Create a storage reference from our storage service
var storageRef = storage.ref();

db.collection("Complaints").where("SOLVED", "==", "no")
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
           list_div.innerHTML += "<div class='list-item item'><h4>Case Number : "+doc.data().DATE_TIME_STAMP+"</h4><a class='ui button' href='/casePolice/"+doc.data().DATE_TIME_STAMP+"'>Open Case</a></div>";
        });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });

    // db.collection("Complaints").onSnapshot(snapshot =>{
    //     let changes = snapshot.docChanges();
    //     console.log(changes)
    //     changes.forEach(change =>{
    //         if(change.type == "added"){
    //             list_div.innerHTML += "<div class='list-item item' data-id='abc"+doc.data().DATE_TIME_STAMP+"' ><h4>Case Number : "+doc.data().DATE_TIME_STAMP+"</h4><a class='ui button' href='/case/"+doc.data().DATE_TIME_STAMP+"'>Open Case</a></div>";
    //             console.log("added")
    //         }
    //         else if (changes.type == "removed"){
    //             let li = list_div.querySelector("[data-id= abc" +change.doc.id+ "]");
    //             list_div.removeChild(li);
    //         }
    //     })
    // })



storageRef.child('pictures/null.png').getDownloadURL().then(function(url) {
        // `url` is the download URL for 'images/stars.jpg'
      
        // This can be downloaded directly:
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function(event) {
          var blob = xhr.response;
        };
        xhr.open('GET', url);
        xhr.send();
      
        // Or inserted into an <img> element:
        var img = document.getElementById('myimg');
        img.src = url;
      }).catch(function(error) {
        // Handle any errors
      });
var db = firebase.firestore();


function submitData(){
    var fname = document.getElementById("fname").value;
    var lname = document.getElementById("lname").value;
    db.collection("cities").doc("LA3").set({
        name: fname+lname,
        state: "CA",
        country: "USA"
    })
    .then(function() {
        console.log("Document successfully written!");
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
    });
}
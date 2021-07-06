var express = require("express");
var app = express();
var path = require("path");
var bodyParser = require("body-parser");
var firebase = require('firebase')
var storage = require("firebase/storage")
global.XMLHttpRequest = require('xhr2');
app.use(bodyParser());
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
app.use(express.static(path.join(__dirname, "/public")));
app.set("view engine", "ejs");
app.get('/', function (req, resp) {
    resp.sendFile('home.html', { root: path.join(__dirname, "./files") })
});
var storage = firebase.storage();
var storageRef = storage.ref();
var currentUser;
var link = "";
app.get('/login', function (req, resp) {

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            console.log("welcome" + user)
            currentUser = user;
            resp.sendFile('MainPage.html', { root: path.join(__dirname, "./files") })
            console.log("Already logged in")
        } else {
            resp.sendFile('loginPage.html', { root: path.join(__dirname, "./files") })
            console.log("Not logged in")
        }
    });

});

app.post('/login', function (req, resp) {
    var userid = req.body.userid;
    var password = req.body.password;
    console.log(userid)
    firebase.auth().signInWithEmailAndPassword(userid, password).then(function () {
        var UserID = "" + firebase.auth().currentUser.uid.toString();
        db.collection("USERDB").doc(UserID).get().then(function (doc) {
            if (doc.exists) {
                console.log("Document data:", doc.data());
                if (doc.data().USER_TYPE == "Main_Authority") {
                    console.log("THIS USER IS -->" + doc.data().USER_TYPE)
                    resp.sendFile('MainPage.html', { root: path.join(__dirname, "./files") })
                }
                else {

                    firebase.auth().signOut().then(function () {
                        console.log("Signed Out")
                        resp.sendFile('loginPage.html', { root: path.join(__dirname, "./files") })

                    }).catch(function (error) {
                        console.log(error)
                    });
                }
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch(function (error) {
            console.log("Error getting document:", error);
        });
    }).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // window.alert("Error : "+errorMessage)
        console.log(errorMessage)

        // ...
    });


});

app.get('/register', function (req, resp) {

    resp.sendFile('registerPage.html', { root: path.join(__dirname, "./files") })

});

app.post('/register', function (req, resp) {
    var userid = req.body.userid;
    var password = req.body.password;
    firebase.auth().createUserWithEmailAndPassword(userid, password).then(function () {
        var UserID = "" + firebase.auth().currentUser.uid.toString();
        db.collection("USERDB").doc(UserID).set({
            UID: UserID,
            USER_TYPE: "Main_Authority"
        })
            .then(function () {
                resp.sendFile('pendingCasePage.html', { root: path.join(__dirname, "./files") })
            })
            .catch(function (error) {
                console.error("Error writing document: ", error);
            });
    }).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // window.alert("Error : "+errorMessage)
        console.log(errorMessage)

        // ...
    });


});

app.get('/pendingPublicCase', function (req, resp) {

    resp.sendFile('pendingPublicCasePage.html', { root: path.join(__dirname, "./files") })
});

app.get('/pendingPoliceCase', function (req, resp) {

    resp.sendFile('pendingPoliceCasePage.html', { root: path.join(__dirname, "./files") })

});

app.get('/home', function (req, resp) {

    resp.sendFile('MainPage.html', { root: path.join(__dirname, "./files") })
});


app.get('/history', function (req, resp) {

    resp.render("historyPage", { Userid: firebase.auth().currentUser.uid.toString() })
});

app.get('/locateCase', function (req, resp) {

    var MarkerArray = [], MarkerArray2 = [], Case1 = [], Case2 = [];
    var lim = 10;
    console.log(lim)
    db.collection("Complaints").orderBy("DATE_TIME_STAMP", "desc").limit(parseInt(lim))
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                MarkerArray.push({
                    lat: doc.data().LATITUDE, lng: doc.data().LONGITUDE
                })
                Case1.push({
                    caseID: doc.data().DATE_TIME_STAMP
                })


            });


            db.collection("Complaints2").orderBy("DATE_TIME_STAMP", "desc").limit(parseInt(lim))
                .get()
                .then(function (querySnapshot) {
                    querySnapshot.forEach(function (doc) {
                        MarkerArray2.push({
                            lat: doc.data().LATITUDE, lng: doc.data().LONGITUDE
                        })
                        Case2.push({
                            caseID: doc.data().DATE_TIME_STAMP
                        })


                    });


                    setTimeout(function () { resp.render("mapPage", { markerList: MarkerArray, markerList2: MarkerArray2, case1: Case1, case2: Case2 }); }, 2000);
                })
                .catch(function (error) {
                    console.log("Error getting documents: ", error);
                });
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });

    // resp.sendFile('mapPage.html', {root: path.join(__dirname,"./files")})
});


app.post('/mapPageLim', function (req, resp) {

    var MarkerArray = [], MarkerArray2 = [], Case1 = [], Case2 = [];
    var lim = req.body.markerNumber;
    console.log(lim)
    db.collection("Complaints").orderBy("DATE_TIME_STAMP", "desc").limit(parseInt(lim))
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                MarkerArray.push({
                    lat: doc.data().LATITUDE, lng: doc.data().LONGITUDE
                })
                Case1.push({
                    caseID: doc.data().DATE_TIME_STAMP
                })

            });


            db.collection("Complaints2").orderBy("DATE_TIME_STAMP", "desc").limit(parseInt(lim))
                .get()
                .then(function (querySnapshot) {
                    querySnapshot.forEach(function (doc) {
                        MarkerArray2.push({
                            lat: doc.data().LATITUDE, lng: doc.data().LONGITUDE
                        })
                        Case2.push({
                            caseID: doc.data().DATE_TIME_STAMP
                        })


                    });


                    setTimeout(function () { resp.render("mapPage", { markerList: MarkerArray, markerList2: MarkerArray2, case1: Case1, case2: Case2 }); }, 2000);
                })
                .catch(function (error) {
                    console.log("Error getting documents: ", error);
                });
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });

    // resp.sendFile('mapPage.html', {root: path.join(__dirname,"./files")})
});


app.get('/createInspector', function (req, resp) {

    resp.sendFile('createInspectorPage.html', { root: path.join(__dirname, "./files") })

});

app.post('/createInspector', function (req, resp) {
    var userid = req.body.userid;
    var password = req.body.password;
    firebase.auth().createUserWithEmailAndPassword(userid, password).then(function () {
        var UserID = "" + firebase.auth().currentUser.uid.toString();
        db.collection("USERDB").doc(UserID).set({
            UID: UserID,
            USER_TYPE: "Traffic_Inspector"
        })
            .then(function () {
                resp.sendFile('createInspectorPage.html', { root: path.join(__dirname, "./files") })
            })
            .catch(function (error) {
                console.error("Error writing document: ", error);
            });
    }).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // window.alert("Error : "+errorMessage)
        console.log(errorMessage)

        // ...
    });

});



app.get('/logout', function (req, resp, next) {

    firebase.auth().signOut().then(function () {
        console.log("Signed Out")
        resp.sendFile('loginPage.html', { root: path.join(__dirname, "./files") })
        // resp.redirect('/login')

    }).catch(function (error) {
        console.log(error)
    });

});


app.get('/casePublic/:caseid', function (req, res) {
    var dataReceived;
    var picture1, picture2, picture3;
    var allegationArray = ["No", "No", "No", "No", "No", "No"];

    link = "/casePublic/" + req.params.caseid + "/solve";
    console.log(req.params.caseid)
    var docRef = db.collection("Complaints2").doc(req.params.caseid);
    docRef.get().then(function (doc) {
        if (doc.exists) {
            dataReceived = doc.data();
            if (doc.data().VIOLATION_1) {
                allegationArray[0] = "Yes"
            }
            if (doc.data().VIOLATION_2) {
                allegationArray[1] = "Yes"
            }
            if (doc.data().VIOLATION_3) {
                allegationArray[2] = "Yes"
            }
            if (doc.data().VIOLATION_4) {
                allegationArray[3] = "Yes"
            }
            if (doc.data().VIOLATION_5) {
                allegationArray[4] = "Yes"
            }
            storageRef.child('pictures/' + doc.data().PICTURE_1).getDownloadURL().then(function (url) {
                // `url` is the download URL for 'images/stars.jpg'

                // This can be downloaded directly:
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function (event) {
                    var blob = xhr.response;
                };
                xhr.open('GET', url);
                xhr.send();
                picture1 = url;
                // Or inserted into an <img> element:

            }).catch(function (error) {
                // Handle any errors
            });


            storageRef.child('pictures/' + doc.data().PICTURE_2).getDownloadURL().then(function (url2) {
                // `url` is the download URL for 'images/stars.jpg'

                // This can be downloaded directly:
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function (event) {
                    var blob = xhr.response;
                };
                xhr.open('GET', url2);
                xhr.send();
                picture2 = url2;
                // Or inserted into an <img> element:

            }).catch(function (error) {
                // Handle any errors
            });


            storageRef.child('pictures/' + doc.data().PICTURE_3).getDownloadURL().then(function (url3) {
                // `url` is the download URL for 'images/stars.jpg'

                // This can be downloaded directly:
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function (event) {
                    var blob = xhr.response;
                };
                xhr.open('GET', url3);
                xhr.send();
                picture3 = url3;
                console.log(allegationArray);

            }).catch(function (error) {
                // Handle any errors
            });

            setTimeout(function () { res.render("casePublicPage", { caseid: req.params.caseid, caseData: dataReceived, link: link, picture1: picture1, picture2: picture2, picture3: picture3, allegationArray: allegationArray }); }, 2000);

        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!")
        }
    }).catch(function (error) {
        console.log("Error getting document:", error);
    });


});


app.get('/casePolice/:caseid', function (req, res) {
    var dataReceived;
    var frontViewURL, leftViewURL, backViewURL, rightViewURL;

    link = "/casePolice/" + req.params.caseid + "/solve";
    console.log(req.params.caseid)
    var docRef = db.collection("Complaints").doc(req.params.caseid);
    docRef.get().then(function (doc) {
        if (doc.exists) {
            dataReceived = doc.data();

            storageRef.child('pictures/' + doc.data().FRONT_VIEW).getDownloadURL().then(function (url) {
                // `url` is the download URL for 'images/stars.jpg'

                // This can be downloaded directly:
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function (event) {
                    var blob = xhr.response;
                };
                xhr.open('GET', url);
                xhr.send();
                frontViewURL = url;
                // Or inserted into an <img> element:

            }).catch(function (error) {
                // Handle any errors
            });


            storageRef.child('pictures/' + doc.data().LEFT_VIEW).getDownloadURL().then(function (url2) {
                // `url` is the download URL for 'images/stars.jpg'

                // This can be downloaded directly:
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function (event) {
                    var blob = xhr.response;
                };
                xhr.open('GET', url2);
                xhr.send();
                leftViewURL = url2;
                // Or inserted into an <img> element:

            }).catch(function (error) {
                // Handle any errors
            });


            storageRef.child('pictures/' + doc.data().BACK_VIEW).getDownloadURL().then(function (url3) {
                // `url` is the download URL for 'images/stars.jpg'

                // This can be downloaded directly:
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function (event) {
                    var blob = xhr.response;
                };
                xhr.open('GET', url3);
                xhr.send();
                backViewURL = url3;
                // Or inserted into an <img> element:

            }).catch(function (error) {
                // Handle any errors
            });


            storageRef.child('pictures/' + doc.data().RIGHT_VIEW).getDownloadURL().then(function (url4) {
                // `url` is the download URL for 'images/stars.jpg'

                // This can be downloaded directly:
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function (event) {
                    var blob = xhr.response;
                };
                xhr.open('GET', url4);
                xhr.send();
                rightViewURL = url4;
                // Or inserted into an <img> element:

            }).catch(function (error) {
                // Handle any errors
            });
            setTimeout(function () { res.render("casePolicePage", { caseid: req.params.caseid, caseData: dataReceived, link: link, frontViewURL: frontViewURL, leftViewURL: leftViewURL, backViewURL: backViewURL, rightViewURL: rightViewURL }); }, 2000);

        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function (error) {
        console.log("Error getting document:", error);
    });


});



app.post('/casePublic/:caseid/solve', function (req, res) {
    var dataReceived;
    console.log(req.params.caseid)
    var F_V = ['No', 'No', 'No', 'No', 'No']
    var penalty = 0, award = 0;
    var docRef = db.collection("Complaints2").doc(req.params.caseid);
    docRef.get().then(function (doc) {
        if (doc.exists) {

            if (req.body.v1) {
                F_V[0] = "Yes"
                penalty += 20;
                award += 20;
            }
            else {
                if (doc.data().VIOLATION_1) {
                    award -= 10;
                }
            }
            if (req.body.v2) {
                F_V[1] = "Yes"
                penalty += 20;
                award += 20;
            }
            else {
                if (doc.data().VIOLATION_2) {
                    award -= 10;
                }
            }
            if (req.body.v3) {
                F_V[2] = "Yes"
                penalty += 20;
                award += 20;
            }
            else {
                if (doc.data().VIOLATION_3) {
                    award -= 10;
                }
            }
            if (req.body.v4) {
                F_V[3] = "Yes"
                penalty += 20;
                award += 20;
            }
            else {
                if (doc.data().VIOLATION_4) {
                    award -= 10;
                }
            }
            if (req.body.v5) {
                F_V[4] = "Yes"
                penalty += 20;
                award += 20;
            }
            else {
                if (doc.data().VIOLATION_5) {
                    award -= 10;
                }
            }

            var docRef = db.collection("Complaints2").doc(req.params.caseid);
            docRef.update({
                SOLVED: "yes",
                SOLVED_BY: firebase.auth().currentUser.uid.toString(),
                SOLVED_ON: Date(),
                FOUND_VIOLATION_1: F_V[0],
                FOUND_VIOLATION_2: F_V[1],
                FOUND_VIOLATION_3: F_V[2],
                FOUND_VIOLATION_4: F_V[3],
                FOUND_VIOLATION_5: F_V[4],
                PENALTY: "" + penalty,
                SCORE: "" + award
            }).then(function () {

                var docRef2 = db.collection("Complaints2").doc(req.params.caseid);
                docRef2.get().then(function (doc) {
                    if (doc.exists) {

                        var docRef3 = db.collection("USERDB").doc(doc.data().UID);
                        docRef3.get().then(function (doc2) {
                            if (doc2.exists) {
                                totalPoints = parseInt(doc2.data().TOTAL_SCORE) + award
                                console.log(totalPoints)
                            }

                            var docRef4 = db.collection("USERDB").doc(doc.data().UID);
                            docRef4.update({
                                TOTAL_SCORE: totalPoints + ""
                            }).then(function () {
                                console.log("Points Updated");
                                res.redirect("/pendingPublicCase")

                            }).catch(function (error) {
                                console.log("Error getting document:", error);
                            });

                        }).catch(function (error) {
                            console.log("Error getting document:", error);
                        })
                    }
                }).catch(function (error) {
                    console.log("Error getting document:", error);
                })
            }).catch(function (error) {
                console.log("Error getting document:", error);
            });
        }
    });
})

app.post('/casePolice/:caseid/solve', function (req, res) {
    var dataReceived;
    var points = 0;
    var totalPoints = 0;
    if (req.body.decisionGiven == "Approved") { points = 5 }
    console.log(req.params.caseid)
    var docRef1 = db.collection("Complaints").doc(req.params.caseid);
    docRef1.update({
        SOLVED: "yes",
        SOLVED_BY: firebase.auth().currentUser.uid.toString(),
        SOLVED_ON: Date(),
        CASE_DECISION: req.body.decisionGiven,
        SCORE: "" + 5

    }).then(function () {
        var docRef2 = db.collection("Complaints").doc(req.params.caseid);
        docRef2.get().then(function (doc) {
            if (doc.exists) {

                var docRef3 = db.collection("USERDB").doc(doc.data().UID);
                docRef3.get().then(function (doc2) {
                    if (doc.exists) {
                        totalPoints = parseInt(doc2.data().TOTAL_SCORE) + points
                        console.log(totalPoints)
                    }

                    var docRef4 = db.collection("USERDB").doc(doc.data().UID);
                    docRef4.update({
                        TOTAL_SCORE: totalPoints + ""
                    }).then(function () {

                        res.redirect("/pendingPoliceCase")

                    }).catch(function (error) {
                        console.log("Error getting document:", error);
                    });

                }).catch(function (error) {
                    console.log("Error getting document:", error);
                })
            }
        }).catch(function (error) {
            console.log("Error getting document:", error);
        })
    }).catch(function (error) {
        console.log("Error getting document:", error);
    });
});

app.get('/misc', function (req, resp) {

    resp.sendFile('miscellaneousPage.html', { root: path.join(__dirname, "./files") })
});


app.post('/misc/policeCase', function (req, res) {
    var dataReceived;
    var frontViewURL, leftViewURL, backViewURL, rightViewURL;

    console.log(req.body.caseNumber)
    var docRef = db.collection("Complaints").doc(req.body.caseNumber);
    docRef.get().then(function (doc) {
        if (doc.exists) {
            dataReceived = doc.data();

            storageRef.child('pictures/' + doc.data().FRONT_VIEW).getDownloadURL().then(function (url) {
                // `url` is the download URL for 'images/stars.jpg'

                // This can be downloaded directly:
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function (event) {
                    var blob = xhr.response;
                };
                xhr.open('GET', url);
                xhr.send();
                frontViewURL = url;
                // Or inserted into an <img> element:

            }).catch(function (error) {
                // Handle any errors
            });


            storageRef.child('pictures/' + doc.data().LEFT_VIEW).getDownloadURL().then(function (url2) {
                // `url` is the download URL for 'images/stars.jpg'

                // This can be downloaded directly:
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function (event) {
                    var blob = xhr.response;
                };
                xhr.open('GET', url2);
                xhr.send();
                leftViewURL = url2;
                // Or inserted into an <img> element:

            }).catch(function (error) {
                // Handle any errors
            });


            storageRef.child('pictures/' + doc.data().BACK_VIEW).getDownloadURL().then(function (url3) {
                // `url` is the download URL for 'images/stars.jpg'

                // This can be downloaded directly:
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function (event) {
                    var blob = xhr.response;
                };
                xhr.open('GET', url3);
                xhr.send();
                backViewURL = url3;
                // Or inserted into an <img> element:

            }).catch(function (error) {
                // Handle any errors
            });


            storageRef.child('pictures/' + doc.data().RIGHT_VIEW).getDownloadURL().then(function (url4) {
                // `url` is the download URL for 'images/stars.jpg'

                // This can be downloaded directly:
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function (event) {
                    var blob = xhr.response;
                };
                xhr.open('GET', url4);
                xhr.send();
                rightViewURL = url4;
                // Or inserted into an <img> element:

            }).catch(function (error) {
                // Handle any errors
            });
            setTimeout(function () { res.render("showCaseDetailPolicePage", { caseid: req.params.caseNumber, caseData: dataReceived, link: link, frontViewURL: frontViewURL, leftViewURL: leftViewURL, backViewURL: backViewURL, rightViewURL: rightViewURL }); }, 2000);

        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function (error) {
        console.log("Error getting document:", error);
    });




});




app.post('/misc/publicCase', function (req, res) {
    var dataReceived;
    var picture1, picture2, picture3;
    var allegationArray = ["No", "No", "No", "No", "No", "No"];
    var docRef = db.collection("Complaints2").doc(req.body.caseNumber);
    docRef.get().then(function (doc) {
        if (doc.exists) {
            dataReceived = doc.data();
            if (doc.data().VIOLATION_1) {
                allegationArray[0] = "Yes"
            }
            if (doc.data().VIOLATION_2) {
                allegationArray[1] = "Yes"
            }
            if (doc.data().VIOLATION_3) {
                allegationArray[2] = "Yes"
            }
            if (doc.data().VIOLATION_4) {
                allegationArray[3] = "Yes"
            }
            if (doc.data().VIOLATION_5) {
                allegationArray[4] = "Yes"
            }
            storageRef.child('pictures/' + doc.data().PICTURE_1).getDownloadURL().then(function (url) {
                // `url` is the download URL for 'images/stars.jpg'

                // This can be downloaded directly:
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function (event) {
                    var blob = xhr.response;
                };
                xhr.open('GET', url);
                xhr.send();
                picture1 = url;
                // Or inserted into an <img> element:

            }).catch(function (error) {
                // Handle any errors
            });


            storageRef.child('pictures/' + doc.data().PICTURE_2).getDownloadURL().then(function (url2) {
                // `url` is the download URL for 'images/stars.jpg'

                // This can be downloaded directly:
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function (event) {
                    var blob = xhr.response;
                };
                xhr.open('GET', url2);
                xhr.send();
                picture2 = url2;
                // Or inserted into an <img> element:

            }).catch(function (error) {
                // Handle any errors
            });


            storageRef.child('pictures/' + doc.data().PICTURE_3).getDownloadURL().then(function (url3) {
                // `url` is the download URL for 'images/stars.jpg'

                // This can be downloaded directly:
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function (event) {
                    var blob = xhr.response;
                };
                xhr.open('GET', url3);
                xhr.send();
                picture3 = url3;
                console.log(allegationArray);

            }).catch(function (error) {
                // Handle any errors
            });

            setTimeout(function () { res.render("showCaseDetailPublicPage", { caseid: req.params.caseid, caseData: dataReceived, picture1: picture1, picture2: picture2, picture3: picture3, allegationArray: allegationArray }); }, 2000);

        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!")
        }
    }).catch(function (error) {
        console.log("Error getting document:", error);
    });




});



app.get('/misc/policeCase/:caseid', function (req, res) {
    var dataReceived;
    var frontViewURL, leftViewURL, backViewURL, rightViewURL;

    console.log(req.params.caseid)
    var docRef = db.collection("Complaints").doc(req.params.caseid);
    docRef.get().then(function (doc) {
        if (doc.exists) {
            dataReceived = doc.data();

            storageRef.child('pictures/' + doc.data().FRONT_VIEW).getDownloadURL().then(function (url) {
                // `url` is the download URL for 'images/stars.jpg'

                // This can be downloaded directly:
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function (event) {
                    var blob = xhr.response;
                };
                xhr.open('GET', url);
                xhr.send();
                frontViewURL = url;
                // Or inserted into an <img> element:

            }).catch(function (error) {
                // Handle any errors
            });


            storageRef.child('pictures/' + doc.data().LEFT_VIEW).getDownloadURL().then(function (url2) {
                // `url` is the download URL for 'images/stars.jpg'

                // This can be downloaded directly:
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function (event) {
                    var blob = xhr.response;
                };
                xhr.open('GET', url2);
                xhr.send();
                leftViewURL = url2;
                // Or inserted into an <img> element:

            }).catch(function (error) {
                // Handle any errors
            });


            storageRef.child('pictures/' + doc.data().BACK_VIEW).getDownloadURL().then(function (url3) {
                // `url` is the download URL for 'images/stars.jpg'

                // This can be downloaded directly:
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function (event) {
                    var blob = xhr.response;
                };
                xhr.open('GET', url3);
                xhr.send();
                backViewURL = url3;
                // Or inserted into an <img> element:

            }).catch(function (error) {
                // Handle any errors
            });


            storageRef.child('pictures/' + doc.data().RIGHT_VIEW).getDownloadURL().then(function (url4) {
                // `url` is the download URL for 'images/stars.jpg'

                // This can be downloaded directly:
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function (event) {
                    var blob = xhr.response;
                };
                xhr.open('GET', url4);
                xhr.send();
                rightViewURL = url4;
                // Or inserted into an <img> element:

            }).catch(function (error) {
                // Handle any errors
            });
            setTimeout(function () { res.render("showCaseDetailPolicePage", { caseid: req.params.caseNumber, caseData: dataReceived, link: link, frontViewURL: frontViewURL, leftViewURL: leftViewURL, backViewURL: backViewURL, rightViewURL: rightViewURL }); }, 2000);

        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function (error) {
        console.log("Error getting document:", error);
    });




});




app.get('/misc/publicCase/:caseid', function (req, res) {
    var dataReceived;
    var picture1, picture2, picture3;
    var allegationArray = ["No", "No", "No", "No", "No", "No"];
    var docRef = db.collection("Complaints2").doc(req.params.caseid);
    docRef.get().then(function (doc) {
        if (doc.exists) {
            dataReceived = doc.data();
            if (doc.data().VIOLATION_1) {
                allegationArray[0] = "Yes"
            }
            if (doc.data().VIOLATION_2) {
                allegationArray[1] = "Yes"
            }
            if (doc.data().VIOLATION_3) {
                allegationArray[2] = "Yes"
            }
            if (doc.data().VIOLATION_4) {
                allegationArray[3] = "Yes"
            }
            if (doc.data().VIOLATION_5) {
                allegationArray[4] = "Yes"
            }
            storageRef.child('pictures/' + doc.data().PICTURE_1).getDownloadURL().then(function (url) {
                // `url` is the download URL for 'images/stars.jpg'

                // This can be downloaded directly:
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function (event) {
                    var blob = xhr.response;
                };
                xhr.open('GET', url);
                xhr.send();
                picture1 = url;
                // Or inserted into an <img> element:

            }).catch(function (error) {
                // Handle any errors
            });


            storageRef.child('pictures/' + doc.data().PICTURE_2).getDownloadURL().then(function (url2) {
                // `url` is the download URL for 'images/stars.jpg'

                // This can be downloaded directly:
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function (event) {
                    var blob = xhr.response;
                };
                xhr.open('GET', url2);
                xhr.send();
                picture2 = url2;
                // Or inserted into an <img> element:

            }).catch(function (error) {
                // Handle any errors
            });


            storageRef.child('pictures/' + doc.data().PICTURE_3).getDownloadURL().then(function (url3) {
                // `url` is the download URL for 'images/stars.jpg'

                // This can be downloaded directly:
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function (event) {
                    var blob = xhr.response;
                };
                xhr.open('GET', url3);
                xhr.send();
                picture3 = url3;
                console.log(allegationArray);

            }).catch(function (error) {
                // Handle any errors
            });

            setTimeout(function () { res.render("showCaseDetailPublicPage", { caseid: req.params.caseid, caseData: dataReceived, picture1: picture1, picture2: picture2, picture3: picture3, allegationArray: allegationArray }); }, 2000);

        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!")
        }
    }).catch(function (error) {
        console.log("Error getting document:", error);
    });




});




app.post('/misc/vehicle', function (req, res) {
    console.log(req.body.vehicleNumber)
    res.render("vehicleCasePage", { vehicleNumber: req.body.vehicleNumber })

});






app.listen(1337, function () {
    console.log('Listening at PORT 1337');
});

// app.listen(3000, '0.0.0.0', function() {
//     console.log('Listening to port:  ' + 3000);
// });

function imgUrlRetreive() {



}
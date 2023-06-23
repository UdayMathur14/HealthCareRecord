const doctorDetails = document.querySelector('.doctorDetails');
const ud = document.getElementById("ud")
const ypd = document.getElementById("ypd")
const yd = document.getElementById("yd")
const ydd = document.getElementById("ydd")
const editProfile = document.querySelector('#editProfile');
var u = [];
const addTxt = document.getElementById('addTxt')

// let speak = document.getElementById("editProfile");
let sr = window.webkitSpeechRecognition || window.SpeechRecognition;
let spRec = new sr();
spRec.continuous = true;
spRec.interimResults = true;
// speak.addEventListener("submit", e => {
//     e.preventDefault();
//     spRec.start();
//     spRec.lang = "eng";
// }
// );

function startRec(){
    spRec.start();
    spRec.lang = "eng";
}

spRec.onresult = res => {
    let text = Array.from(res.results)
        .map(r => r[0])
        .map(txt => txt.transcript)
        .join("");
    addTxt.value = text;
}
// speak[2].addEventListener("click", () => {
//     spRec.stop();
//     speak[0].value="";
// })

function stopRec(){
    spRec.stop();
    addTxt.value="";
}

function cpyToClipboard(){
    navigator.clipboard.writeText(addTxt.value);
}

    function createUserCollection(user) {
        firebase.firestore().collection('doctors').doc(user.uid).set({
            role: "doctor",
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            phone: "",
            speciality: "",
            portfolioURL: "",
            experience: "",
            profPicURL: "",
            docNotes: ""
        })
    }

    async function getUserInfo(userID) {
        if (userID) {
            const userInfoSnap = await firebase.firestore().collection('users').doc(userID).get()
            const userInfo = userInfoSnap.data()
            if (userInfo) {
                doctorDetails.innerHTML = `<div class="card" style="width: 24rem;height: 600px;">
            <img id="proimg" src="./assets/student.png" class="card-img-top" alt="..." style="height: 380px;">
            <div class="card-body">
                <h5 class="card-title"><h3>${userInfo.name}</h3></h5>
                <p class="card-text">                
                <ul>
                    <li>Email: ${userInfo.email}</li>
                    <li>Phone: ${userInfo.phone}</li>           
                </ul>
                </p>
                <a href="#" class="btn btn-primary">Profile</a>
            </div>
        </div>`
            }
        }
        else {
            doctorDetails.innerHTML = `
        <h3>Please login</h3>`
        }
    }

    async function getUserInfoRealTime(userID) {
        if (userID) {
            const userDocRef = await firebase.firestore().collection('doctors').doc(userID)
            userDocRef.onSnapshot((doc) => {
                if (doc.exists) {
                    const userInfo = doc.data()
                    if (userInfo) {
                        doctorDetails.innerHTML = `<div class="card" style="width: 24rem;height: 650px;">
                    <img id="proimg" src="./assets/student.png" class="card-img-top rounded-circle" alt="..." style="height: 380px;">
                    <div class="card-body">
                        <h5 class="card-title"><h3>${userInfo.name}</h3></h5>
                        <p class="card-text">                
                        <ul>
                            <li class="list-group-item">Email: ${userInfo.email}</li>
                            <li class="list-group-item">Phone: ${userInfo.phone}</li>           
                            <li class="list-group-item">experience: ${userInfo.experience}</li>           
                            <li class="list-group-item">portfolio url: <a href="${userInfo.portfolioURL}"> open </a> </li>           
                            <li class="list-group-item">speciality: ${userInfo.speciality}</li>           
                        </ul>
                        </p>
                        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal">
                            Edit Profile
                        </button>
                    </div>
                </div>`
                        editProfile["name"].value = userInfo.name
                        editProfile["phoneNo"].value = userInfo.phone
                        editProfile["experience"].value = userInfo.experience
                        editProfile["portfolio url"].value = userInfo.portfolioURL
                        editProfile["speciality"].value = userInfo.speciality
                        if (firebase.auth().currentUser.photoURL) {
                            console.log(document.querySelector('#proimg'))
                            document.querySelector('#proimg').src = firebase.auth().currentUser.photoURL
                        }
                    }
                }
            })
        }
        else {
            doctorDetails.innerHTML = `<h3>Please login</h3>`
        }
    }

    function updateUserProfile(e) {
        e.preventDefault();
        const userDocRef = firebase.firestore().collection('doctors').doc(firebase.auth().currentUser.uid)
        userDocRef.update({
            name: editProfile["name"].value,
            phone: editProfile["phoneNo"].value,
            experience: editProfile["experience"].value,
            portfolioURL: editProfile["portfolio url"].value,
            speciality: editProfile["speciality"].value
        })
    }

    function uploadImage(e) {
        console.log(e.target.files[0]);
        const uid = firebase.auth().currentUser.uid
        const fileRef = firebase.storage().ref().child(`/doctors/${uid}/profile`)
        const uploadTask = fileRef.put(e.target.files[0]);
        uploadTask.on('state_changed',
            (snapshot) => {
                // Observe state change events such as progress, pause, and resume
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (progress == 100) {
                    alert('uploaded')
                }
            },
            (error) => {
                console.log(error);
            },
            () => {
                // Handle successful uploads on complete
                // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    console.log('File available at', downloadURL);
                    document.querySelector('#proimg').src = downloadURL;
                    firebase.auth().currentUser.updateProfile({
                        photoURL: downloadURL
                    })
                    const userDocRef = firebase.firestore().collection('doctors').doc(firebase.auth().currentUser.uid)
                    userDocRef.update({
                        profPicURL: downloadURL
                    })
                });
            }
        );
    }

    // function allUserDetails(){
    //     ud.style.display="block";
    //     ypd.style.display="block";
    //     const userRef = firebase.firestore().collection("users")
    //     var unsubscribeUser = userRef.onSnapshot(querySnap=>{
    //         querySnap.docs.forEach(doc=>{
    //             const info = doc.data()
    //             console.log(info);
    //             ud.innerHTML += `<div class="card" style="width: 18rem;">
    //             <img id="proimg" src="${info.profPicURL}" class="card-img-top rounded-circle" alt="..." style="height: 380px;">
    //             <div class="card-body">            
    //               <h5 class="card-title">Name - ${info.name}</h5>
    //               <ul class="list-group">
    //                     <li class="list-group-item">Email - ${info.email}</li>
    //                     <li class="list-group-item">Experience - ${info.experience}</li>
    //                     <li class="list-group-item">Phone - ${info.phone}</li>
    //                     <li class="list-group-item">Speciality - ${info.speciality}</li>
    //              </ul>
    //              <a href="${info.portfolioURL}" class="btn btn-primary">Portfolio</a>
    //             </div>
    //           </div>`
    //         })
    //     })
    // }

    async function allUserDetails() {
        ud.style.display = "block";
        ypd.style.display = "block";
        const userRef = firebase.firestore().collection("users")
        var unsubscribeUser = userRef.onSnapshot(querySnap => {
            let totalNoOfDocs = querySnap.docs.length
            for (let i = 0; i < totalNoOfDocs; i++) {
                const info = querySnap.docs[i].data()
                console.log(info);
                u.push(info.uid)




                ud.innerHTML += `<div class="card" style="width: 18rem;">


            
            <button type="button" id="b${i}" class="btn btn-primary" data-toggle="modal" data-target="#exampleModalLong${i}">
                View Records
            </button>

            <div class="modal fade" id="exampleModalLong${i}" tabindex="-1" role="dialog" aria-labelledby="exampleModalLongTitle${i}" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLongTitle${i}">Modal ${i}</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            
                            <form autocomplete="off" id="${i}" onsubmit="updateRecords(event)">

                                <label for="docUpload" class="form-label">Upload New Document here</label>
                                <input class="form-control btn btn-warning" type="file" id="docUpload" onchange="uploadDoc(event,${i})" />
        
                                <div><input type="text" name="height" placeholder="enter height"></div>
                                <div><input type="text" name="weight" placeholder="enter weight"></div>
                                <div><input type="text" name="temperature" placeholder="enter temperature"></div>
                                <div><input type="text" name="pulse" placeholder="enter pulse"></div>
                                <div><input type="text" name="heartRate" placeholder="Heart Rate"></div>
                                <div><input type="text" name="bigNails" placeholder="Big Nails"></div>
                                <div><input type="text" name="ENTRemarks" placeholder="ENT remarks"></div>
                                <div><input type="text" name="earRemarks" placeholder="Ear checkup remarks"></div>
                                <div><input type="text" name="dentalRemarks" placeholder="dental checkup remarks"></div>
                                <div><input type="text" name="eyeRemarks" placeholder="eye checkup remarks"></div>
                                <div><input type="text" name="otherRemarks" placeholder="Any other remarks"></div>
                                
                                <textarea class="form-control" name="docNotes" placeholder="Place your notes here and hit button below" id="addTxt"></textarea>
                                <button type="button" onclick="startRec()" style="margin-top:10px; background-color: rgb(244, 107, 107);">Speak!</button>
                                <button type="button" onclick="stopRec()" style="margin-top:10px; background-color: rgb(244, 107, 107);">Stop</button>
                                <button type="button" onclick="cpyToClipboard()" style="all: unset; cursor:pointer"><img src="../assets/copy.png" width="55px"></button>
                                

                                <button type="submit" id=ib${i} class="btn btn-primary">submit</button>
                            </form>
                            

                            


                            <div style="text-align: center;"><h1>Your Past Records</h1></div>

                            <div id="rec${i}" class="d-flex align-items-center justify-content-around flex-row flex-wrap"></div>
                            
                            <div style="text-align: center;"><h1>Your Documents</h1></div>

                            <div id="docSet${i}" class="d-flex align-items-center justify-content-around flex-row flex-wrap"></div>

                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="submit" class="btn btn-primary">Save changes</button>
                        </div>
                    </div>
                </div>
            </div>

            <img id="proimg" src="${info.profPicURL}" class="card-img-top rounded-circle" alt="..." style="height: 380px;">
            <div class="card-body">            
              <h5 class="card-title">Name - ${info.name}</h5>
              <ul class="list-group">
                    <li class="list-group-item">Email - ${info.email}</li>
                    <li class="list-group-item">Experience - ${info.experience}</li>
                    <li class="list-group-item">Phone - ${info.phone}</li>
                    <li class="list-group-item">Speciality - ${info.speciality}</li>
             </ul>
             <a href="${info.portfolioURL}" class="btn btn-primary">Portfolio</a>
            </div>
          </div>`



                //   let txt = document.getElementById("addTxt")
                //   let speak = document.getElementById("speak");
                //   let sr = window.webkitSpeechRecognition || window.SpeechRecognition;
                //   let spRec = new sr();
                //   spRec.continuous = true;
                // spRec.interimResults = true;
                // speak.addEventListener("click", e => {
                //     e.preventDefault();
                //     spRec.start();
                //     spRec.lang = "eng";});

                //     spRec.onresult = res => {
                //         let text = Array.from(res.results)
                //             .map(r => r[0])
                //             .map(txt => txt.transcript)
                //             .join("");
                //         prescription.value = text;
                //     }
                //     speak[2].addEventListener("click", () => {
                //         spRec.stop();
                //         prescription.value="";
                //     })

                //     function cpyToClipboard(){
                //         navigator.clipboard.writeText(txt.value);
                //     }

                $(window).on('shown.bs.modal', function () {



                    let s = "rec" + i;
                    // $('#hid_ActiveDialogID').val($(this).attr(s));
                    $(s).modal('show');
                    // alert('shown');
                    getRecRealTime(u[i], i);
                    getDocRealTime(i)
                });


            }
        })
    }



    // const buttons = document.getElementsByTagName("button");

    // const buttonPressed = e => {
    //     console.log(e.target.id);// Get ID of Clicked Element
    // }

    // for (let button of buttons) {
    //   button.addEventListener("click", buttonPressed);
    // }



    function updateRecords(e) {
        e.preventDefault();
        console.log(e.target.id);
        const f = document.getElementById(e.target.id);
        const userRecRef = firebase.firestore().collection("users").doc(u[e.target.id]).collection("records")
        console.log(userRecRef)
        let currentDate = new Date()

        userRecRef.add({
            date: currentDate.toString(),
            height: f["height"].value,
            weight: f["weight"].value,
            temperature: f["temperature"].value,
            pulse: f["pulse"].value,
            heartRate: f["heartRate"].value,
            bigNails: f["bigNails"].value,
            ENTRemarks: f["ENTRemarks"].value,
            earRemarks: f["earRemarks"].value,
            dentalRemarks: f["dentalRemarks"].value,
            eyeRemarks: f["eyeRemarks"].value,
            otherRemarks: f["otherRemarks"].value,
            docNotes: f["docNotes"].value
        })
    }

    function hideAllUserDetails() {
        ud.style.display = "none";
        ypd.style.display = "none";
    }

    async function getRecRealTime(userID, i) {
        let divId = "rec" + i;
        const divEle = document.getElementById(divId);
        console.log(divEle)
        divEle.innerHTML = ""
        if (userID) {
            const userRecRef = await firebase.firestore().collection('users').doc(userID).collection("records")
            var unUser = userRecRef.onSnapshot(querySnap => {
                divEle.innerHTML = ""
                querySnap.docs.forEach(doc => {
                    const info = doc.data()
                    console.log(info);
                    divEle.innerHTML += `
                <ul class="list-group">
                    <h3><li class="list-group-item">date - ${info.date}</li></h3>
                    <li class="list-group-item">height - ${info.height}</li>
                    <li class="list-group-item">weight - ${info.weight}</li>
                    <li class="list-group-item">temperature - ${info.temperature}</li>
                    <li class="list-group-item">pulse - ${info.pulse}</li>
                    <li class="list-group-item">heartRate - ${info.heartRate}</li>
                    <li class="list-group-item">bigNails - ${info.bigNails}</li>
                    <li class="list-group-item">ENTRemarks - ${info.ENTRemarks}</li>
                    <li class="list-group-item">earRemarks - ${info.earRemarks}</li>
                    <li class="list-group-item">dentalRemarks - ${info.dentalRemarks}</li>
                    <li class="list-group-item">eyeRemarks - ${info.eyeRemarks}</li>
                    <li class="list-group-item">otherRemarks - ${info.otherRemarks}</li>
                    <li class="list-group-item">docRemarks - ${info.docNotes}</li>                    
                </ul>
                `
                })
            })
        }
        else {
            divEle.innerHTML = `<h3>No Records Yet</h3>`
        }
    }

    function uploadDoc(e, UIDi) {
        let fileName = e.srcElement.files[0].name;
        console.log(e.target.files[0]);
        // const uid = firebase.auth().currentUser.uid
        const fileRef = firebase.storage().ref().child(`/users/${u[UIDi]}/${fileName}`)
        const uploadTask = fileRef.put(e.target.files[0]);
        uploadTask.on('state_changed',
            (snapshot) => {
                // Observe state change events such as progress, pause, and resume
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (progress == 100) {
                    alert('uploaded')
                }
            },
            (error) => {
                console.log(error);
            },
            () => {
                // Handle successful uploads on complete
                // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    console.log('File available at', downloadURL);
                    getDocRealTime(UIDi)
                });
            }
        );
    }

    async function getDocRealTime(i) {
        let divId = "docSet" + i;
        const divEle = document.getElementById(divId);
        console.log("this is " + divEle)
        divEle.innerHTML = ""

        if (u[i]) {
            var fileRef = firebase.storage().ref().child(`/users/${u[i]}`)
            fileRef.listAll()
                .then((res) => {
                    res.items.forEach((itemRef) => {
                        const fRef = firebase.storage().ref().child(itemRef.fullPath)
                        fRef.getDownloadURL().then((url) => {
                            divEle.innerHTML += `
                    <div class="card text-white bg-warning mb-3">
                        <div class="card-body">
                            <a href="${url}" target="_blank">${itemRef.name}</a>
                        </div>
                    </div>
                    `
                        })
                        // All the items under listRef.
                    });
                })
                .catch((error) => {
                    console.log(error)
                    divEle.innerHTML = error
                });
        }
        else {
            divEle.innerHTML = `<h3>No Documents Yet</h3>`
        }
    }

    function navUploadDocs(e) {
        let fileName = e.srcElement.files[0].name;
        console.log(e.target.files[0]);
        // const uid = firebase.auth().currentUser.uid
        const fileRef = firebase.storage().ref().child(`/doctors/${firebase.auth().currentUser.uid}/${fileName}`)
        const uploadTask = fileRef.put(e.target.files[0]);
        uploadTask.on('state_changed',
            (snapshot) => {
                // Observe state change events such as progress, pause, and resume
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (progress == 100) {
                    alert('uploaded')
                }
            },
            (error) => {
                console.log(error);
            },
            () => {
                // Handle successful uploads on complete
                // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    console.log('File available at', downloadURL);
                    getDocRealTimeForOwn()
                });
            }
        );
    }


    async function getDocRealTimeForOwn() {
        yd.style.display = "block";
        ydd.style.display = "block";
        let divId = "yd";
        const divEle = document.getElementById(divId);
        divEle.innerHTML = ""
        console.log(firebase.auth().currentUser.uid)
        if (firebase.auth().currentUser.uid) {
            var fileRef = firebase.storage().ref().child(`/doctors/${firebase.auth().currentUser.uid}`)
            fileRef.listAll()
                .then((r) => {
                    r.items.forEach((itemRef) => {
                        console.log(itemRef)
                        const fRef = firebase.storage().ref().child(itemRef.fullPath)
                        fRef.getDownloadURL().then((url) => {
                            divEle.innerHTML += `
                    <div class="card text-white bg-warning mb-3">
                        <div class="card-body">
                            <a href="${url}" target="_blank">${itemRef.name}</a>
                        </div>
                    </div>
                    `
                        })
                        // All the items under listRef.
                    });
                })
                .catch((error) => {
                    console.log(error)
                    divEle.innerHTML = error
                });
        }
        else {
            yd.style.display = "none";
            ydd.style.display = "none";
            divEle.innerHTML = `<h3>No Documents Yet</h3>`
        }
    }
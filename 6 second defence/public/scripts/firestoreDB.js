const userDetails = document.querySelector('.userDetails');
const editProfile = document.querySelector('#editProfile');
const ypr = document.getElementById("ypr");
const yp = document.getElementById("yp");
const pRec = document.getElementById("pRec");
const yd = document.getElementById("yd")
const ydd = document.getElementById("ydd")
const addTxt=document.getElementById('addTxt')

let speak = document.getElementById("editProfile");
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
    // addTxt.value="";
}

function cpyToClipboard(){
    navigator.clipboard.writeText(addTxt.value);
}

function createUserCollection(user) {
    firebase.firestore().collection('users').doc(user.uid).set({
        role: "user",
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        phone: "",
        speciality: "",
        portfolioURL: "",
        experience:"",
        profPicURL:"",
        points:0,
        streak:0
    })
}

async function getUserInfo(userID) {
    if (userID) {
        const userInfoSnap = await firebase.firestore().collection('users').doc(userID).get()
        const userInfo = userInfoSnap.data()
        if (userInfo) {
            userDetails.innerHTML = `
        <div class="card" style="width: 24rem;height: 600px;">
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
        </div>
        `
        }
    }
    else {
        userDetails.innerHTML = `<h3>Please login</h3>`
    }
}

async function getUserInfoRealTime(userID) {
    if (userID) {
        onlyDisplayPoints(userID)
        increaseAndDisplayPoints(userID)
        const userDocRef = await firebase.firestore().collection('users').doc(userID)
        userDocRef.onSnapshot((doc) => {
            if (doc.exists) {
                const userInfo = doc.data()
                if (userInfo) {
                    userDetails.innerHTML = `<div class="card" style="width: 24rem;height: 650px;">
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
                editProfile["docNotes"].value = userInfo.docNotes
                if(firebase.auth().currentUser.photoURL){
                    console.log(document.querySelector('#proimg'))
                    document.querySelector('#proimg').src = firebase.auth().currentUser.photoURL
                }
                }
            }
        })

    }
    else {
        userDetails.innerHTML = `<h3>Please login</h3>`
    }
}

function updateUserProfile(e){
    e.preventDefault();
    const userDocRef = firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid)
    userDocRef.update({
        name:editProfile["name"].value,
        phone:editProfile["phoneNo"].value,
        experience:editProfile["experience"].value,
        portfolioURL:editProfile["portfolio url"].value,
        speciality:editProfile["speciality"].value,
        docNotes:editProfile["docNotes"].value
    })
}

function uploadImage(e){
    console.log(e.target.files[0]);
    const uid=firebase.auth().currentUser.uid
    const fileRef = firebase.storage().ref().child(`/users/${uid}/profile`)
    const uploadTask = fileRef.put(e.target.files[0]);
    uploadTask.on('state_changed', 
  (snapshot) => {
    // Observe state change events such as progress, pause, and resume
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    if(progress==100){
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
        photoURL:downloadURL
      })
      const userDocRef = firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid)
      userDocRef.update({
        profPicURL:downloadURL
      })
    });
  }
);
}

async function allRecords(userID){
    ypr.style.display = "block";
    pRec.style.display = "block";
    pRec.innerHTML=""
    if (userID) {
        const userRecRef = await firebase.firestore().collection('users').doc(userID).collection("records")
        var unUser = userRecRef.onSnapshot(querySnap=>{
            pRec.innerHTML=""
            querySnap.docs.forEach(doc=>{
                const info = doc.data()
                console.log(info);
                pRec.innerHTML += `
                <div class="card" style="width: 24rem;height: 650px;">
                    <div class="card-body">
                        <h5 class="card-title">date - ${info.date}</h3></h5>
                        <p class="card-text">                
                        <ul class="list-group">
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
                            <li class="list-group-item">otherRemarks - ${info.docNotes}</li>
                        </ul>
                        </p>
                    </div>
                </div>
                `
            })
        })
    }
    else {
        pRec.innerHTML = `<h3>No Records Yet</h3>`
    }
}

function hideAllRecords() {
    ypr.style.display = "none";
    pRec.style.display = "none";
}

async function increaseAndDisplayPoints(userID){
    const userRecRef = await firebase.firestore().collection('users').doc(userID)
    userRecRef.get().then((doc) => {
        if (doc.exists) {
            userRecRef.update({points:doc.data().points+1})
            onlyDisplayPoints(userID)
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
}

async function onlyDisplayPoints(userID){
    const userRecRef = await firebase.firestore().collection('users').doc(userID)
    userRecRef.get().then((doc) => {
        if (doc.exists) {
            yp.innerHTML=`Points = ${doc.data().points}`
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
}   

async function increasePoints(userID){
    
}

function navUploadDocs(e){
    let fileName=e.srcElement.files[0].name;
    console.log(e.target.files[0]);
    // const uid = firebase.auth().currentUser.uid
    const fileRef = firebase.storage().ref().child(`/users/${firebase.auth().currentUser.uid}/${fileName}`)
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
    let divId="yd";
    const divEle=document.getElementById(divId);
    divEle.innerHTML=""
    console.log(firebase.auth().currentUser.uid)
    if (firebase.auth().currentUser.uid) {
        var fileRef = firebase.storage().ref().child(`/users/${firebase.auth().currentUser.uid}`)
        fileRef.listAll()
        .then((r) => {
            r.items.forEach((itemRef) => {
                console.log(itemRef)
                const fRef = firebase.storage().ref().child(itemRef.fullPath)
                fRef.getDownloadURL().then((url)=>{
                    divEle.innerHTML+=`
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
            divEle.innerHTML=error
          });
    }
    else {
        yd.style.display = "none";
        ydd.style.display = "none";
        divEle.innerHTML = `<h3>No Documents Yet</h3>`
    }
}
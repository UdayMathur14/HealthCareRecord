async function signUp(e) {
  e.preventDefault();
  const email = document.querySelector('#signupEmail');
  const password = document.querySelector('#signupPassword');
  // console.log(email.value,password.value);
  try {
    const result = await firebase.auth().createUserWithEmailAndPassword(email.value, password.value);
    await result.user.updateProfile({
      displayName: "Doctor"
    })
    createUserCollection(result.user)
    await result.user.sendEmailVerification()
    console.log(result);
    window.location = "./dochome.html"
    alert(`welcome ${result.user.email}`);
  }
  catch (err) {
    console.log(err);
    alert(err.message);
  }
  email.value = "";
  password.value = "";
}

async function login(e) {
  e.preventDefault();
  const email = document.querySelector('#loginEmail');
  const password = document.querySelector('#loginPassword');
  // console.log(email.value,password.value);
  try {
    const result = await firebase.auth().signInWithEmailAndPassword(email.value, password.value);
    console.log(result);
    window.location = "./dochome.html"
    alert(`welcome ${result.user.email}`);
  } catch (err) {
    console.log(err);
    alert(err.message);
  }
  email.value = "";
  password.value = "";
}

function logOut() {
  firebase.auth().signOut()
  window.location = "./login.html"
  document.querySelector('#proimg').src="./assets/student.png";
}

const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log(user);
    // getUserInfo(user.uid)
    getUserInfoRealTime(user.uid)
    allUserDetails()
    getDocRealTimeForOwn()
    // window.location = "./dochome.html"
  } else {
    console.log("signed out user");
    alert("Sign out success")
    // getUserInfo(null)
    getUserInfoRealTime(null)
    hideAllUserDetails()
    // window.location = "./login.html"
    // unsubscribeUser()
  }
});

async function loginWithGoogle() {
  try {
    var provider = new firebase.auth.GoogleAuthProvider();
    const result = await firebase.auth().signInWithPopup(provider)
    console.log(result);

    createUserCollection(result.user)
    await result.user.sendEmailVerification()

    window.location = "./dochome.html"
  }
  catch (err) {
    console.log(err);
  }
}
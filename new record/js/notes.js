//console.log("This is start of application")
showNote();
let addNoteBtn = document.getElementById("addNoteBtn")
addNoteBtn.addEventListener('click', e => {
    let txt = document.getElementById("addTxt")
    let notes = localStorage.getItem("notes");
    if (notes == null) {
        newArrObj = [];
    }
    else {
        newArrObj = JSON.parse(notes);
    }
    newArrObj.push(txt.value);
    localStorage.setItem("notes", JSON.stringify(newArrObj));
    addTxt.value = "";
    showNote();
})

function showNote() {
    let notes = localStorage.getItem("notes");
    if (notes == null) {
        newArrObj = [];
    }
    else {
        newArrObj = JSON.parse(notes);
    }
    let html = "";
    newArrObj.forEach((value, index) => {
        html += `
        <div class="noteInsertedCard card my-2 mx-2" style="width: 18rem;">
        <div class="card-body">
            <h5 class="card-title">Note-${index + 1}</h5>
            <p class="card-text">${value}</p>
            <button id="${index}"  onclick="deleteNote(this.id)"class="delNote btn btn-primary my-2">Delete Note</button>
        </div>
    </div>
        `

    });

    let ins = document.getElementById("notes");
    if (newArrObj.length != 0) {
        ins.innerHTML = html;
    }
    else {
        ins.innerHTML = "Prescriptions come here as cards"
    }
}

function deleteNote(index) {
    let notes = localStorage.getItem("notes");
    if (notes == null) {
        newArrObj = [];
    }
    else {
        newArrObj = JSON.parse(notes);
    }

    newArrObj.splice(index, 1);
    localStorage.setItem("notes", JSON.stringify(newArrObj));
    showNote();
}

let searched=document.getElementById("searchedTxt");
searchedTxt.addEventListener("input",(element)=>{
    let search=searchedTxt.value.toLowerCase();
    let noteInsertedCards=document.getElementsByClassName("noteInsertedCard");
    Array.from(noteInsertedCards).forEach((element)=>{
        let noteInsertedCardTxt=element.getElementsByTagName("p")[0].innerHTML;
        if(noteInsertedCardTxt.includes(search)){
            element.style.display="block";
        }
        else{
            element.style.display="none";
        }
    })
});

let speak = document.getElementById("speech");
let sr = window.webkitSpeechRecognition || window.SpeechRecognition;
let spRec = new sr();
spRec.continuous = true;
spRec.interimResults = true;
speak.addEventListener("submit", e => {
    e.preventDefault();
    spRec.start();
    spRec.lang = "eng";
}
);

spRec.onresult = res => {
    let text = Array.from(res.results)
        .map(r => r[0])
        .map(txt => txt.transcript)
        .join("");
    speak[0].value = text;
}
speak[2].addEventListener("click", () => {
    spRec.stop();
    speak[0].value="";
})

function cpyToClipboard(){
    navigator.clipboard.writeText(addTxt.value);
}

let i=1;
function playMusic(){
        let song=document.getElementById("aud");
        song.src=`song-${i}.mp3`;
        i++;
        if(i==9){
            i=1;
        }
        song.play();
        
}

function pauseMusic(){
    let song=document.getElementById("aud");
    song.pause();
}

let c=`click.mp3`;
let click=new Audio(c);
document.onclick=function(){
    click.play();
    click.playbackRate=2;
}
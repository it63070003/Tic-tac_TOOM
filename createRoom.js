import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-analytics.js";
import { getDatabase, ref, onValue, update, get, set, push } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyC0KXbQP2TRfHS544PCO0Lyuykyy8smk3s",
    authDomain: "tictactoom-420xd.firebaseapp.com",
    databaseURL: "https://tictactoom-420xd-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "tictactoom-420xd",
    storageBucket: "tictactoom-420xd.appspot.com",
    messagingSenderId: "713753276707",
    appId: "1:713753276707:web:7b21e628d8380a680ddc96",
    measurementId: "G-QTPBT2T1H2"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);
const auth = getAuth();
const gameRef = ref(database, "Game");
const publicGameRef = ref(database, "Game/publicGame");

var roomType = '';
var currentUserID = '';
var roomKey = '';
var playerNum = '';

//const userId = ;
onAuthStateChanged(auth, user => {
    let userId = auth.currentUser.uid;
    currentUserID = userId;
    onValue(ref(database, 'Users/' + userId + '/name'), (snapshot) => {
        var data = snapshot.val();
    });
});
//Done firebase


findingRoom();

function createPrivateRoom() {

}

function findingRoom() {
    console.log("Finding");
    let foundRoom = false;
    let roomToJoin = '';
    get(publicGameRef).then((snapshot) => {
        //snapshot = publicgameRef
        snapshot.forEach((room) => {//Room = ห้อง
            //console.log(room.val()["player2"]);
            if (room.val()["player1"]['UID'] == currentUserID) {
                destroyRoom(room.key);
            }
            else if (room.val()["player2"]['UID'] == '') {
                //join
                console.log("Found ROOM!")
                foundRoom = true;
                roomToJoin = room;
            }
        });
        roomKey = roomToJoin.key;
        foundRoom ? joinPublicRoom(roomToJoin) : createPublicRoom();
        console.log("snapshot: " + snapshot.val());
    }
    );
    //createPublicRoom();
    //if not found > create
}
//Game(publicGameNo: 12, privateGameNo: 123, public(game1,game2,...), private(game1,game2,...))

function createPublicRoom() {
    let gameInfo = {};

    let shape = Math.floor((Math.random() * 2) + 1);//random 1 or 2
    shape == 1 ? shape = 'X' : shape = 'O';
    gameInfo = {
        "player1": { "UID": currentUserID, "shape": shape},//CurentUser
        "player2": { "UID": '', "shape": ''},
        "move": ['', ''],
        "action": ['', {"item": '', "pos": ['', ''] }],
        "spy":["", ""],
        "revolver":{"Opart":0, "Xpart":0, "win":""}
    };
    roomKey = push(publicGameRef, gameInfo).key;
    roomType = "public";
    playerNum = 1;
}

function joinPublicRoom(room) {
    console.log("Join: " + roomKey);
    playerNum = 2;
    let shape = '';
    room.val()['player1']['shape'] == 'X' ? shape = 'O' : shape = 'X';
    roomType = "public";
    update(ref(database, `Game/publicGame/${roomKey}`), { "player2": { "UID": currentUserID, "shape": shape } });
}

var roomRef = ref(database, `Game/publicGame/`);
onValue(roomRef, (snapshot) => {
    try {
        let player1 = snapshot.val()[roomKey]["player1"]['UID'];
        let player2 = snapshot.val()[roomKey]["player2"]['UID'];
        if (player1 != '' && player2 != '') {
            let currentGame = { "roomID": roomKey, "playerNum": playerNum, "roomType":roomType };
            update(ref(database, `Users/${currentUserID}/currentGame`), currentGame)
            //startgame
            console.log("start Game");
            //get(ref(database, `Users`)).then((snapshot)=>console.log(snapshot.val()[player2]));
            window.location = "/game.html";
        }
    }
    catch (err) {
    }
});

function destroyRoom(key) {
    set(ref(database, `Game/publicGame/${key}`), null);
}
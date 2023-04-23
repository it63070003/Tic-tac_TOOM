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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);
const auth = getAuth();
const gameRef = ref(database, "Game");
//const publicGameRef = ref(database, "Game/publicGame");

var playerID = '';
var enemyID = '';
onAuthStateChanged(auth, user => {
    let userId = auth.currentUser.uid;
    playerID = userId;
    onValue(ref(database, 'Users/' + userId + '/name'), (snapshot) => {
        var data = snapshot.val();
    });
});

const myUserRef = ref(database, "Users/" + playerID + "/");
var currentGameID = "";
var roomType = '';
var currentGameRef = '';
var loaded = false;


//Game js VAR
var turn = 'O';
var playerShape = 'O';
var enemyShape = 'X';
var win = false;
var winner = '';
const blocks = document.querySelectorAll('.table-block');
var turnObject = document.getElementById('turn');
var game_continue = true;
var usingItem = false;

var playerMove = '';
var playerAction = {};
var enemyMove = '';
var enemyAction = {};

var playerRevolverPart = 0;
var playerRevolverBullet = 6;
var enemyRevolverPart = 0;
var enemyRevolverBullet = 6;
var shootAmount = 0;
var revolverWinner = '';

var trappedBlock = '';
var spyBlock = ''; //["X", "A0"]  เดา update["OR", "A0"] do nothing เดา update["OW", "A0"] 
//เดาถูก 

//เดาผิด
//onvale ดูค่า spy 
/*{
    [x, a0]:
    changeShape x, a0
}
  
 */

var selectedBull = '';
//Test for bull
var deleteBull = false;

var playerName = '';
var enemyName = '';
var playerWinAmount = 0;
var enemyWinAmount = 0;
var playerLoseAmount = 0;
var enemyLoseAmount = 0;
var playerTotalAmount = 0;
var enemyTotalAmount = 0;
var playingAnimation = false;

setupGame();
function setupGame() {
    get(myUserRef).then((snapshot) => {
        //console.log(snapshot.val()[playerID]["currentGame"]);
        playerName = snapshot.val()[playerID]["name"];
        if (snapshot.val()[playerID]["currentGame"] == '') {
            window.location = '/menu.html';
        }
        playerTotalAmount = snapshot.val()[playerID]["total"];
        playerWinAmount = snapshot.val()[playerID]["win"];
        playerLoseAmount = snapshot.val()[playerID]["lose"];
        currentGameID = snapshot.val()[playerID]["currentGame"]["roomID"];
        roomType = snapshot.val()[playerID]["currentGame"]["roomType"];
        //console.log("currentGame: " + currentGameID);
        //console.log("This is roomtype", roomType);
        currentGameRef = ref(database, `Game/${roomType}Game/${currentGameID}/`);
        document.getElementById("playerName").innerText = ""
        getEnemyInfo();
        eventTick();
    });

    function getEnemyInfo() {
        get(currentGameRef).then((snapshot) => {
            //console.log("Snappy: ", snapshot.val());
            if (snapshot.val()["player1"]["UID"] != playerID) {
                enemyID = snapshot.val()["player1"]["UID"];
                enemyShape = snapshot.val()["player1"]["shape"];
                playerShape = snapshot.val()["player2"]["shape"];
            }
            else {
                enemyID = snapshot.val()["player2"]["UID"];
                enemyShape = snapshot.val()["player2"]["shape"]
                playerShape = snapshot.val()["player1"]["shape"];
            }

            if (playerShape == "O") {
                document.getElementById("turn").innerText = `Your Turn`;
            }
            else {
                document.getElementById("turn").innerText = `Waiting For Enemy...`;
            }
            //console.log("enemyID: " + enemyID);
            //console.log("enemyShape: " + enemyShape);
            getEnemyName();
        });
    }

    function getEnemyName() {
        get(ref(database, `Users/${enemyID}`)).then((snapshot) => {
            enemyName = snapshot.val()["name"];
            enemyTotalAmount = snapshot.val()["total"];
            enemyWinAmount = snapshot.val()["win"];
            enemyLoseAmount = snapshot.val()["lose"];
            displayName();
            setUpProfilePicture();
            setUpLoseTheGame();
            loaded = true;
        });
    }

    function displayName() {
        document.getElementById("playerName").innerText = playerName;
        document.getElementById("enemyName").innerText = enemyName
    }

    function setUpProfilePicture() {
        document.querySelector(".player-icon>img").src = `https://api.dicebear.com/6.x/big-smile/svg?seed=${playerName}&scale=90&accessories=clownNose,mustache,sunglasses&accessoriesProbability=70`;
        document.querySelector(".enemy-icon>img").src = `https://api.dicebear.com/6.x/big-smile/svg?seed=${enemyName}&flip=true&scale=90&accessories=clownNose,mustache,sunglasses&accessoriesProbability=70`;
    }

}

// GAMEGAMEGAMEGAMEGAMEGAMEGAMEGAMEGAMEGAMEGAMEGAMEGAMEGAMEGAMEGAMEGAMEGAMEGAMEGAMEGAMEGAMEGAMEGAMEGAMEGAMEGAMEGAME
for (let block of blocks) {
    let blockId = block.id;
    block.addEventListener('click', function (event) {
        // modify the condition here to continue the game play as long as there is no winner
        if (!game_continue) {
            block.onclick = null;
            return false;
        }
        if (turn != playerShape || playingAnimation) {
            return false;
        }
        let shapeValue = event.currentTarget.getAttribute('data-shape');
        let action = event.currentTarget.getAttribute('data-action'); // "E", "knife-shoot", "trap-place", "spy-select", "spy-guess" ,"bull-select", "bull-move, revolver"
        //จะกดแต่มี trap แกไม่รอดแน่
        if (shapeValue == 'E' && event.currentTarget.id == trappedBlock && !usingItem) {
            const alert_Text = document.getElementById('alert-text');
            alert_Text.innerHTML = "TRAPPED!";
            alert_Text.style.display = 'block';
            alert_Text.style.animationName = 'zoom-in';
            setTimeout(() => {
                alert_Text.style.display = 'none';
                alert_Text.style.animationName = '';
            }, 3500);

            trappedBlock = '';
            //randomItem() ? usingItem = true : endTurn();
            if (randomItem()) {
                usingItem = true;
            }
            else {
                playerAction = { "item": '', "pos": ['', ''] };
                updateActionToEnemy(playerAction);
                endTurn();
            }
        } else if (shapeValue == playerShape && action == "spy-guess" && !usingItem) {
            if (event.currentTarget.id == spyBlock) {
                //console.log("Spy guess Sucess");
            }
            else {
                //console.log("Spy kill your shape And Disguised");
                changeShape(spyBlock, enemyShape);
                updateSpyToEnemy(spyBlock, enemyShape);
                if (checkResult()) {
                    return true;
                }
            }

            for (let block of blocks) {
                block.setAttribute('data-action', 'E');
                block.style.backgroundColor = 'white';
            }
            spyBlock = '';

        } else if (shapeValue == 'E' && action == 'E' && !usingItem && spyBlock == '' && loaded) {
            // 4. Modify the code here to check whether the clicking block is avialable.
            changeShape(event.currentTarget.id, playerShape);

            playerMove = event.currentTarget.id;
            updateMoveToEnemy(playerMove);

            if (selectedBull != '') {
                changeShape(selectedBull, 'E');
                selectedBull = '';
            }
            if (checkResult()) {
                return true;
            }
            //!!!!!!!!!!!TEST NO ENEMY SHOULD USE ITEM
            //randomItem() ? usingItem = true : endTurn();
            if (randomItem()) {
                usingItem = true;
            }
            else {
                playerAction = { "item": '', "pos": ['', ''] };
                updateActionToEnemy(playerAction);
                endTurn();
            }

        } else if (shapeValue != 'E' && action == "knife") {
            let shootPos = useKnife(this);
            playerAction = { "item": 'knife', "pos": shootPos };
            updateActionToEnemy(playerAction);

            endTurn();
        } else if (shapeValue == 'E' && action == "trap") {
            let trapPos = useTrap(this);
            playerAction = { "item": 'trap', "pos": trapPos };
            updateActionToEnemy(playerAction);

            endTurn();
        } else if (shapeValue == enemyShape && action == "spy-select") {
            let spyPos = useSpy(this);
            playerAction = { "item": 'spy', "pos": spyPos };
            //update(database `asdasdasdsad`, {spy:[`${playerShape}`, ]})
            updateActionToEnemy(playerAction);

            endTurn();
        } else if (shapeValue == enemyShape && action == "bull-select") {
            boardClean();
            this.style.backgroundColor = 'green';
            selectedBull = checkBullMove(this);
        } else if (shapeValue == 'E' && action == "bull-move") {
            let bullPos = useBull(this);
            //console.log("Moving bull");
            playerAction = { "item": 'bull', "pos": bullPos };
            deleteBull = true;//delete bull if enemy place anything
            document.querySelector(`#${event.currentTarget.id}>img`).classList.add('falldown');
            setTimeout(() => {
                document.querySelector(`#${event.currentTarget.id}>img`).classList.remove('falldown');
            }, 800)
            updateActionToEnemy(playerAction);
            if (checkResult()) {
                return true;
            }
            endTurn();
        }
    });
}

function changeShape(pos, shape) {
    document.getElementById(pos).setAttribute('data-shape', shape);

    if (shape == 'E') {
        document.getElementById(pos).innerHTML = ``;
    } else if (shape == 'B') {
        document.getElementById(pos).innerHTML = `<img class="shapeImage" src="images/bull_block_icon.png">`;
        document.getElementById(pos).firstChild.classList.add('fade-in-bot');
        setTimeout(() => {
            document.getElementById(pos).firstChild.classList.remove('fade-in-bot');
        }, 500);
    } else {
        document.getElementById(pos).innerHTML = `<img class="shapeImage" src="images/${shape}_shape.webp">`;
    }

}

function randomItem() {
    //console.log("Randoming item");
    let itemIndex = Math.floor(Math.random() * 5);

    // let itemIndex = Math.floor(Math.random() * 2);
    // let itemArray = [1, 3];
    // itemIndex = itemArray[itemIndex];

    //let itemIndex = 4; //!!!!!!!!!Test item

    let currentItem = document.getElementById('currentItem-image');
    let itemsString = ['knife', 'trap', 'spy', 'bull', 'revolver']
    let itemsImg = ['images/knife_icon.png', 'images/trap_icon.png', 'images/spy_icon.png', 'images/bull_icon.png', 'images/revolver_icon.png']

    currentItem.src = itemsImg[itemIndex];
    currentItem.style.display = 'block';
    currentItem.classList.add('flip');
    setTimeout(() => {
        currentItem.classList.remove('flip');
    }, 1000);
    return useItem(itemsString[itemIndex]);
}
function useItem(item) {
    switch (item) {
        case 'knife':
            return checkKnife();
            break;
        case 'trap':
            // code block
            return checkTrap();
            break;
        case 'spy':
            return checkSpy();
            break;
        case 'bull':
            return checkBullSelect();
            break;
        case 'revolver':
            //console.log("Player Revolver Part:" + playerRevolverPart);
            //วาง 1 k=0 k=1 วาง 2 k=1 k=2 วาง 3 k=2 else k=3
            if (playerRevolverPart == 3) {
                shootAmount++;
            }
            else {
                playerRevolverPart += 1;
                updateActionToRevolver('');
            }
            return false;
            break;
        default:
        // code block
    }
}

function checkKnife() {
    let usable = false;
    for (let block of blocks) {
        if (block.getAttribute('data-shape') == playerShape) {
            // block = B2  Check B1 A2 B3 C2
            let blockPos = block.getAttribute('id')
            let leftBlock = document.getElementById(blockPos[0] + (parseInt(blockPos[1]) - 1).toString());
            let rightBlock = document.getElementById(blockPos[0] + (parseInt(blockPos[1]) + 1).toString());
            let upBlock = document.getElementById(String.fromCharCode(blockPos[0].charCodeAt(0) - 1) + blockPos[1]);
            let downBlock = document.getElementById(String.fromCharCode(blockPos[0].charCodeAt(0) + 1) + blockPos[1]);

            checkBlock(leftBlock);
            checkBlock(rightBlock);
            checkBlock(upBlock);
            checkBlock(downBlock);
        }
    }
    function checkBlock(thatBlock) {
        try {
            if (thatBlock.getAttribute('data-shape') == enemyShape) {
                thatBlock.setAttribute('data-action', 'knife');
                thatBlock.style.backgroundColor = 'red';
                usable = true;
            }
        } catch (err) {
        }
    }
    return usable;
}

function checkTrap() {
    let usable = false;
    for (let block of blocks) {
        if (block.getAttribute('data-shape') == 'E') {
            block.setAttribute('data-action', 'trap');
            block.style.backgroundColor = 'pink';
            usable = true;
        }
    }
    return usable;
}

function checkSpy() {
    let usable = false;
    for (let block of blocks) {
        if (block.getAttribute('data-shape') == enemyShape) {
            block.setAttribute('data-action', 'spy-select');
            block.style.backgroundColor = 'orange';
            usable = true;
        }
    }
    return usable;
}

function checkBullSelect() {
    let usable = false;
    for (let block of blocks) {
        if (block.getAttribute('data-shape') == enemyShape) {
            // block = B2  Check B1 A2 B3 C2
            let blockPos = block.getAttribute('id')
            let upLeftBlock = document.getElementById(String.fromCharCode(blockPos[0].charCodeAt(0) - 1) + (parseInt(blockPos[1]) - 1).toString());
            let upRightBlock = document.getElementById(String.fromCharCode(blockPos[0].charCodeAt(0) - 1) + (parseInt(blockPos[1]) + 1).toString());
            let downLeftBlock = document.getElementById(String.fromCharCode(blockPos[0].charCodeAt(0) + 1) + (parseInt(blockPos[1]) - 1).toString());
            let downRightBlock = document.getElementById(String.fromCharCode(blockPos[0].charCodeAt(0) + 1) + (parseInt(blockPos[1]) + 1).toString());

            checkBlock(upLeftBlock, block);
            checkBlock(upRightBlock, block);
            checkBlock(downLeftBlock, block);
            checkBlock(downRightBlock, block);
        }
    }
    function checkBlock(thatBlock, block) {
        try {
            if (thatBlock.getAttribute('data-shape') == 'E') {
                block.setAttribute('data-action', 'bull-select');
                block.style.backgroundColor = 'green';
                usable = true;
            }
        } catch (err) {
        }
    }
    return usable;
}

function checkBullMove(block) {
    if (block.getAttribute('data-shape') == enemyShape) {
        // block = B2  Check B1 A2 B3 C2
        let blockPos = block.getAttribute('id');
        let upLeftBlock = document.getElementById(String.fromCharCode(blockPos[0].charCodeAt(0) - 1) + (parseInt(blockPos[1]) - 1).toString());
        let upRightBlock = document.getElementById(String.fromCharCode(blockPos[0].charCodeAt(0) - 1) + (parseInt(blockPos[1]) + 1).toString());
        let downLeftBlock = document.getElementById(String.fromCharCode(blockPos[0].charCodeAt(0) + 1) + (parseInt(blockPos[1]) - 1).toString());
        let downRightBlock = document.getElementById(String.fromCharCode(blockPos[0].charCodeAt(0) + 1) + (parseInt(blockPos[1]) + 1).toString());

        checkBlock(upLeftBlock);
        checkBlock(upRightBlock);
        checkBlock(downLeftBlock);
        checkBlock(downRightBlock);
    }
    function checkBlock(thatBlock) {
        try {
            if (thatBlock.getAttribute('data-shape') == 'E') {
                thatBlock.setAttribute('data-action', 'bull-move');
                thatBlock.style.backgroundColor = 'yellow';
            }
        } catch (err) {
        }
    }
    return block.id;
}

function checkRevolver() {
    if (playerRevolverPart >= 3) {
        shootAmount++;
        useRevolver();
    }
}

function useKnife(shape) {
    let shapePos = shape.id;
    document.querySelector(`#${shapePos}>img`).classList.add('grey-out-down');
    playingAnimation = true;
    setTimeout(() => {
        document.querySelector(`#${shapePos}>img`).classList.remove('grey-out-down');
        destroyShape(shapePos);
        playingAnimation = false;
    }, 500);
    return shapePos;
}

function useTrap(shape) {
    let shapePos = shape.id;
    return shapePos;
}

function useSpy(shape) {
    let shapePos = shape.id;
    return shapePos;
}

function useBull(shape) {
    let selectPos = selectedBull;
    let moveToPos = shape.id;

    destroyShape(selectPos);
    changeShape(selectPos, 'B');
    changeShape(moveToPos, enemyShape);

    return [selectPos, moveToPos];
}

function useRevolver() {
    let shotted = '';
    let randomNum = 0;
    for (let i = 0; i < shootAmount; i++) {

        randomNum = getRandomInt(playerRevolverBullet);
        if (randomNum == playerRevolverBullet) {
            revolverWinner = playerShape;
            shotted = playerShape;
        }
        else {
            playerRevolverBullet -= 1;
        }
        console.log('Revolver parts: ', playerRevolverPart, 'bullet left: ', playerRevolverBullet, "chance to win:", (1 / playerRevolverBullet) * 100, '%');
    }
    shootAmount = 0;

    function getRandomInt(max) {
        return Math.floor(Math.random() * max) + 1;
    }

    //Animation
    let revolver = document.querySelector(".playerRevolverPart");
    revolver.classList.add("horizontal-shake")
    setTimeout(() => {
        revolver.classList.remove('horizontal-shake');
    }, 350);
    update(ref(database, `Game/${roomType}Game/${currentGameID}/revolver`), { "shooting": playerShape });

    updateActionToRevolver(shotted);
}

function destroyShape(shapePos) {
    changeShape(shapePos, 'E')

}

function boardClean() {
    for (let block of blocks) {
        block.setAttribute('data-action', 'E');
        block.style.backgroundColor = 'white';
    }
    trappedBlock = '';
}

function checkResult() {
    let winShape = '';
    let winning_condition = false;
    let draw_condition = false;

    if (checkWinCondition()) {
        winning_condition = true;
    } else if (checkDrawCondition()) {
        draw_condition = true;
    } else if (revolverWinner != '') {
        winning_condition = true;
        winShape = revolverWinner;
    }

    function checkWinCondition() {


        for (let alpha of ['A', 'B', 'C', 'D']) {
            let el1 = document.getElementById(alpha + "0").getAttribute('data-shape');
            let el2 = document.getElementById(alpha + "1").getAttribute('data-shape');
            let el3 = document.getElementById(alpha + "2").getAttribute('data-shape');
            let el4 = document.getElementById(alpha + "3").getAttribute('data-shape');

            if ((el1 == el2 && el2 == el3 && el3 == el4) && el1 != 'E') {
                winShape = el1;
                return true;
            }
        }

        for (let numer of ['0', '1', '2', '3']) {
            let el1 = document.getElementById('A' + numer).getAttribute('data-shape');
            let el2 = document.getElementById('B' + numer).getAttribute('data-shape');
            let el3 = document.getElementById('C' + numer).getAttribute('data-shape');
            let el4 = document.getElementById('D' + numer).getAttribute('data-shape');

            if ((el1 == el2 && el2 == el3 && el3 == el4) && el1 != 'E') {
                winShape = el1;
                return true;
            }
        }

        let el1 = document.getElementById('A0').getAttribute('data-shape');
        let el2 = document.getElementById('B1').getAttribute('data-shape');
        let el3 = document.getElementById('C2').getAttribute('data-shape');
        let el4 = document.getElementById('D3').getAttribute('data-shape');
        if ((el1 == el2 && el2 == el3 && el3 == el4) && el1 != 'E') {
            winShape = el1;
            return true;
        }

        el1 = document.getElementById('A3').getAttribute('data-shape');
        el2 = document.getElementById('B2').getAttribute('data-shape');
        el3 = document.getElementById('C1').getAttribute('data-shape');
        el4 = document.getElementById('D0').getAttribute('data-shape');
        if ((el1 == el2 && el2 == el3 && el3 == el4) && el1 != 'E') {
            winShape = el1;
            return true;
        }

        return false;
    }

    function checkDrawCondition() {
        for (let block of blocks) {
            if (block.getAttribute('data-shape') == 'E') {
                return false;
            }
        }
        return true;
    }

    if (winning_condition) {
        //Game end and someone wins the game
        winner = winShape;
        turnObject.innerHTML = "Game win by " + winner;
        console.log("Game win by " + winner);
        game_continue = false;
        setTimeout(destroyRoom, 3000);
        return true;
    } else if (draw_condition) {
        // Game end and no-one wins the game
        turnObject.innerHTML = "Game draw";
        game_continue = false;
        setTimeout(destroyRoom, 3000);
        return true;

    }
}

function endTurn() {
    //console.log("endturn");
    let currentItem = document.getElementById("currentItem-image");
    currentItem.classList.add("bounce-out-down");
    setTimeout(() => {
        currentItem.classList.remove('bounce-out-down');
        currentItem.style.display = 'none';
    }, 1000);


    turn = turn === 'O' ? 'X' : 'O';
    if (turn == playerShape) {
        turnObject.innerHTML = "Your Turn";
    }
    else {
        turnObject.innerHTML = "Waiting For Enemy...";
    }
    usingItem = false;

    //reset data-action, BG
    boardClean();

    checkRevolver();
    checkResult();
    //startTurn();//อีกฝ่าย
    // update(currentGameRef, {"turn":turn});
    // console.log("Turn Ended and Update");
}

function startTurn() {
    console.log("Start Turn");
    turn = turn === 'O' ? 'X' : 'O';
    if (turn == playerShape) {
        turnObject.innerHTML = "Your Turn";
        turnObject.classList.add('your-turn');
        setTimeout(() => {
            turnObject.classList.remove('your-turn');
        }, 1000);
    }
    else {
        turnObject.innerHTML = "Waiting For Enemy...";
    }
    //turnObject.innerHTML = "Turn: " + turn;
    for (let block of blocks) {
        if (spyBlock != '' && block.getAttribute('data-shape') == playerShape) {
            block.setAttribute('data-action', 'spy-guess');
            block.style.backgroundColor = 'purple';
        }
    }
    if (spyBlock != '') {
        let alert_Text = document.getElementById('alert-text');
        alert_Text.innerHTML = "SPY FIND HIM!";
        alert_Text.style.display = 'block';
        alert_Text.style.animationName = 'zoom-in';
        setTimeout(() => {
            alert_Text.style.display = 'none';
            alert_Text.style.animationName = '';
        }, 3500);
    }
    if (checkResult()) {
        return true;
    }
}

function updateMoveToEnemy(playerMove) {
    //console.log("Player Move : " + playerMove + " Sended")
    if (loaded) {
        update(ref(database, `Game/${roomType}Game/${currentGameID}`), { "move": [playerShape, playerMove] });
    }
}

function updateActionToEnemy(playerAction) {
    //console.log("Player Action : " + playerAction + " Sended")
    if (loaded) {
        update(ref(database, `Game/${roomType}Game/${currentGameID}`), { "action": [playerShape, playerAction] });
    }
}

function updateActionToRevolver(shotted) {
    if (loaded) {
        let playerRevolverInfo = { "Opart": 0, "Xpart": 0, "win": "" };
        if (playerShape == 'O') {
            playerRevolverInfo = { "Opart": playerRevolverPart, "Xpart": enemyRevolverPart, "win": shotted };
        }
        else {
            playerRevolverInfo = { "Opart": enemyRevolverPart, "Xpart": playerRevolverPart, "win": shotted };
        }
        update(ref(database, `Game/${roomType}Game/${currentGameID}`), { "revolver": playerRevolverInfo });
    }
}


//ทดสอบอาจเอาออกทีหลัง
function updateEnemyMove() {
    //enemyMove = document.getElementById("enemyMovePos").value;
    if (deleteBull) {
        changeShape(selectedBull, 'E');
        selectedBull = '';
        deleteBull = false;
    }
    changeShape(enemyMove, enemyShape);
    checkResult();
    //console.log(enemyMove)
}

function updateEnemyAction() {
    // let enemyItem = document.getElementById("enemyActionItem").value;
    // let enemyActionPos = document.getElementById("enemyActionPos").value;
    // let enemyActionPos2 = document.getElementById("enemyActionPos2").value;
    //enemyAction = { "item": enemyItem, "pos": enemyActionPos };

    // if (enemyItem == 'bull') {
    //     enemyAction = { "item": enemyItem, "pos": [enemyActionPos, enemyActionPos2] };
    // }

    switch (enemyAction["item"]) {
        case 'knife':
            enemyKnife(enemyAction["pos"]);
            break;
        case 'trap':
            enemyTrap(enemyAction["pos"]);
            break;
        case 'spy':
            enemySpy(enemyAction["pos"]);
            break;
        case 'bull':
            enemyBull(enemyAction["pos"]);
            break;
        case 'revolver':
            enemyRevolver(enemyAction["pos"]);
            break;
        default:
        // code block
    }

    startTurn();

    function enemyKnife(pos) {
        document.querySelector(`#${pos}>img`).classList.add('grey-out-down');
        playingAnimation = true;
        setTimeout(() => {
            document.querySelector(`#${pos}>img`).classList.remove('grey-out-down');
            destroyShape(pos);
            playingAnimation = false;
        }, 500);
    }
    function enemyTrap(pos) {
        trappedBlock = pos;
    }
    function enemySpy(pos) {
        spyBlock = pos;
    }
    function enemyBull(pos) {
        destroyShape(pos[0])
        changeShape(pos[0], 'B');
        selectedBull = pos[0];
        changeShape(pos[1], playerShape);
        document.querySelector(`#${pos[1]}>img`).classList.add('falldown');
        setTimeout(() => {
            document.querySelector(`#${pos[1]}>img`).classList.remove('falldown');
        }, 800)
        //Animation
    }
    // function enemyRevolver(shotted) {
    //     //enemyShoot animation
    //     if (enemyRevolverPart == 3) {
    //         //animation
    //     }
    //     else {
    //         enemyRevolverPart += 1;
    //         //add part animation
    //     }

    //     if (shotted == 'true') {
    //         revolverWinner = enemyShape;
    //     }

    //     checkResult();
    // }

}

function updateSpyToEnemy(pos, shape) {
    if (loaded) {
        update(ref(database, `Game/${roomType}Game/${currentGameID}`), { "spy": [pos, shape] });
    }

}

// animation

//test system bruuu
// document.querySelector("#updateEnemyMove").addEventListener('click', updateEnemyMove);
// document.querySelector("#updateEnemyAction").addEventListener('click', updateEnemyAction);

//Firebase Functionsss

function eventTick() {
    const moveRef = ref(database, `Game/${roomType}Game/${currentGameID}/move`);
    const actionRef = ref(database, `Game/${roomType}Game/${currentGameID}/action`);
    const spyRef = ref(database, `Game/${roomType}Game/${currentGameID}/spy`);
    const revolverRef = ref(database, `Game/${roomType}Game/${currentGameID}/revolver`);
    const revolverAnimRef = ref(database, `Game/${roomType}Game/${currentGameID}/revolver/shooting`);
    onValue(moveRef, (snapshot) => {
        //EnemyStartTomove
        let move = snapshot.val();
        if (move[0] == enemyShape) {
            enemyMove = move[1];
            updateEnemyMove();
        }
        console.log(`player ${move[0]} Move: ` + move[1]);
    })
    onValue(actionRef, (snapshot) => {
        //EnemyTakeAction
        let action = snapshot.val();
        if (action[0] == enemyShape) {
            //console.log("Got action")
            enemyAction = action[1];
            updateEnemyAction();
        }
        console.log(`Action: ${action[1]["item"]} at ${action[1]["pos"][0]} and ${action[1]["pos"][1]}`);
    })
    onValue(spyRef, (snapshot) => {
        //Spy ['A0', 'X']
        let spyAt = snapshot.val();
        if (spyAt[0] != '') {
            changeShape(spyAt[0], spyAt[1]);
            checkResult();
            document.querySelector(`#${spyAt[0]}>img`).classList.add("changing-side");
            setTimeout(() => {
                document.querySelector(`#${spyAt[0]}>img`).classList.remove("changing-side");
            }, 1250);
        }
    })
    onValue(revolverAnimRef, (snapshot) => {
        if (snapshot.val() == enemyShape) {
            let revolver = document.querySelector(".enemyRevolverPart");
            revolver.classList.add("horizontal-shake-enemy")
            setTimeout(() => {
                revolver.classList.remove('horizontal-shake-enemy');
            }, 350);
        }
    })
    onValue(revolverRef, (snapshot) => {
        playerRevolverPart = snapshot.val()[`${playerShape}part`];
        enemyRevolverPart = snapshot.val()[`${enemyShape}part`];
        console.log("PlayerPart: " + snapshot.val()[`${playerShape}part`]);
        if (snapshot.val()[`win`] == playerShape) {
            document.querySelector('.playerRevolverPart').src = "images/revolver5.png";
        }
        else if (snapshot.val()[`${playerShape}part`] == 0) {
            document.querySelector('.playerRevolverPart').src = "images/revolver1.png";
        }
        else if (snapshot.val()[`${playerShape}part`] == 1) {
            document.querySelector('.playerRevolverPart').src = "images/revolver2.png";
        }
        else if (snapshot.val()[`${playerShape}part`] == 2) {
            document.querySelector('.playerRevolverPart').src = "images/revolver3.png";
        }
        else if (snapshot.val()[`${playerShape}part`] == 3) {
            document.querySelector('.playerRevolverPart').src = "images/revolver4.png";

        }

        if (snapshot.val()[`win`] == enemyShape) {
            document.querySelector('.enemyRevolverPart').src = "images/revolver5.png";
        }
        else if (snapshot.val()[`${enemyShape}part`] == 0) {
            document.querySelector('.enemyRevolverPart').src = "images/revolver1.png";
        }
        else if (snapshot.val()[`${enemyShape}part`] == 1) {
            document.querySelector('.enemyRevolverPart').src = "images/revolver2.png";
        }
        else if (snapshot.val()[`${enemyShape}part`] == 2) {
            document.querySelector('.enemyRevolverPart').src = "images/revolver3.png";
        }
        else if (snapshot.val()[`${enemyShape}part`] == 3) {
            document.querySelector('.enemyRevolverPart').src = "images/revolver4.png";
        }
        console.log("EnemyPart: " + snapshot.val()[`${enemyShape}part`]);
        //update revolver UI


        revolverWinner = snapshot.val()["win"];
        checkResult();
    })

}

function setUpLoseTheGame() {
    window.addEventListener('beforeunload', loseTheGame);
}


function loseTheGame() {
    console.log("Unload!");
    updateActionToRevolver(enemyShape);
}

function destroyRoom() {
    window.removeEventListener('beforeunload', loseTheGame);
    if (loaded) {
        console.log("ROOM DESTROY")
        set(ref(database, `Game/${roomType}Game/${currentGameID}`), null);
        update(ref(database, `Users/${playerID}`), { "currentGame": '' });
        update(ref(database, `Users/${enemyID}`), { "currentGame": '' });

        if (winner == playerShape) {
            update(ref(database, `Users/${playerID}`), { "win": playerWinAmount + 1 });
            update(ref(database, `Users/${enemyID}`), { "lose": enemyLoseAmount + 1 });
        } else if (winner == enemyShape) {
            update(ref(database, `Users/${enemyID}`), { "win": enemyWinAmount + 1 });
            update(ref(database, `Users/${playerID}`), { "lose": playerLoseAmount + 1 });
        }
        update(ref(database, `Users/${playerID}`), { "total": playerTotalAmount + 1 })
        update(ref(database, `Users/${enemyID}`), { "total": enemyTotalAmount + 1 })

        window.location = '/menu.html';
    }
}
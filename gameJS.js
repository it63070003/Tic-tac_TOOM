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
var revolverWinner = '';

var trappedBlock = '';
var spyBlock = '';

var selectedBull = '';
//Test for bull
var deleteBull = false;

var playerName = '';
var enemyName = '';

setupGame();
function setupGame() {
    get(myUserRef).then((snapshot) => {
        console.log(snapshot.val()[playerID]["currentGame"]);
        playerName = snapshot.val()[playerID]["name"];
        currentGameID = snapshot.val()[playerID]["currentGame"]["roomID"];
        roomType = snapshot.val()[playerID]["currentGame"]["roomType"];
        console.log("currentGame: " + currentGameID);
        console.log("This is roomtype", roomType);
        currentGameRef = ref(database, `Game/${roomType}Game/${currentGameID}/`);
        document.getElementById("playerName").innerText = ""
        getEnemyInfo();
    });

    function getEnemyInfo() {
        get(currentGameRef).then((snapshot) => {
            console.log("Snappy: ", snapshot.val());
            if (snapshot.val()["player1"]["UID"] != playerID) {
                enemyID = snapshot.val()["player1"]["UID"];
                enemyShape = snapshot.val()["player1"]["shape"];
            }
            else {
                enemyID = snapshot.val()["player2"]["UID"];
                enemyShape = snapshot.val()["player2"]["shape"]
            }
            console.log("enemyID: " + enemyID);
            console.log("enemyShape: " + enemyShape);
            getEnemyName();
        });
    }

    function getEnemyName(){
        get(ref(database, `Users/${enemyID}`)).then((snapshot)=>{
            enemyName = snapshot.val()["name"];
            displayName();
        });
    }

    function displayName() {
        document.getElementById("playerName").innerText = playerName;
        document.getElementById("enemyName").innerText = enemyName
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
        if (turn != playerShape) {
            return false;
        }
        let shapeValue = event.currentTarget.getAttribute('data-shape');
        let action = event.currentTarget.getAttribute('data-action'); // "E", "knife-shoot", "trap-place", "spy-select", "spy-guess" ,"bull-select", "bull-move, revolver"

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
            randomItem() ? usingItem = true : endTurn();
        } else if (shapeValue == playerShape && action == "spy-guess" && !usingItem) {
            if (event.currentTarget.id == spyBlock) {
                console.log("Spy guess Sucess");
            }
            else {
                console.log("Spy kill your shape And Disguised");
                changeShape(spyBlock, enemyShape);
                if (checkResult()) {
                    return true;
                }
            }

            for (let block of blocks) {
                block.setAttribute('data-action', 'E');
                block.style.backgroundColor = 'white';
            }
            spyBlock = '';

        } else if (shapeValue == 'E' && action == 'E' && !usingItem && spyBlock == '') {
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
            randomItem() ? usingItem = true : endTurn();

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
            updateActionToEnemy(playerAction);

            endTurn();
        } else if (shapeValue == enemyShape && action == "bull-select") {
            boardClean();
            this.style.backgroundColor = 'green';
            selectedBull = checkBullMove(this);
        } else if (shapeValue == 'E' && action == "bull-move") {
            let bullPos = useBull(this);
            console.log("Moving bull");
            playerAction = { "item": 'bull', "pos": bullPos };
            deleteBull = true;//delete bull if enemy place anything
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
        document.getElementById(pos).firstChild.classList.add('fade-in-left');
        setTimeout(() => {
            document.getElementById(pos).firstChild.classList.remove('fade-in-left');
        }, 1000);
    } else {
        document.getElementById(pos).innerHTML = `<img class="shapeImage" src="images/${shape}_shape.png">`;
    }

}

function randomItem() {
    let itemIndex = Math.floor(Math.random() * 4);
    //let itemIndex = 3; //!!!!!!!!!Test item

    let currentItem = document.getElementById('currentItem-image');
    let itemsString = ['knife', 'trap', 'spy', 'bull', 'revolver']
    let itemsImg = ['images/knife_icon.png', 'images/trap_icon.png', 'images/spy_icon.png', 'images/bull_icon.png', 'images/gun_part_icon.webp']

    currentItem.src = itemsImg[itemIndex];
    currentItem.style.display = 'block';
    currentItem.classList.add('flip');
    setTimeout(() => {
        currentItem.classList.remove('flip');
    }, 1000);
    return useItem(itemsString[itemIndex])
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
            if (playerRevolverPart == 3) {
                useRevolver();
            }
            else {
                playerRevolverPart += 1;
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
        let blockPos = block.getAttribute('id')
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
        useRevolver();
    }
}

function useKnife(shape) {
    let shapePos = shape.id;
    destroyShape(shapePos);
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
    let randomNum = getRandomInt(playerRevolverBullet);
    let shotted = 'false';
    if (randomNum == playerRevolverBullet) {
        revolverWinner = playerShape;
        shotted = 'true';
    }
    else {
        playerRevolverBullet -= 1;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max) + 1;
    }

    playerAction = { "item": 'revolver', "pos": shotted };
    updateActionToEnemy(playerAction);
    //console.log('Revolver parts: ', playerRevolverPart, 'bullet left: ', playerRevolverBullet, "chance to win:", (1/playerRevolverBullet)*100, '%');
}

function destroyShape(shapePos) {
    changeShape(shapePos, 'E')

}

function boardClean() {
    for (let block of blocks) {
        block.setAttribute('data-action', 'E');
        block.style.backgroundColor = 'white';
    }
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
        return true;
    } else if (draw_condition) {
        // Game end and no-one wins the game
        turnObject.innerHTML = "Game draw";
        game_continue = false;
        return true;
    }
}

function endTurn() {
    let currentItem = document.getElementById("currentItem-image");
    currentItem.classList.add("bounce-out-down");
    setTimeout(() => {
        currentItem.classList.remove('bounce-out-down');
        currentItem.style.display = 'none';
    }, 1000);


    turn = turn === 'O' ? 'X' : 'O';
    turnObject.innerHTML = "Turn: " + turn;
    usingItem = false;

    //reset data-action, BG
    boardClean();

    checkRevolver();
    checkResult();
    //startTurn();//อีกฝ่าย
}

function startTurn() {
    turn = turn === 'O' ? 'X' : 'O';
    turnObject.innerHTML = "Turn: " + turn;
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
}

function updateActionToEnemy(playerAction) {
    //console.log("Player Action : " + playerAction + " Sended")
}


//ทดสอบอาจเอาออกทีหลัง
function updateEnemyMove() {
    enemyMove = document.getElementById("enemyMovePos").value;
    if (deleteBull) {
        changeShape(selectedBull, 'E');
        selectedBull = '';
        deleteBull = false;
    }
    changeShape(enemyMove, enemyShape);
    console.log(enemyMove)
}

function updateEnemyAction() {
    let enemyItem = document.getElementById("enemyActionItem").value;
    let enemyActionPos = document.getElementById("enemyActionPos").value;
    let enemyActionPos2 = document.getElementById("enemyActionPos2").value;
    enemyAction = { "item": enemyItem, "pos": enemyActionPos };

    if (enemyItem == 'bull') {
        enemyAction = { "item": enemyItem, "pos": [enemyActionPos, enemyActionPos2] };
    }

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
        destroyShape(pos);
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
        changeShape(pos[1], playerShape)
    }
    function enemyRevolver(shotted) {
        //enemyShoot animation
        if (enemyRevolverPart == 3) {
            //animation
        }
        else {
            enemyRevolverPart += 1;
            //add part animation
        }

        if (shotted == 'true') {
            revolverWinner = enemyShape;
        }

        checkResult();
    }

}

// animation
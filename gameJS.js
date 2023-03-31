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

for (block of blocks) {
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
        let action = event.currentTarget.getAttribute('data-action'); // "E", "gun-shoot", "trap-place", "spy-select", "spy-guess" ,"bull-select", "bull-move, revolver"

        if (shapeValue == 'E' && event.currentTarget.id == trappedBlock && !usingItem) {
            console.log("TRAPPED!!!!!");
            let trapText = `<h1 class="ml4">
                            Trapped
                            </h1>`
            let trapTextElem = document.createRange().createContextualFragment(trapText);
            //event.currentTarget.appendChild(trapTextElem);
            document.getElementById('table').appendChild(trapTextElem);

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

            for (block of blocks) {
                block.setAttribute('data-action', 'E');
                block.style.backgroundColor = 'white';
            }
            spyBlock = '';

        } else if (shapeValue == 'E' && action == 'E' && !usingItem && spyBlock == '') {
            // 4. Modify the code here to check whether the clicking block is avialable.
            changeShape(event.currentTarget.id, playerShape);

            playerMove = event.currentTarget.id;
            updateMoveToEnemy(playerMove);

            if (checkResult()) {
                return true;
            }
            //!!!!!!!!!!!TEST NO ENEMY SHOULD USE ITEM
            randomItem() ? usingItem = true : endTurn();

        } else if (shapeValue != 'E' && action == "gun") {
            let shootPos = useGun(this);
            playerAction = { "item": 'gun', "pos": shootPos };
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
    } else {
        document.getElementById(pos).innerHTML = `<img class="shapeImage" src="images/${shape}_shape.webp">`;
    }

}

function randomItem() {
    console.log('randomitem!');
    //let itemIndex = Math.floor(Math.random() * 4);
    let itemIndex = 4; //!!!!!!!!!Test item

    let itemsString = ['gun', 'trap', 'spy', 'bull', 'revolver']
    let itemsImg = ['images/gun_icon.webp', 'images/trap_icon.webp', 'images/spy_icon.webp', 'images/bull_icon.webp', 'images/gun_icon.webp']
    document.getElementById('currentItem').setAttribute('src', itemsImg[itemIndex]);
    return useItem(itemsString[itemIndex]);
}
function useItem(item) {
    switch (item) {
        case 'gun':
            return checkGun();
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

function checkGun() {
    let usable = false;
    for (block of blocks) {
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
                thatBlock.setAttribute('data-action', 'gun');
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
    for (block of blocks) {
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
    for (block of blocks) {
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
    for (block of blocks) {
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

function useGun(shape) {
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
    changeShape(moveToPos, enemyShape);

    return [selectPos, moveToPos];
}

function useRevolver() {
    let randomNum = getRandomInt(playerRevolverBullet);
    let shotted = false;
    if (randomNum == playerRevolverBullet) {
        revolverWinner = playerShape;
        shotted = true;
    }
    else {
        playerRevolverBullet -= 1;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max) + 1;
    }

    playerAction = { "item": 'revolver', "pos": shotted };
    updateActionToEnemy(playerAction);
    console.log('parts: ', playerRevolverPart, 'bullet', playerRevolverBullet);
}

function destroyShape(shapePos) {
    changeShape(shapePos, 'E')

}

function boardClean() {
    for (block of blocks) {
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

        for (alpha of ['A', 'B', 'C', 'D']) {
            let el1 = document.getElementById(alpha + "0").getAttribute('data-shape');
            let el2 = document.getElementById(alpha + "1").getAttribute('data-shape');
            let el3 = document.getElementById(alpha + "2").getAttribute('data-shape');
            let el4 = document.getElementById(alpha + "3").getAttribute('data-shape');

            if ((el1 == el2 && el2 == el3 && el3 == el4) && el1 != 'E') {
                winShape = el1;
                return true;
            }
        }

        for (numer of ['0', '1', '2', '3']) {
            let el1 = document.getElementById('A' + numer).getAttribute('data-shape');
            let el2 = document.getElementById('B' + numer).getAttribute('data-shape');
            let el3 = document.getElementById('C' + numer).getAttribute('data-shape');
            let el4 = document.getElementById('D' + numer).getAttribute('data-shape');

            if ((el1 == el2 && el2 == el3 && el3 == el4) && el1 != 'E') {
                winShape = el1;
                return true;
            }
        }

        el1 = document.getElementById('A0').getAttribute('data-shape');
        el2 = document.getElementById('B1').getAttribute('data-shape');
        el3 = document.getElementById('C2').getAttribute('data-shape');
        el4 = document.getElementById('D3').getAttribute('data-shape');
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
        for (block of blocks) {
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

    for (block of blocks) {
        if (spyBlock != '' && block.getAttribute('data-shape') == playerShape) {
            block.setAttribute('data-action', 'spy-guess');
            block.style.backgroundColor = 'purple';
        }
    }
    if (checkResult()) {
        return true;
    }
}

function updateMoveToEnemy(playerMove) {
    console.log("Player Move : " + playerMove + " Sended")
}

function updateActionToEnemy(playerAction) {
    console.log("Player Action : " + playerAction + " Sended")
}


//ทดสอบอาจเอาออกทีหลัง
function updateEnemyMove() {
    enemyMove = document.getElementById("enemyMovePos").value;
    changeShape(enemyMove, enemyShape);

    console.log(enemyMove)
}

function updateEnemyAction() {
    let enemyItem = document.getElementById("enemyActionItem").value;
    let enemyActionPos = document.getElementById("enemyActionPos").value;
    enemyAction = { "item": enemyItem, "pos": enemyActionPos };

    if (enemyItem == 'bull') {
        enemyAction = { "item": enemyItem, "pos": ['A0', 'B1'] }
    }

    switch (enemyAction["item"]) {
        case 'gun':
            enemyGun(enemyAction["pos"]);
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

    function enemyGun(pos) {
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
        revolverWinner = enemyShape;
        checkResult();
    }

}

// animation

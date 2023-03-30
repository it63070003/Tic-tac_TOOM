var turn = 'O';
var playerShape = 'O';
var enemyShape = 'X';
var win = false;
var winner = '';
var blocks = document.querySelectorAll('.table-block');
var turnObject = document.getElementById('turn');
var game_continue = true;
var usingItem = false;

var playerMove = '';
var playerAction = {};
var enemyMove = '';
var enemyAction = {};

var trappedBlock = '';

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
        let action = event.currentTarget.getAttribute('data-action'); // "E", "gun-shoot", "trap-place", "spy-select", "spy-guess" ,"bull-select", "bull-move"
        
        if(shapeValue == 'E' && event.currentTarget.id == trappedBlock && !usingItem){
            console.log("TRAPPED!!!!!");
            let trapText = `<h1 class="ml4">
                            Trapped
                            </h1>`
            let trapTextElem = document.createRange().createContextualFragment(trapText);
            //event.currentTarget.appendChild(trapTextElem);
            document.getElementById('table').appendChild(trapTextElem);

            
            randomItem() ? usingItem = true : endTurn();
        }else if (shapeValue == 'E' && action == 'E' && !usingItem) {
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
    let itemIndex = 1; //!!!!!!!!!Test item

    let itemsString = ['gun', 'trap', 'spy', 'bull']
    let itemsImg = ['images/gun_icon.webp', 'images/trap_icon.webp', 'images/spy_icon.webp', 'images/bull_icon.webp']
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

function useGun(shape) {
    let shapePos = shape.id;
    destroyShape(shapePos);
    return shapePos;
}

function useTrap(shape) {
    let shapePos = shape.id;
    return shapePos;
}

function destroyShape(shapePos) {
    changeShape(shapePos, 'E')

}

function checkResult() {
    console.log('Check!');
    let winning_condition = false;
    let draw_condition = false;

    if (checkWinCondition()) {
        winning_condition = true;
    } else if (checkDrawCondition()) {
        draw_condition = true;
    }

    function checkWinCondition() {

        for (alpha of ['A', 'B', 'C', 'D']) {
            let el1 = document.getElementById(alpha + "0").getAttribute('data-shape');
            let el2 = document.getElementById(alpha + "1").getAttribute('data-shape');
            let el3 = document.getElementById(alpha + "2").getAttribute('data-shape');
            let el4 = document.getElementById(alpha + "3").getAttribute('data-shape');

            if ((el1 == el2 && el2 == el3 && el3 == el4) && el1 != 'E') {

                return true;
            }
        }

        for (numer of ['0', '1', '2', '3']) {
            let el1 = document.getElementById('A' + numer).getAttribute('data-shape');
            let el2 = document.getElementById('B' + numer).getAttribute('data-shape');
            let el3 = document.getElementById('C' + numer).getAttribute('data-shape');
            let el4 = document.getElementById('D' + numer).getAttribute('data-shape');

            if ((el1 == el2 && el2 == el3 && el3 == el4) && el1 != 'E') {

                return true;
            }
        }

        el1 = document.getElementById('A0').getAttribute('data-shape');
        el2 = document.getElementById('B1').getAttribute('data-shape');
        el3 = document.getElementById('C2').getAttribute('data-shape');
        el4 = document.getElementById('D3').getAttribute('data-shape');
        if ((el1 == el2 && el2 == el3 && el3 == el4) && el1 != 'E') {
            return true;
        }

        el1 = document.getElementById('A3').getAttribute('data-shape');
        el2 = document.getElementById('B2').getAttribute('data-shape');
        el3 = document.getElementById('C1').getAttribute('data-shape');
        el4 = document.getElementById('D0').getAttribute('data-shape');
        if ((el1 == el2 && el2 == el3 && el3 == el4) && el1 != 'E') {
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
        winner = turn;
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
    for (block of blocks) {
        block.setAttribute('data-action', 'E');
        block.style.backgroundColor = 'white';
    }
    //startTurn();//อีกฝ่าย
}

function startTurn() {
    turn = turn === 'O' ? 'X' : 'O';

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

    switch (enemyAction["item"]) {
        case 'gun':
            enemyGun(enemyAction["pos"]);
            break;
        case 'trap':
            enemyTrap(enemyAction["pos"]);
            break;
        default:
        // code block
    }

    startTurn();

    function enemyGun(pos) {
        destroyShape(pos);
    }
    function enemyTrap(pos){
        trappedBlock = pos;
    }
}

// animation

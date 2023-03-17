var turn = 'O';
var playerShape = 'O';
var enemyShape = 'X';
var win = false;
var winner = '';
var blocks = document.querySelectorAll('.table-block');
var turnObject = document.getElementById('turn');
var game_continue = true;

for (var block of blocks) {
    let blockId = block.id;
    block.onclick = function (event) {
        // modify the condition here to continue the game play as long as there is no winner
        let shapeValue = event.target.getAttribute('shape');
        if (game_continue && shapeValue == 'E') {
            // 4. Modify the code here to check whether the clicking block is avialable.
            event.target.setAttribute('shape', turn);
            changeImage(blockId, turn);
            checkResult();
            randomItem();
        }
    }
}

function changeImage(pos, shape) {
    document.getElementById(pos).innerHTML = `<img class="shapeImage" src="images/${shape}_shape.webp">`;
}

function randomItem() {
    console.log('randomitem!');
    let itemIndex = Math.floor(Math.random() * 4);
    let itemsString = ['gun', 'trap', 'spy', 'bull']
    let itemsImg = ['images/gun_icon.webp', 'images/trap_icon.webp', 'images/spy_icon.webp', 'images/bull_icon.webp']
    document.getElementById('currentItem').setAttribute('src', itemsImg[itemIndex]);
    useItem(itemsString[itemIndex]);
}
function useItem(item) {
    switch (item) {
        case 'gun':
            useGun();
            break;
        case 'y':
            // code block
            break;
        default:
        // code block
    }
}

function useGun() {
    for (block of blocks) {
        if (block.getAttribute('shape') == playerShape) {
            // block = B2  Check B1 A2 B3 C2
            let blockPos = block.getAttribute('id')
            //ซ้าย
            let leftBlock = document.getElementById(blockPos[0] + (parseInt(blockPos[1]) - 1).toString());
            if (leftBlock.getAttribute('shape') == enemyShape) {
                // leftBlock.innerHTML = '';
                // leftBlock.setAttribute('shape', '');
                leftBlock.style.backgroundColor = 'red';
            }            
        }
    }
}


function checkResult() {
    let winning_condition = false;
    let draw_condition = false;

    if (checkWinCondition()) {
        winning_condition = true;
    } else if (checkDrawCondition()) {
        draw_condition = true;
    }

    function checkWinCondition() {

        for (alpha of ['A', 'B', 'C', 'D']) {
            let el1 = document.getElementById(alpha + "0").getAttribute('shape');
            let el2 = document.getElementById(alpha + "1").getAttribute('shape');
            let el3 = document.getElementById(alpha + "2").getAttribute('shape');
            let el4 = document.getElementById(alpha + "3").getAttribute('shape');

            if ((el1 == el2 && el2 == el3 && el3 == el4) && el1 != 'E') {

                return true;
            }
        }

        for (numer of ['0', '1', '2', '3']) {
            let el1 = document.getElementById('A' + numer).getAttribute('shape');
            let el2 = document.getElementById('B' + numer).getAttribute('shape');
            let el3 = document.getElementById('C' + numer).getAttribute('shape');
            let el4 = document.getElementById('D' + numer).getAttribute('shape');

            if ((el1 == el2 && el2 == el3 && el3 == el4) && el1 != 'E') {

                return true;
            }
        }

        el1 = document.getElementById('A0').getAttribute('shape');
        el2 = document.getElementById('B1').getAttribute('shape');
        el3 = document.getElementById('C2').getAttribute('shape');
        el4 = document.getElementById('D3').getAttribute('shape');
        if ((el1 == el2 && el2 == el3 && el3 == el4) && el1 != 'E') {
            return true;
        }

        el1 = document.getElementById('A3').getAttribute('shape');
        el2 = document.getElementById('B2').getAttribute('shape');
        el3 = document.getElementById('C1').getAttribute('shape');
        el4 = document.getElementById('D0').getAttribute('shape');
        if ((el1 == el2 && el2 == el3 && el3 == el4) && el1 != 'E') {
            return true;
        }

        return false;
    }

    function checkDrawCondition() {
        for (block of blocks) {
            if (block.getAttribute('shape') == 'E') {
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
    } else if (draw_condition) {
        // Game end and no-one wins the game
        turnObject.innerHTML = "Game draw";
        game_continue = false;
    }
}

function endTurn() {
    turn = turn === 'O' ? 'X' : 'O';
    turnObject.innerHTML = "Turn: " + turn;
}
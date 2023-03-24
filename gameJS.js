var turn = 'O';
var playerShape = 'O';
var enemyShape = 'X';
var win = false;
var winner = '';
var blocks = document.querySelectorAll('.table-block');
var turnObject = document.getElementById('turn');
var game_continue = true;
var usingItem = false;

for (block of blocks) {
    let blockId = block.id;
    block.addEventListener('click',function(event) {
        // modify the condition here to continue the game play as long as there is no winner
        if (!game_continue) {
            block.onclick = null;
            return false;
        }

        let shapeValue = event.currentTarget.getAttribute('data-shape');
        let action = event.currentTarget.getAttribute('data-action'); // "E", "gun-shoot", "trap-place", "spy-select", "spy-guess" ,"bull-select", "bull-move"
        if (shapeValue == 'E' && action == 'E' && !usingItem) {
            // 4. Modify the code here to check whether the clicking block is avialable.
            event.currentTarget.setAttribute('data-shape', turn);
            changeImage(blockId, turn);
            if(checkResult()){
                return true;
            }
            //!!!!!!!!!!!TEST NO ENEMY SHOULD USE ITEM
            randomItem() ? usingItem = true : endTurn();

        } else if (shapeValue != 'E' && action == "gun") {
            useGun(this);
            endTurn();
        }
    });
}

function changeImage(pos, shape) {
    if (shape == 'E') {
        document.getElementById(pos).innerHTML = ``;
    } else {
        document.getElementById(pos).innerHTML = `<img class="shapeImage" src="images/${shape}_shape.webp">`;
    }

}

function randomItem() {
    console.log('randomitem!');
    //let itemIndex = Math.floor(Math.random() * 4);
    let itemIndex = 0; //!!!!!!!!!Test item

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
        case 'y':
            // code block
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
            //ซ้าย
            try {
                let leftBlock = document.getElementById(blockPos[0] + (parseInt(blockPos[1]) - 1).toString());
                if (leftBlock.getAttribute('data-shape') == enemyShape) {
                    // leftBlock.innerHTML = '';
                    // leftBlock.setAttribute('shape', '');
                    leftBlock.setAttribute('data-action', 'gun');
                    leftBlock.style.backgroundColor = 'red';
                    usable = true;
                    //Gun วาง > Random เรียก Check > check(ยิงได้?)ยิงได้:setdata-action=gun+เปลี่ยนสีBG(checkGun) > กด+ใช้function useGun ทำลาย X/O > resetdata-Action+resetBG ทุกอัน
                    //Trap วาง > Random เรียก Check > check(วางได้?)+setdata-action=trap+เปลี่ยนสี(checkTrap) > กด+ใช้Item(useTrap)+data-isTrapped > resetAction+resetBG
                    //Spy วาง > Random เรียก Check > check(Enemyshape?)+setdata-action=spy-select+เปลี่ยนสี(checkGun)คล้ายปืนแต่ทุกตัวใน map > กด+ใช้Item(useSpy)+data-isSpy > resetAction+resetBG >
                    //ฝั่งศัตรู checkStartTurn(spy?) > check(PlayerShape?)+setdata-action=spy-guess+เปลี่ยนสีBG(checkSpyGuess) > กด+Check(correct?) resetAction+resetBG Wrong > Chage To Enemy Shape / Correct > Continue
                    //Bull วาง > Random เรียก Check > check(EnemyShape)+setdataAction=bull-select+เปลี่ยนสี(checkBull) > กด+ใช้Item(useBull)+setdata-isBlocked=true> resetAction+resetBG > Check(วางได้?)+setdata-action=bull move+ เปลี่ยนสี BG > กด+ใช้ ทำลายตัวก่อน และวางตรงที่เลือก
                    //ฝั่งศัตรู checkStartTurn(Bull?) > Check(dataaction=blocked?) เปลี่ยนสี BG
                    //Revolver วาง > Random เรียก Check > check(3อัน?) > จบเทิน function Roulett() >game cont = false game win by X/O
                }
            }
            catch (err) {
            }

        }
    }
    return usable;
}

function useGun(shape) {
    destroyShape(shape);
}

function destroyShape(shape) {
    let shapePos = shape.id;
    shape.setAttribute('data-shape', 'E')
    changeImage(shape.id, 'E');

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
    startTurn();
}

function startTurn() {
    //reset data-action, BG
    for (block of blocks) {
        block.setAttribute('data-action', 'E');
        block.style.backgroundColor = 'white';
    }
}
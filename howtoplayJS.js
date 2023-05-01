var images = [
    "images/Tutorial/1.jpg",
    "images/Tutorial/2.jpg",
    "images/Tutorial/3.jpg",
    "images/Tutorial/4.jpg",
    "images/Tutorial/5.jpg",
    "images/Tutorial/6.jpg",
    "images/Tutorial/7.jpg"
];

var descriptions = [
    "เกม Tic-tac_TOOM! เป็นเกม Tic Tac Toe 4X4 โดยเกมจะจบเมื่อผู้เล่นฝ่ายใดฝ่ายหนึ่งวาง X/O เรียงติดต่อกัน 4 ตัว หรือเสมอ",
    "ทุกครั้งที่วาง X/O item จะถูกสุ่ม และผู้เล่นสามารถใช้ item เหล่านั้นได้",
    "Knife: เป็น Item ไว้ทำลายตัวหมากของคู่แข่งโดยสามารถทำลายตัวที่อยู่ในรัศมีหมากของผู้เล่นในทิศทาง บน, ล่าง, ซ้าย, ขวา",
    "Trap: เป็น Item ที่สามารถวางได้บนพื้นที่ว่าง หากคู่แข่งวางตัวหมากไว้ตรงที่ผู้เล่นได้วาง Trap ไว้ หมากตัวนั้นก็จะถูกทำลาย. Trap นั้นจะหายไปหลังจบตาอีกฝ่าย",
    "Spy: เป็น Item ที่สามารถเลือกหมากของคู่แข่ง หากคู่แข่งเดาหมากตัวที่ผู้เล่นเลือกไว้ผิด หมากตัวที่ผู้เล่นเลือกจะกลายเป็นหมากของผู้เล่น หากคู่แข่งเดาหมากตัวที่ผู้เล่นเลือกถูกจะไม่เกิดอะไรขึ้น",
    "Bull: เป็น Item ที่สามารถเลือกย้ายหมากของคู่แข่งได้โดยสามารถย้ายไปทิศทาง ซ้ายบน, ขวาบน, ซ้ายล่าง, ขวาล่าง ได้ เมื่อทำการย้าย จะมีกระทิงมาอยู่บนกระดานทำให้คู่แข่งวางหมากตรงพื้นที่นั้นไม่ได้จนกว่าจะจบตาของอีกฝ่าย",
    "Revolver Part: เป็น Item ที่จะเก็บสะสมไปเรื่อยๆจนกว่าจะครบ 3 ส่วน เมื่อครบ 3 ส่วนทุกครั้งที่ผู้เล่นจบ Turn ปืนจะทำการยิงและมีโอกาศที่จะชนะทันที โดยโอกาศที่ยิงครั้งแรกจะเริ่มที่ 1/6 เมื่อยิ่งต่อไปเรื่อยๆ โอกาศที่ผู้เล่นจะชนะก็มากขึ้น เช่น 1/5,1/4,1/3,... หากมีชิ้นส่วนครบ 3 ส่วนแล้วสุ่มได้ Item นี้อีกครั้งใน Turn นั้นผู้เล่นจะทำการยิง 2 รอบ "
];

var currentPage = 0;

function updateContent() {
    var imageContainer = document.querySelector(".image-container img");
    var descriptionContainer = document.querySelector(".description p");
    var pageNumberContainer = document.querySelector(".page-number");

    imageContainer.src = images[currentPage];
    descriptionContainer.textContent = descriptions[currentPage];
    pageNumberContainer.textContent = (currentPage + 1) + " of " + images.length;
}

var previousButton = document.querySelector(".previous");
var nextButton = document.querySelector(".next");

previousButton.addEventListener("click", function () {
    currentPage--;
    if (currentPage < 0) {
        currentPage = images.length - 1;
    }
    updateContent();
});

nextButton.addEventListener("click", function () {
    currentPage++;
    if (currentPage >= images.length) {
        currentPage = 0;
    }
    updateContent();
});

updateContent();
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
// canvas에 그림을 그릴때 쓰는 함수 getContext
canvas.width = 800;
canvas.height = 800;
// style.css에서 정의한 캔버스의 크기를 JS에서도 알려주고, 업데이트 시 JS에서만 수정
// canvas의 x,y좌표는 좌측 상단 모서리부분부터 0,0으로 시작한다.
const lineWidth = document.getElementById("line-width");
const fontSize = document.getElementById("text-size");
const color = document.getElementById("color");
const colorOptions = Array.from(document.getElementsByClassName("color-option"));
// HTMLCollection을 Array화 하는 코드 - forEach 함수를 사용하기 위해 Array 형태로 바꿔줌
const modeBtn = document.getElementById("mode-btn");
const destroyBtn = document.getElementById("destroy-btn");
const eraseBtn = document.getElementById("eraser-btn");
const fileInput = document.getElementById("file");
const textInput = document.getElementById("text-box");
const saveBtn = document.getElementById("save");
const undoBtn = document.getElementById("undo-btn");
const redoBtn = document.getElementById("redo-btn");

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;
ctx.lineWidth = lineWidth.value;
ctx.textInput = textInput.value;
ctx.fontSize = fontSize.value;
ctx.lineCap = "round";
let isPainting = false;
let isFilling = false;

let historyArray = [];
let index = -1;

function onMove(event) {
    if (isPainting) {
        ctx.lineTo(event.offsetX, event.offsetY);
        // event의 offsetX와 Y는 웹브라우저 상에서 마우스 커서의 좌표값이다.
        ctx.stroke();
        return;
    }
    // 유저가 움직이는 마우스의 좌표에 따라 isPainting의 상태가 true일 때 선을 그리도록 한다.
    ctx.moveTo(event.offsetX, event.offsetY);
    // isPainting이 false일 때는 브러쉬 tool이 마우스 커서 따라 움직이기만 하고 선은 그리지 않는다.
}
function startPainting(event) {
    isPainting = true;
    ctx.beginPath();
    ctx.moveTo(event.offsetX, event.offsetY);
}
function canclePainting(event) {
    isPainting = false;
    ctx.beginPath();
    // false가 되면 Painting 동작 off
    // 유저가 선을 매번 그릴때 마다 새로운 path에서 그릴 수 있도록 적용시켜주는 코드
    
    if (event.type != "mouseleave") {
        historyArray.push(ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT));
        index += 1;
    }
    // console.log(historyArray);
}
function undo() {
    if (index <= 0) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        // history가 없는 경우 빈 캔버스로 표출
    } else if (index > 0) {
        index -= 1;
        ctx.putImageData(historyArray[index], 0, 0);
        // history가 1개이상 있는 경우 뒤로가기(실행취소) 가능
    }
}
function redo() {
    if (index < historyArray.length - 1) {
        // redo. 즉 앞으로가기(재실행)할 history가 있는 경우
        index += 1;
        ctx.putImageData(historyArray[index], 0, 0);
    }

}
function onDestroyClick() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    //  캔버스 전면을 하얀색으로 칠해줌으로써 전체삭제 기능 수행
    alert("Are you sure you want to delete it?");
    historyArray = [];
    index = -1;
    // Destroy한 경우 historyArray는 비워지도록 함
}
function onLineWidthChange(event) {
    ctx.lineWidth = event.target.value;
    // input range의 value(1~10까지)값을 받아오도록 하는 코드
}
function onColorChange(event) {
    ctx.strokeStyle = event.target.value;
    ctx.fillStyle = event.target.value;
    // input color의 value로 유저가 선택한 color를 받아오도록 하는 코드
}
function onColorClick(event) {
    const colorValue = event.target.dataset.color;
    ctx.strokeStyle = colorValue;
    ctx.fillStyle = colorValue;
    color.value = colorValue;
    // console.dir(event.target.dataset.color);
    // 위 코드에서 "event.target.dataset.color"는, html의 data-color의 value이다.
}
function onModeClick() {
    if(isFilling) {
        isFilling = false
        modeBtn.innerText = "Fill"
        // isFilling이 false일 때 버튼울 누르면, 채우기 모드로 변경
    } else {
        isFilling = true
        modeBtn.innerText = "Draw"
        // isFilling이 true일 때 버튼을 누르면, 그리기 모드로 변경
    }
}
function onCanvasClick() {
    if(isFilling) {
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        // 채우기 모드로 설정 후 캔버스를 클릭하면 캔버스 전체에 색 채우기 적용
    }
}
function onEraserClick() {
    ctx.strokeStyle = "white";
    isFilling = false;
    modeBtn.innerText = "Fill";
    // 캔버스의 원하는 부분을 하얀색으로 그려줌으로써 지우개 기능
}
function onFileChange(event) {
    const file = event.target.files[0];
    // 유저가 업로드한 파일은 브라우저의 메모리에 저장된다. 해당 경로를 가리키는 코드.
    const url = URL.createObjectURL(file); 
    // 업로드한 파일을 가리키는 URL을 얻는 코드
    const image = new Image();
    // html에서 img태그를 사용한 것 과 같다.
    image.src = url;
    // 위의 img 태그에 url을 넣어주어 화면에 표출
    image.onload = function() {
        ctx.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        // onload event를 사용, img가 로드되었을때 함수 실행:
        // Image를 드로우 해주는 drawImage 사용하여 캔버스 전체 크기로 출력
        fileInput.value = null;
        // 유저가 또 다른 이미지를 첨부할 수 있도록 fileInput의 value를 비워둠
    };
}
function onDoubleClick(event) {
    const text = textInput.value;
    if (text !== "") {
        // text input value가 존재할때만 아래 코드들이 동작함
        ctx.save();
        const text = textInput.value;
        // ctx.save함수를 통해 ctx의 현재 상태, 스타일, 색상 등을 저장한다
        ctx.font = `${fontSize.value}px serif`;
        ctx.fillText(text, event.offsetX, event.offsetY);
        // 입력한 text를 캔버스에 더블클릭한 자리에 배치
        ctx.restore();
        // restore함수는 save함수를 통해, 변경 및 저장하여 썼던 상태, 스타일 등을 원래대로 복구시켜놓는다
    }
}

function onSaveClick() {
    const url = canvas.toDataURL();
    // 유저가 그린 이미지를 URL로 인코딩하는 코드
    const a = document.createElement("a");
    // a 태그를 생성하여 링크를 만듬
    a.href = url;
    a.download = "myDrawing.png";
    // download 속성을 이용하여 다운로드 시 저장되는 디폴트 파일명 설정하는 코드
    a.click();
    // 이미지 url을 클릭하는 동작을 수행하여 유저가 다운로드 할 수 있게 해줌
}

canvas.addEventListener("dblclick", onDoubleClick);
// dbclick: 더블클릭 시 발생하는 이벤트
canvas.addEventListener("mousemove", onMove);
// mousemove는 마우스 커서가 움직이는 동안 발생하는 이벤트
canvas.addEventListener("mousedown", startPainting);
// mousedown은 마우스를 누른채로 있는 것만 말한다. 눌렀다 떼는 Click과는 다름
canvas.addEventListener("mouseup", canclePainting);
// mouseup은 마우스를 뗐을 때의 이벤트를 발생하게 하는 코드
canvas.addEventListener("mouseleave", canclePainting);
// mouseleave: 마우스가 canvas 위치를 벗어나면 발생하는 이벤트
canvas.addEventListener("click", onCanvasClick);
// 클릭 시 발생하는 이벤트
lineWidth.addEventListener("change", onLineWidthChange);
// input value가 변경되면 발생하는 이벤트
color.addEventListener("change", onColorChange);
// input color 값을 변경하면 선의 색깔이 조정되도록 함
colorOptions.forEach((color) => color.addEventListener("click", onColorClick));
// 사용자가 팔레트에서 원하는 색상을 클릭하면 브러쉬가 해당 색상으로 바뀌도록 함
modeBtn.addEventListener("click", onModeClick);
destroyBtn.addEventListener("click", onDestroyClick);
eraseBtn.addEventListener("click", onEraserClick);
fileInput.addEventListener("change", onFileChange);
saveBtn.addEventListener("click", onSaveClick);
undoBtn.addEventListener("click", undo);
redoBtn.addEventListener("click", redo);
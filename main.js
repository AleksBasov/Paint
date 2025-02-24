const canvas = document.querySelector("canvas"),
    toolBtns = document.querySelectorAll(".tool"),
    fillColor = document.querySelector("#fill-color"),
    sizeSlider = document.querySelector("#size-slider"),
    colorBtns = document.querySelectorAll(".colors .option"),
    colorPicker = document.querySelector("#color-picker"),
    clearCanvas = document.querySelector(".clear-canvas"),
    saveImg = document.querySelector(".save-img"),
    undoBtn = document.querySelector(".undo-btn"),
    ctx = canvas.getContext("2d", { willReadFrequently: true });

let prevMouseX, prevMouseY, snapshot,
    isDrawing = false,
    selectedTool = "brush",
    brushWidth = 5,
    selectedColor = "#000",
    history = [],
    isTextMode = false,
    textInput = "",
    bezierPoints = [];

// Установка размеров холста
function setCanvasSize() {
    canvas.width = window.innerWidth - 250;
    canvas.height = window.innerHeight;
}

setCanvasSize();
window.addEventListener("resize", setCanvasSize);

// Установка фона холста
const setCanvasBackground = () => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor;
}

window.addEventListener("load", () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setCanvasBackground();
});

// Получение координат курсора
const getCanvasCoordinates = (e) => {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

// Функции для рисования фигур
const drawRect = (e) => {
    const { x, y } = getCanvasCoordinates(e);
    if (!fillColor.checked) {
        return ctx.strokeRect(x, y, prevMouseX - x, prevMouseY - y);
    }
    ctx.fillRect(x, y, prevMouseX - x, prevMouseY - y);
}

const drawCircle = (e) => {
    const { x, y } = getCanvasCoordinates(e);
    ctx.beginPath();
    let radius = Math.sqrt(Math.pow((prevMouseX - x), 2) + Math.pow((prevMouseY - y), 2));
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
    fillColor.checked ? ctx.fill() : ctx.stroke();
}

const drawTriangle = (e) => {
    const { x, y } = getCanvasCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(x, y);
    ctx.lineTo(prevMouseX * 2 - x, y);
    ctx.closePath();
    fillColor.checked ? ctx.fill() : ctx.stroke();
}

const drawLine = (e) => {
    const { x, y } = getCanvasCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(x, y);
    ctx.stroke();
}

const drawDiamond = (e) => {
    const { x, y } = getCanvasCoordinates(e);
    const midX = (prevMouseX + x) / 2;
    const midY = (prevMouseY + y) / 2;
    ctx.beginPath();
    ctx.moveTo(midX, prevMouseY);
    ctx.lineTo(x, midY);
    ctx.lineTo(midX, y);
    ctx.lineTo(prevMouseX, midY);
    ctx.closePath();
    fillColor.checked ? ctx.fill() : ctx.stroke();
}

// Кривая Безье
const drawBezier = (e) => {
    if (bezierPoints.length < 2) return;
    const { x, y } = getCanvasCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(bezierPoints[0].x, bezierPoints[0].y);
    ctx.bezierCurveTo(bezierPoints[1].x, bezierPoints[1].y, x, y, x, y);
    ctx.stroke();
}

canvas.addEventListener("click", (e) => {
    if (selectedTool === "bezier") {
        const { x, y } = getCanvasCoordinates(e);
        bezierPoints.push({ x, y });
        if (bezierPoints.length === 2) {
            drawBezier(e);
            bezierPoints = [];
        }
    }
});

// Обработчики инструментов
toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
        if (selectedTool === "bezier") {
            bezierPoints = [];
        }
    });
});

sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value);

colorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .selected").classList.remove("selected");
        btn.classList.add("selected");
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    });
});

colorPicker.addEventListener("change", () => {
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
});

clearCanvas.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
    history = [];
});

saveImg.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `${Date.now()}.jpg`;
    link.href = canvas.toDataURL();
    link.click();
});

const saveState = () => {
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (history.length > 20) history.shift();
}

const undoLastAction = () => {
    if (history.length > 0) {
        ctx.putImageData(history.pop(), 0, 0);
    }
}

undoBtn.addEventListener("click", undoLastAction);

const startDraw = (e) => {
    isDrawing = true;
    const { x, y } = getCanvasCoordinates(e);
    prevMouseX = x;
    prevMouseY = y;
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    saveState();
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

const drawing = (e) => {
    if (!isDrawing) return;
    const { x, y } = getCanvasCoordinates(e);
    ctx.putImageData(snapshot, 0, 0);

    if (selectedTool === "brush" || selectedTool === "eraser" || selectedTool === "pencil") {
        ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;

        // Настройки для кисти
        if (selectedTool === "brush") {
            ctx.lineWidth = brushWidth;
            ctx.lineCap = "round"; // Сглаженные края
            ctx.lineJoin = "round"; // Сглаженные углы
        }

        // Настройки для карандаша
        if (selectedTool === "pencil") {
            ctx.lineWidth = brushWidth / 2; // Карандаш тоньше кисти
            ctx.lineCap = "square"; // Угловатые края
            ctx.lineJoin = "square"; // Угловатые углы
            ctx.globalAlpha = 0.7; // Полупрозрачность для эффекта карандаша
        }

        ctx.lineTo(x, y);
        ctx.stroke();

        // Сбрасываем прозрачность после рисования
        if (selectedTool === "pencil") {
            ctx.globalAlpha = 1.0;
        }
    } else if (selectedTool === "rectangle") {
        drawRect(e);
    } else if (selectedTool === "circle") {
        drawCircle(e);
    } else if (selectedTool === "triangle") {
        drawTriangle(e);
    } else if (selectedTool === "line") {
        drawLine(e);
    } else if (selectedTool === "diamond") {
        drawDiamond(e);
    } else if (selectedTool === "bezier") {
        drawBezier(e);
    }
}

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", () => isDrawing = false);
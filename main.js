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
};

window.addEventListener("load", () => {
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;
setCanvasBackground();
});

// Получение координат курсора или касания
const getCanvasCoordinates = (e) => {
const rect = canvas.getBoundingClientRect();
let x, y;

if (e.touches) {
  x = e.touches[0].clientX - rect.left;
  y = e.touches[0].clientY - rect.top;
} else {
  x = e.clientX - rect.left;
  y = e.clientY - rect.top;
}

return { x, y };
};

// Функции для рисования фигур
const drawRect = (e) => {
const { x, y } = getCanvasCoordinates(e);
if (!fillColor.checked) {
  return ctx.strokeRect(x, y, prevMouseX - x, prevMouseY - y);
}
ctx.fillRect(x, y, prevMouseX - x, prevMouseY - y);
};

const drawCircle = (e) => {
const { x, y } = getCanvasCoordinates(e);
ctx.beginPath();
let radius = Math.sqrt(Math.pow((prevMouseX - x), 2) + Math.pow((prevMouseY - y), 2));
ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
fillColor.checked ? ctx.fill() : ctx.stroke();
};

const drawTriangle = (e) => {
const { x, y } = getCanvasCoordinates(e);
ctx.beginPath();
ctx.moveTo(prevMouseX, prevMouseY);
ctx.lineTo(x, y);
ctx.lineTo(prevMouseX * 2 - x, y);
ctx.closePath();
fillColor.checked ? ctx.fill() : ctx.stroke();
};

const drawLine = (e) => {
const { x, y } = getCanvasCoordinates(e);
ctx.beginPath();
ctx.moveTo(prevMouseX, prevMouseY);
ctx.lineTo(x, y);
ctx.stroke();
};

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
};

// Кривая Безье
const drawBezier = (e) => {
if (bezierPoints.length < 2) return;
const { x, y } = getCanvasCoordinates(e);

// Очищаем холст и восстанавливаем предыдущее состояние
ctx.putImageData(snapshot, 0, 0);

// Рисуем контрольные точки и линии
drawControlPoints();

// Рисуем кривую Безье
ctx.beginPath();
ctx.moveTo(bezierPoints[0].x, bezierPoints[0].y);
ctx.bezierCurveTo(
  bezierPoints[1].x, bezierPoints[1].y, // Первая контрольная точка
  x, y, // Вторая контрольная точка
  x, y // Конечная точка
);
ctx.strokeStyle = selectedColor;
ctx.lineWidth = brushWidth;
ctx.stroke();
};

const drawControlPoints = () => {
if (bezierPoints.length === 0) return;
ctx.save();
ctx.setLineDash([5, 5]);
ctx.strokeStyle = "#999";
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(bezierPoints[0].x, bezierPoints[0].y);
for (let i = 1; i < bezierPoints.length; i++) {
  ctx.lineTo(bezierPoints[i].x, bezierPoints[i].y);
}
ctx.stroke();
ctx.fillStyle = "grey";
bezierPoints.forEach(point => {
  ctx.beginPath();
  ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
  ctx.fill();
});
ctx.restore();
};

// Обработчики инструментов
toolBtns.forEach(btn => {
btn.addEventListener("click", () => {
  document.querySelector(".options .active").classList.remove("active");
  btn.classList.add("active");
  selectedTool = btn.id;
  if (selectedTool !== "bezier") {
    bezierPoints = []; // Сбрасываем точки при смене инструмента
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
bezierPoints = []; // Сбрасываем точки Безье при очистке холста
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
};

const undoLastAction = () => {
if (history.length > 0) {
  ctx.putImageData(history.pop(), 0, 0);
}
};

undoBtn.addEventListener("click", undoLastAction);

// Функция начала рисования
const startDraw = (e) => {
e.preventDefault(); // Предотвращаем стандартное поведение (например, прокрутку)
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
};

// Функция рисования
const drawing = (e) => {
    e.preventDefault(); // Предотвращаем стандартное поведение
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
        ctx.lineWidth = brushWidth / 3; // Более тонкий карандаш
        ctx.lineCap = "square"; // Угловатые края
        ctx.lineJoin = "miter"; // Острые углы
        ctx.globalAlpha = 0.5; // Более прозрачные линии
       
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
      drawControlPoints();
      drawBezier(e);
    }
  };

// Функция завершения рисования
const stopDraw = () => {
isDrawing = false;
};

// Добавляем обработчики для мыши
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", stopDraw);

// Добавляем обработчики для сенсорных устройств
canvas.addEventListener("touchstart", startDraw);
canvas.addEventListener("touchmove", drawing);
canvas.addEventListener("touchend", stopDraw);

// Обработка кликов для кривой Безье
canvas.addEventListener("click", (e) => {
if (selectedTool === "bezier") {
  const { x, y } = getCanvasCoordinates(e);
  bezierPoints.push({ x, y });

  // Очищаем холст и восстанавливаем предыдущее состояние
  ctx.putImageData(snapshot, 0, 0);

  // Рисуем контрольные точки и линии
  drawControlPoints();

  // Если точек достаточно, рисуем кривую
  if (bezierPoints.length === 2) {
    drawBezier(e);
  }
}
});

// Обработка сенсорных событий для кривой Безье
canvas.addEventListener("touchstart", (e) => {
if (selectedTool === "bezier") {
  const { x, y } = getCanvasCoordinates(e);
  bezierPoints.push({ x, y });

  // Очищаем холст и восстанавливаем предыдущее состояние
  ctx.putImageData(snapshot, 0, 0);

  // Рисуем контрольные точки и линии
  drawControlPoints();

  // Если точек достаточно, рисуем кривую
  if (bezierPoints.length === 2) {
    drawBezier(e);
  }
}
});

// Обновляем значение при изменении ползунка
sizeSlider.addEventListener("input", () => {
brushWidth = sizeSlider.value;
document.querySelector("#brush-size-value").textContent = brushWidth;
});

// Предупреждение о несохраненных изменениях
let hasUnsavedChanges = false;

canvas.addEventListener("mousedown", () => {
hasUnsavedChanges = true;
});

canvas.addEventListener("touchstart", () => {
hasUnsavedChanges = true;
});

window.addEventListener("beforeunload", (event) => {
if (hasUnsavedChanges) {
  event.preventDefault();
  event.returnValue = "";
}
});


saveImg.addEventListener("click", () => {
  const dataURL = canvas.toDataURL("image/png");
  const newTab = window.open();
  newTab.document.write(`
    <img src="${dataURL}" style="max-width:100%; display:block; margin:20px auto;">
  `);
  newTab.document.close();
});
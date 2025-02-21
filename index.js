var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

// Класс рисовалки
var Paint = /** @class */ (function () {
    function Paint(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isDrawing = false;
        this.isDrawingShape = false;
        this.startX = 0;
        this.startY = 0;
        this.shapes = [];
        this.drawnPaths = []; // Массив для хранения рисунков кистью
        this.state = {
            color: 'black',
            brushSize: 5,
            brushHardness: 1,
            eraser: false,
            mode: 'brush' // Режим: brush, rect, circle, line
        };
        this.addEventListeners();
    }
    // Метод для установки текущего цвета, размера и жесткости кисти
    Paint.prototype.setBrushOptions = function () {
        this.ctx.strokeStyle = this.state.eraser ? 'white' : this.state.color;
        this.ctx.fillStyle = this.state.color;
        this.ctx.lineWidth = this.state.brushSize;
        this.ctx.globalAlpha = this.state.brushHardness;
    };
    // Метод для начала рисования
    Paint.prototype.startDrawing = function (e) {
        if (this.state.mode === 'brush' || this.state.eraser) {
            this.isDrawing = true;
            this.ctx.beginPath();
            this.ctx.moveTo(e.offsetX, e.offsetY);
        } else {
            this.isDrawingShape = true;
            this.startX = e.offsetX;
            this.startY = e.offsetY;
        }
    };
    // Метод для рисования
    Paint.prototype.draw = function (e) {
        if (!this.isDrawing && !this.isDrawingShape) return;
        if (this.state.mode === 'brush' || this.state.eraser) {
            this.ctx.lineTo(e.offsetX, e.offsetY);
            this.ctx.stroke();
        } else if (this.isDrawingShape) {
            this.redrawCanvas();
            this.drawShapePreview(e.offsetX, e.offsetY);
        }
    };
    // Метод для рисования предпросмотра фигуры
    Paint.prototype.drawShapePreview = function (endX, endY) {
        this.ctx.beginPath();
        switch (this.state.mode) {
            case 'rect':
                this.ctx.rect(this.startX, this.startY, endX - this.startX, endY - this.startY);
                break;
            case 'circle': {
                const radius = Math.sqrt(Math.pow(endX - this.startX, 2) + Math.pow(endY - this.startY, 2));
                this.ctx.arc(this.startX, this.startY, radius, 0, Math.PI * 2);
                break;
            }
            case 'line':
                this.ctx.moveTo(this.startX, this.startY);
                this.ctx.lineTo(endX, endY);
                break;
        }
        this.ctx.stroke();
    };
    // Метод для окончания рисования
    Paint.prototype.finishDrawing = function (e) {
        if (!this.isDrawing && !this.isDrawingShape) return;
        if (this.state.mode === 'brush' || this.state.eraser) {
            this.isDrawing = false;
            this.saveDrawnPath();
        } else if (this.isDrawingShape) {
            this.saveShape(e.offsetX, e.offsetY);
            this.isDrawingShape = false;
        }
        this.ctx.closePath();
    };
    // Метод для сохранения фигуры
    Paint.prototype.saveShape = function (endX, endY) {
        const shape = {
            type: this.state.mode,
            x: this.startX,
            y: this.startY,
            endX: endX,
            endY: endY,
            color: this.state.color,
            brushSize: this.state.brushSize
        };
        this.shapes.push(shape);
        this.redrawCanvas();
    };
    // Метод для сохранения пути, нарисованного кистью
    Paint.prototype.saveDrawnPath = function () {
        const path = {
            type: 'path',
            points: this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
        };
        this.drawnPaths.push(path);
    };
    // Метод для перерисовки холста
    Paint.prototype.redrawCanvas = function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Рисуем все сохраненные пути
        this.drawnPaths.forEach(path => {
            this.ctx.putImageData(path.points, 0, 0);
        });
        // Рисуем все фигуры
        this.shapes.forEach(shape => this.drawSavedShape(shape));
    };
    // Метод для рисования сохраненной фигуры
    Paint.prototype.drawSavedShape = function (shape) {
        this.ctx.strokeStyle = shape.color;
        this.ctx.lineWidth = shape.brushSize;
        this.ctx.beginPath();
        switch (shape.type) {
            case 'rect':
                this.ctx.rect(shape.x, shape.y, shape.endX - shape.x, shape.endY - shape.y);
                break;
            case 'circle': {
                const radius = Math.sqrt(Math.pow(shape.endX - shape.x, 2) + Math.pow(shape.endY - shape.y, 2));
                this.ctx.arc(shape.x, shape.y, radius, 0, Math.PI * 2);
                break;
            }
            case 'line':
                this.ctx.moveTo(shape.x, shape.y);
                this.ctx.lineTo(shape.endX, shape.endY);
                break;
        }
        this.ctx.stroke();
    };
    // Метод для очистки холста
    Paint.prototype.clearCanvas = function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.shapes = [];
        this.drawnPaths = [];
    };
    // Метод для сохранения рисунка
    Paint.prototype.saveCanvas = function () {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        // Заливаем фон белым цветом
        tempCtx.fillStyle = 'white';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        // Рисуем все сохраненные пути
        this.drawnPaths.forEach(path => {
            tempCtx.putImageData(path.points, 0, 0);
        });
        // Рисуем все фигуры
        this.shapes.forEach(shape => {
            tempCtx.strokeStyle = shape.color;
            tempCtx.lineWidth = shape.brushSize;
            tempCtx.beginPath();
            switch (shape.type) {
                case 'rect':
                    tempCtx.rect(shape.x, shape.y, shape.endX - shape.x, shape.endY - shape.y);
                    break;
                case 'circle': {
                    const radius = Math.sqrt(Math.pow(shape.endX - shape.x, 2) + Math.pow(shape.endY - shape.y, 2));
                    tempCtx.arc(shape.x, shape.y, radius, 0, Math.PI * 2);
                    break;
                }
                case 'line':
                    tempCtx.moveTo(shape.x, shape.y);
                    tempCtx.lineTo(shape.endX, shape.endY);
                    break;
            }
            tempCtx.stroke();
        });
        // Сохраняем временный холст
        const link = document.createElement('a');
        link.download = 'drawing.jpg';
        link.href = tempCanvas.toDataURL();
        link.click();
    };
    // Метод для добавления обработчиков событий
    Paint.prototype.addEventListeners = function () {
        var _this = this;
        this.canvas.addEventListener('mousedown', function (e) { return _this.startDrawing(e); });
        this.canvas.addEventListener('mousemove', function (e) { return _this.draw(e); });
        this.canvas.addEventListener('mouseup', function (e) { return _this.finishDrawing(e); });
        this.canvas.addEventListener('mouseout', function () { return _this.finishDrawing(); });
    };
    // Метод для обновления состояния рисовалки
    Paint.prototype.updateState = function (newState) {
        this.state = __assign(__assign({}, this.state), newState);
        this.setBrushOptions();
    };
    return Paint;
}());

// Создаем экземпляр рисовалки и получаем ссылки на элементы управления
var paintCanvas = document.getElementById('paint-canvas');
var brushColorInput = document.getElementById('brush-color');
var brushSizeInput = document.getElementById('brush-size');
var brushHardnessInput = document.getElementById('brush-hardness');
var eraserCheckbox = document.getElementById('eraser');
var brushToggleCheckbox = document.getElementById('brush-toggle');
var rectToggleCheckbox = document.getElementById('rect-toggle');
var circleToggleCheckbox = document.getElementById('circle-toggle');
var lineToggleCheckbox = document.getElementById('line-toggle');
var clearButton = document.getElementById('clear-button');
var saveButton = document.getElementById('save-button');

// Инициализируем рисовалку
var paint = new Paint(paintCanvas);

// Обработчики событий
brushColorInput.addEventListener('change', function () {
    paint.updateState({ color: brushColorInput.value });
});

brushSizeInput.addEventListener('input', function () {
    paint.updateState({ brushSize: parseInt(brushSizeInput.value) });
});

brushHardnessInput.addEventListener('input', function () {
    paint.updateState({ brushHardness: parseFloat(brushHardnessInput.value) });
});

eraserCheckbox.addEventListener('change', function () {
    paint.updateState({ eraser: eraserCheckbox.checked });
});

brushToggleCheckbox.addEventListener('change', function () {
    paint.updateState({ mode: 'brush' });
    rectToggleCheckbox.checked = false;
    circleToggleCheckbox.checked = false;
    lineToggleCheckbox.checked = false;
});

rectToggleCheckbox.addEventListener('change', function () {
    if (rectToggleCheckbox.checked) {
        paint.updateState({ mode: 'rect' });
        brushToggleCheckbox.checked = false;
        circleToggleCheckbox.checked = false;
        lineToggleCheckbox.checked = false;
    }
});

circleToggleCheckbox.addEventListener('change', function () {
    if (circleToggleCheckbox.checked) {
        paint.updateState({ mode: 'circle' });
        brushToggleCheckbox.checked = false;
        rectToggleCheckbox.checked = false;
        lineToggleCheckbox.checked = false;
    }
});

lineToggleCheckbox.addEventListener('change', function () {
    if (lineToggleCheckbox.checked) {
        paint.updateState({ mode: 'line' });
        brushToggleCheckbox.checked = false;
        rectToggleCheckbox.checked = false;
        circleToggleCheckbox.checked = false;
    }
});

clearButton.addEventListener('click', function () {
    paint.clearCanvas();
});

saveButton.addEventListener('click', function () {
    paint.saveCanvas();
});
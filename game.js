const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let snake = [];
let food = {};
let direction = 'right';
let gameLoop;
let gridSize = 20;
let isGameOver = false;
let isPaused = false;

function initCanvas() {
    const display = document.querySelector('.game-display');
    const size = Math.min(display.offsetWidth, display.offsetHeight);
    canvas.width = size;
    canvas.height = size;
    gridSize = Math.floor(size / 20);
}

function setupControls() {
    const controls = {
        btnUp: 'up',
        btnDown: 'down',
        btnLeft: 'left',
        btnRight: 'right'
    };

    Object.entries(controls).forEach(([id, dir]) => {
        document.getElementById(id).addEventListener('mousedown', () => changeDirection(dir));
    });

    document.getElementById('btnCenter').addEventListener('click', togglePause);
}

function togglePause() {
    isPaused = !isPaused;
    document.getElementById('btnCenter').textContent = isPaused ? '▶' : '⏸';
}

function changeDirection(newDir) {
    const directions = {
        up: { axis: 'y', value: -1 },
        down: { axis: 'y', value: 1 },
        left: { axis: 'x', value: -1 },
        right: { axis: 'x', value: 1 }
    };

    if ((directions[newDir].axis !== directions[direction].axis) || snake.length === 1) {
        direction = newDir;
    }
}

function startGame() {
    snake = [{x: 10, y: 10}];
    direction = 'right';
    score = 0;
    isGameOver = false;
    isPaused = false;
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('score').textContent = score;
    document.getElementById('highScore').textContent = highScore;
    document.getElementById('btnCenter').textContent = '⏸';
    
    generateFood();
    
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, 150);
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)),
        y: Math.floor(Math.random() * (canvas.height / gridSize))
    };
    while (snake.some(seg => seg.x === food.x && seg.y === food.y)) {
        food = {
            x: Math.floor(Math.random() * (canvas.width / gridSize)),
            y: Math.floor(Math.random() * (canvas.height / gridSize))
        };
    }
}

function update() {
    if (isGameOver || isPaused) return;

    const head = {...snake[0]};
    switch(direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }

    if (head.x < 0 || head.x >= canvas.width/gridSize ||
        head.y < 0 || head.y >= canvas.height/gridSize ||
        snake.some(seg => seg.x === head.x && seg.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById('score').textContent = score;
        generateFood();
    } else {
        snake.pop();
    }

    draw();
}

function draw() {
    ctx.fillStyle = '#6b8c5a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = '#3d4d32';
    ctx.lineWidth = 1;
    for(let i = 0; i < canvas.width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    // Draw snake
    snake.forEach((seg, index) => {
        ctx.fillStyle = index === 0 ? '#1a1a1a' : '#3d4d32';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.fillRect(
            seg.x * gridSize + 1,
            seg.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
        ctx.strokeRect(
            seg.x * gridSize + 1,
            seg.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
    });

    // Draw food
    ctx.fillStyle = '#ff4444';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize/2,
        food.y * gridSize + gridSize/2,
        gridSize/2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.stroke();
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameLoop);
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';
}

// Event listeners
window.addEventListener('resize', initCanvas);
document.addEventListener('keydown', (e) => {
    const directions = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right'
    };
    if (directions[e.key]) changeDirection(directions[e.key]);
});

// Initialize game
initCanvas();
setupControls();
startGame();
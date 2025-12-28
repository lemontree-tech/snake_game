// Game configuration
const GRID_SIZE = 20;
const CANVAS_SIZE = 500;
const GRID_COUNT = CANVAS_SIZE / GRID_SIZE;
const INITIAL_SPEED = 150; // milliseconds
const MIN_SPEED = 50; // minimum speed (fastest)
const SPEED_DECREASE = 3; // decrease by 3ms for every 10 points

// Game state
let canvas, ctx;
let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: 0, y: 0 };
let score = 0;
let highScore = 0;
let gameRunning = false;
let gameLoop = null;
let analytics = null; // Firebase Analytics instance

// Analytics helper functions
function logEvent(eventName, eventParams = {}) {
    if (window.firebaseReady && window.firebaseAnalytics && window.firebaseLogEvent) {
        try {
            window.firebaseLogEvent(window.firebaseAnalytics, eventName, eventParams);
        } catch (error) {
            console.warn('Analytics event failed:', eventName, error);
            console.log('Analytics event (fallback):', eventName, eventParams);
        }
    } else {
        // Fallback for development
        console.log('Analytics event (Firebase not ready):', eventName, eventParams);
    }
}

// Initialize game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    
    // Wait for Firebase to be ready, then log page view
    if (window.firebaseReady) {
        analytics = window.firebaseAnalytics;
        logEvent('page_view', {
            page_title: 'Snake Game',
            page_location: window.location.href
        });
    } else {
        // Wait for Firebase to initialize
        window.addEventListener('firebaseReady', () => {
            analytics = window.firebaseAnalytics;
            logEvent('page_view', {
                page_title: 'Snake Game',
                page_location: window.location.href
            });
        }, { once: true });
    }
    
    // Load high score from localStorage
    highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
    document.getElementById('high-score').textContent = highScore;
    
    // Event listeners
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', startGame);
    
    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);
    
    // Touch controls
    document.querySelectorAll('.control-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const dir = btn.getAttribute('data-direction');
            handleDirection(dir);
        });
    });
    
    // Initial setup
    resetGame();
    draw();
}

function resetGame() {
    // Initialize snake in center
    snake = [
        { x: Math.floor(GRID_COUNT / 2), y: Math.floor(GRID_COUNT / 2) },
        { x: Math.floor(GRID_COUNT / 2) - 1, y: Math.floor(GRID_COUNT / 2) },
        { x: Math.floor(GRID_COUNT / 2) - 2, y: Math.floor(GRID_COUNT / 2) }
    ];
    
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    gameRunning = false;
    
    generateFood();
    updateScore();
}

function getGameSpeed() {
    // Calculate speed based on score
    // Every 10 points decreases speed by SPEED_DECREASE ms
    const speedReduction = Math.floor(score / 10) * SPEED_DECREASE;
    const currentSpeed = Math.max(INITIAL_SPEED - speedReduction, MIN_SPEED);
    return currentSpeed;
}

function startGameLoop() {
    if (gameLoop) clearInterval(gameLoop);
    const speed = getGameSpeed();
    gameLoop = setInterval(update, speed);
}

function startGame() {
    resetGame();
    gameRunning = true;
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOver').classList.add('hidden');
    
    // Track game start time for duration calculation
    window.gameStartTime = Date.now();
    
    // Track game start
    logEvent('game_start', {
        high_score: highScore
    });
    
    startGameLoop();
}

function handleKeyPress(e) {
    if (!gameRunning && e.key !== 'Enter' && e.key !== ' ') return;
    
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            e.preventDefault();
            handleDirection('up');
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            e.preventDefault();
            handleDirection('down');
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            e.preventDefault();
            handleDirection('left');
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            e.preventDefault();
            handleDirection('right');
            break;
        case 'Enter':
        case ' ':
            if (!gameRunning) {
                e.preventDefault();
                startGame();
            }
            break;
    }
}

function handleDirection(dir) {
    if (!gameRunning) {
        startGame();
        return;
    }
    
    const directions = {
        'up': { x: 0, y: -1 },
        'down': { x: 0, y: 1 },
        'left': { x: -1, y: 0 },
        'right': { x: 1, y: 0 }
    };
    
    const newDir = directions[dir];
    
    // Prevent reversing into itself
    if (newDir.x === -direction.x && newDir.y === -direction.y) {
        return;
    }
    
    nextDirection = newDir;
}

function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * GRID_COUNT),
            y: Math.floor(Math.random() * GRID_COUNT)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    food = newFood;
}

function update() {
    if (!gameRunning) return;
    
    // Update direction
    direction = nextDirection;
    
    // Calculate new head position
    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };
    
    // Check wall collision
    if (head.x < 0 || head.x >= GRID_COUNT || head.y < 0 || head.y >= GRID_COUNT) {
        gameOver();
        return;
    }
    
    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    // Add new head
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        generateFood();
        // Update game speed when score increases
        startGameLoop();
        
        // Track food eaten and score milestones
        logEvent('food_eaten', {
            score: score,
            snake_length: snake.length
        });
        
        // Track score milestones
        if (score % 50 === 0) {
            logEvent('score_milestone', {
                milestone: score
            });
        }
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }
    
    draw();
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, CANVAS_SIZE);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(CANVAS_SIZE, i * GRID_SIZE);
        ctx.stroke();
    }
    
    // Draw snake
    snake.forEach((segment, index) => {
        const gradient = ctx.createLinearGradient(
            segment.x * GRID_SIZE,
            segment.y * GRID_SIZE,
            (segment.x + 1) * GRID_SIZE,
            (segment.y + 1) * GRID_SIZE
        );
        
        if (index === 0) {
            // Head - brighter color
            gradient.addColorStop(0, '#4ecdc4');
            gradient.addColorStop(1, '#44a08d');
        } else {
            // Body - darker color
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(
            segment.x * GRID_SIZE + 2,
            segment.y * GRID_SIZE + 2,
            GRID_SIZE - 4,
            GRID_SIZE - 4
        );
        
        // Add shine effect to head
        if (index === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(
                segment.x * GRID_SIZE + 4,
                segment.y * GRID_SIZE + 4,
                GRID_SIZE / 3,
                GRID_SIZE / 3
            );
        }
    });
    
    // Draw food
    const foodGradient = ctx.createRadialGradient(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        0,
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2
    );
    foodGradient.addColorStop(0, '#ff6b6b');
    foodGradient.addColorStop(1, '#ee5a6f');
    
    ctx.fillStyle = foodGradient;
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // Add glow effect to food
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff6b6b';
    ctx.fill();
    ctx.shadowBlur = 0;
}

function updateScore() {
    document.getElementById('score').textContent = score;
    
    if (score > highScore) {
        const oldHighScore = highScore;
        highScore = score;
        document.getElementById('high-score').textContent = highScore;
        localStorage.setItem('snakeHighScore', highScore.toString());
        
        // Track new high score
        logEvent('high_score_achieved', {
            new_high_score: highScore,
            previous_high_score: oldHighScore,
            improvement: highScore - oldHighScore
        });
    }
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.remove('hidden');
    
    // Track game over with detailed metrics
    const gameDuration = Date.now() - (window.gameStartTime || Date.now());
    logEvent('game_over', {
        final_score: score,
        high_score: highScore,
        snake_length: snake.length,
        game_duration_ms: gameDuration,
        is_new_high_score: score === highScore && score > 0
    });
}

// Start the game when page loads
window.addEventListener('load', init);


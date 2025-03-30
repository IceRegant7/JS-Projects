class SnakeGame {
    constructor() {
        // DOM Elements
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreDisplay = document.getElementById('score');
        this.finalScoreDisplay = document.getElementById('finalScore');
        this.highScoreDisplay = document.getElementById('highScore');
        this.gameOverScreen = document.getElementById('gameOver');
        this.pauseScreen = document.getElementById('pauseScreen');
        this.startScreen = document.getElementById('startScreen');
        this.restartBtn = document.getElementById('restartBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resumeBtn = document.getElementById('resumeBtn');
        this.startBtn = document.getElementById('startBtn');
        this.soundBtn = document.getElementById('soundBtn');
        this.difficultyBtns = document.querySelectorAll('.difficulty-btn');
        
        // Touch controls
        this.upBtn = document.getElementById('up');
        this.downBtn = document.getElementById('down');
        this.leftBtn = document.getElementById('left');
        this.rightBtn = document.getElementById('right');
        
        // Audio elements
        this.eatSound = document.getElementById('eatSound');
        this.crashSound = document.getElementById('crashSound');
        this.backgroundMusic = document.getElementById('backgroundMusic');
        
        // Game settings
        this.gridSize = 20;
        this.tileCount = 20;
        this.difficulty = 'medium';
        this.baseSpeed = { easy: 6, medium: 8, hard: 10 };
        this.speed = this.baseSpeed[this.difficulty];
        this.lastRenderTime = 0;
        this.isPaused = false;
        this.gameOver = false;
        this.gameStarted = false;
        this.soundEnabled = true;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        
        // Game state
        this.snake = [];
        this.apple = {};
        this.xVelocity = 0;
        this.yVelocity = 0;
        this.score = 0;
        this.animationFrameId = null;
        this.pendingDirection = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        
        this.init();
    }
    
    init() {
        this.createParticles();
        this.setupEventListeners();
        this.resizeCanvas();
        this.updateDifficulty();
        this.showStartScreen();
    }
    
    createParticles() {
        const particlesContainer = document.getElementById('particles');
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.style.width = `${Math.random() * 10 + 5}px`;
            particle.style.height = particle.style.width;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animationDuration = `${Math.random() * 10 + 10}s`;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            particlesContainer.appendChild(particle);
        }
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.restartBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.resumeBtn.addEventListener('click', () => this.togglePause());
        this.startBtn.addEventListener('click', () => this.startGame());
        this.soundBtn.addEventListener('click', () => this.toggleSound());
        
        // Difficulty buttons
        this.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.difficulty = btn.dataset.difficulty;
                this.updateDifficulty();
                if (this.gameStarted) {
                    this.speed = this.baseSpeed[this.difficulty];
                }
            });
        });
        
        // Touch controls
        this.upBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.upBtn.classList.add('active');
            this.changeDirection(0, -1);
        });
        
        this.downBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.downBtn.classList.add('active');
            this.changeDirection(0, 1);
        });
        
        this.leftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.leftBtn.classList.add('active');
            this.changeDirection(-1, 0);
        });
        
        this.rightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.rightBtn.classList.add('active');
            this.changeDirection(1, 0);
        });
        
        // Remove active class when touch ends
        const removeActive = (e) => {
            e.preventDefault();
            this.upBtn.classList.remove('active');
            this.downBtn.classList.remove('active');
            this.leftBtn.classList.remove('active');
            this.rightBtn.classList.remove('active');
        };
        
        this.upBtn.addEventListener('touchend', removeActive);
        this.downBtn.addEventListener('touchend', removeActive);
        this.leftBtn.addEventListener('touchend', removeActive);
        this.rightBtn.addEventListener('touchend', removeActive);
        
        // Mouse events for testing
        this.upBtn.addEventListener('mousedown', () => {
            this.upBtn.classList.add('active');
            this.changeDirection(0, -1);
        });
        
        this.downBtn.addEventListener('mousedown', () => {
            this.downBtn.classList.add('active');
            this.changeDirection(0, 1);
        });
        
        this.leftBtn.addEventListener('mousedown', () => {
            this.leftBtn.classList.add('active');
            this.changeDirection(-1, 0);
        });
        
        this.rightBtn.addEventListener('mousedown', () => {
            this.rightBtn.classList.add('active');
            this.changeDirection(1, 0);
        });
        
        const mouseUp = () => {
            this.upBtn.classList.remove('active');
            this.downBtn.classList.remove('active');
            this.leftBtn.classList.remove('active');
            this.rightBtn.classList.remove('active');
        };
        
        this.upBtn.addEventListener('mouseup', mouseUp);
        this.downBtn.addEventListener('mouseup', mouseUp);
        this.leftBtn.addEventListener('mouseup', mouseUp);
        this.rightBtn.addEventListener('mouseup', mouseUp);
        this.upBtn.addEventListener('mouseleave', mouseUp);
        this.downBtn.addEventListener('mouseleave', mouseUp);
        this.leftBtn.addEventListener('mouseleave', mouseUp);
        this.rightBtn.addEventListener('mouseleave', mouseUp);
        
        // Swipe controls for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
            this.touchStartY = e.changedTouches[0].screenY;
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            if (!this.touchStartX || !this.touchStartY) return;
            
            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;
            
            const diffX = touchEndX - this.touchStartX;
            const diffY = touchEndY - this.touchStartY;
            
            // Determine primary direction
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal swipe
                if (diffX > 0) {
                    this.changeDirection(1, 0); // Right
                } else {
                    this.changeDirection(-1, 0); // Left
                }
            } else {
                // Vertical swipe
                if (diffY > 0) {
                    this.changeDirection(0, 1); // Down
                } else {
                    this.changeDirection(0, -1); // Up
                }
            }
            
            this.touchStartX = 0;
            this.touchStartY = 0;
        }, { passive: false });
    }
    
    showStartScreen() {
        this.startScreen.style.display = 'flex';
        this.gameOverScreen.classList.remove('active');
        this.pauseScreen.classList.remove('active');
    }
    
    resizeCanvas() {
        const gameBoard = document.querySelector('.game-board');
        this.canvas.width = gameBoard.clientWidth;
        this.canvas.height = gameBoard.clientHeight;
    }
    
    updateDifficulty() {
        this.speed = this.baseSpeed[this.difficulty];
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.soundBtn.textContent = this.soundEnabled ? '🔊' : '🔇';
        
        if (this.soundEnabled) {
            this.backgroundMusic.volume = 0.3;
            if (this.gameStarted && !this.isPaused && !this.gameOver) {
                this.backgroundMusic.play().catch(e => console.log('Audio play error:', e));
            }
        } else {
            this.backgroundMusic.pause();
        }
    }
    
    playSound(sound) {
        if (!this.soundEnabled) return;
        
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Audio play error:', e));
    }
    
    startGame() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        this.snake = [{x: 10, y: 10}];
        this.xVelocity = 0;
        this.yVelocity = 0;
        this.pendingDirection = null;
        this.score = 0;
        this.speed = this.baseSpeed[this.difficulty];
        this.gameOver = false;
        this.isPaused = false;
        this.gameStarted = true;
        
        this.scoreDisplay.textContent = this.score;
        this.highScoreDisplay.textContent = this.highScore;
        this.gameOverScreen.classList.remove('active');
        this.pauseScreen.classList.remove('active');
        this.startScreen.style.display = 'none';
        
        this.generateApple();
        this.lastRenderTime = 0;
        
        if (this.soundEnabled) {
            this.backgroundMusic.volume = 0.3;
            this.backgroundMusic.play().catch(e => console.log('Audio play error:', e));
        }
        
        this.animationFrameId = window.requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    gameLoop(currentTime) {
        if (this.gameOver) return;
        if (this.isPaused) {
            this.animationFrameId = window.requestAnimationFrame((time) => this.gameLoop(time));
            return;
        }
        
        const secondsSinceLastRender = (currentTime - this.lastRenderTime) / 1000;
        if (secondsSinceLastRender < 1 / this.speed) {
            this.animationFrameId = window.requestAnimationFrame((time) => this.gameLoop(time));
            return;
        }
        
        this.lastRenderTime = currentTime;
        
        // Apply pending direction change at the start of the frame
        if (this.pendingDirection) {
            this.xVelocity = this.pendingDirection.x;
            this.yVelocity = this.pendingDirection.y;
            this.pendingDirection = null;
        }
        
        this.update();
        this.draw();
        
        this.animationFrameId = window.requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update() {
        this.moveSnake();
        if (this.checkCollision()) {
            this.endGame();
            return;
        }
    }
    
    draw() {
        // Clear canvas with semi-transparent black for trail effect
        this.ctx.fillStyle = 'rgba(18, 18, 18, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawGrid();
        this.drawApple();
        this.drawSnake();
    }
    
    drawGrid() {
        const tileSize = this.canvas.width / this.tileCount;
        this.ctx.strokeStyle = 'rgba(0, 183, 255, 0.05)';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * tileSize, 0);
            this.ctx.lineTo(i * tileSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * tileSize);
            this.ctx.lineTo(this.canvas.width, i * tileSize);
            this.ctx.stroke();
        }
    }
    
    drawSnake() {
        const tileSize = this.canvas.width / this.tileCount;
        
        this.snake.forEach((segment, index) => {
            const posX = segment.x * tileSize;
            const posY = segment.y * tileSize;
            const size = tileSize - 2;
            const isHead = index === 0;
            
            // Create gradient
            const gradient = this.ctx.createRadialGradient(
                posX + size/2, posY + size/2, 0,
                posX + size/2, posY + size/2, size/2
            );
            
            if (isHead) {
                gradient.addColorStop(0, '#00ff9d');
                gradient.addColorStop(1, '#00b7ff');
            } else {
                const intensity = 1 - (index / this.snake.length) * 0.7;
                gradient.addColorStop(0, `rgba(0, 255, 157, ${intensity})`);
                gradient.addColorStop(1, `rgba(0, 183, 255, ${intensity})`);
            }
            
            this.ctx.fillStyle = gradient;
            
            // Draw rounded rectangle (manual implementation)
            const radius = 5;
            this.ctx.beginPath();
            this.ctx.moveTo(posX + radius, posY);
            this.ctx.lineTo(posX + size - radius, posY);
            this.ctx.quadraticCurveTo(posX + size, posY, posX + size, posY + radius);
            this.ctx.lineTo(posX + size, posY + size - radius);
            this.ctx.quadraticCurveTo(posX + size, posY + size, posX + size - radius, posY + size);
            this.ctx.lineTo(posX + radius, posY + size);
            this.ctx.quadraticCurveTo(posX, posY + size, posX, posY + size - radius);
            this.ctx.lineTo(posX, posY + radius);
            this.ctx.quadraticCurveTo(posX, posY, posX + radius, posY);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Add glow effect to head
            if (isHead) {
                this.ctx.shadowColor = '#00ff9d';
                this.ctx.shadowBlur = 15;
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
                
                // Draw eyes
                const eyeSize = size / 8;
                const leftEyeX = posX + size/3;
                const rightEyeX = posX + size - size/3;
                const eyeY = posY + size/3;
                
                // Eye whites
                this.ctx.fillStyle = 'white';
                this.ctx.beginPath();
                this.ctx.arc(leftEyeX, eyeY, eyeSize, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.arc(rightEyeX, eyeY, eyeSize, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Eye pupils (direction based)
                this.ctx.fillStyle = 'black';
                const pupilOffset = eyeSize / 2;
                let leftPupilX = leftEyeX;
                let leftPupilY = eyeY;
                let rightPupilX = rightEyeX;
                let rightPupilY = eyeY;
                
                if (this.xVelocity === 1) { // Right
                    leftPupilX += pupilOffset;
                    rightPupilX += pupilOffset;
                } else if (this.xVelocity === -1) { // Left
                    leftPupilX -= pupilOffset;
                    rightPupilX -= pupilOffset;
                } else if (this.yVelocity === 1) { // Down
                    leftPupilY += pupilOffset;
                    rightPupilY += pupilOffset;
                } else if (this.yVelocity === -1) { // Up
                    leftPupilY -= pupilOffset;
                    rightPupilY -= pupilOffset;
                }
                
                this.ctx.beginPath();
                this.ctx.arc(leftPupilX, leftPupilY, eyeSize/2, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.arc(rightPupilX, rightPupilY, eyeSize/2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }
    
    drawApple() {
        const tileSize = this.canvas.width / this.tileCount;
        const centerX = this.apple.x * tileSize + tileSize / 2;
        const centerY = this.apple.y * tileSize + tileSize / 2;
        const radius = tileSize / 2 - 2;
        
        // Apple body with gradient
        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, radius
        );
        gradient.addColorStop(0, '#ff00aa');
        gradient.addColorStop(1, '#cc0088');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Apple shine
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.beginPath();
        this.ctx.arc(
            centerX - radius/3, 
            centerY - radius/3, 
            radius/4, 
            0, 
            Math.PI * 2
        );
        this.ctx.fill();
        
        // Apple glow
        this.ctx.shadowColor = '#ff00aa';
        this.ctx.shadowBlur = 15;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // Apple leaf
        this.ctx.fillStyle = '#00ff9d';
        this.ctx.beginPath();
        this.ctx.ellipse(
            centerX + radius/2, 
            centerY - radius, 
            radius/3, 
            radius/5, 
            Math.PI/4, 
            0, 
            Math.PI * 2
        );
        this.ctx.fill();
    }
    
    moveSnake() {
        let head = {
            x: this.snake[0].x + this.xVelocity, 
            y: this.snake[0].y + this.yVelocity
        };

        // Wall teleportation logic
        if (head.x < 0) {
            head.x = this.tileCount - 1;
        } else if (head.x >= this.tileCount) {
            head.x = 0;
        }
        
        if (head.y < 0) {
            head.y = this.tileCount - 1;
        } else if (head.y >= this.tileCount) {
            head.y = 0;
        }

        // Prevent moving if no direction is set
        if (this.xVelocity === 0 && this.yVelocity === 0) return;
        
        this.snake.unshift(head);
        
        if (head.x === this.apple.x && head.y === this.apple.y) {
            this.score += 1;
            this.scoreDisplay.textContent = this.score;
            this.generateApple();
            this.playSound(this.eatSound);
            
            // Increase speed with diminishing returns
            if (this.score % 10 === 0) {
                this.speed = Math.min(this.speed + 0.5, 20);
            }
            
            // Eating effect
            this.canvas.style.transform = 'scale(1.02)';
            setTimeout(() => {
                this.canvas.style.transform = 'scale(1)';
            }, 100);
        } else {
            this.snake.pop();
        }
    }
    
    generateApple() {
        let newApple;
        let overlapping;
        let attempts = 0;
        const maxAttempts = 100;
        
        do {
            newApple = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
            
            overlapping = this.snake.some(segment => 
                segment.x === newApple.x && segment.y === newApple.y
            );
            
            attempts++;
            if (attempts >= maxAttempts) {
                // If we can't find a spot after many attempts, just pick any
                break;
            }
        } while (overlapping);
        
        this.apple = newApple;
    }
    
    checkCollision() {
        const head = this.snake[0];
        
        // Only check for self collision (skip head)
        for (let i = 4; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                return true;
            }
        }
        
        return false;
    }
    
    endGame() {
        this.gameOver = true;
        this.finalScoreDisplay.textContent = this.score;
        this.playSound(this.crashSound);
        this.backgroundMusic.pause();
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreDisplay.textContent = this.highScore;
            localStorage.setItem('snakeHighScore', this.highScore);
        }
        
        this.gameOverScreen.classList.add('active');
        this.createExplosion();
    }
    
    createExplosion() {
        const tileSize = this.canvas.width / this.tileCount;
        const head = this.snake[0];
        const particles = 20;
        
        for (let i = 0; i < particles; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.style.width = `${Math.random() * 10 + 5}px`;
            particle.style.height = particle.style.width;
            particle.style.left = `${(head.x * tileSize + tileSize/2) / this.canvas.width * 100}%`;
            particle.style.top = `${(head.y * tileSize + tileSize/2) / this.canvas.height * 100}%`;
            particle.style.background = i % 2 === 0 ? 'var(--primary)' : 'var(--accent)';
            particle.style.animation = `explode ${Math.random() * 0.5 + 0.5}s forwards`;
            
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 100 + 50;
            particle.style.setProperty('--end-x', `${Math.cos(angle) * distance}px`);
            particle.style.setProperty('--end-y', `${Math.sin(angle) * distance}px`);
            
            this.gameOverScreen.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 500);
        }
    }
    
    changeDirection(x, y) {
        // Prevent 180-degree turns
        if (this.xVelocity !== -x || this.yVelocity !== -y) {
            // Queue the direction change for the next frame
            this.pendingDirection = {x, y};
        }
    }
    
    handleKeyDown(e) {
        switch(e.key) {
            case 'ArrowUp':
                this.changeDirection(0, -1);
                break;
            case 'ArrowDown':
                this.changeDirection(0, 1);
                break;
            case 'ArrowLeft':
                this.changeDirection(-1, 0);
                break;
            case 'ArrowRight':
                this.changeDirection(1, 0);
                break;
            case ' ':
                if (this.gameOver) {
                    this.startGame();
                } else if (this.gameStarted) {
                    this.togglePause();
                } else {
                    this.startGame();
                }
                break;
            case 'Escape':
                this.togglePause();
                break;
        }
    }
    
    togglePause() {
        if (this.gameOver || !this.gameStarted) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.pauseScreen.classList.add('active');
            this.pauseBtn.textContent = '▶';
            this.backgroundMusic.pause();
        } else {
            this.pauseScreen.classList.remove('active');
            this.pauseBtn.textContent = '⏸';
            if (this.soundEnabled) {
                this.backgroundMusic.play().catch(e => console.log('Audio play error:', e));
            }
            // Resume the game loop if it was running
            if (!this.animationFrameId && !this.gameOver) {
                this.lastRenderTime = performance.now();
                this.animationFrameId = window.requestAnimationFrame((time) => this.gameLoop(time));
            }
        }
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});
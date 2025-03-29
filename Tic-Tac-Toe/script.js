document.addEventListener('DOMContentLoaded', () => {
    // Game state
    const state = {
        board: ['', '', '', '', '', '', '', '', ''],
        currentPlayer: 'X',
        gameActive: false,
        gameMode: 'human',
        aiDifficulty: 'medium',
        playerSymbol: 'X',
        aiSymbol: 'O',
        scores: { X: 0, O: 0 },
        winningCombinations: [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6]             // diagonals
        ],
        aiThinking: false,
        moveHistory: []
    };

    // DOM elements
    const gameModeSelect = document.getElementById('game-mode');
    const aiSettingsDiv = document.getElementById('ai-settings');
    const aiDifficultySelect = document.getElementById('ai-difficulty');
    const playerSymbolSelect = document.getElementById('player-symbol');
    const startBtn = document.getElementById('start-btn');
    const gameInfoDiv = document.getElementById('game-info');
    const gameBoard = document.getElementById('game-board');
    const gameControls = document.getElementById('game-controls');
    const cells = document.querySelectorAll('.cell');
    const playerXInfo = document.getElementById('player-x');
    const playerOInfo = document.getElementById('player-o');
    const resetBtn = document.getElementById('reset-btn');
    const newGameBtn = document.getElementById('new-game-btn');
    const modal = document.getElementById('result-modal');
    const resultTitle = document.getElementById('result-title');
    const resultText = document.getElementById('result-text');
    const winnerDisplay = document.getElementById('winner-display');
    const modalNewGameBtn = document.getElementById('modal-new-game-btn');

    // Initialize event listeners
    initEventListeners();

    function initEventListeners() {
        // Settings change listeners
        gameModeSelect.addEventListener('change', handleGameModeChange);
        startBtn.addEventListener('click', startGame);
        
        // Game board listeners
        gameBoard.addEventListener('click', handleCellClick);
        resetBtn.addEventListener('click', resetRound);
        newGameBtn.addEventListener('click', newGame);
        modalNewGameBtn.addEventListener('click', newGame);
    }

    function handleGameModeChange() {
        state.gameMode = gameModeSelect.value;
        aiSettingsDiv.style.display = state.gameMode === 'ai' ? 'block' : 'none';
    }

    function startGame() {
        state.gameMode = gameModeSelect.value;
        
        if (state.gameMode === 'ai') {
            state.aiDifficulty = aiDifficultySelect.value;
            state.playerSymbol = playerSymbolSelect.value;
            state.aiSymbol = state.playerSymbol === 'X' ? 'O' : 'X';
        }
        
        // Show game elements
        gameInfoDiv.style.display = 'flex';
        gameBoard.style.display = 'grid';
        gameControls.style.display = 'flex';
        
        // Hide settings
        document.querySelector('.game-settings').style.display = 'none';
        
        // Initialize game
        initGame();
    }

    function initGame() {
        state.board = ['', '', '', '', '', '', '', '', ''];
        state.currentPlayer = 'X';
        state.gameActive = true;
        state.aiThinking = false;
        state.moveHistory = [];
        
        // Clear board UI
        cells.forEach(cell => {
            cell.className = 'cell';
            cell.textContent = '';
        });
        
        // Update active player indicator
        updatePlayerTurn();
        
        // Hide modal if visible
        modal.classList.remove('active');
        
        // If playing against AI and AI goes first
        if (state.gameMode === 'ai' && state.aiSymbol === 'X') {
            makeAiMove();
        }
    }

    function handleCellClick(e) {
        if (!state.gameActive || state.aiThinking) return;
        
        const clickedCell = e.target.closest('.cell');
        if (!clickedCell) return;
        
        const cellIndex = parseInt(clickedCell.getAttribute('data-index'));
        
        // If cell is already occupied, ignore the click
        if (state.board[cellIndex] !== '') return;
        
        // Make player move
        makeMove(cellIndex);
        
        // Check if game is over
        if (!state.gameActive) return;
        
        // If playing against AI, make AI move
        if (state.gameMode === 'ai' && state.currentPlayer === state.aiSymbol) {
            makeAiMove();
        }
    }

    function makeMove(cellIndex) {
        // Record move
        state.moveHistory.push({
            player: state.currentPlayer,
            position: cellIndex,
            board: [...state.board]
        });
        
        // Update game state
        state.board[cellIndex] = state.currentPlayer;
        cells[cellIndex].classList.add(state.currentPlayer.toLowerCase());
        
        // Check for win or draw
        if (checkWin()) {
            endGame(false);
            return;
        }
        
        if (checkDraw()) {
            endGame(true);
            return;
        }
        
        // Switch player
        switchPlayer();
    }

    function makeAiMove() {
        if (!state.gameActive) return;
        
        state.aiThinking = true;
        const activePlayer = state.currentPlayer === 'X' ? playerXInfo : playerOInfo;
        activePlayer.classList.add('ai-thinking');
        
        // Add delay to make it feel more natural
        const thinkingTime = getThinkingTime();
        
        setTimeout(() => {
            let cellIndex;
            
            switch (state.aiDifficulty) {
                case 'easy':
                    cellIndex = getEasyAiMove();
                    break;
                case 'medium':
                    cellIndex = getMediumAiMove();
                    break;
                case 'hard':
                    cellIndex = getHardAiMove();
                    break;
                case 'unbeatable':
                    cellIndex = getUnbeatableAiMove();
                    break;
            }
            
            makeMove(cellIndex);
            state.aiThinking = false;
            activePlayer.classList.remove('ai-thinking');
        }, thinkingTime);
    }

    function getThinkingTime() {
        // Returns a thinking time based on difficulty
        const baseTime = 500;
        const randomTime = Math.random() * 1000;
        
        switch (state.aiDifficulty) {
            case 'easy': return baseTime + randomTime * 0.5;
            case 'medium': return baseTime + randomTime * 0.8;
            case 'hard': return baseTime + randomTime * 1.2;
            case 'unbeatable': return baseTime + randomTime * 1.5;
            default: return baseTime;
        }
    }

    function getEasyAiMove() {
        // Easy AI: Mostly random moves, occasionally blocks
        if (Math.random() < 0.3) { // 30% chance to block
            const opponent = state.currentPlayer === 'X' ? 'O' : 'X';
            const blockingMove = findWinningMove(opponent);
            if (blockingMove !== -1) return blockingMove;
        }
        
        // Otherwise make a random move
        return getRandomMove();
    }

    function getMediumAiMove() {
        // Medium AI: Blocks wins and sometimes makes winning moves
        // Check for immediate win
        const winningMove = findWinningMove(state.currentPlayer);
        if (winningMove !== -1) return winningMove;
        
        // Block opponent's immediate win
        const opponent = state.currentPlayer === 'X' ? 'O' : 'X';
        const blockingMove = findWinningMove(opponent);
        if (blockingMove !== -1) return blockingMove;
        
        // 50% chance to make a strategic move
        if (Math.random() < 0.5) {
            // Try to take center
            if (state.board[4] === '') return 4;
            
            // Try to take a corner
            const corners = [0, 2, 6, 8];
            const emptyCorners = corners.filter(i => state.board[i] === '');
            if (emptyCorners.length > 0) {
                return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
            }
        }
        
        // Otherwise make a random move
        return getRandomMove();
    }

    function getHardAiMove() {
        // Hard AI: Uses minimax with limited depth
        return findBestMove(4); // Look 4 moves ahead
    }

    function getUnbeatableAiMove() {
        // Unbeatable AI: Uses full minimax
        return findBestMove(10); // Full depth
    }

    function findWinningMove(player) {
        // Check if the player can win in the next move
        for (let i = 0; i < state.board.length; i++) {
            if (state.board[i] === '') {
                state.board[i] = player;
                if (checkWin(true)) {
                    state.board[i] = '';
                    return i;
                }
                state.board[i] = '';
            }
        }
        return -1;
    }

    function getRandomMove() {
        const emptyCells = state.board
            .map((cell, index) => cell === '' ? index : null)
            .filter(val => val !== null);
        
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    function findBestMove(maxDepth) {
        let bestScore = -Infinity;
        let bestMove;
        let alpha = -Infinity;
        let beta = Infinity;
        
        for (let i = 0; i < state.board.length; i++) {
            if (state.board[i] === '') {
                state.board[i] = state.currentPlayer;
                const score = minimax(state.board, 0, false, alpha, beta, maxDepth);
                state.board[i] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
                
                alpha = Math.max(alpha, bestScore);
                if (beta <= alpha) break;
            }
        }
        
        return bestMove;
    }

    function minimax(board, depth, isMaximizing, alpha, beta, maxDepth) {
        // Check for terminal states or max depth
        const winner = checkTerminal(board);
        
        if (winner === state.aiSymbol) return 10 - depth;
        if (winner === state.playerSymbol) return depth - 10;
        if (winner === 'draw' || depth >= maxDepth) return 0;
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = state.aiSymbol;
                    const score = minimax(board, depth + 1, false, alpha, beta, maxDepth);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                    alpha = Math.max(alpha, bestScore);
                    if (beta <= alpha) break;
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = state.playerSymbol;
                    const score = minimax(board, depth + 1, true, alpha, beta, maxDepth);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                    beta = Math.min(beta, bestScore);
                    if (beta <= alpha) break;
                }
            }
            return bestScore;
        }
    }

    function checkTerminal(board) {
        // Check for win
        for (const combination of state.winningCombinations) {
            const [a, b, c] = combination;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        
        // Check for draw
        if (board.every(cell => cell !== '')) {
            return 'draw';
        }
        
        return null;
    }

    function checkWin(simulate = false) {
        return state.winningCombinations.some(combination => {
            const [a, b, c] = combination;
            
            if (state.board[a] && state.board[a] === state.board[b] && state.board[a] === state.board[c]) {
                if (state.gameActive && !simulate) {
                    // Highlight winning cells
                    combination.forEach(index => {
                        cells[index].classList.add('winning-cell');
                    });
                }
                return true;
            }
            return false;
        });
    }

    function checkDraw() {
        return state.board.every(cell => cell !== '');
    }

    function switchPlayer() {
        state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
        updatePlayerTurn();
    }

    function updatePlayerTurn() {
        playerXInfo.classList.remove('active', 'ai-thinking');
        playerOInfo.classList.remove('active', 'ai-thinking');
        
        if (state.currentPlayer === 'X') {
            playerXInfo.classList.add('active');
        } else {
            playerOInfo.classList.add('active');
        }
    }

    function endGame(isDraw) {
        state.gameActive = false;
        
        if (!isDraw) {
            // Update scores
            state.scores[state.currentPlayer]++;
            document.querySelector(`.player-${state.currentPlayer.toLowerCase()} .player-score`).textContent = 
                state.scores[state.currentPlayer];
            
            // Show winner in modal
            let winnerName;
            if (state.gameMode === 'ai') {
                winnerName = state.currentPlayer === state.playerSymbol ? 'You win!' : 'AI wins!';
                resultTitle.textContent = state.currentPlayer === state.playerSymbol ? 'VICTORY!' : 'DEFEAT!';
            } else {
                winnerName = `Player ${state.currentPlayer} wins!`;
                resultTitle.textContent = 'GAME OVER!';
            }
            
            resultText.textContent = winnerName;
            winnerDisplay.className = 'winner-display';
            winnerDisplay.classList.add(state.currentPlayer.toLowerCase());
            
            // Create confetti effect for player win
            if (state.gameMode === 'ai' && state.currentPlayer === state.playerSymbol) {
                createConfetti();
            }
        } else {
            // It's a draw
            resultText.textContent = "It's a draw!";
            resultTitle.textContent = 'DRAW!';
            winnerDisplay.className = 'winner-display draw';
            winnerDisplay.textContent = '=';
        }
        
        // Show modal
        modal.classList.add('active');
    }

    function createConfetti() {
        const colors = [
            '#6200ee', '#03dac6', '#ff0266', '#ffde03', 
            '#7c4dff', '#18ffff', '#ff4081', '#ff9100'
        ];
        
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.width = Math.random() * 10 + 5 + 'px';
            confetti.style.height = Math.random() * 10 + 5 + 'px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
            confetti.style.animationDelay = Math.random() * 2 + 's';
            document.body.appendChild(confetti);
            
            // Remove confetti after animation
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
    }

    function resetRound() {
        // Reset the board but keep scores
        state.board = ['', '', '', '', '', '', '', '', ''];
        state.currentPlayer = 'X';
        state.gameActive = true;
        state.aiThinking = false;
        state.moveHistory = [];
        
        // Clear board UI
        cells.forEach(cell => {
            cell.className = 'cell';
            cell.textContent = '';
        });
        
        // Reset active player indicator
        updatePlayerTurn();
        
        // Hide modal if visible
        modal.classList.remove('active');
        
        // If playing against AI and AI goes first
        if (state.gameMode === 'ai' && state.aiSymbol === 'X') {
            makeAiMove();
        }
    }

    function newGame() {
        // Reset everything
        state.board = ['', '', '', '', '', '', '', '', ''];
        state.currentPlayer = 'X';
        state.gameActive = false;
        state.scores = { X: 0, O: 0 };
        state.aiThinking = false;
        state.moveHistory = [];
        
        // Clear board UI
        cells.forEach(cell => {
            cell.className = 'cell';
            cell.textContent = '';
        });
        
        // Reset scores display
        document.querySelectorAll('.player-score').forEach(scoreEl => {
            scoreEl.textContent = '0';
        });
        
        // Reset active player indicator
        updatePlayerTurn();
        
        // Hide modal
        modal.classList.remove('active');
        
        // Show settings
        document.querySelector('.game-settings').style.display = 'block';
        gameInfoDiv.style.display = 'none';
        gameBoard.style.display = 'none';
        gameControls.style.display = 'none';
        
        // Remove any remaining confetti
        document.querySelectorAll('.confetti').forEach(el => el.remove());
    }
});
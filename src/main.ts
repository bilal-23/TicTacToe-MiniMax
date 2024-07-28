import "./style.css";

class TicTacToe {
  boardElement = document.createElement("div");
  app = document.getElementById("app")!;
  board = new Map<string, string | null>();
  currentPlayer: "X" | "O";
  gridSize: number;
  winningCombinations: string[][] = [];
  availableCells: string[] = [];
  winner: string | null = null;
  scores = {
    X: 1,
    O: -1,
    Draw: 0,
  };
  aiPlayer: "X" | "O";
  userPlayer: "X" | "O";

  constructor(gridSize: number, userPlayer: "X" | "O") {
    this.gridSize = gridSize;
    this.aiPlayer = userPlayer === "X" ? "O" : "X";
    this.userPlayer = userPlayer;
    this.currentPlayer = "X"; // Initial player is the one passed in the constructor
    this.scores[this.aiPlayer] = 1;
    this.scores[this.userPlayer] = -1;
    this.init();
  }

  // Initialize the game
  init() {
    this.createBoard();
    this.generateWinningCombinations();
    this.renderBoard();
    this.addEventListenerToBoard();
    if (this.currentPlayer === this.aiPlayer) {
      this.nextTurn(); // AI makes the first move if it is the starting player
    }
  }

  // Generate all possible winning combinations
  generateWinningCombinations() {
    for (let i = 0; i < this.gridSize; i++) {
      const row = Array.from({ length: this.gridSize }, (_, j) => `${i}${j}`);
      const column = Array.from(
        { length: this.gridSize },
        (_, j) => `${j}${i}`
      );
      this.winningCombinations.push(row, column);
    }

    const diagonal1 = Array.from(
      { length: this.gridSize },
      (_, i) => `${i}${i}`
    );
    const diagonal2 = Array.from(
      { length: this.gridSize },
      (_, i) => `${i}${this.gridSize - 1 - i}`
    );
    this.winningCombinations.push(diagonal1, diagonal2);
  }

  getWinner() {
    for (const combination of this.winningCombinations) {
      const values = combination.map((pos) => this.board.get(pos));
      if (values.every((val) => val === "X")) return "X";
      if (values.every((val) => val === "O")) return "O";
    }
    if (Array.from(this.board.values()).every((val) => val !== null))
      return "Draw";
    return null;
  }

  // Check if there is a winner or if the game is a draw
  checkWinner() {
    const winner = this.getWinner();
    if (winner) {
      this.highlightWinner(
        this.winningCombinations.find((combination) =>
          combination.every((pos) => this.board.get(pos) === winner)
        ) || []
      );
      return winner;
    }
    return null;
  }

  // Highlight the winning cells
  highlightWinner(combination: string[]) {
    combination.forEach((pos) => {
      const cell = document.querySelector(`[data-position="${pos}"]`);
      cell?.classList.add("winner-cells");
    });
  }

  minimax(
    board: Map<string, string | null>,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): number {
    const winner = this.getWinner();
    if (winner !== null) return this.scores[winner];
    if (depth === 0) return this.scores["Draw"];

    const availableCells = this.getAvailableCells(board);

    if (isMaximizing) {
      let bestScore = Number.NEGATIVE_INFINITY;
      for (const cell of availableCells) {
        board.set(cell, this.aiPlayer);
        let score = this.minimax(board, depth - 1, alpha, beta, false);
        board.set(cell, null);
        bestScore = Math.max(bestScore, score);
        alpha = Math.max(alpha, score);
        if (alpha >= beta) break;
      }
      return bestScore;
    } else {
      let bestScore = Number.POSITIVE_INFINITY;
      for (const cell of availableCells) {
        board.set(cell, this.userPlayer);
        let score = this.minimax(board, depth - 1, alpha, beta, true);
        board.set(cell, null);
        bestScore = Math.min(bestScore, score);
        beta = Math.min(beta, score);
        if (alpha >= beta) break;
      }
      return bestScore;
    }
  }

  getAvailableCells(board: Map<string, string | null>): string[] {
    return Array.from(board.keys()).filter((key) => board.get(key) === null);
  }

  getBestMove() {
    const availableCells = this.getAvailableCells(this.board);
    let bestScore = Number.NEGATIVE_INFINITY;
    let bestMove = "";

    for (const cell of availableCells) {
      this.board.set(cell, this.aiPlayer);
      const score = this.minimax(
        this.board,
        9,
        Number.NEGATIVE_INFINITY,
        Number.POSITIVE_INFINITY,
        false
      );
      this.board.set(cell, null);
      if (score > bestScore) {
        bestScore = score;
        bestMove = cell;
      }
    }
    return bestMove;
  }

  nextTurn() {
    if (this.currentPlayer === this.aiPlayer) {
      const bestMove = this.getBestMove();
      this.makeMove(bestMove);
    }
  }

  // Attach event listener to the board
  addEventListenerToBoard() {
    this.boardElement.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("cell")) {
        const position = target.getAttribute("data-position");
        if (position) {
          this.makeMove(position);
        }
      }
    });
  }

  // Make a move on the board
  makeMove(position: string) {
    if (this.board.get(position)) return;

    this.board.set(position, this.currentPlayer);
    this.markCell(position);

    // Check Winner
    const winner = this.checkWinner();
    if (winner) {
      this.winner = winner;
      this.renderWinner(winner);
      this.boardElement.style.pointerEvents = "none";
    } else {
      this.currentPlayer =
        this.currentPlayer === this.aiPlayer ? this.userPlayer : this.aiPlayer;
      this.nextTurn();
    }
  }

  // Mark the cell with the current player's symbol
  markCell(position: string) {
    const cell = document.querySelector(`[data-position="${position}"]`);
    if (cell) cell.textContent = this.currentPlayer;
  }

  // Create the board structure
  createBoard() {
    this.board.clear();
    this.availableCells.length = 0;
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const cell = `${i}${j}`;
        this.board.set(cell, null);
        this.availableCells.push(cell);
      }
    }
  }

  // Render the board on the web page
  renderBoard() {
    this.boardElement.classList.add("board");
    this.boardElement.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
    this.boardElement.style.gridTemplateRows = `repeat(${this.gridSize}, 1fr)`;
    this.board.forEach((_, key) => {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.setAttribute("data-position", key);
      this.boardElement.appendChild(cell);
    });
    this.app.innerHTML = "";
    this.app.appendChild(this.boardElement);
  }

  resetBoard() {
    this.board.forEach((_, key) => {
      const cell = document.querySelector(`[data-position="${key}"]`);
      if (cell) cell.textContent = "";
      cell?.classList.remove("winner-cells");
    });
  }

  // Reset the game for a new round
  resetGame() {
    this.boardElement.style.pointerEvents = "auto";
    this.createBoard();
    this.resetBoard();
    this.winner = null;
    this.currentPlayer = this.userPlayer; // Ensure the user always starts first
    const winnerElement = document.querySelector(".winner");
    if (winnerElement) winnerElement.remove();

    if (this.currentPlayer === this.aiPlayer) {
      this.nextTurn(); // AI makes the first move if it is the starting player
    }
  }

  // Render the winner message and play again button
  renderWinner(winner: string) {
    const winnerContainer = document.createElement("div");
    winnerContainer.classList.add("winner");
    const winnerElement = document.createElement("div");
    winnerElement.textContent =
      winner === "Draw" ? "It's a Draw!" : `${winner} Wins!`;

    const button = document.createElement("button");
    button.textContent = "Play Again";
    button.addEventListener("click", () => this.resetGame());

    winnerContainer.appendChild(winnerElement);
    winnerContainer.appendChild(button);
    this.app.appendChild(winnerContainer);
  }
}

class Game {
  app = document.getElementById("app")!;

  renderHomeScreen() {
    const div = document.createElement("div");
    div.classList.add("home-screen");
    const paragraph = document.createElement("p");
    paragraph.textContent = "Choose your player";
    div.appendChild(paragraph);
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");
    const buttonX = document.createElement("button");
    buttonX.textContent = "X";
    buttonX.addEventListener("click", () => this.start("X"));
    const buttonO = document.createElement("button");
    buttonO.textContent = "O";
    buttonO.addEventListener("click", () => this.start("O"));
    buttonContainer.appendChild(buttonX);
    buttonContainer.appendChild(buttonO);
    div.appendChild(buttonContainer);
    this.app.appendChild(div);
  }
  start(player: "X" | "O") {
    new TicTacToe(3, player);
  }
}

const game = new Game();
game.renderHomeScreen();

import "./style.css";

class TicTacToe {
  boardElement = document.createElement("div");
  app = document.getElementById("app")!;
  board = new Map<string, string | null>();
  players = ["X", "O"];
  currentPlayer: "X" | "O";
  gridSize: number;
  winningCombinations: string[][] = [];
  winner: string | null = null;

  constructor(gridSize: number, currentPlayer: "X" | "O") {
    this.gridSize = gridSize;
    this.currentPlayer = currentPlayer;
    this.init();
  }

  // Initialize the game
  init() {
    this.createBoard();
    this.generateWinningCombinations();
    this.renderBoard();
    this.addEventListenerToBoard();
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

  // Check if there is a winner or if the game is a draw
  checkWinner() {
    for (const combination of this.winningCombinations) {
      const values = combination.map((pos) => this.board.get(pos));
      if (values.every((val) => val === "X")) {
        this.highlightWinner(combination);
        return "X";
      }
      if (values.every((val) => val === "O")) {
        this.highlightWinner(combination);
        return "O";
      }
    }
    if (Array.from(this.board.values()).every((val) => val !== null)) {
      return "Draw";
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
    const winner = this.checkWinner();
    if (winner) {
      this.winner = winner;
      this.renderWinner(winner);
      this.boardElement.style.pointerEvents = "none";
    } else {
      this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
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
    Array.from({ length: this.gridSize }, (_, i) => {
      Array.from({ length: this.gridSize }, (_, j) => {
        this.board.set(`${i}${j}`, null);
      });
    });
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
    this.currentPlayer = "X";
    const winnerElement = document.querySelector(".winner");
    if (winnerElement) winnerElement.remove();
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

// Initialize the game with a 3x3 grid and player X starting
new TicTacToe(3, "X");

import { GAME_BOARD_DIM, FIRST_PLAYER, SECOND_PLAYER } from "../consts.mjs";
import { ANSI } from "../utils/ansi.mjs";
import { print, clearScreen } from "../utils/io.mjs";
import { KeyBoardManager } from "../utils/io.mjs"; 
import { globals } from "../globals.mjs";

ANSI.SEA__AND_SHIP = "\x1b[38;5;83;48;5;39m";
ANSI.SEA = "\x1b[48;5;39m";

const TURN_DELAY = 2000; // 2-second delay for transition between turns

const createBattleshipScreen = () => {
  let currentPlayer = FIRST_PLAYER;
  let cursorColumn = 0;
  let cursorRow = 0;
  let lastAttackResult = "";
  let playerHits = { [FIRST_PLAYER]: [], [SECOND_PLAYER]: [] };
  let isTransitioning = false;

  function swapPlayer() {
    isTransitioning = true;
    setTimeout(() => {
      currentPlayer *= -1;
      cursorColumn = 0;
      cursorRow = 0;
      lastAttackResult = "";
      isTransitioning = false;
    }, TURN_DELAY);
  }

  function attack(row, column) {
    const opponentBoard =
      currentPlayer === FIRST_PLAYER
        ? globals.player2Board
        : globals.player1Board;

    // Check if the target cell is defined and not marked
    if (opponentBoard[row][column] && opponentBoard[row][column] !== "X") {
      // Hit
      playerHits[currentPlayer].push({ row, column });
      opponentBoard[row][column] = "X"; // Mark hit on the opponent's board
      lastAttackResult = "Hit!";
      if (checkWinCondition()) {
        this.next = "win";
        this.transitionTo = "Game Over";
        return;
      }
    } else {
      lastAttackResult = "Miss!";
    }
    swapPlayer();
  }

  function checkWinCondition() {
    const opponentBoard =
      currentPlayer === FIRST_PLAYER
        ? globals.player2Board
        : globals.player1Board;
    return (
      opponentBoard &&
      opponentBoard.flat().filter((cell) => cell && cell !== "X").length === 0
    );
  }

  function drawBoard(board, hits, showShips = false, showCursor = false) {
    let output = `  `;
    for (let i = 0; i < GAME_BOARD_DIM; i++) {
      output += ` ${String.fromCharCode(65 + i)}`;
    }
    output += "\n";

    for (let y = 0; y < GAME_BOARD_DIM; y++) {
      output += `${String(y + 1).padStart(2, " ")} `;
      for (let x = 0; x < GAME_BOARD_DIM; x++) {
        const cell = board[y][x] || "~"; // Default to "~" for undefined cells
        if (showCursor && y === cursorRow && x === cursorColumn) {
          output += ANSI.COLOR.YELLOW + "*" + ANSI.RESET + " "; // Cursor marker on opponent's board
        } else if (hits.some((hit) => hit.row === y && hit.column === x)) {
          output += ANSI.COLOR.RED + "X " + ANSI.RESET; // Hit
        } else if (showShips && cell !== "~" && cell !== "X") {
          output += ANSI.SEA__AND_SHIP + cell + ANSI.RESET + " "; // Ship cell
        } else {
          output += ANSI.SEA + "~ " + ANSI.RESET; // Water
        }
      }
      output += `${y + 1}\n`;
    }
    output += "  ";
    for (let i = 0; i < GAME_BOARD_DIM; i++) {
      output += ` ${String.fromCharCode(65 + i)}`;
    }
    output += "\n";
    return output;
  }

  return {
    isDrawn: false,
    next: null,
    transitionTo: null,

    init: function () {
      if (!globals.player1Board || !globals.player2Board) {
        throw new Error("Player boards not initialized in globals.");
      }
    },

    update: function (dt) {
      if (isTransitioning) return;

      this.isDrawn = false; // Reset drawn state

      // Only allow cursor movement on opponent's board
      if (KeyBoardManager.isUpPressed()) {
        cursorRow = Math.max(0, cursorRow - 1);
      }
      if (KeyBoardManager.isDownPressed()) {
        cursorRow = Math.min(GAME_BOARD_DIM - 1, cursorRow + 1);
      }
      if (KeyBoardManager.isLeftPressed()) {
        cursorColumn = Math.max(0, cursorColumn - 1);
      }
      if (KeyBoardManager.isRightPressed()) {
        cursorColumn = Math.min(GAME_BOARD_DIM - 1, cursorColumn + 1);
      }
      if (KeyBoardManager.isEnterPressed()) {
        const isAlreadyAttacked = playerHits[currentPlayer].some(
          (hit) => hit.row === cursorRow && hit.column === cursorColumn
        );
        if (!isAlreadyAttacked) {
          attack.call(this, cursorRow, cursorColumn); // Use `call` to maintain `this` context
        }
      }
    },

    draw: function (dr) {
      if (this.isDrawn) return;

      this.isDrawn = true;
      clearScreen();

      const playerBoard =
        currentPlayer === FIRST_PLAYER
          ? globals.player1Board
          : globals.player2Board;
      const opponentBoard =
        currentPlayer === FIRST_PLAYER
          ? globals.player2Board
          : globals.player1Board;

      print(`Player ${currentPlayer === FIRST_PLAYER ? "1" : "2"}'s Turn\n`);
      print("Your Board:\n");
      print(drawBoard(playerBoard, playerHits[currentPlayer], true));

      print("Opponent's Board:\n");
      print(
        drawBoard(
          opponentBoard,
          playerHits[currentPlayer],
          false,
          true // Enable cursor on the opponent's board
        )
      );

      if (lastAttackResult) {
        print(`\nLast Attack Result: ${lastAttackResult}\n`);
      }

      print(`\nSelect a target:\n`);
      print(
        `Cursor: Row ${cursorRow + 1}, Column ${String.fromCharCode(
          65 + cursorColumn
        )}\n`
      );
      print(`Press Enter to Attack, Arrow keys to move.\n`);
    },
  };
};

export default createBattleshipScreen;

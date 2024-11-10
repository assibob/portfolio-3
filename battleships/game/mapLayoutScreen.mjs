import { GAME_BOARD_DIM } from "../consts.mjs";
import { ANSI } from "../utils/ansi.mjs";
import { print, clearScreen } from "../utils/io.mjs";
import units from "./units.mjs";
import { KeyBoardManager } from "../utils/io.mjs"; 
import { create2DArrayWithFill } from "../utils/array.mjs";
import { translate } from "../game.mjs";
import { globals } from "../globals.mjs";

ANSI.SEA__AND_SHIP = "\x1b[38;5;83;48;5;39m";
ANSI.SEA = "\x1b[48;5;39m";

function getShipName(ship, language) {
  return ship.id[language];
}

function createMapLayoutScreen() {
  const MapLayout = {
    player: null,
    isDrawn: false,
    next: null,
    transitionTo: null,
    cursorColumn: 0,
    cursorRow: 0,
    currentShipIndex: 0,
    isHorizontal: false,
    map: create2DArrayWithFill(GAME_BOARD_DIM),
    ships: [...Object.values(units)],
    placedShips: [],
    transitionFn: null,

    init: function (player, transitionFn) {
      this.player = player;
      this.transitionFn = transitionFn;
      
      if (player === 1) {
        globals.player1Board = this.map;
      } else {
        globals.player2Board = this.map;
      }
    },

    canPlaceShip: function () {
      const ship = this.ships[this.currentShipIndex];
      const size = ship.size;

      if (this.isHorizontal) {
        if (this.cursorColumn + size > GAME_BOARD_DIM) {
          return false;
        }
      } else {
        if (this.cursorRow + size > GAME_BOARD_DIM) {
          return false;
        }
      }

      for (let i = 0; i < size; i++) {
        const column = this.isHorizontal
          ? this.cursorColumn + i
          : this.cursorColumn;
        const row = this.isHorizontal ? this.cursorRow : this.cursorRow + i;
        if (this.map[row][column] !== 0) {
          return false;
        }
      }

      return true;
    },

    placeShip: function () {
      const ship = this.ships[this.currentShipIndex];
      for (let i = 0; i < ship.size; i++) {
        const column = this.isHorizontal
          ? this.cursorColumn + i
          : this.cursorColumn;
        const row = this.isHorizontal ? this.cursorRow : this.cursorRow + i;
        this.map[row][column] = ship.symbol;
      }

      this.placedShips.push({
        ...ship,
        x: this.cursorColumn,
        y: this.cursorRow,
        isHorizontal: this.isHorizontal,
      });
    },

    isPositionInShipPreview: function (column, row) {
      if (this.currentShipIndex >= this.ships.length) return false;

      const ship = this.ships[this.currentShipIndex];
      if (this.isHorizontal) {
        return (
          row === this.cursorRow &&
          column >= this.cursorColumn &&
          column < this.cursorColumn + ship.size
        );
      } else {
        return (
          column === this.cursorColumn &&
          row >= this.cursorRow &&
          row < this.cursorRow + ship.size
        );
      }
    },

    update: function (dt) {
      const ship = this.ships[this.currentShipIndex];
      const size = ship.size;

      if (KeyBoardManager.isUpPressed()) {
        this.cursorRow = Math.max(0, this.cursorRow - 1);
        this.isDrawn = false;
      }
      if (KeyBoardManager.isDownPressed()) {
        this.cursorRow = this.isHorizontal
          ? Math.min(GAME_BOARD_DIM - 1, this.cursorRow + 1)
          : Math.min(GAME_BOARD_DIM - size, this.cursorRow + 1);
        this.isDrawn = false;
      }
      if (KeyBoardManager.isLeftPressed()) {
        this.cursorColumn = Math.max(0, this.cursorColumn - 1);
        this.isDrawn = false;
      }
      if (KeyBoardManager.isRightPressed()) {
        this.cursorColumn = this.isHorizontal
          ? Math.min(GAME_BOARD_DIM - size, this.cursorColumn + 1)
          : Math.min(GAME_BOARD_DIM - 1, this.cursorColumn + 1);
        this.isDrawn = false;
      }

      if (KeyBoardManager.isRotatePressed()) {
        this.isHorizontal = !this.isHorizontal;
        if (this.isHorizontal) {
          this.cursorColumn = Math.min(
            this.cursorColumn,
            GAME_BOARD_DIM - size
          );
        } else {
          this.cursorRow = Math.min(this.cursorRow, GAME_BOARD_DIM - size);
        }
        this.isDrawn = false;
      }


      if (
        KeyBoardManager.isEnterPressed() &&
        this.currentShipIndex < this.ships.length
      ) {
        this.isDrawn = false;
        if (this.canPlaceShip()) {
          this.placeShip();
          this.currentShipIndex++;
          this.cursorColumn = 0;
          this.cursorRow = 0;
          if (this.currentShipIndex >= this.ships.length) {
            if (this.player === 1) {
              globals.player1Board = this.map;
            } else {
              globals.player2Board = this.map;
            }
            this.next = this.transitionFn();
            this.transitionTo = "next state";
          }
        }
      }
    },

    draw: function (dr) {
      if (this.isDrawn) return;

      this.isDrawn = true;
      clearScreen();

      let output = `${ANSI.TEXT.BOLD}${ANSI.COLOR.YELLOW}${translate(
        "ship_placement_phase"
      )}\n\n${ANSI.TEXT.BOLD_OFF}${ANSI.RESET}`;

      output += "  ";
      for (let i = 0; i < GAME_BOARD_DIM; i++) {
        output += ` ${String.fromCharCode(65 + i)}`;
      }
      output += "\n";

      for (let y = 0; y < GAME_BOARD_DIM; y++) {
        output += `${String(y + 1).padStart(2, " ")} `;
        for (let x = 0; x < GAME_BOARD_DIM; x++) {
          const cell = this.map[y][x];
          const isInShipPreview = this.isPositionInShipPreview(x, y);

          if (isInShipPreview && this.canPlaceShip()) {
            output += ANSI.COLOR.GREEN + "█" + ANSI.RESET + " ";
          } else if (isInShipPreview) {
            output += ANSI.COLOR.WHITE + "█" + ANSI.RESET + " ";
          } else if (cell !== 0) {
            output += ANSI.SEA__AND_SHIP + cell + ANSI.RESET + " ";
          } else {
            output += ANSI.SEA + " " + ANSI.RESET + " ";
          }
        }
        output += `${y + 1}\n`;
      }

      output += "  ";
      for (let i = 0; i < GAME_BOARD_DIM; i++) {
        output += ` ${String.fromCharCode(65 + i)}`;
      }
      output += "\n\n";

      output += `${ANSI.TEXT.BOLD}${ANSI.COLOR.YELLOW}${translate(
        "controls"
      )}:${ANSI.TEXT.BOLD_OFF}${ANSI.RESET}\n`;
      output += `${translate("arrow_keys_move")}\n`;
      output += `${translate("rotate_key")}\n`;
      output += `${translate("enter_key")}\n`;

      output += `\n${ANSI.TEXT.BOLD}${ANSI.COLOR.YELLOW}${translate(
        "ships_to_place"
      )}:${ANSI.TEXT.BOLD_OFF}${ANSI.RESET}\n`;
      this.ships.forEach((ship, index) => {
        const status =
          index < this.currentShipIndex
            ? "✓"
            : index === this.currentShipIndex
            ? ">"
            : " ";
        output += `${status} ${getShipName(ship, globals.currentLanguage)} (${
          ship.size
        } ${translate("spaces")})\n`;
      });

      print(output);
    },
  };

  return MapLayout;
}

export default createMapLayoutScreen;

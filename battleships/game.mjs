import { ANSI } from "./utils/ansi.mjs";
import { print, clearScreen, KeyBoardManager } from "./utils/io.mjs";
import SplashScreen from "./game/splash.mjs";
import {
  FIRST_PLAYER,
  SECOND_PLAYER,
  TRANSLATIONS,
  LANGUAGE,
} from "./consts.mjs";
import createMenu from "./utils/menu.mjs";
import createMapLayoutScreen from "./game/mapLayoutScreen.mjs";
import createInnBetweenScreen from "./game/innbetweenScreen.mjs";
import createBattleshipScreen from "./game/battleshipsScreen.mjs";
import { globals } from "./globals.mjs";

const GAME_FPS = 1000 / 60;
const MIN_WIDTH = 80;
const MIN_HEIGHT = 24;
let currentState = null;
let gameLoop = null;
let mainMenuScene = null;

export function translate(key) {
  return TRANSLATIONS[globals.currentLanguage][key];
}

function checkConsoleResolution() {
  const { columns, rows } = process.stdout;
  console.log(`Current terminal size: ${columns} columns, ${rows} rows`); 
  if (columns < MIN_WIDTH || rows < MIN_HEIGHT) {
    clearScreen();
    print(
      `\n${translate("game_resolution_error")}\n\n${translate(
        "width"
      )}: ${MIN_WIDTH} ${translate("columns")}\n${translate(
        "height"
      )}: ${MIN_HEIGHT} ${translate("rows")}\n\n`
    );
    print(ANSI.SHOW_CURSOR);
    process.exit(1);
  }
}

function initialize() {
  checkConsoleResolution();
  print(ANSI.HIDE_CURSOR);
  clearScreen();
  setMainMenuScene();
  currentState = SplashScreen;
  gameLoop = setInterval(update, GAME_FPS);
}

function update() {
  currentState.update(GAME_FPS);
  currentState.draw(GAME_FPS);
  if (currentState.transitionTo != null) {
    currentState = currentState.next;
    print(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME);
  }
}

function setMainMenuScene() {
  mainMenuScene = createMenu(buildMenu());
  SplashScreen.next = mainMenuScene;
}

function buildMenu() {
  let menuItemCount = 0;
  return [
    {
      text: translate("start_game"),
      id: menuItemCount++,
      action: function () {
        clearScreen();
        let innbetween = createInnBetweenScreen();
        innbetween.init(
          `${translate("ship_placement_prompt")}\n${translate("player_ready")}`,
          () => {
            let p1map = createMapLayoutScreen();
            p1map.init(FIRST_PLAYER, () => {
              let innbetween = createInnBetweenScreen();
              innbetween.init(
                `${translate("ship_placement_prompt")}\n${translate(
                  "player_two_ready"
                )}`,
                () => {
                  let p2map = createMapLayoutScreen();
                  p2map.init(SECOND_PLAYER, () => {
                    return createBattleshipScreen();
                  });
                  return p2map;
                }
              );
              return innbetween;
            });

            return p1map;
          },
          3
        );
        currentState.next = innbetween;
        currentState.transitionTo = "Map layout";
      },
    },
    {
      text: translate("settings"),
      id: menuItemCount++,
      action: function () {
        openSettingsMenu();
      },
    },
    {
      text: translate("exit_game"),
      id: menuItemCount++,
      action: function () {
        print(ANSI.SHOW_CURSOR);
        clearScreen();
        process.exit();
      },
    },
  ];
}

function openSettingsMenu() {
  const settingsMenuItems = [
    {
      text: `${translate("select_language")}: ${translate("language_selected")} English`,
      id: 0,
      action: function () {
        globals.currentLanguage = LANGUAGE.ENGLISH;
        updateLanguageAndReturnToMainMenu();
      },
    },
    {
      text: `${translate("select_language")}: ${translate("language_selected")} Norwegian`,
      id: 1,
      action: function () {
        globals.currentLanguage = LANGUAGE.NORWEGIAN;
        updateLanguageAndReturnToMainMenu();
      },
    },
  ];
  currentState = createMenu(settingsMenuItems);
}

function updateLanguageAndReturnToMainMenu() {
  setMainMenuScene();
  clearScreen();
  currentState = mainMenuScene;
}

initialize();

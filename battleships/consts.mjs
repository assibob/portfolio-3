const GAME_BOARD_DIM = 10;
const FIRST_PLAYER = 1;
const SECOND_PLAYER = -1;

const TRANSLATIONS = {
  en: {
    start_game: "Start Game",
    exit_game: "Exit Game",
    settings: "Settings",
    select_language: "Select Language",
    language_selected: "Language selected:",
    game_resolution_error:
      "Console window is too small! Minimum resolution required:",
    ship_placement_prompt: "SHIP PLACEMENT",
    player_ready: "First player, get ready.\nSecond player, look away.",
    player_two_ready: "Second player, get ready.\nFirst player, look away.",
    width: "Width",
    height: "Height",
    columns: "columns", 
    rows: "rows", 

    ship_placement_phase: "Ship Placement Phase",
    controls: "Controls",
    arrow_keys_move: "Arrow keys: Move cursor",
    rotate_key: "R: Rotate ship",
    enter_key: "Enter: Place ship",
    ships_to_place: "Ships to place",
    spaces: "spaces",
  },
  no: {
    start_game: "Start spill",
    exit_game: "Avslutt spill",
    settings: "Innstillinger",
    select_language: "Velg språk",
    language_selected: "Språk valgt:",
    game_resolution_error:
      "Konsollvinduet er for lite! Minimumsoppløsning påkrevd:",
    ship_placement_prompt: "SKIPSPLASSERING",
    player_ready: "Første spiller, gjør deg klar.\nAndre spiller, se bort.",
    player_two_ready: "Andre spiller, gjør deg klar.\nFørste spiller, se bort.",
    width: "Bredde",
    height: "Høyde",
    columns: "kolonner", 
    rows: "rader", 

    ship_placement_phase: "Skipsplassering Fase",
    controls: "Kontroller",
    arrow_keys_move: "Piltaster: Flytt markør",
    rotate_key: "R: Roter skip",
    enter_key: "Enter: Plasser skip",
    ships_to_place: "Skip å plassere",
    spaces: "plasser",
  },
};

const LANGUAGE = { ENGLISH: "en", NORWEGIAN: "no" };

export { GAME_BOARD_DIM, FIRST_PLAYER, SECOND_PLAYER, TRANSLATIONS, LANGUAGE };

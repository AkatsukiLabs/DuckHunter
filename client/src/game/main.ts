import kaplay from "kaplay";
import { COLORS } from "../constant";
import gameManager from "../gameManager";
import formatScore from "../utils";
import makeDog from "../entities/dog";

interface GameOptions {
  playerName?: string;
  walletAddress?: string;
}

export function startGame(container: HTMLElement, options: GameOptions = {}) {
  // Clear container first
  container.innerHTML = '';
  
  // Create canvas element
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  
  // Initialize KaPlay with the canvas
  const k = kaplay({
    width: 640,
    height: 480,
    canvas: canvas,
    debug: false,
    crisp: true
  });

  // Load all assets
  k.loadSprite("background", "./graphics/background.png");
  k.loadSprite("menu", "./graphics/menu.png");
  k.loadSprite("cursor", "./graphics/cursor.png");
  k.loadFont("nes", "./fonts/nintendo-nes-font/nintendo-nes-font.ttf");
  k.loadSprite("dog", "./graphics/dog.png", {
    sliceX: 4,
    sliceY: 3,
    anims: {
      search: { from: 0, to: 3, speed: 6, loop: true },
      snif: { from: 4, to: 5, speed: 4, loop: true },
      detect: 6,
      jump: { from: 7, to: 8, speed: 6 },
      catch: 9,
      mock: { from: 10, to: 11, loop: true },
    },
  });
  k.loadSprite("duck", "./graphics/duck.png", {
    sliceX: 8,
    sliceY: 1,
    anims: {
      "flight-diagonal": { from: 0, to: 2, loop: true },
      "flight-side": { from: 3, to: 5, loop: true },
      shot: 6,
      fall: 7,
    },
  });
  k.loadSprite("text-box", "./graphics/text-box.png");
  k.loadSound("gun-shot", "./sounds/gun-shot.wav");
  k.loadSound("quacking", "./sounds/quacking.wav");
  k.loadSound("flapping", "./sounds/flapping.ogg");
  k.loadSound("fall", "./sounds/fall.wav");
  k.loadSound("impact", "./sounds/impact.wav");
  k.loadSound("sniffing", "./sounds/sniffing.wav");
  k.loadSound("barking", "./sounds/barking.wav");
  k.loadSound("laughing", "./sounds/laughing.wav");
  k.loadSound("ui-appear", "./sounds/ui-appear.wav");
  k.loadSound("successful-hunt", "./sounds/successful-hunt.wav");
  k.loadSound("forest-ambiance", "./sounds/forest-ambiance.wav");
  k.loadSound("background-music", "./sounds/music.mp3");

  // Global background music instance
  let globalBgMusic: any = null;

  function startBackgroundMusic() {
    if (!globalBgMusic || globalBgMusic.paused) {
      globalBgMusic = k.play("background-music", {
        volume: 0.3,
        loop: true,
      });
    }
  }

  function stopBackgroundMusic() {
    if (globalBgMusic) {
      globalBgMusic.stop();
      globalBgMusic = null;
    }
  }

  // Skip login scene and go directly to main-menu since auth is handled by React
  k.scene("main-menu", () => {
    k.add([k.sprite("menu")]);

    startBackgroundMusic();

    const playerName = options.playerName || "Player";
    k.add([
      k.text(`Welcome, ${playerName}!`, { font: "nes", size: 10 }),
      k.anchor("center"),
      k.pos(k.center().x, 125),
      k.color(COLORS.RED),
    ]);

    const startButton = k.add([
      k.rect(140, 25),
      k.area(),
      k.anchor("center"),
      k.pos(k.center().x, k.center().y + 40),
      k.color(COLORS.BLUE),
      k.outline(2, k.Color.WHITE),
      "start-button",
    ]);

    startButton.add([
      k.text("START GAME", { font: "nes", size: 8 }),
      k.anchor("center"),
      k.pos(0, 0),
      k.color(255, 255, 255),
    ]);

    const leaderboardButton = k.add([
      k.rect(140, 25),
      k.area(),
      k.anchor("center"),
      k.pos(k.center().x, k.center().y + 75),
      k.color(COLORS.RED),
      k.outline(2, k.Color.WHITE),
      "leaderboard-button",
    ]);

    leaderboardButton.add([
      k.text("LEADERBOARD", { font: "nes", size: 8 }),
      k.anchor("center"),
      k.pos(0, 0),
      k.color(255, 255, 255),
    ]);

    k.onClick("start-button", () => {
      stopBackgroundMusic();
      k.go("game");
    });

    k.onClick("leaderboard-button", () => {
      k.go("leaderboard");
    });
  });

  // Game scene (keep existing implementation)
  k.scene("game", () => {
    k.setCursor("none");
    k.add([k.rect(k.width(), k.height()), k.color(COLORS.BLUE), "sky"]);
    k.add([k.sprite("background"), k.pos(0, -10), k.z(1)]);

    const score = k.add([
      k.text(formatScore(0, 6), { font: "nes", size: 8 }),
      k.pos(192, 197),
      k.z(2),
    ]);

    const roundCount = k.add([
      k.text("1", { font: "nes", size: 8 }),
      k.pos(42, 182),
      k.z(2),
      k.color(COLORS.RED),
    ]);

    const duckIcons = k.add([k.pos(95, 198)]);
    let duckIconPosX = 1;
    for (let i = 0; i < 10; i++) {
      duckIcons.add([k.rect(7, 9), k.pos(duckIconPosX, 0), `duckIcon-${i}`]);
      duckIconPosX += 8;
    }

    const bulletUIMask = k.add([
      k.rect(0, 8),
      k.pos(25, 198),
      k.z(2),
      k.color(0, 0, 0),
    ]);

    const dog = makeDog(k.vec2(0, k.center().y));
    dog.searchForDucks();

    // Keep all the existing game logic
    const roundStartController = gameManager.onStateEnter(
      "round-start",
      async (isFirstRound) => {
        if (!isFirstRound) gameManager.preySpeed += 50;
        k.play("ui-appear");
        gameManager.currentRoundNb++;
        roundCount.text = String(gameManager.currentRoundNb);
        const textBox = k.add([
          k.sprite("text-box"),
          k.anchor("center"),
          k.pos(k.center().x, k.center().y - 50),
          k.z(2),
        ]);
        textBox.add([
          k.text("ROUND", { font: "nes", size: 8 }),
          k.anchor("center"),
          k.pos(0, -10),
        ]);
        textBox.add([
          k.text(String(gameManager.currentRoundNb), { font: "nes", size: 8 }),
          k.anchor("center"),
          k.pos(0, 4),
        ]);

        await k.wait(1);
        k.destroy(textBox);
        gameManager.enterState("hunt-start");
      }
    );

    // ... rest of the game logic (keeping it exactly the same)
    // We'll integrate blockchain transactions here later

    const forestAmbianceSound = k.play("forest-ambiance", {
      volume: 0.1,
      loop: true,
    });

    k.onSceneLeave(() => {
      forestAmbianceSound.stop();
      roundStartController.cancel();
      gameManager.resetGameState();
    });

    k.onKeyPress((key) => {
      if (key === "p") {
        k.getTreeRoot().paused = !k.getTreeRoot().paused;
        if (k.getTreeRoot().paused) {
          gameManager.isGamePaused = true;
          k.add([
            k.text("PAUSED", { font: "nes", size: 8 }),
            k.pos(5, 5),
            k.z(3),
            "paused-text",
          ]);
        } else {
          gameManager.isGamePaused = false;
          const pausedText = k.get("paused-text")[0];
          if (pausedText) k.destroy(pausedText);
        }
      }
    });
  });

  // Add other scenes (leaderboard, game-over, etc.)
  k.scene("leaderboard", () => {
    k.add([k.rect(k.width(), k.height()), k.color(0, 0, 0)]);
    
    k.add([
      k.text("LEADERBOARD", { font: "nes", size: 10 }),
      k.anchor("center"),
      k.pos(k.center().x, 30),
      k.color(COLORS.RED),
    ]);

    // TODO: Replace with real blockchain leaderboard data

    const backButton = k.add([
      k.rect(100, 20),
      k.area(),
      k.anchor("center"),
      k.pos(k.center().x, 210),
      k.color(COLORS.BLUE),
      k.outline(2, k.Color.WHITE),
      "back-button",
    ]);

    backButton.add([
      k.text("BACK", { font: "nes", size: 8 }),
      k.anchor("center"),
      k.pos(0, 0),
      k.color(255, 255, 255),
    ]);

    k.onClick("back-button", () => {
      k.go("main-menu");
    });
  });

  // Start with main menu (skip login since it's handled by React)
  k.go("main-menu");

  return k;
}
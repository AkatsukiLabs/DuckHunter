import kaplay from "kaplay";
import { COLORS } from "../constant";
import formatScore from "../utils";
import { createGameManager } from "./gameManagerFactory";
import { createDog } from "./dogFactory";
import { createDuck } from "./duckFactory";

interface GameOptions {
  playerName?: string;
  walletAddress?: string;
}

// Global singleton to prevent multiple KAPLAY instances
let gameInstance: any = null;
let isDestroyed = false;

export function startGame(container: HTMLElement, options: GameOptions = {}) {
  // If already destroyed and trying to reinitialize, reset the destroyed flag
  if (isDestroyed) {
    isDestroyed = false;
    gameInstance = null;
  }

  // Prevent multiple initializations (synchronous check)
  if (gameInstance && gameInstance !== 'INITIALIZING') {
    console.log('🎮 Game instance already exists, attaching to new container');
    
    // Move canvas to new container if different
    if (gameInstance.canvas && gameInstance.canvas.parentNode !== container) {
      container.innerHTML = '';
      container.appendChild(gameInstance.canvas);
    }
    
    return gameInstance;
  }

  if (gameInstance === 'INITIALIZING') {
    console.log('🎮 Game is already initializing, skipping');
    return null;
  }

  // Immediately set a placeholder to prevent race conditions
  gameInstance = 'INITIALIZING';
  
  try {
    // Clear container first
    container.innerHTML = '';
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);
    
    console.log('🎮 Creating new KAPLAY instance...');
    
    // Initialize KaPlay with the canvas - using original config
    const k = kaplay({
    width: 256,
    height: 224,
    letterbox: true,
    touchToMouse: true,
    scale: 4,
    pixelDensity: devicePixelRatio,
    debug: false,
    background: [0, 0, 0],
    canvas: canvas
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
      k.text(`Welcome, ${playerName}`, { font: "nes", size: 10 }),
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
      // Navigate to React leaderboard component
      window.location.href = '/leaderboard';
    });
  });

  // Game scene with complete original logic
  k.scene("game", () => {
    k.setCursor("none");
    k.add([k.rect(k.width(), k.height()), k.color(COLORS.BLUE), "sky"]);
    k.add([k.sprite("background"), k.pos(0, -10), k.z(1)]);

    // Create game manager for this scene
    const gameManager = createGameManager(k);

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

    // Create dog and start searching
    const dog = createDog(k, k.vec2(0, k.center().y), gameManager);
    dog.searchForDucks();

    // All game state controllers exactly like the original
    const roundStartController = gameManager.onStateEnter(
      "round-start",
      async (isFirstRound: boolean) => {
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

    const roundEndController = gameManager.onStateEnter("round-end", () => {
      if (gameManager.nbDucksShotInRound < 6) {
        k.go("game-over");
        return;
      }

      if (gameManager.nbDucksShotInRound === 10) {
        gameManager.currentScore += 500;
      }

      gameManager.nbDucksShotInRound = 0;
      for (const duckIcon of duckIcons.children) {
        duckIcon.color = k.color(255, 255, 255);
      }
      gameManager.enterState("round-start");
    });

    const huntStartController = gameManager.onStateEnter("hunt-start", () => {
      gameManager.currentHuntNb++;
      const duck = createDuck(
        k,
        String(gameManager.currentHuntNb - 1),
        gameManager.preySpeed,
        gameManager
      );
      duck.setBehavior();
    });

    const huntEndController = gameManager.onStateEnter("hunt-end", () => {
      const bestScore = Number(k.getData("best-score") || 0);

      if (bestScore < gameManager.currentScore) {
        k.setData("best-score", gameManager.currentScore);
      }

      if (gameManager.currentHuntNb <= 9) {
        gameManager.enterState("hunt-start");
        return;
      }

      gameManager.currentHuntNb = 0;
      gameManager.enterState("round-end");
    });

    const duckHuntedController = gameManager.onStateEnter("duck-hunted", () => {
      gameManager.nbBulletsLeft = 3;
      dog.catchFallenDuck();
    });

    const duckEscapedController = gameManager.onStateEnter("duck-escaped", async () => {
      dog.mockPlayer();
    });

    // Add the cursor that was missing!
    const cursor = k.add([
      k.sprite("cursor"),
      k.anchor("center"),
      k.pos(),
      k.z(3),
    ]);

    // Original shooting mechanism
    k.onClick(() => {
      if (gameManager.state === "hunt-start" && !gameManager.isGamePaused) {
        // Note: we need to allow nbBulletsLeft to go below zero
        // so that if cursor overlaps with duck, the duck shot logic
        // will work. Otherwise, the onClick in the Duck class will
        // never register a successful hit because the nbBulletsLeft goes
        // to zero before that onClick runs.
        if (gameManager.nbBulletsLeft > 0) k.play("gun-shot", { volume: 0.5 });
        gameManager.nbBulletsLeft--;
      }
    });

    // Update loop exactly like original
    k.onUpdate(() => {
      score.text = formatScore(gameManager.currentScore, 6);
      switch (gameManager.nbBulletsLeft) {
        case 3:
          bulletUIMask.width = 0;
          break;
        case 2:
          bulletUIMask.width = 8;
          break;
        case 1:
          bulletUIMask.width = 15;
          break;
        default:
          bulletUIMask.width = 22;
      }
      cursor.moveTo(k.mousePos());
    });

    const forestAmbianceSound = k.play("forest-ambiance", {
      volume: 0.1,
      loop: true,
    });

    k.onSceneLeave(() => {
      forestAmbianceSound.stop();
      roundStartController.cancel();
      roundEndController.cancel();
      huntStartController.cancel();
      huntEndController.cancel();
      duckHuntedController.cancel();
      duckEscapedController.cancel();
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

  // Game over scene
  k.scene("game-over", () => {
    k.add([k.rect(k.width(), k.height()), k.color(0, 0, 0)]);
    k.add([
      k.text("GAME OVER!", { font: "nes", size: 8 }),
      k.anchor("center"),
      k.pos(k.center()),
    ]);

    k.wait(2, () => {
      k.go("main-menu");
    });
  });
  
  // Leaderboard scene
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

  // Store the game instance globally
  gameInstance = k;

  return k;
  
  } catch (error) {
    console.error('❌ Error initializing KAPLAY:', error);
    gameInstance = null; // Reset on error
    throw error;
  }
}

export function destroyGame() {
  if (gameInstance && gameInstance !== 'INITIALIZING') {
    try {
      console.log('🧹 Destroying KAPLAY instance...');
      gameInstance.quit?.();
      gameInstance = null;
      isDestroyed = true;
    } catch (error) {
      console.warn('Warning during game cleanup:', error);
      gameInstance = null;
      isDestroyed = true;
    }
  } else {
    gameInstance = null;
    isDestroyed = true;
  }
}
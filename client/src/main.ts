import k from "./kaplayCtx";
import { COLORS } from "./constant";
import gameManager from "./gameManager";
import formatScore from "./utils";
import makeDog from "./entities/dog";
import makeDuck from "./entities/duck";

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

k.scene("login", () => {
  k.add([k.sprite("menu")]);

  k.add([
    k.text("Enter your name:", { font: "nes", size: 8 }),
    k.anchor("center"),
    k.pos(k.center().x, k.center().y + 20),
    k.color(COLORS.RED),
  ]);

  k.add([
    k.rect(160, 20),
    k.anchor("center"),
    k.pos(k.center().x, k.center().y + 50),
    k.color(255, 255, 255),
    k.outline(2, k.Color.fromHex(COLORS.RED)),
  ]);

  let playerName = "";
  const nameText = k.add([
    k.text(playerName, { font: "nes", size: 8 }),
    k.anchor("center"),
    k.pos(k.center().x, k.center().y + 50),
    k.color(0, 0, 0),
  ]);

  k.add([
    k.text("Press ENTER to continue", { font: "nes", size: 6 }),
    k.anchor("center"),
    k.pos(k.center().x, k.center().y + 85),
    k.color(COLORS.RED),
  ]);

  k.onCharInput((ch) => {
    if (playerName.length < 12 && ch.match(/[a-zA-Z0-9]/)) {
      playerName += ch;
      nameText.text = playerName;
    }
  });

  k.onKeyPress("backspace", () => {
    if (playerName.length > 0) {
      playerName = playerName.slice(0, -1);
      nameText.text = playerName;
    }
  });

  k.onKeyPress("enter", () => {
    if (playerName.trim().length > 0) {
      k.setData("player-name", playerName.trim());
      k.go("main-menu");
    }
  });
});

k.scene("main-menu", () => {
  k.add([k.sprite("menu")]);

  const playerName = k.getData("player-name") || "Player";
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
    k.go("game");
  });

  k.onClick("leaderboard-button", () => {
    k.go("leaderboard");
  });
});

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
    const duck = makeDuck(
      String(gameManager.currentHuntNb - 1),
      gameManager.preySpeed
    );
    duck.setBehavior();
  });

  const huntEndController = gameManager.onStateEnter("hunt-end", () => {
    const bestScore = Number(k.getData("best-score"));

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

  const duckHunterController = gameManager.onStateEnter("duck-hunted", () => {
    gameManager.nbBulletsLeft = 3;
    dog.catchFallenDuck();
  });

  const duckEscapedController = gameManager.onStateEnter(
    "duck-escaped",
    async () => {
      dog.mockPlayer();
    }
  );

  const cursor = k.add([
    k.sprite("cursor"),
    k.anchor("center"),
    k.pos(),
    k.z(3),
  ]);
  k.onClick(() => {
    if (gameManager.state === "hunt-start" && !gameManager.isGamePaused) {
      // Note : we need to allow nbBulletsLeft to go below zero
      // so that if cursor overlaps with duck, the duck shot logic
      // will work. Otherwise, the onClick in the Duck class will
      // never register a successful hit because the nbBulletsLeft goes
      // to zero before that onClick runs. Look at a Duck class and you'll understand.
      if (gameManager.nbBulletsLeft > 0) k.play("gun-shot", { volume: 0.5 });
      gameManager.nbBulletsLeft--;
    }
  });

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
    duckHunterController.cancel();
    duckEscapedController.cancel();
    gameManager.resetGameState();
  });

  k.onKeyPress((key) => {
    if (key === "p") {
      k.getTreeRoot().paused = !k.getTreeRoot().paused;
      if (k.getTreeRoot().paused) {
        gameManager.isGamePaused = true;
        //@ts-ignore
        audioCtx.suspend();
        k.add([
          k.text("PAUSED", { font: "nes", size: 8 }),
          k.pos(5, 5),
          k.z(3),
          "paused-text",
        ]);
      } else {
        gameManager.isGamePaused = false;
        //@ts-ignore
        audioCtx.resume();

        const pausedText = k.get("paused-text")[0];
        if (pausedText) k.destroy(pausedText);
      }
    }
  });
});

k.scene("leaderboard", () => {
  k.add([k.rect(k.width(), k.height()), k.color(0, 0, 0)]);
  
  k.add([
    k.text("LEADERBOARD", { font: "nes", size: 10 }),
    k.anchor("center"),
    k.pos(k.center().x, 30),
    k.color(COLORS.RED),
  ]);

  const leaderboard: Array<{name: string, score: number, date: string}> = k.getData("leaderboard") || [];
  
  if (leaderboard.length === 0) {
    k.add([
      k.text("No scores yet!", { font: "nes", size: 8 }),
      k.anchor("center"),
      k.pos(k.center().x, k.center().y),
      k.color(255, 255, 255),
    ]);
  } else {
    let yPos = 60;
    leaderboard.slice(0, 10).forEach((entry: any, index: number) => {
      const rank = `${index + 1}.`;
      const name = entry.name.padEnd(8).slice(0, 8);
      const score = formatScore(entry.score, 6);
      
      k.add([
        k.text(`${rank} ${name} ${score}`, { font: "nes", size: 7 }),
        k.pos(20, yPos),
        k.color(index < 3 ? k.Color.fromHex(COLORS.RED) : k.Color.WHITE),
      ]);
      
      yPos += 15;
    });
  }

  const backButton = k.add([
    k.rect(100, 20),
    k.area(),
    k.anchor("center"),
    k.pos(k.center().x, 190),
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

  k.onKeyPress("escape", () => {
    k.go("main-menu");
  });
});

k.scene("game-over", () => {
  gameManager.saveScore();
  
  k.add([k.rect(k.width(), k.height()), k.color(0, 0, 0)]);
  k.add([
    k.text("GAME OVER!", { font: "nes", size: 8 }),
    k.anchor("center"),
    k.pos(k.center().x, k.center().y - 20),
    k.color(255, 255, 255),
  ]);

  k.add([
    k.text(`Final Score: ${formatScore(gameManager.currentScore, 6)}`, { font: "nes", size: 6 }),
    k.anchor("center"),
    k.pos(k.center().x, k.center().y + 10),
    k.color(COLORS.BEIGE),
  ]);

  k.wait(3, () => {
    k.go("main-menu");
  });
});

k.go("login");

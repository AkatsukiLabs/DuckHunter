import type { GameObj } from "kaplay";
import k from "./kaplayCtx";

function makeGameManager() {
  return k.add([
    k.state("menu", [
      "menu",
      "cutscene",
      "round-start",
      "round-end",
      "hunt-start",
      "hunt-end",
      "duck-hunted",
      "duck-escaped",
    ]),
    {
      isGamePaused: false,
      currentScore: 0,
      currentRoundNb: 0,
      currentHuntNb: 0,
      nbBulletsLeft: 3,
      nbDucksShotInRound: 0,
      preySpeed: 100,
      resetGameState(this: GameObj) {
        this.currentScore = 0;
        this.currentRoundNb = 0;
        this.currentHuntNb = 0;
        this.nbBulletsLeft = 3;
        this.nbDucksShotInRound = 0;
        this.preySpeed = 100;
      },
      saveScore(this: GameObj) {
        const playerName = k.getData("player-name") || "Anonymous";
        const leaderboard: Array<{name: string, score: number, date: string}> = k.getData("leaderboard") || [];
        
        leaderboard.push({
          name: String(playerName),
          score: this.currentScore,
          date: new Date().toISOString().split('T')[0]
        });
        
        leaderboard.sort((a, b) => b.score - a.score);
        const topScores = leaderboard.slice(0, 10);
        
        k.setData("leaderboard", topScores);
        
        if (this.currentScore > (k.getData("best-score") || 0)) {
          k.setData("best-score", this.currentScore);
        }
      },
    },
  ]);
}

const gameManager = makeGameManager();
export default gameManager;

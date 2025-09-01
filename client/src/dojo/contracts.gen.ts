import { DojoProvider, DojoCall } from "@dojoengine/core";
import { Account, AccountInterface } from "starknet";
import * as models from "./models.gen";

export function setupWorld(provider: DojoProvider) {

	const build_game_spawnPlayer_calldata = (playerName: number): DojoCall => {
		return {
			contractName: "game",
			entrypoint: "spawn_player",
			calldata: [playerName],
		};
	};

	const game_spawnPlayer = async (snAccount: Account | AccountInterface, playerName: number) => {
		try {
			return await provider.execute(
				snAccount,
				build_game_spawnPlayer_calldata(playerName),
				"duckhunter",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_game_updateGame_calldata = (points: number, kills: number): DojoCall => {
		return {
			contractName: "game",
			entrypoint: "update_game",
			calldata: [points, kills],
		};
	};

	const game_updateGame = async (snAccount: Account | AccountInterface, points: number, kills: number) => {
		try {
			return await provider.execute(
				snAccount,
				build_game_updateGame_calldata(points, kills),
				"duckhunter",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};



	return {
		game: {
			spawnPlayer: game_spawnPlayer,
			buildSpawnPlayerCalldata: build_game_spawnPlayer_calldata,
			updateGame: game_updateGame,
			buildUpdateGameCalldata: build_game_updateGame_calldata,
		},
	};
}
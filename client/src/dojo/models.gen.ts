import type { SchemaType as ISchemaType } from "@dojoengine/sdk";

// Type definition for `duckhunter::models::player::Player` struct
export interface Player {
	owner: string;
	kills: number;
	points: number;
	name: number;
	creation_day: number;
}

export interface SchemaType extends ISchemaType {
	duckhunter: {
		Player: Player,
	},
}
export const schema: SchemaType = {
	duckhunter: {
		Player: {
			owner: "",
			kills: 0,
			points: 0,
			name: 0,
			creation_day: 0,
		},
	},
};
export enum ModelsMapping {
	Player = 'duckhunter-Player',
}
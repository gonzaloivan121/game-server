import { Vector3 } from "@xloxlolex/vector-math";
import { UUID } from "crypto";

import { TeamID, GameConfig } from "./GameTypes";

/**
 * Interface representing a player in the game.
 *
 * @export
 * @interface Player
 */
export interface Player {
    /**
     * Unique identifier for the player.
     *
     * @type {UUID}
     */
    ID: UUID;

    /**
     * Current position of the player in the game world.
     *
     * @type {Vector3}
     */
    Position: Vector3;

    /**
     * Current velocity of the player.
     *
     * @type {Vector3}
     */
    Velocity: Vector3;

    /**
     * Team affiliation of the player.
     *
     * @type {TeamID}
     */
    Team: TeamID;

    /**
     * Current health of the player.
     *
     * @type {number}
     */
    Health: number;

    /**
     * Current score of the player.
     *
     * @type {number}
     */
    Score: number;

    /**
     * Indicates if the player is alive.
     *
     * @type {boolean}
     */
    IsAlive: boolean;

    /**
     * Number of kills made by the player.
     *
     * @type {number}
     */
    Kills: number;

    /**
     * Number of deaths of the player.
     *
     * @type {number}
     */
    Deaths: number;
}

/**
 * Creates a default player object with initial values.
 *
 * @export
 * @param {UUID} id - Unique identifier for the player.
 * @returns {Player} The default `Player` object.
 */
export function CreateDefaultPlayer(id: UUID): Player {
    return {
        ID: id,
        Position: new Vector3(),
        Velocity: new Vector3(),
        Team: TeamID.None,
        Health: GameConfig.MaxHealth,
        Score: 0,
        IsAlive: true,
        Kills: 0,
        Deaths: 0,
    };
}
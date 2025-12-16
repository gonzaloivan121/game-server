import { Vector3 } from "@xloxlolex/vector-math";
import { UUID } from "crypto";

/**
 * Enum for team identifiers.
 * 
 * @export
 * @enum {string}
 */
export enum TeamID {
    /**
     * No team.
     *
     * @type {string}
     */
    None = "NONE",

    /**
     * Red team.
     *
     * @type {string}
     */
    Red = "RED",

    /**
     * Blue team.
     *
     * @type {string}
     */
    Blue = "BLUE",
}

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
 * Interface representing a snapshot of the game state.
 * 
 * @export
 * @interface GameStateSnapshot
 */
export interface GameStateSnapshot {
    /**
     * Players in the game.
     *
     * @type {Player[]}
     * @memberof GameStateSnapshot
     */
    Players: Player[];

    /**
     * Scores for each team.
     *
     * @type {Record<TeamID, number>}
     * @memberof GameStateSnapshot
     */
    Scores: Record<TeamID, number>;

    /**
     * Timestamp of the snapshot.
     *
     * @type {number}
     * @memberof GameStateSnapshot
     */
    Timestamp: number;
}

/**
 * Interface for input payload data dealing with attacks.
 * 
 * @export
 * @interface AttackData
 */
export interface AttackData {
    TargetID: UUID;
    Damage: number;
}

/**
 * Configuration structure for the game rules.
 * 
 * @export
 * @interface GameConfig
 */
export interface GameConfig {
    /**
     * Maximum health for players.
     *
     * @type {number}
     * @memberof GameConfig
     */
    MaxHealth: number;

    /**
     * Respawn time in milliseconds.
     *
     * @type {number}
     * @memberof GameConfig
     */
    RespawnTime: number;

    /**
     * Points awarded per kill.
     *
     * @type {number}
     * @memberof GameConfig
     */
    PointsPerKill: number;

    /**
     * Score required to win the game.
     *
     * @type {number}
     * @memberof GameConfig
     */
    ScoreToWin: number;

    /**
     * Indicates if friendly fire is enabled.
     *
     * @type {boolean}
     * @memberof GameConfig
     */
    FriendlyFire: boolean;
}
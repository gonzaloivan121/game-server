/**
 * Enum for team identifiers.
 *
 * @export
 * @enum {number}
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
 * Interface for game configuration settings.
 *
 * @interface GameConfig
 */
interface GameConfig {
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
    WinScore: number;

    /**
     * Indicates if friendly fire is enabled.
     *
     * @type {boolean}
     * @memberof GameConfig
     */
    FriendlyFire: boolean;
}

export const GameConfig: GameConfig = {
    MaxHealth: 100,
    RespawnTime: 3000,
    PointsPerKill: 10,
    WinScore: 50,
    FriendlyFire: false,
};

import { Vector3 } from "@xloxlolex/vector-math";

import { UUID } from "crypto";

import { GameState } from "./GameState";

/**
 * Abstract base class for all Game Modes.
 * Defines the lifecycle and rule hooks that concrete modes must implement.
 *
 * @export
 * @abstract
 * @class GameMode
 */
export abstract class GameMode {
    /**
     * Reference to the `GameState` to manipulate data.
     *
     * @protected
     * @type {GameState}
     * @memberof GameMode
     */
    protected gameState!: GameState;

    /**
     * Flag to check whether the match has ended or not.
     *
     * @protected
     * @type {boolean}
     * @memberof GameMode
     */
    protected ended: boolean = false;

    /**
     * Creates an instance of `GameMode`.
     *
     * @param {GameState} state The `GameState` to be managed by this mode.
     * @memberof GameMode
     */
    constructor(state: GameState) {
        this.gameState = state;
    }

    /**
     * Called when a player connects.
     * Handles spawning and team assignment logic.
     *
     * @abstract
     * @param {UUID} playerId The unique identifier of the player.
     * @memberof GameMode
     */
    abstract OnPlayerJoin(playerId: UUID): void;

    /**
     * Called when a player disconnects.
     *
     * @abstract
     * @param {UUID} playerId The unique identifier of the player.
     * @memberof GameMode
     */
    abstract OnPlayerLeave(playerId: UUID): void;

    /**
     * Called every server tick.
     * Use this for timers, zone shrinkingm or winning conditions checks.
     *
     * @abstract
     * @param {number} ts The timestamp of the current tick.
     * @memberof GameMode
     */
    abstract OnUpdate(ts: number): void;

    /**
     * Validates and processes an attack between players.
     *
     * @abstract
     * @param {UUID} attackerId The unique identifier of the attacking player.
     * @param {UUID} targetId The unique identifier of the target player.
     * @param {number} damage The amount of damage to be dealt.
     * @returns {boolean} True if the attack was successful, false otherwise.
     * @memberof GameMode
     */
    abstract OnAttack(
        attackerId: UUID,
        targetId: UUID,
        damage: number
    ): boolean;

    /**
     * Processes the death of a player.
     *
     * @abstract
     * @param {UUID} attackerId The unique identifier of the player who caused the death.
     * @param {UUID} targetId The unique identifier of the player who died.
     * @memberof GameMode
     */
    protected abstract OnDeath(attackerId: UUID, targetId: UUID): void;

    /**
     * Processed the respawn of a player.
     *
     * @abstract
     * @param {UUID} playerId The unique identifier of the player who is respawning.
     * @memberof GameMode
     */
    protected abstract OnRespawn(playerId: UUID): void;

    /**
     * Helper to check if game over conditions are met.
     *
     * @protected
     * @abstract
     * @memberof GameMode
     */
    protected abstract CheckWinCondition(): void;

    /**
     * Helper to get the spawn position for a player.
     *
     * @protected
     * @abstract
     * @param {UUID} playerId The unique identifier of the player to get the spawn position for.
     * @returns {Vector3} The spawn position.
     * @memberof GameMode
     */
    protected abstract GetSpawnPosition(playerId: UUID): Vector3;
}
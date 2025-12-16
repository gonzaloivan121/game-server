import { Log } from "@prism-dev/nexus";
import { Vector3 } from "@xloxlolex/vector-math";
import { Player, CreateDefaultPlayer } from "./Player";
import { TeamID, GameConfig } from "./GameTypes";
import { UUID } from "crypto";

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
 * Class representing the overall game state.
 *
 * @export
 * @class GameState
 */
export class GameState {
    /**
     * Players in the game mapped by their UUID.
     *
     * @private
     * @type {Map<UUID, Player>}
     * @memberof GameState
     */
    private players: Map<UUID, Player> = new Map();

    /**
     * Scores for each team.
     *
     * @private
     * @type {Record<TeamID, number>}
     * @memberof GameState
     */
    private scores: Record<TeamID, number> = {
        [TeamID.None]: 0,
        [TeamID.Red]: 0,
        [TeamID.Blue]: 0,
    };

    /**
     * Adds a new player to the game state and assigns them to a team.
     * We balance teams by assigning the new player to the team with fewer players.
     *
     * @param {UUID} id The UUID of the player to add.
     * @returns {Player} The newly added player.
     * @memberof GameState
     */
    public AddPlayer(id: UUID): Player {
        const newPlayer = CreateDefaultPlayer(id);

        // Assign team based on current team sizes
        const redCount = this.GetPlayersByTeam(TeamID.Red).length;
        const blueCount = this.GetPlayersByTeam(TeamID.Blue).length;

        newPlayer.Team = redCount <= blueCount ? TeamID.Red : TeamID.Blue;

        // Initialize position to origin
        newPlayer.Position = new Vector3();

        this.players.set(id, newPlayer);
        Log.Info(
            `GameState::AddPlayer - Player ${id} joined Team ${newPlayer.Team}.`
        );

        return newPlayer;
    }

    /**
     * Removes a player from the game state.
     *
     * @param {UUID} id The UUID of the player to remove.
     * @memberof GameState
     */
    public RemovePlayer(id: UUID): void {
        this.players.delete(id);
        Log.Info(`GameState::RemovePlayer - Player ${id} left the game.`);
    }

    /**
     * Moves a player by a given delta.
     *
     * @param {UUID} id The UUID of the player to move.
     * @param {Vector3} delta The movement delta.
     * @memberof GameState
     */
    public MovePlayer(id: UUID, delta: Vector3): void {
        const player = this.players.get(id);

        if (player && player.IsAlive) {
            player.Position.Add(delta);
        }
    }

    /**
     * Applies damage from one player to another.
     *
     * @param {UUID} attackerId The UUID of the attacking player.
     * @param {UUID} targetId The UUID of the target player.
     * @param {number} damage The amount of damage to apply.
     * @memberof GameState
     */
    public ApplyDamage(attackerId: UUID, targetId: UUID, damage: number): void {
        const attacker = this.players.get(attackerId);
        const target = this.players.get(targetId);

        // Validate players and states
        if (!attacker || !target) {
            Log.Warning(
                `GameState::ApplyDamage - Invalid attacker (${attackerId}) or target (${targetId}).`
            );

            return;
        }

        // Prevent damage if either player is dead
        if (!attacker.IsAlive || !target.IsAlive) {
            Log.Warning(
                `GameState::ApplyDamage - Attacker (${attackerId}) or target (${targetId}) is dead.`
            );

            return;
        }

        // Prevent friendly fire if disabled
        if (!GameConfig.FriendlyFire && attacker.Team === target.Team) {
            Log.Warning(
                `GameState::ApplyDamage - Friendly fire is disabled. Attacker (${attackerId}) and target (${targetId}) are on the same team.`
            );

            return;
        }

        // Apply damage
        target.Health -= damage;

        Log.Info(
            `GameState::ApplyDamage - Player ${attackerId} dealt ${damage} damage to Player ${targetId}. Remaining Health: ${target.Health}`
        );

        // Check for death
        if (target.Health <= 0) {
            this.HandleDeath(attacker, target);
        }
    }

    /**
     * Handles the death of a player.
     *
     * @private
     * @param {Player} attacker The player who caused the death.
     * @param {Player} target The player who died.
     * @memberof GameState
     */
    private HandleDeath(attacker: Player, target: Player): void {
        // Update target state
        target.Health = 0;
        target.IsAlive = false;
        target.Deaths++;

        // Update attacker stats
        attacker.Kills++;

        // Update team scores
        this.scores[attacker.Team] += GameConfig.PointsPerKill;
        attacker.Score += GameConfig.PointsPerKill;

        Log.Info(
            `GameState::HandleDeath - Player ${attacker.ID} killed Player ${target.ID}.`
        );

        // Schedule respawn
        setTimeout(() => {
            this.RespawnPlayer(target.ID);
        }, GameConfig.RespawnTime);
    }

    /**
     * Respawns a player after death.
     *
     * @private
     * @param {UUID} playerId The UUID of the player to respawn.
     * @memberof GameState
     */
    private RespawnPlayer(playerId: UUID): void {
        const player = this.players.get(playerId);

        if (player) {
            player.Health = GameConfig.MaxHealth;
            player.IsAlive = true;
            player.Position = new Vector3();
            player.Velocity = new Vector3();

            Log.Info(
                `GameState::RespawnPlayer - Player ${playerId} has respawned.`
            );
        }
    }

    /**
     * Gets all players on a specific team.
     *
     * @private
     * @param {TeamID} team The team to filter players by.
     * @returns {Player[]} Array of players on the specified team.
     * @memberof GameState
     */
    private GetPlayersByTeam(team: TeamID): Player[] {
        return Array.from(this.players.values()).filter(
            (player) => player.Team === team
        );
    }

    /**
     * Gets a snapshot of the current game state.
     *
     * @returns {GameStateSnapshot} Snapshot of the current game state.
     * @memberof GameState
     */
    public GetSnapshot(): GameStateSnapshot {
        return {
            Players: Array.from(this.players.values()),
            Scores: this.scores,
            Timestamp: Date.now(),
        };
    }
}

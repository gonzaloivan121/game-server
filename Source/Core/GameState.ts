import { Log } from "@prism-dev/nexus";
import { Vector3 } from "@xloxlolex/vector-math";
import { UUID } from "crypto";
import { Player, TeamID, GameStateSnapshot } from "./Types/GameProtocol";

/**
 * Class representing the raw data of the game.
 * It is manipulated by the active GameMode.
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
     * Creates a new player and adds them to the game state.
     *
     * @param {UUID} id The UUID of the player.
     * @returns {Player} The created player object.
     * @memberof GameState
     */
    public CreatePlayer(id: UUID): Player {
        const player: Player = {
            ID: id,
            Position: new Vector3(),
            Velocity: new Vector3(),
            Team: TeamID.None,
            Health: 0,
            Score: 0,
            IsAlive: true,
            Kills: 0,
            Deaths: 0,
        };

        this.players.set(id, player);

        Log.Info(`GameState::CreatePlayer - Player ${id} joined the game.`);

        return player;
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
     * Retrieves a player by their UUID.
     *
     * @param {UUID} id The UUID of the player to retrieve.
     * @returns {Player | undefined} The player object or `undefined` if not found.
     * @memberof GameState
     */
    public GetPlayer(id: UUID): Player | undefined {
        return this.players.get(id);
    }

    /**
     * Gets all players in the game.
     *
     * @return {Player[]} Array of all players in the game.
     * @memberof GameState
     */
    public GetAllPlayers(): Player[] {
        return Array.from(this.players.values());
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

    public AddScore(team: TeamID, points: number): void {
        if (this.scores[team] === undefined) {
            Log.Warning(`GameState::AddScore - Invalid team ID: ${team}.`);
            return;
        }

        this.scores[team] += points;
    }

    public GetScore(team: TeamID): number {
        return this.scores[team] || 0;
    }

    public GetScores(): Record<TeamID, number> {
        return this.scores;
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

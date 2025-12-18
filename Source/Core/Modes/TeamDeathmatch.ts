import { Log } from "@prism-dev/nexus";
import { Vector3 } from "@xloxlolex/vector-math";

import { UUID } from "crypto";

import { GameMode } from "../GameMode";
import { TeamID, GameConfig } from "../Types/GameProtocol";

/**
 * Concrete implementation of the Team Deathmatch `GameMode`.
 *
 * @export
 * @class TeamDeathmatch
 * @extends {GameMode}
 */
export class TeamDeathmatch extends GameMode {
    /**
     * Configuration for the Team Deathmatch mode.
     *
     * @private
     * @type {GameConfig}
     * @memberof TeamDeathmatch
     */
    private config: GameConfig = {
        MaxHealth: 100,
        RespawnTime: 3000,
        PointsPerKill: 100,
        ScoreToWin: 100000,
        FriendlyFire: false,
    };

    /**
     * Pre-defined spawn points for each team.
     *
     * @private
     * @type {Record<TeamID, Vector3[]>}
     * @memberof TeamDeathmatch
     */
    private spawnPoints: Record<TeamID, Vector3[]> = {
        [TeamID.None]: [new Vector3()],
        [TeamID.Red]: [
            new Vector3(-10, 0, 0),
            new Vector3(-15, 0, 5),
            new Vector3(-10, 0, -5),
        ],
        [TeamID.Blue]: [
            new Vector3(10, 0, 0),
            new Vector3(15, 0, 5),
            new Vector3(10, 0, -5),
        ],
    };

    /**
     * Handles player joining the game.
     *
     * @param {UUID} playerId The UUID of the player joining.
     * @memberof TeamDeathmatch
     */
    OnPlayerJoin(playerId: UUID): void {
        const players = this.gameState.GetAllPlayers();

        const redCount = players.filter((p) => p.Team === TeamID.Red).length;
        const blueCount = players.filter((p) => p.Team === TeamID.Blue).length;

        const assignedTeam = redCount <= blueCount ? TeamID.Red : TeamID.Blue;

        const player = this.gameState.CreatePlayer(playerId);
        player.Team = assignedTeam;
        player.Health = this.config.MaxHealth;
        player.Position = this.GetSpawnPosition(player.ID);

        Log.Info(
            `TeamDeathmatch::OnPlayerJoin - Player ${player.ID} assigned to ${player.Team}`
        );
    }

    /**
     * Handles player leaving the game.
     *
     * @param {UUID} playerId The UUID of the player leaving.
     * @memberof TeamDeathmatch
     */
    OnPlayerLeave(playerId: UUID): void {
        this.gameState.RemovePlayer(playerId);
    }

    OnUpdate(ts: number): void {
        if (!this.ended) {
            this.CheckWinCondition();
        }
    }

    OnAttack(attackerId: UUID, targetId: UUID, damage: number): boolean {
        if (this.ended) {
            return false;
        }

        const attacker = this.gameState.GetPlayer(attackerId);
        const target = this.gameState.GetPlayer(targetId);

        // Validate attacker
        if (!attacker) {
            Log.Warning(
                `TeamDeathmatch::OnAttack - Invalid attacker: ${attackerId}`
            );

            return false;
        }

        // Validate target
        if (!target) {
            Log.Warning(
                `TeamDeathmatch::OnAttack - Invalid target: ${targetId}`
            );

            return false;
        }

        // Prevent attack if attacker is dead
        if (!attacker.IsAlive) {
            Log.Warning(
                `TeamDeathmatch::OnAttack - Attacker (${attackerId}) is dead and can't attack.`
            );

            return false;
        }

        if (!target.IsAlive) {
            Log.Warning(
                `TeamDeathmatch::OnAttack - Target (${targetId}) is already dead.`
            );

            return false;
        }

        // Prevent friendly fire if disabled
        if (!this.config.FriendlyFire && attacker.Team === target.Team) {
            Log.Warning(
                `TeamDeathmatch::OnAttack - Friendly fire is disabled. Attacker (${attackerId}) and target (${targetId}) are on the same team.`
            );

            return false;
        }

        // Apply damage
        target.Health -= damage;

        Log.Info(
            `TeamDeathmatch::OnAttack - Attacker (${attackerId}) dealt ${damage} damage to Target (${targetId}). Remaining Health: ${target.Health}.`
        );

        // Check for death
        if (target.Health <= 0) {
            this.OnDeath(attacker.ID, target.ID);
        }

        return true;
    }

    protected OnDeath(attackerId: UUID, targetId: UUID): void {
        if (this.ended) {
            return;
        }

        const attacker = this.gameState.GetPlayer(attackerId);
        const target = this.gameState.GetPlayer(targetId);

        if (!attacker || !target) {
            return;
        }

        target.IsAlive = false;
        target.Deaths++;
        attacker.Kills++;

        // Update Team Score in GameState
        this.gameState.AddScore(attacker.Team, this.config.PointsPerKill);

        Log.Info(
            `TeamDeathmatch::OnDeath - ${attacker.ID} killed ${target.ID}.`
        );

        Log.Info(`TeamDeathmatch::OnDeath - ${attacker.Team} team scores.`);

        // Schedule Respawn
        setTimeout(() => this.OnRespawn(target.ID), this.config.RespawnTime);
    }

    protected OnRespawn(playerId: UUID): void {
        if (this.ended) {
            return;
        }

        const player = this.gameState.GetPlayer(playerId);

        if (!player) {
            return;
        }

        // Reset Stats
        player.IsAlive = true;
        player.Health = this.config.MaxHealth;

        // Pick a new spawn position
        player.Position = this.GetSpawnPosition(player.ID);

        Log.Info(
            `TeamDeathmatch::OnRespawn - Player ${player.ID} respawned at [${player.Position.x}, ${player.Position.y}, ${player.Position.z}]`
        );
    }

    protected CheckWinCondition(): void {
        if (this.ended) {
            return;
        }

        const scores = this.gameState.GetScores();

        if (scores[TeamID.Red] >= this.config.ScoreToWin) {
            Log.Info("TeamDeathmatch::CheckWinCondition - RED TEAM WINS!");
        } else if (scores[TeamID.Blue] >= this.config.ScoreToWin) {
            Log.Info("TeamDeathmatch::CheckWinCondition - BLUE TEAM WINS!");
        }
    }

    protected GetSpawnPosition(playerId: UUID): Vector3 {
        if (this.ended) {
            return Vector3.zero;
        }

        const player = this.gameState.GetPlayer(playerId);

        if (!player) {
            return Vector3.zero;
        }

        const points = this.spawnPoints[player.Team];

        if (!points || points.length === 0) {
            return Vector3.zero;
        }

        const randomIndex = Math.floor(Math.random() * points.length);
        const point = points[randomIndex];

        return new Vector3(point.x, point.y, point.z);
    }
}

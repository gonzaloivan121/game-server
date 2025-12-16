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
    private config: GameConfig = {
        MaxHealth: 100,
        RespawnTime: 3000,
        PointsPerKill: 100,
        ScoreToWin: 100000,
        FriendlyFire: false,
    };

    OnPlayerJoin(playerId: UUID): void {
        const players = this.gameState.GetSnapshot().Players;
    }

    OnPlayerLeave(playerId: UUID): void {
        this.gameState.RemovePlayer(playerId);
    }

    OnUpdate(ts: number): void {
        this.CheckWinCondition();
    }

    HandleAttack(attackerId: UUID, targetId: UUID, damage: number): boolean {
        throw new Error("Method not implemented.");
    }

    protected CheckWinCondition(): void {
        const scores = this.gameState.GetSnapshot().Scores;
    }
}

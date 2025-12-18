import { Layer, Log, Event, EventHandler, ServiceLocator } from "@prism-dev/nexus";

import { NetworkService } from "../Services/NetworkService";

import { EventType } from "../Events/Types/EventType";
import { PlayerConnectedEvent } from "../Events/PlayerConnectedEvent";
import { PlayerDisconnectedEvent } from "../Events/PlayerDisconnectedEvent";
import { PlayerInputEvent } from "../Events/PlayerInputEvent";

import { GameState } from "../Core/GameState";
import { GameMode } from "../Core/GameMode";
import { TeamDeathmatch } from "../Core/Modes/TeamDeathmatch";

/**
 * The `GameServerLayer` class manages the game server logic,
 * including player connections, disconnections, input handling,
 * and world state updates.
 *
 * @export
 * @class GameServerLayer
 * @extends {Layer}
 */
export class GameServerLayer extends Layer {
    /**
     * The `NetworkService` instance used for network communication.
     *
     * @private
     * @type {NetworkService}
     * @memberof GameServerLayer
     */
    private networkService!: NetworkService;

    /**
     * The current state of the game world.
     *
     * @private
     * @type {GameState}
     * @memberof GameServerLayer
     */
    private gameState!: GameState;

    /**
     * The current game mode.
     *
     * @private
     * @type {GameMode}
     * @memberof GameServerLayer
     */
    private gameMode!: GameMode;

    /**
     * Time since the last world state snapshot was sent.
     *
     * @private
     * @type {number}
     * @memberof GameServerLayer
     */
    private timeSinceLastSnapshot: number = 0;

    /**
     * The rate at which world state snapshots are sent (in milliseconds).
     *
     * @private
     * @type {number}
     * @memberof GameServerLayer
     */
    private snapshotRate: number = 50;

    /**
     * Called when `GameServerLayer` is attached to the `LayerStack`.
     *
     * @memberof GameServerLayer
     */
    OnAttach(): void {
        Log.Info("GameServerLayer::OnAttach - Attaching GameServerLayer");

        // Initialize the Network Service
        this.networkService = ServiceLocator.Get(NetworkService);

        // Initialize the Game State
        this.gameState = new GameState();

        // Initialize the Game Mode (Injecting the state)
        // In the future, this will be dynamic based on a lobby vote
        // TODO: Implement lobby voting map and game mode.
        this.gameMode = new TeamDeathmatch(this.gameState);
    }

    /**
     * Called when `GameServerLayer` is detached from the `LayerStack`.
     *
     * @memberof GameServerLayer
     */
    OnDetach(): void {
        Log.Info("GameServerLayer::OnDetach - Detaching GameServerLayer");
    }

    /**
     * Called every `Application` tick with a Timestep.
     *
     * @param {number} ts The time step since the last update.
     * @memberof GameServerLayer
     */
    OnUpdate(ts: number): void {
        // Update Game Mode logic
        this.gameMode.OnUpdate(ts);

        // Network sync
        this.timeSinceLastSnapshot += ts;
        if (this.timeSinceLastSnapshot >= this.snapshotRate) {
            this.BroadcastState();
            this.timeSinceLastSnapshot = 0;
        }
    }

    /**
     * Called every time `GameServerLayer` receives an `Event`.
     *
     * @param {Event} event The `Event` received on `GameServerLayer`.
     * @memberof GameServerLayer
     */
    OnEvent(event: Event): void {
        Log.Info(
            `GameServerLayer::OnEvent - Received '${event.Name}' Event on GameServerLayer`
        );

        const handler = new EventHandler(event);

        // Handle Player Connections
        handler.Handle<PlayerConnectedEvent>(
            EventType.Custom.Server.PlayerConnected,
            this.OnPlayerConnected.bind(this)
        );

        // Handle Player Disconnections
        handler.Handle<PlayerDisconnectedEvent>(
            EventType.Custom.Server.PlayerDisconnected,
            this.OnPlayerDisconnected.bind(this)
        );

        // Handle Player Input Events
        handler.Handle<PlayerInputEvent>(
            EventType.Custom.Server.PlayerInput,
            this.OnPlayerInput.bind(this)
        );
    }

    /**
     * Handles player connection events.
     *
     * @private
     * @param {PlayerConnectedEvent} event The `PlayerConnectedEvent` to handle.
     * @returns {boolean} `true` if the event was consumed, `false` otherwise.
     * @memberof GameServerLayer
     */
    private OnPlayerConnected(event: PlayerConnectedEvent): boolean {
        const payload = event.Payload;

        // Add player to game mode
        this.gameMode.OnPlayerJoin(payload.PlayerID);

        Log.Info(
            `GameServerLayer::OnPlayerConnected - Player ${payload.PlayerID} connected.`
        );

        // Consume the event
        return true;
    }

    /**
     * Handles player disconnection events.
     *
     * @private
     * @param {PlayerDisconnectedEvent} event The `PlayerDisconnectionEvent` to handle.
     * @returns {boolean} `true` if the event was consumed, `false` otherwise.
     * @memberof GameServerLayer
     */
    private OnPlayerDisconnected(event: PlayerDisconnectedEvent): boolean {
        const payload = event.Payload;

        // Remove player from game mode
        this.gameMode.OnPlayerLeave(payload.PlayerID);

        Log.Info(
            `GameServerLayer::OnPlayerDisconnected - Player ${payload.PlayerID} disconnected`
        );

        // Consume the event
        return true;
    }

    /**
     * Handles player input events.
     *
     * @private
     * @param {PlayerInputEvent} event The `PlayerInputEvent` to handle.
     * @returns {boolean} `true` if the event was consumed, `false` otherwise.
     * @memberof GameServerLayer
     */
    private OnPlayerInput(event: PlayerInputEvent): boolean {
        const payload = event.Payload;

        if (payload.Action === "MOVE") {
            // Handle move action
            this.gameState.MovePlayer(payload.PlayerID, payload.Data.Position);
        } else if (payload.Action === "ATTACK") {
            // Handle attack action
            if (payload.Data.TargetID) {
                this.gameMode.OnAttack(
                    payload.PlayerID,
                    payload.Data.TargetID,
                    payload.Data.Damage || 10
                );
            }
        }

        // Consume the event
        return true;
    }

    /**
     * Broadcasts the current state to all connected clients.
     *
     * @private
     * @memberof GameServerLayer
     */
    private BroadcastState(): void {
        // Get the current game state snapshot
        const snapshot = this.gameState.GetSnapshot();

        // Broadcast the snapshot to all connected clients
        this.networkService.Broadcast({
            Type: "STATE_UPDATE",
            State: snapshot,
        });
    }
}
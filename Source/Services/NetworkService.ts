import { Service, Log, EventBus, ServiceLocator } from "@prism-dev/nexus";

import { WebSocketServer, WebSocket } from "ws";
import { randomUUID, UUID } from "crypto";

import { ConfigService } from "./ConfigService";

import {
    PlayerConnectedEvent,
    PlayerConnectedEventPayload,
} from "../Events/PlayerConnectedEvent";

import {
    PlayerDisconnectedEvent,
    PlayerDisconnectedEventPayload,
} from "../Events/PlayerDisconnectedEvent";

import {
    PlayerInputEvent,
    PlayerInputEventPayload,
} from "../Events/PlayerInputEvent";

/**
 * The `NetworkService` handles network communication using a `WebSocket`.
 * It manages player connections, disconnections, and input.
 *
 * @export
 * @class NetworkService
 * @extends {Service}
 */
export class NetworkService extends Service {
    /**
     * The `WebSocketServer` instance for handling connections.
     *
     * @private
     * @type {(WebSocketServer | null)}
     * @memberof NetworkService
     */
    private wss: WebSocketServer | null = null;

    /**
     * The host address for the `WebSocketServer`.
     *
     * @private
     * @type {string}
     * @memberof NetworkService
     */
    private host: string = "localhost";

    /**
     * The port on which the `WebSocketServer` listens.
     *
     * @private
     * @type {number}
     * @memberof NetworkService
     */
    private port: number = 3000;

    /**
     * The map of connected clients.
     *
     * @private
     * @type {Map<string, WebSocket>}
     * @memberof NetworkService
     */
    private clients: Map<string, WebSocket> = new Map();

    /**
     * The `ConfigService` instance for accessing configuration.
     *
     * @private
     * @type {ConfigService}
     * @memberof NetworkService
     */
    private configService!: ConfigService;

    /**
     * Creates an instance of `NetworkService`.
     *
     * @memberof NetworkService
     */
    constructor() {
        super();
    }

    /**
     * Initializes `NetworkService`.
     * This method is called by `app.InitializeServices()`.
     *
     * @returns {Promise<void>}
     * @memberof NetworkService
     */
    public async OnInitialize(): Promise<void> {
        Log.Info("NetworkService::OnInitialize - Initializing NetworkService");

        // Add your async initialization logic here
        this.configService = ServiceLocator.Get(ConfigService);

        this.host = this.configService.Get("HOST") || this.host;
        this.port = parseInt(
            this.configService.Get("PORT") || this.port.toString()
        );

        this.wss = new WebSocketServer({
            host: this.host,
            port: this.port,
        });

        Log.Info(
            `NetworkService::OnInitialize - WebSocket server started on ws://${this.host}:${this.port}`
        );

        this.wss.on("connection", (ws: WebSocket) => {
            const playerId = this.OnPlayerConnected(ws);

            ws.on("message", (message: string) => {
                this.OnPlayerMessage(playerId, message);
            });

            ws.on("close", () => {
                this.OnPlayerDisconnected(playerId);
            });
        });

        return Promise.resolve();
    }

    /**
     * Shuts down `NetworkService`.
     * This method is called by `app.Close()`.
     *
     * @returns {Promise<void>}
     * @memberof NetworkService
     */
    public async OnShutdown(): Promise<void> {
        Log.Info("NetworkService::OnShutdown - Shutting down NetworkService");

        // Add your async cleanup logic here
        this.wss?.close();
        this.clients.clear();

        return Promise.resolve();
    }

    /**
     * Handles new player connections and returns the assigned `PlayerID`.
     *
     * @private
     * @param {WebSocket} ws The connected `WebSocket`.
     * @returns {UUID} The assigned `PlayerID`.
     * @memberof NetworkService
     */
    private OnPlayerConnected(ws: WebSocket): UUID {
        const playerId = randomUUID();
        this.clients.set(playerId, ws);

        Log.Info(
            `NetworkService::OnPlayerConnected - Player connected: ${playerId}`
        );

        const playerConnectedEventPayload: PlayerConnectedEventPayload = {
            PlayerID: playerId,
            Socket: ws,
        };

        const playerConnectedEvent: PlayerConnectedEvent =
            new PlayerConnectedEvent(playerConnectedEventPayload);

        EventBus.Emit(playerConnectedEvent);

        const welcomePacket = {
            Type: "WELCOME",
            Data: {
                PlayerID: playerId,
                Message: "Welcome to Nexus Server",
                ServerTime: Date.now()
            },
        };

        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(welcomePacket));
        }

        return playerId;
    }

    /**
     * Handles player messages.
     *
     * @param {UUID} playerId The `PlayerID` of the sender.
     * @param {string} message The message sent by the player.
     * @memberof NetworkService
     */
    private OnPlayerMessage(playerId: UUID, message: string): void {
        Log.Info(
            `NetworkService::OnInitialize - Received message from ${playerId}: ${message}`
        );

        try {
            const parsed = JSON.parse(message);

            const playerInputEventPayload: PlayerInputEventPayload = {
                PlayerID: playerId,
                Action: parsed.Action,
                Data: parsed.Data,
            };

            const playerInputEvent: PlayerInputEvent = new PlayerInputEvent(
                playerInputEventPayload
            );

            EventBus.Emit(playerInputEvent);
        } catch (error) {
            Log.Error(
                `NetworkService::OnInitialize - Error parsing message from ${playerId}: ${error}`
            );
        }
    }

    /**
     * Handles player disconnections.
     *
     * @param {UUID} playerId The `PlayerID` of the disconnected player.
     * @memberof NetworkService
     */
    OnPlayerDisconnected(playerId: UUID): void {
        Log.Info(
            `NetworkService::OnInitialize - Player disconnected: ${playerId}`
        );

        this.clients.delete(playerId);

        const playerDisconnectedEventPayload: PlayerDisconnectedEventPayload = {
            PlayerID: playerId,
        };

        const playerDisconnectedEvent: PlayerDisconnectedEvent =
            new PlayerDisconnectedEvent(playerDisconnectedEventPayload);

        EventBus.Emit(playerDisconnectedEvent);
    }

    /**
     * Broadcasts data to all connected clients.
     *
     * @param {object} data The data to broadcast.
     * @memberof NetworkService
     */
    public Broadcast(data: object): void {
        const payload = JSON.stringify(data);

        for (const client of this.clients.values()) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(payload);
            }
        }
    }
}

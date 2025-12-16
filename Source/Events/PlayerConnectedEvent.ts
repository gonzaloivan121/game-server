import { Event, EventCategory } from "@prism-dev/nexus";

import { UUID } from "crypto";
import { WebSocket } from "ws";

// Import the EventType definitions.
// Adjust the import path as necessary based on your project structure.
import { EventType } from "./Types/EventType";

/**
 * Interface that holds the payload of the `PlayerConnectedEvent`.
 *
 * @export
 * @interface PlayerConnectedEventPayload
 */
export interface PlayerConnectedEventPayload {
    PlayerID: UUID;
    Socket: WebSocket;
}

/**
 * Your newly generated `PlayerConnectedEvent`.
 *
 * @export
 * @class PlayerConnectedEvent
 * @extends {Event}
 */
export class PlayerConnectedEvent extends Event {
    public readonly Name: string = "PlayerConnected";
    public readonly Type: string = EventType.Custom.Server.PlayerConnected;
    public readonly Category: EventCategory = EventCategory.Network;
    public readonly Payload: PlayerConnectedEventPayload;

    /**
     * Creates an instance of `PlayerConnectedEvent`.
     *
     * @param {PlayerConnectedEventPayload} payload The payload for `PlayerConnectedEvent`.
     * @memberof PlayerConnectedEvent
     */
    constructor(payload: PlayerConnectedEventPayload) {
        super();
        this.Payload = payload;
    }
}
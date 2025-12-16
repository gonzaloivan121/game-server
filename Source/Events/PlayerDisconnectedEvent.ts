import { Event, EventCategory } from "@prism-dev/nexus";

import { UUID } from "crypto";

// Import the EventType definitions.
// Adjust the import path as necessary based on your project structure.
import { EventType } from "./Types/EventType";

/**
 * Interface that holds the payload of the `PlayerDisconnectedEvent`.
 *
 * @export
 * @interface PlayerDisconnectedEventPayload
 */
export interface PlayerDisconnectedEventPayload {
    PlayerID: UUID;
}

/**
 * Your newly generated `PlayerDisconnectedEvent`.
 *
 * @export
 * @class PlayerDisconnectedEvent
 * @extends {Event}
 */
export class PlayerDisconnectedEvent extends Event {
    public readonly Name: string = "PlayerDisconnected";
    public readonly Type: string = EventType.Custom.Server.PlayerDisconnected;
    public readonly Category: EventCategory = EventCategory.Network;

    public readonly Payload: PlayerDisconnectedEventPayload;

    /**
     * Creates an instance of `PlayerDisconnectedEvent`.
     *
     * @param {PlayerDisconnectedEventPayload} payload The payload for `PlayerDisconnectedEvent`.
     * @memberof PlayerDisconnectedEvent
     */
    constructor(payload: PlayerDisconnectedEventPayload) {
        super();
        this.Payload = payload;
    }
}
import { Event, EventCategory } from "@prism-dev/nexus";

import { UUID } from "crypto";

// Import the EventType definitions.
// Adjust the import path as necessary based on your project structure.
import { EventType } from "./Types/EventType";

/**
 * Interface that holds the payload of the `PlayerInputEvent`.
 *
 * @export
 * @interface PlayerInputEventPayload
 */
export interface PlayerInputEventPayload {
    PlayerID: UUID;
    Action: string;
    Data: any;
}

/**
 * Your newly generated `PlayerInputEvent`.
 *
 * @export
 * @class PlayerInputEvent
 * @extends {Event}
 */
export class PlayerInputEvent extends Event {
    public readonly Name: string = "PlayerInput";
    public readonly Type: string = EventType.Custom.Server.PlayerInput;
    public readonly Category: EventCategory = EventCategory.Network | EventCategory.User;

    public readonly Payload: PlayerInputEventPayload;

    /**
     * Creates an instance of `PlayerInputEvent`.
     *
     * @param {PlayerInputEventPayload} payload The payload for `PlayerInputEvent`.
     * @memberof PlayerInputEvent
     */
    constructor(payload: PlayerInputEventPayload) {
        super();
        this.Payload = payload;
    }
}
/**
 * Defines the various `Event` types used in the `Application`.
 * Each `Event` type is represented as a string constant.
 *
 * This structure helps in maintaining consistency and avoiding typos
 * when referring to `Event` types throughout the codebase.
 *
 * We recommend using a nested object structure to categorize `Event` types
 * based on their context or domain.
 */
export const EventType = {
    /**
     * A default 'None' event, often used for initialization or placeholders.
     */
    None: "None",

    /**
     * Events related to the application lifecycle.
     */
    Application: {
        Started: "Application:Started",
        Stopped: "Application:Stopped",
        Initialized: "Application:Initialized",
        Shutdown: "Application:Shutdown",
        Error: "Application:Error",
    },

    /**
     * Events related to user actions.
     */
    User: {
        Registered: "User:Registered",
        LoggedIn: "User:LoggedIn",
        LoggedOut: "User:LoggedOut",
        ProfileUpdated: "User:ProfileUpdated",
    },

    /**
     * Events related to generic data operations.
     */
    Data: {
        Received: "Data:Received",
        Sent: "Data:Sent",
        Updated: "Data:Updated",
        Deleted: "Data:Deleted",
        Error: "Data:Error",
    },

    /**
     * Events specific to database interactions.
     */
    Database: {
        Connected: "Database:Connected",
        Disconnected: "Database:Disconnected",
        QuerySuccess: "Database:QuerySuccess",
        QueryFailed: "Database:QueryFailed",
    },

    /**
     * Events specific to network operations, like HTTP requests.
     */
    HTTP: {
        RequestReceived: "HTTP:RequestReceived",
        ResponseSent: "HTTP:ResponseSent",
        RequestFailed: "HTTP:RequestFailed",
    },

    /**
     * Events for real-time communication.
     */
    WebSocket: {
        ClientConnected: "WebSocket:ClientConnected",
        ClientDisconnected: "WebSocket:ClientDisconnected",
        MessageReceived: "WebSocket:MessageReceived",
        MessageSent: "WebSocket:MessageSent",
    },

    /**
     * A space for your own custom application events.
     *
     * @example
     * ```typescript
     * Custom: {
     *     OrderShipped: "Order:Shipped"
     * }
     * ```
     */
    Custom: {
        Server: {
            PlayerConnected: "Server:PlayerConnected",
            PlayerDisconnected: "Server:PlayerDisconnected",
            PlayerInput: "Server:PlayerInput",
        },
    },
};

import { UUID } from "crypto";
import { WebSocket } from "ws";

// Global configuration
const SERVER_URL = "ws://localhost:3000";

class BotClient {
    public id?: UUID;
    public ws: WebSocket;
    public name: string;

    private connectedPromise: Promise<void>;
    private ResolveConnection!: () => void;

    constructor(name: string) {
        this.name = name;
        this.ws = new WebSocket(SERVER_URL);

        this.connectedPromise = new Promise((resolve) => {
            this.ResolveConnection = resolve;
        });

        this.SetupEvents();
    }

    /**
     * Setup all Socket Events.
     *
     * @private
     * @memberof BotClient
     */
    private SetupEvents(): void {
        this.ws.on("error", this.OnClientError.bind(this));
        this.ws.on("open", this.OnClientConnected.bind(this));
        this.ws.on("message", this.OnClientMessage.bind(this));
        this.ws.on("close", this.OnClientDisconnected.bind(this));
    }

    /**
     * Method that fires when an Error happens.
     *
     * @private
     * @param {AggregateError} error
     * @memberof BotClient
     */
    private OnClientError(error: AggregateError): void {
        console.log(`[${this.name}] Error: ${error.errors}`);
    }

    /**
     * Method that fires when the Client has connected to the Server.
     *
     * @private
     * @memberof BotClient
     */
    private OnClientConnected(): void {
        console.log(`[${this.name}] Connected to the server.`);
    }

    /**
     * Method that fires when the Client has received a message.
     *
     * @private
     * @param {string} data The message data received.
     * @memberof BotClient
     */
    private OnClientMessage(data: string): void {
        try {
            const message = JSON.parse(data.toString());

            if (message.Type === "WELCOME") {
                this.id = message.Data.PlayerID;
                console.log(`[${this.name}] Authenticated. ID: ${this.id}\n`);
                this.ResolveConnection();
            }

            if (message.Type === "STATE_UPDATE") {
            }
        } catch (error: any) {
            console.error(
                `[${this.name}] Error parsing message: ${error.message}`
            );
        }
    }

    /**
     * Method that fires when the Client has been disconnected from the Server.
     *
     * @private
     * @memberof BotClient
     */
    private OnClientDisconnected(): void {
        console.log(`[${this.name}] Disconnected from the server.`);
    }

    /**
     * Wait until the bot is fully connected and authenticated.
     *
     * @return {{Promise<void>}} The connected promise.
     * @memberof BotClient
     */
    public async WaitForConnection(): Promise<void> {
        return this.connectedPromise;
    }

    /**
     * Performs an attack.
     *
     * @param {UUID} targetId The unique identifier for the target.
     * @param {number} [damage=10] The damage to be donde. 10 by default.
     * @memberof BotClient
     */
    public Attack(targetId: UUID, damage: number = 10): void {
        this.Send("ATTACK", {
            TargetID: targetId,
            Damage: damage,
        });
    }

    /**
     * Performs movement.
     *
     * @param {number} x The `x` position.
     * @param {number} y The `y` position.
     * @param {number} z The `z` position.
     * @memberof BotClient
     */
    public Move(x: number, y: number, z: number): void {
        this.Send("MOVE", {
            Position: { x, y, z },
        });
    }

    /**
     * Disconnects from the Server.
     *
     * @memberof BotClient
     */
    public Disconnect(): void {
        this.ws.close();
    }

    /**
     * Sends data to the Server.
     *
     * @private
     * @param {string} action The action to perform.
     * @param {any} data The data to be sent.
     * @memberof BotClient
     */
    private Send(action: string, data: any) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(
                JSON.stringify({
                    Action: action,
                    Data: data,
                })
            );
        }
    }
}

async function Scenario_1v1_Deathmatch() {
    console.log("--- STARTING SCENARIO: 1v1 DEATHMATCH ---");

    const bot1 = new BotClient("Killer");
    const bot2 = new BotClient("Victim");

    await Promise.all([
        bot1.WaitForConnection(),
        bot2.WaitForConnection()
    ]);

    if (!bot1.id || !bot2.id) {
        return;
    }

    console.log("\n--- BOTS READY. FIGHT! ---");

    let attacks = 0;
    const interval = setInterval(() => {
        attacks++;
        console.log(`Attack Round #${attacks}`);

        // Bot 1 attacks Bot 2
        bot1.Attack(bot2.id!, 35);

        if (attacks >= 4) {
            clearInterval(interval);
            console.log("\n--- SCENARIO FINISHED ---");
            bot1.Disconnect();
            bot2.Disconnect();
        }
    }, 1000);
}

(async () => {
    await Scenario_1v1_Deathmatch();
})();
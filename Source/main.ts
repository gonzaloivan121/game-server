// Import necessary modules and services from Nexus.
import {
    Application,
    ApplicationSpecification,
    Log
} from "@prism-dev/nexus";

// Import custom layers.
import { GameServerLayer } from "./Layers/GameServerLayer";

// Import custom services.
import { ConfigService } from "./Services/ConfigService";
import { NetworkService } from "./Services/NetworkService";

/**
 * Main entry point for the API application.
 * We use an Immediately Invoked Function Expression (IIFE)
 * to allow for async initialization if needed.
 *
 * @remarks
 */
(async () => {
    // Create the ApplicationSpecification.
    const specification: ApplicationSpecification = {
        Name: "GameServer",
    };

    // Create the Application instance.
    const app: Application = new Application(specification);

    try {
        // Here we could register Services if needed.
        app.RegisterService(ConfigService, new ConfigService());
        app.RegisterService(NetworkService, new NetworkService());
    
        // Here we would initialize Services if any were registered.
        await app.InitializeServices();
    } catch (error: any) {
        Log.Fatal(`main - Failed to initialize services: ${error.message}`);
        process.exit(1);
    }

    // Push Layers onto the Stack.
    app.PushLayer(new GameServerLayer());

    // Run the Application's main loop.
    app.Run();

    // Add a listener for 'SIGINT' (Signal Interrupt, e.g., Ctrl+C)
    // to gracefully shut down the application.
    process.on("SIGINT", () => {
        Log.Info("main - SIGINT received. Closing application...");
        app.Close();
    });

    // We can also catch unhandled promise rejections.
    process.on("unhandledRejection", (reason, promise) => {
        Log.Fatal(`main - Unhandled Rejection at: ${promise}, reason: ${reason}`);
        app.Close();
    });
})();
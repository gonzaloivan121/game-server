import { Service, Log } from "@prism-dev/nexus";
import * as dotenv from "dotenv";

/**
 * A service for managing and providing access to
 * environment variables loaded from a `.env` file.
 *
 * @export
 * @class ConfigService
 * @extends {Service}
 */
export class ConfigService extends Service {
    /**
     * Stores the loaded environment variables.
     *
     * @private
     * @type {dotenv.DotenvParseOutput}
     * @memberof ConfigService
     */
    private config: dotenv.DotenvParseOutput = {};

    /**
     * Creates an instance of `ConfigService`.
     *
     * @memberof ConfigService
     */
    constructor() {
        super();
    }

    /**
     * Initializes `ConfigService` by loading the `.env` file.
     * This method is called by `app.InitializeServices()`.
     *
     * @returns {Promise<void>}
     * @memberof ConfigService
     */
    public async OnInitialize(): Promise<void> {
        Log.Info("ConfigService::OnInitialize - Initializing ConfigService");

        // Add your async initialization logic here
        Log.Info("ConfigService::OnInitialize - Starting to load .env file");

        const result = dotenv.config({
            quiet: true,
        });

        if (result.error) {
            Log.Error(
                `ConfigService::OnInitialize - Failed to load .env file: ${result.error}`
            );
            return Promise.reject();
        }

        if (result.parsed) {
            Log.Info(
                "ConfigService::OnInitialize - .env file loaded successfully."
            );
            this.config = result.parsed;
        }

        return Promise.resolve();
    }

    /**
     * No cleanup needed for dotenv.
     *
     * Shuts down `ConfigService`.
     * This method is called by `app.Close()`.
     *
     * @returns {Promise<void>}
     * @memberof ConfigService
     */
    public async OnShutdown(): Promise<void> {
        Log.Info("ConfigService::OnShutdown - Shutting down ConfigService");

        // Add your async cleanup logic here

        return Promise.resolve();
    }

    /**
     * Gets a configuration value by its key.
     *
     * @param {string} key The key of the environment variable.
     * @returns {(string | undefined)} The value of the environment variable, or `undefined` if not found.
     * @memberof ConfigService
     */
    public Get(key: string): string | undefined {
        return this.config[key] || process.env[key];
    }
}

import {
  AgentRuntime,
  Character,
  ModelProviderName,
  CacheStore,
} from "@elizaos/core";
import { EvmPlugin } from "@elizaos/plugin-evm";
import { SqlDatabaseAdapter } from "@elizaos/plugin-sql";
import { DiscordClientInterface } from "@elizaos/client-discord";
import { defiManagerCharacter } from "./characters/defi-manager.js";
import { defiPortfolioPlugin } from "./plugins/index.js";

class DefiPortfolioAgent {
  private runtime?: AgentRuntime;

  async initialize() {
    try {
      console.log("🚀 Initializing DeFi Portfolio Agent...");

      // Validate environment
      this.validateEnvironment();

      // Create runtime with character and plugins
      this.runtime = new AgentRuntime({
        character: defiManagerCharacter,
        modelProvider: ModelProviderName.OPENAI,
        plugins: [EvmPlugin, defiPortfolioPlugin],
        databaseAdapter: new SqlDatabaseAdapter({
          connectionString: process.env.DATABASE_URL || "sqlite://./agent.db",
        }),
        token: process.env.OPENAI_API_KEY!,
        cacheStore: CacheStore.DATABASE,
      });

      // Initialize runtime
      await this.runtime.initialize();

      // Start clients
      await this.startClients();

      console.log("✅ DeFi Portfolio Agent is ready!");
    } catch (error) {
      console.error("❌ Failed to initialize agent:", error);
      process.exit(1);
    }
  }

  private validateEnvironment() {
    const required = ["OPENAI_API_KEY", "EVM_PROVIDER_URL", "EVM_PRIVATE_KEY"];
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}`,
      );
    }
  }

  private async startClients() {
    if (!this.runtime) throw new Error("Runtime not initialized");

    // Discord client
    if (process.env.DISCORD_API_TOKEN) {
      const discordClient = new DiscordClientInterface();
      await discordClient.start(this.runtime);
      console.log("✅ Discord client started");
    }

    // Add other clients as needed
  }
}

// Start the agent
const agent = new DefiPortfolioAgent();
agent.initialize();

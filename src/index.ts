import { AgentRuntime, ModelProviderName } from "@elizaos/core";
import { evmPlugin } from "@elizaos/plugin-evm";
import { DiscordClientInterface } from "@elizaos/client-discord";
import { defiManagerCharacter } from "./characters/defi-manager";

class DefiPortfolioAgent {
  private runtime?: AgentRuntime;

  async initialize() {
    try {
      console.log("🚀 Initializing DeFi Portfolio Agent...");

      this.validateEnvironment();

      this.runtime = new AgentRuntime({
        character: defiManagerCharacter,
        modelProvider: ModelProviderName.OPENAI,
        plugins: [evmPlugin],
        token: process.env.OPENAI_API_KEY!,
      });

      await this.runtime.initialize();
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

    // Correct way: Use static start method, not constructor
    if (process.env.DISCORD_API_TOKEN) {
      const discordClient = await DiscordClientInterface.start(this.runtime);
      console.log("✅ Discord client started");
    }
  }
}

const agent = new DefiPortfolioAgent();
agent.initialize();

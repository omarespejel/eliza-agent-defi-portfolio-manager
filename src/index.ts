import { AgentRuntime, ModelProviderName } from "@elizaos/core";
import { evmPlugin } from "@elizaos/plugin-evm";
import { DiscordClientInterface } from "@elizaos/client-discord";
import { defiManagerCharacter } from "./characters/defi-manager.js";
import { environmentManager } from "./config/environment.js";
import { NetworkType } from "./config/networks.js";

class DefiPortfolioAgent {
  private runtime?: AgentRuntime;

  async initialize() {
    try {
      console.log("🚀 Initializing DeFi Portfolio Agent...");

      // Load and validate environment configuration
      const config = environmentManager.getConfig();
      const networkConfig = environmentManager.getNetworkConfig();

      // Log configuration (with sensitive data masked)
      environmentManager.logConfiguration();

      // Security checks for mainnet
      if (environmentManager.isMainnet()) {
        console.log("🔒 MAINNET MODE - Enhanced security checks enabled");
        this.performMainnetSecurityChecks();
      }

      this.runtime = new AgentRuntime({
        character: defiManagerCharacter,
        modelProvider: ModelProviderName.OPENAI,
        plugins: [evmPlugin],
        token: config.openaiApiKey,
      });

      await this.runtime.initialize();
      await this.startClients();

      console.log(`✅ DeFi Portfolio Agent is ready on ${networkConfig.name}!`);
    } catch (error) {
      console.error("❌ Failed to initialize agent:", error);
      process.exit(1);
    }
  }

  private performMainnetSecurityChecks() {
    const config = environmentManager.getConfig();

    // Verify mainnet private key is present
    if (!config.ethereumPrivateKey) {
      throw new Error(
        "🚨 Ethereum mainnet private key required for mainnet operations",
      );
    }

    // Warn about transaction limits
    console.log(`💰 Transaction limit: ${config.maxTransactionValue} ETH`);
    console.log(`✅ Confirmation required: ${config.requireConfirmation}`);

    // Additional mainnet warnings
    console.log("⚠️  MAINNET WARNING: Real funds at risk!");
    console.log("⚠️  Double-check all transactions before execution");
    console.log("⚠️  Monitor your accounts for unauthorized activity");
  }

  private async startClients() {
    if (!this.runtime) throw new Error("Runtime not initialized");

    const config = environmentManager.getConfig();

    // Start Discord client if configured
    if (config.discordApiToken) {
      try {
        const discordClient = await DiscordClientInterface.start(this.runtime);
        console.log("✅ Discord client started");
      } catch (error) {
        console.error("❌ Failed to start Discord client:", error);
        // Don't exit - Discord is optional
      }
    } else {
      console.log("ℹ️  Discord client not configured (optional)");
    }
  }
}

const agent = new DefiPortfolioAgent();
agent.initialize();

import { AgentRuntime, ModelProviderName } from "@elizaos/core";
import { evmPlugin } from "@elizaos/plugin-evm";
import { DiscordClientInterface } from "@elizaos/client-discord";
import { defiManagerCharacter } from "./characters/defi-manager.js";
import { environmentManager } from "./config/environment.js";
import { NetworkType } from "./config/networks.js";
import { PostgresDatabaseAdapter } from "@elizaos/adapter-postgres";
import { CLIInterface } from "./cli/interactive.js";
import {
  checkPortfolioAction,
  getEthPriceAction,
  analyzeRiskAction,
} from "./actions/defi-actions.js";
import fs from "node:fs";

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

      // Initialize database adapter (PostgreSQL to avoid better-sqlite3 issues)
      const databaseAdapter = new PostgresDatabaseAdapter({
        connectionString:
          process.env.POSTGRES_URL || "postgresql://localhost:5432/eliza_agent",
        parseInputs: true,
      });
      await databaseAdapter.init();

      this.runtime = new AgentRuntime({
        databaseAdapter,
        character: defiManagerCharacter,
        modelProvider: ModelProviderName.OPENAI,
        plugins: [evmPlugin],
        token: config.openaiApiKey,
      });

      await this.runtime.initialize();

      // Register DeFi actions
      this.runtime.registerAction(checkPortfolioAction);
      this.runtime.registerAction(getEthPriceAction);
      this.runtime.registerAction(analyzeRiskAction);

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

    // Start CLI interface instead of Discord
    console.log("🖥️  Starting CLI interface...");
    try {
      const cliInterface = new CLIInterface(this.runtime);
      await cliInterface.start();
    } catch (error) {
      console.error("❌ Failed to start CLI interface:", error);
      console.log("ℹ️  You can still interact with the agent programmatically");
    }

    // Discord client is disabled for this implementation
    console.log("ℹ️  Discord client disabled - using CLI interface instead");
  }
}

const agent = new DefiPortfolioAgent();
agent.initialize();

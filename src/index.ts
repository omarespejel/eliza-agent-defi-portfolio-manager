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
      console.log("Initializing DeFi Portfolio Agent...");

      const config = environmentManager.getConfig();
      const networkConfig = environmentManager.getNetworkConfig();

      environmentManager.logConfiguration();

      if (environmentManager.isMainnet()) {
        console.log("MAINNET MODE - Enhanced security checks enabled");
        this.performMainnetSecurityChecks();
      }

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

      this.runtime.registerAction(checkPortfolioAction);
      this.runtime.registerAction(getEthPriceAction);
      this.runtime.registerAction(analyzeRiskAction);

      await this.startClients();

      console.log(`DeFi Portfolio Agent is ready on ${networkConfig.name}!`);
    } catch (error) {
      console.error("Failed to initialize agent:", error);
      process.exit(1);
    }
  }

  private performMainnetSecurityChecks() {
    const config = environmentManager.getConfig();

    if (!config.ethereumPrivateKey) {
      throw new Error(
        "Ethereum mainnet private key required for mainnet operations",
      );
    }

    console.log(`Transaction limit: ${config.maxTransactionValue} ETH`);
    console.log(`Confirmation required: ${config.requireConfirmation}`);

    console.log("MAINNET WARNING: Real funds at risk!");
    console.log("Double-check all transactions before execution");
    console.log("Monitor your accounts for unauthorized activity");
  }

  private async startClients() {
    if (!this.runtime) throw new Error("Runtime not initialized");

    const config = environmentManager.getConfig();

    console.log("Starting CLI interface...");
    try {
      const cliInterface = new CLIInterface(this.runtime);
      await cliInterface.start();
    } catch (error) {
      console.error("Failed to start CLI interface:", error);
      console.log("You can still interact with the agent programmatically");
    }

    console.log("Discord client disabled - using CLI interface instead");
  }
}

const agent = new DefiPortfolioAgent();
agent.initialize();

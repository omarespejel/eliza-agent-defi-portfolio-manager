import { AgentRuntime, Character, ModelProviderName } from "@elizaos/core";
import { EvmPlugin } from "@elizaos/plugin-evm";
import { DiscordClientInterface } from "@elizaos/client-discord";
import { defiManagerCharacter } from "../characters/defi-manager.character.json";

// Load environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is required");
  process.exit(1);
}

async function startAgent() {
  try {
    console.log("🚀 Starting DeFi Portfolio Agent...");
    
    // Create agent runtime
    const runtime = new AgentRuntime({
      character: defiManagerCharacter as Character,
      modelProvider: ModelProviderName.OPENAI,
      plugins: [EvmPlugin],
      databaseAdapter: new SqliteDatabaseAdapter("./agent.db"),
      token: process.env.OPENAI_API_KEY!,
    });

    // Initialize Discord client if configured
    if (process.env.DISCORD_API_TOKEN) {
      const discordClient = new DiscordClientInterface();
      await discordClient.start(runtime);
      console.log("✅ Discord client started");
    }

    console.log("✅ DeFi Portfolio Agent is ready!");
    
  } catch (error) {
    console.error("❌ Failed to start agent:", error);
    process.exit(1);
  }
}

startAgent();

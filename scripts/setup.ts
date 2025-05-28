#!/usr/bin/env bun

import { existsSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";
import { NetworkType } from "../src/config/networks.js";

interface SetupOptions {
  network?: NetworkType;
  force?: boolean;
}

function main() {
  console.log("DeFi Portfolio Agent - Setup Wizard");
  console.log("===================================\n");

  const args = process.argv.slice(2);
  const options: SetupOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--network" && i + 1 < args.length) {
      options.network = args[i + 1] as NetworkType;
      i++;
    } else if (arg === "--force") {
      options.force = true;
    }
  }

  try {
    setupEnvironment(options);
    console.log("\nSetup completed successfully!");
    console.log("\nNext steps:");
    console.log(
      "1. Edit your .env file with your actual API keys and private keys",
    );
    console.log("2. Run 'bun run network-status' to verify your configuration");
    console.log("3. Start the agent with 'bun run dev' or 'bun run start'");
  } catch (error) {
    console.error("Setup failed:", error);
    process.exit(1);
  }
}

function setupEnvironment(options: SetupOptions) {
  const envPath = ".env";
  const envExamplePath = "env.example";

  if (existsSync(envPath) && !options.force) {
    console.log(".env file already exists. Use --force to overwrite.");
    return;
  }

  if (!existsSync(envExamplePath)) {
    console.error(
      "env.example file not found. Please ensure it exists in the project root.",
    );
    process.exit(1);
  }

  let envContent = readFileSync(envExamplePath, "utf-8");

  if (options.network) {
    console.log(`Setting network to: ${options.network}`);
    envContent = envContent.replace(
      /^NETWORK=.*$/m,
      `NETWORK=${options.network}`,
    );
  }

  writeFileSync(envPath, envContent);
  console.log(`Created .env file from template`);

  const network = options.network || NetworkType.TESTNET;
  showNetworkSetupInstructions(network);
}

function showNetworkSetupInstructions(network: NetworkType) {
  console.log(`\n${network.toUpperCase()} Setup Instructions:`);
  console.log("=" + "=".repeat(network.length + 20));

  switch (network) {
    case NetworkType.TESTNET:
      console.log("RECOMMENDED for development");
      console.log("");
      console.log("1. Get testnet ETH from a faucet:");
      console.log("   https://sepoliafaucet.com/");
      console.log("   https://faucet.quicknode.com/ethereum/sepolia");
      console.log("");
      console.log("2. Set ETHEREUM_PRIVATE_KEY_TESTNET in .env");
      console.log("   (Your Sepolia testnet account private key)");
      console.log("");
      console.log("3. Set your OPENAI_API_KEY in .env");
      console.log("");
      console.log("4. Optional: Set INFURA_PROJECT_ID for alternative RPC");
      console.log("");
      console.log("Why testnet is recommended:");
      console.log("- Real network conditions that mimic mainnet");
      console.log("- Authentic blockchain environment");
      console.log("- Persistent network with long block history");
      console.log("- Multi-user testing environment");
      console.log("");
      console.log("Security features enabled by default:");
      console.log("- Conservative transaction limits (0.1 ETH)");
      console.log("- Transaction confirmation required");
      console.log("- Daily spending limits (1.0 ETH)");
      console.log("- Gas price protection (50 gwei max)");
      console.log("- Transaction logging enabled");
      break;

    case NetworkType.MAINNET:
      console.log("MAINNET SETUP - REAL FUNDS AT RISK!");
      console.log("");
      console.log("1. Set ETHEREUM_PRIVATE_KEY_MAINNET in .env");
      console.log("   Use a secure private key with real ETH");
      console.log("");
      console.log("2. Set your OPENAI_API_KEY in .env");
      console.log("");
      console.log("3. REQUIRED: Set INFURA_PROJECT_ID or ALCHEMY_API_KEY");
      console.log("   (Don't rely on public RPC endpoints for mainnet)");
      console.log("");
      console.log("4. Consider setting MAX_TRANSACTION_VALUE to limit risk");
      console.log("");
      console.log("5. Keep REQUIRE_CONFIRMATION=true for safety");
      console.log("");
      console.log("SECURITY REMINDERS:");
      console.log("- Never commit your .env file to version control");
      console.log("- Use a dedicated wallet for the agent");
      console.log("- Start with small amounts to test");
      console.log("- Monitor your account regularly");
      console.log("- Consider using a hardware wallet for mainnet");
      break;
  }

  console.log("\nGeneral Tips:");
  console.log("- Copy env.example to .env and fill in your values");
  console.log("- Use different private keys for each network");
  console.log("- Keep your API keys secure and rotate them regularly");
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log("Usage: bun run setup [options]");
  console.log("");
  console.log("Options:");
  console.log("  --network <testnet|mainnet>         Set the target network");
  console.log(
    "  --force                             Overwrite existing .env file",
  );
  console.log("  --help, -h                          Show this help message");
  console.log("");
  console.log("Examples:");
  console.log(
    "  bun run setup                       # Setup with testnet (default)",
  );
  console.log("  bun run setup --network testnet     # Setup for testnet");
  console.log("  bun run setup --network mainnet     # Setup for mainnet");
  console.log(
    "  bun run setup --force               # Overwrite existing .env",
  );
  process.exit(0);
}

main();

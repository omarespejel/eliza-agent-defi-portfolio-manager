#!/usr/bin/env bun

import { NetworkSwitcher } from "../src/utils/network-switcher.js";
import { NetworkType } from "../src/config/networks.js";

function main() {
  console.log("🔍 DeFi Portfolio Agent - Network Status Check");
  console.log("===============================================\n");

  try {
    // Show current network status
    NetworkSwitcher.logNetworkStatus();

    // Validate setup
    const isValid = NetworkSwitcher.validateNetworkSetup();

    if (!isValid) {
      console.log("\n💡 Suggestions:");
      console.log("- Check your .env file configuration");
      console.log("- Ensure all required environment variables are set");
      console.log("- Verify your private keys are correctly formatted");
      process.exit(1);
    }

    // Show switch instructions for other networks
    const currentNetwork = NetworkSwitcher.getCurrentNetwork();
    const otherNetworks = Object.values(NetworkType).filter(
      (n) => n !== currentNetwork,
    );

    console.log("🔄 To switch networks:");
    console.log("======================");

    otherNetworks.forEach((network) => {
      console.log(`\n📍 Switch to ${network.toUpperCase()}:`);
      const instructions =
        NetworkSwitcher.getNetworkSwitchInstructions(network);
      instructions.forEach((instruction) => console.log(`  ${instruction}`));
    });
  } catch (error) {
    console.error("❌ Error checking network status:", error);
    process.exit(1);
  }
}

main();

#!/usr/bin/env bun

import { NetworkSwitcher } from "../src/utils/network-switcher.js";
import { NetworkType } from "../src/config/networks.js";

function main() {
  console.log("DeFi Portfolio Agent - Network Status Check");
  console.log("===========================================\n");

  try {
    NetworkSwitcher.logNetworkStatus();

    const isValid = NetworkSwitcher.validateNetworkSetup();

    if (!isValid) {
      console.log("\nSuggestions:");
      console.log("- Check your .env file configuration");
      console.log("- Ensure all required environment variables are set");
      console.log("- Verify your private keys are correctly formatted");
      process.exit(1);
    }

    const currentNetwork = NetworkSwitcher.getCurrentNetwork();
    const otherNetworks = Object.values(NetworkType).filter(
      (n) => n !== currentNetwork,
    );

    console.log("To switch networks:");
    console.log("===================");

    otherNetworks.forEach((network) => {
      console.log(`\nSwitch to ${network.toUpperCase()}:`);
      const instructions =
        NetworkSwitcher.getNetworkSwitchInstructions(network);
      instructions.forEach((instruction) => console.log(`  ${instruction}`));
    });
  } catch (error) {
    console.error("Error checking network status:", error);
    process.exit(1);
  }
}

main();

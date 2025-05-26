import { NetworkType, getNetworkConfig } from "../config/networks.js";
import { environmentManager } from "../config/environment.js";

export class NetworkSwitcher {
  static getCurrentNetwork(): NetworkType {
    return environmentManager.getNetwork();
  }

  static getCurrentNetworkConfig() {
    return environmentManager.getNetworkConfig();
  }

  static isMainnet(): boolean {
    return environmentManager.isMainnet();
  }

  static isTestnet(): boolean {
    return environmentManager.isTestnet();
  }

  static getNetworkStatus() {
    const network = this.getCurrentNetwork();
    const config = this.getCurrentNetworkConfig();
    const envConfig = environmentManager.getConfig();

    return {
      network,
      config,
      hasPrivateKey: !!envConfig.ethereumPrivateKey,
      rpcUrl: envConfig.ethereumRpcUrl,
      explorerUrl: config.explorerUrl,
      isMainnet: this.isMainnet(),
      isTestnet: this.isTestnet(),
      securityLevel: this.getSecurityLevel(),
      warnings: this.getNetworkWarnings(),
    };
  }

  static getSecurityLevel(): "LOW" | "MEDIUM" | "HIGH" | "MAXIMUM" {
    return environmentManager.getSecurityLevel();
  }

  static getNetworkWarnings(): string[] {
    const warnings: string[] = [];
    const network = this.getCurrentNetwork();
    const envConfig = environmentManager.getConfig();

    if (network === NetworkType.MAINNET) {
      warnings.push("🚨 MAINNET: Real funds at risk!");

      if (!envConfig.enableMainnetProtection) {
        warnings.push("⚠️  Mainnet protection disabled - HIGH RISK!");
      }

      if (!envConfig.requireConfirmation) {
        warnings.push("⚠️  Transaction confirmation disabled");
      }

      if (!envConfig.ethereumPrivateKey) {
        warnings.push("❌ No mainnet private key configured");
      }
    }

    if (network === NetworkType.DEVNET) {
      warnings.push("ℹ️  Using local devnet - ensure it's running");
    }

    return warnings;
  }

  static logNetworkStatus(): void {
    const status = this.getNetworkStatus();

    console.log("\n🌐 Network Status:");
    console.log("==================");
    console.log(`Network: ${status.config.name} (${status.network})`);
    console.log(`Chain ID: ${status.config.chainId}`);
    console.log(`RPC URL: ${status.rpcUrl}`);
    console.log(`Explorer: ${status.explorerUrl}`);
    console.log(`Security Level: ${status.securityLevel}`);
    console.log(
      `Private Key: ${status.hasPrivateKey ? "✅ Configured" : "❌ Missing"}`,
    );

    if (status.warnings.length > 0) {
      console.log("\n⚠️  Warnings:");
      status.warnings.forEach((warning) => console.log(`  ${warning}`));
    }

    console.log("==================\n");
  }

  static validateNetworkSetup(): boolean {
    const status = this.getNetworkStatus();
    const errors: string[] = [];

    // Check for required private key on mainnet
    if (status.isMainnet && !status.hasPrivateKey) {
      errors.push("Mainnet private key required");
    }

    // Check RPC URL
    if (!status.rpcUrl) {
      errors.push("RPC URL not configured");
    }

    if (errors.length > 0) {
      console.error("❌ Network setup validation failed:");
      errors.forEach((error) => console.error(`  - ${error}`));
      return false;
    }

    console.log("✅ Network setup validation passed");
    return true;
  }

  static getNetworkSwitchInstructions(targetNetwork: NetworkType): string[] {
    const instructions: string[] = [];

    instructions.push(`To switch to ${targetNetwork}:`);
    instructions.push(`1. Set NETWORK=${targetNetwork} in your .env file`);

    if (targetNetwork === NetworkType.MAINNET) {
      instructions.push(
        "2. Ensure you have ETHEREUM_PRIVATE_KEY_MAINNET configured",
      );
      instructions.push("3. Verify your mainnet RPC URL is correct");
      instructions.push("4. ⚠️  WARNING: This will use real funds!");
    } else if (targetNetwork === NetworkType.TESTNET) {
      instructions.push("2. Configure ETHEREUM_PRIVATE_KEY_TESTNET (optional)");
      instructions.push("3. Ensure you have testnet ETH for gas fees");
    } else {
      instructions.push(
        "2. Start your local Ethereum devnet (e.g., Hardhat, Ganache)",
      );
      instructions.push("3. Configure ETHEREUM_PRIVATE_KEY_DEVNET (optional)");
    }

    instructions.push("4. Restart the application");

    return instructions;
  }
}

// Convenience functions
export const getCurrentNetwork = () => NetworkSwitcher.getCurrentNetwork();
export const isMainnet = () => NetworkSwitcher.isMainnet();
export const isTestnet = () => NetworkSwitcher.isTestnet();
export const logNetworkStatus = () => NetworkSwitcher.logNetworkStatus();
export const validateNetworkSetup = () =>
  NetworkSwitcher.validateNetworkSetup();

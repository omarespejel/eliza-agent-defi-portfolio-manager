import { NetworkType, getNetworkConfig } from "./networks.js";

export interface EnvironmentConfig {
  // Network Configuration
  network: NetworkType;

  // API Keys (not sensitive)
  openaiApiKey: string;
  infuraProjectId?: string;
  alchemyApiKey?: string;

  // Discord Configuration
  discordApiToken?: string;
  discordApplicationId?: string;

  // Private Keys (sensitive - handled securely)
  ethereumPrivateKey?: string;

  // RPC URLs (can contain API keys)
  ethereumRpcUrl?: string;

  // Security Settings
  enableMainnetProtection: boolean;
  maxTransactionValue?: string; // in ETH
  requireConfirmation: boolean;
}

class EnvironmentManager {
  private config: EnvironmentConfig;
  private sensitiveKeys = new Set([
    "ethereumPrivateKey",
    "openaiApiKey",
    "discordApiToken",
    "infuraProjectId",
    "alchemyApiKey",
  ]);

  constructor() {
    this.config = this.loadConfiguration();
    this.validateConfiguration();
  }

  private loadConfiguration(): EnvironmentConfig {
    // Determine network from environment
    const networkEnv = process.env.NETWORK?.toLowerCase() as NetworkType;
    const network = this.validateNetwork(networkEnv);

    return {
      // Network
      network,

      // API Keys
      openaiApiKey: this.getRequiredEnv("OPENAI_API_KEY"),
      infuraProjectId: process.env.INFURA_PROJECT_ID,
      alchemyApiKey: process.env.ALCHEMY_API_KEY,

      // Discord
      discordApiToken: process.env.DISCORD_API_TOKEN,
      discordApplicationId: process.env.DISCORD_APPLICATION_ID,

      // Private Keys - Network specific
      ethereumPrivateKey: this.getPrivateKey("ETHEREUM_PRIVATE_KEY", network),

      // RPC URLs - Network specific with fallbacks
      ethereumRpcUrl: this.getRpcUrl("ETHEREUM_RPC_URL", network),

      // Security Settings
      enableMainnetProtection: network === NetworkType.MAINNET,
      maxTransactionValue: process.env.MAX_TRANSACTION_VALUE || "1.0",
      requireConfirmation:
        network === NetworkType.MAINNET ||
        process.env.REQUIRE_CONFIRMATION === "true",
    };
  }

  private validateNetwork(network: string | undefined): NetworkType {
    if (!network) {
      console.warn("⚠️  NETWORK not specified, defaulting to TESTNET (recommended for ElizaOS AI agents)");
      return NetworkType.TESTNET;
    }

    if (!Object.values(NetworkType).includes(network as NetworkType)) {
      throw new Error(
        `Invalid NETWORK: ${network}. Must be one of: ${Object.values(NetworkType).join(", ")}`,
      );
    }

    return network as NetworkType;
  }

  private getRequiredEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  private getPrivateKey(
    baseKey: string,
    network: NetworkType,
  ): string | undefined {
    // Try network-specific key first (e.g., STARKNET_PRIVATE_KEY_MAINNET)
    const networkSpecificKey = `${baseKey}_${network.toUpperCase()}`;
    const networkSpecificValue = process.env[networkSpecificKey];

    if (networkSpecificValue) {
      this.validatePrivateKey(
        networkSpecificValue,
        networkSpecificKey,
        network,
      );
      return networkSpecificValue;
    }

    // Fall back to generic key
    const genericValue = process.env[baseKey];
    if (genericValue) {
      this.validatePrivateKey(genericValue, baseKey, network);
      return genericValue;
    }

    // Only require private keys for mainnet
    if (network === NetworkType.MAINNET) {
      throw new Error(
        `Private key required for mainnet: ${networkSpecificKey} or ${baseKey}`,
      );
    }

    return undefined;
  }

  private validatePrivateKey(
    privateKey: string,
    keyName: string,
    network: NetworkType,
  ): void {
    // Basic validation
    if (privateKey.length < 32) {
      throw new Error(`Invalid private key format for ${keyName}`);
    }

    // Mainnet additional security checks
    if (network === NetworkType.MAINNET) {
      if (privateKey.includes("test") || privateKey.includes("dev")) {
        throw new Error(
          `Suspicious private key detected for mainnet: ${keyName}`,
        );
      }
    }

    // Warn about test keys on mainnet
    if (
      network === NetworkType.MAINNET &&
      (privateKey.startsWith("0x1234") ||
        privateKey.includes("deadbeef") ||
        privateKey === "0x" + "1".repeat(64))
    ) {
      throw new Error(`Test private key detected on mainnet for ${keyName}`);
    }
  }

  private getRpcUrl(baseKey: string, network: NetworkType): string | undefined {
    // Try network-specific RPC URL first
    const networkSpecificKey = `${baseKey}_${network.toUpperCase()}`;
    const networkSpecificUrl = process.env[networkSpecificKey];

    if (networkSpecificUrl) {
      return this.buildRpcUrl(networkSpecificUrl, network);
    }

    // Fall back to generic RPC URL
    const genericUrl = process.env[baseKey];
    if (genericUrl) {
      return this.buildRpcUrl(genericUrl, network);
    }

    // Use default from network config
    const networkConfig = getNetworkConfig(network);
    return this.buildRpcUrl(networkConfig.rpcUrl, network);
  }

  private buildRpcUrl(baseUrl: string, network: NetworkType): string {
    // Add API key if needed and available
    if (baseUrl.includes("infura.io") && this.config?.infuraProjectId) {
      return baseUrl + this.config.infuraProjectId;
    }

    if (baseUrl.includes("alchemy.com") && this.config?.alchemyApiKey) {
      return baseUrl + this.config.alchemyApiKey;
    }

    return baseUrl;
  }

  private validateConfiguration(): void {
    const { network } = this.config;
    const networkConfig = getNetworkConfig(network);

    console.log(`🌐 Network: ${networkConfig.name} (${network})`);
    console.log(`🔗 Chain ID: ${networkConfig.chainId}`);
    console.log(`🧪 Test Network: ${networkConfig.isTestnet ? "Yes" : "No"}`);

    if (network === NetworkType.MAINNET) {
      console.log("🔒 Mainnet protection enabled");
      console.log(
        `💰 Max transaction value: ${this.config.maxTransactionValue} ETH`,
      );
      console.log(
        `✅ Confirmation required: ${this.config.requireConfirmation}`,
      );
    }

    // Validate required keys for the network
    if (network === NetworkType.MAINNET && !this.config.ethereumPrivateKey) {
      throw new Error("Ethereum private key required for mainnet operations");
    }
  }

  // Public getters
  getConfig(): Readonly<EnvironmentConfig> {
    return { ...this.config };
  }

  getNetwork(): NetworkType {
    return this.config.network;
  }

  getNetworkConfig() {
    return getNetworkConfig(this.config.network);
  }

  isMainnet(): boolean {
    return this.config.network === NetworkType.MAINNET;
  }

  isTestnet(): boolean {
    return this.config.network !== NetworkType.MAINNET;
  }

  // Security helpers
  maskSensitiveValue(key: string, value: string): string {
    if (this.sensitiveKeys.has(key)) {
      if (value.length <= 8) return "***";
      return value.slice(0, 4) + "***" + value.slice(-4);
    }
    return value;
  }

  logConfiguration(): void {
    console.log("\n📋 Environment Configuration:");
    console.log("================================");

    Object.entries(this.config).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const displayValue =
          typeof value === "string"
            ? this.maskSensitiveValue(key, value)
            : value;
        console.log(`${key}: ${displayValue}`);
      }
    });

    console.log("================================\n");
  }
}

// Singleton instance
export const environmentManager = new EnvironmentManager();
export const getEnvironmentConfig = () => environmentManager.getConfig();
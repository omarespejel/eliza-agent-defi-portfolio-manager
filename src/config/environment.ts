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

  // Basic Security Settings
  enableMainnetProtection: boolean;
  maxTransactionValue?: string; // in ETH
  requireConfirmation: boolean;

  // Enhanced Security Settings
  dailyTransactionLimit?: string; // in ETH
  maxGasPrice?: string; // in wei
  enableTransactionLogging: boolean;
  whitelistMode: boolean;
  allowedAddresses?: string[]; // comma-separated addresses

  // Advanced Security Settings
  enableAnomalyDetection: boolean;
  alertOnLargeTransactions: boolean;
  alertThresholdEth?: string;
  maxTransactionsPerHour?: number;
  maxTransactionsPerDay?: number;
  emergencyStopEnabled: boolean;
  emergencyContactAddress?: string;
}

class EnvironmentManager {
  private config: EnvironmentConfig;
  private sensitiveKeys = new Set([
    "ethereumPrivateKey",
    "openaiApiKey",
    "discordApiToken",
    "infuraProjectId",
    "alchemyApiKey",
    "emergencyContactAddress",
    "allowedAddresses",
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

      // Enhanced Security Settings
      dailyTransactionLimit: process.env.DAILY_TRANSACTION_LIMIT,
      maxGasPrice: process.env.MAX_GAS_PRICE,
      enableTransactionLogging:
        process.env.ENABLE_TRANSACTION_LOGGING === "true",
      whitelistMode: process.env.WHITELIST_MODE === "true",
      allowedAddresses: process.env.ALLOWED_ADDRESSES?.split(","),

      // Advanced Security Settings
      enableAnomalyDetection: process.env.ENABLE_ANOMALY_DETECTION === "true",
      alertOnLargeTransactions:
        process.env.ALERT_ON_LARGE_TRANSACTIONS === "true",
      alertThresholdEth: process.env.ALERT_THRESHOLD_ETH,
      maxTransactionsPerHour: process.env.MAX_TRANSACTIONS_PER_HOUR
        ? parseInt(process.env.MAX_TRANSACTIONS_PER_HOUR)
        : undefined,
      maxTransactionsPerDay: process.env.MAX_TRANSACTIONS_PER_DAY
        ? parseInt(process.env.MAX_TRANSACTIONS_PER_DAY)
        : undefined,
      emergencyStopEnabled: process.env.EMERGENCY_STOP_ENABLED === "true",
      emergencyContactAddress: process.env.EMERGENCY_CONTACT_ADDRESS,
    };
  }

  private validateNetwork(network: string | undefined): NetworkType {
    if (!network) {
      console.warn(
        "⚠️  NETWORK not specified, defaulting to TESTNET (recommended for ElizaOS AI agents)",
      );
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

    // Basic security settings
    console.log(
      `💰 Max transaction value: ${this.config.maxTransactionValue || "1.0"} ETH`,
    );
    console.log(`✅ Confirmation required: ${this.config.requireConfirmation}`);

    // Enhanced security settings
    if (this.config.dailyTransactionLimit) {
      console.log(
        `📊 Daily transaction limit: ${this.config.dailyTransactionLimit} ETH`,
      );
    }
    if (this.config.maxGasPrice) {
      console.log(
        `⛽ Max gas price: ${parseInt(this.config.maxGasPrice) / 1e9} gwei`,
      );
    }
    console.log(
      `📝 Transaction logging: ${this.config.enableTransactionLogging ? "Enabled" : "Disabled"}`,
    );
    console.log(
      `🛡️ Whitelist mode: ${this.config.whitelistMode ? "Enabled" : "Disabled"}`,
    );

    if (network === NetworkType.MAINNET) {
      console.log("🔒 Mainnet protection enabled");

      // Additional mainnet validations
      if (
        this.config.whitelistMode &&
        (!this.config.allowedAddresses ||
          this.config.allowedAddresses.length === 0)
      ) {
        console.warn(
          "⚠️  Whitelist mode enabled but no allowed addresses configured",
        );
      }

      if (!this.config.enableTransactionLogging) {
        console.warn(
          "⚠️  Transaction logging disabled on mainnet - not recommended",
        );
      }
    }

    // Advanced security warnings
    if (this.config.emergencyStopEnabled) {
      console.log("🚨 Emergency stop enabled");
    }

    // Validate required keys for the network
    if (network === NetworkType.MAINNET && !this.config.ethereumPrivateKey) {
      throw new Error("Ethereum private key required for mainnet operations");
    }

    // Validate whitelist addresses if whitelist mode is enabled
    if (this.config.whitelistMode && this.config.allowedAddresses) {
      this.validateWhitelistAddresses(this.config.allowedAddresses);
    }
  }

  private validateWhitelistAddresses(addresses: string[]): void {
    const invalidAddresses = addresses.filter((addr) => {
      const trimmed = addr.trim();
      return !trimmed.startsWith("0x") || trimmed.length !== 42;
    });

    if (invalidAddresses.length > 0) {
      throw new Error(
        `Invalid whitelist addresses: ${invalidAddresses.join(", ")}`,
      );
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

  // Security helper methods
  isTransactionAllowed(
    toAddress: string,
    valueEth: number,
  ): { allowed: boolean; reason?: string } {
    // Check whitelist mode
    if (this.config.whitelistMode) {
      if (
        !this.config.allowedAddresses ||
        !this.config.allowedAddresses.includes(toAddress.toLowerCase())
      ) {
        return { allowed: false, reason: "Address not in whitelist" };
      }
    }

    // Check transaction value limit
    const maxValue = parseFloat(this.config.maxTransactionValue || "1.0");
    if (valueEth > maxValue) {
      return {
        allowed: false,
        reason: `Transaction value ${valueEth} ETH exceeds limit of ${maxValue} ETH`,
      };
    }

    // Check alert threshold
    if (this.config.alertOnLargeTransactions && this.config.alertThresholdEth) {
      const alertThreshold = parseFloat(this.config.alertThresholdEth);
      if (valueEth > alertThreshold) {
        console.warn(
          `⚠️  Large transaction alert: ${valueEth} ETH exceeds threshold of ${alertThreshold} ETH`,
        );
      }
    }

    return { allowed: true };
  }

  isGasPriceAllowed(gasPriceWei: string): boolean {
    if (!this.config.maxGasPrice) return true;
    return parseInt(gasPriceWei) <= parseInt(this.config.maxGasPrice);
  }

  getSecurityLevel(): "LOW" | "MEDIUM" | "HIGH" | "MAXIMUM" {
    if (this.config.network === NetworkType.MAINNET) {
      if (
        this.config.whitelistMode &&
        this.config.enableTransactionLogging &&
        this.config.emergencyStopEnabled
      ) {
        return "MAXIMUM";
      }
      return "HIGH";
    } else if (this.config.network === NetworkType.TESTNET) {
      return this.config.enableTransactionLogging ? "MEDIUM" : "LOW";
    } else {
      return "LOW";
    }
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

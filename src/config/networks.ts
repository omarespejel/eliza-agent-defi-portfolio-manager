export enum NetworkType {
  DEVNET = "devnet",
  TESTNET = "testnet",
  MAINNET = "mainnet",
}

export interface NetworkConfig {
  name: string;
  type: NetworkType;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  isTestnet: boolean;
  gasPrice?: {
    slow: string;
    standard: string;
    fast: string;
  };
}

// Ethereum Network Configurations
export const ETHEREUM_NETWORKS: Record<NetworkType, NetworkConfig> = {
  [NetworkType.DEVNET]: {
    name: "Ethereum Local Devnet",
    type: NetworkType.DEVNET,
    chainId: 1337, // Local development chain ID
    rpcUrl: "http://localhost:8545",
    explorerUrl: "http://localhost:8545", // Local explorer if available
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    isTestnet: true,
    gasPrice: {
      slow: "1000000000", // 1 gwei
      standard: "2000000000", // 2 gwei
      fast: "5000000000", // 5 gwei
    },
  },
  [NetworkType.TESTNET]: {
    name: "Ethereum Sepolia Testnet",
    type: NetworkType.TESTNET,
    chainId: 11155111, // Sepolia chain ID
    rpcUrl: "https://sepolia.infura.io/v3/",
    explorerUrl: "https://sepolia.etherscan.io",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    isTestnet: true,
    gasPrice: {
      slow: "1000000000", // 1 gwei
      standard: "2000000000", // 2 gwei
      fast: "5000000000", // 5 gwei
    },
  },
  [NetworkType.MAINNET]: {
    name: "Ethereum Mainnet",
    type: NetworkType.MAINNET,
    chainId: 1, // Ethereum mainnet chain ID
    rpcUrl: "https://mainnet.infura.io/v3/",
    explorerUrl: "https://etherscan.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    isTestnet: false,
    gasPrice: {
      slow: "10000000000", // 10 gwei
      standard: "20000000000", // 20 gwei
      fast: "50000000000", // 50 gwei
    },
  },
};

// Additional Network Configurations (for future expansion)
export const ADDITIONAL_NETWORKS: Record<string, NetworkConfig> = {
  polygon_mainnet: {
    name: "Polygon Mainnet",
    type: NetworkType.MAINNET,
    chainId: 137,
    rpcUrl: "https://polygon-mainnet.infura.io/v3/",
    explorerUrl: "https://polygonscan.com",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    isTestnet: false,
  },
  arbitrum_mainnet: {
    name: "Arbitrum One",
    type: NetworkType.MAINNET,
    chainId: 42161,
    rpcUrl: "https://arbitrum-mainnet.infura.io/v3/",
    explorerUrl: "https://arbiscan.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    isTestnet: false,
  },
};

export function getNetworkConfig(networkType: NetworkType): NetworkConfig {
  const config = ETHEREUM_NETWORKS[networkType];
  if (!config) {
    throw new Error(`Unsupported network type: ${networkType}`);
  }
  return config;
}

export function isMainnet(networkType: NetworkType): boolean {
  return networkType === NetworkType.MAINNET;
}

export function isTestnet(networkType: NetworkType): boolean {
  return (
    networkType === NetworkType.TESTNET || networkType === NetworkType.DEVNET
  );
}

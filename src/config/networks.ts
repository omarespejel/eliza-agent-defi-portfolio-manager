export enum NetworkType {
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
  [NetworkType.TESTNET]: {
    name: "Ethereum Sepolia Testnet",
    type: NetworkType.TESTNET,
    chainId: 11155111,
    rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
    explorerUrl: "https://sepolia.etherscan.io",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    isTestnet: true,
    gasPrice: {
      slow: "1000000000",
      standard: "2000000000",
      fast: "5000000000",
    },
  },
  [NetworkType.MAINNET]: {
    name: "Ethereum Mainnet",
    type: NetworkType.MAINNET,
    chainId: 1,
    rpcUrl: "https://mainnet.infura.io/v3/",
    explorerUrl: "https://etherscan.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    isTestnet: false,
    gasPrice: {
      slow: "10000000000",
      standard: "20000000000",
      fast: "50000000000",
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
  return networkType === NetworkType.TESTNET;
}

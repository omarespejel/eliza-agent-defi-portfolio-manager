import axios from "axios";
import type { IAgentRuntime } from "@elizaos/core";

export interface TokenPriceData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: string;
}

export interface EthPriceData {
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: string;
}

export interface PortfolioData {
  totalValue: number;
  balances: TokenBalance[];
  defiPositions: DefiPosition[];
  riskScore: number;
}

export interface TokenBalance {
  symbol: string;
  balance: number;
  value: number;
  price: number;
}

export interface DefiPosition {
  protocol: string;
  type: string;
  pair?: string;
  value: number;
  apy?: number;
  feeTier?: string;
}

export class DataService {
  private coingeckoBaseUrl = "https://api.coingecko.com/api/v3";
  private alchemyBaseUrl: string;

  // Token symbol to CoinGecko ID mapping
  private tokenMap: Record<string, string> = {
    btc: "bitcoin",
    bitcoin: "bitcoin",
    eth: "ethereum",
    ethereum: "ethereum",
    usdc: "usd-coin",
    usdt: "tether",
    bnb: "binancecoin",
    ada: "cardano",
    cardano: "cardano",
    sol: "solana",
    solana: "solana",
    xrp: "ripple",
    ripple: "ripple",
    dot: "polkadot",
    polkadot: "polkadot",
    doge: "dogecoin",
    dogecoin: "dogecoin",
    avax: "avalanche-2",
    avalanche: "avalanche-2",
    matic: "matic-network",
    polygon: "matic-network",
    link: "chainlink",
    chainlink: "chainlink",
    uni: "uniswap",
    uniswap: "uniswap",
    ltc: "litecoin",
    litecoin: "litecoin",
    atom: "cosmos",
    cosmos: "cosmos",
    icp: "internet-computer",
    near: "near",
    algo: "algorand",
    algorand: "algorand",
    xlm: "stellar",
    stellar: "stellar",
    vet: "vechain",
    vechain: "vechain",
    fil: "filecoin",
    filecoin: "filecoin",
    trx: "tron",
    tron: "tron",
    etc: "ethereum-classic",
    hbar: "hedera-hashgraph",
    apt: "aptos",
    aptos: "aptos",
    op: "optimism",
    optimism: "optimism",
    arb: "arbitrum",
    arbitrum: "arbitrum",
    ldo: "lido-dao",
    lido: "lido-dao",
    mkr: "maker",
    maker: "maker",
    aave: "aave",
    comp: "compound-governance-token",
    compound: "compound-governance-token",
    crv: "curve-dao-token",
    curve: "curve-dao-token",
    snx: "havven",
    synthetix: "havven",
    sushi: "sushi",
    sushiswap: "sushi",
    "1inch": "1inch",
    yfi: "yearn-finance",
    yearn: "yearn-finance",
  };

  constructor(private runtime: IAgentRuntime) {
    // Determine the correct Alchemy endpoint based on network
    const network = process.env.NETWORK?.toLowerCase() || "testnet";
    if (network === "mainnet") {
      this.alchemyBaseUrl = "https://eth-mainnet.g.alchemy.com/v2";
    } else {
      this.alchemyBaseUrl = "https://eth-sepolia.g.alchemy.com/v2";
    }

    console.log(
      `🔗 DataService - Using Alchemy endpoint: ${this.alchemyBaseUrl.split("/v2")[0]}/v2/***`,
    );
  }

  async getTokenPrice(tokenSymbolOrId: string): Promise<TokenPriceData> {
    try {
      const tokenId = this.resolveTokenId(tokenSymbolOrId.toLowerCase());

      const response = await axios.get(
        `${this.coingeckoBaseUrl}/simple/price?ids=${tokenId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`,
      );

      const data = response.data[tokenId];
      if (!data) {
        throw new Error(`Token ${tokenSymbolOrId} not found`);
      }

      // Get token info for name and symbol
      const infoResponse = await axios.get(
        `${this.coingeckoBaseUrl}/coins/${tokenId}`,
      );
      const tokenInfo = infoResponse.data;

      return {
        symbol:
          tokenInfo.symbol?.toUpperCase() || tokenSymbolOrId.toUpperCase(),
        name: tokenInfo.name || tokenSymbolOrId,
        price: data.usd,
        change24h: data.usd_24h_change || 0,
        volume24h: data.usd_24h_vol || 0,
        marketCap: data.usd_market_cap || 0,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Error fetching ${tokenSymbolOrId} price:`, error);
      // Return fallback data
      return {
        symbol: tokenSymbolOrId.toUpperCase(),
        name: tokenSymbolOrId,
        price: 0,
        change24h: 0,
        volume24h: 0,
        marketCap: 0,
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  private resolveTokenId(input: string): string {
    // First check our mapping
    if (this.tokenMap[input]) {
      return this.tokenMap[input];
    }

    // If not in mapping, assume it's already a CoinGecko ID
    return input;
  }

  async searchToken(query: string): Promise<string[]> {
    try {
      const response = await axios.get(
        `${this.coingeckoBaseUrl}/search?query=${encodeURIComponent(query)}`,
      );
      const coins = response.data.coins || [];

      return coins.slice(0, 5).map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
      }));
    } catch (error) {
      console.error("Error searching tokens:", error);
      return [];
    }
  }

  async getEthPrice(): Promise<EthPriceData> {
    const tokenData = await this.getTokenPrice("ethereum");
    return {
      price: tokenData.price,
      change24h: tokenData.change24h,
      volume24h: tokenData.volume24h,
      marketCap: tokenData.marketCap,
      lastUpdated: tokenData.lastUpdated,
    };
  }

  async getPortfolioData(walletAddress?: string): Promise<PortfolioData> {
    try {
      console.log(
        `🔍 DataService - getPortfolioData called with address: ${walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` : "undefined"}`,
      );

      if (!walletAddress) {
        console.log(
          "📊 DataService - No wallet address provided, returning demo portfolio",
        );
        // Return demo portfolio if no wallet address provided
        return this.getDemoPortfolio();
      }

      console.log("🔗 DataService - Attempting to fetch real wallet data...");
      // Get token balances using Alchemy API
      const balances = await this.getTokenBalances(walletAddress);
      const defiPositions = await this.getDefiPositions(walletAddress);

      const totalValue = this.calculateTotalValue(balances, defiPositions);
      const riskScore = this.calculateRiskScore(balances, defiPositions);

      console.log(
        `✅ DataService - Successfully fetched real data. Total value: $${totalValue.toLocaleString()}`,
      );
      return {
        totalValue,
        balances,
        defiPositions,
        riskScore,
      };
    } catch (error) {
      console.error("❌ DataService - Error fetching portfolio data:", error);
      console.log("🔄 DataService - Falling back to demo portfolio");
      return this.getDemoPortfolio();
    }
  }

  private async getTokenBalances(
    walletAddress: string,
  ): Promise<TokenBalance[]> {
    try {
      console.log(
        `🔍 DataService - getTokenBalances called for ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`,
      );

      const alchemyApiKey = this.runtime.getSetting("ALCHEMY_API_KEY");
      console.log(
        `🔑 DataService - Alchemy API key: ${alchemyApiKey ? "Present" : "Missing"}`,
      );

      if (!alchemyApiKey) {
        throw new Error("Alchemy API key not configured");
      }

      console.log("🌐 DataService - Making Alchemy API calls...");
      console.log(
        `🔗 DataService - Alchemy URL: ${this.alchemyBaseUrl}/${alchemyApiKey ? "***" : "NO_KEY"}`,
      );

      const response = await axios.post(
        `${this.alchemyBaseUrl}/${alchemyApiKey}`,
        {
          jsonrpc: "2.0",
          method: "alchemy_getTokenBalances",
          params: [walletAddress],
          id: 1,
        },
      );

      console.log(
        `📊 DataService - Token balances response status: ${response.status}`,
      );
      if (response.data.error) {
        console.error(
          "❌ DataService - Alchemy API error:",
          response.data.error,
        );
        throw new Error(`Alchemy API error: ${response.data.error.message}`);
      }

      // Get ETH balance
      const ethResponse = await axios.post(
        `${this.alchemyBaseUrl}/${alchemyApiKey}`,
        {
          jsonrpc: "2.0",
          method: "eth_getBalance",
          params: [walletAddress, "latest"],
          id: 2,
        },
      );

      console.log(
        `💰 DataService - ETH balance response status: ${ethResponse.status}`,
      );
      if (ethResponse.data.error) {
        console.error(
          "❌ DataService - ETH balance API error:",
          ethResponse.data.error,
        );
        throw new Error(
          `ETH balance API error: ${ethResponse.data.error.message}`,
        );
      }

      const ethBalance = parseInt(ethResponse.data.result, 16) / 1e18;
      const ethPrice = (await this.getEthPrice()).price;

      console.log(
        `💰 DataService - ETH balance: ${ethBalance.toFixed(4)} ETH (~$${(ethBalance * ethPrice).toLocaleString()})`,
      );

      const balances: TokenBalance[] = [
        {
          symbol: "ETH",
          balance: ethBalance,
          value: ethBalance * ethPrice,
          price: ethPrice,
        },
      ];

      // Process token balances (simplified for demo)
      const tokenBalances = response.data.result.tokenBalances || [];
      console.log(
        `🪙 DataService - Found ${tokenBalances.length} token balances`,
      );

      for (const token of tokenBalances.slice(0, 5)) {
        // Limit to top 5 tokens
        if (token.tokenBalance && token.tokenBalance !== "0x0") {
          // This would need token metadata lookup in a real implementation
          balances.push({
            symbol: "TOKEN",
            balance: parseInt(token.tokenBalance, 16) / 1e18,
            value: 100, // Placeholder
            price: 1,
          });
        }
      }

      console.log(
        `✅ DataService - Processed ${balances.length} token balances`,
      );
      return balances;
    } catch (error) {
      console.error("❌ DataService - Error fetching token balances:", error);
      console.log("🔄 DataService - Falling back to demo balances");
      return this.getDemoBalances();
    }
  }

  private async getDefiPositions(
    walletAddress: string,
  ): Promise<DefiPosition[]> {
    // In a real implementation, this would query DeFi protocols
    // For now, return demo positions
    return [
      {
        protocol: "Uniswap V3",
        type: "Liquidity Pool",
        pair: "ETH/USDC",
        value: 2000,
        apy: 15.5,
        feeTier: "0.3%",
      },
      {
        protocol: "Aave",
        type: "Lending",
        value: 500,
        apy: 3.2,
      },
    ];
  }

  private calculateTotalValue(
    balances: TokenBalance[],
    positions: DefiPosition[],
  ): number {
    const balanceValue = balances.reduce(
      (sum, balance) => sum + balance.value,
      0,
    );
    const positionValue = positions.reduce(
      (sum, position) => sum + position.value,
      0,
    );
    return balanceValue + positionValue;
  }

  private calculateRiskScore(
    balances: TokenBalance[],
    positions: DefiPosition[],
  ): number {
    // Simplified risk calculation
    const totalValue = this.calculateTotalValue(balances, positions);
    const ethExposure = balances.find((b) => b.symbol === "ETH")?.value || 0;
    const ethPercentage = ethExposure / totalValue;

    // Higher ETH concentration = higher risk
    if (ethPercentage > 0.8) return 8;
    if (ethPercentage > 0.6) return 6;
    if (ethPercentage > 0.4) return 4;
    return 3;
  }

  private getDemoPortfolio(): PortfolioData {
    return {
      totalValue: 9500,
      balances: this.getDemoBalances(),
      defiPositions: [
        {
          protocol: "Uniswap V3",
          type: "Liquidity Pool",
          pair: "ETH/USDC",
          value: 2000,
          apy: 15.5,
          feeTier: "0.3%",
        },
      ],
      riskScore: 6,
    };
  }

  private getDemoBalances(): TokenBalance[] {
    return [
      {
        symbol: "ETH",
        balance: 2.5,
        value: 6000,
        price: 2400,
      },
      {
        symbol: "USDC",
        balance: 1500,
        value: 1500,
        price: 1,
      },
    ];
  }

  async getMarketData() {
    try {
      const response = await axios.get(`${this.coingeckoBaseUrl}/global`);

      return {
        totalMarketCap: response.data.data.total_market_cap.usd,
        totalVolume: response.data.data.total_volume.usd,
        btcDominance: response.data.data.market_cap_percentage.btc,
        ethDominance: response.data.data.market_cap_percentage.eth,
      };
    } catch (error) {
      console.error("Error fetching market data:", error);
      return {
        totalMarketCap: 2500000000000,
        totalVolume: 50000000000,
        btcDominance: 45,
        ethDominance: 18,
      };
    }
  }
}

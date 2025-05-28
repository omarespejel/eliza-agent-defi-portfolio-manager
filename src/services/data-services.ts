import axios from "axios";
import type { IAgentRuntime } from "@elizaos/core";

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
  private alchemyBaseUrl = "https://eth-mainnet.g.alchemy.com/v2";

  constructor(private runtime: IAgentRuntime) {}

  async getEthPrice(): Promise<EthPriceData> {
    try {
      const response = await axios.get(
        `${this.coingeckoBaseUrl}/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`,
      );

      const data = response.data.ethereum;

      return {
        price: data.usd,
        change24h: data.usd_24h_change || 0,
        volume24h: data.usd_24h_vol || 0,
        marketCap: data.usd_market_cap || 0,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error fetching ETH price:", error);
      // Fallback to mock data if API fails
      return {
        price: 2400,
        change24h: 2.5,
        volume24h: 15000000000,
        marketCap: 288000000000,
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  async getPortfolioData(walletAddress?: string): Promise<PortfolioData> {
    try {
      if (!walletAddress) {
        // Return demo portfolio if no wallet address provided
        return this.getDemoPortfolio();
      }

      // Get token balances using Alchemy API
      const balances = await this.getTokenBalances(walletAddress);
      const defiPositions = await this.getDefiPositions(walletAddress);

      const totalValue = this.calculateTotalValue(balances, defiPositions);
      const riskScore = this.calculateRiskScore(balances, defiPositions);

      return {
        totalValue,
        balances,
        defiPositions,
        riskScore,
      };
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
      return this.getDemoPortfolio();
    }
  }

  private async getTokenBalances(
    walletAddress: string,
  ): Promise<TokenBalance[]> {
    try {
      const alchemyApiKey = this.runtime.getSetting("ALCHEMY_API_KEY");
      if (!alchemyApiKey) {
        throw new Error("Alchemy API key not configured");
      }

      const response = await axios.post(
        `${this.alchemyBaseUrl}/${alchemyApiKey}`,
        {
          jsonrpc: "2.0",
          method: "alchemy_getTokenBalances",
          params: [walletAddress],
          id: 1,
        },
      );

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

      const ethBalance = parseInt(ethResponse.data.result, 16) / 1e18;
      const ethPrice = (await this.getEthPrice()).price;

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

      return balances;
    } catch (error) {
      console.error("Error fetching token balances:", error);
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

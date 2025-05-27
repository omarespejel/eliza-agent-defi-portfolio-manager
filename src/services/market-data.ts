import axios from "axios";

export interface TokenPrice {
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: Date;
}

export interface ProtocolData {
  name: string;
  tvl: number;
  apy: number;
  risk: "LOW" | "MEDIUM" | "HIGH";
}

export class MarketDataService {
  private readonly COINGECKO_API = "https://api.coingecko.com/api/v3";
  private readonly DEFIPULSE_API = "https://api.defipulse.com/v1";

  async getTokenPrice(tokenId: string): Promise<TokenPrice> {
    try {
      const response = await axios.get(`${this.COINGECKO_API}/simple/price`, {
        params: {
          ids: tokenId,
          vs_currencies: "usd",
          include_24hr_change: true,
          include_24hr_vol: true,
          include_market_cap: true,
        },
      });

      const data = response.data[tokenId];
      if (!data) {
        throw new Error(`Token ${tokenId} not found`);
      }

      return {
        price: data.usd || 0,
        change24h: data.usd_24h_change || 0,
        volume24h: data.usd_24h_vol || 0,
        marketCap: data.usd_market_cap || 0,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error("Failed to fetch token price:", error);
      // Return mock data as fallback
      return this.getMockTokenPrice(tokenId);
    }
  }

  async getEthereumPrice(): Promise<TokenPrice> {
    return this.getTokenPrice("ethereum");
  }

  async getDeFiProtocolData(protocolId: string): Promise<ProtocolData> {
    try {
      // In a real implementation, this would fetch from DeFiPulse, DeBank, or Zapper
      // For now, return mock data
      return this.getMockProtocolData(protocolId);
    } catch (error) {
      console.error("Failed to fetch protocol data:", error);
      return this.getMockProtocolData(protocolId);
    }
  }

  async getMultipleTokenPrices(
    tokenIds: string[],
  ): Promise<Record<string, TokenPrice>> {
    const prices: Record<string, TokenPrice> = {};

    for (const tokenId of tokenIds) {
      try {
        prices[tokenId] = await this.getTokenPrice(tokenId);
      } catch (error) {
        console.error(`Failed to fetch price for ${tokenId}:`, error);
        prices[tokenId] = this.getMockTokenPrice(tokenId);
      }
    }

    return prices;
  }

  private getMockTokenPrice(tokenId: string): TokenPrice {
    const mockPrices: Record<string, TokenPrice> = {
      ethereum: {
        price: 2400,
        change24h: 2.5,
        volume24h: 15000000000,
        marketCap: 288000000000,
        lastUpdated: new Date(),
      },
      "usd-coin": {
        price: 1.0,
        change24h: 0.01,
        volume24h: 5000000000,
        marketCap: 25000000000,
        lastUpdated: new Date(),
      },
      uniswap: {
        price: 8.5,
        change24h: 1.2,
        volume24h: 150000000,
        marketCap: 5100000000,
        lastUpdated: new Date(),
      },
    };

    return (
      mockPrices[tokenId] || {
        price: 100,
        change24h: 0,
        volume24h: 1000000,
        marketCap: 100000000,
        lastUpdated: new Date(),
      }
    );
  }

  private getMockProtocolData(protocolId: string): ProtocolData {
    const mockProtocols: Record<string, ProtocolData> = {
      uniswap: {
        name: "Uniswap V3",
        tvl: 4200000000,
        apy: 15.5,
        risk: "MEDIUM",
      },
      aave: {
        name: "Aave V3",
        tvl: 8500000000,
        apy: 3.2,
        risk: "LOW",
      },
      compound: {
        name: "Compound V3",
        tvl: 2100000000,
        apy: 2.1,
        risk: "LOW",
      },
    };

    return (
      mockProtocols[protocolId] || {
        name: "Unknown Protocol",
        tvl: 0,
        apy: 0,
        risk: "HIGH",
      }
    );
  }
}

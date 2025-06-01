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
  private binanceBaseUrl = "https://api.binance.com/api/v3";
  private alchemyBaseUrl: string;

  // Token symbol to Binance symbol mapping
  private tokenToBinanceMap: Record<string, string> = {
    btc: "BTCUSDT",
    bitcoin: "BTCUSDT",
    eth: "ETHUSDT",
    ethereum: "ETHUSDT",
    usdc: "USDCUSDT",
    usdt: "USDTUSDT",
    bnb: "BNBUSDT",
    ada: "ADAUSDT",
    cardano: "ADAUSDT",
    sol: "SOLUSDT",
    solana: "SOLUSDT",
    xrp: "XRPUSDT",
    ripple: "XRPUSDT",
    dot: "DOTUSDT",
    polkadot: "DOTUSDT",
    doge: "DOGEUSDT",
    dogecoin: "DOGEUSDT",
    avax: "AVAXUSDT",
    avalanche: "AVAXUSDT",
    matic: "MATICUSDT",
    polygon: "MATICUSDT",
    link: "LINKUSDT",
    chainlink: "LINKUSDT",
    uni: "UNIUSDT",
    uniswap: "UNIUSDT",
    ltc: "LTCUSDT",
    litecoin: "LTCUSDT",
    atom: "ATOMUSDT",
    cosmos: "ATOMUSDT",
    near: "NEARUSDT",
    algo: "ALGOUSDT",
    algorand: "ALGOUSDT",
    xlm: "XLMUSDT",
    stellar: "XLMUSDT",
    vet: "VETUSDT",
    vechain: "VETUSDT",
    fil: "FILUSDT",
    filecoin: "FILUSDT",
    trx: "TRXUSDT",
    tron: "TRXUSDT",
    op: "OPUSDT",
    optimism: "OPUSDT",
    arb: "ARBUSDT",
    arbitrum: "ARBUSDT",
    ldo: "LDOUSDT",
    lido: "LDOUSDT",
    mkr: "MKRUSDT",
    maker: "MKRUSDT",
    aave: "AAVEUSDT",
    comp: "COMPUSDT",
    compound: "COMPUSDT",
    crv: "CRVUSDT",
    curve: "CRVUSDT",
    snx: "SNXUSDT",
    synthetix: "SNXUSDT",
    sushi: "SUSHIUSDT",
    sushiswap: "SUSHIUSDT",
    "1inch": "1INCHUSDT",
    yfi: "YFIUSDT",
    yearn: "YFIUSDT",
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
      const binanceSymbol = this.resolveBinanceSymbol(tokenSymbolOrId.toLowerCase());

      // Special handling for stablecoins
      if (tokenSymbolOrId.toLowerCase() === 'usdt' || tokenSymbolOrId.toLowerCase() === 'usdc' || tokenSymbolOrId.toLowerCase() === 'dai') {
        return {
          symbol: tokenSymbolOrId.toUpperCase(),
          name: tokenSymbolOrId.toUpperCase(),
          price: 1.0, // Stablecoins are ~$1
          change24h: 0.01, // Minimal change
          volume24h: 1000000000, // High volume
          marketCap: 0,
          lastUpdated: new Date().toISOString(),
        };
      }

      // Get 24hr ticker data from Binance
      const response = await axios.get(
        `${this.binanceBaseUrl}/ticker/24hr?symbol=${binanceSymbol}`,
      );

      const data = response.data;
      if (!data || !data.symbol) {
        throw new Error(`Token ${tokenSymbolOrId} not found`);
      }

      // Extract base symbol from trading pair (e.g., ETHUSDT -> ETH)
      const baseSymbol = data.symbol.replace('USDT', '').replace('USDC', '').replace('BUSD', '');

      return {
        symbol: baseSymbol.toUpperCase(),
        name: baseSymbol.toUpperCase(),
        price: parseFloat(data.lastPrice),
        change24h: parseFloat(data.priceChangePercent),
        volume24h: parseFloat(data.quoteVolume), // Volume in quote currency (USDT)
        marketCap: 0, // Binance doesn't provide market cap directly
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

  private resolveBinanceSymbol(input: string): string {
    // First check our mapping
    if (this.tokenToBinanceMap[input]) {
      return this.tokenToBinanceMap[input];
    }

    // If not in mapping, try to construct USDT pair
    const upperInput = input.toUpperCase();
    
    // Special handling for stablecoins
    if (upperInput === 'USDC') {
      return 'USDCUSDT';
    }
    if (upperInput === 'USDT') {
      return 'USDTUSDT'; // This won't work, but we'll handle it in getTokenPrice
    }
    if (upperInput === 'DAI') {
      return 'DAIUSDT';
    }
    
    // For other tokens, try to construct USDT pair
    if (!upperInput.includes('USDT') && !upperInput.includes('USDC') && !upperInput.includes('BUSD')) {
      return `${upperInput}USDT`;
    }

    return upperInput;
  }

  async searchToken(query: string): Promise<any[]> {
    try {
      // For Binance, we'll search through our known token mappings
      const searchQuery = query.toLowerCase();
      const matchingTokens = Object.keys(this.tokenToBinanceMap)
        .filter((token) => token.includes(searchQuery))
        .slice(0, 5);

      return matchingTokens.map((token) => ({
        id: this.tokenToBinanceMap[token],
        name: token.toUpperCase(),
        symbol: token.toUpperCase(),
      }));
    } catch (error) {
      console.error("Error searching tokens:", error);
      return [];
    }
  }

  async getEthPrice(): Promise<EthPriceData> {
    const tokenData = await this.getTokenPrice("eth");
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

      // Process token balances with proper metadata lookup
      const tokenBalances = response.data.result.tokenBalances || [];
      console.log(
        `🪙 DataService - Found ${tokenBalances.length} token balances`,
      );

      // Get token metadata for non-zero balances
      for (const token of tokenBalances.slice(0, 10)) {
        // Process up to 10 tokens
        if (token.tokenBalance && token.tokenBalance !== "0x0") {
          try {
            // Get token metadata from Alchemy
            const metadataResponse = await axios.post(
              `${this.alchemyBaseUrl}/${alchemyApiKey}`,
              {
                jsonrpc: "2.0",
                method: "alchemy_getTokenMetadata",
                params: [token.contractAddress],
                id: 3,
              },
            );

            if (metadataResponse.data.result) {
              const metadata = metadataResponse.data.result;
              const decimals = metadata.decimals || 18;
              const rawBalance = parseInt(token.tokenBalance, 16);
              const balance = rawBalance / Math.pow(10, decimals);

              // Only include tokens with meaningful balance and valid symbols
              if (balance > 0.001 && this.isValidTokenSymbol(metadata.symbol)) {
                let tokenPrice = 0;
                let tokenValue = 0;

                // Try to get price from Binance if we have a symbol
                if (metadata.symbol) {
                  try {
                    const priceData = await this.getTokenPrice(metadata.symbol.toLowerCase());
                    tokenPrice = priceData.price;
                    tokenValue = balance * tokenPrice;
                  } catch (error) {
                    console.log(`⚠️ Could not fetch price for ${metadata.symbol}, using balance only`);
                    tokenValue = 0; // Set to 0 if we can't get price
                  }
                }

                balances.push({
                  symbol: metadata.symbol || "UNKNOWN",
                  balance: balance,
                  value: tokenValue,
                  price: tokenPrice,
                });

                console.log(
                  `🪙 Added token: ${metadata.symbol || "UNKNOWN"} - ${balance.toFixed(4)} tokens (~$${tokenValue.toFixed(2)})`
                );
              }
            }
          } catch (error) {
            console.log(
              `⚠️ Could not fetch metadata for token ${token.contractAddress}:`,
              (error as Error).message,
            );
          }
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
    try {
      console.log(
        `🔍 DataService - Checking DeFi positions for ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`,
      );

      // In a real implementation, this would query DeFi protocols like:
      // - Uniswap V3 positions via subgraph
      // - Aave lending positions
      // - Compound positions
      // - Other DeFi protocols

      // For now, we'll return empty array since we don't have real DeFi position detection
      // This prevents showing fake positions that don't exist
      console.log(
        "📊 DataService - DeFi position detection not implemented, returning empty positions",
      );
      return [];
    } catch (error) {
      console.error("❌ DataService - Error checking DeFi positions:", error);
      return [];
    }
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
      // Get BTC and ETH prices for dominance calculation
      const btcData = await this.getTokenPrice("btc");
      const ethData = await this.getTokenPrice("eth");

      // Get 24hr ticker statistics for major pairs
      const response = await axios.get(`${this.binanceBaseUrl}/ticker/24hr`);
      const tickers = response.data;

      // Calculate total volume from major USDT pairs
      const usdtPairs = tickers.filter((ticker: any) =>
        ticker.symbol.endsWith("USDT"),
      );
      const totalVolume = usdtPairs.reduce(
        (sum: number, ticker: any) => sum + parseFloat(ticker.quoteVolume),
        0,
      );

      return {
        totalMarketCap: 3600000000000, // Approximate total crypto market cap
        totalVolume: totalVolume,
        btcDominance: 60.9, // Approximate BTC dominance
        ethDominance: 9.0, // Approximate ETH dominance
      };
    } catch (error) {
      console.error("Error fetching market data:", error);
      return {
        totalMarketCap: 3600000000000,
        totalVolume: 50000000000,
        btcDominance: 60.9,
        ethDominance: 9.0,
      };
    }
  }

  private isValidTokenSymbol(symbol: string): boolean {
    if (!symbol) return false;
    
    // Check if symbol matches Binance requirements: ^[A-Z0-9-_.]{1,20}$
    const binanceSymbolRegex = /^[A-Z0-9\-_.]{1,20}$/;
    
    // Convert to uppercase for validation
    const upperSymbol = symbol.toUpperCase();
    
    // Basic validation
    if (!binanceSymbolRegex.test(upperSymbol)) {
      return false;
    }
    
    // Filter out obvious spam/scam patterns
    const spamPatterns = [
      /VISIT/i,
      /WEBSITE/i,
      /CLAIM/i,
      /REWARD/i,
      /AIRDROP/i,
      /HTTP/i,
      /WWW\./i,
      /\.COM/i,
      /\.IO/i,
      /\.ORG/i,
      /EARN/i,
      /FREE/i,
      /BONUS/i,
      /GIFT/i,
      /\$/,
      /ADDITIONAL/i,
      /GET/i,
    ];
    
    // Check if symbol contains spam patterns
    for (const pattern of spamPatterns) {
      if (pattern.test(symbol)) {
        console.log(`🚫 Filtering out spam token: ${symbol}`);
        return false;
      }
    }
    
    // Check if symbol is too long (likely spam)
    if (symbol.length > 10) {
      console.log(`🚫 Filtering out long symbol (likely spam): ${symbol}`);
      return false;
    }
    
    return true;
  }
}

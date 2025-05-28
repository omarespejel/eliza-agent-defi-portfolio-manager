import {
  type Action,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type State,
} from "@elizaos/core";
import { DataService } from "../services/data-services.js";

export const checkPortfolioAction: Action = {
  name: "CHECK_PORTFOLIO",
  similes: [
    "check balance",
    "portfolio status",
    "show holdings",
    "check portfolio",
    "my portfolio",
  ],
  description: "Check current DeFi portfolio balance and allocations",

  validate: async (runtime: IAgentRuntime, message: Memory) => {
    const text = message.content.text?.toLowerCase() || "";
    return (
      text.includes("portfolio") ||
      text.includes("balance") ||
      text.includes("holdings")
    );
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State | undefined,
    options: any,
    callback?: HandlerCallback,
  ) => {
    try {
      console.log("Checking portfolio...");

      // Initialize data service
      const dataService = new DataService(runtime);

      // Get real portfolio data
      const walletAddress = runtime.getSetting("WALLET_ADDRESS") || undefined;
      console.log(
        `🔍 Debug - Wallet address from settings: ${walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` : "undefined"}`,
      );

      const portfolioData = await dataService.getPortfolioData(walletAddress);
      console.log(
        `📊 Debug - Portfolio data source: ${walletAddress ? "Real wallet data" : "Demo data"}`,
      );
      console.log(
        `💰 Debug - Total portfolio value: $${portfolioData.totalValue.toLocaleString()}`,
      );

      const marketData = await dataService.getMarketData();

      // Create intelligent response with real data
      const ethBalance = portfolioData.balances.find((b) => b.symbol === "ETH");
      const usdcBalance = portfolioData.balances.find(
        (b) => b.symbol === "USDC",
      );

      const response = `**Portfolio Analysis Complete** 📊

**Total Portfolio Value:** $${portfolioData.totalValue.toLocaleString()}

**Holdings:**
${portfolioData.balances
  .map(
    (balance) =>
      `• ${balance.symbol}: ${balance.balance.toFixed(2)} ${balance.symbol} (~$${balance.value.toLocaleString()})`,
  )
  .join("\n")}

**DeFi Positions:**
${portfolioData.defiPositions
  .map(
    (position) =>
      `• ${position.protocol}: $${position.value.toLocaleString()} ${position.pair ? `(${position.pair})` : ""} ${position.apy ? `- ${position.apy}% APY` : ""}`,
  )
  .join("\n")}

**Risk Assessment:** ${portfolioData.riskScore}/10 ${portfolioData.riskScore <= 3 ? "(Low)" : portfolioData.riskScore <= 6 ? "(Medium)" : "(High)"}

**Market Context:**
• Total Crypto Market Cap: $${(marketData.totalMarketCap / 1e12).toFixed(1)}T
• BTC Dominance: ${marketData.btcDominance}%
• ETH Dominance: ${marketData.ethDominance}%

**AI Recommendations:**
• ${ethBalance && ethBalance.value / portfolioData.totalValue > 0.7 ? "Consider reducing ETH concentration - currently above 70%" : "ETH allocation looks balanced"}
• ${portfolioData.riskScore > 6 ? "High risk detected - consider diversifying into stablecoins" : "Risk level is manageable"}
• Monitor gas fees for optimal rebalancing timing
• Consider yield opportunities in current market conditions`;

      if (callback) {
        callback({
          text: response,
          action: "CHECK_PORTFOLIO",
        });
      }

      return true;
    } catch (error) {
      console.error("Portfolio check failed:", error);

      if (callback) {
        callback({
          text: "Sorry, I encountered an error while checking your portfolio. Please try again.",
          action: "CHECK_PORTFOLIO",
        });
      }

      return false;
    }
  },

  examples: [
    [
      { user: "user", content: { text: "Check my portfolio" } },
      {
        user: "assistant",
        content: {
          text: "Analyzing your current holdings across all chains with real-time data...",
          action: "CHECK_PORTFOLIO",
        },
      },
    ],
  ],
};

export const getEthPriceAction: Action = {
  name: "GET_ETH_PRICE",
  similes: ["eth price", "ethereum price", "current eth price", "price of eth"],
  description: "Get current Ethereum price and market data",

  validate: async (runtime: IAgentRuntime, message: Memory) => {
    const text = message.content.text?.toLowerCase() || "";
    return (
      (text.includes("eth") || text.includes("ethereum")) &&
      text.includes("price")
    );
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State | undefined,
    options: any,
    callback?: HandlerCallback,
  ) => {
    try {
      console.log("Fetching ETH price...");

      // Get real price data
      const dataService = new DataService(runtime);
      const priceData = await dataService.getEthPrice();
      const marketData = await dataService.getMarketData();

      const changeEmoji = priceData.change24h > 0 ? "📈" : "📉";
      const changeColor = priceData.change24h > 0 ? "+" : "";

      // Determine market sentiment
      const volatility = Math.abs(priceData.change24h);
      const volatilityLevel =
        volatility > 5 ? "High" : volatility > 2 ? "Medium" : "Low";

      const response = `**Ethereum (ETH) Price Analysis** ${changeEmoji}

**Current Price:** $${priceData.price.toLocaleString()}
**24h Change:** ${changeColor}${priceData.change24h.toFixed(2)}%
**24h Volume:** $${(priceData.volume24h / 1e9).toFixed(1)}B
**Market Cap:** $${(priceData.marketCap / 1e9).toFixed(0)}B

**Market Context:**
• ETH Dominance: ${marketData.ethDominance}%
• Total Crypto Market Cap: $${(marketData.totalMarketCap / 1e12).toFixed(1)}T
• Market Volatility: ${volatilityLevel}

**AI Insights:**
• ${priceData.change24h > 5 ? "Strong bullish momentum - consider taking profits" : priceData.change24h > 2 ? "Positive price action - good for portfolio growth" : priceData.change24h < -5 ? "Significant decline - potential buying opportunity" : priceData.change24h < -2 ? "Minor correction - monitor for further movement" : "Price stability - good for DeFi operations"}
• ${volatility > 5 ? "High volatility - be cautious with leveraged positions" : "Moderate volatility - suitable for most DeFi strategies"}
• Gas fees may ${priceData.change24h > 0 ? "increase" : "decrease"} with price movement

**Last Updated:** ${new Date(priceData.lastUpdated).toLocaleTimeString()}`;

      if (callback) {
        callback({
          text: response,
          action: "GET_ETH_PRICE",
        });
      }

      return true;
    } catch (error) {
      console.error("Price fetch failed:", error);

      if (callback) {
        callback({
          text: "Sorry, I couldn't fetch the current ETH price. Please try again.",
          action: "GET_ETH_PRICE",
        });
      }

      return false;
    }
  },

  examples: [
    [
      { user: "user", content: { text: "What's the ETH price?" } },
      {
        user: "assistant",
        content: {
          text: "Fetching current Ethereum price data and market analysis...",
          action: "GET_ETH_PRICE",
        },
      },
    ],
  ],
};

export const analyzeRiskAction: Action = {
  name: "ANALYZE_RISK",
  similes: ["analyze risk", "risk assessment", "portfolio risk", "check risk"],
  description: "Analyze portfolio risk and provide recommendations",

  validate: async (runtime: IAgentRuntime, message: Memory) => {
    const text = message.content.text?.toLowerCase() || "";
    return text.includes("risk") || text.includes("analyze");
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State | undefined,
    options: any,
    callback?: HandlerCallback,
  ) => {
    try {
      console.log("Analyzing portfolio risk...");

      // Get real portfolio and market data
      const dataService = new DataService(runtime);
      const walletAddress = runtime.getSetting("WALLET_ADDRESS") || undefined;
      console.log(
        `🔍 Debug - Wallet address from settings: ${walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` : "undefined"}`,
      );

      const portfolioData = await dataService.getPortfolioData(walletAddress);
      console.log(
        `📊 Debug - Portfolio data source: ${walletAddress ? "Real wallet data" : "Demo data"}`,
      );
      console.log(
        `💰 Debug - Total portfolio value: $${portfolioData.totalValue.toLocaleString()}`,
      );

      const marketData = await dataService.getMarketData();
      const ethPrice = await dataService.getEthPrice();

      // Calculate detailed risk metrics
      const totalValue = portfolioData.totalValue;
      const ethExposure =
        portfolioData.balances.find((b) => b.symbol === "ETH")?.value || 0;
      const ethPercentage = (ethExposure / totalValue) * 100;
      const defiExposure = portfolioData.defiPositions.reduce(
        (sum, pos) => sum + pos.value,
        0,
      );
      const defiPercentage = (defiExposure / totalValue) * 100;

      // Calculate liquidity score
      const liquidAssets = portfolioData.balances.filter((b) =>
        ["ETH", "USDC", "USDT", "DAI"].includes(b.symbol),
      );
      const liquidValue = liquidAssets.reduce(
        (sum, asset) => sum + asset.value,
        0,
      );
      const liquidityPercentage = (liquidValue / totalValue) * 100;

      // Risk level determinations
      const concentrationRisk =
        ethPercentage > 80
          ? "Very High"
          : ethPercentage > 60
            ? "High"
            : ethPercentage > 40
              ? "Medium"
              : "Low";
      const liquidityRisk =
        liquidityPercentage < 50
          ? "High"
          : liquidityPercentage < 70
            ? "Medium"
            : "Low";
      const smartContractRisk =
        defiPercentage > 50 ? "High" : defiPercentage > 25 ? "Medium" : "Low";

      // Market risk based on volatility
      const marketVolatility = Math.abs(ethPrice.change24h);
      const marketRisk =
        marketVolatility > 5 ? "High" : marketVolatility > 2 ? "Medium" : "Low";

      const response = `**Portfolio Risk Analysis** ⚠️

**Overall Risk Score:** ${portfolioData.riskScore}/10 ${portfolioData.riskScore <= 3 ? "(Low Risk)" : portfolioData.riskScore <= 6 ? "(Medium Risk)" : "(High Risk)"}

**Risk Breakdown:**
• **Concentration Risk:** ${concentrationRisk} (${ethPercentage.toFixed(1)}% ETH exposure)
• **Liquidity Risk:** ${liquidityRisk} (${liquidityPercentage.toFixed(1)}% liquid assets)
• **Smart Contract Risk:** ${smartContractRisk} (${defiPercentage.toFixed(1)}% in DeFi protocols)
• **Market Risk:** ${marketRisk} (${marketVolatility.toFixed(1)}% daily volatility)

**Portfolio Composition:**
• Total Value: $${totalValue.toLocaleString()}
• ETH Holdings: $${ethExposure.toLocaleString()} (${ethPercentage.toFixed(1)}%)
• DeFi Positions: $${defiExposure.toLocaleString()} (${defiPercentage.toFixed(1)}%)
• Liquid Assets: $${liquidValue.toLocaleString()} (${liquidityPercentage.toFixed(1)}%)

**AI Risk Assessment:**
${ethPercentage > 70 ? "🔴 HIGH CONCENTRATION: Consider reducing ETH exposure below 60%" : "🟢 ETH concentration within acceptable range"}
${defiPercentage > 60 ? "🔴 HIGH DEFI EXPOSURE: Consider moving some funds to safer assets" : "🟡 DeFi exposure manageable but monitor protocol health"}
${liquidityPercentage < 60 ? "🔴 LOW LIQUIDITY: Increase stablecoin holdings for flexibility" : "🟢 Good liquidity for rebalancing operations"}

**Recommendations:**
• ${ethPercentage > 60 ? "Reduce ETH allocation to 40-60% range" : "Maintain current ETH allocation"}
• ${defiPercentage > 40 ? "Consider reducing DeFi exposure for safety" : "DeFi allocation appropriate for yield generation"}
• ${liquidityPercentage < 70 ? "Increase stablecoin holdings to 20-30%" : "Liquidity levels are adequate"}
• Set up price alerts for ${Math.abs(ethPrice.change24h) > 3 ? "15%" : "20%"}+ movements
• Review portfolio allocation ${portfolioData.riskScore > 6 ? "daily" : "weekly"}
• Monitor protocol health scores for DeFi positions

**Market Conditions Impact:**
• Current ETH volatility: ${marketVolatility.toFixed(1)}% (${marketRisk} risk)
• ${marketVolatility > 5 ? "Consider reducing position sizes during high volatility" : "Market conditions suitable for normal operations"}`;

      if (callback) {
        callback({
          text: response,
          action: "ANALYZE_RISK",
        });
      }

      return true;
    } catch (error) {
      console.error("Risk analysis failed:", error);

      if (callback) {
        callback({
          text: "Sorry, I couldn't complete the risk analysis. Please try again.",
          action: "ANALYZE_RISK",
        });
      }

      return false;
    }
  },

  examples: [
    [
      { user: "user", content: { text: "Analyze my risk" } },
      {
        user: "assistant",
        content: {
          text: "Analyzing your portfolio risk profile with current market data...",
          action: "ANALYZE_RISK",
        },
      },
    ],
  ],
};

export const optimizePortfolioAction: Action = {
  name: "OPTIMIZE_PORTFOLIO",
  similes: [
    "optimize portfolio",
    "rebalance",
    "improve allocation",
    "portfolio optimization",
  ],
  description: "Analyze portfolio and suggest optimization strategies",

  validate: async (runtime: IAgentRuntime, message: Memory) => {
    const text = message.content.text?.toLowerCase() || "";
    return (
      text.includes("optimize") ||
      text.includes("rebalance") ||
      text.includes("improve") ||
      (text.includes("portfolio") && text.includes("better"))
    );
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State | undefined,
    options: any,
    callback?: HandlerCallback,
  ) => {
    try {
      console.log("Optimizing portfolio...");

      const dataService = new DataService(runtime);
      const walletAddress = runtime.getSetting("WALLET_ADDRESS") || undefined;
      const portfolioData = await dataService.getPortfolioData(walletAddress);
      const marketData = await dataService.getMarketData();
      const ethPrice = await dataService.getEthPrice();

      // Calculate current allocations
      const totalValue = portfolioData.totalValue;
      const ethExposure =
        portfolioData.balances.find((b) => b.symbol === "ETH")?.value || 0;
      const ethPercentage = (ethExposure / totalValue) * 100;
      const stablecoinExposure = portfolioData.balances
        .filter((b) => ["USDC", "USDT", "DAI"].includes(b.symbol))
        .reduce((sum, b) => sum + b.value, 0);
      const stablecoinPercentage = (stablecoinExposure / totalValue) * 100;
      const defiExposure = portfolioData.defiPositions.reduce(
        (sum, pos) => sum + pos.value,
        0,
      );
      const defiPercentage = (defiExposure / totalValue) * 100;

      // Optimal allocation targets based on risk profile
      const targetEthPercentage =
        portfolioData.riskScore > 6
          ? 40
          : portfolioData.riskScore > 3
            ? 50
            : 60;
      const targetStablecoinPercentage =
        portfolioData.riskScore > 6
          ? 40
          : portfolioData.riskScore > 3
            ? 30
            : 20;
      const targetDefiPercentage =
        portfolioData.riskScore > 6
          ? 20
          : portfolioData.riskScore > 3
            ? 20
            : 20;

      // Calculate rebalancing needs
      const ethRebalance = ethPercentage - targetEthPercentage;
      const stablecoinRebalance =
        stablecoinPercentage - targetStablecoinPercentage;
      const defiRebalance = defiPercentage - targetDefiPercentage;

      const response = `**Portfolio Optimization Analysis** 🎯

**Current Allocation:**
• ETH: ${ethPercentage.toFixed(1)}% ($${ethExposure.toLocaleString()})
• Stablecoins: ${stablecoinPercentage.toFixed(1)}% ($${stablecoinExposure.toLocaleString()})
• DeFi Positions: ${defiPercentage.toFixed(1)}% ($${defiExposure.toLocaleString()})

**Optimal Target Allocation (Risk Score: ${portfolioData.riskScore}/10):**
• ETH: ${targetEthPercentage}%
• Stablecoins: ${targetStablecoinPercentage}%
• DeFi Positions: ${targetDefiPercentage}%

**Rebalancing Recommendations:**
${Math.abs(ethRebalance) > 5 ? `🔄 ETH: ${ethRebalance > 0 ? "REDUCE" : "INCREASE"} by ${Math.abs(ethRebalance).toFixed(1)}% (~$${Math.abs((ethRebalance * totalValue) / 100).toLocaleString()})` : "✅ ETH allocation optimal"}
${Math.abs(stablecoinRebalance) > 5 ? `🔄 Stablecoins: ${stablecoinRebalance > 0 ? "REDUCE" : "INCREASE"} by ${Math.abs(stablecoinRebalance).toFixed(1)}% (~$${Math.abs((stablecoinRebalance * totalValue) / 100).toLocaleString()})` : "✅ Stablecoin allocation optimal"}
${Math.abs(defiRebalance) > 5 ? `🔄 DeFi: ${defiRebalance > 0 ? "REDUCE" : "INCREASE"} by ${Math.abs(defiRebalance).toFixed(1)}% (~$${Math.abs((defiRebalance * totalValue) / 100).toLocaleString()})` : "✅ DeFi allocation optimal"}

**Yield Optimization Opportunities:**
${portfolioData.defiPositions
  .map((pos) => {
    const currentAPY = pos.apy || 0;
    const suggestion =
      currentAPY < 5
        ? "Consider higher-yield alternatives"
        : currentAPY < 10
          ? "Decent yield, monitor for better opportunities"
          : "Excellent yield, maintain position";
    return `• ${pos.protocol}: ${currentAPY}% APY - ${suggestion}`;
  })
  .join("\n")}

**Market Timing Considerations:**
• ETH Price Trend: ${ethPrice.change24h > 0 ? "Bullish" : "Bearish"} (${ethPrice.change24h > 0 ? "+" : ""}${ethPrice.change24h.toFixed(2)}%)
• ${ethPrice.change24h > 5 ? "Strong uptrend - consider taking profits" : ethPrice.change24h < -5 ? "Significant dip - potential buying opportunity" : "Stable conditions - good for rebalancing"}
• Gas fees: Monitor for optimal transaction timing

**Specific Action Plan:**
1. ${Math.abs(ethRebalance) > 10 ? `Priority: ${ethRebalance > 0 ? "Sell" : "Buy"} ${Math.abs((ethRebalance * totalValue) / 100 / ethPrice.price).toFixed(2)} ETH` : "ETH position size appropriate"}
2. ${Math.abs(stablecoinRebalance) > 10 ? `${stablecoinRebalance > 0 ? "Convert stablecoins to" : "Convert assets to"} ${Math.abs((stablecoinRebalance * totalValue) / 100).toLocaleString()} USDC` : "Stablecoin allocation balanced"}
3. ${defiPercentage < 15 ? "Consider adding DeFi positions for yield generation" : defiPercentage > 30 ? "Consider reducing DeFi exposure for safety" : "DeFi allocation appropriate"}
4. Set up automated rebalancing triggers at ±15% allocation drift
5. Review and adjust monthly based on market conditions

**Risk-Adjusted Expected Improvement:**
• Estimated risk reduction: ${Math.max(0, portfolioData.riskScore - Math.max(3, portfolioData.riskScore - 2))}/10 points
• Potential yield increase: ${defiPercentage < targetDefiPercentage ? "0.5-2.0%" : "Maintain current yields"}
• Improved diversification score: ${Math.min(10, portfolioData.riskScore + 2)}/10`;

      if (callback) {
        callback({
          text: response,
          action: "OPTIMIZE_PORTFOLIO",
        });
      }

      return true;
    } catch (error) {
      console.error("Portfolio optimization failed:", error);

      if (callback) {
        callback({
          text: "Sorry, I couldn't complete the portfolio optimization analysis. Please try again.",
          action: "OPTIMIZE_PORTFOLIO",
        });
      }

      return false;
    }
  },

  examples: [
    [
      { user: "user", content: { text: "Optimize my portfolio" } },
      {
        user: "assistant",
        content: {
          text: "Analyzing your portfolio for optimization opportunities...",
          action: "OPTIMIZE_PORTFOLIO",
        },
      },
    ],
  ],
};

export const getTokenPriceAction: Action = {
  name: "GET_TOKEN_PRICE",
  similes: [
    "price of",
    "get price",
    "what's the price",
    "how much is",
    "current price",
    "price check",
    "btc price",
    "bitcoin price",
    "token price",
  ],
  description: "Get current price and market data for any cryptocurrency token",

  validate: async (runtime: IAgentRuntime, message: Memory) => {
    const text = message.content.text?.toLowerCase() || "";

    // Check if message contains price-related keywords
    const priceKeywords = ["price", "cost", "worth", "value", "how much"];
    const hasPriceKeyword = priceKeywords.some((keyword) =>
      text.includes(keyword),
    );

    // Check if message contains token-related keywords
    const tokenKeywords = [
      "btc",
      "bitcoin",
      "eth",
      "ethereum",
      "token",
      "coin",
      "crypto",
    ];
    const hasTokenKeyword = tokenKeywords.some((keyword) =>
      text.includes(keyword),
    );

    return (
      hasPriceKeyword ||
      hasTokenKeyword ||
      text.includes("get") ||
      text.includes("check")
    );
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State | undefined,
    options: any,
    callback?: HandlerCallback,
  ) => {
    try {
      console.log("Processing token price request...");

      const dataService = new DataService(runtime);
      const userMessage = message.content.text || "";

      // Extract token from user message using AI-like logic
      const extractedToken = extractTokenFromMessage(userMessage);

      if (!extractedToken) {
        if (callback) {
          callback({
            text: "I couldn't identify which token you're asking about. Please specify a token like 'BTC price' or 'get ETH price'.",
            action: "GET_TOKEN_PRICE",
          });
        }
        return true;
      }

      // Get token price data
      const tokenData = await dataService.getTokenPrice(extractedToken);
      const marketData = await dataService.getMarketData();

      if (tokenData.price === 0) {
        if (callback) {
          callback({
            text: `Sorry, I couldn't find price data for "${extractedToken}". Please check the token symbol and try again.`,
            action: "GET_TOKEN_PRICE",
          });
        }
        return true;
      }

      const changeEmoji = tokenData.change24h > 0 ? "📈" : "📉";
      const changeColor = tokenData.change24h > 0 ? "+" : "";

      // Determine market sentiment
      const volatility = Math.abs(tokenData.change24h);
      const volatilityLevel =
        volatility > 10
          ? "Very High"
          : volatility > 5
            ? "High"
            : volatility > 2
              ? "Medium"
              : "Low";

      const response = `**${tokenData.name} (${tokenData.symbol}) Price Analysis** ${changeEmoji}

**Current Price:** $${tokenData.price.toLocaleString()}
**24h Change:** ${changeColor}${tokenData.change24h.toFixed(2)}%
**24h Volume:** $${(tokenData.volume24h / 1e9).toFixed(1)}B
**Market Cap:** $${(tokenData.marketCap / 1e9).toFixed(1)}B

**Market Context:**
• Total Crypto Market Cap: $${(marketData.totalMarketCap / 1e12).toFixed(1)}T
• Market Volatility: ${volatilityLevel}

**AI Insights:**
• ${tokenData.change24h > 10 ? "Extremely bullish momentum - significant gains" : tokenData.change24h > 5 ? "Strong bullish momentum - consider taking profits" : tokenData.change24h > 2 ? "Positive price action - good for portfolio growth" : tokenData.change24h < -10 ? "Major decline - potential buying opportunity or risk" : tokenData.change24h < -5 ? "Significant decline - potential buying opportunity" : tokenData.change24h < -2 ? "Minor correction - monitor for further movement" : "Price stability - good for trading operations"}
• ${volatility > 10 ? "Extreme volatility - high risk/reward scenario" : volatility > 5 ? "High volatility - be cautious with large positions" : "Moderate volatility - suitable for most trading strategies"}
• ${tokenData.symbol === "BTC" ? "Bitcoin often leads market trends - watch for broader impact" : tokenData.symbol === "ETH" ? "Ethereum movements affect DeFi ecosystem significantly" : "Monitor correlation with major cryptocurrencies"}

**Last Updated:** ${new Date(tokenData.lastUpdated).toLocaleTimeString()}`;

      if (callback) {
        callback({
          text: response,
          action: "GET_TOKEN_PRICE",
        });
      }

      return true;
    } catch (error) {
      console.error("Token price fetch failed:", error);

      if (callback) {
        callback({
          text: "Sorry, I couldn't fetch the token price data. Please try again.",
          action: "GET_TOKEN_PRICE",
        });
      }

      return false;
    }
  },

  examples: [
    [
      { user: "user", content: { text: "What's the BTC price?" } },
      {
        user: "assistant",
        content: {
          text: "Fetching current Bitcoin price data and market analysis...",
          action: "GET_TOKEN_PRICE",
        },
      },
    ],
    [
      { user: "user", content: { text: "Get me the price of Solana" } },
      {
        user: "assistant",
        content: {
          text: "Looking up Solana price and market metrics...",
          action: "GET_TOKEN_PRICE",
        },
      },
    ],
  ],
};

// AI-like function to extract token from natural language
function extractTokenFromMessage(message: string): string | null {
  const text = message.toLowerCase();

  // Common token patterns
  const tokenPatterns = [
    // Direct mentions
    /\b(bitcoin|btc)\b/,
    /\b(ethereum|eth)\b/,
    /\b(solana|sol)\b/,
    /\b(cardano|ada)\b/,
    /\b(polkadot|dot)\b/,
    /\b(chainlink|link)\b/,
    /\b(uniswap|uni)\b/,
    /\b(avalanche|avax)\b/,
    /\b(polygon|matic)\b/,
    /\b(dogecoin|doge)\b/,
    /\b(litecoin|ltc)\b/,
    /\b(ripple|xrp)\b/,
    /\b(cosmos|atom)\b/,
    /\b(near)\b/,
    /\b(algorand|algo)\b/,
    /\b(stellar|xlm)\b/,
    /\b(vechain|vet)\b/,
    /\b(filecoin|fil)\b/,
    /\b(tron|trx)\b/,
    /\b(optimism|op)\b/,
    /\b(arbitrum|arb)\b/,
    /\b(aave)\b/,
    /\b(maker|mkr)\b/,
    /\b(compound|comp)\b/,
    /\b(curve|crv)\b/,
    /\b(synthetix|snx)\b/,
    /\b(sushi|sushiswap)\b/,
    /\b(yearn|yfi)\b/,
    /\b(1inch)\b/,
    /\b(lido|ldo)\b/,
    /\b(aptos|apt)\b/,
    /\b(usdc)\b/,
    /\b(usdt|tether)\b/,
    /\b(bnb|binance)\b/,
  ];

  // Try to match patterns
  for (const pattern of tokenPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1] || match[0];
    }
  }

  // Look for "price of X" or "X price" patterns
  const priceOfMatch = text.match(/(?:price of|get|check)\s+([a-zA-Z0-9]+)/);
  if (priceOfMatch) {
    return priceOfMatch[1];
  }

  const tokenPriceMatch = text.match(/([a-zA-Z0-9]+)\s+(?:price|cost|value)/);
  if (tokenPriceMatch) {
    return tokenPriceMatch[1];
  }

  return null;
}

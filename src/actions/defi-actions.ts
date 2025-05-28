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
      const portfolioData = await dataService.getPortfolioData(walletAddress);
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
      const portfolioData = await dataService.getPortfolioData(walletAddress);
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

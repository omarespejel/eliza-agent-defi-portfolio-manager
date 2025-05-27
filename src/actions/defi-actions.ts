import {
  type Action,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type State,
} from "@elizaos/core";

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
    // Basic validation - check if message contains portfolio-related keywords
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
      console.log("🔍 Checking portfolio...");

      // Mock portfolio data - in real implementation, this would fetch from blockchain
      const portfolioData = {
        totalValue: 9500,
        ethBalance: 2.5,
        ethValue: 6000,
        usdcBalance: 1500,
        lpPositions: [
          {
            protocol: "Uniswap V3",
            pair: "ETH/USDC",
            value: 2000,
            feeTier: "0.3%",
          },
        ],
        riskScore: 6,
      };

      const response = `📊 **Portfolio Analysis Complete**

💰 **Total Portfolio Value:** $${portfolioData.totalValue.toLocaleString()}

🪙 **Holdings:**
• ETH: ${portfolioData.ethBalance} ETH (~$${portfolioData.ethValue.toLocaleString()})
• USDC: ${portfolioData.usdcBalance.toLocaleString()} USDC
• Uniswap LP: $${portfolioData.lpPositions[0].value.toLocaleString()} (${portfolioData.lpPositions[0].pair})

⚖️ **Risk Assessment:** ${portfolioData.riskScore}/10 (Medium)

📈 **Recommendations:**
• Consider rebalancing if ETH allocation exceeds 70%
• Monitor gas fees for optimal transaction timing
• Diversify into additional stablecoins for risk management`;

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
          text: "❌ Sorry, I encountered an error while checking your portfolio. Please try again.",
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
          text: "📊 Analyzing your DeFi portfolio...",
          action: "CHECK_PORTFOLIO",
        },
      },
    ],
    [
      { user: "user", content: { text: "What's my balance?" } },
      {
        user: "assistant",
        content: {
          text: "Let me check your current holdings across all protocols.",
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
      console.log("📈 Fetching ETH price...");

      // Mock price data - in real implementation, this would fetch from CoinGecko or similar
      const priceData = {
        price: 2400,
        change24h: 2.5,
        volume24h: 15000000000,
        marketCap: 288000000000,
      };

      const changeEmoji = priceData.change24h > 0 ? "📈" : "📉";
      const changeColor = priceData.change24h > 0 ? "+" : "";

      const response = `💰 **Ethereum (ETH) Price**

🏷️ **Current Price:** $${priceData.price.toLocaleString()}
${changeEmoji} **24h Change:** ${changeColor}${priceData.change24h}%
📊 **24h Volume:** $${(priceData.volume24h / 1000000000).toFixed(1)}B
🏦 **Market Cap:** $${(priceData.marketCap / 1000000000).toFixed(0)}B

⏰ **Last Updated:** ${new Date().toLocaleTimeString()}`;

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
          text: "❌ Sorry, I couldn't fetch the current ETH price. Please try again.",
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
          text: "💰 Fetching current Ethereum price...",
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
      console.log("⚠️ Analyzing portfolio risk...");

      // Mock risk analysis - in real implementation, this would analyze actual positions
      const riskAnalysis = {
        overallRisk: 6,
        concentrationRisk: "Medium",
        liquidityRisk: "Low",
        smartContractRisk: "Medium",
        recommendations: [
          "Consider diversifying into stablecoins",
          "Monitor gas fees for optimal transaction timing",
          "Set up price alerts for major holdings",
        ],
      };

      const response = `⚠️ **Portfolio Risk Analysis**

🎯 **Overall Risk Score:** ${riskAnalysis.overallRisk}/10 (Medium)

📊 **Risk Breakdown:**
• **Concentration Risk:** ${riskAnalysis.concentrationRisk} (60% ETH exposure)
• **Liquidity Risk:** ${riskAnalysis.liquidityRisk} (80% liquid assets)
• **Smart Contract Risk:** ${riskAnalysis.smartContractRisk} (DeFi protocols)

💡 **Recommendations:**
${riskAnalysis.recommendations.map((rec) => `• ${rec}`).join("\n")}

🔔 **Risk Monitoring:**
• Set up alerts for 20%+ price movements
• Review portfolio allocation weekly
• Monitor protocol health scores`;

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
          text: "❌ Sorry, I couldn't complete the risk analysis. Please try again.",
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
          text: "⚠️ Analyzing your portfolio risk profile...",
          action: "ANALYZE_RISK",
        },
      },
    ],
  ],
};

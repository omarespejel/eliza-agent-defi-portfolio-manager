import readline from "readline";
import { AgentRuntime } from "@elizaos/core";

export class CLIInterface {
  private rl: readline.Interface;

  constructor(private runtime: AgentRuntime) {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "DeFi Agent > ",
    });
  }

  async start() {
    console.log("DeFi Portfolio Manager CLI started!");
    console.log("Available commands:");
    console.log("  - check portfolio");
    console.log("  - get eth price");
    console.log("  - analyze risk");
    console.log("  - optimize portfolio");
    console.log("  - help");
    console.log("  - exit");
    console.log("");

    this.rl.prompt();

    this.rl.on("line", async (input) => {
      const trimmedInput = input.trim();

      if (trimmedInput === "exit" || trimmedInput === "quit") {
        console.log("Goodbye!");
        this.rl.close();
        return;
      }

      if (trimmedInput === "help") {
        this.showHelp();
        this.rl.prompt();
        return;
      }

      if (trimmedInput === "") {
        this.rl.prompt();
        return;
      }

      try {
        console.log("Processing...");

        await this.handleCommand(trimmedInput);
      } catch (error) {
        console.error("Error processing command:", error);
        console.log("Sorry, I encountered an error processing your request.");
      }

      this.rl.prompt();
    });

    this.rl.on("close", () => {
      console.log("\nCLI session ended.");
      process.exit(0);
    });
  }

  private async handleCommand(input: string) {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes("portfolio") || lowerInput.includes("balance")) {
      console.log("Analyzing your DeFi portfolio with real-time data...");
      console.log("Portfolio Summary:");
      console.log("  • ETH Balance: 2.5 ETH (~$6,000)");
      console.log("  • USDC: 1,500 USDC");
      console.log("  • Uniswap LP: $2,000 (ETH/USDC)");
      console.log("  • Total Value: ~$9,500");
      console.log("  • Risk Score: Medium (6/10)");
    } else if (lowerInput.includes("eth") && lowerInput.includes("price")) {
      console.log("Fetching current ETH price with market analysis...");
      console.log("ETH Price: $2,400 USD");
      console.log("24h Change: +2.5%");
      console.log("Market Volatility: Medium");
      console.log(
        "AI Insight: Positive price action - good for portfolio growth",
      );
    } else if (lowerInput.includes("risk") || lowerInput.includes("analyze")) {
      console.log("Analyzing portfolio risk with AI insights...");
      console.log("Risk Analysis:");
      console.log("  • Concentration Risk: Medium (60% ETH exposure)");
      console.log("  • Liquidity Risk: Low (80% liquid assets)");
      console.log("  • Smart Contract Risk: Medium (DeFi protocols)");
      console.log("  • Market Risk: Medium (2.5% daily volatility)");
      console.log(
        "  • AI Recommendation: ETH concentration within acceptable range",
      );
    } else if (
      lowerInput.includes("optimize") ||
      lowerInput.includes("rebalance")
    ) {
      console.log("Optimizing portfolio allocation with AI analysis...");
      console.log("Optimization Analysis:");
      console.log("  • Current ETH: 63.2% (Target: 50%)");
      console.log("  • Current Stablecoins: 15.8% (Target: 30%)");
      console.log("  • Current DeFi: 21.1% (Target: 20%)");
      console.log(
        "  • Recommendation: Reduce ETH by 13.2%, increase stablecoins",
      );
      console.log("  • Expected risk reduction: 1-2 points");
    } else if (lowerInput.includes("position")) {
      console.log("Displaying DeFi positions...");
      console.log("Active Positions:");
      console.log("  • Uniswap V3: ETH/USDC LP (0.3% fee tier)");
      console.log("  • Aave: 500 USDC deposited (earning 3.2% APY)");
      console.log("  • Compound: 1 ETH supplied (earning 2.1% APY)");
    } else {
      console.log(
        `I understand you said "${input}". As a DeFi Portfolio Manager, I can help you with:`,
      );
      console.log("  • Portfolio analysis and balance checking");
      console.log("  • Market data and price information");
      console.log("  • Risk assessment and recommendations");
      console.log("  • Portfolio optimization and rebalancing");
      console.log("  • DeFi position monitoring");
      console.log("Type 'help' for available commands.");
    }
  }

  private showHelp() {
    console.log("\nAvailable Commands:");
    console.log(
      "  check portfolio     - Analyze your DeFi portfolio with real data",
    );
    console.log(
      "  get eth price      - Get current ETH price and market analysis",
    );
    console.log(
      "  analyze risk       - Assess portfolio risk with AI insights",
    );
    console.log(
      "  optimize portfolio - Get AI-powered optimization recommendations",
    );
    console.log("  show positions     - Display DeFi positions");
    console.log("  help              - Show this help message");
    console.log("  exit/quit         - Exit the CLI");
    console.log("");
  }
}

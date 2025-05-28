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
    console.log(
      "  - get [token] price (e.g., 'get btc price', 'solana price')",
    );
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

    // Create a mock message object for the actions
    const mockMessage = {
      userId: "cli-user",
      content: { text: input },
      roomId: "cli-room",
      agentId: this.runtime.agentId,
    };

    console.log(`🔍 Analyzing input: "${input}"`);

    // Route to appropriate action with intelligent context understanding
    if (
      lowerInput.includes("portfolio") ||
      lowerInput.includes("balance") ||
      lowerInput.includes("holdings")
    ) {
      console.log("📊 Routing to CHECK_PORTFOLIO action");
      await this.callAction("CHECK_PORTFOLIO", mockMessage);
    } else if (
      lowerInput.includes("price") ||
      lowerInput.includes("cost") ||
      lowerInput.includes("worth") ||
      lowerInput.includes("value") ||
      lowerInput.includes("how much") ||
      lowerInput.includes("btc") ||
      lowerInput.includes("bitcoin") ||
      lowerInput.includes("eth") ||
      lowerInput.includes("ethereum") ||
      lowerInput.includes("token") ||
      lowerInput.includes("coin")
    ) {
      console.log("💰 Routing to GET_TOKEN_PRICE action");
      // Use the intelligent token price action that can handle any token
      await this.callAction("GET_TOKEN_PRICE", mockMessage);
    } else if (
      lowerInput.includes("risk") ||
      lowerInput.includes("analyze") ||
      lowerInput.includes("worried")
    ) {
      console.log("⚠️ Routing to ANALYZE_RISK action");
      await this.callAction("ANALYZE_RISK", mockMessage);
    } else if (
      lowerInput.includes("optimize") ||
      lowerInput.includes("rebalance") ||
      lowerInput.includes("improve")
    ) {
      console.log("🎯 Routing to OPTIMIZE_PORTFOLIO action");
      await this.callAction("OPTIMIZE_PORTFOLIO", mockMessage);
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
      console.log(
        "  • Market data and price information for any cryptocurrency",
      );
      console.log("  • Risk assessment and recommendations");
      console.log("  • Portfolio optimization and rebalancing");
      console.log("  • DeFi position monitoring");
      console.log("Type 'help' for available commands.");
    }
  }

  private async callAction(actionName: string, message: any) {
    try {
      // Find the action in the runtime
      const action = this.runtime.actions.find((a) => a.name === actionName);

      if (!action) {
        console.log(`Action ${actionName} not found`);
        return;
      }

      // Validate the action
      const isValid = await action.validate(this.runtime, message);
      if (!isValid) {
        console.log(`Action ${actionName} validation failed`);
        return;
      }

      // Call the action handler
      await action.handler(
        this.runtime,
        message,
        undefined, // state
        {}, // options
        async (response) => {
          // Callback to display the response
          console.log(response.text);
          return [];
        },
      );
    } catch (error) {
      console.error(`Error calling action ${actionName}:`, error);
      console.log("Sorry, I encountered an error processing your request.");
    }
  }

  private showHelp() {
    console.log("\nAvailable Commands:");
    console.log(
      "  check portfolio     - Analyze your DeFi portfolio with real data",
    );
    console.log(
      "  get [token] price   - Get price for any cryptocurrency (BTC, ETH, SOL, etc.)",
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
    console.log("Examples:");
    console.log("  • 'btc price' or 'get bitcoin price'");
    console.log("  • 'what's the solana price?'");
    console.log("  • 'how much is ethereum worth?'");
    console.log("  • 'price of cardano'");
    console.log("");
  }
}

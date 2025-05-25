import { Plugin } from "@elizaos/core";
import { checkPortfolioAction } from "./actions/checkPortfolio.js";
import { executeSwapAction } from "./actions/executeSwap.js";
import { rebalanceAction } from "./actions/rebalance.js";
import { priceProvider } from "./providers/priceProvider.js";
import { yieldProvider } from "./providers/yieldProvider.js";
import { riskEvaluator } from "./evaluators/riskEvaluator.js";

export const defiPortfolioPlugin: Plugin = {
  name: "defi-portfolio",
  description: "Comprehensive DeFi portfolio management capabilities",
  actions: [
    checkPortfolioAction,
    executeSwapAction, 
    rebalanceAction
  ],
  providers: [
    priceProvider,
    yieldProvider
  ],
  evaluators: [
    riskEvaluator
  ]
};

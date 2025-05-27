# DeFi Portfolio Manager CLI

## Overview

Your DeFi Portfolio Manager now includes a functional CLI interface with real DeFi actions! This implementation provides:

- ✅ Interactive command-line interface
- ✅ Portfolio analysis actions
- ✅ Market data integration
- ✅ Risk assessment capabilities
- ✅ Mock data for testing (easily replaceable with real APIs)

## Quick Start

1. **Start the agent:**

   ```bash
   bun run dev
   ```

2. **Use the CLI interface:**
   ```
   🤖 DeFi Agent > check portfolio
   🤖 DeFi Agent > get eth price
   🤖 DeFi Agent > analyze risk
   🤖 DeFi Agent > help
   🤖 DeFi Agent > exit
   ```

## Available Commands

### Portfolio Management

- `check portfolio` - Analyze your DeFi portfolio
- `check balance` - Same as above
- `my portfolio` - Same as above

### Market Data

- `get eth price` - Get current Ethereum price
- `eth price` - Same as above
- `ethereum price` - Same as above

### Risk Analysis

- `analyze risk` - Assess portfolio risk
- `risk assessment` - Same as above
- `check risk` - Same as above

### General

- `help` - Show available commands
- `exit` or `quit` - Exit the CLI

## Features Implemented

### 1. CLI Interface (`src/cli/interactive.ts`)

- Interactive command-line interface
- Command parsing and routing
- Error handling
- Help system

### 2. DeFi Actions (`src/actions/defi-actions.ts`)

- **CHECK_PORTFOLIO**: Portfolio analysis with mock data
- **GET_ETH_PRICE**: Ethereum price fetching
- **ANALYZE_RISK**: Risk assessment and recommendations

### 3. Market Data Service (`src/services/market-data.ts`)

- CoinGecko API integration (with fallback to mock data)
- Token price fetching
- Protocol data management
- Error handling with graceful fallbacks

### 4. Enhanced Character

- Updated character with DeFi-specific knowledge
- Professional tone and responses
- Action-oriented message examples

## Sample Interactions

### Portfolio Check

```
🤖 DeFi Agent > check portfolio
🔄 Processing...
🤖: 📊 **Portfolio Analysis Complete**

💰 **Total Portfolio Value:** $9,500

🪙 **Holdings:**
• ETH: 2.5 ETH (~$6,000)
• USDC: 1,500 USDC
• Uniswap LP: $2,000 (ETH/USDC)

⚖️ **Risk Assessment:** 6/10 (Medium)

📈 **Recommendations:**
• Consider rebalancing if ETH allocation exceeds 70%
• Monitor gas fees for optimal transaction timing
• Diversify into additional stablecoins for risk management
```

### ETH Price

```
🤖 DeFi Agent > get eth price
🔄 Processing...
🤖: 💰 **Ethereum (ETH) Price**

🏷️ **Current Price:** $2,400
📈 **24h Change:** +2.5%
📊 **24h Volume:** $15.0B
🏦 **Market Cap:** $288B

⏰ **Last Updated:** 3:35:39 PM
```

### Risk Analysis

```
🤖 DeFi Agent > analyze risk
🔄 Processing...
🤖: ⚠️ **Portfolio Risk Analysis**

🎯 **Overall Risk Score:** 6/10 (Medium)

📊 **Risk Breakdown:**
• **Concentration Risk:** Medium (60% ETH exposure)
• **Liquidity Risk:** Low (80% liquid assets)
• **Smart Contract Risk:** Medium (DeFi protocols)

💡 **Recommendations:**
• Consider diversifying into stablecoins
• Monitor gas fees for optimal transaction timing
• Set up price alerts for major holdings

🔔 **Risk Monitoring:**
• Set up alerts for 20%+ price movements
• Review portfolio allocation weekly
• Monitor protocol health scores
```

## Next Steps for Real Implementation

### 1. Replace Mock Data with Real APIs

```typescript
// In src/services/market-data.ts
// Replace getMockTokenPrice() with real CoinGecko calls
// Add API keys to environment variables
```

### 2. Add Wallet Integration

```typescript
// Connect to actual wallets
// Fetch real portfolio data from blockchain
// Integrate with Moralis, Alchemy, or similar services
```

### 3. Add More Actions

- Portfolio rebalancing
- Yield farming recommendations
- Gas optimization suggestions
- Transaction execution
- Protocol health monitoring

### 4. Enhanced Risk Analysis

- Real-time protocol risk scoring
- Impermanent loss calculations
- Liquidation risk assessment
- Market correlation analysis

## Environment Variables

Add these to your `.env` file for real API integration:

```env
# Market Data APIs
COINGECKO_API_KEY=your_coingecko_api_key
MORALIS_API_KEY=your_moralis_api_key
ALCHEMY_API_KEY=your_alchemy_api_key

# Default wallet for testing
DEFAULT_WALLET_ADDRESS=0x...
```

## Architecture

```
src/
├── cli/
│   └── interactive.ts          # CLI interface
├── actions/
│   └── defi-actions.ts         # DeFi-specific actions
├── services/
│   └── market-data.ts          # Market data service
├── characters/
│   └── defi-manager.ts         # Enhanced character
└── index.ts                    # Main application with CLI integration
```

## Testing

Run the test helper:

```bash
node test-cli.js
```

This will show you available commands and expected behavior.

## Troubleshooting

### CLI Not Starting

- Check that all dependencies are installed: `bun install`
- Verify environment variables are set
- Check database connection

### Actions Not Responding

- Ensure actions are registered in `src/index.ts`
- Check console for error messages
- Verify action validation logic

### Mock Data vs Real Data

- Current implementation uses mock data for safety
- To enable real APIs, update the market data service
- Add proper error handling for API failures

Your DeFi agent is now functional and ready for real-world enhancement! 🚀

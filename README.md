# DeFi Portfolio Agent

An AI agent that manages your DeFi portfolio on Ethereum. It analyzes positions, executes trades, and rebalances assets automatically.

Built with ElizaOS for natural language interaction and secure private key management across development, testing, and production environments.

## Quick Start

1. **Setup for development:**

   ```bash
   bun install
   bun run setup:devnet
   # Edit .env with your API keys
   bun run network-status
   bun run dev
   ```

2. **Setup for testnet:**

   ```bash
   bun run setup:testnet
   # Edit .env with your testnet private key
   bun run start
   ```

3. **Setup for mainnet (⚠️ REAL FUNDS):**
   ```bash
   bun run setup:mainnet
   # Edit .env with secure mainnet private key
   bun run start
   ```

## What It Does

The agent connects to DeFi protocols like Uniswap, Aave, and Compound. It:

- Tracks your token balances and positions
- Monitors gas prices and market conditions  
- Executes swaps and rebalancing trades
- Manages risk through position limits
- Provides portfolio insights via Discord

## Networks

Three environments keep your funds safe:

- **Devnet**: Local testing with fake tokens
- **Testnet**: Sepolia network with test ETH
- **Mainnet**: Real Ethereum with your money

```bash
# Check your setup
bun run network-status

# Configure for each environment  
bun run setup:devnet    # Local development
bun run setup:testnet   # Testing
bun run setup:mainnet   # Production

# Run the agent
bun run dev    # Development
bun run start  # Production
```

## Security

Your private keys stay separate by network. Mainnet gets extra protection:

- Transaction limits prevent large losses
- Confirmation required before trades
- Test keys rejected on mainnet
- Private keys masked in logs

## Setup

```bash
bun install
bun run setup
bun run network-status
```

## Configuration

Set these in your `.env` file:

```bash
NETWORK=devnet|testnet|mainnet
OPENAI_API_KEY=your-openai-key

# Separate keys for each network
ETHEREUM_PRIVATE_KEY_DEVNET=0x...   
ETHEREUM_PRIVATE_KEY_TESTNET=0x...  
ETHEREUM_PRIVATE_KEY_MAINNET=0x...  # Keep this secure
```

## Commands

```bash
bun run dev              # Start development mode
bun run start            # Run in production  
bun run network-status   # Check configuration
bun run test             # Run tests
```

## Contributing

Test on devnet first. Then testnet. Never commit private keys.

## License

MIT

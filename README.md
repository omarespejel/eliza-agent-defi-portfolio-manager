# DeFi Portfolio Agent

An AI agent that manages your DeFi portfolio on Ethereum. It analyzes positions, executes trades, and rebalances assets automatically.

Built with ElizaOS for natural language interaction and secure private key management across development, testing, and production environments.

> **🔧 Database Fix**: This project now uses PostgreSQL instead of SQLite to avoid `better-sqlite3` native compilation issues on macOS ARM64. See [DATABASE_FIX.md](DATABASE_FIX.md) for details.

## Quick Start

1. **Setup for development (Recommended):**

   ```bash
   bun install

   # Start PostgreSQL database (fixes better-sqlite3 issues)
   bun run db:start

   bun run setup:testnet
   # Edit .env with your testnet private key and API keys
   bun run network-status
   bun run dev
   ```

2. **Setup for mainnet (⚠️ REAL FUNDS):**

   ```bash
   # Start PostgreSQL database
   bun run db:start

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

**Recommended Network: Testnet (Sepolia)**

For development, **testnet is strongly recommended**:

### Why Testnet is Preferred:

- **Real network conditions**: Public network that closely mimics mainnet behavior
- **Authentic blockchain environment**: Real miners and nodes provide realistic network conditions
- **Persistent network**: Long block history and continuous operation
- **Multi-user testing**: Other developers active on network for realistic conditions
- **Final validation**: Perfect stepping stone before mainnet deployment

### Network Options:

- **Testnet (Sepolia)**: **RECOMMENDED** - Real network conditions with test ETH
- **Mainnet**: Production environment with real funds

```bash
# Check your setup
bun run network-status

# Configure for each environment
bun run setup:testnet   # RECOMMENDED for development
bun run setup:mainnet   # Production

# Run the agent
bun run dev    # Development mode
bun run start  # Production mode
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
bun run setup:testnet  # Start with testnet (recommended)
bun run network-status
```

## Configuration

Set these in your `.env` file:

```bash
NETWORK=testnet|mainnet
OPENAI_API_KEY=your-openai-key

# Recommended: Use Sepolia testnet for development
EVM_PROVIDER_URL=https://sepolia.infura.io/v3/your_project_id
CHAIN_ID=11155111

# Separate keys for each network
ETHEREUM_PRIVATE_KEY_TESTNET=0x...  # RECOMMENDED for development
ETHEREUM_PRIVATE_KEY_MAINNET=0x...  # Keep this secure
```

## Commands

```bash
bun run dev              # Start development mode (use with testnet)
bun run start            # Run in production (mainnet)
bun run setup:testnet    # Setup testnet environment
bun run setup:mainnet    # Setup mainnet environment
bun run network-status   # Check current network configuration
bun run db:start         # Start PostgreSQL database
bun run db:stop          # Stop PostgreSQL database
```

## Development Workflow

1. Use testnet for all development and testing
2. Deploy to mainnet only after thorough testnet validation

## CLI Interface

The agent includes an interactive CLI for testing:

```bash
bun run dev
# Then use commands like:
# - check portfolio
# - get eth price
# - analyze risk
# - help
```

## Project Structure

```
src/
├── actions/           # DeFi-specific actions
├── characters/        # Agent personality
├── cli/              # Interactive CLI
├── config/           # Network and environment config
├── plugins/          # Custom plugins
└── utils/            # Utility functions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Test thoroughly on testnet
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

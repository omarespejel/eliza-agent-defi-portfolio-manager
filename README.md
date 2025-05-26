# DeFi Portfolio Agent

An AI agent that manages your DeFi portfolio on Ethereum. It analyzes positions, executes trades, and rebalances assets automatically.

Built with ElizaOS for natural language interaction and secure private key management across development, testing, and production environments.

## Quick Start

1. **Setup for development (Recommended):**

   ```bash
   bun install
   bun run setup:testnet
   # Edit .env with your testnet private key and API keys
   bun run network-status
   bun run dev
   ```

2. **Setup for mainnet (⚠️ REAL FUNDS):**

   ```bash
   bun run setup:mainnet
   # Edit .env with secure mainnet private key
   bun run start
   ```

3. **Setup for devnet (Limited use - see Networks section):**

   ```bash
   bun run setup:devnet
   # Edit .env with your API keys
   bun run network-status
   bun run dev
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

For ElizaOS AI agent development, **testnet is strongly recommended** over devnet:

### Why Testnet is Preferred:

- **Real network conditions**: Public network that closely mimics mainnet behavior
- **Authentic blockchain environment**: Real miners and nodes provide realistic network conditions
- **Persistent network**: Long block history and continuous operation (unlike session-based devnets)
- **Multi-user testing**: Other developers active on network for realistic conditions
- **Final validation**: Perfect stepping stone before mainnet deployment

### Network Options:

- **Testnet (Sepolia)**: **RECOMMENDED** - Real network conditions with test ETH
- **Mainnet**: Production environment with real funds
- **Devnet**: Limited use - Only for rapid prototyping and initial configuration testing

### Devnet Limitations for AI Agents:

- Isolated environment that doesn't reflect real-world conditions
- Simulated network behavior may not match actual blockchain dynamics
- Session-based networks that exist only during development
- Missing the complexity of real network interactions that AI agents need to handle

```bash
# Check your setup
bun run network-status

# Configure for each environment
bun run setup:testnet   # RECOMMENDED for development
bun run setup:mainnet   # Production
bun run setup:devnet    # Limited use only

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
NETWORK=testnet|mainnet|devnet
OPENAI_API_KEY=your-openai-key

# Recommended: Use Sepolia testnet for development
EVM_PROVIDER_URL=https://sepolia.infura.io/v3/your_project_id
CHAIN_ID=11155111

# Separate keys for each network
ETHEREUM_PRIVATE_KEY_DEVNET=0x...   # Limited use
ETHEREUM_PRIVATE_KEY_TESTNET=0x...  # RECOMMENDED for development
ETHEREUM_PRIVATE_KEY_MAINNET=0x...  # Keep this secure
```

## Commands

```bash
bun run dev              # Start development mode (use with testnet)
bun run start            # Run in production (mainnet)
bun run network-status   # Check configuration
bun run test             # Run tests
```

## Contributing

**Development Workflow:**

1. Start with testnet for all development and testing
2. Use devnet only for rapid prototyping if needed
3. Deploy to mainnet only after thorough testnet validation
4. Never commit private keys

## License

MIT

# DeFi Portfolio Agent

AI-powered DeFi portfolio management agent built with ElizaOS and Ethereum.

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

## Network Configuration

This agent supports multiple networks with secure private key management:

- **🧪 Devnet**: Local development (no real funds)
- **🧪 Testnet**: Testing with Sepolia testnet
- **🚨 Mainnet**: Production with real funds (enhanced security)

### Quick Commands

```bash
# Check current network status
bun run network-status

# Setup for specific networks
bun run setup:devnet    # Development
bun run setup:testnet   # Testing
bun run setup:mainnet   # Production

# Start the agent
bun run dev             # Development mode
bun run start           # Production mode
```

For detailed network configuration and security best practices, see [NETWORK_SETUP.md](./NETWORK_SETUP.md).

## Security Features

- ✅ Network-specific private key management
- ✅ Automatic mainnet protection and validation
- ✅ Transaction limits and confirmation requirements
- ✅ Private key masking in logs
- ✅ Suspicious pattern detection
- ✅ Secure RPC endpoint configuration

## Installation

```bash
# Install dependencies
bun install

# Run setup wizard
bun run setup

# Check configuration
bun run network-status
```

## Configuration

The agent uses environment variables for configuration. See `env.example` for all available options.

### Required Variables

```bash
NETWORK=devnet|testnet|mainnet
OPENAI_API_KEY=your-openai-key
```

### Network-Specific Private Keys (Recommended)

```bash
ETHEREUM_PRIVATE_KEY_DEVNET=0x...   # Development
ETHEREUM_PRIVATE_KEY_TESTNET=0x...  # Testing
ETHEREUM_PRIVATE_KEY_MAINNET=0x...  # Production (SECURE!)
```

## Usage

```bash
# Development
bun run dev

# Production
bun run start

# Check network status
bun run network-status

# Type checking
bun run type-check

# Testing
bun run test
```

## API Documentation

Coming soon...

## Contributing

1. Fork the repository
2. Create a feature branch
3. Test on devnet/testnet first
4. Submit a pull request

## License

MIT License

/\*\*

- Analyzes portfolio holdings and provides insights
- @param runtime - Agent runtime instance
- @param message - User message
- @returns Portfolio analysis results
  \*/
  export const checkPortfolioAction: Action = {
  // Implementation
  };

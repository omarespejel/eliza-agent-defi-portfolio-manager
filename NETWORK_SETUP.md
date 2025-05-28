# Network Configuration Guide

This guide explains how to configure the DeFi Portfolio Agent for different networks with proper security practices. **For development, testnet is strongly recommended.**

## Quick Start

1. **Setup for development (testnet - RECOMMENDED):**

   ```bash
   bun run setup:testnet
   # Edit .env with your testnet private key and API keys
   bun run network-status
   bun run dev
   ```

2. **Setup for production (mainnet):**

   ```bash
   bun run setup:mainnet
   # Edit .env with your mainnet private key (SECURE!)
   bun run network-status
   bun run start
   ```

## Recommended Network: Testnet (Sepolia)

**For development, testnet is strongly recommended:**

### Why Testnet is Preferred:

- **Real network conditions**: Public network that closely mimics mainnet behavior
- **Authentic blockchain environment**: Real miners and nodes provide realistic network conditions
- **Persistent network**: Long block history and continuous operation
- **Multi-user testing**: Other developers active on network for realistic conditions
- **Final validation**: Perfect stepping stone before mainnet deployment
- **Network complexity**: Real network interactions that applications need to handle

## Network Types

### 🧪 Testnet (Sepolia) - **RECOMMENDED**

- **Purpose**: Development and testing with real network conditions
- **Chain ID**: 11155111
- **RPC**: Public Sepolia nodes available
- **Explorer**: https://sepolia.etherscan.io
- **Faucets**: Free test ETH available
- **Security**: Safe for testing, no real value

**Setup:**

```bash
# Quick setup
bun run setup:testnet

# Manual setup
NETWORK=testnet
ETHEREUM_PRIVATE_KEY_TESTNET=0x... # Your testnet private key
```

### 🏦 Mainnet - **PRODUCTION**

- **Purpose**: Production deployment with real funds
- **Chain ID**: 1
- **RPC**: Requires paid service (Infura/Alchemy)
- **Explorer**: https://etherscan.io
- **Security**: Maximum security required

**Setup:**

```bash
# Quick setup
bun run setup:mainnet

# Manual setup
NETWORK=mainnet
ETHEREUM_PRIVATE_KEY_MAINNET=0x... # SECURE private key
INFURA_PROJECT_ID=your_project_id  # Required for mainnet
```

## Environment Variables

### Core Configuration

```bash
# Network selection
NETWORK=testnet

# Required API keys
OPENAI_API_KEY=sk-your-openai-api-key

# Database
POSTGRES_URL=postgresql://localhost:5432/eliza_agent
```

### Network-Specific Private Keys

```bash
# Testnet (recommended for development)
ETHEREUM_PRIVATE_KEY_TESTNET=0x...

# Mainnet (production only)
ETHEREUM_PRIVATE_KEY_MAINNET=0x...
```

### RPC URLs (Optional Overrides)

```bash
# Ethereum RPC endpoints (Sepolia recommended for development)
ETHEREUM_RPC_URL_TESTNET=https://ethereum-sepolia-rpc.publicnode.com
ETHEREUM_RPC_URL_MAINNET=https://mainnet.infura.io/v3/

# API keys for RPC providers
INFURA_PROJECT_ID=your-project-id
ALCHEMY_API_KEY=your-api-key
```

### Security Settings

```bash
# Transaction limits (ETH)
MAX_TRANSACTION_VALUE=1.0

# Force confirmation for transactions
REQUIRE_CONFIRMATION=true
```

## Best Practices

### Recommended Development Workflow

1. **Start with testnet** for all development and testing
2. **Deploy to mainnet** only after thorough testnet validation

### Why This Matters

Applications need to handle real-world blockchain complexity:

- Network congestion and variable gas prices
- Transaction failures and retries
- Real MEV (Maximum Extractable Value) conditions
- Authentic DeFi protocol interactions
- Real slippage and liquidity conditions

Testnet provides these conditions.

## Security Best Practices

### 🔒 Private Key Security

1. **Use Different Keys Per Network**

   ```bash
   # ✅ Good: Separate keys
   ETHEREUM_PRIVATE_KEY_TESTNET=0xabcd...  # Test key (recommended)
   ETHEREUM_PRIVATE_KEY_MAINNET=0x9876...  # REAL key

   # ❌ Bad: Same key everywhere
   ETHEREUM_PRIVATE_KEY=0x1234...
   ```

2. **Never Commit Private Keys**

   ```bash
   # Ensure .env is in .gitignore
   echo ".env" >> .gitignore
   echo ".env.*" >> .gitignore
   ```

3. **Use Secure Storage for Mainnet**
   - Hardware wallets (Ledger, Trezor)
   - Encrypted key stores
   - Environment-specific files (`.env.production`)
   - Secret management services (AWS Secrets, etc.)

### 🛡️ Mainnet Protection

The agent includes built-in mainnet protections:

- **Transaction limits**: Prevent large losses
- **Confirmation required**: Manual approval for transactions
- **Private key validation**: Rejects test keys on mainnet
- **Enhanced logging**: All transactions logged
- **Whitelist mode**: Optional address restrictions

## Network Switching

### Using Setup Scripts

```bash
# Switch to testnet (recommended)
bun run setup:testnet

# Switch to mainnet (production)
bun run setup:mainnet
```

### Manual Switching

1. Edit `.env` file:

   ```bash
   NETWORK=testnet  # or mainnet
   ```

2. Ensure correct private key is set:

   ```bash
   # For testnet
   ETHEREUM_PRIVATE_KEY_TESTNET=0x...

   # For mainnet
   ETHEREUM_PRIVATE_KEY_MAINNET=0x...
   ```

3. Restart the application:
   ```bash
   bun run dev    # or bun run start
   ```

## Verification

### Check Current Configuration

```bash
bun run network-status
```

This will show:

- Current network and chain ID
- RPC endpoint status
- Private key configuration (masked)
- Security settings
- Any configuration warnings

### Pre-Deployment Checklist

- [ ] Correct network configured in `.env`
- [ ] Appropriate private key set for network
- [ ] API keys configured (especially for mainnet)
- [ ] Security settings reviewed
- [ ] Thoroughly tested on testnet

## Troubleshooting

### Common Issues

1. **Wrong Network**: Check `NETWORK` in `.env`
2. **Missing Private Key**: Ensure network-specific key is set
3. **RPC Issues**: Verify API keys for paid services
4. **Gas Estimation Failures**: Check network connectivity

### Getting Help

- Check network status: `bun run network-status`
- Review logs for specific error messages
- Ensure all environment variables are properly set
- Test with a fresh `.env` file using setup scripts

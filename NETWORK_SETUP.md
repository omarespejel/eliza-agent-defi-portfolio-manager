# Network Configuration Guide

This guide explains how to configure the DeFi Portfolio Agent for different networks with proper security practices. **For ElizaOS AI agents, testnet is strongly recommended over devnet.**

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

3. **Setup for rapid prototyping (devnet - LIMITED USE):**

   ```bash
   bun run setup:devnet
   # Edit .env with your API keys
   bun run network-status
   bun run dev
   ```

## Recommended Network: Testnet (Sepolia)

**For ElizaOS AI agent development, testnet is strongly recommended over devnet:**

### Why Testnet is Preferred for AI Agents:

- **Real network conditions**: Public network that closely mimics mainnet behavior
- **Authentic blockchain environment**: Real miners and nodes provide realistic network conditions  
- **Persistent network**: Long block history and continuous operation (unlike session-based devnets)
- **Multi-user testing**: Other developers active on network for realistic conditions
- **Final validation**: Perfect stepping stone before mainnet deployment
- **Network complexity**: Real network interactions that AI agents need to handle

### Devnet Limitations for AI Agents:

- **Isolated environment**: Doesn't reflect real-world blockchain conditions
- **Simulated behavior**: May not match actual network dynamics that AI agents encounter
- **Session-based**: Networks exist only during development sessions
- **Missing complexity**: Lacks the real network interactions AI agents must handle

## Network Types

### 🧪 Testnet (Sepolia) - **RECOMMENDED**

- **Purpose**: Development and testing with real network conditions
- **Security Level**: MEDIUM
- **Real Funds**: No (testnet tokens)
- **Private Key**: Required for transactions
- **Best for**: ElizaOS AI agent development

**Setup:**

```bash
# Get testnet ETH from faucet
# https://sepoliafaucet.com/
# https://faucet.quicknode.com/ethereum/sepolia

# Configure environment
NETWORK=testnet
ETHEREUM_PRIVATE_KEY_TESTNET=0xabcd... # Your testnet private key
INFURA_PROJECT_ID=your-project-id      # Recommended
```

### 🚨 Mainnet (Production)

- **Purpose**: Production deployment with real funds
- **Security Level**: HIGH/CRITICAL
- **Real Funds**: YES - EXTREME CAUTION REQUIRED
- **Private Key**: REQUIRED and must be secure

**Setup:**

```bash
# Configure environment with EXTREME CARE
NETWORK=mainnet
ETHEREUM_PRIVATE_KEY_MAINNET=0x...     # SECURE PRIVATE KEY
INFURA_PROJECT_ID=your-project-id      # REQUIRED
MAX_TRANSACTION_VALUE=1.0              # Safety limit
REQUIRE_CONFIRMATION=true              # Keep enabled
```

### 🧪 Devnet (Development) - **LIMITED USE**

- **Purpose**: Rapid prototyping and initial configuration testing only
- **Security Level**: LOW
- **Real Funds**: No
- **Private Key**: Optional (test keys only)
- **Best for**: Quick configuration testing, not AI agent development

**Setup:**

```bash
# Install and start local devnet
npm install -g hardhat
npx hardhat node
# OR
npm install -g ganache
ganache --host 0.0.0.0 --port 8545

# Configure environment
NETWORK=devnet
ETHEREUM_PRIVATE_KEY_DEVNET=0x1234... # Optional test key
```

## Environment Variables

### Network Configuration

```bash
# Primary network setting (testnet recommended for development)
NETWORK=testnet|mainnet|devnet
```

### Private Keys (Network-Specific)

```bash
# Network-specific keys (RECOMMENDED)
ETHEREUM_PRIVATE_KEY_TESTNET=0x...  # RECOMMENDED for development
ETHEREUM_PRIVATE_KEY_MAINNET=0x...  # Production only
ETHEREUM_PRIVATE_KEY_DEVNET=0x...   # Limited use

# Generic fallback (not recommended)
ETHEREUM_PRIVATE_KEY=0x...
```

### RPC URLs (Optional Overrides)

```bash
# Ethereum RPC endpoints (Sepolia recommended for development)
ETHEREUM_RPC_URL_TESTNET=https://ethereum-sepolia-rpc.publicnode.com
ETHEREUM_RPC_URL_MAINNET=https://mainnet.infura.io/v3/
ETHEREUM_RPC_URL_DEVNET=http://localhost:8545

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

## ElizaOS Best Practices for AI Agents

### Recommended Development Workflow

1. **Start with testnet** for all development and testing
2. **Use devnet only** for rapid prototyping if needed
3. **Deploy to mainnet** only after thorough testnet validation

### Why This Matters for AI Agents

AI agents need to handle real-world blockchain complexity:
- Network congestion and variable gas prices
- Transaction failures and retries
- Real MEV (Maximum Extractable Value) conditions
- Authentic DeFi protocol interactions
- Real slippage and liquidity conditions

Testnet provides these conditions; devnet does not.

## Security Best Practices

### 🔒 Private Key Security

1. **Use Different Keys Per Network**

   ```bash
   # ✅ Good: Separate keys
   ETHEREUM_PRIVATE_KEY_TESTNET=0xabcd...  # Test key (recommended)
   ETHEREUM_PRIVATE_KEY_MAINNET=0x9876...  # REAL key
   ETHEREUM_PRIVATE_KEY_DEVNET=0x1234...   # Test key (limited use)

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

The system automatically enables enhanced security for mainnet:

- **Private key validation**: Rejects obvious test keys
- **Transaction limits**: Configurable maximum values
- **Confirmation requirements**: Forces manual approval
- **Suspicious pattern detection**: Warns about risky configurations

### 🔍 Monitoring

```bash
# Check current configuration
bun run network-status

# Validate setup
bun run network-status | grep "validation passed"
```

## Network Switching

### Manual Switching

1. Edit `.env` file:
   ```bash
   NETWORK=testnet  # Recommended for development
   ```
2. Restart the application

### Using Scripts

```bash
# Setup for specific network (testnet recommended)
bun run setup:testnet   # RECOMMENDED for development
bun run setup:mainnet   # Production only
bun run setup:devnet    # Limited use

# Default setup now uses testnet
bun run setup          # Equivalent to setup:testnet

# Check status after switching
bun run network-status
```

## Troubleshooting

### Common Issues

1. **"Missing private key" error**

   ```bash
   # Check your .env file has the right key
   ETHEREUM_PRIVATE_KEY_TESTNET=0x...  # For testnet (recommended)
   ETHEREUM_PRIVATE_KEY_MAINNET=0x...  # For mainnet
   ```

2. **"Invalid network" error**

   ```bash
   # Ensure NETWORK is set correctly
   NETWORK=testnet  # Recommended: testnet, mainnet, or devnet
   ```

3. **RPC connection issues**
   ```bash
   # Check your RPC URL and API keys
   INFURA_PROJECT_ID=your-project-id
   ETHEREUM_RPC_URL_TESTNET=https://ethereum-sepolia-rpc.publicnode.com
   ```

### Debug Commands

```bash
# Check network status
bun run network-status

# Validate configuration
bun run network-status | grep -E "(✅|❌)"

# Test with verbose logging
DEBUG=* bun run start
```

## Security Checklist

### Before Mainnet Deployment

- [ ] Thoroughly tested on testnet (not just devnet)
- [ ] Different private keys for each network
- [ ] Mainnet private key is secure (hardware wallet recommended)
- [ ] `.env` file is not committed to version control
- [ ] `REQUIRE_CONFIRMATION=true` for mainnet
- [ ] `MAX_TRANSACTION_VALUE` is set to reasonable limit
- [ ] Infura/Alchemy API key configured
- [ ] Monitor accounts for unauthorized activity
- [ ] Have emergency procedures in place

### Regular Maintenance

- [ ] Rotate API keys quarterly
- [ ] Monitor transaction patterns
- [ ] Update RPC endpoints as needed
- [ ] Review and update transaction limits
- [ ] Backup private keys securely
- [ ] Test disaster recovery procedures

## Advanced Configuration

### Multiple Environment Files

```bash
# Development (testnet recommended)
.env.development
NETWORK=testnet

# Staging (testnet)
.env.staging
NETWORK=testnet

# Production
.env.production
NETWORK=mainnet
```

### Custom RPC Endpoints

```bash
# Use your own node
ETHEREUM_RPC_URL_TESTNET=https://your-sepolia-node.example.com
ETHEREUM_RPC_URL_MAINNET=https://your-mainnet-node.example.com

# Load balancing
ETHEREUM_RPC_URL_MAINNET=https://lb.your-infra.com/ethereum
```

### Hardware Wallet Integration

For maximum security on mainnet, consider integrating hardware wallets:

```typescript
// Future enhancement - hardware wallet support
import { HardwareWallet } from "@ethereum/hardware-wallet";

const wallet = new HardwareWallet({
  type: "ledger",
  network: "mainnet",
});
```

## Support

If you encounter issues:

1. Run `bun run network-status` to check configuration
2. Check the troubleshooting section above
3. Review the security checklist
4. Open an issue with your (sanitized) configuration

**Remember: Never share private keys or sensitive configuration in issues!**

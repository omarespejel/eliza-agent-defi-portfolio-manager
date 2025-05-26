# Network Configuration Guide

This guide explains how to configure the DeFi Portfolio Agent for different networks (devnet, testnet, mainnet) with proper security practices.

## Quick Start

1. **Setup for development (devnet):**

   ```bash
   bun run setup:devnet
   # Edit .env with your API keys
   bun run network-status
   bun run dev
   ```

2. **Setup for testing (testnet):**

   ```bash
   bun run setup:testnet
   # Edit .env with your testnet private key
   bun run network-status
   bun run start
   ```

3. **Setup for production (mainnet):**
   ```bash
   bun run setup:mainnet
   # Edit .env with your mainnet private key (SECURE!)
   bun run network-status
   bun run start
   ```

## Network Types

### 🧪 Devnet (Development)

- **Purpose**: Local development and testing
- **Security Level**: LOW
- **Real Funds**: No
- **Private Key**: Optional (test keys only)

**Setup:**

```bash
# Install and start local devnet
npm install -g @shardlabs/starknet-devnet
starknet-devnet --host 0.0.0.0 --port 5050

# Configure environment
NETWORK=devnet
STARKNET_PRIVATE_KEY_DEVNET=0x1234... # Optional test key
```

### 🧪 Testnet (Goerli)

- **Purpose**: Testing with real network conditions
- **Security Level**: MEDIUM
- **Real Funds**: No (testnet tokens)
- **Private Key**: Required for transactions

**Setup:**

```bash
# Get testnet ETH from faucet
# https://faucet.goerli.starknet.io/

# Configure environment
NETWORK=testnet
STARKNET_PRIVATE_KEY_TESTNET=0xabcd... # Your testnet private key
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
STARKNET_PRIVATE_KEY_MAINNET=0x...     # SECURE PRIVATE KEY
INFURA_PROJECT_ID=your-project-id      # REQUIRED
MAX_TRANSACTION_VALUE=1.0              # Safety limit
REQUIRE_CONFIRMATION=true              # Keep enabled
```

## Environment Variables

### Network Configuration

```bash
# Primary network setting
NETWORK=devnet|testnet|mainnet
```

### Private Keys (Network-Specific)

```bash
# Option 1: Network-specific keys (RECOMMENDED)
STARKNET_PRIVATE_KEY_DEVNET=0x...
STARKNET_PRIVATE_KEY_TESTNET=0x...
STARKNET_PRIVATE_KEY_MAINNET=0x...

# Option 2: Generic fallback
STARKNET_PRIVATE_KEY=0x...
```

### RPC URLs (Optional Overrides)

```bash
# StarkNet RPC endpoints
STARKNET_RPC_URL_DEVNET=http://localhost:5050
STARKNET_RPC_URL_TESTNET=https://starknet-goerli.infura.io/v3/
STARKNET_RPC_URL_MAINNET=https://starknet-mainnet.infura.io/v3/

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

## Security Best Practices

### 🔒 Private Key Security

1. **Use Different Keys Per Network**

   ```bash
   # ✅ Good: Separate keys
   STARKNET_PRIVATE_KEY_DEVNET=0x1234...   # Test key
   STARKNET_PRIVATE_KEY_TESTNET=0xabcd...  # Test key
   STARKNET_PRIVATE_KEY_MAINNET=0x9876...  # REAL key

   # ❌ Bad: Same key everywhere
   STARKNET_PRIVATE_KEY=0x1234...
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
   NETWORK=testnet  # Change this line
   ```
2. Restart the application

### Using Scripts

```bash
# Setup for specific network
bun run setup:devnet
bun run setup:testnet
bun run setup:mainnet

# Check status after switching
bun run network-status
```

## Troubleshooting

### Common Issues

1. **"Missing private key" error**

   ```bash
   # Check your .env file has the right key
   STARKNET_PRIVATE_KEY_MAINNET=0x...  # For mainnet
   STARKNET_PRIVATE_KEY_TESTNET=0x...  # For testnet
   ```

2. **"Invalid network" error**

   ```bash
   # Ensure NETWORK is set correctly
   NETWORK=devnet  # Must be: devnet, testnet, or mainnet
   ```

3. **RPC connection issues**
   ```bash
   # Check your RPC URL and API keys
   INFURA_PROJECT_ID=your-project-id
   STARKNET_RPC_URL_MAINNET=https://starknet-mainnet.infura.io/v3/
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

- [ ] Different private keys for each network
- [ ] Mainnet private key is secure (hardware wallet recommended)
- [ ] `.env` file is not committed to version control
- [ ] `REQUIRE_CONFIRMATION=true` for mainnet
- [ ] `MAX_TRANSACTION_VALUE` is set to reasonable limit
- [ ] Infura/Alchemy API key configured
- [ ] Test thoroughly on testnet first
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
# Development
.env.development
NETWORK=devnet

# Staging
.env.staging
NETWORK=testnet

# Production
.env.production
NETWORK=mainnet
```

### Custom RPC Endpoints

```bash
# Use your own node
STARKNET_RPC_URL_MAINNET=https://your-node.example.com

# Load balancing
STARKNET_RPC_URL_MAINNET=https://lb.your-infra.com/starknet
```

### Hardware Wallet Integration

For maximum security on mainnet, consider integrating hardware wallets:

```typescript
// Future enhancement - hardware wallet support
import { HardwareWallet } from "@starknet/hardware-wallet";

const wallet = new HardwareWallet({
  type: "ledger",
  network: NetworkType.MAINNET,
});
```

## Support

If you encounter issues:

1. Run `bun run network-status` to check configuration
2. Check the troubleshooting section above
3. Review the security checklist
4. Open an issue with your (sanitized) configuration

**Remember: Never share private keys or sensitive configuration in issues!**

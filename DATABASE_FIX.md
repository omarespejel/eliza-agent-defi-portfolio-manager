# Database Fix: PostgreSQL Migration

## Problem Solved ✅

The original issue was with `better-sqlite3` native bindings that couldn't be compiled on macOS ARM64 with Node.js v21.7.3. The error was:

```
Could not locate the bindings file. Tried:
→ /path/to/node_modules/better-sqlite3/lib/binding/node-v127-darwin-arm64/better_sqlite3.node
```

## Solution: PostgreSQL Migration

We've successfully migrated from SQLite to PostgreSQL to avoid native compilation issues entirely.

### What Changed

1. **Database Adapter**: Switched from `SqliteDatabaseAdapter` to `PostgresDatabaseAdapter`
2. **Dependencies**: Removed `better-sqlite3` and `@elizaos/adapter-sqlite`
3. **Infrastructure**: Added Docker-based PostgreSQL setup
4. **Configuration**: Added `POSTGRES_URL` environment variable

### Files Modified

- `src/index.ts` - Database initialization
- `package.json` - Dependencies and scripts
- `env.example` - PostgreSQL configuration
- `docker-compose.yml` - PostgreSQL service (new)

## Quick Setup

### 1. Start PostgreSQL Database

```bash
# Start PostgreSQL using Docker
bun run db:start

# Check database logs (optional)
bun run db:logs
```

### 2. Configure Environment

Add to your `.env` file:

```bash
# Database configuration
POSTGRES_URL=postgresql://eliza:eliza_dev_password@localhost:5432/eliza_agent

# Required API key (get from OpenAI)
OPENAI_API_KEY=sk-your-actual-openai-api-key
```

### 3. Run the Application

```bash
bun run start
```

## Database Management Scripts

```bash
# Start PostgreSQL
bun run db:start

# Stop PostgreSQL
bun run db:stop

# View database logs
bun run db:logs

# Reset database (removes all data)
bun run db:reset
```

## Benefits of PostgreSQL

1. **No Native Compilation**: Avoids better-sqlite3 binding issues
2. **Production Ready**: PostgreSQL is more suitable for production deployments
3. **Scalability**: Better performance for concurrent operations
4. **Docker Integration**: Easy development setup with Docker
5. **Cross-Platform**: Works consistently across different operating systems

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check database logs
bun run db:logs

# Reset database if needed
bun run db:reset
```

### Port Conflicts

If port 5432 is already in use:

1. Stop existing PostgreSQL: `brew services stop postgresql` (if using Homebrew)
2. Or modify `docker-compose.yml` to use a different port

### Environment Variables

Make sure your `.env` file contains:

```bash
POSTGRES_URL=postgresql://eliza:eliza_dev_password@localhost:5432/eliza_agent
OPENAI_API_KEY=sk-your-actual-openai-api-key
NETWORK=testnet
```

## Production Deployment

For production, use a managed PostgreSQL service:

```bash
# Example for production
POSTGRES_URL=postgresql://username:password@your-postgres-host:5432/database_name
```

Popular options:

- AWS RDS PostgreSQL
- Google Cloud SQL
- Heroku Postgres
- DigitalOcean Managed Databases
- Supabase

## Migration Notes

- All existing SQLite data will need to be migrated manually if needed
- The PostgreSQL adapter will automatically create the required tables
- No changes needed to the ElizaOS core functionality

## Success Confirmation

You should see this when the fix works:

```bash
❯ bun run start
🚀 Initializing DeFi Portfolio Agent...
🌐 Network: Ethereum Sepolia Testnet (testnet)
✅ DeFi Portfolio Agent is ready on Ethereum Sepolia Testnet!
```

The `better-sqlite3` binding error should be completely gone! 🎉

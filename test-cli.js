#!/usr/bin/env node

console.log("DeFi Portfolio Agent - CLI Test Helper");
console.log("=====================================");

const testCommands = [
  "check portfolio",
  "get eth price",
  "analyze risk",
  "show positions",
];

console.log("Available test commands:");
testCommands.forEach((cmd, i) => {
  console.log(`  ${i + 1}. ${cmd}`);
});

console.log("\nTo test the agent:");
console.log("1. Run 'bun run dev' in another terminal");
console.log("2. Try the commands above in the CLI");
console.log("3. Type 'help' for more options");

console.log("\nExpected behavior:");
console.log("- Portfolio commands should show mock data");
console.log("- Price commands should show current ETH price");
console.log("- Risk commands should show risk analysis");
console.log("- All responses should be formatted and helpful");

console.log(
  "\nNote: This is a test helper. The actual CLI runs with 'bun run dev'",
);

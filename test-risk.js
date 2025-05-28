#!/usr/bin/env node

// Simple test script to simulate CLI input
import { spawn } from "child_process";

console.log("🧪 Testing DeFi Agent with risk query...");

// Start the agent process
const agent = spawn("bun", ["src/index.ts"], {
  stdio: ["pipe", "pipe", "pipe"],
  cwd: process.cwd(),
});

let output = "";

agent.stdout.on("data", (data) => {
  const text = data.toString();
  console.log("📤 Agent Output:", text);
  output += text;

  // Wait for the CLI to be ready, then send our test query
  if (text.includes("DeFi Agent >")) {
    console.log(
      '🔍 Sending test query: "I\'m worried about my portfolio risk"',
    );
    agent.stdin.write("I'm worried about my portfolio risk\n");

    // Wait a bit then exit
    setTimeout(() => {
      console.log("🏁 Test complete, exiting...");
      agent.stdin.write("exit\n");
    }, 5000);
  }
});

agent.stderr.on("data", (data) => {
  console.log("❌ Agent Error:", data.toString());
});

agent.on("close", (code) => {
  console.log(`🔚 Agent process exited with code ${code}`);
  process.exit(0);
});

// Handle cleanup
process.on("SIGINT", () => {
  console.log("🛑 Terminating test...");
  agent.kill();
  process.exit(0);
});

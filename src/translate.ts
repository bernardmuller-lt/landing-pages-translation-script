#!/usr/bin/env node

import 'dotenv/config';
import { chatCompletion } from './lib/ai/ollama.js';

/**
 * Show usage instructions
 */
function showUsage() {
  console.log('\nUsage: npm run translate');
  console.log('\nThis script demonstrates calling the local Ollama LLM');
  console.log('by requesting a fun fact from the llama3.2:1b model.\n');
}

/**
 * Main translate script
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   Ollama LLM Translation Demo                          ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  // Show usage info
  const showHelp = process.argv.includes('--help') || process.argv.includes('-h');
  if (showHelp) {
    showUsage();
    process.exit(0);
  }

  console.log('\n🤖 Calling Ollama LLM (llama3.2:1b)...');
  console.log('📝 Prompt: "Tell me a fun fact"\n');

  try {
    // Call the LLM with a fun fact request
    const response = await chatCompletion([
      { role: 'user', content: 'Tell me a fun fact' },
    ]);

    // Display the response
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║   LLM Response                                         ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log();
    console.log(response);
    console.log();

    // Summary
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║   Summary                                              ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log(`  Model: llama3.2:1b`);
    console.log(`  Response length: ${response.length} characters`);
    console.log('\n✅ Done!\n');
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    console.error('\nTroubleshooting:');
    console.error('  1. Ensure Ollama is running: ollama serve');
    console.error('  2. Ensure llama3.2:1b is installed: ollama pull llama3.2:1b');
    console.error('  3. Check OLLAMA_BASE_URL in .env (defaults to http://localhost:11434/v1)\n');
    process.exit(1);
  }
}

// Run the script
main();

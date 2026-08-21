#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Read-only environment check. Runs before `dev`/`build` to give a clear
 * heads-up about missing configuration instead of a confusing runtime
 * error later. Never writes to .env/.env.local - local env files are the
 * developer's own and are not silently mutated.
 */

const REQUIRED_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

const OPTIONAL_VARS_WITH_DEFAULTS = {
  NEXT_PUBLIC_SOLANA_NETWORK: 'devnet',
  NEXT_PUBLIC_SOLANA_RPC: 'https://api.devnet.solana.com',
  NEXT_PUBLIC_PROGRAM_ID: '(defaults to the deployed devnet PharmaTrace program)',
};

function loadEnvFile(filename) {
  const filePath = path.join(process.cwd(), filename);
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const vars = {};
  for (const line of content.split('\n')) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) vars[match[1]] = match[2];
  }
  return vars;
}

function main() {
  console.log('🔍 Checking PharmaTrace environment configuration...\n');

  // Next.js itself loads .env.local / .env automatically; this script only
  // reads them to report what's configured, it never writes to either file.
  const env = { ...loadEnvFile('.env'), ...loadEnvFile('.env.local'), ...process.env };

  const missing = REQUIRED_VARS.filter((name) => !env[name]);
  if (missing.length > 0) {
    console.log('⚠️  Missing required environment variables:');
    missing.forEach((name) => console.log(`   - ${name}`));
    console.log('\n   Copy .env.example to .env.local and fill these in.');
  } else {
    console.log('✅ Required Supabase variables are set.');
  }

  console.log('\n📋 Solana configuration:');
  for (const [name, fallback] of Object.entries(OPTIONAL_VARS_WITH_DEFAULTS)) {
    console.log(`   ${name}: ${env[name] || `(using default: ${fallback})`}`);
  }

  console.log('');
}

main();

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Setup script to automatically configure environment variables
 * Updates the private key and preserves all other credentials
 */

const CONFIG = {
  NETWORK: 'devnet',
  RPC_ENDPOINT: 'https://api.devnet.solana.com',
  WS_ENDPOINT: 'wss://api.devnet.solana.com',
  PHARMATRACE_PRIVATE_KEY: '2yHua5b6BtA8GurscVZYvbNrfWCdTE9Mpd1TvquABu3rQKGufbeUCG747QRivuGhz5qyttzkaQoZbJGMoJv3Jtwi',
};

function updateEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update Solana-related variables, preserve Supabase credentials
    envContent = envContent.replace(
      /NEXT_PUBLIC_SOLANA_NETWORK=.*/,
      `NEXT_PUBLIC_SOLANA_NETWORK=${CONFIG.NETWORK}`
    );
    envContent = envContent.replace(
      /NEXT_PUBLIC_SOLANA_RPC=.*/,
      `NEXT_PUBLIC_SOLANA_RPC=${CONFIG.RPC_ENDPOINT}`
    );
    envContent = envContent.replace(
      /NEXT_PUBLIC_SOLANA_WS_ENDPOINT=.*/,
      `NEXT_PUBLIC_SOLANA_WS_ENDPOINT=${CONFIG.WS_ENDPOINT}`
    );
    
    // Add or update the private key with NEXT_PUBLIC_ prefix
    if (envContent.includes('NEXT_PUBLIC_PHARMATRACE_PRIVATE_KEY=')) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_PHARMATRACE_PRIVATE_KEY=.*/,
        `NEXT_PUBLIC_PHARMATRACE_PRIVATE_KEY=${CONFIG.PHARMATRACE_PRIVATE_KEY}`
      );
    } else if (envContent.includes('PHARMATRACE_PRIVATE_KEY=')) {
      // Replace old variable name with new one
      envContent = envContent.replace(
        /PHARMATRACE_PRIVATE_KEY=.*/,
        `NEXT_PUBLIC_PHARMATRACE_PRIVATE_KEY=${CONFIG.PHARMATRACE_PRIVATE_KEY}`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_PHARMATRACE_PRIVATE_KEY=${CONFIG.PHARMATRACE_PRIVATE_KEY}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Updated .env file with PharmaTrace private key (Supabase credentials preserved)');
  } else {
    console.log('⚠️  .env file not found. Please create it manually with your Supabase credentials.');
  }
}

function validateConfiguration() {
  console.log('\n🔍 Validating configuration...');
  
  // Check if private key is valid format (base58)
  try {
    const bs58 = require('bs58');
    const decoded = bs58.decode(CONFIG.PHARMATRACE_PRIVATE_KEY);
    if (decoded.length === 64) {
      console.log('✅ Private key format is valid');
    } else {
      console.error('❌ Invalid private key length');
    }
  } catch (error) {
    console.error('❌ Invalid private key format:', error.message);
  }
  
  // Check if .env file exists and has correct values
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes(CONFIG.PHARMATRACE_PRIVATE_KEY)) {
      console.log('✅ .env file contains correct private key');
    }
    if (envContent.includes('tbplqnkbrntjonwsayur.supabase.co')) {
      console.log('✅ Supabase credentials are preserved');
    }
  }
  
  console.log('\n📋 Current Configuration:');
  console.log('  Network:', CONFIG.NETWORK);
  console.log('  Private Key: [HIDDEN]');
  console.log('  Supabase URL: Preserved from existing .env');
}

function main() {
  console.log('🚀 Updating PharmaTrace configuration...\n');
  
  try {
    updateEnvFile();
    validateConfiguration();
    
    console.log('\n🎉 Configuration update complete!');
    console.log('\nYour Supabase credentials have been preserved.');
    console.log('The PharmaTrace private key has been updated for transaction verification.');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
main();
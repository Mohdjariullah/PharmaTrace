#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Setup script to automatically configure environment variables
 * ONLY updates the program ID, preserves all other credentials
 */

const CONFIG = {
  PROGRAM_ID: '7QUnqWD9rAAy5PNCpvXqZxYXfPW7G9SrWKJ3osTWy2EL',
  NETWORK: 'devnet',
  RPC_ENDPOINT: 'https://api.devnet.solana.com',
  WS_ENDPOINT: 'wss://api.devnet.solana.com',
};

function updateEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // ONLY update Solana-related variables, preserve Supabase credentials
    envContent = envContent.replace(
      /NEXT_PUBLIC_PROGRAM_ID=.*/,
      `NEXT_PUBLIC_PROGRAM_ID=${CONFIG.PROGRAM_ID}`
    );
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
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Updated .env file with program ID (Supabase credentials preserved)');
  } else {
    console.log('⚠️  .env file not found. Please create it manually with your Supabase credentials.');
  }
}

function updateAnchorConfig() {
  const anchorConfigPath = path.join(process.cwd(), 'pharmatrace-program', 'Anchor.toml');
  
  if (fs.existsSync(anchorConfigPath)) {
    let content = fs.readFileSync(anchorConfigPath, 'utf8');
    
    // Update program ID in Anchor.toml
    content = content.replace(
      /pharmatrace = ".*"/g,
      `pharmatrace = "${CONFIG.PROGRAM_ID}"`
    );
    
    fs.writeFileSync(anchorConfigPath, content);
    console.log('✅ Updated Anchor.toml with program ID:', CONFIG.PROGRAM_ID);
  }
}

function updateRustLib() {
  const rustLibPath = path.join(process.cwd(), 'pharmatrace-program', 'src', 'lib.rs');
  
  if (fs.existsSync(rustLibPath)) {
    let content = fs.readFileSync(rustLibPath, 'utf8');
    
    // Update declare_id! in Rust code
    content = content.replace(
      /declare_id!\(".*"\);/,
      `declare_id!("${CONFIG.PROGRAM_ID}");`
    );
    
    fs.writeFileSync(rustLibPath, content);
    console.log('✅ Updated Rust lib.rs with program ID:', CONFIG.PROGRAM_ID);
  }
}

function validateConfiguration() {
  console.log('\n🔍 Validating configuration...');
  
  // Check if program ID is valid format
  try {
    const { PublicKey } = require('@solana/web3.js');
    new PublicKey(CONFIG.PROGRAM_ID);
    console.log('✅ Program ID format is valid');
  } catch (error) {
    console.error('❌ Invalid program ID format:', CONFIG.PROGRAM_ID);
    process.exit(1);
  }
  
  // Check if .env file exists and has correct values
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes(CONFIG.PROGRAM_ID)) {
      console.log('✅ .env file contains correct program ID');
    }
    if (envContent.includes('tbplqnkbrntjonwsayur.supabase.co')) {
      console.log('✅ Supabase credentials are preserved');
    }
  }
  
  console.log('\n📋 Current Configuration:');
  console.log('  Program ID:', CONFIG.PROGRAM_ID);
  console.log('  Network:', CONFIG.NETWORK);
  console.log('  Supabase URL: Preserved from existing .env');
}

function main() {
  console.log('🚀 Updating PharmaTrace program ID only...\n');
  
  try {
    updateEnvFile();
    updateAnchorConfig();
    updateRustLib();
    validateConfiguration();
    
    console.log('\n🎉 Program ID update complete!');
    console.log('\nYour Supabase credentials have been preserved.');
    console.log('Only the Solana program ID has been updated.');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
main();